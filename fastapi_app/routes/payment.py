#payment.py
import os
import requests
import stripe
from pathlib import Path # ✅ Added for robust path finding
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request, Header, Form
from pydantic import BaseModel
from django.conf import settings
from django.db import transaction
from django.core.mail import EmailMessage
from decimal import Decimal
from datetime import datetime, timezone
from asgiref.sync import sync_to_async

# ✅ LOAD ENVIRONMENT VARIABLES (ROBUST METHOD)
# This forces Python to look in the root folder for .env
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# ✅ IMPORT MODELS
import fastapi_app.django_setup
from creator_app.models import (
    UserData, 
    UserSubscription, 
    BillingHistory, 
    BillingInfo, 
    Wallet, 
    WalletTransaction,
    SubscriptionPlan
)

router = APIRouter(prefix="/payment", tags=["Payment"])

# ==============================================================================
# 1. STRIPE CONFIGURATION
# ==============================================================================
# Debug print to verify key is loaded (Check your terminal)
stripe_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe_key:
    print("❌ CRITICAL: STRIPE_SECRET_KEY not found in .env via payment.py!")
else:
    print("✅ Stripe Key loaded in payment.py")

stripe.api_key = stripe_key
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL")


class CheckoutRequest(BaseModel):
    email: str
    plan_name: str
    duration: str = "monthly"

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================
def download_invoice_pdf(pdf_url, invoice_number):
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        fastapi_app_dir = os.path.dirname(current_dir)
        folder_name = os.path.join(fastapi_app_dir, "invoices")
        os.makedirs(folder_name, exist_ok=True)

        filename = f"invoice_{invoice_number}.pdf"
        file_path = os.path.join(folder_name, filename)

        if not os.path.exists(file_path):
            response = requests.get(pdf_url)
            with open(file_path, "wb") as f:
                f.write(response.content)

        print(f"PDF Saved at: {file_path}")
        return file_path
    except Exception as e:
        print(f"Failed to download PDF: {e}")
        return None

def send_email_notification(to_email, subject, body, attachment_path=None):
    try:
        email = EmailMessage(
            subject=subject, 
            body=body, 
            from_email=settings.DEFAULT_FROM_EMAIL, 
            to=[to_email]
        )
        if attachment_path and os.path.exists(attachment_path):
            email.attach_file(attachment_path)
        email.send()
        print(f"Email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def get_or_create_customer(email: str, name: str):
    existing_customers = stripe.Customer.list(email=email, limit=1).data
    if existing_customers:
        return existing_customers[0].id
    else:
        new_customer = stripe.Customer.create(email=email, name=name)
        return new_customer.id

# ==============================================================================
# 2. CREATE CHECKOUT SESSION
# ==============================================================================
@router.post("/create-checkout-session")
def create_checkout_session(data: CheckoutRequest):
    try:
        clean_email = data.email.strip()
        user = UserData.objects.get(email__iexact=clean_email)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        plan = SubscriptionPlan.objects.get(
            name__iexact=data.plan_name.strip(),
            duration__iexact=data.duration.strip()
        )
    except SubscriptionPlan.DoesNotExist:
        raise HTTPException(
            status_code=404, 
            detail=f"Plan '{data.plan_name}' with duration '{data.duration}' not found"
        )
    except SubscriptionPlan.MultipleObjectsReturned:
        plan = SubscriptionPlan.objects.filter(
            name__iexact=data.plan_name.strip(),
            duration__iexact=data.duration.strip()
        ).last()

    interval = "month"
    if "year" in plan.duration.lower():
        interval = "year"

    customer_stripe_id = get_or_create_customer(user.email, f"{user.first_name} {user.last_name}")

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='subscription',
            customer=customer_stripe_id,
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': plan.name,
                    },
                    'unit_amount': int(plan.price * 100), 
                    'recurring': {
                        'interval': interval
                    }
                },
                'quantity': 1,
            }],
            success_url=f'{FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{FRONTEND_URL}/payment-failed',
            metadata={
                "user_email": user.email,
                "plan_name": plan.name,
                "duration": plan.duration,
                "transaction_type": "subscription"
            }
        )
        return {"checkout_url": checkout_session.url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# 3. ONBOARDING
# ==============================================================================
@router.post("/onboard-user")
def onboard_user(user_id: int = Form(...)):
    try:
        user = UserData.objects.get(id=user_id)
        if not user.stripe_account_id:
            account = stripe.Account.create(type="standard", country="AU", email=user.email)
            user.stripe_account_id = account.id
            user.save()

        account_link = stripe.AccountLink.create(
            account=user.stripe_account_id,
            refresh_url=f"{FRONTEND_URL}/stripe-reauth",
            return_url=f"{FRONTEND_URL}/stripe-return",
            type="account_onboarding",
        )
        return {"url": account_link.url, "stripe_account_id": user.stripe_account_id}
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==============================================================================
# 4. CHECK KYC STATUS
# ==============================================================================
@router.get("/check-kyc-status")
def check_kyc_status(user_id: int):
    try:
        user = UserData.objects.get(id=user_id)
        if not user.stripe_account_id:
            return {"is_verified": False, "message": "Stripe not connected"}

        account = stripe.Account.retrieve(user.stripe_account_id)
        return {
            "stripe_id": account.id,
            "is_verified": account.payouts_enabled,
            "charges_enabled": account.charges_enabled,
            "needs_information": account.requirements.currently_due,
            "email": account.email
        }
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

# ==============================================================================
# 5. MAIN WEBHOOK
# ==============================================================================
@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Payload/Signature")

    event_type = event['type']

    if event_type == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get('metadata', {})

        if metadata.get('transaction_type') == 'wallet_topup':
            user_id = metadata.get('user_id')
            amount_added = metadata.get('amount_added')
            if user_id and amount_added:
                await sync_to_async(process_wallet_topup)(user_id, amount_added)

    elif event_type == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        billing_reason = invoice.get('billing_reason')
        if billing_reason in ['subscription_create', 'subscription_cycle', 'subscription_update']:
            await sync_to_async(process_subscription_payment)(invoice)

    return {"status": "success"}

# ==============================================================================
# DATABASE UPDATE & EMAIL LOGIC
# ==============================================================================

def process_wallet_topup(user_id, amount_added):
    try:
        user = UserData.objects.get(id=user_id)
        wallet, _ = Wallet.objects.get_or_create(user=user)
        dec_amount = Decimal(str(amount_added))
        wallet.balance += dec_amount
        wallet.save()
        WalletTransaction.objects.create(
            wallet=wallet, amount=dec_amount, transaction_type="Added Funds", user=user
        )
    except UserData.DoesNotExist:
        pass

def process_subscription_payment(invoice):
    customer_email = invoice.get('customer_email')
    transaction_id = invoice.get('payment_intent') or invoice.get('id')
    stripe_sub_id = invoice.get('subscription')
    invoice_pdf = invoice.get('invoice_pdf')
    invoice_num = invoice.get('number')
    amount_paid = (invoice.get('amount_paid') or 0) / 100.0

    try:
        user = UserData.objects.get(email=customer_email)

        lines = invoice.get('lines', {}).get('data', [])
        plan_name_final = "Unknown Plan"
        duration_final = "Monthly"
        expires_at = datetime.now(timezone.utc)

        if lines:
            item = lines[0]
            description = (item.get('description') or "").lower() 

            all_plans = SubscriptionPlan.objects.all()
            for p in all_plans:
                if p.name.lower() in description:
                    plan_name_final = p.name
                    duration_final = p.duration
                    break

            period = item.get('period') or {}
            period_end_ts = period.get('end')
            if period_end_ts:
                expires_at = datetime.fromtimestamp(period_end_ts, timezone.utc)

        with transaction.atomic():
            sub, created = UserSubscription.objects.get_or_create(
                user=user,
                defaults={'email': user.email}
            )
            sub.current_plan = plan_name_final
            sub.duration = duration_final
            sub.plan_expires_at = expires_at
            sub.renew_date = expires_at 
            sub.stripe_subscription_id = stripe_sub_id

            if not sub.email: sub.email = user.email
            sub.save()

            BillingHistory.objects.create(
                user=user,
                invoice_id=invoice_num,
                amount=amount_paid,
                status="paid",
                plan_name=plan_name_final,
                duration=duration_final,
                transaction_id=transaction_id,
                invoice=invoice_pdf
            )

            first = user.first_name or ""
            last = user.last_name or ""
            BillingInfo.objects.update_or_create(
                user=user,
                defaults={
                    "full_name": f"{first} {last}".strip(),
                    "email": user.email,
                    "location": "India"
                }
            )

        local_pdf_path = None
        if invoice_pdf and invoice_num:
            local_pdf_path = download_invoice_pdf(invoice_pdf, invoice_num)

        subject = f"Welcome to {plan_name_final}!"
        expiry_str = expires_at.strftime("%B %d, %Y")

        body = f"""
        Hi {user.first_name or 'User'},

        Thank you for subscribing to the {plan_name_final}!

        Here are your subscription details:
        ------------------------------------
        Plan:      {plan_name_final} ({duration_final})
        Amount:    ${amount_paid}
        Expires:   {expiry_str}
        ------------------------------------

        Your invoice is attached to this email.
        """

        send_email_notification(
            to_email=user.email,
            subject=subject,
            body=body,
            attachment_path=local_pdf_path
        )

    except UserData.DoesNotExist:
        print(f"WEBHOOK ERROR: User {customer_email} not found.")
    except Exception as e:
        print(f"WEBHOOK CRITICAL ERROR: {str(e)}")