import fastapi_app.django_setup

from fastapi import APIRouter, Form, HTTPException
from creator_app.models import Invitation, UserData, Contract, JobPost

# ✅ FIXED IMPORT (THIS IS THE REAL ISSUE)
from fastapi_app.routes.plan_guard import check_invite_limit

router = APIRouter(prefix="/invitations", tags=["Invitations"])


# 1️⃣ CREATE INVITATION (Creator → Collaborator)
@router.post("/create")
def create_invitation(
    sender_id: int = Form(...),
    receiver_id: int = Form(...),
    job_id: int = Form(...),
    client_name: str = Form(...),
    project_name: str = Form(...),
    date: str = Form(...),
    revenue: float = Form(...)
):
    try:
        sender = UserData.objects.get(id=sender_id)
        receiver = UserData.objects.get(id=receiver_id)
        job = JobPost.objects.get(id=job_id)

        # 🔒 PLAN CHECK – INVITE LIMIT
        check_invite_limit(sender)

        invitation = Invitation.objects.create(
            sender=sender,
            receiver=receiver,
            job=job,
            client_name=client_name,
            project_name=project_name,
            date=date,
            revenue=revenue
        )

        return {
            "message": "Invitation created",
            "id": invitation.id,
            "status": invitation.status
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    except JobPost.DoesNotExist:
        raise HTTPException(status_code=404, detail="Job not found")


# 2️⃣ LIST INVITATIONS FOR A COLLABORATOR
@router.get("/list/{user_id}")
def list_invitations(user_id: int):
    invitations = Invitation.objects.filter(
        receiver_id=user_id
    ).order_by("-id")

    return {
        "count": invitations.count(),
        "invitations": [
            {
                "id": inv.id,
                "sender_id": inv.sender_id,
                "client_name": inv.client_name,
                "project_name": inv.project_name,
                "date": inv.date,
                "revenue": inv.revenue,
                "status": inv.status
            }
            for inv in invitations
        ]
    }


# 3️⃣ UPDATE STATUS (Accept / Reject / Complete)
@router.put("/update-status")
def update_invitation_status(
    invitation_id: int = Form(...),
    status: str = Form(...)
):
    try:
        invitation = Invitation.objects.get(id=invitation_id)
    except Invitation.DoesNotExist:
        raise HTTPException(status_code=404, detail="Invitation not found")

    invitation.status = status.capitalize()
    invitation.save()

    # ✅ Create contract when invitation is accepted
    if status.lower() == "accepted":
        if not invitation.job_id:
            raise HTTPException(
                status_code=400,
                detail="Invitation has no job linked. Cannot create contract."
            )

        Contract.objects.get_or_create(
            job=invitation.job,
            creator=invitation.sender,
            collaborator=invitation.receiver,
            defaults={
                "budget": invitation.revenue,
                "description": invitation.project_name,
                "status": "awaiting"
            }
        )

    return {"message": "Invitation updated"}

