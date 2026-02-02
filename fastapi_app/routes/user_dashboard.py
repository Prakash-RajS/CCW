import fastapi_app.django_setup
from fastapi import APIRouter, HTTPException, Form
from typing import List, Optional
from datetime import datetime
from django.db.models import Q

# ✅ Import your Models
from creator_app.models import UserData, JobPost, UserSubscription

router = APIRouter(prefix="/user", tags=["User Dashboard"])

# ==============================================================================
# 🏠 USER DASHBOARD (Data for the "Welcome Back" Screen)
# ==============================================================================
@router.get("/dashboard/overview")
def get_user_dashboard_overview(user_id: int):
    """
    Fetches data for the 'Welcome back' screen:
    1. User Profile Info (Name, Profile Completion).
    2. Verification Status.
    3. Job Feed (Jobs matching their skills or recent jobs).
    """
    try:
        user = UserData.objects.get(id=user_id)
        
        # --- 1. CALCULATE PROFILE COMPLETION (CRASH PROOF) ---
        # Checks for 'phone' OR 'phone_number' safely
        phone_val = getattr(user, 'phone', None) or getattr(user, 'phone_number', None)
        
        fields_to_check = [
            getattr(user, 'first_name', None),
            getattr(user, 'last_name', None),
            getattr(user, 'email', None),
            phone_val,
            getattr(user, 'profile_pic', None),
            getattr(user, 'bio', None)
        ]
        
        filled_fields = len([f for f in fields_to_check if f]) 
        total_fields = len(fields_to_check)
        completion_rate = int((filled_fields / total_fields) * 100) if total_fields > 0 else 0

        # --- 2. GET JOB FEED (CRASH PROOF) ---
        recent_jobs = JobPost.objects.filter(status="posted").order_by('-created_at')[:5]
        
        jobs_data = []
        for job in recent_jobs:
            # ✅ FIX: Use getattr() to provide defaults if columns are missing in DB
            job_type = getattr(job, 'job_type', 'Fixed-price') 
            location = getattr(job, 'location', 'Remote')
            
            jobs_data.append({
                "id": job.id,
                "title": job.title,
                "description": (job.description[:100] + "...") if job.description else "",
                "budget": f"${job.budget_from} - ${job.budget_to}",
                "type": job_type,   # ✅ Safe access
                "rating": 4.5,      # Placeholder until Review model exists
                "location": location, # ✅ Safe access
                "time_posted": job.created_at.strftime("%d %b, %H:%M")
            })

        # --- 3. SUBSCRIPTION STATUS ---
        has_active_plan = UserSubscription.objects.filter(
            user=user, 
            plan_expires_at__gt=datetime.now()
        ).exists()

        # --- 4. VERIFICATION STATUS ---
        is_email_verified = getattr(user, 'is_email_verified', True)
        is_phone_verified = getattr(user, 'is_phone_verified', False)

        return {
            "status": "success",
            "user": {
                "name": f"{user.first_name or ''} {user.last_name or ''}".strip(),
                "role": user.role,
                "profile_completion": completion_rate,
                "is_verified": {
                    "email": is_email_verified,
                    "phone": is_phone_verified
                }
            },
            "show_upgrade_banner": not has_active_plan,
            "jobs_feed": jobs_data
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        # Catch errors and show them clearly
        raise HTTPException(status_code=500, detail=f"Dashboard Error: {str(e)}")

