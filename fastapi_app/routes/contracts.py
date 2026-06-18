# fastapi_app/routes/contracts.py
import fastapi_app.django_setup
import os
import shutil
import zipfile
import io
from django.db import transaction
from pathlib import Path  

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form, Query
from fastapi.responses import FileResponse, StreamingResponse
from typing import Optional
from django.conf import settings
from django.db.models import Q
from datetime import date
from creator_app.models import Contract, ContractWorkAssignment, Invitation, JobPost, Proposal, UserData, timezone, CollaboratorProfile, CreatorProfile, Review, WalletTransaction
from django.db.models import Avg, Count, Sum
import pycountry
from fastapi_app.routes.storage import (
    save_work_submission,
    save_work_assignment,
    get_work_submission_url,
    get_work_assignment_url,
    delete_file,
    USE_S3
)
from asgiref.sync import sync_to_async
from fastapi_app.routes.dbconnection import ensure_db_connection, check_db_connection
from fastapi_app.routes.auth import get_current_user
from fastapi_app.routes.plan_guard import check_contract_limit
from fastapi_app.services.notification_service import create_notification

router = APIRouter(prefix="/contracts", tags=["My Project"])


# ==========================================================
# HELPER FUNCTION - UPDATE JOB CONTRACT STATUS
# ==========================================================
def update_job_contract_status(job_id: int, has_contract: bool):
    ensure_db_connection()
    try:
        job = JobPost.objects.get(id=job_id)
        job.has_contract = has_contract
        job.save()
        print(f"✅ Job {job_id} has_contract updated to {has_contract}")
        return True
    except JobPost.DoesNotExist:
        print(f"❌ Job {job_id} not found")
        return False
    except Exception as e:
        print(f"❌ Error updating job contract status: {str(e)}")
        return False


# ==========================================================
# HELPER - GET COUNTRY CODE
# ==========================================================
def get_country_code(country_name: str | None):
    if not country_name:
        return None
    try:
        country = pycountry.countries.search_fuzzy(country_name)[0]
        return country.alpha_2
    except Exception:
        return None


def get_total_earnings(user):
    ensure_db_connection()
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
# HELPER - GET USER LOCATION FROM PROFILE
# ==========================================================
def get_creator_location(creator: UserData):
    """Get location from CreatorProfile"""
    try:
        profile = CreatorProfile.objects.filter(user=creator).first()
        if profile:
            return {
                "country": profile.location or "",
                "state": profile.state or "",
                "city": getattr(profile, 'city', "") or "",
                "address": getattr(profile, 'address', "") or ""
            }
    except Exception as e:
        print(f"Error getting creator location: {e}")
    return {"country": "", "state": "", "city": "", "address": ""}


def get_collaborator_location(collaborator: UserData):
    """Get location from CollaboratorProfile"""
    try:
        profile = CollaboratorProfile.objects.filter(user=collaborator).first()
        if profile:
            return {
                "country": profile.location or "",
                "state": profile.state or "",
                "city": getattr(profile, 'city', "") or "",
                "address": getattr(profile, 'address', "") or ""
            }
    except Exception as e:
        print(f"Error getting collaborator location: {e}")
    return {"country": "", "state": "", "city": "", "address": ""}


def get_user_profile_picture_url(user: UserData, base_url: str):
    """Get profile picture URL for user"""
    if user and user.profile_picture:
        pic_path = str(user.profile_picture).lstrip("/")
        return f"{base_url}/media/{pic_path}"
    return None


# ==========================================================
# 1. GET CONTRACTS BY STATUS (UPDATED)
# ==========================================================
@router.get("/by-status")
def get_contracts_by_status(
    status: str,
    user_id: int,
    request: Request
):
    ensure_db_connection()

    try:
        current_user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    contracts = Contract.objects.filter(
        Q(creator=current_user) | Q(collaborator=current_user)
    ).select_related("job", "creator", "collaborator")

    status_lower = status.lower()

    if status_lower == "accepted":
        contracts = contracts.filter(Q(status="awaiting") | Q(status="in_progress"))
    elif status_lower == "awaiting":
        contracts = contracts.filter(status="awaiting")
    elif status_lower == "in_progress":
        contracts = contracts.filter(status="in_progress")
    elif status_lower == "in_review":
        contracts = contracts.filter(
            Q(status="in_review") |
            Q(status="cancelled", creator=current_user)
        )
    elif status_lower == "completed":
        contracts = contracts.filter(status="completed")
    else:
        contracts = contracts.filter(status__iexact=status_lower)

    contracts = contracts.order_by('-id')
    base_url = str(request.base_url).rstrip('/')

    result = []

    for c in contracts:
        job = c.job
        collaborator = c.collaborator
        
        # ✅ FIXED: Get creator location from CreatorProfile
        creator_location = get_creator_location(c.creator)
        country = creator_location.get("country") or "Unknown"
        state = creator_location.get("state") or None
        country_code = get_country_code(country)

        review_stats = Review.objects.filter(
            recipient=c.creator
        ).aggregate(
            avg_rating=Avg("rating"),
            total_reviews=Count("id")
        )

        rating = round(review_stats["avg_rating"] or 0, 1)
        reviews = review_stats["total_reviews"]

        contract_data = {
            "id": c.id,
            "job_title": job.title if job else "No Job Title",
            "description": c.description,
            "budget": float(c.budget),
            "status": c.status,
            "external_file_link": c.external_file_link,
            "viewer_role": "creator" if c.creator.id == current_user.id else "collaborator",
            "creator": {
                "id": c.creator.id,
                "name": c.creator.full_name or c.creator.email.split("@")[0],
                "state": state,
                "country": country,
                "country_code": country_code,
                "rating": rating,
                "reviews": reviews,
            },
            "collaborator": {
                "id": collaborator.id,
                "name": collaborator.full_name or collaborator.email.split("@")[0],
                "email": collaborator.email,
            },
            "work_description": c.work_description,
            "has_attachment": bool(c.work_attachment),
            "work_submitted_at": c.work_submitted_at,
            "job_budget_type": job.budget_type if job else "fixed",
            "job_description": job.description if job else "",
            "job_created_at": job.created_at if job else None,
            "job_budget_from": float(job.budget_from) if job and job.budget_from else None,
            "job_budget_to": float(job.budget_to) if job and job.budget_to else None,
            "job_expertise_level": job.expertise_level if job else "Intermediate",
            "start_date": c.start_date.isoformat() if c.start_date else None,
            "end_date": c.end_date.isoformat() if c.end_date else None,
            "completed_at": c.completed_at.isoformat() if c.completed_at else None,
            "revision_description": c.revision_description,
            "status_reason": c.status_reason,
            "milestones_data": c.milestones_data if hasattr(c, 'milestones_data') and c.milestones_data else [],
            "current_milestone": c.current_milestone if hasattr(c, 'current_milestone') else 0,
            "total_paid": float(c.total_paid) if hasattr(c, 'total_paid') and c.total_paid else 0,
        }

        result.append(contract_data)

    return result


# ==========================================================
# STATUS COUNTS
# ==========================================================
@router.get("/status-counts")
def get_contract_status_counts(user_id: int):
    ensure_db_connection()

    try:
        current_user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    user_contracts = Contract.objects.filter(
        Q(creator=current_user) | Q(collaborator=current_user)
    )

    awaiting_count = user_contracts.filter(status="awaiting").count()
    in_progress_count = user_contracts.filter(status="in_progress").count()
    pending_count = user_contracts.filter(status="pending").count()
    completed_count = user_contracts.filter(status="completed").count()
    accepted_count = awaiting_count + in_progress_count

    in_review_count = user_contracts.filter(
    status="in_review"
).count()

    cancelled_count = user_contracts.filter(
    status="cancelled"
).count()

    return {
        "accepted": accepted_count,
        "awaiting": awaiting_count,
        "in_progress": in_progress_count,
        "pending": pending_count,
        "in_review": in_review_count,
        "completed": completed_count,
        "cancelled": cancelled_count,
        "total": user_contracts.count()
    }


# ==========================================================
# LATEST JOB
# ==========================================================
@router.get("/latest-job")
def get_latest_job_for_user(user_id: int):
    ensure_db_connection()

    try:
        current_user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    latest_job = JobPost.objects.filter(
        employer=current_user
    ).order_by('-created_at').first()

    if not latest_job:
        raise HTTPException(status_code=404, detail="No jobs found for this user")

    contracts_count = Contract.objects.filter(job=latest_job).count()
    contract = Contract.objects.filter(job=latest_job).select_related("creator", "collaborator").first()

    response_data = {
        "job": {
            "id": latest_job.id,
            "title": latest_job.title,
            "description": latest_job.description,
            "budget_type": latest_job.budget_type,
            "created_at": latest_job.created_at,
            "contracts_count": contracts_count,
            "has_contract": latest_job.has_contract,
        }
    }

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

    response_data["job"]["budget_from"] = float(latest_job.budget_from) if latest_job.budget_from else None
    response_data["job"]["budget_to"] = float(latest_job.budget_to) if latest_job.budget_to else None

    return response_data


# ==========================================================
# WORK ATTACHMENT DOWNLOAD
# ==========================================================
import mimetypes

@router.get("/{id}/work-attachment")
def download_work_attachment(id: int, user_id: int):
    ensure_db_connection()

    try:
        contract = Contract.objects.get(id=id)
        user = UserData.objects.get(id=user_id)
    except (Contract.DoesNotExist, UserData.DoesNotExist):
        raise HTTPException(status_code=404, detail="Contract or User not found")

    if user not in [contract.creator, contract.collaborator]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if contract.status != "completed":
        raise HTTPException(status_code=400, detail="Contract not completed")

    if not contract.work_attachment:
        raise HTTPException(status_code=404, detail="No attachment found")

    use_s3 = os.getenv("USE_S3", "False").lower() == "true"
    
    if use_s3:
        # ========== S3 STORAGE ==========
        from fastapi_app.routes.storage import read_file_bytes
        try:
            s3_key = str(contract.work_attachment.name).lstrip('/')
            file_content = read_file_bytes(s3_key)
            filename = os.path.basename(s3_key)
            
            # Return the file directly without redirect
            return StreamingResponse(
                io.BytesIO(file_content),
                media_type='application/octet-stream',
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "Content-Type": "application/octet-stream"
                }
            )
        except Exception as e:
            print(f"Error downloading from S3: {e}")
            raise HTTPException(status_code=404, detail=f"Failed to download file: {str(e)}")
    else:
        # ========== LOCAL STORAGE ==========
        file_path = contract.work_attachment.path

        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        filename = os.path.basename(file_path)
        content_type, _ = mimetypes.guess_type(file_path)
        content_type = content_type or "application/octet-stream"

        return FileResponse(
            path=file_path,
            media_type=content_type,
            filename=filename,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )


# ==========================================================
# REJECT CONTRACT
# ==========================================================
@router.post("/{id}/reject")
def reject_contract(id: int, user_id: int):
    ensure_db_connection()

    try:
        current_user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        contract = Contract.objects.get(id=id)
    except Contract.DoesNotExist:
        raise HTTPException(status_code=404, detail="Contract not found")

    if contract.collaborator != current_user:
        raise HTTPException(
            status_code=403,
            detail="Not allowed to reject this contract"
        )

    job_id = contract.job_id

    contract.status = "cancelled"
    contract.save()
    
    Proposal.objects.filter(
        job=contract.job,
        freelancer=contract.collaborator,
        status__in=["accepted", "submitted"]
    ).update(status="rejected")
    
    Invitation.objects.filter(
        job=contract.job,
        receiver=contract.collaborator,
        status__in=["Accepted", "Pending"]
    ).update(status="Rejected")

    other_active_contracts = Contract.objects.filter(
        job_id=job_id,
        status__in=[
            "active",
            "in_progress",
            "pending",
            "awaiting",
            "in_review"
        ]
    ).exclude(id=id).exists()

    if not other_active_contracts:
        update_job_contract_status(job_id, False)

    return {
        "message": "Contract rejected and job reopened"
    }


# ==========================================================
# SUBMIT WORK
# ==========================================================
@router.post("/{id}/submit-work")
async def submit_work(
    id: int,
    user_id: int,
    description: str = Form(""),
    external_file_link: str = Form(""),
    attachment: UploadFile | None = File(None)
):
    ensure_db_connection()

    try:
        # Use select_related to preload related fields
        contract = await sync_to_async(
            lambda: Contract.objects.select_related("job", "creator", "collaborator").get(id=id)
        )()
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except Contract.DoesNotExist:
        raise HTTPException(status_code=404, detail="Contract not found")
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    # Now these are preloaded and accessible
    if contract.collaborator.id != user.id:
        raise HTTPException(status_code=403, detail="Only the collaborator can submit work")

    if contract.status not in ["in_progress", "in_review"]:
        raise HTTPException(status_code=400, detail="Contract must be in progress to submit work")

    if not attachment and not external_file_link.strip():
        raise HTTPException(status_code=400, detail="Please upload a file or provide an external file link")

    contract.work_description = description
    contract.external_file_link = external_file_link
    contract.work_submitted_at = timezone.now()

    use_s3 = os.getenv("USE_S3", "False").lower() == "true"

    if attachment:
        if use_s3:
            # ========== S3 STORAGE ==========
            try:
                s3_key = await save_work_submission(
                    attachment,
                    str(contract.id),
                    str(contract.collaborator.id)
                )
                contract.work_attachment.name = s3_key
                print(f"✅ Work submission saved to S3: {s3_key}")
            except Exception as e:
                print(f"⚠️ S3 upload failed, using local storage: {e}")
                # Fallback to local storage
                file_content = await attachment.read()
                max_size = 25 * 1024 * 1024
                if len(file_content) > max_size:
                    raise HTTPException(status_code=400, detail="File exceeds 25MB. Please use Google Drive or external file link.")
                
                upload_folder = os.path.join(settings.MEDIA_ROOT, "work_submissions")
                os.makedirs(upload_folder, exist_ok=True)
                filename = os.path.basename(attachment.filename)
                full_disk_path = os.path.join(upload_folder, filename)
                
                with open(full_disk_path, "wb") as buffer:
                    buffer.write(file_content)
                contract.work_attachment.name = f"work_submissions/{filename}"
        else:
            # ========== LOCAL STORAGE ==========
            file_content = await attachment.read()
            max_size = 25 * 1024 * 1024

            if len(file_content) > max_size:
                raise HTTPException(status_code=400, detail="File exceeds 25MB. Please use Google Drive or external file link.")

            upload_folder = os.path.join(settings.MEDIA_ROOT, "work_submissions")
            os.makedirs(upload_folder, exist_ok=True)
            filename = os.path.basename(attachment.filename)
            full_disk_path = os.path.join(upload_folder, filename)

            with open(full_disk_path, "wb") as buffer:
                buffer.write(file_content)

            contract.work_attachment.name = f"work_submissions/{filename}"

    contract.revision_description = None
    contract.status_reason = None
    contract.status = "in_review"
    await sync_to_async(contract.save)()
    
    job_title = contract.job.title if contract.job else "Project"
    
    # Notifications (using sync_to_async)
    await sync_to_async(create_notification)(
        user=contract.creator,
        sender=contract.collaborator,
        notification_type="contract_completed",
        title="Work Submitted",
        message=f"{contract.collaborator.full_name} submitted completed work for '{job_title}'",
        contract=contract,
        job=contract.job,
        url="/pendingcontracts"
    )
    await sync_to_async(create_notification)(
        user=contract.collaborator,
        sender=contract.creator,
        notification_type="contract_completed",
        title="Work Submitted Successfully",
        message=f"Your completed work for '{job_title}' has been submitted for review",
        contract=contract,
        job=contract.job,
        url="/all-contacts"
    )
    
    return {
        "message": "Work submitted successfully",
        "contract_id": contract.id,
        "status": contract.status,
        "external_file_link": contract.external_file_link
    }


# ==========================================================
# SUBMIT MILESTONE WORK
# ==========================================================
@router.post("/{contract_id}/milestones/{milestone_index}/submit-work")
async def submit_milestone_work(
    contract_id: int,
    milestone_index: int,
    user_id: int = Query(...),
    description: str = Form(""),
    external_link: str = Form(""),
    attachment: UploadFile | None = File(None)
):
    """
    Collaborator submits work for a specific milestone (including resubmission after revision)
    """
    ensure_db_connection()

    try:
        contract = await sync_to_async(
            lambda: Contract.objects.select_related("job", "creator", "collaborator").get(id=contract_id)
        )()
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except Contract.DoesNotExist:
        raise HTTPException(status_code=404, detail="Contract not found")
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    if contract.collaborator.id != user.id:
        raise HTTPException(status_code=403, detail="Only the collaborator can submit work")

    if contract.status not in ["in_progress", "in_review"]:
        raise HTTPException(status_code=400, detail="Contract must be in progress to submit work")

    milestones = contract.milestones_data if contract.milestones_data else []
    
    if milestone_index >= len(milestones):
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone = milestones[milestone_index]

    if milestone.get("status") not in ["in_progress", "revision_requested"]:
        raise HTTPException(status_code=400, detail=f"Milestone is {milestone.get('status')}, cannot submit work")
    
    if milestone_index != contract.current_milestone:
        raise HTTPException(status_code=400, detail="Please complete the current milestone first")

    if not attachment and not external_link.strip() and not description.strip():
        raise HTTPException(status_code=400, detail="Please provide work description, file, or external link")

    submission_data = {
        "description": description,
        "external_link": external_link,
        "submitted_at": timezone.now().isoformat()
    }

    use_s3 = os.getenv("USE_S3", "False").lower() == "true"

    if attachment:
        # Delete old attachment if exists
        if milestone.get('submission') and milestone['submission'].get('attachment'):
            old_path = milestone['submission']['attachment']
            if use_s3:
                s3_key = old_path.lstrip('/')
                await sync_to_async(delete_file)(s3_key)
                print(f"✅ Deleted old attachment from S3: {s3_key}")
            else:
                old_full_path = os.path.join(settings.MEDIA_ROOT, old_path)
                if os.path.exists(old_full_path):
                    os.remove(old_full_path)
                    print(f"✅ Deleted old attachment: {old_full_path}")
        
        if use_s3:
            # ========== S3 STORAGE ==========
            try:
                s3_key = await save_work_submission(
                    attachment,
                    str(contract_id),
                    str(contract.collaborator.id)
                )
                submission_data["attachment"] = s3_key
                submission_data["attachment_name"] = attachment.filename
                print(f"✅ Milestone submission saved to S3: {s3_key}")
            except Exception as e:
                print(f"⚠️ S3 upload failed, using local storage: {e}")
                # Fallback to local storage
                file_content = await attachment.read()
                max_size = 25 * 1024 * 1024
                if len(file_content) > max_size:
                    raise HTTPException(status_code=400, detail="File exceeds 25MB. Please use external link.")
                
                upload_folder = os.path.join(settings.MEDIA_ROOT, "milestone_submissions")
                os.makedirs(upload_folder, exist_ok=True)
                filename = f"contract_{contract_id}_milestone_{milestone_index}_{int(timezone.now().timestamp())}_{attachment.filename}"
                full_disk_path = os.path.join(upload_folder, filename)
                
                with open(full_disk_path, "wb") as buffer:
                    buffer.write(file_content)
                submission_data["attachment"] = f"milestone_submissions/{filename}"
                submission_data["attachment_name"] = attachment.filename
        else:
            # ========== LOCAL STORAGE ==========
            file_content = await attachment.read()
            max_size = 25 * 1024 * 1024

            if len(file_content) > max_size:
                raise HTTPException(status_code=400, detail="File exceeds 25MB. Please use external link.")

            upload_folder = os.path.join(settings.MEDIA_ROOT, "milestone_submissions")
            os.makedirs(upload_folder, exist_ok=True)
            
            filename = f"contract_{contract_id}_milestone_{milestone_index}_{int(timezone.now().timestamp())}_{attachment.filename}"
            full_disk_path = os.path.join(upload_folder, filename)

            with open(full_disk_path, "wb") as buffer:
                buffer.write(file_content)

            submission_data["attachment"] = f"milestone_submissions/{filename}"
            submission_data["attachment_name"] = attachment.filename

    milestone["status"] = "submitted"
    milestone["submission"] = submission_data
    
    if "review" in milestone:
        milestone["review"] = None
    
    contract.milestones_data = milestones
    contract.status = "in_review"
    await sync_to_async(contract.save)()
    
    try:
        milestone_title = milestone.get("description", f"Milestone {milestone_index + 1}")

        await sync_to_async(create_notification)(
            user=contract.creator,
            sender=contract.collaborator,
            notification_type="milestone_submitted",
            title=f"Milestone {milestone_index + 1} Submitted",
            message=(
                f"{contract.collaborator.full_name} submitted work for "
                f"'{milestone_title}'"
            ),
            contract=contract,
            job=contract.job,
            url="/pendingcontracts"
        )

        await sync_to_async(create_notification)(
            user=contract.collaborator,
            sender=contract.creator,
            notification_type="milestone_submitted",
            title=f"Milestone {milestone_index + 1} Submitted Successfully",
            message=(
                f"Your work for '{milestone_title}' has been submitted for review"
            ),
            contract=contract,
            job=contract.job,
            url="/all-contacts"
        )

    except Exception as e:
        print(f"Milestone notification error: {e}")

    return {
        "success": True,
        "message": f"Milestone {milestone_index + 1} work {'resubmitted' if milestone.get('submission') else 'submitted'} successfully",
        "contract_id": contract.id,
        "milestone_index": milestone_index,
        "milestone_status": milestone["status"]
    }

# ==========================================================
# APPROVE MILESTONE WORK
# ==========================================================
@router.post("/{contract_id}/milestones/{milestone_index}/approve")
def approve_milestone_work(
    contract_id: int,
    milestone_index: int,
    user_id: int = Query(...),
    comments: str = Form("")
):
    """
    Creator approves milestone work - automatically triggers wallet transfer
    """
    ensure_db_connection()

    try:
        contract = Contract.objects.get(id=contract_id)
        creator = UserData.objects.get(id=user_id)
    except (Contract.DoesNotExist, UserData.DoesNotExist):
        raise HTTPException(status_code=404, detail="Contract or User not found")

    if contract.creator != creator:
        raise HTTPException(status_code=403, detail="Only the creator can approve milestone work")

    milestones = contract.milestones_data if contract.milestones_data else []
    
    if milestone_index >= len(milestones):
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone = milestones[milestone_index]

    if milestone.get("status") != "submitted":
        raise HTTPException(status_code=400, detail=f"Milestone is {milestone.get('status')}, cannot approve")

    milestone_amount = milestone.get("amount", 0)
    collaborator = contract.collaborator

    from creator_app.models import Wallet
    from decimal import Decimal
    
    creator_wallet, _ = Wallet.objects.get_or_create(user=creator)
    
    milestone_amount_decimal = Decimal(str(milestone_amount))
    
    if creator_wallet.balance < milestone_amount_decimal:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient wallet balance. Need ₹{milestone_amount}. Available: ₹{float(creator_wallet.balance)}"
        )

    try:
        with transaction.atomic():
            creator_wallet.balance -= milestone_amount_decimal
            creator_wallet.save()
            
            collab_wallet, _ = Wallet.objects.get_or_create(user=collaborator)
            collab_wallet.balance += milestone_amount_decimal
            collab_wallet.save()
            
            WalletTransaction.objects.create(
                wallet=creator_wallet,
                amount=milestone_amount_decimal,
                transaction_type="Milestone Payment",
                user=creator,
                from_user=creator,
                to_user=collaborator,
            )
            
            WalletTransaction.objects.create(
                wallet=collab_wallet,
                amount=milestone_amount_decimal,
                transaction_type="Milestone Received",
                user=collaborator,
                from_user=creator,
                to_user=collaborator,
            )
            
            milestone["status"] = "paid"
            milestone["review"] = {
                "status": "approved",
                "comments": comments,
                "reviewed_at": timezone.now().isoformat()
            }
            milestone["payment"] = {
                "amount": milestone_amount,
                "paid_at": timezone.now().isoformat(),
                "transaction_type": "milestone_payment"
            }
            
            contract.total_paid = (contract.total_paid or 0) + milestone_amount_decimal
            
            all_paid = all(m.get("status") == "paid" for m in milestones)
            
            if all_paid:
                contract.status = "completed"
                contract.completed_at = timezone.now()
            else:
                for i, m in enumerate(milestones):
                    if m.get("status") == "pending" and i > milestone_index:
                        m["status"] = "in_progress"
                        contract.current_milestone = i
                        break
            
            contract.milestones_data = milestones
            contract.save()
            
            try:
                from fastapi_app.services.notification_service import create_notification_sync
                create_notification_sync(
                    user=collaborator,
                    notification_type="milestone_paid",
                    title=f"Milestone {milestone_index + 1} Approved & Paid",
                    message=f"₹{milestone_amount} has been added to your wallet for: {milestone.get('description')}",
                    url="/wallet",
                    icon="payment"
                )
            except Exception as e:
                print(f"Notification error: {e}")
            
            return {
                "success": True,
                "message": f"Milestone {milestone_index + 1} approved and ₹{milestone_amount} transferred",
                "contract_id": contract.id,
                "milestone_index": milestone_index,
                "milestone_status": "paid",
                "total_paid": float(contract.total_paid),
                "remaining": float(contract.budget - contract.total_paid),
                "all_milestones_complete": all_paid,
                "contract_status": contract.status
            }
            
    except Exception as e:
        print(f"❌ Payment error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Payment failed: {str(e)}")


# ==========================================================
# REQUEST REVISION FOR MILESTONE
# ==========================================================
@router.post("/{contract_id}/milestones/{milestone_index}/request-revision")
def request_milestone_revision(
    contract_id: int,
    milestone_index: int,
    user_id: int = Query(...),
    revision_comments: str = Form(...)
):
    """
    Creator requests revision for milestone work
    """
    ensure_db_connection()

    try:
        contract = Contract.objects.get(id=contract_id)
        creator = UserData.objects.get(id=user_id)
    except (Contract.DoesNotExist, UserData.DoesNotExist):
        raise HTTPException(status_code=404, detail="Contract or User not found")

    if contract.creator != creator:
        raise HTTPException(status_code=403, detail="Only the creator can request revision")

    if not revision_comments or not revision_comments.strip():
        raise HTTPException(status_code=400, detail="Revision comments are required")

    milestones = contract.milestones_data if contract.milestones_data else []
    
    if milestone_index >= len(milestones):
        raise HTTPException(status_code=404, detail="Milestone not found")

    milestone = milestones[milestone_index]

    if milestone.get("status") != "submitted":
        raise HTTPException(status_code=400, detail=f"Milestone is {milestone.get('status')}, cannot request revision")

    milestone["status"] = "revision_requested"
    milestone["review"] = {
        "status": "revision_requested",
        "comments": revision_comments,
        "reviewed_at": timezone.now().isoformat()
    }

    contract.milestones_data = milestones
    contract.status = "in_progress"
    contract.save()

    try:
        from fastapi_app.services.notification_service import create_notification_sync
        create_notification_sync(
            user=contract.collaborator,
            notification_type="milestone_revision",
            title=f"Revision Requested for Milestone {milestone_index + 1}",
            message=revision_comments[:200],
            url=f"/contracts/{contract_id}/milestones/{milestone_index}",
            icon="revision"
        )
    except Exception as e:
        print(f"Notification error: {e}")

    return {
        "success": True,
        "message": f"Revision requested for milestone {milestone_index + 1}",
        "contract_id": contract.id,
        "milestone_index": milestone_index,
        "milestone_status": "revision_requested"
    }


# ==========================================================
# GET CONTRACT DETAILS WITH MILESTONES
# ==========================================================
@router.get("/{contract_id}/details")
def get_contract_details(
    contract_id: int,
    user_id: int,
    request: Request
):
    ensure_db_connection()
    
    try:
        contract = Contract.objects.get(id=contract_id)
        user = UserData.objects.get(id=user_id)
    except Contract.DoesNotExist:
        raise HTTPException(404, "Contract not found")
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")
    
    if user not in [contract.creator, contract.collaborator]:
        raise HTTPException(403, "Not authorized")
    
    base_url = str(request.base_url).rstrip('/')
    
    creator_pic = get_user_profile_picture_url(contract.creator, base_url)
    collaborator_pic = get_user_profile_picture_url(contract.collaborator, base_url)
    
    milestones = contract.milestones_data
    if isinstance(milestones, str):
        import json
        try:
            milestones = json.loads(milestones)
        except:
            milestones = []
    
    return {
        "id": contract.id,
        "job_title": contract.job.title if contract.job else "",
        "budget": float(contract.budget),
        "total_paid": float(contract.total_paid) if contract.total_paid else 0,
        "status": contract.status,
        "current_milestone": contract.current_milestone,
        "milestones_data": milestones if milestones else [],
        "creator": {
            "id": contract.creator.id,
            "name": contract.creator.full_name or contract.creator.email.split("@")[0],
            "profile_picture": creator_pic
        },
        "collaborator": {
            "id": contract.collaborator.id,
            "name": contract.collaborator.full_name or contract.collaborator.email.split("@")[0],
            "email": contract.collaborator.email,
            "profile_picture": collaborator_pic
        },
        "start_date": contract.start_date,
        "end_date": contract.end_date,
        "work_description": contract.work_description,
        "external_file_link": contract.external_file_link,
        "work_submitted_at": contract.work_submitted_at,
        "revision_description": contract.revision_description,
        "status_reason": contract.status_reason,
        "has_attachment": bool(contract.work_attachment)
    }


# ==========================================================
# APPROVE WORK
# ==========================================================
@router.post("/{id}/approve-work")
def approve_work(id: int, user_id: int):
    try:
        current_user = UserData.objects.get(id=user_id)
        contract = Contract.objects.get(id=id)
    except (UserData.DoesNotExist, Contract.DoesNotExist):
        raise HTTPException(status_code=404, detail="User or Contract not found")

    if contract.creator != current_user:
        raise HTTPException(status_code=403, detail="Only the creator can approve this work")

    if contract.status != "in_review":
        raise HTTPException(status_code=400, detail="Work must be submitted before approval")

    contract.status = "completed"
    contract.completed_at = timezone.now()
    contract.save()

    return {
        "message": "Work approved and contract completed",
        "contract_id": contract.id,
        "status": "completed",
        "completed_at": contract.completed_at
    }


# ==========================================================
# DOWNLOAD WORK ZIP
# ==========================================================
@router.get("/{contract_id}/download-work")
def download_work_zip(contract_id: int, user_id: int):
    ensure_db_connection()

    try:
        contract = Contract.objects.get(id=contract_id)
        current_user = UserData.objects.get(id=user_id)

        if contract.creator != current_user and contract.collaborator != current_user:
            raise HTTPException(status_code=403, detail="You do not have permission to download this file.")

        if not contract.work_attachment:
            raise HTTPException(status_code=404, detail="No work has been submitted for this contract.")

        use_s3 = os.getenv("USE_S3", "False").lower() == "true"

        if use_s3:
            # ========== S3 STORAGE ==========
            s3_key = str(contract.work_attachment.name).lstrip('/')
            
            # Get file from S3
            from fastapi_app.routes.storage import read_file_bytes
            try:
                file_content = read_file_bytes(s3_key)
                # ✅ Path is now imported
                file_name = Path(s3_key).name
                
                zip_buffer = io.BytesIO()
                with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
                    zip_file.writestr(file_name, file_content)
                
                zip_buffer.seek(0)
                
                return StreamingResponse(
                    zip_buffer,
                    media_type="application/x-zip-compressed",
                    headers={"Content-Disposition": f"attachment; filename=work_submission_{contract_id}.zip"}
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to download from S3: {str(e)}")
        else:
            # ========== LOCAL STORAGE ==========
            file_path = contract.work_attachment.path
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="File not found on server.")

            file_name = os.path.basename(file_path)
            zip_buffer = io.BytesIO()

            with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
                zip_file.write(file_path, arcname=file_name)

            zip_buffer.seek(0)

            return StreamingResponse(
                zip_buffer,
                media_type="application/x-zip-compressed",
                headers={"Content-Disposition": f"attachment; filename=work_submission_{contract_id}.zip"}
            )

    except Contract.DoesNotExist:
        raise HTTPException(status_code=404, detail="Contract not found")
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================================
# GET MY CONTRACTS (UPDATED)
# ==========================================================
@router.get("")
def get_my_contracts(
    request: Request,
    status: str,
    current_user: UserData = Depends(get_current_user)
):
    ensure_db_connection()

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
        .select_related("collaborator", "collaborator__collaborator_profile")
    )

    base_url = str(request.base_url).rstrip("/")
    result = []

    for c in contracts:
        collaborator = c.collaborator
        profile = getattr(collaborator, "collaborator_profile", None)
        
        # ✅ FIXED: Get collaborator location from CollaboratorProfile
        collab_location = get_collaborator_location(collaborator)
        country = collab_location.get("country") or "Unknown"
        country_code = get_country_code(country)

        review_stats = Review.objects.filter(recipient=collaborator).aggregate(
            avg_rating=Avg("rating"),
            total_reviews=Count("id")
        )

        rating = round(review_stats["avg_rating"] or 0, 1)
        reviews = review_stats["total_reviews"]
        total_earnings = get_total_earnings(collaborator)

        profile_picture_url = get_user_profile_picture_url(collaborator, base_url)

        result.append({
            "id": c.id,
            "status": c.status,
            "collaborator": {
                "id": collaborator.id,
                "name": collaborator.full_name or collaborator.email.split("@")[0],
                "skill_category": profile.skill_category if profile else "",
                "skills": profile.skills if profile else [],
                "state": collab_location.get("state"),
                "city": collab_location.get("city"),
                "country": country,
                "country_code": country_code,
                "rate_display": get_rate_display(profile),
                "profile_picture": profile_picture_url,
                "rating": rating,
                "reviews": reviews,
                "total_earnings": float(total_earnings),
            }
        })

    return result


# ==========================================================
# GET COLLABORATOR CONTRACTS (UPDATED)
# ==========================================================
@router.get("/collaborator-contracts")
def get_collaborator_contracts(
    request: Request,
    current_user: UserData = Depends(get_current_user)
):
    ensure_db_connection()

    try:
        contracts = (
            Contract.objects
            .filter(collaborator=current_user)
            .select_related("job", "creator", "collaborator")
            .order_by("-id")
        )

        base_url = str(request.base_url).rstrip("/")
        result = []

        for c in contracts:
            job = c.job
            
            creator_pic_url = get_user_profile_picture_url(c.creator, base_url)
            
            # ✅ FIXED: Get creator location from CreatorProfile
            creator_location = get_creator_location(c.creator)
            
            # ✅ FIXED: Get collaborator location from CollaboratorProfile
            collaborator_location = get_collaborator_location(current_user)

            result.append({
                "id": c.id,
                "job_title": job.title if job else "No Job Title",
                "description": c.description,
                "budget": float(c.budget),
                "status": c.status,
                "viewer_role": "collaborator",

                "creator": {
                    "id": c.creator.id,
                    "email": c.creator.email,
                    "name": c.creator.full_name or c.creator.email.split("@")[0],
                    "full_name": c.creator.full_name or c.creator.email.split("@")[0],
                    "state": creator_location.get("state"),
                    "location": creator_location.get("country"),
                    "address": creator_location.get("address"),
                    "profile_picture": creator_pic_url,
                },

                "collaborator": {
                    "id": current_user.id,
                    "email": current_user.email,
                    "name": current_user.full_name or current_user.email.split("@")[0],
                    "state": collaborator_location.get("state"),
                    "location": collaborator_location.get("country"),
                    "address": collaborator_location.get("address"),
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
                "revision_description": c.revision_description,
                "status_reason": c.status_reason,
                
                "milestones_data": c.milestones_data if hasattr(c, 'milestones_data') and c.milestones_data else [],
                "current_milestone": c.current_milestone if hasattr(c, 'current_milestone') else 0,
                "total_paid": float(c.total_paid) if hasattr(c, 'total_paid') and c.total_paid else 0,
            })

        return result or []

    except Exception as e:
        print(f"Error in get_collaborator_contracts: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================================
# ASSIGN WORK
# ==========================================================
@router.post("/{contract_id}/assign-work")
async def assign_work(
    contract_id: int,
    user_id: int,
    title: str = Form(...),
    description: str = Form(""),
    attachment: UploadFile | None = File(None)
):
    ensure_db_connection()

    try:
        contract = await sync_to_async(Contract.objects.get)(id=contract_id)
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except (Contract.DoesNotExist, UserData.DoesNotExist):
        raise HTTPException(status_code=404, detail="Contract or user not found")

    if contract.creator != user:
        raise HTTPException(status_code=403, detail="Only creator can assign work")

    assignment = ContractWorkAssignment(
        contract=contract,
        title=title,
        description=description
    )
    await sync_to_async(assignment.save)()

    use_s3 = os.getenv("USE_S3", "False").lower() == "true"

    if attachment:
        if use_s3:
            # ========== S3 STORAGE ==========
            try:
                s3_key = await save_work_assignment(
                    attachment,
                    str(contract_id)
                )
                assignment.attachment.name = s3_key
                await sync_to_async(assignment.save)()
                print(f"✅ Work assignment saved to S3: {s3_key}")
            except Exception as e:
                print(f"⚠️ S3 upload failed, using local storage: {e}")
                # Fallback to local storage
                file_content = await attachment.read()
                upload_folder = os.path.join(settings.MEDIA_ROOT, "work_assignments")
                os.makedirs(upload_folder, exist_ok=True)
                filename = os.path.basename(attachment.filename)
                full_disk_path = os.path.join(upload_folder, filename)
                with open(full_disk_path, "wb") as buffer:
                    buffer.write(file_content)
                assignment.attachment.name = f"work_assignments/{filename}"
                await sync_to_async(assignment.save)()
        else:
            # ========== LOCAL STORAGE ==========
            file_content = await attachment.read()
            upload_folder = os.path.join(settings.MEDIA_ROOT, "work_assignments")
            os.makedirs(upload_folder, exist_ok=True)

            filename = os.path.basename(attachment.filename)
            full_disk_path = os.path.join(upload_folder, filename)

            with open(full_disk_path, "wb") as buffer:
                buffer.write(file_content)

            assignment.attachment.name = f"work_assignments/{filename}"
            await sync_to_async(assignment.save)()

    return {
        "message": "Work assigned successfully",
        "assignment_id": assignment.id
    }


# ==========================================================
# ALL CONTRACTS HISTORY (UPDATED)
# ==========================================================
@router.get("/all-history")
def get_all_contracts_history(
    request: Request,
    current_user: UserData = Depends(get_current_user)
):
    ensure_db_connection()

    base_url = str(request.base_url).rstrip("/")

    contracts = (
        Contract.objects
        .filter(creator=current_user)
        .select_related("collaborator", "collaborator__collaborator_profile")
        .order_by("-id")
    )

    result = []

    for c in contracts:
        collaborator = c.collaborator
        profile = getattr(collaborator, "collaborator_profile", None)
        
        collab_location = get_collaborator_location(collaborator)
        country = collab_location.get("country") or "Unknown"
        country_code = get_country_code(country)

        review_stats = Review.objects.filter(recipient=collaborator).aggregate(
            avg_rating=Avg("rating"),
            total_reviews=Count("id")
        )

        rating = round(review_stats["avg_rating"] or 0, 1)
        reviews = review_stats["total_reviews"]
        total_earnings = get_total_earnings(collaborator)

        profile_picture_url = get_user_profile_picture_url(collaborator, base_url)

        result.append({
    "id": c.id,
    "job_id": c.job_id,
    "status": c.status,

    # ADD THESE
    "milestones_data": (
        c.milestones_data
        if hasattr(c, "milestones_data") and c.milestones_data
        else []
    ),
    "current_milestone": (
        c.current_milestone
        if hasattr(c, "current_milestone")
        else 0
    ),
    "total_paid": float(c.total_paid or 0),

    "collaborator": {
        "id": collaborator.id,
        "name": collaborator.full_name or collaborator.email.split("@")[0],
        "skill_category": profile.skill_category if profile else "",
        "skills": profile.skills if profile else [],
        "city": collab_location.get("city"),
        "state": collab_location.get("state"),
        "country": country,
        "country_code": country_code,
        "rate_display": get_rate_display(profile),
        "profile_picture": profile_picture_url,
        "rating": rating,
        "reviews": reviews,
        "total_earnings": float(total_earnings),
    }
})

    return result
# ==========================================================
# COLLABORATOR ALL CONTRACTS COUNT
# ==========================================================
@router.get("/collaborator-all-contracts")
def get_collaborator_all_contracts_count(collaborator_id: int, user_id: int):
    ensure_db_connection()

    try:
        current_user = UserData.objects.get(id=user_id)
        collaborator = UserData.objects.get(id=collaborator_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    all_contracts_count = Contract.objects.filter(
        creator=current_user,
        collaborator=collaborator
    ).count()

    return {
        "count": all_contracts_count,
        "collaborator_id": collaborator_id,
        "user_id": user_id
    }


# ==========================================================
# UPDATE CONTRACT STATUS + NOTIFICATIONS
# ==========================================================
@router.put("/{contract_id}/status")
def update_contract_status(
    contract_id: int,
    user_id: int,
    status: str = Query(
        ...,
        description="New status: pending, awaiting, in_progress, completed, cancelled"
    ),
    status_reason: Optional[str] = Query(
        None,
        description="Required reason when status is 'pending' or 'cancelled'"
    ),
):
    ensure_db_connection()

    try:
        contract = Contract.objects.get(id=contract_id)
        user = UserData.objects.get(id=user_id)

    except Contract.DoesNotExist:
        raise HTTPException(status_code=404, detail="Contract not found")

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    if contract.collaborator != user:
        raise HTTPException(
            status_code=403,
            detail="Only the collaborator can update contract status"
        )

    allowed_statuses = [
        "pending",
        "awaiting",
        "in_progress",
        "completed",
        "cancelled"
    ]

    new_status = status.lower()

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed values: {', '.join(allowed_statuses)}"
        )

    old_status = contract.status

    if new_status in ["pending", "cancelled", "awaiting"]:
        if not status_reason or not status_reason.strip():
            raise HTTPException(
                status_code=400,
                detail=f"A reason is required when setting status to '{new_status}'"
            )

        contract.status_reason = status_reason.strip()

    else:
        contract.status_reason = None

    if new_status == "completed":
        new_status = "pending"
        status_message = "Work marked as pending for creator approval"

    else:
        status_message = f"Contract status updated to {new_status}"

    contract.status = new_status
    contract.save()

    job_title = (
        contract.job.title
        if contract.job and contract.job.title
        else "Project"
    )

    notification_messages = {
        "pending": (
            f"{contract.collaborator.full_name} moved "
            f"'{job_title}' to Pending"
        ),

        "awaiting": (
            f"{contract.collaborator.full_name} moved "
            f"'{job_title}' to Awaiting"
        ),

        "in_progress": (
            f"{contract.collaborator.full_name} started working on "
            f"'{job_title}'"
        ),

        "cancelled": (
            f"{contract.collaborator.full_name} cancelled "
            f"'{job_title}'"
        ),
    }

    creator_message = notification_messages.get(
        new_status,
        f"{contract.collaborator.full_name} updated the contract status"
    )

    collaborator_message = (
        f"'{job_title}' status changed from "
        f"{old_status} to {new_status}"
    )

    try:
        create_notification(
            user=contract.creator,
            sender=contract.collaborator,
            notification_type="contract_updated",
            title="Contract Status Updated",
            message=creator_message,
            contract=contract,
            job=contract.job,
            url="/activecontracts"
        )

        create_notification(
            user=contract.collaborator,
            sender=contract.creator,
            notification_type="contract_updated",
            title="Contract Status Updated",
            message=collaborator_message,
            contract=contract,
            job=contract.job,
            url="/all-contacts"
        )

    except Exception as notification_error:
        print(f"Notification Error: {notification_error}")

    return {
        "message": status_message,
        "contract_id": contract.id,
        "status": contract.status,
        "status_reason": contract.status_reason,
        "old_status": old_status
    }


# ==========================================================
# DELETE CONTRACT
# ==========================================================
@router.delete("/{contract_id}/delete")
def delete_contract(contract_id: int, user_id: int):
    ensure_db_connection()

    try:
        current_user = UserData.objects.get(id=user_id)
        contract = Contract.objects.get(id=contract_id)
    except (UserData.DoesNotExist, Contract.DoesNotExist):
        raise HTTPException(status_code=404, detail="User or Contract not found")

    if contract.creator != current_user and contract.collaborator != current_user:
        raise HTTPException(status_code=403, detail="Not authorized to delete this contract")

    job_id = contract.job_id
    contract.delete()

    other_contracts = Contract.objects.filter(job_id=job_id).exists()
    if not other_contracts:
        update_job_contract_status(job_id, False)

    return {"message": "Contract deleted successfully", "job_id": job_id}


# ==========================================================
# GET JOB CONTRACT STATUS
# ==========================================================
@router.get("/job-contract-status/{job_id}")
def get_job_contract_status(job_id: int):
    ensure_db_connection()

    try:
        job = JobPost.objects.get(id=job_id)
        return {
            "job_id": job_id,
            "has_contract": job.has_contract,
            "contract_count": Contract.objects.filter(job_id=job_id).count()
        }
    except JobPost.DoesNotExist:
        raise HTTPException(status_code=404, detail="Job not found")


# ==========================================================
# REQUEST REVISION
# ==========================================================
@router.post("/{id}/request-revision")
def request_revision(
    id: int,
    user_id: int,
    description: str = Form("")
):
    ensure_db_connection()

    try:
        contract = Contract.objects.get(id=id)
        user = UserData.objects.get(id=user_id)
    except (Contract.DoesNotExist, UserData.DoesNotExist):
        raise HTTPException(status_code=404, detail="Contract or User not found")

    if contract.creator != user:
        raise HTTPException(status_code=403, detail="Only the creator can request a revision")

    if contract.status != "in_review":
        raise HTTPException(status_code=400, detail="Contract must be in review to request revision")

    if not description or not description.strip():
        raise HTTPException(status_code=400, detail="Revision description is required")

    contract.status = "in_progress"
    contract.revision_description = description.strip()
    contract.work_description = None
    contract.work_submitted_at = None
    contract.external_file_link = None
    contract.work_attachment = None
    contract.save()

    return {
        "message": "Revision requested successfully",
        "contract_id": contract.id,
        "status": contract.status,
        "revision_description": contract.revision_description
    }


# ==========================================================
# REPOST JOB AFTER CANCELLATION
# ==========================================================
@router.post("/{contract_id}/repost-job")
def repost_job_after_cancellation(contract_id: int, user_id: int):
    """
    Creator re-opens a job after a collaborator cancels.
    - Deletes the cancelled contract
    - Rejects collaborator's proposals and invitations
    - Rejects other active proposals
    - Sets job status back to posted with has_contract = False
    """
    ensure_db_connection()

    try:
        contract = Contract.objects.get(id=contract_id)
        user = UserData.objects.get(id=user_id)
    except (Contract.DoesNotExist, UserData.DoesNotExist):
        raise HTTPException(
            status_code=404,
            detail="Contract or User not found"
        )

    if contract.creator != user:
        raise HTTPException(
            status_code=403,
            detail="Only the creator can re-post this job"
        )

    if contract.status != "cancelled":
        raise HTTPException(
            status_code=400,
            detail="Can only re-post from a cancelled contract"
        )

    job = contract.job
    collaborator = contract.collaborator

    # Reject all proposals from the cancelled collaborator
    rejected_proposals = Proposal.objects.filter(
        job=job,
        freelancer=collaborator,
        status__in=["accepted", "submitted"]
    )

    rejected_proposals_count = rejected_proposals.count()

    if rejected_proposals_count > 0:
        rejected_proposals.update(status="rejected")
        print(
            f"✅ Rejected {rejected_proposals_count} proposal(s) "
            f"for collaborator {collaborator.id}"
        )

    # Reject all invitations for the cancelled collaborator
    invitations = Invitation.objects.filter(
        job=job,
        receiver=collaborator,
        status__in=["Pending", "Accepted"]
    )

    invitations_count = invitations.count()

    if invitations_count > 0:
        invitations.update(status="Rejected")
        print(f"✅ Rejected {invitations_count} invitation(s)")

    # Delete cancelled contract
    contract.delete()

    other_active = Contract.objects.filter(
        job=job,
        status__in=[
            "awaiting",
            "in_progress",
            "in_review",
            "pending"
        ]
    ).exists()

    if not other_active:
        # Reject remaining submitted/accepted proposals
        other_proposals = Proposal.objects.filter(
            job=job,
            status__in=["submitted", "accepted"]
        ).exclude(
            freelancer=collaborator
        )

        other_proposals_count = other_proposals.count()

        if other_proposals_count > 0:
            other_proposals.update(status="rejected")
            print(
                f"✅ Rejected {other_proposals_count} other proposal(s)"
            )

        job.has_contract = False
        job.status = "posted"
        job.save(update_fields=["has_contract", "status"])

        print(f"✅ Job {job.id} re-posted")

    return {
        "message": "Job re-posted successfully",
        "job_id": job.id,
        "job_status": job.status,
        "contract_deleted": True,
        "proposals_rejected": rejected_proposals_count,
        "invitations_rejected": invitations_count
    }


# ==========================================================
# DOWNLOAD MILESTONE ATTACHMENT
# ==========================================================
@router.get("/{contract_id}/milestones/{milestone_index}/download-attachment")
def download_milestone_attachment(
    contract_id: int,
    milestone_index: int,
    user_id: int = Query(...),
):
    ensure_db_connection()
    
    try:
        contract = Contract.objects.get(id=contract_id)
        user = UserData.objects.get(id=user_id)
    except (Contract.DoesNotExist, UserData.DoesNotExist):
        raise HTTPException(status_code=404, detail="Contract or User not found")
    
    if user not in [contract.creator, contract.collaborator]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if not contract.milestones_data or milestone_index >= len(contract.milestones_data):
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    milestone = contract.milestones_data[milestone_index]
    
    if not milestone.get('submission') or not milestone['submission'].get('attachment'):
        raise HTTPException(status_code=404, detail="No attachment found for this milestone")
    
    attachment_path = milestone['submission']['attachment']
    filename = milestone['submission'].get('attachment_name', f'milestone_{milestone_index + 1}_work')
    
    use_s3 = os.getenv("USE_S3", "False").lower() == "true"
    
    if use_s3:
        # ========== S3 STORAGE ==========
        from fastapi_app.routes.storage import read_file_bytes
        try:
            s3_key = attachment_path.lstrip('/')
            file_content = read_file_bytes(s3_key)
            
            # Return the file directly without redirect
            return StreamingResponse(
                io.BytesIO(file_content),
                media_type='application/octet-stream',
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "Content-Type": "application/octet-stream"
                }
            )
        except Exception as e:
            print(f"Error downloading from S3: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to download file: {str(e)}")
    else:
        # ========== LOCAL STORAGE ==========
        full_path = os.path.join(settings.MEDIA_ROOT, attachment_path)
        
        if not os.path.exists(full_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            path=full_path,
            filename=filename,
            media_type='application/octet-stream'
        )