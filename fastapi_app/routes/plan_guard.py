# import fastapi_app.django_setup

# from fastapi import HTTPException
# from django.utils import timezone
# from creator_app.models import (
#     UserData,
#     UserSubscription,
#     SubscriptionPlan,
#     JobPost,
#     Invitation,
#     Contract,
#     Proposal
# )
# from fastapi_app.routes.dbconnection import ensure_db_connection


# # =========================================================
# # 🔹 GET USER PLAN (STRICT + EXPIRY + ROLE CHECK)
# # =========================================================
# def get_user_plan(user: UserData):
#     ensure_db_connection()

#     sub = UserSubscription.objects.filter(user=user).first()
#     if not sub:
#         raise HTTPException(403, "No active subscription")

#     if sub.status != "active":
#         raise HTTPException(403, "Subscription not active")

#     if sub.plan_end_date and sub.plan_end_date < timezone.now():

#         basic_plan = SubscriptionPlan.objects.filter(
#             role__iexact=user.role,
#             name__icontains="basic",
#             is_active=True
#         ).first()

#         if basic_plan:

#             sub.current_plan = basic_plan.name
#             sub.plan_name = basic_plan.name
#             sub.status = "expired"
#             sub.save()

#         raise HTTPException(
#             403,
#             "Subscription expired and moved to Basic Plan"
#         )

#     plan_name = (sub.current_plan or "").strip()
#     if not plan_name:
#         raise HTTPException(403, "Plan not assigned")

#     user_role = (user.role or "").strip().lower()  # e.g. "creator" or "collaborator"

#     # ✅ FIX: filter by name AND matching role (role="both" always qualifies)
#     from django.db.models import Q
#     plan = SubscriptionPlan.objects.filter(
#         Q(role__iexact=user_role) | Q(role__iexact="both"),
#         name__iexact=plan_name,
#         is_active=True
#     ).first()

#     if not plan:
#         raise HTTPException(
#             500,
#             f"No active plan named '{plan_name}' found for role '{user_role}'. "
#             f"Check that the subscription plan exists and the role matches."
#         )

#     return plan

# # =========================================================
# # 🔹 FEATURE ACCESS
# # =========================================================
# def require_analytics_access(user: UserData):
#     plan = get_user_plan(user)
#     if not getattr(plan, "can_use_analytics", False):
#         raise HTTPException(403, "Upgrade plan for analytics")


# def require_revenue_split_access(user: UserData):
#     plan = get_user_plan(user)
#     if not getattr(plan, "can_use_revenue_split", False):
#         raise HTTPException(403, "Upgrade plan for revenue split")


# # =========================================================
# # 🔹 JOB LIMIT
# # =========================================================
# def check_job_limit(user: UserData):
#     plan = get_user_plan(user)
#     ensure_db_connection()

#     current_jobs = JobPost.objects.filter(
#         employer=user,
#         status="posted"
#     ).count()

#     max_jobs = plan.limits.get("max_job_posts", 0) if plan.limits else 0

#     # ✅ 0 means unlimited/not applicable for this role — skip the check
#     if max_jobs == 0:
#         return

#     if current_jobs >= max_jobs:
#         raise HTTPException(403, f"Job post limit reached ({max_jobs}). Please upgrade your plan.")


# # Apply the same 0 = unlimited pattern to all other limit checks:

# def check_invite_limit(user: UserData):
#     plan = get_user_plan(user)
#     ensure_db_connection()

#     now = timezone.now()
#     sent = Invitation.objects.filter(
#         sender=user,
#         date__year=now.year,
#         date__month=now.month
#     ).count()

#     max_invites = plan.limits.get("max_invitations", 0) if plan.limits else 0

#     if max_invites == 0:  # ✅ 0 = unlimited
#         return

#     if sent >= max_invites:
#         raise HTTPException(403, f"Monthly invite limit reached ({max_invites}). Please upgrade your plan.")


# def check_contract_limit(user: UserData):
#     plan = get_user_plan(user)
#     ensure_db_connection()

#     active_contracts = Contract.objects.filter(
#         creator=user,
#         status__in=["awaiting", "in_progress"]
#     ).count()

#     max_contracts = plan.limits.get("max_contracts", 0) if plan.limits else 0

#     if max_contracts == 0:  # ✅ 0 = unlimited
#         return

#     if active_contracts >= max_contracts:
#         raise HTTPException(403, f"Active contract limit reached ({max_contracts}). Please upgrade your plan.")


# def check_proposal_limit(user: UserData):
#     plan = get_user_plan(user)
#     ensure_db_connection()

#     total = Proposal.objects.filter(freelancer=user).count()

#     max_proposals = plan.limits.get("max_proposals", 0) if plan.limits else 0

#     if max_proposals == 0:  # ✅ 0 = unlimited
#         return

#     if total >= max_proposals:
#         raise HTTPException(403, f"Proposal limit reached ({max_proposals}). Please upgrade your plan.")
    
# # =========================================================
# # 🔹 STORAGE LIMIT GUARD
# # =========================================================
# def check_storage_limit(user: UserData, file_size_bytes: int):
#     """
#     Call this before any file upload to enforce plan storage limits.
#     Raises HTTP 403 if the upload would exceed the user's plan storage quota.
#     """
#     plan = get_user_plan(user)
#     ensure_db_connection()

#     from creator_app.models import UserStorage

#     # Get or create storage tracking record
#     storage, _ = UserStorage.objects.get_or_create(user=user)

#     # Sync storage limit from plan if not already set
#     if storage.limit_bytes == 0 and storage.limit_gb == 0:
#         storage.update_limit_from_plan(plan)
#         storage.refresh_from_db()

#     # 0 limit_bytes means unlimited (e.g. enterprise/lifetime plans)
#     if storage.limit_bytes == 0:
#         return  # ✅ Unlimited storage – allow upload

#     projected_usage = storage.used_bytes + file_size_bytes

#     if projected_usage > storage.limit_bytes:
#         used_gb   = round(storage.used_bytes / (1024 ** 3), 2)
#         limit_gb  = round(storage.limit_bytes / (1024 ** 3), 2)
#         file_mb   = round(file_size_bytes   / (1024 ** 2), 2)
#         free_mb   = round(max(0, storage.limit_bytes - storage.used_bytes) / (1024 ** 2), 2)

#         raise HTTPException(
#             status_code=403,
#             detail={
#                 "error": "storage_limit_exceeded",
#                 "message": (
#                     f"Upload rejected: file is {file_mb} MB but only "
#                     f"{free_mb} MB remaining "
#                     f"({used_gb} GB used of {limit_gb} GB limit)."
#                 ),
#                 "used_gb":   used_gb,
#                 "limit_gb":  limit_gb,
#                 "file_mb":   file_mb,
#                 "free_mb":   free_mb,
#             }
#         )

#     # ✅ Within limit – allow upload

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
# 🔹 GET USER PLAN (FLEXIBLE - CREATES BASIC PLAN IF MISSING)
# =========================================================
def get_user_plan(user: UserData):
    ensure_db_connection()

    sub = UserSubscription.objects.filter(user=user).first()
    
    # ✅ CREATE SUBSCRIPTION IF IT DOESN'T EXIST
    if not sub:
        print(f"⚠️ No subscription found for user {user.id}, creating Basic plan...")
        
        # Get or create Basic plan for the user's role
        role = user.role if user.role else "collaborator"
        basic_plan = SubscriptionPlan.objects.filter(
            name__icontains="basic",
            role__iexact=role,
            is_active=True
        ).first()
        
        if not basic_plan:
            # Fallback: create a default basic plan
            from datetime import timedelta
            basic_plan = SubscriptionPlan.objects.create(
                name="Basic",
                role=role,
                duration="lifetime",
                price=0,
                storage_limit_mb=100,
                max_portfolio_items=10,
                is_active=True,
                limits={
                    "max_job_posts": 5,
                    "max_invitations": 10,
                    "max_contracts": 3,
                    "max_proposals": 10
                }
            )
            print(f"✅ Created default Basic plan for role {role}")
        
        now = timezone.now()
        sub = UserSubscription.objects.create(
            user=user,
            email=user.email,
            current_plan=basic_plan.name,
            plan_name=basic_plan.name,
            duration=basic_plan.duration.capitalize() if basic_plan.duration else "Lifetime",
            plan_price=basic_plan.price,
            plan_start_date=now,
            plan_end_date=now + timezone.timedelta(days=365*100),
            renewal_date=now + timezone.timedelta(days=365*100),
            status="active",
            is_trial=False,
        )
        print(f"✅ Created Basic subscription for user {user.id}")
        
        # Create subscription history
        from creator_app.models import SubscriptionHistory
        SubscriptionHistory.objects.create(
            user=user,
            email=user.email,
            plan_name=basic_plan.name,
            duration=basic_plan.duration,
            plan_price=basic_plan.price,
            start_date=now,
            end_date=sub.plan_end_date,
            status="active",
            action="created",
            plan_id=basic_plan.id,
            stripe_subscription_id=sub.stripe_subscription_id,
        )
        print(f"✅ Subscription history created for user {user.id}")

    # Check if subscription exists now (it should)
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
        # Try to find any plan with this name
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
# 🔹 JOB LIMIT
# =========================================================
def check_job_limit(user: UserData):
    plan = get_user_plan(user)
    ensure_db_connection()

    current_jobs = JobPost.objects.filter(
        employer=user,
        status="posted"
    ).count()

    max_jobs = plan.limits.get("max_job_posts", 0) if plan.limits else 0

    if max_jobs == 0:
        return

    if current_jobs >= max_jobs:
        raise HTTPException(403, f"Job post limit reached ({max_jobs}). Please upgrade your plan.")


def check_invite_limit(user: UserData):
    plan = get_user_plan(user)
    ensure_db_connection()

    now = timezone.now()
    sent = Invitation.objects.filter(
        sender=user,
        date__year=now.year,
        date__month=now.month
    ).count()

    max_invites = plan.limits.get("max_invitations", 0) if plan.limits else 0

    if max_invites == 0:
        return

    if sent >= max_invites:
        raise HTTPException(403, f"Monthly invite limit reached ({max_invites}). Please upgrade your plan.")


def check_contract_limit(user: UserData):
    plan = get_user_plan(user)
    ensure_db_connection()

    active_contracts = Contract.objects.filter(
        creator=user,
        status__in=["awaiting", "in_progress"]
    ).count()

    max_contracts = plan.limits.get("max_contracts", 0) if plan.limits else 0

    if max_contracts == 0:
        return

    if active_contracts >= max_contracts:
        raise HTTPException(403, f"Active contract limit reached ({max_contracts}). Please upgrade your plan.")


def check_proposal_limit(user: UserData):
    plan = get_user_plan(user)
    ensure_db_connection()

    total = Proposal.objects.filter(freelancer=user).count()

    max_proposals = plan.limits.get("max_proposals", 0) if plan.limits else 0

    if max_proposals == 0:
        return

    if total >= max_proposals:
        raise HTTPException(403, f"Proposal limit reached ({max_proposals}). Please upgrade your plan.")


# =========================================================
# 🔹 STORAGE LIMIT GUARD
# =========================================================
def check_storage_limit(user: UserData, file_size_bytes: int):
    """
    Call this before any file upload to enforce plan storage limits.
    Raises HTTP 403 if the upload would exceed the user's plan storage quota.
    """
    plan = get_user_plan(user)
    ensure_db_connection()

    from creator_app.models import UserStorage

    # Get or create storage tracking record
    storage, _ = UserStorage.objects.get_or_create(user=user)

    # Sync storage limit from plan if not already set
    if storage.limit_bytes == 0 and storage.limit_gb == 0:
        storage.update_limit_from_plan(plan)
        storage.refresh_from_db()

    # 0 limit_bytes means unlimited (e.g. enterprise/lifetime plans)
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