import fastapi_app.django_setup
import os
import shutil  # Used to save files manually
import zipfile
import io
 
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse  # ✅ Required for downloading files
from typing import Optional
from django.conf import settings  # To get the absolute path to MEDIA_ROOT
from django.db.models import Q
from datetime import date
from creator_app.models import Contract, UserData, timezone

# 🔥 ADD THIS IMPORT (ONLY NEW LINE)
from fastapi_app.routes.plan_guard import check_contract_limit
 
router = APIRouter(prefix="/contracts", tags=["My Project"])
 
 
# ==========================================================
# 1. GET MY CONTRACTS (With Filters)
# ==========================================================
@router.get("")
def get_my_contracts(
    status: str,
    user_id: int,
    # ✅ NEW FILTERS (Matching Figma "Advanced Search")
    project_type: str | None = None,
    min_budget: float | None = None,
    max_budget: float | None = None,
    skills: str | None = None,      
    location: str | None = None
):
    """
    Fetch contracts for a specific user (Creator or Collaborator)
    filtered by status and advanced search filters.
    """
    try:
        current_user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
 
    # Fix: Map 'accepted' to database status 'in_progress'
    target_status = status.lower()
    if target_status == "accepted":
        target_status = "in_progress"
 
    # Base Query
    contracts = Contract.objects.filter(
        Q(creator=current_user) | Q(collaborator=current_user),
        status__iexact=target_status
    ).select_related("job", "creator", "collaborator")
 
    # --- FILTERS ---
    if project_type:
        types = [t.strip().lower() for t in project_type.split(',')]
        q_type = Q()
        if any(x in types for x in ["fixed", "fixed price"]):
            q_type |= Q(job__budget_type__iexact="fixed")
        if any(x in types for x in ["hourly", "hourly rate"]):
            q_type |= Q(job__budget_type__iexact="hourly")
        if q_type:
            contracts = contracts.filter(q_type)
 
    if min_budget is not None:
        contracts = contracts.filter(budget__gte=min_budget)
    if max_budget is not None:
        contracts = contracts.filter(budget__lte=max_budget)
 
    if skills:
        skill_list = [s.strip() for s in skills.split(',')]
        q_skills = Q()
        for skill in skill_list:
            q_skills |= Q(job__skills__icontains=skill)
        contracts = contracts.filter(q_skills)
 
    if location:
        contracts = contracts.filter(job__employer__location__icontains=location)
 
    return [
        {
            "id": c.id,
            "job_title": c.job.title,
            "description": c.description,
            "budget": float(c.budget),
            "status": c.status,
            "viewer_role": "creator" if c.creator_id == current_user.id else "collaborator",
            "creator": {"id": c.creator.id, "email": c.creator.email},
            "collaborator": {"id": c.collaborator.id, "email": c.collaborator.email},
            "start_date": c.start_date,
            "end_date": c.end_date,
            "work_submitted_at": c.work_submitted_at,
            # ✅ Helper to check if file exists for frontend download button
            "has_attachment": bool(c.work_attachment)
        }
        for c in contracts
    ]
 
 
# ==========================================================
# 2. ACCEPT CONTRACT
# ==========================================================
@router.post("/{job_id}/accept")
def accept_contract(job_id: int, user_id: int):
    try:
        current_user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    contract = Contract.objects.filter(
        job_id=job_id,
        collaborator=current_user
    ).order_by("-id").first()

    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found for this job")

    # 🔒 PLAN LIMIT CHECK – CREATOR SIDE
    check_contract_limit(contract.creator)

    if contract.status == "in_progress":
        return {
            "message": "Contract already in progress",
            "contract_id": contract.id,
            "job_id": job_id,
            "status": contract.status
        }

    contract.status = "in_progress"
    contract.start_date = date.today()
    contract.save()

    return {
        "message": "Contract accepted and started",
        "contract_id": contract.id,
        "job_id": job_id,
        "status": contract.status
    }

 
 
# ==========================================================
# 3. REJECT CONTRACT
# ==========================================================
@router.post("/{id}/reject")
def reject_contract(id: int, user_id: int):
    try:
        current_user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
 
    try:
        contract = Contract.objects.get(id=id)
    except Contract.DoesNotExist:
        raise HTTPException(status_code=404, detail="Contract not found")
 
    if contract.collaborator != current_user:
        raise HTTPException(status_code=403, detail="Not allowed to reject this contract")
 
    contract.status = "cancelled"
    contract.save()
 
    return {"message": "Contract rejected"}
 
 
# ==========================================================
# 4. SUBMIT WORK (Freelancer)
# ==========================================================
@router.post("/{id}/submit-work")
def submit_work(
    id: int,
    user_id: int,
    description: str = Form(""),
    attachment: UploadFile | None = File(None)
):
    try:
        contract = Contract.objects.get(id=id)
        user = UserData.objects.get(id=user_id)
    except (Contract.DoesNotExist, UserData.DoesNotExist):
        raise HTTPException(status_code=404, detail="Contract or User not found")

    if contract.collaborator != user:
        raise HTTPException(status_code=403, detail="Only the collaborator can submit work")

    # ✅ Allow re-submission if it's already in review (in case they made a mistake)
    if contract.status not in ["in_progress", "in_review"]:
        raise HTTPException(status_code=400, detail="Contract must be in progress to submit work")

    contract.work_description = description
    contract.work_submitted_at = timezone.now()

    full_disk_path = "No file uploaded"

    if attachment:
        upload_folder = os.path.join(settings.MEDIA_ROOT, "work_submissions")
        os.makedirs(upload_folder, exist_ok=True)
        filename = os.path.basename(attachment.filename)
        full_disk_path = os.path.join(upload_folder, filename)

        try:
            with open(full_disk_path, "wb") as buffer:
                shutil.copyfileobj(attachment.file, buffer)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

        contract.work_attachment.name = f"work_submissions/{filename}"

    # ✅ CHANGE: Set to 'in_review' instead of 'completed'
    contract.status = "in_review"
    contract.save()

    return {
        "message": "Work submitted for review",
        "contract_id": contract.id,
        "status": contract.status
    }


# ==========================================================
# 6. APPROVE WORK (Creator) - NEW ENDPOINT
# ==========================================================
@router.post("/{id}/approve-work")
def approve_work(id: int, user_id: int):
    try:
        current_user = UserData.objects.get(id=user_id)
        contract = Contract.objects.get(id=id)
    except (UserData.DoesNotExist, Contract.DoesNotExist):
        raise HTTPException(status_code=404, detail="User or Contract not found")

    # 1. Permission Check: Only the Creator can approve
    if contract.creator != current_user:
        raise HTTPException(status_code=403, detail="Only the creator can approve this work")

    # 2. Status Check: Must be in review
    if contract.status != "in_review":
        raise HTTPException(status_code=400, detail="Work must be submitted before it can be approved")

    # 3. Finalize Contract
    contract.status = "completed"
    contract.end_date = timezone.now()
    contract.save()

    return {
        "message": "Work approved and contract completed",
        "contract_id": contract.id,
        "status": "completed",
        "end_date": contract.end_date
    }
    
 
 
# ==========================================================
# 5. ✅ NEW: DOWNLOAD WORK (ZIP Format)
# ==========================================================
@router.get("/{contract_id}/download-work")
def download_work_zip(contract_id: int, user_id: int):
    """
    Downloads the submitted work attachment as a ZIP file.
    Allowed for: The Creator (Employer) OR The Collaborator (Freelancer).
    """
    try:
        # 1. Fetch contract
        contract = Contract.objects.get(id=contract_id)
        current_user = UserData.objects.get(id=user_id)
 
        # 2. Permission Check: Must be the Creator or Collaborator
        if contract.creator != current_user and contract.collaborator != current_user:
            raise HTTPException(status_code=403, detail="You do not have permission to download this file.")
 
        # 3. Check if file exists in DB
        if not contract.work_attachment:
            raise HTTPException(status_code=404, detail="No work has been submitted for this contract.")
 
        # 4. Get File Path on Disk
        file_path = contract.work_attachment.path
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on server.")
 
        # 5. Create ZIP in Memory
        file_name = os.path.basename(file_path)
        zip_buffer = io.BytesIO()
 
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            # Add the file to the zip archive
            zip_file.write(file_path, arcname=file_name)
 
        # Reset buffer position to beginning
        zip_buffer.seek(0)
 
        # 6. Return Streaming Response (Triggers Browser Download)
        return StreamingResponse(
            zip_buffer,
            media_type="application/x-zip-compressed",
            headers={
                "Content-Disposition": f"attachment; filename=work_submission_{contract_id}.zip"
            }
        )
 
    except Contract.DoesNotExist:
        raise HTTPException(status_code=404, detail="Contract not found")
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






# # ==========================================================
# # CREATOR → COMPLETE CONTRACT
# # ==========================================================
# @router.post("/{id}/complete")
# def complete_contract(
#     id: int,
#     user_id: int
# ):
#     try:
#         current_user = UserData.objects.get(id=user_id)
#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="User not found")

#     contract = Contract.objects.get(id=id)

#     if contract.creator != current_user:
#         raise HTTPException(status_code=403, detail="Not allowed")

#     contract.status = "completed"
#     contract.end_date = date.today()
#     contract.save()

#     return {"message": "Contract completed"}
# # ==========================================================
# # CREATOR → MARK IN PROGRESS (awaiting → in_progress)
# # ==========================================================
# @router.post("/{id}/in-progress")
# def mark_in_progress(
#     id: int,
#     user_id: int
# ):
#     try:
#         current_user = UserData.objects.get(id=user_id)
#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="User not found")

#     contract = Contract.objects.get(id=id)

#     if contract.creator != current_user:
#         raise HTTPException(status_code=403, detail="Not allowed")

#     contract.status = "in_progress"
#     contract.start_date = date.today()
#     contract.save()

#     return {"message": "Contract is now in progress"}


