import fastapi_app.django_setup
import os
import shutil  # Used to save files manually
import zipfile
import io
 
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form, Query
from fastapi.responses import FileResponse, StreamingResponse  # ✅ Required for downloading files
from typing import Optional
from django.conf import settings  # To get the absolute path to MEDIA_ROOT
from django.db.models import Q
from datetime import date
from creator_app.models import Contract, Invitation, JobPost, UserData, timezone, CollaboratorProfile

# 🔥 ADD THIS IMPORT (ONLY NEW LINE)
from fastapi_app.routes.auth import get_current_user
from fastapi_app.routes.plan_guard import check_contract_limit
 
router = APIRouter(prefix="/contracts", tags=["My Project"])
 
 
# ==========================================================
# 1. GET MY CONTRACTS (With Filters)
# ==========================================================
# @router.get("")
# def get_my_contracts(
#     status: str,
#     user_id: int,
#     # ✅ NEW FILTERS (Matching Figma "Advanced Search")
#     project_type: str | None = None,
#     min_budget: float | None = None,
#     max_budget: float | None = None,
#     skills: str | None = None,      
#     location: str | None = None
# ):
#     """
#     Fetch contracts for a specific user (Creator or Collaborator)
#     filtered by status and advanced search filters.
#     """
#     try:
#         current_user = UserData.objects.get(id=user_id)
#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="User not found")
 
#     # Fix: Map 'accepted' to database status 'in_progress'
#     target_status = status.lower()
#     if target_status == "accepted":
#         target_status = "in_progress"
 
#     # Base Query
#     contracts = Contract.objects.filter(
#         Q(creator=current_user) | Q(collaborator=current_user),
#         status__iexact=target_status
#     ).select_related("job", "creator", "collaborator")
 
#     # --- FILTERS ---
#     if project_type:
#         types = [t.strip().lower() for t in project_type.split(',')]
#         q_type = Q()
#         if any(x in types for x in ["fixed", "fixed price"]):
#             q_type |= Q(job__budget_type__iexact="fixed")
#         if any(x in types for x in ["hourly", "hourly rate"]):
#             q_type |= Q(job__budget_type__iexact="hourly")
#         if q_type:
#             contracts = contracts.filter(q_type)
 
#     if min_budget is not None:
#         contracts = contracts.filter(budget__gte=min_budget)
#     if max_budget is not None:
#         contracts = contracts.filter(budget__lte=max_budget)
 
#     if skills:
#         skill_list = [s.strip() for s in skills.split(',')]
#         q_skills = Q()
#         for skill in skill_list:
#             q_skills |= Q(job__skills__icontains=skill)
#         contracts = contracts.filter(q_skills)
 
#     if location:
#         contracts = contracts.filter(job__employer__location__icontains=location)
 
#     return [
#         {
#             "id": c.id,
#             "job_title": c.job.title,
#             "description": c.description,
#             "budget": float(c.budget),
#             "status": c.status,
#             "viewer_role": "creator" if c.creator_id == current_user.id else "collaborator",
#             "creator": {"id": c.creator.id, "email": c.creator.email},
#             "collaborator": {"id": c.collaborator.id, "email": c.collaborator.email},
#             "start_date": c.start_date,
#             "end_date": c.end_date,
#             "work_submitted_at": c.work_submitted_at,
#             # ✅ Helper to check if file exists for frontend download button
#             "has_attachment": bool(c.work_attachment)
#         }
#         for c in contracts
#     ]

@router.get("/by-status")
def get_contracts_by_status(
    status: str,
    user_id: int
):
    """
    Fetch all contracts for a specific user filtered by status only.
    Returns contracts with 'active' and 'in_progress' status when 'accepted' is requested.
    """
    try:
        current_user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    # Base Query - include job details
    contracts = Contract.objects.filter(
        Q(creator=current_user) | Q(collaborator=current_user)
    ).select_related("job", "creator", "collaborator")

    # Filter by status
    if status.lower() == "accepted":
        # For 'accepted', return both active and in_progress contracts
        contracts = contracts.filter(Q(status="active") | Q(status="in_progress"))
    else:
        contracts = contracts.filter(status__iexact=status.lower())

    # Order by ID descending
    contracts = contracts.order_by('-id')

    result = []
    for c in contracts:
        job = c.job
    
        # ⭐ Rating + Reviews (job poster = creator)
        review_stats = Review.objects.filter(
            recipient=c.creator
        ).aggregate(
            avg_rating=Avg("rating"),
            total_reviews=Count("id")
        )
    
        rating = round(review_stats["avg_rating"] or 0, 1)
        reviews = review_stats["total_reviews"]
    
        # 📍 Location (FROM UserData)
        country = c.creator.location or "USA"
        state = c.creator.state or None
        country_code = get_country_code(country)
    
        contract_data = {
            "id": c.id,
            "job_title": job.title if job else "No Job Title",
            "description": c.description,
            "budget": float(c.budget),
            "status": c.status,
    
            # ✅ CREATOR (job poster)
            "creator": {
                "id": c.creator.id,
                "name": f"{c.creator.first_name or ''} {c.creator.last_name or ''}".strip(),
                "state": state,
                "country": country,
                "country_code": country_code,
                "rating": rating,
                "reviews": reviews,
            },
    
            # ✅ WORK ATTACHMENT (RESTORED)
            "has_attachment": bool(c.work_attachment),
            "work_submitted_at": c.work_submitted_at,
    
            # ✅ JOB DETAILS
            "job_budget_type": job.budget_type if job else "fixed",
            "job_description": job.description if job else "",
            "job_created_at": job.created_at if job else None,
            "job_budget_from": float(job.budget_from) if job and job.budget_from else None,
            "job_budget_to": float(job.budget_to) if job and job.budget_to else None,
            "job_expertise_level": job.expertise_level if job else "Intermediate",
        }
    
        result.append(contract_data)



    return result
 
@router.get("/status-counts")
def get_contract_status_counts(
    user_id: int
):
    """
    Get counts of contracts by status for a specific user.
    """
    try:
        current_user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all contracts where user is either creator or collaborator
    user_contracts = Contract.objects.filter(
        Q(creator=current_user) | Q(collaborator=current_user)
    )

    # Get counts for each status from Contract model
    active_count = user_contracts.filter(status="active").count()

    in_progress_count = user_contracts.filter(status="in_progress").count()

    # Get pending count from Contract model
    pending_count = user_contracts.filter(status="pending").count()

    completed_count = user_contracts.filter(status="completed").count()

    accepted_count = active_count + in_progress_count  # Total for accepted tab

    return {
        "accepted": accepted_count,  # Sum of active + in_progress
        "active": active_count,
        "in_progress": in_progress_count,
        "pending": pending_count,
        "completed": completed_count
    }

@router.get("/latest-job")
def get_latest_job_for_user(
    user_id: int
):
    """
    Get the latest job posted by a user.
    """
    try:
        current_user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    # Get the latest job created by this user
    latest_job = JobPost.objects.filter(
        employer=current_user
    ).order_by('-created_at').first()

    if not latest_job:
        raise HTTPException(status_code=404, detail="No jobs found for this user")

    # Get count of contracts for this job
    contracts_count = Contract.objects.filter(job=latest_job).count()

    # Find if there's a contract associated with this job
    contract = Contract.objects.filter(
        job=latest_job
    ).select_related("creator", "collaborator").first()

    response_data = {
        "job": {
            "id": latest_job.id,
            "title": latest_job.title,
            "description": latest_job.description,
            "budget_type": latest_job.budget_type,
            "created_at": latest_job.created_at,
            "contracts_count": contracts_count,
        }
    }

    # If there's a contract for this job, add contract details
    if contract:
        response_data["contract"] = {
            "id": contract.id,
            "budget": float(contract.budget),
            "status": contract.status,
            "viewer_role": "creator" if contract.creator_id == current_user.id else "collaborator",
            "description": contract.description,
            "has_attachment": bool(contract.work_attachment),
            "job_budget_type": latest_job.budget_type,
        }
    # Add job budget fields to response even if no contract
    response_data["job"]["budget_from"] = float(latest_job.budget_from) if latest_job.budget_from else None
    response_data["job"]["budget_to"] = float(latest_job.budget_to) if latest_job.budget_to else None

    return response_data

import mimetypes

@router.get("/{id}/work-attachment")
def download_work_attachment(
    id: int,
    user_id: int
):
    try:
        contract = Contract.objects.get(id=id)
        user = UserData.objects.get(id=user_id)
    except (Contract.DoesNotExist, UserData.DoesNotExist):
        raise HTTPException(status_code=404, detail="Contract or User not found")

    # Authorization
    if user not in [contract.creator, contract.collaborator]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if contract.status != "completed":
        raise HTTPException(status_code=400, detail="Contract not completed")

    if not contract.work_attachment:
        raise HTTPException(status_code=404, detail="No attachment found")

    file_path = contract.work_attachment.path

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    filename = os.path.basename(file_path)

    # 👇 IMPORTANT: detect real content type
    content_type, _ = mimetypes.guess_type(file_path)
    content_type = content_type or "application/octet-stream"

    return FileResponse(
        path=file_path,
        media_type=content_type,
        filename=filename,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
# ==========================================================
# 2. ACCEPT CONTRACT
# ==========================================================
# @router.post("/{job_id}/accept")
# def accept_contract(job_id: int, user_id: int):
#     try:
#         current_user = UserData.objects.get(id=user_id)
#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="User not found")

#     contract = Contract.objects.filter(
#         job_id=job_id,
#         collaborator=current_user
#     ).order_by("-id").first()

#     if not contract:
#         raise HTTPException(status_code=404, detail="Contract not found for this job")

#     # 🔒 PLAN LIMIT CHECK – CREATOR SIDE
#     check_contract_limit(contract.creator)

#     if contract.status == "in_progress":
#         return {
#             "message": "Contract already in progress",
#             "contract_id": contract.id,
#             "job_id": job_id,
#             "status": contract.status
#         }

#     contract.status = "in_progress"
#     contract.start_date = date.today()
#     contract.save()

#     return {
#         "message": "Contract accepted and started",
#         "contract_id": contract.id,
#         "job_id": job_id,
#         "status": contract.status
#     }

 
 
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


from django.db.models import Avg, Count
from creator_app.models import Review
from django.db.models import Sum
import pycountry



def get_country_code(country_name: str | None):
    if not country_name:
        return None
    try:
        country = pycountry.countries.search_fuzzy(country_name)[0]
        return country.alpha_2
    except Exception:
        return None


def get_total_earnings(user):
    return (
        Contract.objects
        .filter(collaborator=user, status="completed")
        .aggregate(total=Sum("budget"))["total"]
        or 0
    )

def get_rate_display(profile):
    if not profile or not profile.pricing_amount:
        return None

    unit_map = {
        "hr": "/hr",
        "hour": "/hr",
        "weekly": "/week",
        "month": "/month",
    }

    unit = unit_map.get(profile.pricing_unit, f"/{profile.pricing_unit}")

    return f"${float(profile.pricing_amount)} {unit}"


# ==========================================================
# 1. GET MY CONTRACTS (With Filters)
# ==========================================================
@router.get("")
def get_my_contracts(
    request: Request,
    status: str,
    user_id: int
):
    try:
        current_user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    target_status = status.lower()

    if target_status == "accepted":
        statuses = ["in_progress"]
    elif target_status == "active":
        statuses = ["awaiting", "in_progress"]
    else:
        statuses = [target_status]

    contracts = (
        Contract.objects
        .filter(
            Q(creator=current_user) | Q(collaborator=current_user),
            status__in=statuses
        )
        .select_related(
            "collaborator",
            "collaborator__collaboratorprofile"
        )
    )

    result = []

    for c in contracts:
        collaborator = c.collaborator
        profile = getattr(collaborator, "collaboratorprofile", None)

        review_stats = Review.objects.filter(
            recipient=collaborator
        ).aggregate(
            avg_rating=Avg("rating"),
            total_reviews=Count("id")
        )

        rating = round(review_stats["avg_rating"] or 0, 1)
        reviews = review_stats["total_reviews"]

        country = collaborator.location or "Unknown"
        country_code = get_country_code(country)

        total_earnings = get_total_earnings(collaborator)

        result.append({
            "id": c.id,
            "status": c.status,  # 👈 frontend can show badge
            "collaborator": {
                "name": profile.name if profile else "",
                "skill_category": profile.skill_category if profile else "",
                "skills": profile.skills if profile else [],

                "state": collaborator.state,
                "country": country,
                "country_code": country_code,

                "rate_display": get_rate_display(profile),

                "profile_picture": (
                    request.base_url._url.rstrip("/") + collaborator.profile_picture.url
                    if collaborator.profile_picture else None
                ),

                "rating": rating,
                "reviews": reviews,
                "total_earnings": float(total_earnings),
            }
        })
    return result

# Add this endpoint to your FastAPI router
@router.get("/collaborator-contracts")
def get_collaborator_contracts(
    current_user: UserData = Depends(get_current_user)
):
    """
    Fetch all contracts where the CURRENT USER is the collaborator.
    """
    try:
        # current_user is the collaborator
        contracts = (
            Contract.objects
            .filter(collaborator=current_user)
            .select_related("job", "creator", "collaborator")
            .order_by("-id")
        )

        result = []

        for c in contracts:
            job = c.job

            result.append({
                "id": c.id,
                "job_title": job.title if job else "No Job Title",
                "description": c.description,
                "budget": float(c.budget),
                "status": c.status,
                "viewer_role": "collaborator",

                # 👈 creator = client
                "creator": {
                    "id": c.creator.id,
                    "email": c.creator.email,
                    "name": (
                        f"{c.creator.first_name or ''} {c.creator.last_name or ''}".strip()
                        or c.creator.email.split("@")[0]
                    ),
                    "state": c.creator.state,
                    "location": c.creator.location,
                    "address": c.creator.address,
                },

                # 👈 collaborator = current user
                "collaborator": {
                    "id": current_user.id,
                    "email": current_user.email,
                    "name": (
                        f"{current_user.first_name or ''} {current_user.last_name or ''}".strip()
                        or current_user.email.split("@")[0]
                    ),
                    "state": current_user.state,
                    "location": current_user.location,
                    "address": current_user.address,
                },

                "start_date": c.start_date,
                "end_date": c.end_date,
                "work_submitted_at": c.work_submitted_at,
                "has_attachment": bool(c.work_attachment),

                "job_budget_type": job.budget_type if job else "fixed",
                "job_description": job.description if job else "",
                "job_created_at": job.created_at if job else None,
                "job_budget_from": float(job.budget_from) if job and job.budget_from else None,
                "job_budget_to": float(job.budget_to) if job and job.budget_to else None,
                "job_expertise_level": job.expertise_level if job else "Intermediate",
            })

        # ✅ ALWAYS return array
        return result or []

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))