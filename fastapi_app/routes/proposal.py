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
        if user.role == "creator":
            profile = CreatorProfile.objects.filter(user=user).first()
            if profile:
                return {
                    "location": profile.location or "",
                    "state": profile.state or "",
                    "city": profile.city or "",
                    "address": profile.address or ""
                }
        elif user.role == "collaborator":
            profile = CollaboratorProfile.objects.filter(user=user).first()
            if profile:
                return {
                    "location": profile.location or "",
                    "state": profile.state or "",
                    "city": profile.city or "",
                    "address": profile.address or ""
                }
    except Exception as e:
        print(f"Error getting user location: {e}")
    
    return {"location": "", "state": "", "city": "", "address": ""}


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
    """
    Update the has_contract field on a job
    """
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
# 1. CREATE PROPOSAL
# ============================================================
@router.post("/CreateProposal")
def create_proposal(
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
    Create a new proposal - Supports multiple milestones
    """
    try:
        ensure_db_connection()

        if not duration or not duration.strip():
            raise HTTPException(status_code=400, detail="Duration is required.")

        if not cover_letter or not cover_letter.strip():
            raise HTTPException(status_code=400, detail="Cover letter is required.")

        if bid_amount is None or bid_amount <= 0:
            raise HTTPException(status_code=400, detail="Bid amount must be greater than 0.")

        try:
            freelancer = UserData.objects.get(id=freelancer_id)
            job = JobPost.objects.get(id=job_id)
        except UserData.DoesNotExist:
            raise HTTPException(status_code=404, detail="User not found")
        except JobPost.DoesNotExist:
            raise HTTPException(status_code=404, detail="Job not found")

        if job.has_contract:
            raise HTTPException(
                status_code=400, 
                detail="This job already has a contract. Cannot submit proposals."
            )
        
        if Proposal.objects.filter(
    job=job,
    freelancer=freelancer,
    status="submitted"
).exists():       
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

        check_proposal_limit(freelancer)

        file_contents = []
        if attachments:
            total_new_bytes = 0
            for file in attachments:
                if file.filename:
                    content = file.file.read()
                    file_contents.append((file.filename, content))
                    total_new_bytes += len(content)
                else:
                    file_contents.append((None, None))

            if total_new_bytes > 0:
                check_storage_limit(freelancer, total_new_bytes)

        milestone_desc = None
        milestone_date = None
        milestone_amt = None
        
        if milestones_list and len(milestones_list) > 0:
            first_milestone = milestones_list[0]
            milestone_desc = first_milestone.get('description', '')
            milestone_date = first_milestone.get('due_date', None)
            milestone_amt = first_milestone.get('amount', 0)
        
        proposal = Proposal.objects.create(
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

        print(f"✅ Created proposal {proposal.id} with {len(milestones_list)} milestones")

        if file_contents:
            upload_dir = os.path.join(BASE_DIR, "fastapi_app", "proposal_attachments")
            os.makedirs(upload_dir, exist_ok=True)
            uploaded_files = []

            for filename, content in file_contents:
                if filename and content:
                    name, ext = os.path.splitext(filename)
                    unique_filename = f"{proposal.id}_{int(time.time())}_{name}{ext}"
                    save_path = os.path.join(upload_dir, unique_filename)
                    
                    with open(save_path, "wb") as f:
                        f.write(content)
                    
                    relative_path = f"proposal_attachments/{unique_filename}"
                    uploaded_files.append(relative_path)

                    track_file_upload(freelancer, save_path, len(content))

            proposal.attachments = uploaded_files
            proposal.save()

        return {
            "message": "Proposal submitted successfully",
            "proposal_id": proposal.id,
            "bid_amount": bid_amount,
            "payment_type": payment_type.value,
            "milestones": milestones_list if payment_type == PaymentTypeEnum.milestone else None,
            "milestones_count": len(milestones_list) if payment_type == PaymentTypeEnum.milestone else 0,
            "validation_passed": True
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Error in create_proposal: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
    

# ============================================================
# 2. LIST PROPOSALS
# ============================================================
@router.get("/GetProposalsByJob/{job_id}")
def get_proposals_by_job(job_id: int):
    try:
        ensure_db_connection()
        
        if not JobPost.objects.filter(id=job_id).exists():
            raise HTTPException(status_code=404, detail="Job not found")
       
        job = JobPost.objects.get(id=job_id)
        client_budget_info = f"{job.budget_type} - ${job.budget_from or 0}"
 
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
 
        return {
            "job_id": job_id,
            "client_budget": client_budget_info,
            "has_contract": job.has_contract,
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
        ensure_db_connection()
        
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
    bid_amount: float = Form(None),
    duration: str = Form(None),
    cover_letter: str = Form(None),
    skills: str = Form(None),
    expertise: str = Form(None),
    payment_type: PaymentTypeEnum = Form(None),
    milestones_json: str = Form(None),
    attachments: list[UploadFile] = File(None)
):
    try:
        ensure_db_connection()

        proposal = Proposal.objects.get(id=proposal_id)

        if proposal.job.has_contract:
            raise HTTPException(status_code=400, detail="Cannot edit proposal - job already has a contract.")

        if proposal.status == "withdrawn":
            raise HTTPException(status_code=400, detail="Cannot edit withdrawn proposal.")

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

        if attachments:
            file_contents = []
            total_new_bytes = 0
            for file in attachments:
                if file.filename:
                    content = file.file.read()
                    file_contents.append((file.filename, content))
                    total_new_bytes += len(content)

            old_bytes = 0
            if proposal.attachments:
                for old_path in proposal.attachments:
                    full_old_path = os.path.join(BASE_DIR, "fastapi_app", old_path)
                    if os.path.exists(full_old_path):
                        old_bytes += os.path.getsize(full_old_path)

            net_increase = max(0, total_new_bytes - old_bytes)
            if net_increase > 0:
                check_storage_limit(proposal.freelancer, net_increase)

            if old_bytes > 0:
                track_file_deletion(proposal.freelancer, old_bytes)

            upload_dir = os.path.join(BASE_DIR, "fastapi_app", "proposal_attachments")
            os.makedirs(upload_dir, exist_ok=True)
            uploaded_files = []

            for filename, content in file_contents:
                if filename and content:
                    save_path = os.path.join(upload_dir, filename)
                    with open(save_path, "wb") as f:
                        f.write(content)
                    uploaded_files.append(f"proposal_attachments/{filename}")
                    track_file_upload(proposal.freelancer, save_path, len(content))

            proposal.attachments = uploaded_files
            proposal.save()

        return {"message": "Proposal updated", "id": proposal.id}

    except Proposal.DoesNotExist:
        raise HTTPException(status_code=404, detail="Proposal not found")
    except Exception as e:
        print(f"❌ EditProposal ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 5. WITHDRAW PROPOSAL
# ============================================================
@router.delete("/WithdrawProposal/{proposal_id}")
def withdraw_proposal(proposal_id: int):
    try:
        ensure_db_connection()

        proposal = Proposal.objects.get(id=proposal_id)

        if proposal.attachments:
            for attachment_path in proposal.attachments:
                full_path = os.path.join(BASE_DIR, "fastapi_app", attachment_path)
                if os.path.exists(full_path):
                    file_size = os.path.getsize(full_path)
                    track_file_deletion(proposal.freelancer, file_size)
                    os.remove(full_path)

        proposal.delete()
        return {"message": "Proposal deleted successfully"}

    except Proposal.DoesNotExist:
        raise HTTPException(status_code=404, detail="Proposal not found")


# ============================================================
# 6. GET PROPOSALS FOR CREATOR (UPDATED - Fixed location/skills)
# ============================================================
@router.get("/GetProposalsForCreator/{creator_id}")
def get_proposals_for_creator(creator_id: int, request: Request):
    try:
        ensure_db_connection()

        base_url = str(request.base_url).rstrip('/')

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

                # ✅ FIX: Get skills from profile, not from UserData
                freelancer_skills = []

                if profile:
                    if profile.skills:
                        freelancer_skills = profile.skills
                    elif profile.skill_category:
                        freelancer_skills = [profile.skill_category]

                if not freelancer_skills and p.skills:
                    freelancer_skills = p.skills

                # ✅ FIX: Get location from profile
                freelancer_location = get_user_location(p.freelancer)
                freelancer_city = freelancer_location.get("city") or ""
                freelancer_country = freelancer_location.get("location") or ""

                print(f"📌 Proposal {p.id} - Freelancer skills: {freelancer_skills}")

                profile_picture_url = None
                if p.freelancer.profile_picture:
                    pic_path = str(p.freelancer.profile_picture).lstrip("/")
                    profile_picture_url = f"{base_url}/media/{pic_path}"

                freelancer_name = p.freelancer.full_name or ""
                if not freelancer_name:
                    freelancer_name = p.freelancer.email or f"User {p.freelancer.id}"

                attachments_urls = []
                if p.attachments:
                    for attachment in p.attachments:
                        attachments_urls.append(f"{base_url}/media/{attachment}")

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
                    "attachments": attachments_urls,
                    "duration": p.duration,
                    "expertise": p.expertise,
                    "job_details": job_details,
                    "has_contract": p.job.has_contract if p.job else False,
                })

            except Exception as inner_e:
                print(f"❌ Error processing proposal {p.id}: {str(inner_e)}")
                import traceback
                traceback.print_exc()
                continue

        return {"proposals": data}

    except Exception as e:
        print("❌ GetProposalsForCreator ERROR:", e)
        import traceback
        traceback.print_exc()
        return {"proposals": [], "error": str(e)}


# ============================================================
# 7. ACCEPT PROPOSAL
# ============================================================
@router.post("/AcceptProposal/{proposal_id}")
def accept_proposal(proposal_id: int, creator_id: int):
    from django.db import connection
    from datetime import date, timedelta
    import re
    import json

    try:
        connection.set_autocommit(True)
        ensure_db_connection()

        creator = UserData.objects.get(id=creator_id)

        proposal = (
            Proposal.objects
            .select_related("job", "freelancer")
            .filter(id=proposal_id, status="submitted")
            .first()
        )

        if not proposal:
            raise HTTPException(status_code=400, detail="Proposal already processed or not found")

        job = proposal.job

        if job.employer_id != creator.id:
            raise HTTPException(status_code=403, detail="Only job creator can accept proposals")

        if job.has_contract:
            raise HTTPException(status_code=400, detail="This job already has a contract")

        existing_active_contract = Contract.objects.filter(
            job=job,
            status__in=["in_progress", "in_review", "awaiting", "pending"]
        ).exists()

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

        proposal.status = "accepted"
        proposal.save(update_fields=["status"])
        
        check_contract_limit(creator)

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
            print(f"✅ Created {len(contract_milestones)} milestones for contract")

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
            print(f"✅ Rejected {other_proposals_updated} other proposals")

            invitations_updated = Invitation.objects.filter(
                job=job, 
                status="Pending"
            ).update(status="Rejected")
            print(f"✅ Cancelled {invitations_updated} pending invitations")

            Proposal.objects.filter(id=proposal.id, status="submitted").update(status="accepted")

        return {
            "message": "Proposal accepted and contract created",
            "proposal_id": proposal.id,
            "contract_id": contract.id,
            "contract_status": contract.status,
            "start_date": contract.start_date.isoformat(),
            "end_date": contract.end_date.isoformat() if contract.end_date else None,
            "milestones_count": len(contract_milestones),
            "has_contract": True,
            "is_milestone_based": len(contract_milestones) > 0
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Creator not found")
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ AcceptProposal ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        try:
            connection.rollback()
        except:
            pass
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 8. REJECT PROPOSAL
# ============================================================
@router.post("/RejectProposal/{proposal_id}")
def reject_proposal(proposal_id: int, creator_id: int):
    try:
        ensure_db_connection()
        
        creator = UserData.objects.get(id=creator_id)
        proposal = (
            Proposal.objects
            .select_related("job")
            .filter(id=proposal_id, status="submitted")
            .first()
        )

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

        Proposal.objects.filter(
            id=proposal.id,
            status="submitted"
        ).update(status="rejected")

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
# 9. REVOKE ACCEPTANCE
# ============================================================
@router.post("/RevokeAcceptance/{proposal_id}")
def revoke_acceptance(proposal_id: int, creator_id: int):
    from django.db import connection
    
    ensure_db_connection()
    connection.set_autocommit(True)
    
    try:
        creator = UserData.objects.get(id=creator_id)
        
        proposal = Proposal.objects.filter(
            id=proposal_id, 
            status="accepted"
        ).select_related('job', 'freelancer').first()
        
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
        
        contract = Contract.objects.filter(
            job=job,
            creator=creator,
            collaborator=freelancer
        ).first()
        
        deleted_contract_id = None
        if contract:
            deleted_contract_id = contract.id
            contract.delete()
            print(f"✅ Contract {deleted_contract_id} deleted successfully")
        
        other_contracts = Contract.objects.filter(job=job).exists()
        
        if not other_contracts:
            job.has_contract = False
            job.save(update_fields=['has_contract'])
            print(f"✅ Job {job.id} has_contract set to False")
        
        proposal.status = "submitted"
        proposal.save(update_fields=['status'])
        
        return {
            "message": "Acceptance revoked and contract deleted successfully",
            "proposal_id": proposal.id,
            "contract_id": deleted_contract_id,
            "status": "submitted",
            "has_contract": job.has_contract,
            "contract_deleted": True
        }
        
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Creator not found")
    except Exception as e:
        print(f"❌ Error in revoke_acceptance: {str(e)}")
        import traceback
        traceback.print_exc()
        try:
            connection.rollback()
        except:
            pass
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 10. GET JOB PROPOSAL STATUS
# ============================================================
@router.get("/job-proposal-status/{job_id}")
def get_job_proposal_status(job_id: int):
    try:
        ensure_db_connection()
        
        job = JobPost.objects.get(id=job_id)
        
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
# 11. GET PROPOSAL BY ID
# ============================================================
@router.get("/{proposal_id}")
def get_proposal(proposal_id: int):
    ensure_db_connection()
    try:
        proposal = Proposal.objects.select_related('job', 'freelancer').get(id=proposal_id)
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
            "attachments": proposal.attachments,
            "status": proposal.status,
            "job_id": proposal.job.id,
            "freelancer_id": proposal.freelancer.id,
            "milestones_data": proposal.milestones_data if hasattr(proposal, 'milestones_data') and proposal.milestones_data else []
        }
    except Proposal.DoesNotExist:
        raise HTTPException(404, detail="Proposal not found")


# ============================================================
# 12. DOWNLOAD PROPOSAL ATTACHMENT
# ============================================================
@router.get("/download-attachment/{proposal_id}/{filename}")
def download_proposal_attachment(proposal_id: int, filename: str):
    try:
        ensure_db_connection()

        proposal = Proposal.objects.get(id=proposal_id)

        if not proposal.attachments:
            raise HTTPException(status_code=404, detail="No attachments found for this proposal")

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

        full_path = os.path.join(BASE_DIR, "fastapi_app", attachment_path)

        if not os.path.exists(full_path):
            alt_path = os.path.join(BASE_DIR, attachment_path)
            if os.path.exists(alt_path):
                full_path = alt_path
            else:
                raise HTTPException(status_code=404, detail="File not found on server")

        original_filename = os.path.basename(attachment_path)
        parts = original_filename.split('_', 2)
        if len(parts) >= 3 and parts[0].isdigit():
            original_filename = parts[2]

        mime_type, _ = mimetypes.guess_type(original_filename)
        if not mime_type:
            mime_type = 'application/octet-stream'

        return FileResponse(
            full_path,
            media_type=mime_type,
            filename=original_filename,
            headers={
                "Content-Disposition": f"attachment; filename*=UTF-8''{original_filename}"
            }
        )

    except Proposal.DoesNotExist:
        raise HTTPException(status_code=404, detail="Proposal not found")
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Download attachment error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))