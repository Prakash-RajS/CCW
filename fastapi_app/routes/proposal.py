# fastapi_app/routes/proposal.py
import json
from enum import Enum
from fastapi import APIRouter, Form, Request, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import mimetypes
import os
from django.conf import settings
from creator_app.models import Invitation, JobPost, UserData, Proposal, CreatorProfile, CollaboratorProfile
from django.db.models import Sum
from creator_app.models import WalletTransaction
from django.db.models import Avg, Count
from creator_app.models import Review
import pycountry
from creator_app.models import Contract
from datetime import date
from fastapi_app.routes.plan_guard import check_contract_limit, check_proposal_limit, check_storage_limit
from creator_app.models import track_file_upload, track_file_deletion
from django.db import transaction
from fastapi_app.routes.dbconnection import ensure_db_connection
import time
from datetime import datetime, date
from asgiref.sync import sync_to_async
import asyncio

# ============================================================
# S3 STORAGE IMPORTS
# ============================================================
from fastapi_app.routes.storage import (
    USE_S3,
    save_upload_file,
    build_full_url,
    delete_file,
    generate_presigned_url,
    ExpiryPreset,
    StoragePath,
    get_storage_path,
    get_s3_key_from_path,
)

# ============================================================
# S3 HELPER FUNCTIONS FOR PROPOSAL ATTACHMENTS
# ============================================================
async def save_proposal_attachment_s3(file: UploadFile, proposal_id: int, filename: str) -> str:
    """
    Save proposal attachment to S3 or local storage
    S3 Folder Used: proposal_attachments/
    """
    safe_filename = filename.replace("..", "").replace("/", "").replace("\\", "")
    name, ext = os.path.splitext(safe_filename)
    unique_filename = f"{proposal_id}_{int(time.time())}_{name}{ext}"
    
    if USE_S3:
        s3_key = f"proposal_attachments/{unique_filename}"
        await save_upload_file(file, s3_key)
        return s3_key
    else:
        upload_dir = os.path.join(BASE_DIR, "fastapi_app", "proposal_attachments")
        os.makedirs(upload_dir, exist_ok=True)
        save_path = os.path.join(upload_dir, unique_filename)
        
        await file.seek(0)
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)
        
        return f"proposal_attachments/{unique_filename}"


async def delete_proposal_attachment_s3(file_path: str, user: UserData = None) -> bool:
    """
    Delete proposal attachment from S3 or local storage
    """
    if not file_path:
        return False
    
    if USE_S3:
        s3_key = get_s3_key_from_path(file_path)
        return delete_file(s3_key)
    else:
        full_path = os.path.join(BASE_DIR, "fastapi_app", file_path)
        if os.path.exists(full_path):
            if user:
                file_size = os.path.getsize(full_path)
                await sync_to_async(track_file_deletion)(user, file_size)
            os.remove(full_path)
            return True
        return False


def get_proposal_attachment_url(request: Request, file_path: str) -> str:
    """
    Get URL for proposal attachment with S3 support
    """
    if not file_path:
        return None
    
    return build_full_url(
        request=request,
        path=file_path,
        file_type="proposal"
    )


def get_country_code(country_name: str | None):
    if not country_name:
        return ""

    try:
        country = pycountry.countries.search_fuzzy(country_name)[0]
        return country.alpha_2.lower()
    except LookupError:
        return ""


# ============================================================
# HELPER - GET USER LOCATION FROM PROFILE
# ============================================================
def get_user_location(user: UserData):
    """Get location from user's profile based on role"""
    try:
        profile = None

        if user.role == "creator":
            profile = CreatorProfile.objects.filter(user=user).first()
        elif user.role == "collaborator":
            profile = CollaboratorProfile.objects.filter(user=user).first()

        if profile:
            location = profile.location or ""
            state = profile.state or ""

            return {
                "location": location,
                "country": location,
                "state": state,
                "city": state,
                "address": ""
            }

    except Exception as e:
        print(f"Error getting user location: {e}")

    return {
        "location": "",
        "country": "",
        "state": "",
        "city": "",
        "address": ""
    }


def get_user_skills(user: UserData):
    """Get skills from user's profile based on role"""
    try:
        if user.role == "creator":
            profile = CreatorProfile.objects.filter(user=user).first()
            if profile and profile.skills_required:
                return profile.skills_required
        elif user.role == "collaborator":
            profile = CollaboratorProfile.objects.filter(user=user).first()
            if profile:
                if profile.skills:
                    return profile.skills
                elif profile.skill_category:
                    return [profile.skill_category]
    except Exception as e:
        print(f"Error getting user skills: {e}")
    
    return []


router = APIRouter(prefix="/proposals", tags=["Proposals"])
BASE_DIR = settings.BASE_DIR


# --- Dropdown Choice ---
class PaymentTypeEnum(str, Enum):
    project = "project"
    milestone = "milestone"


# ============================================================
# HELPER - UPDATE JOB CONTRACT STATUS
# ============================================================
def update_job_contract_status(job_id: int, has_contract: bool):
    """Update the has_contract field on a job"""
    ensure_db_connection()
    try:
        job = JobPost.objects.get(id=job_id)
        job.has_contract = has_contract
        job.save()
        ##print(f"✅ Job {job_id} has_contract updated to {has_contract}")
        return True
    except JobPost.DoesNotExist:
        ##print(f"❌ Job {job_id} not found")
        return False
    except Exception as e:
        ##print(f"❌ Error updating job contract status: {str(e)}")
        return False
    

def validate_milestone_amounts(bid_amount, milestone_amount, job_budget_from, job_budget_to):
    """Validate milestone amounts against job budget"""
    errors = []
    
    if milestone_amount <= 0:
        errors.append("Milestone amount must be greater than 0")
    
    if job_budget_to and milestone_amount > job_budget_to:
        errors.append(f"Milestone amount (${milestone_amount}) exceeds job budget (${job_budget_to})")
    
    if job_budget_from and milestone_amount < job_budget_from:
        errors.append(f"Milestone amount (${milestone_amount}) is below minimum budget (${job_budget_from})")
    
    if bid_amount and milestone_amount != bid_amount:
        errors.append(f"Milestone amount (${milestone_amount}) must equal total bid amount (${bid_amount}) for single milestone payment")
    
    return errors


# ============================================================
# 1. CREATE PROPOSAL (UPDATED WITH S3)
# ============================================================
@router.post("/CreateProposal")
async def create_proposal(
    request: Request,
    job_id: int = Form(...),
    freelancer_id: int = Form(...),
    payment_type: PaymentTypeEnum = Form(...),
    bid_amount: float = Form(None),
    milestones_json: str = Form(None),
    duration: str = Form(None),
    cover_letter: str = Form(None),
    skills: str = Form(None),
    expertise: str = Form(None),
    attachments: list[UploadFile] = File(None),
):
    """
    Create a new proposal - Supports multiple milestones with S3 storage
    S3 Folder Used: proposal_attachments/
    """
    try:
        await sync_to_async(ensure_db_connection)()

        if not duration or not duration.strip():
            raise HTTPException(status_code=400, detail="Duration is required.")

        if not cover_letter or not cover_letter.strip():
            raise HTTPException(status_code=400, detail="Cover letter is required.")

        if bid_amount is None or bid_amount <= 0:
            raise HTTPException(status_code=400, detail="Bid amount must be greater than 0.")

        # ✅ FIX: Use sync_to_async for database operations
        freelancer = await sync_to_async(UserData.objects.get)(id=freelancer_id)
        job = await sync_to_async(JobPost.objects.get)(id=job_id)

        if job.has_contract:
            raise HTTPException(
                status_code=400, 
                detail="This job already has a contract. Cannot submit proposals."
            )
        
        proposal_exists = await sync_to_async(
            lambda: Proposal.objects.filter(job=job, freelancer=freelancer, status="submitted").exists()
        )()
        
        if proposal_exists:       
            raise HTTPException(
                status_code=400, 
                detail="You have already applied for this job."
            )

        milestones_list = []
        total_milestone_amount = 0
        
        if payment_type == PaymentTypeEnum.milestone:
            if not milestones_json:
                raise HTTPException(
                    status_code=400,
                    detail="Milestones data is required for milestone payment"
                )
            
            try:
                milestones_list = json.loads(milestones_json)
                if not isinstance(milestones_list, list) or len(milestones_list) == 0:
                    raise HTTPException(
                        status_code=400,
                        detail="Milestones must be a non-empty array"
                    )
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid milestones format"
                )
            
            for idx, milestone in enumerate(milestones_list):
                if not milestone.get('description'):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Milestone {idx + 1}: Description is required"
                    )
                if not milestone.get('due_date'):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Milestone {idx + 1}: Due date is required"
                    )
                if not milestone.get('amount') or milestone['amount'] <= 0:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Milestone {idx + 1}: Amount must be greater than 0"
                    )
                
                amount = float(milestone['amount'])
                total_milestone_amount += amount
                
                try:
                    due_date = datetime.strptime(milestone['due_date'], "%Y-%m-%d").date()
                    if due_date < date.today():
                        raise HTTPException(
                            status_code=400,
                            detail=f"Milestone {idx + 1}: Due date cannot be in the past"
                        )
                except ValueError:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Milestone {idx + 1}: Invalid date format. Use YYYY-MM-DD"
                    )
            
            if abs(total_milestone_amount - bid_amount) > 0.01:
                raise HTTPException(
                    status_code=400,
                    detail=f"Total milestone amount (${total_milestone_amount:.2f}) must equal total bid amount (${bid_amount:.2f})"
                )

        skills_list = [s.strip() for s in skills.split(',')] if skills else []

        await sync_to_async(check_proposal_limit)(freelancer)

        # Check storage limit for attachments
        if attachments:
            total_new_bytes = 0
            for file in attachments:
                if file.filename:
                    await file.seek(0)
                    content = await file.read()
                    total_new_bytes += len(content)
                    await file.seek(0)
            
            if total_new_bytes > 0:
                await sync_to_async(check_storage_limit)(freelancer, total_new_bytes)

        milestone_desc = None
        milestone_date = None
        milestone_amt = None
        
        if milestones_list and len(milestones_list) > 0:
            first_milestone = milestones_list[0]
            milestone_desc = first_milestone.get('description', '')
            milestone_date = first_milestone.get('due_date', None)
            milestone_amt = first_milestone.get('amount', 0)
        
        def create_proposal_sync():
            return Proposal.objects.create(
                job=job,
                freelancer=freelancer,
                payment_type=payment_type.value,
                bid_amount=bid_amount,
                milestone_description=milestone_desc,
                milestone_due_date=milestone_date,
                milestone_amount=milestone_amt,
                duration=duration or "",
                cover_letter=cover_letter or "",
                skills=skills_list,
                expertise=expertise or "",
                status="submitted",
                milestones_data=milestones_list if payment_type == PaymentTypeEnum.milestone else []
            )
        
        proposal = await sync_to_async(create_proposal_sync)()

        ##print(f"✅ Created proposal {proposal.id} with {len(milestones_list)} milestones")

        # Save attachments using S3
        uploaded_files = []
        if attachments:
            for file in attachments:
                if file.filename:
                    try:
                        saved_path = await save_proposal_attachment_s3(file, proposal.id, file.filename)
                        uploaded_files.append(saved_path)
                        
                        if not USE_S3:
                            full_path = os.path.join(BASE_DIR, "fastapi_app", saved_path)
                            if os.path.exists(full_path):
                                file_size = os.path.getsize(full_path)
                                await sync_to_async(track_file_upload)(freelancer, full_path, file_size)
                                
                    except Exception as e:
                        await sync_to_async(proposal.delete)()
                        raise HTTPException(
                            status_code=500, 
                            detail=f"Failed to upload attachment: {str(e)}"
                        )

            def update_proposal_attachments():
                proposal.attachments = uploaded_files
                proposal.save()
            
            await sync_to_async(update_proposal_attachments)()

        return {
            "message": "Proposal submitted successfully",
            "proposal_id": proposal.id,
            "bid_amount": bid_amount,
            "payment_type": payment_type.value,
            "milestones": milestones_list if payment_type == PaymentTypeEnum.milestone else None,
            "milestones_count": len(milestones_list) if payment_type == PaymentTypeEnum.milestone else 0,
            "attachments": uploaded_files,
            "validation_passed": True,
            "storage_mode": "s3" if USE_S3 else "local"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        ##print(f"❌ Error in create_proposal: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    

# ============================================================
# 2. LIST PROPOSALS (UPDATED WITH S3)
# ============================================================
@router.get("/GetProposalsByJob/{job_id}")
async def get_proposals_by_job(request: Request, job_id: int):
    try:
        await sync_to_async(ensure_db_connection)()
        
        job_exists = await sync_to_async(lambda: JobPost.objects.filter(id=job_id).exists())()
        if not job_exists:
            raise HTTPException(status_code=404, detail="Job not found")
       
        job = await sync_to_async(JobPost.objects.get)(id=job_id)
        client_budget_info = f"{job.budget_type} - ${job.budget_from or 0}"
 
        def get_proposals_data():
            proposals = Proposal.objects.filter(job_id=job_id).order_by("-created_at")
            data = []
            for p in proposals:
                data.append({
                    "id": p.id,
                    "freelancer_name": p.freelancer.full_name or p.freelancer.email,
                    "payment_type": p.payment_type,
                    "bid_amount": p.bid_amount,
                    "milestone_amount": p.milestone_amount,
                    "milestone_description": p.milestone_description,
                    "milestone_due_date": p.milestone_due_date,
                    "duration": p.duration,
                    "cover_letter": p.cover_letter,
                    "skills": p.skills,
                    "expertise": p.expertise,
                    "attachments": p.attachments,
                    "status": p.status,
                    "date": p.created_at.strftime("%Y-%m-%d")
                })
            return data

        proposals_data = await sync_to_async(get_proposals_data)()
        
        # Generate attachment URLs with S3 support
        for p_data in proposals_data:
            if p_data.get("attachments"):
                attachment_urls = []
                for att in p_data["attachments"]:
                    url = get_proposal_attachment_url(request, att)
                    if url:
                        attachment_urls.append(url)
                p_data["attachments"] = attachment_urls
 
        return {
            "job_id": job_id,
            "client_budget": client_budget_info,
            "has_contract": job.has_contract,
            "count": len(proposals_data),
            "proposals": proposals_data,
            "storage_mode": "s3" if USE_S3 else "local"
        }
 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 

# ============================================================
# 3. LIST MY PROPOSALS (UPDATED WITH S3)
# ============================================================
@router.get("/GetMyProposals/{freelancer_id}")
async def get_my_proposals(request: Request, freelancer_id: int):
    try:
        await sync_to_async(ensure_db_connection)()
        
        def get_proposals_data():
            proposals = Proposal.objects.filter(
                freelancer_id=freelancer_id
            ).select_related('job__employer').order_by("-created_at")
            
            data = []
            for p in proposals:
                client_name = "Client"
                if p.job and p.job.employer:
                    employer = p.job.employer
                    if employer.full_name:
                        client_name = employer.full_name
                    elif employer.email:
                        client_name = employer.email.split('@')[0]
                
                data.append({
                    "id": p.id,
                    "job_id": p.job.id,
                    "job_title": p.job.title,
                    "client_name": client_name,
                    "client_id": p.job.employer.id if p.job.employer else None,
                    "bid_amount": p.bid_amount,
                    "payment_type": p.payment_type,
                    "status": p.status,
                    "skills": p.skills,
                    "created_at": p.created_at,
                    "has_contract": p.job.has_contract if p.job else False,
                    "attachments": p.attachments,
                })
            return data

        proposals_data = await sync_to_async(get_proposals_data)()
        
        # Generate attachment URLs with S3 support
        for p_data in proposals_data:
            if p_data.get("attachments"):
                attachment_urls = []
                for att in p_data["attachments"]:
                    url = get_proposal_attachment_url(request, att)
                    if url:
                        attachment_urls.append(url)
                p_data["attachments"] = attachment_urls
                p_data["storage_mode"] = "s3" if USE_S3 else "local"
        
        return {"proposals": proposals_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
 
# ============================================================
# 4. EDIT PROPOSAL (UPDATED WITH S3 AND ASYNC FIXES)
# ============================================================
# ============================================================
# 4. EDIT PROPOSAL (UPDATED WITH S3 AND ASYNC FIXES)
# ============================================================
@router.put("/EditProposal/{proposal_id}")
async def edit_proposal(
    request: Request,
    proposal_id: int,
    bid_amount: float = Form(None),
    duration: str = Form(None),
    cover_letter: str = Form(None),
    skills: str = Form(None),
    expertise: str = Form(None),
    payment_type: PaymentTypeEnum = Form(None),
    milestones_json: str = Form(None),
    attachments: list[UploadFile] = File(None)
):
    """
    Edit an existing proposal with S3 support for attachments
    S3 Folder Used: proposal_attachments/
    File Type: proposal
    """
    try:
        await sync_to_async(ensure_db_connection)()

        # ✅ FIX: Use sync_to_async with filter().first() to avoid DoesNotExist error
        proposal = await sync_to_async(
            lambda: Proposal.objects.filter(id=proposal_id).first()
        )()
        
        if not proposal:
            raise HTTPException(status_code=404, detail="Proposal not found")

        # ✅ FIX: Get job has_contract using sync_to_async
        job_has_contract = await sync_to_async(
            lambda: proposal.job.has_contract
        )()
        
        if job_has_contract:
            raise HTTPException(
                status_code=400, 
                detail="Cannot edit proposal - job already has a contract."
            )

        if proposal.status == "withdrawn":
            raise HTTPException(
                status_code=400, 
                detail="Cannot edit withdrawn proposal."
            )

        # ✅ Update fields using sync_to_async
        def update_proposal_fields():
            if payment_type is not None:
                proposal.payment_type = payment_type.value
            if bid_amount is not None:
                proposal.bid_amount = bid_amount
            if duration is not None:
                proposal.duration = duration
            if cover_letter is not None:
                proposal.cover_letter = cover_letter
            if expertise is not None:
                proposal.expertise = expertise
            if skills is not None:
                proposal.skills = [s.strip() for s in skills.split(',')] if skills else []
            
            if payment_type == PaymentTypeEnum.milestone and milestones_json:
                try:
                    milestones_list = json.loads(milestones_json)
                    proposal.milestones_data = milestones_list
                    
                    if milestones_list and len(milestones_list) > 0:
                        first = milestones_list[0]
                        proposal.milestone_description = first.get('description', '')
                        proposal.milestone_due_date = first.get('due_date', None)
                        proposal.milestone_amount = first.get('amount', 0)
                    print(f"✅ Updated {len(milestones_list)} milestones for proposal {proposal_id}")
                except Exception as e:
                    print(f"Error parsing milestones_json: {e}")
            elif payment_type == PaymentTypeEnum.project:
                proposal.milestones_data = []
                proposal.milestone_description = None
                proposal.milestone_due_date = None
                proposal.milestone_amount = None

            proposal.save()
            return proposal

        proposal = await sync_to_async(update_proposal_fields)()

        # ✅ FIX: Get freelancer using sync_to_async
        freelancer = await sync_to_async(
            lambda: proposal.freelancer
        )()

        # ✅ Handle attachments with S3
        if attachments:
            # Calculate total size for storage limit check
            total_new_bytes = 0
            for file in attachments:
                if file.filename:
                    await file.seek(0)
                    content = await file.read()
                    total_new_bytes += len(content)
                    await file.seek(0)

            # Check storage limit
            old_bytes = 0
            if proposal.attachments and not USE_S3:
                for old_path in proposal.attachments:
                    full_old_path = os.path.join(BASE_DIR, "fastapi_app", old_path)
                    if os.path.exists(full_old_path):
                        old_bytes += os.path.getsize(full_old_path)

            net_increase = max(0, total_new_bytes - old_bytes)
            if net_increase > 0:
                await sync_to_async(check_storage_limit)(freelancer, net_increase)

            # ✅ Delete old attachments from S3 or local
            if proposal.attachments:
                for old_path in proposal.attachments:
                    await delete_proposal_attachment_s3(old_path, freelancer)

            # ✅ Save new attachments
            uploaded_files = []
            for file in attachments:
                if file.filename:
                    saved_path = await save_proposal_attachment_s3(
                        file, 
                        proposal_id, 
                        file.filename
                    )
                    uploaded_files.append(saved_path)
                    
                    # Track file upload for storage limits (only for local)
                    if not USE_S3:
                        full_path = os.path.join(BASE_DIR, "fastapi_app", saved_path)
                        if os.path.exists(full_path):
                            file_size = os.path.getsize(full_path)
                            await sync_to_async(track_file_upload)(freelancer, full_path, file_size)

            # ✅ Update proposal with new attachments
            def update_proposal_attachments():
                proposal.attachments = uploaded_files
                proposal.save()
            
            await sync_to_async(update_proposal_attachments)()

        return {
            "message": "Proposal updated successfully",
            "id": proposal.id,
            "attachments": proposal.attachments,
            "storage_mode": "s3" if USE_S3 else "local"
        }

    except Proposal.DoesNotExist:
        raise HTTPException(status_code=404, detail="Proposal not found")
    except HTTPException as he:
        raise he
    except Exception as e:
        ##print(f"❌ EditProposal ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 5. WITHDRAW PROPOSAL (UPDATED WITH S3)
# ============================================================
@router.delete("/WithdrawProposal/{proposal_id}")
async def withdraw_proposal(proposal_id: int):
    try:
        await sync_to_async(ensure_db_connection)()

        proposal = await sync_to_async(Proposal.objects.get)(id=proposal_id)

        # Delete all attachments from S3 or local
        if proposal.attachments:
            for attachment_path in proposal.attachments:
                await delete_proposal_attachment_s3(attachment_path, proposal.freelancer)

        await sync_to_async(proposal.delete)()
        
        return {
            "message": "Proposal deleted successfully",
            "storage_mode": "s3" if USE_S3 else "local"
        }

    except Proposal.DoesNotExist:
        raise HTTPException(status_code=404, detail="Proposal not found")


# ============================================================
# 6. GET PROPOSALS FOR CREATOR (UPDATED WITH S3 AND PROFILE PICS)
# ============================================================
@router.get("/GetProposalsForCreator/{creator_id}")
async def get_proposals_for_creator(request: Request, creator_id: int):
    try:
        await sync_to_async(ensure_db_connection)()

        base_url = str(request.base_url).rstrip('/')

        def get_proposals_data():
            proposals = (
                Proposal.objects
                .select_related("job", "freelancer")
                .filter(job__employer_id=creator_id)
                .order_by("-created_at")
            )
            
            data = []
            for p in proposals:
                try:
                    total_earnings = (
                        WalletTransaction.objects
                        .filter(to_user=p.freelancer)
                        .aggregate(total=Sum("amount"))["total"]
                    ) or 0

                    rating_data = (
                        Review.objects
                        .filter(recipient=p.freelancer)
                        .aggregate(
                            avg_rating=Avg("rating"),
                            review_count=Count("id")
                        )
                    )

                    profile = CollaboratorProfile.objects.filter(user=p.freelancer).first()

                    freelancer_skills = []

                    if profile:
                        if profile.skills:
                            freelancer_skills = profile.skills
                        elif profile.skill_category:
                            freelancer_skills = [profile.skill_category]

                    if not freelancer_skills and p.skills:
                        freelancer_skills = p.skills

                    freelancer_location = get_user_location(p.freelancer)
                    freelancer_city = freelancer_location.get("city") or ""
                    freelancer_country = freelancer_location.get("location") or ""

                    # ✅ FIX: Use build_full_url for profile picture with S3 support
                    profile_picture_url = None
                    if p.freelancer.profile_picture:
                        profile_picture_url = build_full_url(
                            request=request,
                            path=str(p.freelancer.profile_picture),
                            file_type="profile"
                        )

                    freelancer_name = p.freelancer.full_name or ""
                    if not freelancer_name:
                        freelancer_name = p.freelancer.email or f"User {p.freelancer.id}"

                    milestones_data = []
                    if hasattr(p, 'milestones_data') and p.milestones_data:
                        try:
                            if isinstance(p.milestones_data, list):
                                milestones_data = p.milestones_data
                            elif isinstance(p.milestones_data, str):
                                milestones_data = json.loads(p.milestones_data)
                        except (json.JSONDecodeError, TypeError):
                            milestones_data = []

                    if not milestones_data and p.milestone_description:
                        milestones_data = [{
                            "description": p.milestone_description,
                            "due_date": p.milestone_due_date.strftime("%Y-%m-%d") if p.milestone_due_date else None,
                            "amount": float(p.milestone_amount) if p.milestone_amount else 0
                        }]

                    job_details = {
                        "id": p.job.id if p.job else None,
                        "title": p.job.title if p.job else "Unknown Job",
                        "description": p.job.description if p.job else "",
                        "skills": p.job.skills if p.job and p.job.skills else [],
                        "duration": p.job.duration if p.job else "",
                        "expertise_level": p.job.expertise_level if p.job else "",
                        "budget_type": p.job.budget_type if p.job else "",
                        "budget_from": float(p.job.budget_from) if p.job and p.job.budget_from else None,
                        "budget_to": float(p.job.budget_to) if p.job and p.job.budget_to else None,
                    }

                    data.append({
                        "id": p.id,
                        "freelancer_name": freelancer_name,
                        "profession": profile.skill_category if profile else (p.expertise or ""),
                        "profile_image": profile_picture_url or "",
                        "bid_amount": float(p.bid_amount or 0),
                        "total_earnings": float(total_earnings),
                        "skills": p.skills or [],
                        "collaborator_skills": freelancer_skills,
                        "profile_skills": freelancer_skills,
                        "freelancer_skills": freelancer_skills,
                        "rating": round(rating_data["avg_rating"] or 0, 1),
                        "reviews": rating_data["review_count"] or 0,
                        "city": freelancer_city,
                        "country": freelancer_country,
                        "country_code": get_country_code(freelancer_country),
                        "status": p.status,
                        "date": p.created_at.strftime("%Y-%m-%d"),
                        "payment_type": p.payment_type,
                        "milestone_description": p.milestone_description,
                        "milestone_due_date": p.milestone_due_date.strftime("%Y-%m-%d") if p.milestone_due_date else None,
                        "milestone_amount": float(p.milestone_amount) if p.milestone_amount else None,
                        "milestones_data": milestones_data,
                        "milestones_count": len(milestones_data),
                        "cover_letter": p.cover_letter,
                        "attachments": p.attachments,
                        "duration": p.duration,
                        "expertise": p.expertise,
                        "job_details": job_details,
                        "has_contract": p.job.has_contract if p.job else False,
                        "storage_mode": "s3" if USE_S3 else "local"
                    })

                except Exception as inner_e:
                    ##print(f"❌ Error processing proposal {p.id}: {str(inner_e)}")
                    import traceback
                    traceback.print_exc()
                    continue

            return data

        proposals_data = await sync_to_async(get_proposals_data)()
        
        # Generate attachment URLs with S3 support
        for p_data in proposals_data:
            if p_data.get("attachments"):
                attachment_urls = []
                for att in p_data["attachments"]:
                    url = get_proposal_attachment_url(request, att)
                    if url:
                        attachment_urls.append(url)
                p_data["attachments"] = attachment_urls
                p_data["storage_mode"] = "s3" if USE_S3 else "local"

        return {"proposals": proposals_data}

    except Exception as e:
        ##print("❌ GetProposalsForCreator ERROR:", e)
        import traceback
        traceback.print_exc()
        return {"proposals": [], "error": str(e)}


# ============================================================
# 7. ACCEPT PROPOSAL (FIXED - No manual transaction management)
# ============================================================
@router.post("/AcceptProposal/{proposal_id}")
async def accept_proposal(proposal_id: int, creator_id: int):
    from datetime import date, timedelta
    import re
    import json

    try:
        await sync_to_async(ensure_db_connection)()

        creator = await sync_to_async(UserData.objects.get)(id=creator_id)

        proposal = await sync_to_async(
            lambda: Proposal.objects
            .select_related("job", "freelancer")
            .filter(id=proposal_id, status="submitted")
            .first()
        )()

        if not proposal:
            raise HTTPException(status_code=400, detail="Proposal already processed or not found")

        job = proposal.job

        if job.employer_id != creator.id:
            raise HTTPException(status_code=403, detail="Only job creator can accept proposals")

        if job.has_contract:
            raise HTTPException(status_code=400, detail="This job already has a contract")

        existing_active_contract = await sync_to_async(
            lambda: Contract.objects.filter(
                job=job,
                status__in=["in_progress", "in_review", "awaiting", "pending"]
            ).exists()
        )()

        if existing_active_contract:
            raise HTTPException(
                status_code=400,
                detail="This job already has an active contract. Cannot create another."
            )

        if proposal.status != "submitted":
            raise HTTPException(
                status_code=400,
                detail=f"This proposal has already been {proposal.status}. Cannot accept again."
            )

        def update_proposal_status():
            proposal.status = "accepted"
            proposal.save(update_fields=["status"])
        
        await sync_to_async(update_proposal_status)()
        
        await sync_to_async(check_contract_limit)(creator)

        budget = proposal.bid_amount if proposal.bid_amount else proposal.milestone_amount
        if not budget:
            raise HTTPException(status_code=400, detail="No valid budget found in proposal")

        start_date_today = date.today()

        def calculate_end_date(start_date, duration_str):
            if not start_date or not duration_str:
                return start_date + timedelta(days=30)
            duration_lower = duration_str.lower().strip()
            numbers = [int(n) for n in re.findall(r'\d+', duration_lower)]
            if 'year' in duration_lower or 'yr' in duration_lower:
                years = numbers[0] if numbers else 1
                return start_date + timedelta(days=years * 365)
            elif 'month' in duration_lower:
                months = numbers[0] if numbers else 1
                return start_date + timedelta(days=months * 30)
            elif 'week' in duration_lower:
                weeks = numbers[0] if numbers else 1
                return start_date + timedelta(weeks=weeks)
            elif 'day' in duration_lower:
                days = numbers[0] if numbers else 1
                return start_date + timedelta(days=days)
            return start_date + timedelta(days=30)

        end_date = calculate_end_date(start_date_today, proposal.duration or job.duration)

        contract_milestones = []
        milestones_list = []

        if hasattr(proposal, 'milestones_data') and proposal.milestones_data:
            if isinstance(proposal.milestones_data, list):
                milestones_list = proposal.milestones_data
            elif isinstance(proposal.milestones_data, str):
                try:
                    milestones_list = json.loads(proposal.milestones_data)
                except:
                    milestones_list = []

        if not milestones_list and proposal.milestone_description:
            try:
                if proposal.milestone_description.startswith('['):
                    milestones_list = json.loads(proposal.milestone_description)
                else:
                    milestones_list = [{
                        "description": proposal.milestone_description,
                        "due_date": str(proposal.milestone_due_date) if proposal.milestone_due_date else None,
                        "amount": float(proposal.milestone_amount) if proposal.milestone_amount else 0
                    }]
            except:
                milestones_list = [{
                    "description": proposal.milestone_description,
                    "due_date": str(proposal.milestone_due_date) if proposal.milestone_due_date else None,
                    "amount": float(proposal.milestone_amount) if proposal.milestone_amount else 0
                }]

        if milestones_list and len(milestones_list) > 0:
            for idx, m in enumerate(milestones_list):
                contract_milestones.append({
                    "id": idx,
                    "description": m.get('description', ''),
                    "due_date": m.get('due_date', ''),
                    "amount": float(m.get('amount', 0)),
                    "status": "pending" if idx > 0 else "in_progress",
                    "submission": None,
                    "review": None,
                    "payment": None
                })
            ##print(f"✅ Created {len(contract_milestones)} milestones for contract")

        # ✅ Use transaction.atomic() inside sync function
        def create_contract_sync():
            from django.db import transaction
            with transaction.atomic():
                contract = Contract.objects.create(
                    job=job,
                    creator=creator,
                    collaborator=proposal.freelancer,
                    budget=budget,
                    description=proposal.cover_letter or "",
                    status="in_progress",
                    start_date=start_date_today,
                    end_date=end_date,
                    milestones_data=contract_milestones if contract_milestones else [],
                    current_milestone=0 if contract_milestones else -1,
                    total_paid=0
                )

                job.has_contract = True
                job.save(update_fields=['has_contract'])

                other_proposals_updated = Proposal.objects.filter(
                    job=job, 
                    status="submitted"
                ).exclude(id=proposal.id).update(status="rejected")
                ##print(f"✅ Rejected {other_proposals_updated} other proposals")

                invitations_updated = Invitation.objects.filter(
                    job=job, 
                    status="Pending"
                ).update(status="Rejected")
                ##print(f"✅ Cancelled {invitations_updated} pending invitations")

                Proposal.objects.filter(id=proposal.id, status="submitted").update(status="accepted")
                
                return contract

        contract = await sync_to_async(create_contract_sync)()

        return {
            "message": "Proposal accepted and contract created",
            "proposal_id": proposal.id,
            "contract_id": contract.id,
            "contract_status": contract.status,
            "start_date": contract.start_date.isoformat(),
            "end_date": contract.end_date.isoformat() if contract.end_date else None,
            "milestones_count": len(contract_milestones),
            "has_contract": True,
            "is_milestone_based": len(contract_milestones) > 0,
            "storage_mode": "s3" if USE_S3 else "local"
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Creator not found")
    except HTTPException as he:
        raise he
    except Exception as e:
        ##print(f"❌ AcceptProposal ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 8. REJECT PROPOSAL
# ============================================================
@router.post("/RejectProposal/{proposal_id}")
async def reject_proposal(proposal_id: int, creator_id: int):
    try:
        await sync_to_async(ensure_db_connection)()
        
        creator = await sync_to_async(UserData.objects.get)(id=creator_id)
        proposal = await sync_to_async(
            lambda: Proposal.objects
            .select_related("job")
            .filter(id=proposal_id, status="submitted")
            .first()
        )()

        if not proposal:
            raise HTTPException(
                status_code=400,
                detail="Proposal already processed or not found"
            )

        if proposal.job.employer_id != creator.id:
            raise HTTPException(
                status_code=403,
                detail="Only job creator can reject proposals"
            )

        def reject_proposal_sync():
            Proposal.objects.filter(
                id=proposal.id,
                status="submitted"
            ).update(status="rejected")

        await sync_to_async(reject_proposal_sync)()

        return {
            "message": "Proposal rejected",
            "proposal_id": proposal.id,
            "status": "rejected"
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Creator not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 9. REVOKE ACCEPTANCE (FIXED - No manual transaction management)
# ============================================================
@router.post("/RevokeAcceptance/{proposal_id}")
async def revoke_acceptance(proposal_id: int, creator_id: int):
    try:
        await sync_to_async(ensure_db_connection)()
        
        creator = await sync_to_async(UserData.objects.get)(id=creator_id)
        
        proposal = await sync_to_async(
            lambda: Proposal.objects.filter(
                id=proposal_id, 
                status="accepted"
            ).select_related('job', 'freelancer').first()
        )()
        
        if not proposal:
            raise HTTPException(
                status_code=400,
                detail="Proposal not found or not in accepted status"
            )
        
        job = proposal.job
        freelancer = proposal.freelancer
        
        if job.employer_id != creator.id:
            raise HTTPException(
                status_code=403,
                detail="Only job creator can revoke acceptance"
            )
        
        def revoke_sync():
            from django.db import transaction
            with transaction.atomic():
                contract = Contract.objects.filter(
                    job=job,
                    creator=creator,
                    collaborator=freelancer
                ).first()
                
                deleted_contract_id = None
                if contract:
                    deleted_contract_id = contract.id
                    contract.delete()
                    ##print(f"✅ Contract {deleted_contract_id} deleted successfully")
                
                other_contracts = Contract.objects.filter(job=job).exists()
                
                if not other_contracts:
                    job.has_contract = False
                    job.save(update_fields=['has_contract'])
                    ##print(f"✅ Job {job.id} has_contract set to False")
                
                proposal.status = "submitted"
                proposal.save(update_fields=['status'])
                
                return deleted_contract_id

        deleted_contract_id = await sync_to_async(revoke_sync)()
        
        return {
            "message": "Acceptance revoked and contract deleted successfully",
            "proposal_id": proposal.id,
            "contract_id": deleted_contract_id,
            "status": "submitted",
            "has_contract": job.has_contract,
            "contract_deleted": True,
            "storage_mode": "s3" if USE_S3 else "local"
        }
        
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Creator not found")
    except Exception as e:
        #print(f"❌ Error in revoke_acceptance: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 10. GET JOB PROPOSAL STATUS
# ============================================================
@router.get("/job-proposal-status/{job_id}")
async def get_job_proposal_status(job_id: int):
    try:
        await sync_to_async(ensure_db_connection)()
        
        job = await sync_to_async(JobPost.objects.get)(id=job_id)
        
        return {
            "job_id": job_id,
            "has_contract": job.has_contract,
            "can_accept_proposals": not job.has_contract,
            "status": job.status
        }
        
    except JobPost.DoesNotExist:
        raise HTTPException(status_code=404, detail="Job not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 11. GET PROPOSAL BY ID (UPDATED WITH S3)
# ============================================================
@router.get("/{proposal_id}")
async def get_proposal(request: Request, proposal_id: int):
    await sync_to_async(ensure_db_connection)()
    try:
        proposal = await sync_to_async(
            lambda: Proposal.objects.select_related('job', 'freelancer').get(id=proposal_id)
        )()
        
        # Generate attachment URLs with S3 support
        attachment_urls = []
        if proposal.attachments:
            for att in proposal.attachments:
                url = get_proposal_attachment_url(request, att)
                if url:
                    attachment_urls.append(url)
        
        return {
            "id": proposal.id,
            "cover_letter": proposal.cover_letter,
            "duration": proposal.duration,
            "payment_type": proposal.payment_type,
            "milestone_description": proposal.milestone_description,
            "milestone_due_date": proposal.milestone_due_date.isoformat() if proposal.milestone_due_date else None,
            "milestone_amount": float(proposal.milestone_amount) if proposal.milestone_amount else None,
            "bid_amount": float(proposal.bid_amount) if proposal.bid_amount else None,
            "skills": proposal.skills,
            "expertise": proposal.expertise,
            "attachments": attachment_urls,
            "attachments_paths": proposal.attachments,
            "status": proposal.status,
            "job_id": proposal.job.id,
            "freelancer_id": proposal.freelancer.id,
            "milestones_data": proposal.milestones_data if hasattr(proposal, 'milestones_data') and proposal.milestones_data else [],
            "storage_mode": "s3" if USE_S3 else "local"
        }
    except Proposal.DoesNotExist:
        raise HTTPException(404, detail="Proposal not found")


# ============================================================
# 12. DOWNLOAD PROPOSAL ATTACHMENT (UPDATED WITH S3)
# ============================================================
@router.get("/download-attachment/{proposal_id}/{filename}")
async def download_proposal_attachment(proposal_id: int, filename: str):
    """
    Download proposal attachment with S3 support - Direct Download
    S3 Folder Used: proposal_attachments/
    File Type: proposal
    """
    try:
        await sync_to_async(ensure_db_connection)()

        proposal = await sync_to_async(Proposal.objects.get)(id=proposal_id)

        if not proposal.attachments:
            raise HTTPException(status_code=404, detail="No attachments found for this proposal")

        # Find the attachment
        attachment_path = None
        for att in proposal.attachments:
            if filename == att or att.endswith(filename) or filename in att:
                attachment_path = att
                break

        if not attachment_path:
            for att in proposal.attachments:
                if att.split('/')[-1] == filename:
                    attachment_path = att
                    break

        if not attachment_path:
            raise HTTPException(status_code=404, detail=f"Attachment '{filename}' not found")

        if USE_S3:
            s3_key = get_s3_key_from_path(attachment_path)
            
            # ✅ FORCE DOWNLOAD for all files
            download_url = generate_presigned_url(
                s3_key=s3_key,
                expires_in=ExpiryPreset.WEEKLY,
                force_download=True  # ✅ Force download for all files
            )
            
            if download_url:
                # ✅ Return the download URL for frontend to trigger download
                return {
                    "success": True,
                    "download_url": download_url,
                    "filename": filename,
                    "storage_mode": "s3"
                }
            else:
                raise HTTPException(status_code=404, detail="File not found in S3")
        else:
            # Local storage - Return FileResponse with download headers
            full_path = os.path.join(BASE_DIR, "fastapi_app", attachment_path)

            if not os.path.exists(full_path):
                alt_path = os.path.join(BASE_DIR, attachment_path)
                if os.path.exists(alt_path):
                    full_path = alt_path
                else:
                    raise HTTPException(status_code=404, detail="File not found on server")

            mime_type, _ = mimetypes.guess_type(full_path)
            if not mime_type:
                mime_type = 'application/octet-stream'

            # ✅ Force download for local files too
            return FileResponse(
                full_path,
                media_type=mime_type,
                filename=filename,
                headers={
                    "Content-Disposition": f"attachment; filename*=UTF-8''{filename}",
                    "Content-Type": mime_type,
                }
            )

    except Proposal.DoesNotExist:
        raise HTTPException(status_code=404, detail="Proposal not found")
    except HTTPException as he:
        raise he
    except Exception as e:
        #print(f"❌ Download attachment error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

