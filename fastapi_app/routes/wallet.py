#wallet.py

import os
import stripe
from pathlib import Path # ✅ Added for robust path finding
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Form
from decimal import Decimal
from django.db.models import Q
from django.conf import settings

# ✅ LOAD ENVIRONMENT VARIABLES (ROBUST METHOD)
# This finds .env in the project root, regardless of where you run python from
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

# ✅ IMPORT MODELS & SETUP
import fastapi_app.django_setup
from creator_app.models import UserData, Wallet, WalletTransaction, CreatorProfile, CollaboratorProfile

router = APIRouter(prefix="/wallet", tags=["Wallet"])

# ==============================================================================
# 1. STRIPE CONFIGURATION
# ==============================================================================
# Debug print to verify key is loaded (Check your terminal)
stripe_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe_key:
    print("❌ CRITICAL: STRIPE_SECRET_KEY not found in .env via wallet.py!")
else:
    print("✅ Stripe Key loaded in wallet.py")

stripe.api_key = stripe_key
FRONTEND_URL = os.getenv("FRONTEND_URL")    


# --- HELPER FUNCTIONS ---
def is_creator(user: UserData) -> bool:
    if user.role and user.role.lower() in ["creator", "employer"]: return True
    if CreatorProfile.objects.filter(user=user).exists(): return True
    return False

def is_collaborator(user: UserData) -> bool:
    if user.role and user.role.lower() in ["collaborator", "freelancer"]: return True
    if CollaboratorProfile.objects.filter(user=user).exists(): return True
    return False

def get_or_create_customer(email: str, name: str):
    existing = stripe.Customer.list(email=email, limit=1).data
    if existing: return existing[0].id
    return stripe.Customer.create(email=email, name=name).id

# ==============================================================================
# 1. WALLET OVERVIEW
# ==============================================================================
@router.get("/")
def wallet_overview(user_id: int):
    try:
        user = UserData.objects.get(id=user_id)
        wallet, _ = Wallet.objects.get_or_create(user=user)
        return {"user_id": user.id, "balance": wallet.balance, "currency": wallet.currency}
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

# ==============================================================================
# 2. ADD FUNDS
# ==============================================================================
@router.post("/add-funds")
def add_funds(user_id: int = Form(...), amount: float = Form(...)):
    try:
        user = UserData.objects.get(id=user_id)
        if not is_creator(user):
            raise HTTPException(status_code=403, detail=f"User {user_id} is not a Creator.")

        customer_stripe_id = get_or_create_customer(user.email, f"{user.first_name} {user.last_name}")

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Wallet Funds',
                            'description': f'Add funds to wallet for {user.email}',
                        },
                        'unit_amount': int(amount * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                customer=customer_stripe_id,
                success_url=f'{FRONTEND_URL}/wallet-success?session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{FRONTEND_URL}/wallet-cancel',
                metadata={
                    "user_id": str(user.id),
                    "transaction_type": "wallet_topup",
                    "amount_added": str(amount)
                }
            )
            return {"checkout_url": checkout_session.url}
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Stripe Error: {str(e)}")
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

# ==============================================================================
# 3. WITHDRAW FUNDS (Enforces eKYC & Bank Details)
# ==============================================================================
@router.post("/withdraw")
def withdraw(user_id: int = Form(...), amount: float = Form(...)):
    try:
        user = UserData.objects.get(id=user_id)
        wallet = Wallet.objects.get(user=user)

        destination_id = user.stripe_account_id
        if not destination_id:
             # Create account if missing
             account = stripe.Account.create(type="standard", country="AU", email=user.email)
             user.stripe_account_id = account.id
             user.save()
             destination_id = account.id

        # CHECK STATUS: Do they have Bank Details?
        try:
            stripe_account = stripe.Account.retrieve(destination_id)

            if not stripe_account.payouts_enabled:
                account_link = stripe.AccountLink.create(
                    account=destination_id,
                    refresh_url=f"{FRONTEND_URL}/wallet",
                    return_url=f"{FRONTEND_URL}/wallet",
                    type="account_onboarding",
                )
                return {
                    "status": "requires_onboarding",
                    "message": "User needs to add bank details first.",
                    "onboarding_url": account_link.url 
                }

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Stripe Check Failed: {str(e)}")

        dec_amount = Decimal(str(amount))
        if wallet.balance < dec_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        # SEND MONEY
        try:
            amount_in_cents = int(amount * 100)
            transfer = stripe.Transfer.create(
                amount=amount_in_cents,
                currency="aud",    
                destination=destination_id,
                description=f"Withdrawal for {user.email}",
                metadata={"user_id": user.id}
            )
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Stripe Transfer Failed: {str(e)}")

        # DEDUCT BALANCE
        wallet.balance -= dec_amount
        wallet.save()

        WalletTransaction.objects.create(
            wallet=wallet,
            amount=dec_amount,
            transaction_type="Withdrawal",
            user=user
        )

        return {
            "status": "success",
            "new_balance": wallet.balance,
            "stripe_transfer_id": transfer.id,
            "message": "Funds transferred successfully!"
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Wallet.DoesNotExist:
        raise HTTPException(status_code=404, detail="Wallet not found")

# ==============================================================================
# 4. INTERNAL TRANSFER
# ==============================================================================
@router.post("/internal-transfer")
def internal_transfer(creator_id: int = Form(...), collaborator_id: int = Form(...), amount: float = Form(...)):
    try:
        creator = UserData.objects.get(id=creator_id)
        collaborator = UserData.objects.get(id=collaborator_id)

        if not is_creator(creator): raise HTTPException(status_code=400, detail="Sender not Creator.")
        if not is_collaborator(collaborator): raise HTTPException(status_code=400, detail="Receiver not Collaborator.")

        creator_wallet, _ = Wallet.objects.get_or_create(user=creator)
        collab_wallet, _ = Wallet.objects.get_or_create(user=collaborator)
        dec_amount = Decimal(str(amount))

        if creator_wallet.balance < dec_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")

        creator_wallet.balance -= dec_amount
        collab_wallet.balance += dec_amount

        creator_wallet.save()
        collab_wallet.save()

        WalletTransaction.objects.create(
            wallet=creator_wallet,
            amount=dec_amount,
            transaction_type="Internal Transaction",
            user=None,            
            from_user=creator,    
            to_user=collaborator  
        )

        return {"status": "success", "message": f"Transferred ${amount}", "creator_balance": creator_wallet.balance}

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

# ==============================================================================
# 5. TRANSACTION HISTORY
# ==============================================================================
@router.get("/transactions")
def transactions(user_id: int):
    try:
        user = UserData.objects.get(id=user_id)
        txs = WalletTransaction.objects.filter(
            Q(user=user) | Q(from_user=user) | Q(to_user=user)
        ).order_by("-created_at")
        data = []
        for t in txs:
            data.append({
                "id": t.id,
                "type": t.transaction_type,
                "amount": t.amount,
                "user": t.user.email if t.user else None,
                "from_user": t.from_user.email if t.from_user else None,
                "to_user": t.to_user.email if t.to_user else None,
                "date": t.created_at.strftime("%Y-%m-%d %H:%M:%S")
            })
        return data
    except UserData.DoesNotExist:
        return []

# ==============================================================================
# 6. MANAGE PAYOUT SETTINGS
# ==============================================================================
@router.post("/payout-settings")
def payout_settings(user_id: int = Form(...)):
    try:
        user = UserData.objects.get(id=user_id)
        if not user.stripe_account_id:
             raise HTTPException(status_code=400, detail="No Stripe account found.")

        login_link = stripe.Account.create_login_link(
            user.stripe_account_id
        )
        return {"status": "success", "url": login_link.url}

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==============================================================================
# 7. GET TOTAL WITHDRAWAL AMOUNT
# ==============================================================================
@router.get("/total-withdrawn")
def get_total_withdrawn(user_id: int):
    try:
        user = UserData.objects.get(id=user_id)
        withdrawals = WalletTransaction.objects.filter(
            user=user,
            transaction_type="Withdrawal"
        )
        total_amount = sum(t.amount for t in withdrawals)  
        return {
            "user_id": user.id,
            "total_withdrawn": total_amount,
            "currency": "AUD"
        }
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))