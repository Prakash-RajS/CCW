import os
import sys
import django
import smtplib
import random
import requests
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from asgiref.sync import sync_to_async
from twilio.rest import Client
from dotenv import load_dotenv 

# --- LOAD ENV FILE ---
load_dotenv() 

# --- SETUP ---
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'creator_backend.settings')
django.setup()

# --- IMPORTS ---
from creator_app.models import UserVerification, UserData

# --- LOAD KEYS ---
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = os.getenv("TWILIO_PHONE_NUMBER")

# Debugging: Print keys to terminal to verify they are loaded
print("---------------------------------------------------")
print(f"DEBUG CHECK: Twilio SID: {TWILIO_SID}")
print(f"DEBUG CHECK: Twilio Phone: {TWILIO_PHONE}")
print("---------------------------------------------------")

# Email Settings
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

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
# 1. PHONE VERIFICATION (OTP)
# ==================================================================
@router.post("/phone/send-otp")
async def send_phone_otp(request: PhoneVerificationRequest):
    generated_otp = str(random.randint(100000, 999999))
    
    # Send SMS via Twilio
    try:
        # REMOVED THE IF CHECK: Now it tries to send regardless
        print(f"Attempting to send SMS to {request.phone_number}...")
        client = Client(TWILIO_SID, TWILIO_TOKEN)
        client.messages.create(body=f"Your OTP is: {generated_otp}", from_=TWILIO_PHONE, to=request.phone_number)
        print("✅ Twilio: SMS Sent Successfully!")
    except Exception as e:
        print(f"❌ Twilio Error: {e}") 

    @sync_to_async
    def save_otp():
        user = UserData.objects.get(email=request.email)
        v, _ = UserVerification.objects.get_or_create(user=user)
        v.phone_number = request.phone_number
        v.phone_otp = generated_otp
        v.save()

    await save_otp()
    return {"status": "success", "message": "Phone OTP sent."}

@router.post("/phone/verify-otp")
async def verify_phone_otp(request: PhoneOTPVerify):
    @sync_to_async
    def check_otp():
        try:
            user = UserData.objects.get(email=request.email)
            v = UserVerification.objects.get(user=user)
            if v.phone_otp == request.otp_code:
                v.phone_verified = True
                v.save()
                return True
            return False
        except:
            return False

    if await check_otp():
        return {"status": "success", "message": "Phone verified!"}
    raise HTTPException(status_code=400, detail="Invalid Phone OTP")

# ==================================================================
# 2. EMAIL VERIFICATION (OTP)
# ==================================================================
@router.post("/email/send-otp")
async def send_email_otp(request: EmailVerificationRequest):
    generated_otp = str(random.randint(100000, 999999))

    @sync_to_async
    def save_email_otp():
        user = UserData.objects.get(email=request.email)
        v, _ = UserVerification.objects.get_or_create(user=user)
        v.email = request.email
        v.email_otp = generated_otp
        v.save()
    await save_email_otp()

    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = request.email
        msg['Subject'] = "Your Verification Code"
        body = f"Hello,\n\nYour verification OTP is: {generated_otp}\n\nPlease enter this code to verify your email."
        msg.attach(MIMEText(body, 'plain'))
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_USER, request.email, msg.as_string())
        server.quit()
    except Exception as e:
        print(f"Email Error: {e}")

    return {"status": "success", "message": "Email OTP sent."}

@router.post("/email/verify-otp")
async def verify_email_otp(request: EmailOTPVerify):
    @sync_to_async
    def check_email_otp():
        try:
            user = UserData.objects.get(email=request.email)
            v = UserVerification.objects.get(user=user)
            if v.email_otp == request.otp_code:
                v.email_verified = True
                v.save()
                return True
            return False
        except:
            return False

    if await check_email_otp():
        return {"status": "success", "message": "Email Verified!"}
    raise HTTPException(status_code=400, detail="Invalid Email OTP")

