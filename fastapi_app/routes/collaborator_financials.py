import fastapi_app.django_setup
from fastapi import APIRouter, HTTPException, Header, Depends
from typing import List, Optional, Dict
from datetime import datetime
from django.db.models import Q

# ✅ Import Existing Models
from creator_app.models import (
    UserData, 
    JobPost, 
    Contract, 
    UserSubscription,
    Proposal,
    WalletTransaction
)

router = APIRouter(prefix="/collaborator", tags=["Collaborator Financials & Dashboard"])

# ==============================================================================
# 🔐 AUTH HELPER
# ==============================================================================
def verify_collaborator(user_id: int = Header(..., alias="user-id")):
    try:
        return UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found.")

# ==============================================================================
# 💰 1. FINANCIAL OVERVIEW
# ==============================================================================
@router.get("/financials/overview")
def get_collaborator_financials(user: UserData = Depends(verify_collaborator)):
    """
    Returns data for the Financials Popup (Overview, Work in Progress, Transactions).
    """
    try:
        # --- 1. Available Balance ---
        available_balance = 0.0
        if hasattr(user, 'wallet'):
            available_balance = float(user.wallet.balance)

        # --- 2. Work In Progress (Default 0.0) ---
        work_in_progress = 0.0
        in_review = 0.0

        # --- 3. Recent Transactions ---
        transactions = WalletTransaction.objects.filter(user=user).order_by('-created_at')[:10]
        
        txn_data = []
        for txn in transactions:
            txn_data.append({
                "id": txn.id,
                "type": txn.transaction_type,  
                "description": txn.transaction_type, 
                "amount": float(txn.amount),
                "status": "Success",           
                "date": txn.created_at.strftime("%d %b %Y, %I:%M %p")
            })

        return {
            "status": "success",
            "cards": {
                "work_in_progress": float(work_in_progress),
                "in_review": float(in_review),
                "available": float(available_balance)
            },
            "transactions": txn_data
        }
    except Exception as e:
        print(f"Financials Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Financial Data Error: {str(e)}")


# ==============================================================================
# 🏠 2. DASHBOARD HOME (With Best Match Logic)
# ==============================================================================
@router.get("/dashboard/home")
def get_dashboard_home(
    user: UserData = Depends(verify_collaborator),
    feed_type: str = "recent" # Options: 'recent', 'saved', 'best_match'
):
    """
    Returns data for the Main Dashboard:
    - Profile Stats, Subscription Banner
    - Job Stats (Active/Completed)
    - Bids (Static 20)
    - Job Feed (Recent Jobs OR Best Match)
    """
    try:
        # --- A. Profile Completion ---
        fields_to_check = [
            user.first_name, user.last_name, user.email, 
            user.phone_number, user.profile_picture, user.location,
            getattr(user, 'bio', None)
        ]
        filled = len([f for f in fields_to_check if f])
        total = len(fields_to_check)
        completion_rate = int((filled / total) * 100) if total > 0 else 0

        # --- B. Verification ---
        is_phone_verified = False
        is_email_verified = False
        if hasattr(user, 'verification'):
            is_phone_verified = user.verification.phone_verified
            is_email_verified = user.verification.email_verified
        else:
            is_email_verified = bool(user.email)
            is_phone_verified = bool(user.phone_number)

        # --- C. Subscription Banner ---
        has_active_plan = False
        try:
            sub = UserSubscription.objects.filter(user=user).latest('created_at')
            if sub.plan_expires_at and sub.plan_expires_at > datetime.now(sub.plan_expires_at.tzinfo):
                has_active_plan = True
        except UserSubscription.DoesNotExist:
            has_active_plan = False

        # --- D. Job Stats (Active/Completed) ---
        active_count = Contract.objects.filter(collaborator=user, status__in=['in_progress', 'awaiting']).count()
        completed_count = Contract.objects.filter(collaborator=user, status='completed').count()
        cancelled_count = Contract.objects.filter(collaborator=user, status='cancelled').count()

        # --- E. Bids (Static Logic - 20 Default) ---
        total_bids = 20 
        used_bids = Proposal.objects.filter(freelancer=user).count()
        available_bids = max(0, total_bids - used_bids)

        # =========================================================
        # ✅ F. JOB FEED LOGIC (Best Match Added)
        # =========================================================
        jobs_query = JobPost.objects.filter(status='posted') # Base: only posted jobs

        if feed_type == "saved":
            # Assuming you might add a SavedJob model later. Returning empty for now.
            jobs_query = JobPost.objects.none()

        elif feed_type == "best_match":
            # 1. Get User Skills (List or String)
            user_skills = getattr(user, 'skills', [])
            
            # Ensure it is a list (if stored as comma-separated string)
            if isinstance(user_skills, str):
                user_skills = [s.strip() for s in user_skills.split(',') if s.strip()]
            
            # 2. Add Primary Niche if available
            primary_niche = getattr(user, 'primary_niche', None)
            if primary_niche:
                user_skills.append(primary_niche)

            # ✅ DEBUG PRINT: Check what skills the system sees
            print(f"DEBUG: User {user.id} Skills for Matching: {user_skills}")

            if user_skills:
                # 3. Create Complex Query (OR Logic)
                # Find jobs where job.skills contains ANY of the user's skills
                q_object = Q()
                for skill in user_skills:
                    # 'icontains' works for both text strings and JSON lists in many DBs
                    q_object |= Q(skills__icontains=skill) | Q(title__icontains=skill)
                
                jobs_query = jobs_query.filter(q_object).distinct()
            else:
                # Fallback: If user has no skills, show recent
                print("DEBUG: No skills found. Falling back to Recent Jobs.")
                jobs_query = jobs_query.order_by('-created_at')

        else:
            # Default: Recent Jobs
            jobs_query = jobs_query.order_by('-created_at')

        # Limit to 10 results
        final_jobs = jobs_query[:10]
        
        feed_data = []
        for job in final_jobs:
            # Safe parsing of skills for display
            display_skills = job.skills
            if isinstance(display_skills, str):
                display_skills = [s.strip() for s in display_skills.split(',')]
            elif not isinstance(display_skills, list):
                display_skills = []

            feed_data.append({
                "id": job.id,
                "title": job.title,
                "description": job.description[:150] + "..." if job.description else "",
                "budget": f"${job.budget_from} - ${job.budget_to}" if job.budget_from else "Negotiable",
                "type": job.budget_type or "Fixed-price",
                "posted_time": job.created_at.strftime("%d %b, %H:%M"),
                "skills": display_skills[:3],
                "rating": 4.5,
                "location": getattr(job, 'location', 'Remote')
            })

        return {
            "status": "success",
            "user_profile": {
                "name": f"{user.first_name or ''} {user.last_name or ''}".strip() or "User",
                "role": user.role or "Collaborator",
                "completion_percent": completion_rate,
                "verification": {
                    "phone": is_phone_verified,
                    "email": is_email_verified
                }
            },
            "subscription": {
                "has_active_plan": has_active_plan,
                "show_banner": not has_active_plan
            },
            "stats": {
                "active_projects": active_count,
                "completed_projects": completed_count,
                "cancelled_projects": cancelled_count,
                "total_projects": active_count + completed_count + cancelled_count
            },
            "bids": {
                "available": available_bids,
                "total": total_bids,
                "used": used_bids
            },
            "job_feed": feed_data
        }

    except Exception as e:
        print(f"Dashboard Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Dashboard Error: {str(e)}")

