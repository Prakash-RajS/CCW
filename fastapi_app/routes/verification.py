import os
import sys
import django
import smtplib
import random
import re
import time
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from asgiref.sync import sync_to_async
from twilio.rest import Client
from dotenv import load_dotenv 
import jwt
import hashlib
import logging

# --- LOAD ENV FILE ---
load_dotenv() 

# --- SETUP ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creator_backend.settings')
django.setup()

# --- IMPORTS ---
from creator_app.models import UserVerification, UserData
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from fastapi_app.routes.dbconnection import ensure_db_connection  # Import the database connection helper
from fastapi_app.services.notification_service import create_notification

# --- LOGGING ---
logger = logging.getLogger(__name__)

# --- LOAD KEYS FROM ENV ---
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE_NUMBER")

# Email Settings - LOAD FROM ENV
EMAIL_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("SMTP_PORT", "587"))
EMAIL_USER = os.getenv("SMTP_USER")
EMAIL_PASSWORD = os.getenv("SMTP_PASS")

# JWT Settings for OTP (same as auth.py)
OTP_SECRET = os.getenv("OTP_SECRET", os.getenv("SECRET_KEY", "your_super_secret_key_123"))
ALGORITHM = "HS256"
OTP_EXPIRY = 600  # 10 minutes (same as auth.py)
RESEND_COOLDOWN = 60  # 60 seconds

# Debugging: # print keys to terminal to verify they are loaded
# print("---------------------------------------------------")
# print(f"DEBUG CHECK: Twilio SID: {TWILIO_SID}")
# print(f"DEBUG CHECK: Twilio Phone: {TWILIO_PHONE}")
# print(f"DEBUG CHECK: Email User: {EMAIL_USER}")
# print(f"DEBUG CHECK: Email Host: {EMAIL_HOST}")
# print(f"DEBUG CHECK: OTP_SECRET configured: {'Yes' if OTP_SECRET else 'No'}")
# print("---------------------------------------------------")

router = APIRouter(prefix="/verification", tags=["Verification"])

# --- REQUEST MODELS ---
class PhoneVerificationRequest(BaseModel):
    email: str
    phone_number: str

class PhoneOTPVerify(BaseModel):
    email: str
    otp_code: str

class EmailVerificationRequest(BaseModel):
    email: str

class EmailOTPVerify(BaseModel):
    email: str
    otp_code: str

class FacebookTokenVerify(BaseModel):
    email: str
    access_token: str


# ==================================================================
# STATELESS JWT HELPER FUNCTIONS (Same as auth.py)
# ==================================================================
def create_otp_token(email: str, otp: int, purpose: str) -> str:
    """Create signed JWT containing OTP hash - stateless"""
    payload = {
        "email": email,
        "otp_hash": hashlib.sha256(f"{otp}{OTP_SECRET}".encode()).hexdigest(),
        "purpose": purpose,
        "exp": datetime.utcnow() + timedelta(seconds=OTP_EXPIRY),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, OTP_SECRET, algorithm=ALGORITHM)


def verify_otp_token(token: str, otp: int, email: str, purpose: str) -> bool:
    """Verify OTP token without server-side storage"""
    try:
        payload = jwt.decode(token, OTP_SECRET, algorithms=[ALGORITHM])
        
        # Check email and purpose match
        if payload["email"] != email or payload["purpose"] != purpose:
            return False
        
        # Verify OTP hash
        expected_hash = hashlib.sha256(f"{otp}{OTP_SECRET}".encode()).hexdigest()
        return payload["otp_hash"] == expected_hash
        
    except jwt.ExpiredSignatureError:
        return False
    except jwt.PyJWTError:
        return False


def create_resend_cooldown_token(email: str, purpose: str) -> str:
    """Create a token to track resend cooldown"""
    payload = {
        "email": email,
        "purpose": f"{purpose}_cooldown",
        "exp": datetime.utcnow() + timedelta(seconds=RESEND_COOLDOWN)
    }
    return jwt.encode(payload, OTP_SECRET, algorithm=ALGORITHM)


def check_resend_cooldown(email: str, purpose: str, cooldown_token: str = None):
    """
    Check if resend is allowed based on cooldown token.
    Returns (is_allowed, new_cooldown_token)
    """
    if not cooldown_token:
        return True, create_resend_cooldown_token(email, purpose)
    
    try:
        payload = jwt.decode(cooldown_token, OTP_SECRET, algorithms=[ALGORITHM])
        if payload["email"] == email and payload["purpose"] == f"{purpose}_cooldown":
            # Token still valid = cooldown active
            return False, None
    except jwt.ExpiredSignatureError:
        # Cooldown expired, allow and create new token
        return True, create_resend_cooldown_token(email, purpose)
    except jwt.PyJWTError:
        return True, create_resend_cooldown_token(email, purpose)
    
    return False, None


# ==================================================================
# HELPER FUNCTIONS
# ==================================================================
def normalize_phone(phone: str) -> str:
    """Normalize phone number by removing all non-digit characters"""
    if not phone:
        return ""

    digits = ''.join(filter(str.isdigit, phone))

    # Remove +91 or 91 if present
    if digits.startswith("91") and len(digits) > 10:
        digits = digits[-10:]

    return digits


# ==================================================================
# 1. PHONE VERIFICATION (OTP) - STATELESS JWT VERSION
# ==================================================================
@router.post("/phone/send-otp")
async def send_phone_otp(request: PhoneVerificationRequest, cooldown_token: str = None):
    """Send OTP to phone - stateless JWT-based with cooldown"""
    
    # Check cooldown
    allowed, new_cooldown_token = check_resend_cooldown(request.email, "phone_verification", cooldown_token)
    if not allowed:
        raise HTTPException(
            status_code=429, 
            detail=f"Please wait {RESEND_COOLDOWN} seconds before requesting another OTP"
        )

    @sync_to_async
    def validate_user():
        ensure_db_connection()
        try:
            user = UserData.objects.get(email=request.email)
        except ObjectDoesNotExist:
            raise HTTPException(status_code=404, detail="Email not registered")

        if not user.phone_number or not user.phone_number.strip():
            raise HTTPException(
                status_code=400,
                detail="Please add your phone number in profile to verify"
            )

        db_phone = normalize_phone(user.phone_number)
        request_phone = normalize_phone(request.phone_number)

        if db_phone != request_phone:
            raise HTTPException(
                status_code=400,
                detail="Phone number does not match registered number"
            )

        return user

    user = await validate_user()

    # Generate OTP (6 digits)
    generated_otp = random.randint(100000, 999999)

    # Create JWT OTP token (stateless)
    otp_token = create_otp_token(request.email, generated_otp, "phone_verification")

    # print(f"✅ OTP generated for {request.email}: {generated_otp}")

    # Send SMS
    sms_sent = False
    sms_error = None
    try:
        if TWILIO_SID and TWILIO_TOKEN and TWILIO_PHONE:
            client = Client(TWILIO_SID, TWILIO_TOKEN)
            message = client.messages.create(
                body=f"Your verification OTP is: {generated_otp}",
                from_=TWILIO_PHONE,
                to=request.phone_number
            )
            # print(f"✅ SMS sent successfully. SID: {message.sid}")
            sms_sent = True
        else:
            # print("⚠️ Twilio credentials not configured. SMS not sent.")
            sms_error = "Twilio not configured"
    except Exception as e:
        # print(f"❌ SMS failed: {str(e)}")
        sms_error = str(e)

    response = {
        "status": "success", 
        "message": "OTP sent to registered phone",
        "sms_sent": sms_sent,
        "otp_token": otp_token,  # Return token for verification
        "cooldown_token": new_cooldown_token  # Return for rate limiting
    }

    # Only include debug OTP in development
    if os.getenv("DEBUG", "False").lower() == "true":
        response["debug_otp"] = generated_otp
        if sms_error:
            response["sms_error"] = sms_error

    return response


@router.post("/phone/verify-otp")
async def verify_phone_otp(request: PhoneOTPVerify, otp_token: str):
    """Verify phone OTP - stateless JWT-based"""

    # print(f"🔍 Verifying OTP for email: {request.email}, OTP: {request.otp_code}")

    # Stateless OTP verification using JWT
    if not verify_otp_token(
        otp_token,
        int(request.otp_code),
        request.email,
        "phone_verification"
    ):
        # print(f"❌ OTP verification failed for {request.email}")
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP"
        )

    @sync_to_async
    def mark_phone_verified():
        ensure_db_connection()

        try:
            # GET USER
            user = UserData.objects.get(email=request.email)

            # print(f"✅ User found: {user.email} (ID: {user.id})")

            # GET VERIFICATION RECORD
            verification = UserVerification.objects.filter(
                user=user
            ).first()

            # UPDATE EXISTING RECORD
            if verification:
                verification.phone_verified = True
                verification.phone_number = user.phone_number
                verification.updated_at = timezone.now()

                verification.save()

                # print("✅ Updated existing verification record")

            # CREATE NEW RECORD
            else:
                verification = UserVerification.objects.create(
                    user=user,
                    phone_verified=True,
                    phone_number=user.phone_number,
                    email_verified=False,
                    email=user.email,
                    updated_at=timezone.now()
                )

                # print("✅ Created new verification record")

            # CREATE NOTIFICATION
            try:
                create_notification(
                    user=user,
                    title="Phone Verification Completed",
                    message="Your phone number has been verified successfully.",
                    notification_type="verification",
                    # url="/profile"
                )

                # print(
                #     f"✅ Phone verification notification created for {user.email}"
                # )

            except Exception as notification_error:
                pass
                # print(
                #     f"❌ Failed to create notification: {notification_error}"
                # )

            # print(f"✅ Phone verified successfully for {request.email}")

            return True

        except UserData.DoesNotExist:
            # print(f"❌ User not found: {request.email}")
            return False

        except Exception as e:
            # print(f"❌ Error: {str(e)}")
            return False

    if await mark_phone_verified():
        return {
            "status": "success",
            "message": "Phone verified successfully"
        }

    raise HTTPException(
        status_code=500,
        detail="Failed to verify user"
    )


# ==================================================================
# 2. EMAIL VERIFICATION (OTP) - STATELESS JWT VERSION
# ==================================================================
@router.post("/email/send-otp")
async def send_email_otp(request: EmailVerificationRequest, cooldown_token: str = None):
    """Send OTP to email for existing user verification - stateless JWT-based"""
    
    # Check cooldown
    allowed, new_cooldown_token = check_resend_cooldown(request.email, "email_verification", cooldown_token)
    if not allowed:
        raise HTTPException(
            status_code=429, 
            detail=f"Please wait {RESEND_COOLDOWN} seconds before requesting another OTP"
        )

    @sync_to_async
    def validate_user():
        ensure_db_connection()
        try:
            return UserData.objects.get(email=request.email)
        except ObjectDoesNotExist:
            raise HTTPException(status_code=404, detail="Email not registered")

    user = await validate_user()

    generated_otp = random.randint(100000, 999999)

    # Create JWT OTP token (stateless)
    otp_token = create_otp_token(request.email, generated_otp, "email_verification")

    # print(f"✅ Email OTP generated for {request.email}: {generated_otp}")

    # Send Email
    email_sent = False
    email_error = None
    try:
        if EMAIL_USER and EMAIL_PASSWORD:
            msg = MIMEMultipart()
            msg['From'] = EMAIL_USER
            msg['To'] = request.email
            msg['Subject'] = "Your Verification Code - Talenta"
            
            body = f"""
            Hello,

            Your verification code is: {generated_otp}

            This code will expire in 10 minutes.

            If you didn't request this, please ignore this email.

            Best regards,
            Talenta Team
            """
            
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, request.email, msg.as_string())
            server.quit()
            # print(f"✅ Email sent successfully from {EMAIL_USER} to {request.email}")
            email_sent = True
        else:
            # print("⚠️ Email credentials not configured. Email not sent.")
            email_error = "Email not configured"
    except Exception as e:
        # print(f"❌ Email failed: {str(e)}")
        email_error = str(e)

    response = {
        "status": "success", 
        "message": "OTP sent to registered email",
        "email_sent": email_sent,
        "from_email": EMAIL_USER,
        "otp_token": otp_token,  # Return token for verification
        "cooldown_token": new_cooldown_token  # Return for rate limiting
    }

    if os.getenv("DEBUG", "False").lower() == "true":
        response["debug_otp"] = generated_otp
        if email_error:
            response["email_error"] = email_error

    return response

@router.post("/email/verify-otp")
async def verify_email_otp(request: EmailOTPVerify, otp_token: str):
    """Verify email OTP - stateless JWT-based"""

    # print(f"🔍 Verifying email OTP for {request.email}")

    # VERIFY JWT OTP
    if not verify_otp_token(
        otp_token,
        int(request.otp_code),
        request.email,
        "email_verification"
    ):
        # print(f"❌ Email OTP verification failed for {request.email}")

        raise HTTPException(
            status_code=400,
            detail="Invalid or expired OTP"
        )

    @sync_to_async
    def mark_email_verified():
        ensure_db_connection()

        try:
            # GET USER
            user = UserData.objects.get(email=request.email)

            # print(f"✅ User found: {user.email} (ID: {user.id})")

            # GET VERIFICATION RECORD
            verification = UserVerification.objects.filter(
                user=user
            ).first()

            # UPDATE EXISTING RECORD
            if verification:
                verification.email_verified = True
                verification.email = user.email
                verification.updated_at = timezone.now()

                verification.save()

                # print("✅ Updated email verification")

            # CREATE NEW RECORD
            else:
                verification = UserVerification.objects.create(
                    user=user,
                    phone_verified=False,
                    phone_number=user.phone_number,
                    email_verified=True,
                    email=user.email,
                    updated_at=timezone.now()
                )

                # print(
                #     "✅ Created new verification record with email verified"
                # )

            # CREATE NOTIFICATION
            try:
                create_notification(
                    user=user,
                    title="Email Verification Completed",
                    message="Your email has been verified successfully.",
                    notification_type="verification",
                    # url="/profile"
                )

                # print(
                #     f"✅ Email verification notification created for {user.email}"
                # )

            except Exception as notification_error:
                pass
                # print(
                #     f"❌ Failed to create email verification notification: {notification_error}"
                # )

            # print(f"✅ Email verified successfully for {request.email}")

            return True

        except UserData.DoesNotExist:
            # print(f"❌ User not found: {request.email}")

            return False

        except Exception as e:
            # print(f"❌ Error: {str(e)}")

            return False

    if await mark_email_verified():
        return {
            "status": "success",
            "message": "Email verified successfully"
        }

    raise HTTPException(
        status_code=500,
        detail="Failed to verify email"
    )


# ==================================================================
# 3. DEBUG ENDPOINTS
# ==================================================================
@router.get("/debug/check-phone/{email}")
async def debug_check_phone(email: str):
    """Debug endpoint to check stored phone number"""
    @sync_to_async
    def get_user_data():
        ensure_db_connection()
        try:
            user = UserData.objects.get(email=email)
            return {
                "email": user.email,
                "phone_in_db": user.phone_number,
                "normalized_phone": normalize_phone(user.phone_number or ""),
                "exists": True
            }
        except ObjectDoesNotExist:
            return {"exists": False, "email": email}

    return await get_user_data()


@router.get("/debug/check-verification/{email}")
async def debug_check_verification(email: str):
    """Debug endpoint to check verification status"""
    @sync_to_async
    def get_verification_data():
        ensure_db_connection()
        try:
            user = UserData.objects.get(email=email)
            verification = UserVerification.objects.filter(user=user).first()

            if verification:
                return {
                    "email": email,
                    "phone_verified": verification.phone_verified,
                    "email_verified": verification.email_verified,
                    "phone_number": verification.phone_number,
                    "verification_email": verification.email,
                    "updated_at": str(verification.updated_at),
                    "record_exists": True
                }
            else:
                return {
                    "email": email,
                    "message": "No verification record found",
                    "record_exists": False
                }
        except ObjectDoesNotExist:
            return {"error": "User not found", "email": email}

    return await get_verification_data()


# ==================================================================
# 4. SIGNUP VERIFICATION (works with users not yet in database)
# ==================================================================
@router.post("/signup/send-otp")
async def send_signup_otp(request: EmailVerificationRequest, cooldown_token: str = None):
    """
    Send OTP for signup verification - DOES NOT require user to exist
    Uses stateless JWT-based OTP
    """
    # Check cooldown
    allowed, new_cooldown_token = check_resend_cooldown(request.email, "signup", cooldown_token)
    if not allowed:
        raise HTTPException(
            status_code=429, 
            detail=f"Please wait {RESEND_COOLDOWN} seconds before requesting another OTP"
        )

    # Check if email already exists
    @sync_to_async
    def check_email_exists():
        ensure_db_connection()
        return UserData.objects.filter(email=request.email).exists()
    
    if await check_email_exists():
        raise HTTPException(status_code=400, detail="Email already registered")

    generated_otp = random.randint(100000, 999999)

    # Create JWT OTP token (stateless)
    otp_token = create_otp_token(request.email, generated_otp, "signup")

    # print(f"✅ Signup OTP generated for {request.email}: {generated_otp}")

    # Send Email
    email_sent = False
    email_error = None
    try:
        if EMAIL_USER and EMAIL_PASSWORD:
            msg = MIMEMultipart()
            msg['From'] = EMAIL_USER
            msg['To'] = request.email
            msg['Subject'] = "Verify Your Talenta Account"
            
            body = f"""
            Welcome to Talenta!
            
            Your verification code is: {generated_otp}
            
            This code will expire in 10 minutes.
            
            If you didn't request this, please ignore this email.
            
            Best regards,
            Talenta Team
            """
            
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.sendmail(EMAIL_USER, request.email, msg.as_string())
            server.quit()
            # print(f"✅ Signup email sent successfully to {request.email}")
            email_sent = True
        else:
            # print("⚠️ Email credentials not configured. Email not sent.")
            email_error = "Email not configured"
    except Exception as e:
        # print(f"❌ Email failed: {str(e)}")
        email_error = str(e)

    response = {
        "status": "success", 
        "message": "Verification code sent to your email",
        "email_sent": email_sent,
        "otp_token": otp_token,  # Return token for verification
        "cooldown_token": new_cooldown_token  # Return for rate limiting
    }

    # Only include debug OTP in development
    if os.getenv("DEBUG", "False").lower() == "true":
        response["debug_otp"] = generated_otp
        if email_error:
            response["email_error"] = email_error

    return response


@router.post("/signup/verify-otp")
async def verify_signup_otp(request: EmailOTPVerify, otp_token: str):
    """
    Verify OTP for signup - stateless JWT-based verification
    Returns a signup_token that can be used to complete registration
    """
    # print(f"🔍 Verifying signup OTP for {request.email}")

    # Stateless OTP verification using JWT
    if not verify_otp_token(otp_token, int(request.otp_code), request.email, "signup"):
        # print(f"❌ Signup OTP verification failed for {request.email}")
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    # Create a signup token (valid for 30 minutes) - same as auth.py
    signup_token = jwt.encode(
        {
            "email": request.email,
            "purpose": "signup",
            "exp": datetime.utcnow() + timedelta(minutes=30),
            "iat": datetime.utcnow()
        },
        OTP_SECRET,  # Use same secret as auth.py
        algorithm=ALGORITHM
    )

    return {
        "status": "success", 
        "message": "Email verified successfully",
        "signup_token": signup_token
    }


@router.post("/signup/resend-otp")
async def resend_signup_otp(request: EmailVerificationRequest, cooldown_token: str = None):
    """
    Resend OTP for signup - uses the same stateless approach
    """
    # Check if email already exists
    @sync_to_async
    def check_email_exists():
        ensure_db_connection()
        return UserData.objects.filter(email=request.email).exists()
    
    if await check_email_exists():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Reuse the send endpoint logic
    return await send_signup_otp(request, cooldown_token)


# ==================================================================
# 5. RESEND ENDPOINTS FOR EMAIL/PHONE VERIFICATION
# ==================================================================
@router.post("/email/resend-otp")
async def resend_email_otp(request: EmailVerificationRequest, cooldown_token: str = None):
    """Resend OTP for email verification"""
    return await send_email_otp(request, cooldown_token)


@router.post("/phone/resend-otp")
async def resend_phone_otp(request: PhoneVerificationRequest, cooldown_token: str = None):
    """Resend OTP for phone verification"""
    return await send_phone_otp(request, cooldown_token)


# ==================================================================
# 6. HEALTH CHECK
# ==================================================================
@router.get("/health")
async def verification_health():
    """Health check endpoint"""
    return {
        "status": "ok", 
        "otp_method": "stateless_jwt",
        "otp_expiry_seconds": OTP_EXPIRY,
        "resend_cooldown_seconds": RESEND_COOLDOWN
    }