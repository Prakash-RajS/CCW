import json
from enum import Enum
from fastapi import APIRouter, Form, UploadFile, File, HTTPException
import os
from django.conf import settings
from creator_app.models import JobPost, UserData, Proposal
 
router = APIRouter(prefix="/proposals", tags=["Proposals"])
BASE_DIR = settings.BASE_DIR
 
# --- Dropdown Choice ---
class PaymentTypeEnum(str, Enum):
    project = "project"
    milestone = "milestone"
 
# ============================================================
# 1. CREATE PROPOSAL (Fixed Bid Amount Logic)
# ============================================================
@router.post("/CreateProposal")
def create_proposal(
    job_id: int = Form(...),
    freelancer_id: int = Form(...),
   
    # 1. Payment Type
    payment_type: PaymentTypeEnum = Form(...),
   
    # 2. Amounts (Now Independent)
    bid_amount: float = Form(None),       # Total Project Cost
   
    # 3. New Milestone Columns
    milestone_description: str = Form(None),
    milestone_due_date: str = Form(None),
    milestone_amount: float = Form(None), # Single Milestone Cost
 
    duration: str = Form(None),
    cover_letter: str = Form(None),
    skills: str = Form(None),    
    expertise: str = Form(None),
    attachments: list[UploadFile] = File(None),
):
    try:
        # --- VALIDATION LOGIC ---
       
        # Rule 1: Validate Milestone Fields
        if payment_type == PaymentTypeEnum.milestone:
            if not milestone_description or not milestone_due_date or not milestone_amount:
                raise HTTPException(status_code=400, detail="For Milestone payments, Description, Due Date, and Milestone Amount are required.")
           
            # Ensure Total Bid is also provided (Usually Total >= Milestone)
            if bid_amount is None:
                raise HTTPException(status_code=400, detail="Please enter the Total Bid Amount for the project.")
 
        # Rule 2: Validate Project Fields
        else:
            if bid_amount is None:
                raise HTTPException(status_code=400, detail="Bid Amount is required for Project payment.")
 
        # -----------------------------
 
        # 1. Validate User & Job
        try:
            freelancer = UserData.objects.get(id=freelancer_id)
            job = JobPost.objects.get(id=job_id)
        except (UserData.DoesNotExist, JobPost.DoesNotExist):
            raise HTTPException(status_code=404, detail="User or Job not found")
 
        # 2. Check duplicate
        if Proposal.objects.filter(job=job, freelancer=freelancer).exists():
            raise HTTPException(status_code=400, detail="You have already applied for this job.")
 
        # 3. Process Skills
        skills_list = [s.strip() for s in skills.split(',')] if skills else []
 
        # 4. Create Proposal (Saving variables independently)
        proposal = Proposal.objects.create(
            job=job,
            freelancer=freelancer,
            payment_type=payment_type.value,
           
            # FIX: Now saves exactly what you typed in the bid_amount box
            bid_amount=bid_amount,    
           
            # Save Milestone Data
            milestone_description=milestone_description,
            milestone_due_date=milestone_due_date,
            milestone_amount=milestone_amount,
 
            duration=duration or "",
            cover_letter=cover_letter or "",
            skills=skills_list,
            expertise=expertise or "",
            status="submitted"
        )
 
        # 5. Save Attachments
        if attachments:
            upload_dir = os.path.join(BASE_DIR, "fastapi_app", "proposal_attachments")
            os.makedirs(upload_dir, exist_ok=True)
            uploaded_files = []
            for file in attachments:
                if file.filename:
                    save_path = os.path.join(upload_dir, file.filename)
                    with open(save_path, "wb") as f:
                        f.write(file.file.read())
                    uploaded_files.append(f"proposal_attachments/{file.filename}")
           
            proposal.attachments = uploaded_files
            proposal.save()
 
        return {"message": "Proposal submitted successfully", "proposal_id": proposal.id}
 
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ============================================================
# 2. LIST PROPOSALS
# ============================================================
@router.get("/GetProposalsByJob/{job_id}")
def get_proposals_by_job(job_id: int):
    try:
        if not JobPost.objects.filter(id=job_id).exists():
            raise HTTPException(status_code=404, detail="Job not found")
       
        job = JobPost.objects.get(id=job_id)
        client_budget_info = f"{job.budget_type} - ${job.budget_from or 0}"
 
        proposals = Proposal.objects.filter(job_id=job_id).order_by("-created_at")
       
        data = []
        for p in proposals:
            data.append({
                "id": p.id,
                "freelancer_name": f"{p.freelancer.first_name} {p.freelancer.last_name}",
                "payment_type": p.payment_type,
               
                "bid_amount": p.bid_amount,             # Total Project Cost
                "milestone_amount": p.milestone_amount, # Milestone Cost
               
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
 
        return {
            "job_id": job_id,
            "client_budget": client_budget_info,
            "count": len(data),
            "proposals": data
        }
 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
 
# ============================================================
# 3. LIST MY PROPOSALS
# ============================================================
@router.get("/GetMyProposals/{freelancer_id}")
def get_my_proposals(freelancer_id: int):
    try:
        proposals = Proposal.objects.filter(freelancer_id=freelancer_id).order_by("-created_at")
        data = []
        for p in proposals:
            data.append({
                "id": p.id,
                "job_title": p.job.title,
                "bid_amount": p.bid_amount,
                "payment_type": p.payment_type,
                "status": p.status,
                "skills": p.skills,
                "created_at": p.created_at
            })
        return {"proposals": data}
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))
 
 
# ============================================================
# 4. EDIT PROPOSAL
# ============================================================
@router.put("/EditProposal/{proposal_id}")
def edit_proposal(
    proposal_id: int,
    bid_amount: float | None = Form(None),
    duration: str | None = Form(None),
    cover_letter: str | None = Form(None),
    skills: str | None = Form(None),
    expertise: str | None = Form(None),
    payment_type: PaymentTypeEnum = Form(None),
   
    milestone_description: str = Form(None),
    milestone_due_date: str = Form(None),
    milestone_amount: float = Form(None),
   
    attachments: list[UploadFile] = File(None)
):
    try:
        proposal = Proposal.objects.get(id=proposal_id)
        if proposal.status == "withdrawn":
            raise HTTPException(status_code=400, detail="Cannot edit withdrawn proposal.")
 
        if payment_type is not None: proposal.payment_type = payment_type.value
       
        # FIX: Update independently
        if bid_amount is not None: proposal.bid_amount = bid_amount
        if milestone_amount is not None: proposal.milestone_amount = milestone_amount
       
        if duration is not None: proposal.duration = duration
        if cover_letter is not None: proposal.cover_letter = cover_letter
        if expertise is not None: proposal.expertise = expertise
       
        if milestone_description is not None: proposal.milestone_description = milestone_description
        if milestone_due_date is not None: proposal.milestone_due_date = milestone_due_date
 
        if skills is not None:
            proposal.skills = [s.strip() for s in skills.split(',')] if skills else []
 
        if attachments:
            upload_dir = os.path.join(BASE_DIR, "fastapi_app", "proposal_attachments")
            os.makedirs(upload_dir, exist_ok=True)
            uploaded_files = []
            for file in attachments:
                if file.filename:
                    save_path = os.path.join(upload_dir, file.filename)
                    with open(save_path, "wb") as f:
                        f.write(file.file.read())
                    uploaded_files.append(f"proposal_attachments/{file.filename}")
            proposal.attachments = uploaded_files
 
        proposal.save()
        return {"message": "Proposal updated", "id": proposal.id}
 
    except Proposal.DoesNotExist:
        raise HTTPException(status_code=404, detail="Proposal not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

    # ============================================================
# 5. WITHDRAW PROPOSAL (DELETE)
# ============================================================
@router.delete("/WithdrawProposal/{proposal_id}")
def withdraw_proposal(proposal_id: int):
    try:
        proposal = Proposal.objects.get(id=proposal_id)
        proposal.delete()
        return {"message": "Proposal deleted successfully"}
    except Proposal.DoesNotExist:
        raise HTTPException(status_code=404, detail="Proposal not found")

