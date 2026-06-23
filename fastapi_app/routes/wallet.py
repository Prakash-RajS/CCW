"""
wallet.py — Cashfree wallet top-up + internal transfer + withdraw + payouts
Pure Cashfree implementation with multiple withdrawal methods (Bank & UPI).
"""

import os
import json
from typing import Optional
import uuid
from pathlib import Path
from decimal import Decimal
from datetime import datetime

import httpx
from fastapi import APIRouter, HTTPException, Request, Form
from pydantic import BaseModel
from asgiref.sync import sync_to_async
from dotenv import load_dotenv
from django.db.models import Q

import fastapi_app.django_setup

from creator_app.models import (
    Contract,
    UserData,
    Wallet,
    WalletTransaction,
    CreatorProfile,
    CollaboratorProfile,
)

from fastapi_app.routes.dbconnection import ensure_db_connection
from fastapi_app.services.notification_service import create_notification


# =============================================================================
# ENV
# =============================================================================

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

CASHFREE_APP_ID = os.getenv("CASHFREE_APP_ID", "")
CASHFREE_SECRET_KEY = os.getenv("CASHFREE_SECRET_KEY", "")
CASHFREE_ENV = os.getenv("CASHFREE_ENV", "sandbox")
CASHFREE_PAYOUT_CLIENT_ID = os.getenv(
    "CASHFREE_PAYOUT_CLIENT_ID",
    ""
)

CASHFREE_PAYOUT_SECRET_KEY = os.getenv(
    "CASHFREE_PAYOUT_SECRET_KEY",
    ""
)

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
)

BACKEND_URL = os.getenv(
    "BACKEND_URL",
    "http://localhost:8000"
)

# =============================================================================
# CASHFREE URLS
# =============================================================================

if CASHFREE_ENV == "production":
    CF_BASE_URL = "https://api.cashfree.com/pg"
    CF_PAYOUT_URL = "https://payout-api.cashfree.com/payout/v1"
else:
    CF_BASE_URL = "https://sandbox.cashfree.com/pg"
    CF_PAYOUT_URL = "https://payout-gamma.cashfree.com/payout/v1"

CF_HEADERS = {
    "x-api-version": "2023-08-01",
    "x-client-id": CASHFREE_APP_ID,
    "x-client-secret": CASHFREE_SECRET_KEY,
    "Content-Type": "application/json",
}



# =============================================================================
# ROUTER
# =============================================================================

router = APIRouter(
    prefix="/wallet",
    tags=["Wallet"]
)


# =============================================================================
# HELPERS
# =============================================================================

def _require_cashfree():
    if not CASHFREE_APP_ID or not CASHFREE_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Cashfree not configured"
        )


def _unique_order_id(prefix: str = "order") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _get_wallet(user: UserData) -> Wallet:
    wallet, _ = Wallet.objects.get_or_create(user=user)
    return wallet


def _record_tx(
    wallet,
    amount,
    tx_type,
    user=None,
    from_user=None,
    to_user=None,
):
    WalletTransaction.objects.create(
        wallet=wallet,
        amount=amount,
        transaction_type=tx_type,
        user=user,
        from_user=from_user,
        to_user=to_user,
    )


def _verify_cashfree_webhook(
    body: bytes,
    signature: str,
) -> bool:
    """
    Cashfree webhook verification.
    Sandbox mode skips validation.
    """

    if CASHFREE_ENV == "sandbox":
        return True

    if not signature:
        return False

    # Production verification can be added later
    return True


async def _get_payout_token():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CF_PAYOUT_URL}/authorize",
            headers={
                "X-Client-Id": CASHFREE_PAYOUT_CLIENT_ID,
                "X-Client-Secret": CASHFREE_PAYOUT_SECRET_KEY,
                "Content-Type": "application/json",
            },
            timeout=20,
        )
    
    # print("AUTH RESPONSE:", response.text)
    
    if response.status_code != 200:
        raise HTTPException(
            400,
            f"Payout auth failed: {response.text}"
        )
    
    response_data = response.json()
    
    token = None
    
    # FORMAT 1
    if "data" in response_data:
        token = response_data.get("data", {}).get("token")
    
    # FORMAT 2
    if not token:
        token = response_data.get("token")
    
    if not token:
        raise HTTPException(
            400,
            f"Failed to get payout token: {response.text}"
        )
    
    return token


# =============================================================================
# 1. WALLET OVERVIEW
# =============================================================================

@router.get("/")
def wallet_overview(user_id: int):
    ensure_db_connection()

    try:
        user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")

    wallet = _get_wallet(user)

    return {
        "user_id": user.id,
        "balance": float(wallet.balance),
        "currency": wallet.currency,
    }


# =============================================================================
# 2. ADD FUNDS
# =============================================================================

@router.post("/add-funds")
async def add_funds(
    user_id: int = Form(...),
    amount: float = Form(...),
):
    _require_cashfree()
    ensure_db_connection()

    if amount <= 0:
        raise HTTPException(400, "Amount must be positive")

    try:
        user = await sync_to_async(
            UserData.objects.get
        )(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")

    order_id = _unique_order_id("wallet")

    payload = {
        "order_id": order_id,
        "order_amount": round(amount, 2),
        "order_currency": "INR",
        "customer_details": {
            "customer_id": str(user.id),
            "customer_email": user.email or "",
            "customer_name": user.full_name or user.email,
            "customer_phone": getattr(
                user,
                "phone_number",
                "9999999999"
            ),
        },
        "order_meta": {
            "return_url": f"{FRONTEND_URL}/choose-payment?order_id={order_id}",
            "notify_url": f"{BACKEND_URL}/wallet/cashfree-webhook"       },
        "order_note": f"Wallet topup for user {user.id}",
        "order_tags": {
            "user_id": str(user.id),
            "payment_type": "wallet_topup",
        },
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CF_BASE_URL}/orders",
            headers=CF_HEADERS,
            json=payload,
            timeout=20,
        )

    if response.status_code not in [200, 201]:
        raise HTTPException(
            400,
            f"Cashfree error: {response.text}"
        )

    data = response.json()

    return {
        "success": True,
        "order_id": data.get("order_id"),
        "payment_session_id": data.get("payment_session_id"),
        "amount": amount,
        "currency": "INR",
        "cashfree_env": CASHFREE_ENV,
        "user_name": user.full_name or user.email,
        "user_email": user.email,
    }


# =============================================================================
# 3. VERIFY PAYMENT
# =============================================================================

class VerifyPaymentRequest(BaseModel):
    order_id: str
    user_id: int
    amount: float


@router.post("/verify-payment")
async def verify_payment(data: VerifyPaymentRequest):

    _require_cashfree()

    ensure_db_connection()

    # ============================================================
    # FETCH ORDER
    # ============================================================

    async with httpx.AsyncClient() as client:

        response = await client.get(
            f"{CF_BASE_URL}/orders/{data.order_id}",
            headers=CF_HEADERS,
            timeout=20,
        )

    if response.status_code != 200:

        raise HTTPException(
            400,
            f"Could not verify order: {response.text}"
        )

    order_data = response.json()

    order_status = order_data.get(
        "order_status",
        ""
    )

    # ============================================================
    # VERIFY PAYMENT STATUS
    # ============================================================

    if order_status != "PAID":

        raise HTTPException(
            400,
            f"Payment not completed. Status: {order_status}"
        )

    # ============================================================
    # VERIFY PAYMENT EXISTS
    # ============================================================

    async with httpx.AsyncClient() as client:

        payments_response = await client.get(
            f"{CF_BASE_URL}/orders/{data.order_id}/payments",
            headers=CF_HEADERS,
            timeout=20,
        )

    if payments_response.status_code != 200:

        raise HTTPException(
            400,
            "Failed to fetch payment details"
        )

    payments = payments_response.json()

    successful_payment = next(
        (
            p for p in payments
            if p.get("payment_status") == "SUCCESS"
        ),
        None
    )

    if not successful_payment:

        raise HTTPException(
            400,
            "No successful payment found"
        )

    # ============================================================
    # VALIDATE TAGS
    # ============================================================

    tags = order_data.get("order_tags", {})

    payment_type = tags.get("payment_type")

    if payment_type != "wallet_topup":

        raise HTTPException(
            400,
            f"Invalid payment type: {payment_type}"
        )

    cf_user_id = tags.get("user_id")

    if str(cf_user_id) != str(data.user_id):

        raise HTTPException(
            400,
            "User mismatch"
        )

    # ============================================================
    # GET USER
    # ============================================================

    try:

        user = await sync_to_async(
            UserData.objects.get
        )(id=data.user_id)

    except UserData.DoesNotExist:

        raise HTTPException(
            404,
            "User not found"
        )

    wallet = await sync_to_async(
        _get_wallet
    )(user)

    # ============================================================
    # DUPLICATE CHECK
    # ============================================================

    already_credited = await sync_to_async(
    WalletTransaction.objects.filter(
        wallet=wallet,
        transaction_type=f"Deposit [{data.order_id}]",
    ).exists
)()

    # ============================================================
    # CREDIT WALLET
    # ============================================================

    if not already_credited:

        cf_amount = float(
            order_data.get("order_amount", 0)
        )

        if cf_amount <= 0:

            raise HTTPException(
                400,
                "Invalid Cashfree amount"
            )

        wallet.balance = Decimal(str(wallet.balance or 0)) + Decimal(str(cf_amount))

        await sync_to_async(wallet.save)()

        await sync_to_async(_record_tx)(
            wallet,
            Decimal(str(cf_amount)),
            f"Deposit [{data.order_id}]",
            user=user,
        )

        # ========================================================
        # NOTIFICATION
        # ========================================================

        await sync_to_async(create_notification)(
            user=user,
            notification_type="wallet_deposit",
            title="Funds Added Successfully",
            message=(
                f"₹{cf_amount} has been added "
                f"to your wallet successfully."
            ),
            url="/choose-payment"
        )

        # print(
        #     f"🔔 Wallet deposit "
        #     f"notification created "
        #     f"for {user.email}"
        # )

    # ============================================================
    # SUCCESS RESPONSE
    # ============================================================

    return {
        "success": True,
        "message": "Payment verified and wallet credited",
        "order_status": order_status,
        "order_id": data.order_id,
        "already_credited": already_credited,
        "new_balance": float(wallet.balance),
    }


# =============================================================================
# 4. INTERNAL TRANSFER (UPDATED with milestone support)
# =============================================================================

class InternalTransferRequest(BaseModel):
    creator_id: int
    collaborator_email: str
    amount: float
    contract_id: Optional[int] = None
    is_milestone_payment: Optional[bool] = False
    milestone_index: Optional[int] = None


# =============================================================================
# 4. INTERNAL TRANSFER (COMPLETE - FIXED VERSION)
# =============================================================================

class InternalTransferRequest(BaseModel):
    creator_id: int
    collaborator_email: str
    amount: float
    contract_id: Optional[int] = None
    is_milestone_payment: Optional[bool] = False
    milestone_index: Optional[int] = None


@router.post("/internal-transfer")
async def internal_transfer(data: InternalTransferRequest):
    # print("=" * 60)
    # print("💰 INTERNAL TRANSFER REQUEST")
    # print(f"Creator ID: {data.creator_id}")
    # print(f"Collaborator Email: {data.collaborator_email}")
    # print(f"Amount: {data.amount}")
    # print(f"Contract ID: {data.contract_id}")
    # print(f"Is Milestone Payment: {data.is_milestone_payment}")
    # print(f"Milestone Index: {data.milestone_index}")
    # print("=" * 60)
    
    await sync_to_async(ensure_db_connection)()

    # ============================================================
    # 1. GET USERS
    # ============================================================
    try:
        creator = await sync_to_async(UserData.objects.get)(id=data.creator_id)
        # print(f"✅ Creator found: {creator.email}")
    except UserData.DoesNotExist:
        # print("❌ Creator not found")
        raise HTTPException(404, "Creator not found")

    collaborator = await sync_to_async(
        UserData.objects.filter(email__iexact=data.collaborator_email).first
    )()
    if not collaborator:
        # print(f"❌ Collaborator not found: {data.collaborator_email}")
        raise HTTPException(404, "Collaborator not found")
    # print(f"✅ Collaborator found: {collaborator.email}")

    amount = Decimal(str(data.amount))

    # ============================================================
    # 2. GET AND VALIDATE CONTRACT
    # ============================================================
    contract = None
    if data.contract_id:
        try:
            contract = await sync_to_async(Contract.objects.get)(id=data.contract_id)
            # print(f"✅ Contract found: ID {contract.id}, Status: {contract.status}")
            
            # Validate contract ownership
            if contract.creator_id != creator.id or contract.collaborator_id != collaborator.id:
                # print(f"❌ Contract mismatch")
                raise HTTPException(403, "Contract does not match the given creator and collaborator")
            
            # ============================================================
            # 3. GET AND PARSE MILESTONES DATA
            # ============================================================
            milestones = None
            
            # Check if milestones_data exists
            if hasattr(contract, 'milestones_data') and contract.milestones_data:
                milestones = contract.milestones_data
                
                # If it's a string, parse it
                if isinstance(milestones, str):
                    import json
                    try:
                        milestones = json.loads(milestones)
                        # print(f"✅ Parsed milestones from JSON string")
                    except json.JSONDecodeError:
                        # print(f"❌ Failed to parse milestones JSON")
                        milestones = []
                
                # print(f"📊 Milestones loaded: {len(milestones) if milestones else 0} items")
                if milestones:
                    for i, m in enumerate(milestones):
                        pass
                        # print(f"   Milestone {i}: {m.get('description', 'N/A')} - status: {m.get('status', 'N/A')}")
            
            # If no milestones, treat as regular contract
            if not milestones:
                # print(f"⚠️ No milestones data for contract {contract.id}, treating as regular contract")
                milestones = []
            
            # ============================================================
            # 4. VALIDATE MILESTONE PAYMENT
            # ============================================================
            if data.is_milestone_payment:
                # Check if contract is in correct status
                if contract.status not in ["in_review", "in_progress"]:
                    # print(f"❌ Invalid contract status for milestone payment: {contract.status}")
                    raise HTTPException(400, f"Contract status '{contract.status}' does not allow milestone payment")
                
                # Check milestone_index is provided
                if data.milestone_index is None:
                    # print("❌ Milestone index is required for milestone payment")
                    raise HTTPException(400, "Milestone index is required for milestone payment")
                
                # Check if milestones exist
                if not milestones:
                    # print("❌ No milestones found in contract")
                    raise HTTPException(400, "No milestones found for this contract")
                
                # Check milestone index range
                if data.milestone_index >= len(milestones):
                    # print(f"❌ Invalid milestone index: {data.milestone_index}, max: {len(milestones)-1}")
                    raise HTTPException(400, f"Invalid milestone index. Valid range: 0 to {len(milestones)-1}")
                
                # Check milestone status
                milestone = milestones[data.milestone_index]
                if milestone.get('status') not in ['submitted', 'in_progress']:
                    # print(f"❌ Milestone {data.milestone_index} status is '{milestone.get('status')}', cannot pay")
                    raise HTTPException(400, f"Cannot pay milestone {data.milestone_index + 1}. Current status: {milestone.get('status')}. Only 'submitted' or 'in_progress' milestones can be paid.")
                
                # print(f"✅ Milestone validation passed: {milestone.get('description')} - amount: {milestone.get('amount')}")
                
            else:
                # Full contract payment validation
                if contract.status not in ["in_review", "in_progress", "awaiting"]:
                    # print(f"❌ Invalid contract status for full payment: {contract.status}")
                    raise HTTPException(400, f"Contract status '{contract.status}' does not allow payment")
                
                if contract.is_paid:
                    # print("❌ Contract already fully paid")
                    raise HTTPException(400, "This contract has already been fully paid")
                    
        except Contract.DoesNotExist:
            # print(f"❌ Contract not found: {data.contract_id}")
            raise HTTPException(404, "Contract not found")

    # ============================================================
    # 5. TRANSFER FUNDS
    # ============================================================
    creator_wallet = await sync_to_async(_get_wallet)(creator)
    collaborator_wallet = await sync_to_async(_get_wallet)(collaborator)

    # print(f"💰 Creator wallet balance: ${creator_wallet.balance}")
    # print(f"💰 Collaborator wallet balance: ${collaborator_wallet.balance}")

    if creator_wallet.balance < amount:
        # print(f"❌ Insufficient balance: ${creator_wallet.balance} < ${amount}")
        raise HTTPException(400, f"Insufficient balance. Available: ${creator_wallet.balance}, Required: ${amount}")

    # Perform transfer
    creator_wallet.balance = (
    Decimal(str(creator_wallet.balance))
    - amount
)

    collaborator_wallet.balance = (
    Decimal(str(collaborator_wallet.balance))
    + amount
)
    await sync_to_async(creator_wallet.save)()
    await sync_to_async(collaborator_wallet.save)()
    
    # print(f"✅ Transfer complete! Creator balance: ${creator_wallet.balance}")

    # ============================================================
    # 6. UPDATE CONTRACT AND MILESTONES
    # ============================================================
    if contract:
        if data.is_milestone_payment and data.milestone_index is not None and milestones:
            milestone_num = data.milestone_index + 1
            
            # Update the milestone
            milestones[data.milestone_index]["status"] = "paid"
            milestones[data.milestone_index]["payment"] = {
                "amount": float(amount),
                "paid_at": datetime.now().isoformat(),
                "transaction_id": f"TXN_{uuid.uuid4().hex[:8]}"
            }
            
            # Update total paid
            contract.total_paid = (contract.total_paid or 0) + amount
            
            # Update contract status if it was in_review
            if contract.status == "in_review":
                contract.status = "in_progress"
                # print("📝 Contract status: in_review → in_progress")
            
            # Check if all milestones are paid
            all_paid = all(m.get("status") == "paid" for m in milestones)
            if all_paid:
                contract.status = "completed"
                contract.completed_at = datetime.now()
                # print("📝 All milestones paid! Contract → completed")
            else:
                # Activate next pending milestone
                for i, m in enumerate(milestones):
                    if m.get("status") == "pending" and i > data.milestone_index:
                        m["status"] = "in_progress"
                        contract.current_milestone = i
                        # print(f"📝 Activated milestone {i + 1}: {m.get('description')}")
                        break
            
            # Save milestones back to contract
            contract.milestones_data = milestones
            
            # Save contract
            await sync_to_async(contract.save)()
            # print(f"✅ Contract saved - Status: {contract.status}, current_milestone: {contract.current_milestone}, total_paid: {contract.total_paid}")
            
            # Record transactions
            transaction_type = f"Milestone #{milestone_num} Payment for Contract #{contract.id}"
            received_type = f"Milestone #{milestone_num} Payment Received for Contract #{contract.id}"
            
            await sync_to_async(_record_tx)(
                creator_wallet,
                amount,
                transaction_type,
                from_user=creator,
                to_user=collaborator,
            )
            await sync_to_async(_record_tx)(
                collaborator_wallet,
                amount,
                received_type,
                from_user=creator,
                to_user=collaborator,
            )
            
            # Create notifications
            await sync_to_async(create_notification)(
                user=creator,
                notification_type='payment_sent',
                title=f'Milestone #{milestone_num} Payment Sent',
                message=f'You paid ${amount} to {collaborator.full_name or collaborator.email} for milestone',
                sender=collaborator,
                contract=contract,
                url='/choose-payment'
            )
            await sync_to_async(create_notification)(
                user=collaborator,
                notification_type='payment_received',
                title=f'Milestone #{milestone_num} Payment Received',
                message=f'You received ${amount} from {creator.full_name or creator.email} for milestone',
                sender=creator,
                contract=contract,
                url='/transaction'
            )
            
            return {
                "success": True,
                "message": f"${data.amount} transferred successfully for milestone #{milestone_num}",
                "creator_balance": float(creator_wallet.balance),
                "collaborator_balance": float(collaborator_wallet.balance),
                "contract_paid": bool(contract),
                "is_milestone_payment": True,
                "milestone_index": data.milestone_index,
                "contract_status": contract.status,
                "all_milestones_paid": all_paid
            }
            
        else:
            # Full contract payment
            transaction_type = f"Contract Payment #{contract.id}"
            received_type = f"Payment Received for Contract #{contract.id}"
            
            contract.is_paid = True
            contract.status = "completed"
            contract.completed_at = datetime.now()
            await sync_to_async(contract.save)()
            
            await sync_to_async(_record_tx)(
                creator_wallet,
                amount,
                transaction_type,
                from_user=creator,
                to_user=collaborator,
            )
            await sync_to_async(_record_tx)(
                collaborator_wallet,
                amount,
                received_type,
                from_user=creator,
                to_user=collaborator,
            )
            
            await sync_to_async(create_notification)(
                user=creator,
                notification_type='payment_sent',
                title='Payment Sent Successfully',
                message=f'You paid ₹{amount} to {collaborator.full_name or collaborator.email}',
                sender=collaborator,
                contract=contract,
                url='/choose-payment'
            )
            await sync_to_async(create_notification)(
                user=collaborator,
                notification_type='payment_received',
                title='Payment Received',
                message=f'You received ₹{amount} from {creator.full_name or creator.email}',
                sender=creator,
                contract=contract,
                url='/transaction'
            )
            
            return {
                "success": True,
                "message": f"₹{data.amount} transferred successfully for contract #{contract.id}",
                "creator_balance": float(creator_wallet.balance),
                "collaborator_balance": float(collaborator_wallet.balance),
                "contract_paid": True,
                "is_milestone_payment": False,
                "milestone_index": None,
                "contract_status": contract.status,
                "all_milestones_paid": True
            }

    # ============================================================
    # 7. GENERAL TRANSFER (NO CONTRACT)
    # ============================================================
    await sync_to_async(_record_tx)(
        creator_wallet,
        amount,
        f"General Transfer to {collaborator.email}",
        from_user=creator,
        to_user=collaborator,
    )
    await sync_to_async(_record_tx)(
        collaborator_wallet,
        amount,
        f"General Transfer from {creator.email}",
        from_user=creator,
        to_user=collaborator,
    )

    return {
        "success": True,
        "message": f"${data.amount} transferred successfully",
        "creator_balance": float(creator_wallet.balance),
        "collaborator_balance": float(collaborator_wallet.balance),
        "contract_paid": False,
        "is_milestone_payment": False,
        "milestone_index": None,
        "contract_status": None,
        "all_milestones_paid": False
    }

# =============================================================================
# 5. MULTIPLE WITHDRAWAL METHODS (BANK & UPI)
# =============================================================================

class BankBeneficiaryRequest(BaseModel):
    user_id: int
    bank_account: str
    ifsc_code: str
    account_holder: str
    email: str | None = None
    phone: str | None = None


class UpiBeneficiaryRequest(BaseModel):
    user_id: int
    upi_id: str
    account_holder: str
    email: str | None = None
    phone: str | None = None


@router.post("/register-bank-beneficiary")
async def register_bank_beneficiary(data: BankBeneficiaryRequest):
    ensure_db_connection()

    try:
        user = await sync_to_async(
            UserData.objects.get
        )(id=data.user_id)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")

    bene_id = f"bank_{uuid.uuid4().hex[:10]}"

    token = await _get_payout_token()

    payload = {
        "beneId": bene_id,
        "name": data.account_holder,
        "email": data.email or user.email or "test@example.com",
        "phone": data.phone or "9999999999",
        "bankAccount": data.bank_account,
        "ifsc": data.ifsc_code,
        "address1": "India",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CF_PAYOUT_URL}/addBeneficiary",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=20,
        )

    if response.status_code not in [200, 201]:
        raise HTTPException(
            400,
            f"Bank beneficiary registration failed: {response.text}"
        )

    # Store withdrawal method in user profile
    withdrawal_methods = getattr(user, 'withdrawal_methods', [])
    if not withdrawal_methods:
        withdrawal_methods = []

    # Mask account number for display
    masked_account = f"XXXX{data.bank_account[-4:]}" if len(data.bank_account) >= 4 else "XXXX"

    withdrawal_methods.append({
        "id": bene_id,
        "type": "bank",
        "account_holder": data.account_holder,
        "account_detail": masked_account,
        "full_account": data.bank_account,
        "ifsc": data.ifsc_code,
        "is_default": len(withdrawal_methods) == 0  # First method becomes default
    })

    user.withdrawal_methods = withdrawal_methods
    await sync_to_async(user.save)()

    # Create notification based on user role
    try:
        is_creator = await sync_to_async(
            CreatorProfile.objects.filter(user=user).exists
        )()
        is_collaborator = await sync_to_async(
            CollaboratorProfile.objects.filter(user=user).exists
        )()

        if is_creator:
            await sync_to_async(create_notification)(
                user=user,
                notification_type="wallet_withdrawal",  # or "payment_method"
                title="Bank Account Added",
                message=(
                    f"Your bank account (ending {masked_account}) has been "
                    f"registered for withdrawals."
                ),
                url="/choose-payment"
            )

        if is_collaborator:
            await sync_to_async(create_notification)(
                user=user,
                notification_type="wallet_withdrawal",
                title="Bank Account Added",
                message=(
                    f"Your bank account (ending {masked_account}) has been "
                    f"registered for withdrawals."
                ),
                url="/finance-overview"
            )
    except Exception as e:
        # Log but don't fail the request
        pass

    return {
        "success": True,
        "beneficiary_id": bene_id,
        "message": "Bank account registered successfully",
    }


@router.post("/register-upi-beneficiary")
async def register_upi_beneficiary(data: UpiBeneficiaryRequest):
    ensure_db_connection()

    try:
        user = await sync_to_async(
            UserData.objects.get
        )(id=data.user_id)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")

    bene_id = f"upi_{uuid.uuid4().hex[:10]}"

    token = await _get_payout_token()

    # Register UPI beneficiary with Cashfree
    payload = {
        "beneId": bene_id,
        "name": data.account_holder,
        "email": data.email or user.email or "test@example.com",
        "phone": data.phone or "9999999999",
        "vpa": data.upi_id,
        "address1": "India",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CF_PAYOUT_URL}/addBeneficiary",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=20,
        )

    if response.status_code not in [200, 201]:
        raise HTTPException(
            400,
            f"UPI beneficiary registration failed: {response.text}"
        )

    # Store withdrawal method in user profile
    withdrawal_methods = getattr(user, 'withdrawal_methods', [])
    if not withdrawal_methods:
        withdrawal_methods = []

    withdrawal_methods.append({
        "id": bene_id,
        "type": "upi",
        "account_holder": data.account_holder,
        "account_detail": data.upi_id,
        "full_account": data.upi_id,
        "is_default": len(withdrawal_methods) == 0  # First method becomes default
    })

    user.withdrawal_methods = withdrawal_methods
    await sync_to_async(user.save)()

    try:
        is_creator = await sync_to_async(
            CreatorProfile.objects.filter(user=user).exists
        )()
        is_collaborator = await sync_to_async(
            CollaboratorProfile.objects.filter(user=user).exists
        )()

        # Mask UPI ID for display (optional)
        upi_display = data.upi_id
        if len(upi_display) > 8:
            upi_display = upi_display[:3] + "****" + upi_display[-3:]

        if is_creator:
            await sync_to_async(create_notification)(
                user=user,
                notification_type="wallet_withdrawal",
                title="UPI ID Added",
                message=(
                    f"Your UPI ID ({upi_display}) has been registered "
                    f"for withdrawals."
                ),
                url="/choose-payment"
            )

        if is_collaborator:
            await sync_to_async(create_notification)(
                user=user,
                notification_type="wallet_withdrawal",
                title="UPI ID Added",
                message=(
                    f"Your UPI ID ({upi_display}) has been registered "
                    f"for withdrawals."
                ),
                url="/finance-overview"
            )
    except Exception as e:
        # Log error but do not fail the request
        pass
    return {
        "success": True,
        "beneficiary_id": bene_id,
        "message": "UPI ID registered successfully",
    }


@router.get("/withdrawal-methods")
async def get_withdrawal_methods(user_id: int):
    """Get all withdrawal methods for a user"""
    ensure_db_connection()

    try:
        user = await sync_to_async(
            UserData.objects.get
        )(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")

    withdrawal_methods = getattr(user, 'withdrawal_methods', [])
    
    # Remove sensitive full account details for security
    safe_methods = []
    for method in withdrawal_methods:
        safe_method = method.copy()
        safe_method.pop('full_account', None)
        safe_method.pop('ifsc', None)  # Remove IFSC for security
        safe_methods.append(safe_method)
    
    return {
        "methods": safe_methods,
        "has_methods": len(safe_methods) > 0
    }


@router.delete("/withdrawal-method/{method_id}")
async def remove_withdrawal_method(user_id: int, method_id: str):
    """Remove a withdrawal method"""
    ensure_db_connection()

    try:
        user = await sync_to_async(
            UserData.objects.get
        )(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")

    withdrawal_methods = getattr(user, 'withdrawal_methods', [])
    
    # Filter out the method to remove
    updated_methods = [m for m in withdrawal_methods if m.get('id') != method_id]
    
    # If we removed the default method, set a new default if any methods remain
    if updated_methods and not any(m.get('is_default') for m in updated_methods):
        updated_methods[0]['is_default'] = True
    
    user.withdrawal_methods = updated_methods
    await sync_to_async(user.save)()

    return {
        "success": True,
        "message": "Withdrawal method removed successfully"
    }


@router.post("/set-default-method/{method_id}")
async def set_default_withdrawal_method(user_id: int, method_id: str):
    """Set a withdrawal method as default"""
    ensure_db_connection()

    try:
        user = await sync_to_async(
            UserData.objects.get
        )(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")

    withdrawal_methods = getattr(user, 'withdrawal_methods', [])
    
    # Update is_default flags
    for method in withdrawal_methods:
        method['is_default'] = (method.get('id') == method_id)
    
    user.withdrawal_methods = withdrawal_methods
    await sync_to_async(user.save)()

    return {
        "success": True,
        "message": "Default withdrawal method updated"
    }


# =============================================================================
# 6. WITHDRAW (UPDATED to support multiple methods)
# =============================================================================

class WithdrawRequest(BaseModel):
    user_id: int
    amount: float
    method_id: str | None = None  # Optional, uses default if not specified


@router.post("/withdraw")
async def withdraw(data: WithdrawRequest):
    ensure_db_connection()

    try:
        user = await sync_to_async(
            UserData.objects.get
        )(id=data.user_id)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")

    wallet = await sync_to_async(
        _get_wallet
    )(user)

    amount = Decimal(str(data.amount))

    if wallet.balance < amount:
        raise HTTPException(
            400,
            "Insufficient balance"
        )

    # Get withdrawal methods
    withdrawal_methods = getattr(user, 'withdrawal_methods', [])
    
    if not withdrawal_methods:
        raise HTTPException(
            400,
            "No withdrawal method registered"
        )
    
    # Select the withdrawal method
    selected_method = None
    if data.method_id:
        selected_method = next(
            (m for m in withdrawal_methods if m.get('id') == data.method_id),
            None
        )
        if not selected_method:
            raise HTTPException(400, "Selected withdrawal method not found")
    else:
        # Use default method
        selected_method = next(
            (m for m in withdrawal_methods if m.get('is_default')),
            withdrawal_methods[0]  # Fallback to first if no default
        )

    transfer_id = _unique_order_id("withdraw")
    token = await _get_payout_token()

    # Prepare payload based on method type
    if selected_method['type'] == 'bank':
        payload = {
            "beneId": selected_method['id'],
            "amount": str(data.amount),
            "transferId": transfer_id,
            "transferMode": "banktransfer",
            "remarks": "Wallet withdrawal to bank",
        }
    else:  # UPI
        payload = {
            "beneId": selected_method['id'],
            "amount": str(data.amount),
            "transferId": transfer_id,
            "transferMode": "upi",
            "remarks": "Wallet withdrawal to UPI",
        }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{CF_PAYOUT_URL}/directTransfer",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=20,
        )

    if response.status_code not in [200, 201]:
        raise HTTPException(
            400,
            f"Payout failed: {response.text}"
        )

    # TEMPORARY HOLD
    wallet.balance -= amount
    await sync_to_async(wallet.save)()

    await sync_to_async(_record_tx)(
        wallet,
        amount,
        f"Withdrawal Pending [{transfer_id}] to {selected_method['type']}",
        user=user,
    )
    
    # ==========================================================
    # WITHDRAWAL NOTIFICATIONS
    # ==========================================================
    try:

        is_creator = await sync_to_async(
            CreatorProfile.objects.filter(user=user).exists
        )()

        is_collaborator = await sync_to_async(
            CollaboratorProfile.objects.filter(user=user).exists
        )()

    # Creator Notification
        if is_creator:

            await sync_to_async(create_notification)(
                user=user,
                notification_type="wallet_withdrawal",
                title="Withdrawal Initiated",
                message=(
                    f"₹{amount} withdrawal request has been submitted successfully."
                ),
                url="/choose-payment"
            )

        # Collaborator Notification
        if is_collaborator:

            await sync_to_async(create_notification)(
                user=user,
                notification_type="wallet_withdrawal",
                title="Withdrawal Initiated",
                message=(
                    f"₹{amount} withdrawal request has been submitted successfully."
                ),
                url="/transaction"
            )
    except Exception as notification_error:
        pass
        # print(
        #     f"Withdrawal Notification Error: "
        #     f"{notification_error}"
        # )           

 

    return {
        "success": True,
        "status": "success",
        "message": f"Withdrawal initiated to {selected_method['type']}",
        "transfer_id": transfer_id,
        "method_type": selected_method['type'],
        "method_detail": selected_method['account_detail'],
        "new_balance": float(wallet.balance),
        "balance": float(wallet.balance),
    }

# =============================================================================
# 7. TRANSACTIONS
# =============================================================================

@router.get("/transactions")
def transactions(user_id: int):
    ensure_db_connection()

    try:
        user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        return []

    result = []

    txs = WalletTransaction.objects.order_by("-created_at")

    for tx in txs:

        show = False

        # deposits / withdrawals
        if tx.user_id == user.id:
            show = True

        # creator should only see payment sent records
        elif (
            tx.from_user_id == user.id
            and "received" not in tx.transaction_type.lower()
        ):
            show = True

        # collaborator should only see received records
        elif (
            tx.to_user_id == user.id
            and "received" in tx.transaction_type.lower()
        ):
            show = True

        if show:
            result.append({
                "id": tx.id,
                "type": tx.transaction_type,
                "amount": float(tx.amount),
                "date": tx.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "from_user": (
    tx.from_user.full_name
    if tx.from_user and tx.from_user.full_name
    else tx.from_user.email if tx.from_user else None
),

"to_user": (
    tx.to_user.full_name
    if tx.to_user and tx.to_user.full_name
    else tx.to_user.email if tx.to_user else None
),
            })

    return result

# =============================================================================
# 8. WALLET STATUS (UPDATED)
# =============================================================================

@router.get("/wallet-status")
async def wallet_status(user_id: int):
    ensure_db_connection()

    try:
        user = await sync_to_async(
            UserData.objects.get
        )(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")

    withdrawal_methods = getattr(user, 'withdrawal_methods', [])
    has_methods = len(withdrawal_methods) > 0

    return {
        "isReady": True,
        "canDeposit": True,
        "canTransfer": True,
        "canWithdraw": has_methods,
        "hasBeneficiary": has_methods,
        "withdrawal_methods_count": len(withdrawal_methods),
    }


# =============================================================================
# 9. WEBHOOKS
# =============================================================================

@router.post("/cashfree-webhook")
async def cashfree_webhook(request: Request):
    ensure_db_connection()

    body = await request.body()
    signature = request.headers.get("x-webhook-signature", "")

    if not _verify_cashfree_webhook(body, signature):
        raise HTTPException(400, "Invalid webhook signature")

    try:
        payload = json.loads(body)
    except Exception as e:
        raise HTTPException(400, f"Invalid payload: {e}")

    event_type = str(payload.get("type", "")).lower()
    # print(f"🔔 Cashfree webhook: {event_type}")

    # SUCCESS PAYMENT
    if event_type in [
        "payment_success_webhook",
        "success payment",
    ]:
        data = payload.get("data", {})
        order_data = data.get("order", {})
        payment_data = data.get("payment", {})

        order_id = order_data.get("order_id")
        order_tags = order_data.get("order_tags", {})

        payment_type = order_tags.get("payment_type")

        user_id = order_tags.get("user_id")

        amount = float(order_data.get("order_amount", 0))

    if (
    payment_type == "wallet_topup"
    and user_id
    and amount > 0
):
        pass
        # print(
    #     f"✅ Payment success webhook received "
    #     f"for order {order_id}"
    # )

    elif event_type in [
        "failed payment",
        "payment_failed_webhook",
    ]:
        pass
        # print("❌ Payment failed")

    return {
        "success": True,
        "event": event_type,
    }


@router.post("/payout-webhook")
async def payout_webhook(request: Request):
    ensure_db_connection()

    body = await request.body()

    try:
        payload = json.loads(body)
    except Exception as e:
        raise HTTPException(400, f"Invalid payload: {e}")

    # print("💸 Payout webhook received")

    event_type = str(payload.get("event", "")).lower()
    data = payload.get("data", {})

    transfer_id = (
        data.get("transfer", {})
        .get("transferId")
    )

    status = (
        data.get("transfer", {})
        .get("status", "")
        .lower()
    )

    # print(f"💸 Transfer: {transfer_id} | Status: {status}")

    # SUCCESS
    if status in [
        "success",
        "processed",
    ]:
        pass
        # print(f"✅ Withdrawal successful: {transfer_id}")

    # FAILED
    elif status in [
        "failed",
        "reversed",
    ]:
        try:
            tx = await sync_to_async(
                WalletTransaction.objects.filter(
                    transaction_type__icontains=transfer_id
                ).first
            )()

            if tx:
                wallet = tx.wallet
                wallet.balance += tx.amount
                await sync_to_async(wallet.save)()
                tx.transaction_type = f"Withdrawal Failed [{transfer_id}]"
                await sync_to_async(tx.save)()
                # print(f"💰 Refunded wallet for failed payout")
        except Exception as e:
            pass
            # print(f"❌ Payout webhook error: {e}")

    return {
        "success": True,
    }


# =============================================================================
# 10. COLLABORATOR VERIFICATION (for internal transfer)
# =============================================================================

class VerifyCollaboratorRequest(BaseModel):
    email: str


@router.post("/verify-collaborator")
async def verify_collaborator(data: VerifyCollaboratorRequest):
    """Check if a collaborator exists by email."""
    ensure_db_connection()
    exists = await sync_to_async(
        UserData.objects.filter(email__iexact=data.email).exists
    )()
    return {"exists": exists}


@router.get("/collaborator-status")
async def collaborator_status(
    email: str,
    creator_id: int,
    contract_id: Optional[int] = None,
):
    """Return contract & payment readiness status between creator and collaborator."""
    ensure_db_connection()

    try:
        creator = await sync_to_async(UserData.objects.get)(id=creator_id)
    except UserData.DoesNotExist:
        raise HTTPException(404, "Creator not found")

    collaborator = await sync_to_async(
        UserData.objects.filter(email__iexact=email).first
    )()
    
    if not collaborator:
        return {
            "exists": False,
            "isReadyForPayment": False,
            "hasContract": False,
            "contractExists": False,
            "contractBudget": None,
            "isPaid": False,
            "contractId": None,
            "message": "Collaborator not found",
        }

    # ✅ If contract_id is provided, use that specific contract
    if contract_id:
        try:
            contract = await sync_to_async(Contract.objects.get)(id=contract_id)
            # Verify contract belongs to this creator and collaborator
            if contract.creator_id != creator.id or contract.collaborator_id != collaborator.id:
                return {
                    "exists": True,
                    "isReadyForPayment": False,
                    "hasContract": False,
                    "contractExists": False,
                    "contractBudget": None,
                    "isPaid": False,
                    "contractId": None,
                    "message": "Contract does not match the given creator and collaborator",
                }
            
            # ✅ CRITICAL FIX: Check if contract has milestones
            has_milestones = False
            if hasattr(contract, 'milestones_data') and contract.milestones_data:
                milestones = contract.milestones_data
                if isinstance(milestones, str):
                    import json
                    try:
                        milestones = json.loads(milestones)
                    except:
                        milestones = []
                has_milestones = len(milestones) > 0
            
            # ✅ For contracts WITH milestones: Look for submitted milestone
            if has_milestones:
                has_submitted_milestone = False
                milestone_amount = None
                
                for milestone in milestones:
                    if milestone.get('status') == 'submitted':
                        has_submitted_milestone = True
                        milestone_amount = milestone.get('amount')
                        break
                
                if has_submitted_milestone:
                    return {
                        "exists": True,
                        "isReadyForPayment": True,
                        "hasContract": True,
                        "contractExists": True,
                        "contractBudget": float(milestone_amount) if milestone_amount else float(contract.budget),
                        "isPaid": False,
                        "contractId": contract.id,
                        "message": f"Ready to pay milestone ₹{milestone_amount}",
                    }
                else:
                    return {
                        "exists": True,
                        "isReadyForPayment": False,
                        "hasContract": True,
                        "contractExists": True,
                        "contractBudget": float(contract.budget),
                        "isPaid": contract.is_paid,
                        "contractId": contract.id,
                        "message": "No submitted milestone found for this contract",
                    }
            else:
                # ✅ For contracts WITHOUT milestones: Check regular contract payment
                already_paid = contract.is_paid
                
                # Check if contract is ready for payment (work submitted or in_review)
                is_ready = contract.status in ["in_review", "in_progress"] and not already_paid
                
                return {
                    "exists": True,
                    "isReadyForPayment": is_ready,
                    "hasContract": True,
                    "contractExists": True,
                    "contractBudget": float(contract.budget),
                    "isPaid": already_paid,
                    "contractId": contract.id,
                    "message": "Ready to transfer" if is_ready else "Contract not ready for payment yet",
                }
                
        except Contract.DoesNotExist:
            return {
                "exists": True,
                "isReadyForPayment": False,
                "hasContract": False,
                "contractExists": False,
                "contractBudget": None,
                "isPaid": False,
                "contractId": None,
                "message": "Contract not found",
            }
    
    # ✅ Fallback: Find any contract (old behavior)
    contract = await sync_to_async(
        Contract.objects.filter(
            creator_id=creator_id,
            collaborator__email__iexact=email,
            status__in=[
                "awaiting",
                "in_progress",
                "in_review",
            ]
        ).order_by("-id").first
    )()

    if not contract:
        return {
            "exists": True,
            "isReadyForPayment": False,
            "hasContract": False,
            "contractExists": False,
            "contractBudget": None,
            "isPaid": False,
            "contractId": None,
            "message": "No approved contract found with this collaborator",
        }

    # Check if contract has milestones
    has_milestones = False
    if hasattr(contract, 'milestones_data') and contract.milestones_data:
        milestones = contract.milestones_data
        if isinstance(milestones, str):
            import json
            try:
                milestones = json.loads(milestones)
            except:
                milestones = []
        has_milestones = len(milestones) > 0
    
    # For milestone contracts, require submitted milestone
    if has_milestones:
        has_submitted_milestone = any(m.get('status') == 'submitted' for m in milestones)
        if not has_submitted_milestone:
            return {
                "exists": True,
                "isReadyForPayment": False,
                "hasContract": True,
                "contractExists": True,
                "contractBudget": float(contract.budget),
                "isPaid": False,
                "contractId": contract.id,
                "message": "No milestone work submitted yet",
            }
    
    already_paid = contract.is_paid
    
    return {
        "exists": True,
        "isReadyForPayment": True,
        "hasContract": True,
        "contractExists": True,
        "contractBudget": float(contract.budget),
        "isPaid": already_paid,
        "contractId": contract.id,
        "message": "Ready to transfer" if not already_paid else "Contract already paid",
    }