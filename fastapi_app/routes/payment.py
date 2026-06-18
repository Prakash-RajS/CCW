# fastapi_app/routes/payment.py
import os
import hmac
import hashlib
import json
import requests
from fastapi import APIRouter, HTTPException, Request, Header, BackgroundTasks, Query 
from pydantic import BaseModel
from datetime import datetime, timedelta
from django.utils import timezone as django_timezone
from datetime import timezone as dt_timezone
from typing import Optional
from asgiref.sync import sync_to_async
from django.core.mail import EmailMessage
from django.conf import settings
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from decimal import Decimal
import logging

# ==============================================================================
# SUPPRESS FONTTOOLS DEBUG LOGS
# ==============================================================================
logging.getLogger("fontTools").setLevel(logging.WARNING)

import hmac, hashlib
from django.db import transaction
from django.core.mail import send_mail
from fastapi.responses import FileResponse
from pathlib import Path
from creator_app.models import Invoice

# ============================================================
# S3 STORAGE IMPORTS
# ============================================================
from fastapi_app.routes.storage import (
    USE_S3,
    generate_presigned_url,
    ExpiryPreset,
    get_s3_key_from_path,
    delete_file,
)

# Import models
from creator_app.models import (
    UserData, UserSubscription, SubscriptionPlan,
    Invoice, SubscriptionHistory, Wallet, WalletTransaction
)
from fastapi_app.services.notification_service import create_notification
from fastapi_app.routes.dbconnection import ensure_db_connection
from fastapi_app.services.invoice_service import send_invoice_email_async

router = APIRouter(prefix="/payment", tags=["Payment"])

# ==============================================================================
# 1. CASHFREE CONFIGURATION
# ==============================================================================

env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

CASHFREE_APP_ID     = os.getenv("CASHFREE_APP_ID")
CASHFREE_SECRET_KEY = os.getenv("CASHFREE_SECRET_KEY")
CASHFREE_ENV        = os.getenv("CASHFREE_ENV", "sandbox")
FRONTEND_URL        = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
BACKEND_URL = os.getenv(
    "BACKEND_BASE_URL",
    "http://localhost:8000"
)

# Cashfree API base URLs
CF_BASE = (
    "https://sandbox.cashfree.com/pg"
    if CASHFREE_ENV == "sandbox"
    else "https://api.cashfree.com/pg"
)

CF_HEADERS = {
    "x-client-id":     CASHFREE_APP_ID,
    "x-client-secret": CASHFREE_SECRET_KEY,
    "x-api-version":   "2023-08-01",
    "Content-Type":    "application/json",
}

INVOICE_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "invoices")
os.makedirs(INVOICE_FOLDER, exist_ok=True)

if CASHFREE_APP_ID:
    print(f"✅ Cashfree App ID loaded: {CASHFREE_APP_ID[:6]}...")
else:
    print("❌ CRITICAL: CASHFREE_APP_ID not found in .env!")


# ==============================================================================
# 2. PYDANTIC SCHEMAS
# ==============================================================================

class CheckoutRequest(BaseModel):
    email: str
    plan_name: str
    duration: str = "monthly"
    role: str


# ==============================================================================
# 3. CASHFREE HELPERS
# ==============================================================================

def cf_create_order(
    order_id: str,
    amount: float,
    customer_id: str,
    customer_email: str,
    customer_name: str,
    customer_phone: str,
    return_url: str,
    notify_url: str,
    meta: dict = None,
) -> dict:
    """
    Create a Cashfree payment order.
    Returns the full Cashfree response dict (contains payment_session_id).
    """
    payload = {
        "order_id":       order_id,
        "order_amount":   round(amount, 2),
        "order_currency": "INR",
        "customer_details": {
            "customer_id":    customer_id,
            "customer_email": customer_email,
            "customer_name":  customer_name,
            "customer_phone": customer_phone or "9999999999",
        },
        "order_meta": {
            "return_url": return_url,
            "notify_url": notify_url,
        },
        "order_tags": meta or {},
    }

    resp = requests.post(f"{CF_BASE}/orders", json=payload, headers=CF_HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.json()


def cf_get_order(order_id: str) -> dict:
    """Fetch a Cashfree order by order_id."""
    resp = requests.get(f"{CF_BASE}/orders/{order_id}", headers=CF_HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.json()


def cf_get_payments(order_id: str) -> list:
    """Get all payments for a Cashfree order."""
    resp = requests.get(f"{CF_BASE}/orders/{order_id}/payments", headers=CF_HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.json()


def verify_cashfree_signature(raw_body: bytes, received_signature: str, timestamp: str) -> bool:
    if not CASHFREE_SECRET_KEY:
        return False
    message = timestamp + raw_body.decode("utf-8")
    expected = hmac.new(
        CASHFREE_SECRET_KEY.encode(),
        msg=message.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, received_signature)

def get_or_create_basic_plan(role: str):
    """
    Returns a SubscriptionPlan object for the given role with price=0 and duration='monthly'.
    Creates it if it doesn't exist.
    """
    plan_name = "Basic"
    duration = "monthly"
    price = 0.00

    plan, created = SubscriptionPlan.objects.get_or_create(
        name=plan_name,
        role=role,
        duration=duration,
        defaults={
            "price": price,
            "description": f"Free basic plan for {role}s",
            "is_active": True,
            "is_popular": False,
            "limits": {
                "max_users": 1,
                "max_upload_storage_gb": 1,
                "max_proposals": 5,
                "max_job_posts": 2,
                "max_invitations": 5,
                "max_contracts": 1,
            },
            "features": [
                {"title": "Up to 1 project", "description": "Work on one active project", "is_active": True},
                {"title": "Basic support", "description": "Email support only", "is_active": True},
            ],
        }
    )
    if created:
        print(f"✅ Created new Basic plan for {role}")
    return plan

def make_order_id(user_id: int, plan_name: str) -> str:
    """Generate a unique Cashfree order ID (max 50 chars)."""
    ts = int(datetime.now(dt_timezone.utc).timestamp())
    safe_plan = plan_name.replace(" ", "_")[:15]
    return f"ORD_{user_id}_{safe_plan}_{ts}"

# ==============================================================================
# SUBSCRIPTION EXPIRY CHECKER
# ==============================================================================

from asgiref.sync import sync_to_async

from django.conf import settings

REMINDER_DAYS = [3, 2, 1]


async def check_subscription_expiry():

    now = django_timezone.now()

    # Fetch active subscriptions safely
    subscriptions = await sync_to_async(
        lambda: list(
            UserSubscription.objects.filter(
                status="active"
            ).exclude(plan_end_date__isnull=True)
        )
    )()

    for sub in subscriptions:

        try:

            # Skip invalid subscriptions
            if not sub.plan_end_date:
                continue

            remaining_days = (
                sub.plan_end_date.date() - now.date()
            ).days

            user = await sync_to_async(
                lambda: sub.user
            )()

            print(
                f"🔔 Subscription check: "
                f"{user.email} | "
                f"Days Remaining = {remaining_days}"
            )

            # =========================================
            # EXPIRED
            # =========================================
            if remaining_days < 0:

                basic_plan = await sync_to_async(
                    lambda: SubscriptionPlan.objects.filter(
                        name__icontains="basic",
                        role__iexact=user.role,
                        is_active=True
                    ).first()
                )()

                if basic_plan:

                    sub.current_plan = basic_plan.name
                    sub.plan_name = basic_plan.name
                    sub.status = "expired"

                    await sync_to_async(sub.save)()

                    subscription_url = (
                        "/collab-subscription"
                        if user.role == "collaborator"
                        else "/subscription"
                    )

                    await sync_to_async(create_notification)(
                        user=user,
                        notification_type="subscription_updated",
                        title="Subscription Expired",
                        message=(
                            "Your subscription has expired. "
                            "You have been moved to the Basic plan."
                        ),
                        url=subscription_url,
                    )

                    # Email
                    try:

                        print(
                            f"📨 Sending expired email "
                            f"to {user.email}"
                        )

                        await sync_to_async(send_mail)(
                            subject="Subscription Expired",
                            message=f"""
Hi {user.full_name if hasattr(user, 'full_name') else user.email},

Your subscription has expired.

You have been moved to the Basic Plan.

Renew your subscription to continue premium features.
                            """,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[user.email],
                            fail_silently=False
                        )

                        print(
                            f"📧 Expired email sent to "
                            f"{user.email}"
                        )

                    except Exception as mail_error:

                        print(
                            f"❌ Failed expired email "
                            f"for {user.email}: "
                            f"{mail_error}"
                        )

                    print(
                        f"✅ Downgraded "
                        f"{user.email} to Basic Plan"
                    )

            # =========================================
            # REMINDER EMAILS
            # =========================================
            elif remaining_days in REMINDER_DAYS:

                # -------------------------------------
                # OPTIONAL metadata support
                # -------------------------------------
                sent_reminders = []

                if hasattr(sub, "metadata"):

                    if sub.metadata is None:
                        sub.metadata = {}

                    sent_reminders = sub.metadata.get(
                        "expiry_reminders_sent",
                        []
                    )

                # Skip already sent reminders
                if remaining_days not in sent_reminders:

                    # Notification
                    subscription_url = (
                        "/collab-subscription"
                        if user.role == "collaborator"
                        else "/subscription"
                    )
                    
                    await sync_to_async(create_notification)(
                        user=user,
                        notification_type="subscription_updated",
                        title="Plan Expiring Soon",
                        message=(
                            f"Your plan expires in "
                            f"{remaining_days} day(s). "
                            f"Renew now."
                        ),
                        url=subscription_url,
                    )

                    # Email
                    try:

                        print(
                            f"📨 Sending reminder email "
                            f"to {user.email}"
                        )

                        await sync_to_async(send_mail)(
                            subject=(
                                f"Plan Expiring in "
                                f"{remaining_days} Day(s)"
                            ),
                            message=f"""
Hi {user.full_name if hasattr(user, 'full_name') else user.email},

Your current subscription will expire in {remaining_days} day(s).

Renew now to continue premium access.
                            """,
                            from_email=settings.DEFAULT_FROM_EMAIL,
                            recipient_list=[user.email],
                            fail_silently=False
                        )

                        print(
                            f"📧 Reminder email sent to "
                            f"{user.email}"
                        )

                    except Exception as mail_error:

                        print(
                            f"❌ Failed reminder email "
                            f"for {user.email}: "
                            f"{mail_error}"
                        )

                    # Save reminder history ONLY if metadata exists
                    if hasattr(sub, "metadata"):

                        sent_reminders.append(
                            remaining_days
                        )

                        sub.metadata[
                            "expiry_reminders_sent"
                        ] = sent_reminders

                        await sync_to_async(sub.save)()

                    print(
                        f"✅ Reminder processed for "
                        f"{user.email}"
                    )

        except Exception as e:

            print(
                f"❌ Expiry checker error "
                f"for subscription {sub.id}: {e}"
            )


# ==============================================================================
# 4. DB HELPERS (sync_to_async wrappers)
# ==============================================================================

@sync_to_async
def get_user_by_email(email: str):
    ensure_db_connection()
    try:
        return UserData.objects.get(email__iexact=email)
    except UserData.DoesNotExist:
        return None


@sync_to_async
def get_plan_by_name(
    plan_name: str,
    duration: str,
    role: str,
):
    ensure_db_connection()

    try:

        clean_name = plan_name.strip().lower()

        clean_duration = duration.strip().lower()

        clean_role = role.strip().lower()

        exact = SubscriptionPlan.objects.filter(
            name__iexact=clean_name,
            duration__iexact=clean_duration,
            role__iexact=clean_role,
            is_active=True,
        ).first()

        if exact:
            return exact

        return SubscriptionPlan.objects.filter(
            name__icontains=clean_name,
            role__iexact=clean_role,
            is_active=True,
        ).first()

    except Exception as e:

        print(f"❌ Error getting plan: {e}")

        return None


def create_subscription_history_sync(
    user,
    subscription,
    action: str,
    plan_id=None,
    cf_order_id: str = None,
    invoice_number: str = None,
):
    """Immutable subscription history — deduplicates on cf_order_id."""
    try:
        duration   = subscription.duration or "monthly"
        plan_name  = (subscription.plan_name or subscription.current_plan or "Unknown").capitalize()
        plan_price = subscription.plan_price if subscription.plan_price is not None else Decimal("0.00")
        start_date = subscription.plan_start_date or datetime.now(dt_timezone.utc)

        # Dedupe on Cashfree order ID (reuses stripe_event_id column)
        if cf_order_id:
            existing = SubscriptionHistory.objects.filter(stripe_event_id=cf_order_id).first()
            if existing:
                print(f"⚠️ Duplicate CF order skipped: {cf_order_id}")
                return existing

        if action in ("created", "renewed"):
            existing = SubscriptionHistory.objects.filter(
                user=user,
                stripe_subscription_id=subscription.stripe_subscription_id,
                action=action,
                invoice_number=invoice_number,
            ).first()
            if existing:
                print(f"⚠️ Duplicate history skipped: {user.email} - {action}")
                return existing

        if action == "created":
            SubscriptionHistory.objects.filter(user=user, status="active").exclude(
                stripe_subscription_id=subscription.stripe_subscription_id
            ).update(status="inactive")

        history = SubscriptionHistory.objects.create(
            user=user,
            email=user.email,
            plan_name=plan_name,
            duration=duration,
            plan_price=plan_price,
            start_date=start_date,
            end_date=subscription.plan_end_date,
            status="active",
            stripe_subscription_id=subscription.stripe_subscription_id,
            stripe_event_id=cf_order_id,       # reused column
            invoice_number=invoice_number,
            action=action,
            **({"plan_id": plan_id} if plan_id is not None else {}),
        )
        print(f"✅ History: {user.email} - {plan_name} - {action}")
        return history
    except Exception as e:
        import traceback; traceback.print_exc()
        print(f"❌ Error creating subscription history: {e}")
        return None


@sync_to_async
def create_user_subscription_db(
    user,
    plan,
    cf_order_id: str = None,
    invoice_number: str = None,
    amount_paid: float = 0,
):
    """
    Upserts the single UserSubscription row for this user.
    Returns (subscription, duration_display, is_new).
    """

    try:

        with transaction.atomic():

            now = datetime.now(dt_timezone.utc)

            is_annual = any(
                k in (plan.duration or "").lower()
                for k in ["year", "annual", "annually", "yr"]
            )

            end_date = now + timedelta(
                days=365 if is_annual else 30
            )

            duration_display = (
    "Yearly"
    if is_annual
    else "Monthly"
)

            final_price = (
                amount_paid
                if amount_paid > 0
                else float(plan.price)
            )

            print(
                f"📦 create_user_subscription_db: "
                f"{user.email} -> {plan.name}"
            )

            # =====================================================
            # DUPLICATE CHECK
            # =====================================================

            if cf_order_id:

                existing = UserSubscription.objects.filter(
                    stripe_subscription_id=cf_order_id
                ).first()

                if existing:

                    already_logged = SubscriptionHistory.objects.filter(
                        stripe_event_id=cf_order_id
                    ).exists()

                    if not already_logged:

                        create_subscription_history_sync(
                            user,
                            existing,
                            "renewed",
                            plan_id=plan.id,
                            cf_order_id=cf_order_id,
                        )

                    return existing, duration_display, False

            # =====================================================
            # EXPIRE CURRENT SUB
            # =====================================================

            current_sub = UserSubscription.objects.filter(
                user=user,
                status="active"
            ).first()

            if current_sub:

                create_subscription_history_sync(
                    user,
                    current_sub,
                    "expired"
                )

                current_sub.delete()

            # =====================================================
            # CREATE NEW SUB
            # =====================================================

            subscription = UserSubscription.objects.create(
                user=user,
                email=user.email,
                plan_name=plan.name,
                current_plan=plan.name,
                duration=duration_display,
                plan_price=final_price,
                plan_start_date=now,
                plan_end_date=end_date,
                renewal_date=end_date,
                status="active",
                is_trial=False,
                trial_ends_at=None,
                stripe_customer_id=None,
                stripe_subscription_id=(
                    cf_order_id
                    or f"cf_{user.id}_{int(now.timestamp())}"
                ),
                last_invoice_url=None,
                last_invoice_number=invoice_number,
                last_payment_amount=final_price,
                last_payment_date=now,
            )

            create_subscription_history_sync(
                user,
                subscription,
                "created",
                plan_id=plan.id,
                cf_order_id=cf_order_id,
                invoice_number=invoice_number,
            )

            print(
                f"✅ Subscription created: "
                f"{user.email} -> {plan.name}"
            )

            return subscription, duration_display, True

    except Exception as e:

        import traceback
        traceback.print_exc()

        raise



@sync_to_async
def check_and_downgrade_expired_subscriptions(user=None):
    ensure_db_connection()
    try:
        now = datetime.now(dt_timezone.utc)
        qs  = UserSubscription.objects.filter(plan_end_date__lt=now).exclude(current_plan__iexact="basic")
        if user:
            qs = qs.filter(user=user)

        # Get role-specific Basic plan for the user
        basic_plan = None
        if user and user.role:
            basic_plan = SubscriptionPlan.objects.filter(
                name__iexact="Basic", role=user.role, is_active=True
            ).first()
        if not basic_plan:
            # Fallback – create a plan for the role if missing (should not happen if profiles are created correctly)
            basic_plan = get_or_create_basic_plan(user.role if user else "creator")

        count = 0
        for sub in qs:
            user = sub.user
            if not user or not user.role:
                print(f"⚠️ Cannot downgrade subscription {sub.id}: user {user.email if user else 'None'} has no role")
                continue
            
            # Get role‑specific Basic plan (creator or collaborator)
            basic_plan = SubscriptionPlan.objects.filter(
                name__iexact="Basic", role=user.role, is_active=True
            ).first()
            if not basic_plan:
                basic_plan = get_or_create_basic_plan(user.role)   # from utils
        
            create_subscription_history_sync(sub.user, sub, "expired")
        
            # Downgrade to the correct Basic plan
            sub.plan_name       = basic_plan.name
            sub.current_plan    = basic_plan.name
            sub.duration        = basic_plan.duration.capitalize()   # "Monthly"
            sub.plan_price      = basic_plan.price                   # 0.00
            sub.plan_start_date = now
            sub.plan_end_date   = now + timedelta(days=365*100)      # 100 years (never expires)
            sub.renewal_date    = now + timedelta(days=365*100)
            sub.status          = "active"
            sub.is_trial        = False
            sub.trial_ends_at   = None
            sub.save()
        
            create_subscription_history_sync(sub.user, sub, "downgraded", plan_id=basic_plan.id)
            count += 1

        return count
    except Exception as e:
        print(f"❌ Error checking expired subscriptions: {e}")
        return 0


@sync_to_async
def handle_wallet_topup(user_id: int, amount: float):
    ensure_db_connection()
    try:
        user   = UserData.objects.get(id=user_id)
        wallet, _ = Wallet.objects.get_or_create(user=user)
        wallet.balance += Decimal(str(amount))
        wallet.save()
        WalletTransaction.objects.create(
            wallet=wallet, amount=Decimal(str(amount)),
            transaction_type="Deposit", user=user,
        )
        print(f"✅ Wallet updated: {user.email} +₹{amount}")
    except Exception as e:
        print(f"❌ Wallet update failed: {e}")


def send_welcome_email_sync(user, plan, amount_paid, duration_display):
    try:
        if not hasattr(settings, "EMAIL_HOST") or not settings.EMAIL_HOST:
            return False

        now      = datetime.now()
        is_annual = "annual" in duration_display.lower() or "year" in duration_display.lower()
        end_date = now + (timedelta(days=365) if is_annual else timedelta(days=30))

        subject = f"🎉 Welcome to {plan.name}!"
        body = f"""
Dear {user.full_name or 'Valued Customer'},

Thank you for subscribing to {plan.name}!

📋 Subscription Details:
Plan: {plan.name} ({'Annual (1 Year)' if is_annual else 'Monthly'})
Amount: ₹{amount_paid:.2f}
Start Date: {now.strftime('%B %d, %Y')}
End Date: {end_date.strftime('%B %d, %Y')}
Status: Active

Email: {user.email}

Best regards,
The Talenta Team
        """
        EmailMessage(
            subject=subject, body=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        ).send(fail_silently=False)
        print(f"✅ Welcome email sent to {user.email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send welcome email: {e}")
        return False


async def send_welcome_email_async(user, plan, amount_paid, duration_display):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, send_welcome_email_sync, user, plan, amount_paid, duration_display
    )


# ==============================================================================
# 5. CHECK CONFIG
# ==============================================================================

@router.get("/check-config")
async def check_cashfree_config():
    ensure_db_connection()
    return {
        "cashfree_configured": bool(CASHFREE_APP_ID),
        "cashfree_env":        CASHFREE_ENV,
        "app_id_prefix":       CASHFREE_APP_ID[:6] + "..." if CASHFREE_APP_ID else None,
        "frontend_url":        FRONTEND_URL,
    }


# ==============================================================================
# 6. CREATE CHECKOUT SESSION
# ==============================================================================

@router.post("/create-checkout-session")
async def create_checkout_session(data: CheckoutRequest):
    """
    Creates a Cashfree payment order and returns the payment_session_id
    for the frontend to open Cashfree's JS SDK / redirect checkout.
    """
    ensure_db_connection()

    user = await get_user_by_email(data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    plan = await get_plan_by_name(
        data.plan_name,
        data.duration,
        data.role,
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # ---------- Free / Basic plan — activate directly ----------
    is_free = plan.price == 0 or "basic" in plan.name.lower() or "free" in plan.name.lower()
    if is_free:
        subscription, duration_display, _ = await create_user_subscription_db(
            user=user, plan=plan,
            cf_order_id=f"basic_{user.id}_{int(datetime.now(dt_timezone.utc).timestamp())}",
            amount_paid=0,
        )
        return {
            "success":     True,
            "message":     "Basic plan activated",
            "is_basic":    True,
            "plan_name":   plan.name,
            "duration":    duration_display,
        }

    # ---------- Paid plan — create Cashfree order ----------
    price_to_charge = float(plan.discounted_price if hasattr(plan, "discounted_price") else plan.price)

    redirect_path = "/collab-subscription" if user.role == "collaborator" else "/subscription"
    order_id = make_order_id(user.id, plan.name)

    return_url = (
        f"{FRONTEND_URL}{redirect_path}"
        f"?order_id={order_id}"
    )
    notify_url = f"{BACKEND_URL}/payment/webhook"

    try:
        cf_resp = cf_create_order(
            order_id=order_id,
            amount=price_to_charge,
            customer_id=str(user.id),
            customer_email=user.email,
            customer_name=user.full_name or user.email,
            customer_phone=getattr(user, "phone_number", None) or "9999999999",
            return_url=return_url,
            notify_url=notify_url,
            meta={
                "payment_type": "subscription",
                "user_id":             str(user.id),
                "user_email":          user.email,
                "plan_name":           plan.name,
                "plan_duration":       plan.duration or data.duration,
                "plan_price":          str(plan.price),
                "discounted_price":    str(price_to_charge),
                "discount_percentage": str(plan.discount_percentage or 0),
                "role": data.role,
            },
        )
    except requests.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Cashfree error: {e.response.text}")

    return {
        "success":             True,
        "is_basic":            False,
        "order_id":            cf_resp.get("order_id"),
        "payment_session_id":  cf_resp.get("payment_session_id"),
        "original_price":      float(plan.price),
        "discounted_price":    price_to_charge,
        "cashfree_env": CASHFREE_ENV,
    }


# ==============================================================================
# 7. INVOICE EMAIL WRAPPER (NEW)
# ==============================================================================

def send_invoice_email_wrapper(
    user,
    plan,
    amount_paid: float,
    duration_display: str,
    invoice_number: str,
    order_id: str,
    subscription,
    request,
):
    """
    Wrapper to run the async invoice email in a synchronous context.
    """
    import asyncio
    try:
        print(f"📧 [WRAPPER] Starting invoice email for {getattr(user, 'email', 'unknown')}")
        print(f"   Invoice: {invoice_number}")
        print(f"   Plan: {getattr(plan, 'name', 'unknown')}")
        print(f"   Amount: {amount_paid}")
        print(f"   Storage Mode: {'S3' if USE_S3 else 'Local'}")
        
        # Create a new event loop for this task
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                send_invoice_email_async(
                    user=user,
                    plan=plan,
                    amount_paid=amount_paid,
                    duration_display=duration_display,
                    invoice_number=invoice_number,
                    order_id=order_id,
                    subscription=subscription,
                    request=request,
                )
            )
            if result:
                print(f"✅ [WRAPPER] Invoice email sent successfully to {getattr(user, 'email', 'unknown')}")
            else:
                print(f"❌ [WRAPPER] Invoice email returned False for {getattr(user, 'email', 'unknown')}")
        except Exception as e:
            print(f"❌ [WRAPPER] Error in invoice email async execution: {e}")
            import traceback
            traceback.print_exc()
        finally:
            loop.close()
    except Exception as e:
        print(f"❌ [WRAPPER] Failed to send invoice email: {e}")
        import traceback
        traceback.print_exc()


# ==============================================================================
# 8. VERIFY PAYMENT (UPDATED with BackgroundTasks)
# ==============================================================================

@router.get("/verify-payment")
async def verify_payment(
    request: Request,
    background_tasks: BackgroundTasks,
    order_id: str,
):
    """
    Frontend calls this after Cashfree redirect.
    Verifies payment and activates subscription.
    """

    ensure_db_connection()

    # ============================================================
    # FETCH ORDER
    # ============================================================

    try:
        cf_order = cf_get_order(order_id)
    except requests.HTTPError as e:
        return {
            "success": False,
            "error": f"Cashfree fetch error: {e.response.text}"
        }

    # ============================================================
    # VERIFY ORDER STATUS
    # ============================================================

    order_status = cf_order.get("order_status", "")

    if order_status != "PAID":
        return {
            "success": False,
            "status": order_status,
            "message": f"Payment not completed. Status: {order_status}"
        }

    # ============================================================
    # VERIFY SUCCESSFUL PAYMENT EXISTS
    # ============================================================

    try:
        payments = cf_get_payments(order_id)
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to fetch payment details: {str(e)}"
        }

    successful_payment = next(
        (p for p in payments if p.get("payment_status") == "SUCCESS"),
        None
    )

    if not successful_payment:
        return {
            "success": False,
            "error": "No successful payment found"
        }

    # ============================================================
    # GET ORDER TAGS
    # ============================================================

    tags = cf_order.get("order_tags", {})

    payment_type = tags.get("payment_type")

    if payment_type != "subscription":
        return {
            "success": False,
            "error": f"Invalid payment type: {payment_type}"
        }

    user_email = tags.get("user_email")
    plan_name = tags.get("plan_name")
    role = tags.get("role")
    plan_duration = tags.get("plan_duration", "monthly")

    # ============================================================
    # VALIDATE TAGS
    # ============================================================

    if not user_email:
        return {
            "success": False,
            "error": "Missing user_email in order tags"
        }

    if not plan_name:
        return {
            "success": False,
            "error": "Missing plan_name in order tags"
        }

    # ============================================================
    # GET USER
    # ============================================================

    user = await get_user_by_email(user_email)

    if not user:
        return {
            "success": False,
            "error": "User not found"
        }

    # ============================================================
    # GET PLAN
    # ============================================================

    plan = await get_plan_by_name(plan_name, plan_duration, role)

    if not plan:
        return {
            "success": False,
            "error": "Plan not found"
        }

    # ============================================================
    # PAYMENT INFO
    # ============================================================

    amount_paid = float(cf_order.get("order_amount", 0))

    if amount_paid <= 0:
        return {
            "success": False,
            "error": "Invalid payment amount"
        }

    invoice_number = successful_payment.get("cf_payment_id") or order_id

    # ============================================================
    # DB DEDUPE
    # ============================================================

    existing = await sync_to_async(
        lambda: SubscriptionHistory.objects.filter(
            stripe_event_id=order_id
        ).exists()
    )()

    if existing:
        existing_sub = await sync_to_async(
            lambda: UserSubscription.objects.filter(
                stripe_subscription_id=order_id
            ).first()
        )()

        return {
            "success": True,
            "status": "already_processed",
            "plan_name": existing_sub.plan_name if existing_sub else plan.name,
        }

    # ============================================================
    # CREATE SUBSCRIPTION
    # ============================================================

    try:
        subscription, duration_display, is_new = await create_user_subscription_db(
            user=user,
            plan=plan,
            cf_order_id=order_id,
            invoice_number=invoice_number,
            amount_paid=amount_paid,
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "error": f"Failed to create subscription: {str(e)}"
        }

    # ============================================================
    # NOTIFICATION + EMAIL (Using BackgroundTasks)
    # ============================================================

    email_sent = False

    if is_new:

        try:
            subscription_url = (
                "/collab-subscription"
                if user.role == "collaborator"
                else "/subscription"
            )

            await sync_to_async(create_notification)(
                user=user,
                notification_type="subscription_updated",
                title="Subscription Activated",
                message=f"Your {plan.name} subscription has been activated successfully.",
                url=subscription_url,
                icon="subscription",
            )
        except Exception as e:
            print(f"Notification error: {e}")

        # ── Send PDF invoice using BackgroundTasks ──
        try:
            background_tasks.add_task(
                send_invoice_email_wrapper,
                user=user,
                plan=plan,
                amount_paid=amount_paid,
                duration_display=duration_display,
                invoice_number=invoice_number,
                order_id=order_id,
                subscription=subscription,
                request=request,
            )
            email_sent = True
            print(f"📧 Invoice email queued for {user.email}")
        except Exception as e:
            print(f"Invoice email error: {e}")
            import traceback
            traceback.print_exc()

    # ============================================================
    # SUCCESS RESPONSE
    # ============================================================

    return {
        "success": True,
        "status": "PAID",
        "order_id": order_id,
        "plan_name": plan.name,
        "duration": duration_display,
        "amount_paid": amount_paid,
        "is_new_subscription": is_new,
        "email_sent": email_sent,
        "storage_mode": "s3" if USE_S3 else "local",
    }


# ==============================================================================
# 9. CASHFREE WEBHOOK (UPDATED with BackgroundTasks)
# ==============================================================================

@router.post("/webhook")
async def cashfree_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
):
    """
    Cashfree posts payment events here.
    """
    ensure_db_connection()

    raw_body = await request.body()
    timestamp = request.headers.get("x-webhook-timestamp", "")
    signature = request.headers.get("x-webhook-signature", "")

    # Verify signature ONLY in production
    if CASHFREE_ENV == "production" and CASHFREE_SECRET_KEY and signature:
        if not verify_cashfree_signature(raw_body, signature, timestamp):
            raise HTTPException(status_code=400, detail="Invalid Cashfree webhook signature")
    
    try:
        event = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    event_type = event.get("type", "")
    data = event.get("data", {})
    order_data = data.get("order", {})
    payment_data = data.get("payment", {})

    order_id = order_data.get("order_id", "")
    order_status = order_data.get("order_status", "")
    order_tags = order_data.get("order_tags", {})

    print(f"🔄 CF Webhook: {event_type} | order={order_id} | status={order_status}")

    # ------------------------------------------------------------------
    # PAYMENT SUCCESS
    # ------------------------------------------------------------------
    event_type_lower = (event.get("type") or "").lower()

    if event_type_lower == "payment_success_webhook" and order_status == "PAID":

        user_email = order_tags.get("user_email")
        plan_name = order_tags.get("plan_name")
        plan_duration = order_tags.get("plan_duration", "monthly")

        if not user_email or not plan_name:
            print(f"⚠️ Missing metadata | email={user_email} | plan={plan_name}")
            return {"success": True, "message": "Ignored webhook"}

        user = await get_user_by_email(user_email)

        if not user:
            print(f"⚠️ User not found: {user_email}")
            return {"success": True, "message": "User not found"}

        role = order_tags.get("role")
        plan = await get_plan_by_name(plan_name, plan_duration, role)

        if not plan:
            print(f"⚠️ Plan not found: {plan_name}")
            return {"success": True, "message": "Plan not found"}

        amount_paid = float(order_data.get("order_amount", 0))
        invoice_number = payment_data.get("cf_payment_id") or order_id

        try:
            already_processed = await sync_to_async(
                lambda: UserSubscription.objects.filter(
                    stripe_subscription_id=order_id
                ).exists()
            )()

            if already_processed:
                print(f"⚠️ Duplicate webhook skipped: {order_id}")
                return {"success": True, "message": "Already processed"}

            subscription, duration_display, is_new = await create_user_subscription_db(
                user=user,
                plan=plan,
                cf_order_id=order_id,
                invoice_number=invoice_number,
                amount_paid=amount_paid,
            )

            print(f"✅ Webhook subscription processed: {user.email}")

            # Send invoice in background for webhook too
            if is_new:
                try:
                    background_tasks.add_task(
                        send_invoice_email_wrapper,
                        user=user,
                        plan=plan,
                        amount_paid=amount_paid,
                        duration_display=duration_display,
                        invoice_number=invoice_number,
                        order_id=order_id,
                        subscription=subscription,
                        request=request,
                    )
                    print(f"📧 Invoice email queued from webhook for {user.email}")
                except Exception as e:
                    print(f"Invoice email error in webhook: {e}")

        except Exception as e:
            print(f"❌ Webhook subscription error: {e}")
            import traceback
            traceback.print_exc()

    # ------------------------------------------------------------------
    # PAYMENT FAILURE
    # ------------------------------------------------------------------
    elif event_type_lower in ("payment_failed_webhook", "payment_user_dropped_webhook"):
        print(f"⚠️ Payment not completed: {order_id} | type={event_type}")

    return {"success": True, "event": event_type}


# ==============================================================================
# 10. GET USER SUBSCRIPTION
# ==============================================================================

@router.get("/user/subscription")
async def get_user_subscription(user_email: str):
    ensure_db_connection()
    try:
        user = await get_user_by_email(user_email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        await check_and_downgrade_expired_subscriptions(user)

        @sync_to_async
        def get_subscription():
            ensure_db_connection()
            return (
                UserSubscription.objects.filter(user=user).order_by("-created_at").first()
                or UserSubscription.objects.filter(email=user_email).order_by("-created_at").first()
            )

        subscription = await get_subscription()
        if not subscription:
            return {"has_subscription": False, "message": "No subscription found"}

        now = datetime.now(dt_timezone.utc)
        is_active = subscription.status == "active" and (
            not subscription.plan_end_date or subscription.plan_end_date > now
        )
        is_basic = subscription.current_plan and "basic" in subscription.current_plan.lower()

        plan_details = None
        if subscription.plan_name:
            plan = await sync_to_async(
                lambda: SubscriptionPlan.objects.filter(name__iexact=subscription.plan_name).first()
            )()
            if plan:
                plan_details = {
                    "id": plan.id,
                    "discount_code": plan.discount_code,
                    "discount_percentage": plan.discount_percentage,
                    "discount_description": plan.discount_description,
                }

        return {
            "has_subscription": True,
            "subscription": {
                "plan_name": subscription.plan_name or "No Plan",
                "current_plan": subscription.current_plan or "No Plan",
                "duration": subscription.duration or "N/A",
                "status": subscription.status,
                "is_active": is_active,
                "is_basic": is_basic,
                "plan_price": float(subscription.plan_price) if subscription.plan_price else 0,
                "plan_start_date": subscription.plan_start_date,
                "plan_end_date": subscription.plan_end_date,
                "renewal_date": subscription.renewal_date,
                "user_email": subscription.email or user_email,
                "days_remaining": subscription.days_remaining if hasattr(subscription, "days_remaining") else 0,
                "last_payment_date": subscription.last_payment_date,
                "last_payment_amount": float(subscription.last_payment_amount) if subscription.last_payment_amount else 0,
                "plan_details": plan_details,
                "storage_mode": "s3" if USE_S3 else "local",
            },
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"has_subscription": False, "error": str(e)}


# ==============================================================================
# 11. GET SUBSCRIPTION HISTORY
# ==============================================================================

@router.get("/user/subscription-history")
async def get_user_subscription_history(user_email: str):
    ensure_db_connection()
    try:
        user = await get_user_by_email(user_email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        @sync_to_async
        def get_history():
            ensure_db_connection()
            return list(SubscriptionHistory.objects.filter(user=user).order_by("-created_at"))

        history = await get_history()
        return {
            "success": True,
            "history": [
                {
                    "id": h.id,
                    "plan_name": h.plan_name,
                    "duration": h.duration,
                    "plan_price": float(h.plan_price),
                    "start_date": h.start_date,
                    "end_date": h.end_date,
                    "status": h.status,
                    "action": h.action,
                    "created_at": h.created_at,
                }
                for h in history
            ],
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


# ==============================================================================
# 12. PLANS LIST
# ==============================================================================

@router.get("/plans")
async def get_all_plans():
    ensure_db_connection()

    @sync_to_async
    def get_plans():
        ensure_db_connection()
        return list(SubscriptionPlan.objects.filter(is_active=True))

    plans = await get_plans()
    return {
        "plans": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": float(p.price),
                "duration": p.duration,
                "features": p.features if hasattr(p, "features") else [],
                "discount_code": p.discount_code,
                "discount_percentage": p.discount_percentage,
                "discount_description": p.discount_description,
                "discounted_price": float(p.discounted_price),
            }
            for p in plans
        ]
    }


# ==============================================================================
# 13. ENSURE SUBSCRIPTION / ADMIN ENDPOINTS
# ==============================================================================

@router.get("/user/ensure-subscription")
async def ensure_user_subscription(user_email: str):
    ensure_db_connection()

    try:
        user = await get_user_by_email(user_email)

        if not user:
            return {
                "success": False,
                "error": "User not found"
            }

        subscription = await sync_to_async(
            lambda: UserSubscription.objects.filter(
                user=user
            ).order_by("-created_at").first()
        )()

        if not subscription:
            return {
                "success": False,
                "error": "No subscription found"
            }

        return {
            "success": True,
            "subscription": {
                "plan_name": subscription.plan_name,
                "current_plan": subscription.current_plan,
                "duration": subscription.duration,
                "status": subscription.status,
            }
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@router.post("/admin/check-expired-subscriptions")
async def admin_check_expired_subscriptions():
    ensure_db_connection()
    try:
        count = await check_and_downgrade_expired_subscriptions()
        return {"success": True, "message": f"Downgraded {count} expired subscriptions"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/subscription-expiry-status")
async def subscription_expiry_status(user_email: str):
    sub = await sync_to_async(
        lambda: UserSubscription.objects.filter(
            user__email=user_email
        ).first()
    )()

    if not sub or not sub.plan_end_date:
        return {
            "expired": False,
            "days_remaining": None
        }

    now = django_timezone.now()

    days_remaining = (
        sub.plan_end_date.date() - now.date()
    ).days

    return {
        "expired": days_remaining < 0,
        "days_remaining": days_remaining,
        "plan_name": sub.current_plan
    }


# ==============================================================================
# 14. TEST ENDPOINT
# ==============================================================================

@router.get("/test")
async def test_payment():
    ensure_db_connection()
    if not CASHFREE_APP_ID:
        return {"success": False, "error": "CASHFREE_APP_ID not configured"}
    try:
        resp = requests.get(f"{CF_BASE}/orders?count=1", headers=CF_HEADERS, timeout=10)
        return {
            "success": resp.status_code < 400,
            "env": CASHFREE_ENV,
            "http_code": resp.status_code,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.get("/debug-order/{order_id}")
async def debug_order(order_id: str):
    ensure_db_connection()
    try:
        cf_order = cf_get_order(order_id)
        payments = cf_get_payments(order_id)
        return {"success": True, "order": cf_order, "payments": payments}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ==============================================================================
# 15. INVOICE DOWNLOAD (UPDATED WITH S3 SUPPORT)
# ==============================================================================

@router.get("/invoice/{identifier}")
async def download_invoice(
    request: Request,
    identifier: str,
    invoice_number: Optional[str] = None,
    subscription_id: Optional[str] = None,
):
    """
    Download invoice PDF with S3 support.
    If USE_S3=True, returns a presigned URL for the invoice.
    If USE_S3=False, returns the PDF file directly.
    """
    ensure_db_connection()

    try:
        invoice = None

        # =====================================================
        # 1. SEARCH USING INVOICE NUMBER
        # =====================================================

        if invoice_number:
            invoice = await sync_to_async(
                lambda: Invoice.objects.filter(
                    invoice_number=str(invoice_number)
                ).first()
            )()

        # =====================================================
        # 2. SEARCH USING SUBSCRIPTION ID
        # =====================================================

        if not invoice and subscription_id:
            invoice = await sync_to_async(
                lambda: Invoice.objects.filter(
                    subscription_id=subscription_id
                ).first()
            )()

        # =====================================================
        # 3. FALLBACK USING IDENTIFIER
        # =====================================================

        if not invoice:
            invoice = await sync_to_async(
                lambda: Invoice.objects.filter(
                    invoice_number=str(identifier)
                ).first()
            )()

        # =====================================================
        # NOT FOUND
        # =====================================================

        if not invoice:
            raise HTTPException(
                status_code=404,
                detail="Invoice not found"
            )

        # =====================================================
        # GET PDF URL/PATH
        # =====================================================

        if not invoice.pdf_file:
            raise HTTPException(
                status_code=404,
                detail="Invoice PDF missing"
            )

        pdf_path_or_key = str(invoice.pdf_file)

        # =====================================================
        # S3 MODE - Return Presigned URL
        # =====================================================
        if USE_S3:
            # Extract S3 key from the stored path
            s3_key = get_s3_key_from_path(pdf_path_or_key)
            
            # ✅ FIX: Use s3_key parameter, not file_path
            download_url = generate_presigned_url(
                s3_key=s3_key,  # <-- FIXED: changed from file_path to s3_key
                expires_in=ExpiryPreset.WEEKLY,
                force_download=True
            )
            
            if download_url:
                return {
                    "success": True,
                    "download_url": download_url,
                    "invoice_number": invoice.invoice_number,
                    "storage_mode": "s3",
                    "expires_in": "7 days"
                }
            else:
                raise HTTPException(
                    status_code=404,
                    detail="Invoice file not found in S3"
                )

        # =====================================================
        # LOCAL MODE - Return FileResponse
        # =====================================================
        else:
            pdf_path = Path(settings.MEDIA_ROOT) / pdf_path_or_key

            print(f"📄 Invoice path: {pdf_path}")

            if not pdf_path.exists():
                raise HTTPException(
                    status_code=404,
                    detail=f"Invoice file not found: {pdf_path}"
                )

            return FileResponse(
                path=str(pdf_path),
                media_type="application/pdf",
                filename=pdf_path.name,
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Invoice download error: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ==============================================================================
# 16. GET INVOICE URL (Helper Endpoint) - FIXED
# ==============================================================================

# ==============================================================================
# 16. GET INVOICE URL (Helper Endpoint) - FIXED
# ==============================================================================

@router.get("/invoice-url")
async def get_invoice_url_endpoint(
    request: Request,
    identifier: str = Query(..., description="Invoice number or subscription ID"),
    invoice_number: Optional[str] = Query(None, description="Alternative invoice number"),
    subscription_id: Optional[str] = Query(None, description="Subscription ID (stripe_subscription_id)"),
):
    """
    Get a presigned URL for an invoice (S3 mode) or local URL (local mode).
    Accepts invoice number or subscription ID as identifier.
    """
    ensure_db_connection()

    try:
        invoice = None

        # =====================================================
        # 1. SEARCH USING INVOICE NUMBER (from query param)
        # =====================================================
        if invoice_number:
            invoice = await sync_to_async(
                lambda: Invoice.objects.filter(
                    invoice_number=str(invoice_number)
                ).first()
            )()

        # =====================================================
        # 2. SEARCH USING SUBSCRIPTION ID (stripe_subscription_id)
        # =====================================================
        if not invoice and subscription_id:
            # First, find the UserSubscription by stripe_subscription_id
            user_subscription = await sync_to_async(
                lambda: UserSubscription.objects.filter(
                    stripe_subscription_id=subscription_id
                ).first()
            )()
            
            if user_subscription:
                # Then find the invoice by subscription ID (foreign key)
                invoice = await sync_to_async(
                    lambda: Invoice.objects.filter(
                        subscription=user_subscription
                    ).first()
                )()
            
            # If still not found, try using the old invoice_number field
            if not invoice:
                # Some invoices might have the stripe_subscription_id stored in invoice_number
                invoice = await sync_to_async(
                    lambda: Invoice.objects.filter(
                        invoice_number=subscription_id
                    ).first()
                )()

        # =====================================================
        # 3. SEARCH USING IDENTIFIER
        # =====================================================
        if not invoice and identifier:
            # Try as invoice number
            invoice = await sync_to_async(
                lambda: Invoice.objects.filter(
                    invoice_number=str(identifier)
                ).first()
            )()
            
            # If not found and identifier is a number, try as ID
            if not invoice and identifier.isdigit():
                invoice = await sync_to_async(
                    lambda: Invoice.objects.filter(
                        id=int(identifier)
                    ).first()
                )()
            
            # If still not found, try to find subscription by stripe_subscription_id
            if not invoice:
                user_subscription = await sync_to_async(
                    lambda: UserSubscription.objects.filter(
                        stripe_subscription_id=identifier
                    ).first()
                )()
                
                if user_subscription:
                    invoice = await sync_to_async(
                        lambda: Invoice.objects.filter(
                            subscription=user_subscription
                        ).first()
                    )()

        # =====================================================
        # NOT FOUND
        # =====================================================
        if not invoice:
            raise HTTPException(
                status_code=404,
                detail=f"Invoice not found for identifier: {identifier}"
            )

        if not invoice.pdf_file:
            raise HTTPException(
                status_code=404,
                detail="Invoice PDF missing"
            )

        pdf_path_or_key = str(invoice.pdf_file)

        if USE_S3:
            s3_key = get_s3_key_from_path(pdf_path_or_key)
            download_url = generate_presigned_url(
                s3_key=s3_key,
                expires_in=ExpiryPreset.WEEKLY,
                force_download=False
            )
            
            return {
                "success": True,
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "url": download_url,
                "storage_mode": "s3",
                "expires_in": "7 days"
            }
        else:
            base_url = str(request.base_url).rstrip("/")
            local_url = f"{base_url}/media/{pdf_path_or_key}"
            
            return {
                "success": True,
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "url": local_url,
                "storage_mode": "local"
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Get invoice URL error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



# ==============================================================================
# 17. DELETE INVOICE (Admin/Support)
# ==============================================================================

@router.delete("/invoice/{invoice_id}")
async def delete_invoice(
    invoice_id: int,
):
    """
    Delete an invoice from S3 or local storage.
    """
    ensure_db_connection()

    try:
        invoice = await sync_to_async(
            lambda: Invoice.objects.filter(id=invoice_id).first()
        )()

        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        if not invoice.pdf_file:
            raise HTTPException(status_code=404, detail="Invoice PDF missing")

        pdf_path = str(invoice.pdf_file)

        # Delete from S3 or local
        if USE_S3:
            s3_key = get_s3_key_from_path(pdf_path)
            deleted = delete_file(s3_key)
        else:
            full_path = Path(settings.MEDIA_ROOT) / pdf_path
            if full_path.exists():
                full_path.unlink()
                deleted = True
            else:
                deleted = False

        if deleted:
            return {
                "success": True,
                "message": "Invoice file deleted successfully",
                "invoice_id": invoice_id,
                "storage_mode": "s3" if USE_S3 else "local"
            }
        else:
            return {
                "success": False,
                "message": "Invoice file not found",
                "invoice_id": invoice_id
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Delete invoice error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# 18. TEST INVOICE EMAIL ENDPOINT (For Debugging)
# ==============================================================================

@router.post("/test-invoice-email")
async def test_invoice_email(
    background_tasks: BackgroundTasks,
    user_email: str,
):
    """
    TEST ENDPOINT: Send an invoice email directly for debugging.
    """
    ensure_db_connection()

    try:
        user = await get_user_by_email(user_email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        plan = await get_plan_by_name("Pro", "monthly", user.role)
        if not plan:
            plan = await sync_to_async(
                lambda: SubscriptionPlan.objects.filter(is_active=True).first()
            )()

        if not plan:
            raise HTTPException(status_code=404, detail="No active plan found")

        invoice_number = f"TEST_INV_{int(datetime.now().timestamp())}"
        amount_paid = float(plan.price) if plan.price else 99.00

        from fastapi import Request
        dummy_request = Request({"type": "http", "headers": []})

        background_tasks.add_task(
            send_invoice_email_wrapper,
            user=user,
            plan=plan,
            amount_paid=amount_paid,
            duration_display="Monthly",
            invoice_number=invoice_number,
            order_id=f"TEST_ORDER_{user.id}_{int(datetime.now().timestamp())}",
            subscription=None,
            request=dummy_request,
        )

        return {
            "success": True,
            "message": f"Invoice email queued for {user.email}",
            "invoice_number": invoice_number,
            "plan_name": plan.name,
            "amount": amount_paid,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Test invoice email error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# 19. TEST S3 INVOICE UPLOAD (For Debugging)
# ==============================================================================

@router.post("/test-invoice-upload")
async def test_invoice_upload(
    user_email: str,
):
    """
    TEST ENDPOINT: Test S3 invoice upload without sending email.
    """
    ensure_db_connection()

    try:
        from fastapi_app.services.invoice_service import (
            generate_invoice_pdf,
            save_invoice_pdf,
            build_invoice_context,
            USE_S3
        )

        user = await get_user_by_email(user_email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        plan = await get_plan_by_name("Pro", "monthly", user.role)
        if not plan:
            plan = await sync_to_async(
                lambda: SubscriptionPlan.objects.filter(is_active=True).first()
            )()

        if not plan:
            raise HTTPException(status_code=404, detail="No active plan found")

        invoice_number = f"TEST_INV_{int(datetime.now().timestamp())}"
        amount_paid = float(plan.price) if plan.price else 99.00

        print(f"📧 Testing invoice upload for {user_email}")
        print(f"   Plan: {plan.name}")
        print(f"   Invoice: {invoice_number}")
        print(f"   Amount: {amount_paid}")
        print(f"   Storage Mode: {'S3' if USE_S3 else 'Local'}")

        context = build_invoice_context(
            user=user,
            plan=plan,
            amount_paid=amount_paid,
            duration_display="Monthly",
            invoice_number=invoice_number,
            order_id=f"TEST_ORDER_{user.id}",
            invoice_date=None,
        )

        pdf_bytes = generate_invoice_pdf(context)
        print(f"✅ PDF generated: {len(pdf_bytes)} bytes")

        save_result = save_invoice_pdf(pdf_bytes, invoice_number)
        
        print(f"✅ PDF saved to: {save_result['path']}")
        print(f"   Storage Mode: {save_result['storage_mode']}")

        from fastapi_app.services.invoice_service import create_invoice_record
        
        invoice_record = create_invoice_record(
            user=user,
            subscription=None,
            invoice_number=invoice_number,
            amount_paid=amount_paid,
            pdf_file_path=save_result["path"],
            storage_mode=save_result["storage_mode"],
        )

        return {
            "success": True,
            "invoice_number": invoice_number,
            "file_path": save_result["path"],
            "storage_mode": save_result["storage_mode"],
            "file_size": len(pdf_bytes),
            "invoice_id": invoice_record.id if invoice_record else None,
            "message": f"Invoice saved successfully to {save_result['storage_mode']}"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Test invoice upload error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))