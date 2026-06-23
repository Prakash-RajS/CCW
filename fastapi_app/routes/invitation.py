from datetime import date, timedelta
import logging
import os

import fastapi_app.django_setup

from fastapi import APIRouter, Form, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from creator_app.models import CollaboratorProfile, Invitation, Proposal, UserData, Contract, JobPost

from fastapi_app.routes.dbconnection import ensure_db_connection, check_db_connection

# ✅ FIXED: import from plan_limits, not plan_guard
from fastapi_app.routes.plan_guard import check_invite_limit
from fastapi_app.services.notification_service import create_notification
from fastapi_app.routes.storage import get_profile_pic_url, build_full_url

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/invitations", tags=["Invitations"])


# ==========================================================
# HELPER: GET PROFILE PICTURE URL WITH S3 SUPPORT
# ==========================================================
def get_profile_picture_url(request: Request, user: UserData) -> str | None:
    """
    Get profile picture URL with S3 support.
    Handles both S3 and local storage based on USE_S3 environment variable.
    """
    if not user or not user.profile_picture:
        return None
    
    stored_path = str(user.profile_picture)
    
    # If it's already a full URL (S3 presigned URL or external)
    if stored_path.startswith(('http://', 'https://')):
        return stored_path
    
    # Get the key (remove leading slash)
    s3_key = stored_path.lstrip('/')
    
    # Check if we should use S3
    use_s3_env = os.getenv("USE_S3", "False").lower() == "true"
    
    if use_s3_env:
        # Try S3 presigned URL
        file_url = get_profile_pic_url(s3_key)
        if file_url:
            return file_url
    
    # Fallback to local media path
    base_url = str(request.base_url).rstrip('/')
    pic_path = stored_path.lstrip('/')
    return f"{base_url}/media/{pic_path}"


# ==========================================================
# HELPER: GET PROFILE PICTURE URL WITHOUT REQUEST
# ==========================================================
def get_profile_picture_url_sync(base_url: str, user: UserData) -> str | None:
    """
    Get profile picture URL with S3 support (sync version for threadpool).
    """
    if not user or not user.profile_picture:
        return None
    
    stored_path = str(user.profile_picture)
    
    # If it's already a full URL (S3 presigned URL or external)
    if stored_path.startswith(('http://', 'https://')):
        return stored_path
    
    # Get the key (remove leading slash)
    s3_key = stored_path.lstrip('/')
    
    # Check if we should use S3
    use_s3_env = os.getenv("USE_S3", "False").lower() == "true"
    
    if use_s3_env:
        # Try S3 presigned URL
        file_url = get_profile_pic_url(s3_key)
        if file_url:
            return file_url
    
    # Fallback to local media path
    pic_path = stored_path.lstrip('/')
    return f"{base_url}/media/{pic_path}"


# ==========================================================
# CREATE INVITATION (UPDATED WITH COUNTER)
# ==========================================================
def _create_invitation_sync(
    sender_id: int,
    receiver_id: int,
    job_id: int,
    client_name: str,
    project_name: str,
    date: str,
    revenue: float
):
    ensure_db_connection()

    try:
        sender = UserData.objects.get(id=sender_id)
        receiver = UserData.objects.get(id=receiver_id)
        job = JobPost.objects.get(id=job_id)

        logger.info(f"Creating invitation: sender={sender_id}, receiver={receiver_id}, job={job_id}")

        if job.has_contract:
            raise HTTPException(
                status_code=400,
                detail="This job already has a contract. Cannot invite more collaborators."
            )
        
        existing_proposal = Proposal.objects.filter(
            freelancer=receiver,
            job=job,
            status__in=["submitted", "accepted"]
        ).first()
        
        if existing_proposal:
            raise HTTPException(
                status_code=400,
                detail="This collaborator has already submitted a proposal for this job. Cannot invite them."
            )

        # 🔒 PLAN CHECK – Check invitation limit
        check_invite_limit(sender)

        existing_invitation = Invitation.objects.filter(
            sender=sender,
            receiver=receiver,
            job=job,
            status="Pending"
        ).first()
        
        if existing_invitation:
            raise HTTPException(
                status_code=400,
                detail="This collaborator already has a pending invitation for this job."
            )

        invitation = Invitation.objects.create(
            sender=sender,
            receiver=receiver,
            job=job,
            client_name=client_name,
            project_name=project_name,
            date=date,
            revenue=revenue
        )

        # ✅ INCREMENT INVITATION COUNTER
        sender.total_invitations_sent += 1
        sender.save()

        logger.info(f"Invitation created: ID={invitation.id}")
        
        # CREATE INVITATION NOTIFICATION
        create_notification(
            user=receiver,
            sender=sender,
            notification_type='invitation_received',
            title=f'Invitation from {sender.full_name or sender.email}',
            message=f'You received an invitation for {project_name}',
            url='/all-contacts'
        )
     
        logger.info(f"🔔 Invitation notification created for {receiver.email}")

        return {
            "message": "Invitation created",
            "id": invitation.id,
            "status": invitation.status,
            "stats": {
                "total_invitations_sent": sender.total_invitations_sent
            }
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except JobPost.DoesNotExist:
        raise HTTPException(status_code=404, detail="Job not found")


@router.post("/create")
async def create_invitation(
    request: Request,
    sender_id: int = Form(...),
    receiver_id: int = Form(...),
    job_id: int = Form(...),
    client_name: str = Form(...),
    project_name: str = Form(...),
    date: str = Form(...),
    revenue: float = Form(...)
):
    logger.info(f"📨 Invitation request: sender={sender_id}, receiver={receiver_id}, job={job_id}")

    try:
        result = await run_in_threadpool(
            _create_invitation_sync,
            sender_id, receiver_id, job_id,
            client_name, project_name, date, revenue
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error creating invitation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


def _list_invitations_sync(user_id: int, base_url: str):
    ensure_db_connection()

    invitations = Invitation.objects.filter(receiver_id=user_id).select_related('sender').order_by("-id")

    result = []
    for inv in invitations:
        sender_profile_pic = None
        if inv.sender and inv.sender.profile_picture:
            sender_profile_pic = get_profile_picture_url_sync(base_url, inv.sender)
        
        result.append({
            "id": inv.id,
            "sender_id": inv.sender_id,
            "sender_name": inv.sender.full_name or inv.sender.email.split('@')[0] if inv.sender else "Unknown",
            "sender_profile_pic": sender_profile_pic,
            "job_id": inv.job_id,
            "client_name": inv.client_name,
            "project_name": inv.project_name,
            "date": inv.date,
            "revenue": inv.revenue,
            "status": inv.status
        })

    return {
        "count": len(result),
        "invitations": result
    }


@router.get("/list/{user_id}")
async def list_invitations(user_id: int, request: Request):
    base_url = str(request.base_url).rstrip('/')
    try:
        return await run_in_threadpool(_list_invitations_sync, user_id, base_url)
    except Exception as e:
        logger.error(f"Error listing invitations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def _list_sent_invitations_sync(creator_id: int, base_url: str):
    ensure_db_connection()

    creator = UserData.objects.get(id=creator_id)

    invitations = Invitation.objects.filter(
        sender_id=creator_id
    ).select_related('receiver', 'job').order_by("-id")

    result = []
    for inv in invitations:
        receiver_name = "Collaborator"
        if inv.receiver:
            if inv.receiver.full_name:
                receiver_name = inv.receiver.full_name.strip()
            elif inv.receiver.email:
                receiver_name = inv.receiver.email.split('@')[0]

        receiver_profile_pic = None
        if inv.receiver and inv.receiver.profile_picture:
            receiver_profile_pic = get_profile_picture_url_sync(base_url, inv.receiver)

        receiver_skills = []
        receiver_skill_category = None
        if inv.receiver:
            try:
                profile = CollaboratorProfile.objects.get(user=inv.receiver)
                receiver_skill_category = profile.skill_category
                if profile.skills:
                    receiver_skills = (
                        profile.skills if isinstance(profile.skills, list)
                        else [s.strip() for s in profile.skills.split(',') if s.strip()]
                    )
            except CollaboratorProfile.DoesNotExist:
                pass

        job_details = {}
        if inv.job:
            job_details = {
                "id": inv.job.id,
                "title": inv.job.title,
                "description": inv.job.description,
                "skills": inv.job.skills if isinstance(inv.job.skills, list) else (inv.job.skills.split(',') if inv.job.skills else []),
                "duration": inv.job.duration,
                "expertise_level": inv.job.expertise_level,
                "budget_type": inv.job.budget_type,
                "budget_from": float(inv.job.budget_from) if inv.job.budget_from else None,
                "budget_to": float(inv.job.budget_to) if inv.job.budget_to else None,
            }

        result.append({
            "id": inv.id,
            "receiver_id": inv.receiver_id,
            "receiver_name": receiver_name,
            "receiver_profile_pic": receiver_profile_pic,
            "receiver_skills": receiver_skills,
            "receiver_skill_category": receiver_skill_category,
            "job_id": inv.job_id,
            "job_title": inv.job.title if inv.job else "Unknown Job",
            "job_details": job_details,
            "client_name": inv.client_name,
            "project_name": inv.project_name,
            "date": inv.date,
            "revenue": float(inv.revenue) if inv.revenue else 0,
            "status": inv.status,
            "created_at": inv.created_at.isoformat() if hasattr(inv, 'created_at') and inv.created_at else None
        })

    return {"count": len(result), "invitations": result}


@router.get("/sent/{creator_id}")
async def list_sent_invitations(creator_id: int, request: Request):
    base_url = str(request.base_url).rstrip('/')
    try:
        return await run_in_threadpool(_list_sent_invitations_sync, creator_id, base_url)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Creator not found")
    except Exception as e:
        logger.error(f"Error in list_sent_invitations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def _update_invitation_status_sync(invitation_id: int, status: str):
    ensure_db_connection()

    try:
        invitation = Invitation.objects.get(id=invitation_id)
    except Invitation.DoesNotExist:
        raise HTTPException(status_code=404, detail="Invitation not found")

    old_status = invitation.status

    if status.lower() == "revoked":
        invitation.delete()
        return {"message": "Invitation revoked and deleted", "status": "revoked", "deleted": True}

    invitation.status = status.capitalize()
    invitation.save()

    if status.lower() == "accepted" and old_status.lower() != "accepted":
        if not invitation.job_id:
            raise HTTPException(status_code=400, detail="Invitation has no job linked.")

        start_date = date.today()

        def calculate_end_date_from_job(start_date, job):
            if not start_date or not job:
                return start_date + timedelta(days=30)

            duration_str = job.duration.lower()
            import re
            numbers = [int(n) for n in re.findall(r'\d+', duration_str)]

            if 'year' in duration_str or 'yr' in duration_str:
                years = numbers[0] if numbers else 1
                return start_date + timedelta(days=years * 365)
            elif 'month' in duration_str:
                months = numbers[0] if numbers else 1
                return start_date + timedelta(days=months * 30)
            elif 'week' in duration_str:
                weeks = numbers[0] if numbers else 1
                return start_date + timedelta(weeks=weeks)
            elif 'day' in duration_str:
                days = numbers[0] if numbers else 1
                return start_date + timedelta(days=days)
            else:
                return start_date + timedelta(days=30)

        end_date = calculate_end_date_from_job(start_date, invitation.job)

        contract, created = Contract.objects.get_or_create(
            job=invitation.job,
            creator=invitation.sender,
            collaborator=invitation.receiver,
            defaults={
                "budget": invitation.revenue,
                "description": invitation.project_name,
                "status": "awaiting",
                "start_date": start_date,
                "end_date": end_date
            }
        )

        # ✅ INCREMENT CONTRACT COUNTER when invitation creates a contract
        creator = invitation.sender
        creator.total_contracts_created += 1
        creator.save()

        if not created:
            updated = False
            if not contract.start_date:
                contract.start_date = start_date
                updated = True
            if not contract.end_date:
                contract.end_date = end_date
                updated = True
            if updated:
                contract.save()

        if invitation.job:
            invitation.job.has_contract = True
            invitation.job.save(update_fields=['has_contract'])

        # Auto-reject all pending proposals for this job
        Proposal.objects.filter(
            job=invitation.job,
            status="submitted"
        ).update(status="rejected")

        # Auto-cancel other pending invitations for this job
        Invitation.objects.filter(
            job=invitation.job,
            status="Pending"
        ).exclude(id=invitation_id).update(status="Rejected")

    return {"message": "Invitation updated", "status": invitation.status}


@router.put("/update-status")
async def update_invitation_status(invitation_id: int, status: str):
    try:
        return await run_in_threadpool(_update_invitation_status_sync, invitation_id, status)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating invitation status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


def _check_invited_jobs_sync(collaborator_id: int, creator_id: int):
    ensure_db_connection()

    invitations = Invitation.objects.filter(
        receiver_id=collaborator_id,
        sender_id=creator_id
    ).select_related('job')

    invited_job_ids = [inv.job_id for inv in invitations if inv.job_id]

    logger.info(f"Found {len(invited_job_ids)} invited jobs for collaborator {collaborator_id} from creator {creator_id}")

    return {
        "collaborator_id": collaborator_id,
        "creator_id": creator_id,
        "invited_jobs": invited_job_ids,
        "count": len(invited_job_ids)
    }


@router.get("/check-invited/{collaborator_id}/{creator_id}")
async def check_invited_jobs(collaborator_id: int, creator_id: int):
    try:
        return await run_in_threadpool(_check_invited_jobs_sync, collaborator_id, creator_id)
    except Exception as e:
        logger.error(f"Error checking invited jobs: {str(e)}")
        return {
            "collaborator_id": collaborator_id,
            "creator_id": creator_id,
            "invited_jobs": [],
            "count": 0,
            "error": str(e)
        }


def _get_invitation_sync(invitation_id: int, user_id: int, base_url: str):
    ensure_db_connection()

    try:
        invitation = Invitation.objects.get(id=invitation_id)
    except Invitation.DoesNotExist:
        raise HTTPException(status_code=404, detail="Invitation not found")

    if user_id and invitation.receiver_id != user_id and invitation.sender_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    def _get_display_name(user, fallback="Unknown"):
        if not user:
            return fallback
        return user.full_name or user.email.split('@')[0] if user.email else fallback

    receiver_profile_pic = None
    if invitation.receiver and invitation.receiver.profile_picture:
        receiver_profile_pic = get_profile_picture_url_sync(base_url, invitation.receiver)

    receiver_skills = []
    receiver_skill_category = None
    if invitation.receiver:
        try:
            profile = CollaboratorProfile.objects.get(user=invitation.receiver)
            receiver_skill_category = profile.skill_category
            if profile.skills:
                receiver_skills = (
                    profile.skills if isinstance(profile.skills, list)
                    else [s.strip() for s in profile.skills.split(',') if s.strip()]
                )
        except CollaboratorProfile.DoesNotExist:
            pass

    job_details = {}
    if invitation.job:
        job_details = {
            "id": invitation.job.id,
            "title": invitation.job.title,
            "description": invitation.job.description,
            "skills": invitation.job.skills if isinstance(invitation.job.skills, list) else (invitation.job.skills.split(',') if invitation.job.skills else []),
            "duration": invitation.job.duration,
            "expertise_level": invitation.job.expertise_level,
            "budget_type": invitation.job.budget_type,
            "budget_from": float(invitation.job.budget_from) if invitation.job.budget_from else None,
            "budget_to": float(invitation.job.budget_to) if invitation.job.budget_to else None,
        }

    return {
        "id": invitation.id,
        "sender_id": invitation.sender_id,
        "sender_name": _get_display_name(invitation.sender, "Client"),
        "receiver_id": invitation.receiver_id,
        "receiver_name": _get_display_name(invitation.receiver, "Collaborator"),
        "receiver_profile_pic": receiver_profile_pic,
        "receiver_skills": receiver_skills,
        "receiver_skill_category": receiver_skill_category,
        "job_id": invitation.job_id,
        "job_title": invitation.job.title if invitation.job else None,
        "job_details": job_details,
        "client_name": invitation.client_name,
        "project_name": invitation.project_name,
        "description": getattr(invitation, 'description', None),
        "date": invitation.date,
        "revenue": float(invitation.revenue) if invitation.revenue else 0,
        "budget": float(invitation.revenue) if invitation.revenue else 0,
        "status": invitation.status,
        "created_at": invitation.created_at.isoformat() if hasattr(invitation, 'created_at') and invitation.created_at else None
    }


@router.get("/{invitation_id}")
async def get_invitation(invitation_id: int, user_id: int = None, request: Request = None):
    base_url = str(request.base_url).rstrip('/') if request else ""
    try:
        return await run_in_threadpool(_get_invitation_sync, invitation_id, user_id, base_url)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting invitation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))