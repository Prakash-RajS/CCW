import fastapi_app.django_setup
 
from fastapi import HTTPException
from django.utils import timezone
from creator_app.models import (
    UserData,
    UserSubscription,
    SubscriptionPlan,
    JobPost,
    Invitation,
    Contract
)
 
# =========================================================
# 🔹 HELPER: GET LIMIT SAFELY
# =========================================================
def get_limit(plan, key, default=0):
    """
    Safely extracts a limit from the JSON 'limits' field.
    Example: plan.limits = {'job_posts': 10, 'invitations': 5}
    """
    if not plan or not plan.limits:
        return default
   
    # Force integer conversion just in case JSON stored it as a string
    try:
        return int(plan.limits.get(key, default))
    except (ValueError, TypeError):
        return default
 
# =========================================================
# 🔹 GET USER PLAN (STRICT)
# =========================================================
def get_user_plan(user: UserData):
    sub = UserSubscription.objects.filter(user=user).first()
   
    # 1. Check if Subscription Exists
    if not sub:
        raise HTTPException(
            status_code=403,
            detail="No active subscription. Please subscribe to a plan."
        )
 
    plan_name = (sub.current_plan or "").strip()
 
    if not plan_name:
        raise HTTPException(
            status_code=403,
            detail="Subscription plan not set. Contact admin."
        )
 
    # 2. Find the Plan in DB
    plan = SubscriptionPlan.objects.filter(name__iexact=plan_name).first()
 
    if not plan:
        # Fallback error if the plan name in subscription doesn't match any plan table entry
        raise HTTPException(
            status_code=500,
            detail=f"Plan '{plan_name}' not found. Please contact support."
        )
 
    return plan
 
 
# =========================================================
# 🔹 REQUIRE ANALYTICS ACCESS
# =========================================================
def require_analytics_access(user: UserData):
    plan = get_user_plan(user)
    # Checks for 'analytics_access': 1 in JSON
    allowed = get_limit(plan, "analytics_access", 0)
   
    if not allowed:
        raise HTTPException(
            status_code=403,
            detail="Upgrade your plan to access analytics."
        )
 
 
# =========================================================
# 🔹 REQUIRE REVENUE SPLIT ACCESS
# =========================================================
def require_revenue_split_access(user: UserData):
    plan = get_user_plan(user)
    # Checks for 'revenue_split_access': 1 in JSON
    allowed = get_limit(plan, "revenue_split_access", 0)
 
    if not allowed:
        raise HTTPException(
            status_code=403,
            detail="Revenue split is available only on higher tier plans."
        )
 
 
# =========================================================
# 🔹 CHECK JOB LIMIT
# =========================================================
def check_job_limit(user: UserData):
    plan = get_user_plan(user)
    # Default to 1 job post if limit is missing
    limit = get_limit(plan, "job_posts", 1)
 
    current_jobs = JobPost.objects.filter(employer=user).count()
 
    print(f"DEBUG → Jobs: {current_jobs} / {limit}")
 
    if current_jobs >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Job limit reached ({limit}). Upgrade your plan to post more jobs."
        )
 
 
# =========================================================
# 🔹 CHECK INVITE LIMIT
# =========================================================
def check_invite_limit(user: UserData):
    plan = get_user_plan(user)
    # Default to 5 invites if missing
    limit = get_limit(plan, "invitations", 5)
 
    sent_this_month = Invitation.objects.filter(
        sender=user,
        date__year=timezone.now().year,
        date__month=timezone.now().month
    ).count()
 
    print(f"DEBUG → Invites: {sent_this_month} / {limit}")
 
    if sent_this_month >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Invite limit reached ({limit}). Upgrade your plan to send more invitations."
        )
 
 
# =========================================================
# 🔹 CHECK CONTRACT LIMIT
# =========================================================
def check_contract_limit(user: UserData):
    plan = get_user_plan(user)
    # Default to 1 contract if missing
    limit = get_limit(plan, "contracts", 1)
 
    active_contracts = Contract.objects.filter(creator=user).count()
 
    print(f"DEBUG → Contracts: {active_contracts} / {limit}")
 
    if active_contracts >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Contract limit reached ({limit}). Upgrade your plan to create more contracts."
        )