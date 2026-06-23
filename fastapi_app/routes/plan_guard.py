# fastapi_app/routes/plan_guard.py

import fastapi_app.django_setup

from fastapi import HTTPException
from django.utils import timezone
from creator_app.models import (
    UserData,
    UserSubscription,
    SubscriptionPlan,
    JobPost,
    Invitation,
    Contract,
    Proposal
)
from fastapi_app.routes.dbconnection import ensure_db_connection


# =========================================================
# 🔹 GET USER PLAN (CREATES BASIC PLAN IF MISSING)
# =========================================================
def get_user_plan(user: UserData):
    ensure_db_connection()

    sub = UserSubscription.objects.filter(user=user).first()
    
    # ✅ CREATE SUBSCRIPTION IF IT DOESN'T EXIST
    if not sub:
        role = user.role if user.role else "collaborator"
        basic_plan = SubscriptionPlan.objects.filter(
            name__icontains="basic",
            role__iexact=role,
            is_active=True
        ).first()
        
        if not basic_plan:
            basic_plan = SubscriptionPlan.objects.create(
                name="Basic",
                role=role,
                duration="lifetime",
                price=0,
                is_active=True,
                limits={
                    "max_job_posts": 5,
                    "max_invitations": 10,
                    "max_contracts": 3,
                    "max_proposals": 10
                }
            )
        
        now = timezone.now()
        
        sub = UserSubscription.objects.create(
            user=user,
            email=user.email,
            current_plan=basic_plan.name,
            plan_name=basic_plan.name,
            duration="Lifetime",
            plan_price=basic_plan.price,
            plan_start_date=now,
            plan_end_date=None,
            renewal_date=None,
            status="active",
            is_trial=False,
        )
        
        reset_user_counters(user)
        
        from creator_app.models import SubscriptionHistory
        SubscriptionHistory.objects.create(
            user=user,
            email=user.email,
            plan_name=basic_plan.name,
            duration=basic_plan.duration,
            plan_price=basic_plan.price,
            start_date=now,
            end_date=None,
            status="active",
            action="created",
            plan_id=basic_plan.id,
        )

    if not sub:
        raise HTTPException(403, "Unable to create subscription. Please contact support.")

    if sub.status != "active":
        raise HTTPException(403, "Subscription not active")

    if sub.plan_end_date and sub.plan_end_date < timezone.now():
        basic_plan = SubscriptionPlan.objects.filter(
            role__iexact=user.role,
            name__icontains="basic",
            is_active=True
        ).first()

        if basic_plan:
            sub.current_plan = basic_plan.name
            sub.plan_name = basic_plan.name
            sub.status = "expired"
            sub.save()
            raise HTTPException(403, "Subscription expired and moved to Basic Plan")
        else:
            raise HTTPException(403, "Subscription expired")

    plan_name = (sub.current_plan or "").strip()
    if not plan_name:
        raise HTTPException(403, "Plan not assigned")

    user_role = (user.role or "").strip().lower()

    from django.db.models import Q
    plan = SubscriptionPlan.objects.filter(
        Q(role__iexact=user_role) | Q(role__iexact="both"),
        name__iexact=plan_name,
        is_active=True
    ).first()

    if not plan:
        plan = SubscriptionPlan.objects.filter(
            name__iexact=plan_name,
            is_active=True
        ).first()
        
        if not plan:
            raise HTTPException(
                500,
                f"No active plan named '{plan_name}' found for role '{user_role}'. "
                f"Check that the subscription plan exists and the role matches."
            )

    return plan


# =========================================================
# 🔹 RESET COUNTERS (Called on plan change)
# =========================================================
def reset_user_counters(user: UserData):
    """
    Reset all counters to 0 when user changes plan.
    This ensures they get fresh limits with their new plan.
    """
    user.total_jobs_created = 0
    user.total_proposals_created = 0
    user.total_invitations_sent = 0
    user.total_contracts_created = 0
    user.save()
    return True


# =========================================================
# 🔹 INCREMENT COUNTERS
# =========================================================
def increment_job_counter(user: UserData):
    """Increment total jobs created counter"""
    user.total_jobs_created += 1
    user.save()
    return user.total_jobs_created

def increment_proposal_counter(user: UserData):
    """Increment total proposals created counter"""
    user.total_proposals_created += 1
    user.save()
    return user.total_proposals_created

def increment_invitation_counter(user: UserData):
    """Increment total invitations sent counter"""
    user.total_invitations_sent += 1
    user.save()
    return user.total_invitations_sent

def increment_contract_counter(user: UserData):
    """Increment total contracts created counter"""
    user.total_contracts_created += 1
    user.save()
    return user.total_contracts_created


# =========================================================
# 🔹 JOB LIMIT (ONLY UserData.total_jobs_created)
# =========================================================
def check_job_limit(user: UserData):
    """
    Check if user can create a new job.
    Uses ONLY total_jobs_created from UserData table.
    This column is reset to 0 when user changes plan.
    """
    plan = get_user_plan(user)
    ensure_db_connection()

    max_jobs = plan.limits.get("max_job_posts", 0) if plan.limits else 0

    if max_jobs == 0:
        return  # Unlimited

    if user.total_jobs_created >= max_jobs:
        raise HTTPException(
            403, 
            f"Job creation limit reached ({max_jobs} total jobs). "
            f"You've created {user.total_jobs_created} jobs total. "
            f"Upgrade your plan for more jobs."
        )


# =========================================================
# 🔹 PROPOSAL LIMIT (ONLY UserData.total_proposals_created)
# =========================================================
def check_proposal_limit(user: UserData):
    """
    Check if user can create a new proposal.
    Uses ONLY total_proposals_created from UserData table.
    This column is reset to 0 when user changes plan.
    """
    plan = get_user_plan(user)
    ensure_db_connection()

    max_proposals = plan.limits.get("max_proposals", 0) if plan.limits else 0

    if max_proposals == 0:
        return  # Unlimited

    if user.total_proposals_created >= max_proposals:
        raise HTTPException(
            403,
            f"Proposal creation limit reached ({max_proposals} total proposals). "
            f"You've created {user.total_proposals_created} proposals total. "
            f"Upgrade your plan for more proposals."
        )


# =========================================================
# 🔹 INVITATION LIMIT (ONLY UserData.total_invitations_sent)
# =========================================================
def check_invite_limit(user: UserData):
    """
    Check if user can send new invitations.
    Uses ONLY total_invitations_sent from UserData table.
    This column is reset to 0 when user changes plan.
    """
    plan = get_user_plan(user)
    ensure_db_connection()

    max_invites = plan.limits.get("max_invitations", 0) if plan.limits else 0

    if max_invites == 0:
        return  # Unlimited

    if user.total_invitations_sent >= max_invites:
        raise HTTPException(
            403,
            f"Invitation limit reached ({max_invites} total invitations). "
            f"You've sent {user.total_invitations_sent} invitations total. "
            f"Upgrade your plan for more invitations."
        )


# =========================================================
# 🔹 CONTRACT LIMIT (ONLY UserData.total_contracts_created)
# =========================================================
def check_contract_limit(user: UserData):
    """
    Check if user can create a new contract.
    Uses ONLY total_contracts_created from UserData table.
    This column is reset to 0 when user changes plan.
    """
    plan = get_user_plan(user)
    ensure_db_connection()

    max_contracts = plan.limits.get("max_contracts", 0) if plan.limits else 0

    if max_contracts == 0:
        return  # Unlimited

    if user.total_contracts_created >= max_contracts:
        raise HTTPException(
            403,
            f"Contract creation limit reached ({max_contracts} total contracts). "
            f"You've created {user.total_contracts_created} contracts total. "
            f"Upgrade your plan for more contracts."
        )


# =========================================================
# 🔹 FEATURE ACCESS
# =========================================================
def require_analytics_access(user: UserData):
    plan = get_user_plan(user)
    if not getattr(plan, "can_use_analytics", False):
        raise HTTPException(403, "Upgrade plan for analytics")


def require_revenue_split_access(user: UserData):
    plan = get_user_plan(user)
    if not getattr(plan, "can_use_revenue_split", False):
        raise HTTPException(403, "Upgrade plan for revenue split")


# =========================================================
# 🔹 STORAGE LIMIT GUARD
# =========================================================
def check_storage_limit(user: UserData, file_size_bytes: int):
    """
    Call this before any file upload to enforce plan storage limits.
    """
    plan = get_user_plan(user)
    ensure_db_connection()

    from creator_app.models import UserStorage

    storage, _ = UserStorage.objects.get_or_create(user=user)

    if storage.limit_bytes == 0 and storage.limit_gb == 0:
        storage.update_limit_from_plan(plan)
        storage.refresh_from_db()

    if storage.limit_bytes == 0:
        return

    projected_usage = storage.used_bytes + file_size_bytes

    if projected_usage > storage.limit_bytes:
        used_gb = round(storage.used_bytes / (1024 ** 3), 2)
        limit_gb = round(storage.limit_bytes / (1024 ** 3), 2)
        file_mb = round(file_size_bytes / (1024 ** 2), 2)
        free_mb = round(max(0, storage.limit_bytes - storage.used_bytes) / (1024 ** 2), 2)

        raise HTTPException(
            status_code=403,
            detail={
                "error": "storage_limit_exceeded",
                "message": (
                    f"Upload rejected: file is {file_mb} MB but only "
                    f"{free_mb} MB remaining "
                    f"({used_gb} GB used of {limit_gb} GB limit)."
                ),
                "used_gb": used_gb,
                "limit_gb": limit_gb,
                "file_mb": file_mb,
                "free_mb": free_mb,
            }
        )