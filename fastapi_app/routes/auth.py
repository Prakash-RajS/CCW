# fastapi_app/routes/auth.py
import fastapi_app.django_setup
import re
import time
import logging
import os
import requests
import urllib.parse
import jwt
import hashlib
import secrets
from random import randint
from datetime import datetime, timedelta
from dotenv import load_dotenv
from creator_app.models import UserData, UserLoginActivity

from fastapi import APIRouter, HTTPException, Request, Depends, status, Response
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

from creator_app.models import UserData
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password

# ✅ DATABASE CONNECTION MANAGEMENT (Import from dbconnection)
from fastapi_app.routes.dbconnection import ensure_db_connection, check_db_connection

load_dotenv()

# ================================
# Router & Templates
# ================================
router = APIRouter(prefix="/auth", tags=["Authentication"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")

templates = Jinja2Templates(directory=TEMPLATE_DIR)
logger = logging.getLogger(__name__)

# ================================
# SECURITY & TOKEN CONFIG
# ================================
SECRET_KEY = os.getenv("SECRET_KEY", "your_super_secret_key_123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600   # 10 Hours
REFRESH_TOKEN_EXPIRE_DAYS = 7       # 7 Days

# Cookie Security Settings
SECURE_COOKIES = os.getenv("SECURE_COOKIES", "False").lower() == "true"

# OTP Configuration
OTP_SECRET = os.getenv("OTP_SECRET", SECRET_KEY)
OTP_EXPIRY = 600  # 10 minutes
RESEND_COOLDOWN = 60  # 60 seconds

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

class SocialEmailRequest(BaseModel):
    auth0_id: str
    email: str
# device count

def detect_device(user_agent: str):
    ua = user_agent.lower()

    if "windows" in ua:
        return "Windows"
    elif "mac" in ua:
        return "Mac"
    elif "android" in ua:
        return "Android"
    elif "iphone" in ua:
        return "iOS"
    return "Other"


# ================================
# JWT Helper Functions for OTP
# ================================
def create_otp_token(email: str, otp: int, purpose: str) -> str:
    """Create signed JWT containing OTP hash"""
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


# ================================
# Rate Limiting Helper for OTP Resend
# ================================
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


def create_token(data: dict, expires_delta: timedelta):
    """Generic helper to create JWT tokens (access or refresh)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ================================
# HELPER FUNCTION FOR COOKIES
# ================================
def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Set authentication cookies with consistent settings"""
    cookie_base = {
        "httponly": True,
        "secure": SECURE_COOKIES,
        "samesite": "lax",
        "path": "/",
    }

    response.set_cookie(
        key="access_token",
        value=access_token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        **cookie_base
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        **cookie_base
    )

    print(f"✅ Cookies set - access_token expires in {ACCESS_TOKEN_EXPIRE_MINUTES} minutes, refresh_token expires in {REFRESH_TOKEN_EXPIRE_DAYS} days")


def get_current_user(request: Request):
    """
    Validates the token from HTTP-only Cookies (Preferred) or Auth Header.
    """
    ensure_db_connection()

    print(f"\n🔍 Getting current user - Request path: {request.url.path}")
    print(f"🍪 All cookies received: {dict(request.cookies)}")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )

    token = request.cookies.get("access_token")
    print(f"📦 Access token from cookie: {'Present' if token else 'Not found'}")

    if not token:
        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            print("📦 Using token from Authorization header")

    if not token:
        print("❌ No token found")
        raise credentials_exception

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")
        token_type = payload.get("type")

        print(f"👤 User ID from token: {user_id}")
        print(f"📝 Token type: {token_type}")

        if not user_id:
            raise credentials_exception

        if token_type != "access":
            raise credentials_exception

    except jwt.ExpiredSignatureError:
        print("❌ Token expired")
        raise credentials_exception

    except jwt.PyJWTError as e:
        print(f"❌ JWT error: {e}")
        raise credentials_exception

    try:
        user = UserData.objects.get(id=int(user_id))
        print(f"✅ User found: ID={user.id}")
        return user

    except UserData.DoesNotExist:
        print(f"❌ User not found: {user_id}")
        raise credentials_exception


# ================================
# TEST PAGE ROUTE
# ================================
@router.get("/auth-test", response_class=HTMLResponse)
def auth_test(request: Request):
    return templates.TemplateResponse("auth_test.html", {"request": request})


# ================================
# Auth0 SETTINGS
# ================================
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET")
Backend_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")
AUTH0_CALLBACK_URL = os.getenv(
    "AUTH0_CALLBACK_URL",
    f"{Backend_URL}/auth/auth0/callback"
)

# ================================
# AUTH0 HANDSHAKE EXPIRY
# ================================
HANDSHAKE_EXPIRY_SECONDS = 60  # Must be consumed within 60 seconds


def hash_password(value: str):
    return make_password(value)


# ================================
# SIGNUP (with signup_token verification)
# ================================
@router.post("/signup")
def signup(
    request: Request,
    response: Response,
    email: str,
    phone: str,
    password: str,
    signup_token: str,
    role: str | None = None
):
    ensure_db_connection()

    # Verify signup token
    try:
        payload = jwt.decode(signup_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload["email"] != email or payload["purpose"] != "signup":
            raise HTTPException(400, "Invalid verification token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(400, "Verification expired. Please verify email again.")
    except jwt.PyJWTError:
        raise HTTPException(400, "Invalid verification token")

    strong_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"

    if not re.match(strong_regex, password):
        raise HTTPException(400, "Weak password")

    if UserData.objects.filter(email=email).exists():
        raise HTTPException(400, "Email already exists")

    if UserData.objects.filter(phone_number=phone).exists():
        raise HTTPException(400, "Phone number already registered")

    # Create User
    user = UserData(email=email, phone_number=phone, role="", full_name="")
    user.set_password(password)
    user.save()



    # Create verification record
    try:
        from creator_app.models import UserVerification
        UserVerification.objects.create(
            user=user,
            email_verified=True,  # Already verified via OTP
            email=email,
            phone_verified=False,
            phone_number=phone
        )
    except Exception as e:
        print(f"Warning: Could not create verification record: {e}")

    # Set JWT cookies
    access_token = create_token(
        data={"sub": str(user.id), "type": "access", "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_token(
        data={"sub": str(user.id), "type": "refresh"},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    set_auth_cookies(response, access_token, refresh_token)

    print(f"✅ Signup complete and cookies set for: {email}")

    return {
        "message": "Signup successful",
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
    }


# ================================
# LOGIN
# ================================
@router.post("/login")
def login(request: Request, response: Response, email: str, password: str):
    """
    Logs in user and sets HttpOnly cookies for Access & Refresh tokens.
    Also manages user status:
    - Banned users cannot login
    - Inactive users become Active upon successful login
    """
    ensure_db_connection()

    print(f"\n🔐 Login attempt for: {email}")

    try:
        user = UserData.objects.get(email=email)
        print(f"✅ User found in DB")
    except UserData.DoesNotExist:
        print(f"❌ User not found")
        raise HTTPException(
            status_code=401, 
            detail="email_not_found"
        )

    # ✅ CHECK IF USER IS BANNED
    if user.status and user.status.lower() == "banned":
        print(f"❌ Banned user attempted login: {email}")
        raise HTTPException(
            status_code=403,
            detail="Your account has been banned by admin. Kindly contact admin@gmail.com"
        )

    if not user.check_password(password):
        print(f"❌ Invalid password")
        raise HTTPException(
            status_code=401, 
            detail="invalid_password"
        )

    # ✅ UPDATE USER STATUS
    if user.status and user.status.lower() == "inactive":
        user.status = "Active"
        user.last_active = datetime.now()
        user.save(update_fields=['status', 'last_active'])
        print(f"✅ User status updated from Inactive to Active: {email}")
    else:
        user.last_active = datetime.now()
        user.save(update_fields=['last_active'])
        print(f"✅ User last_active updated: {email}")

    # =========================================================
    # 🔥 LOGIN ACTIVITY TRACKING
    # =========================================================
    try:
        user_agent = request.headers.get("user-agent", "")
        ip_address = request.client.host

        device = detect_device(user_agent)

        UserLoginActivity.objects.create(
            user=user,
            device=device,
            ip_address=ip_address,
            user_agent=user_agent
        )

        print(f"📊 Login activity saved: {device}")

    except Exception as e:
        print("❌ Login tracking error:", e)
    # =========================================================

    # ✅ TOKEN CREATION
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(
        data={"sub": str(user.id), "type": "access", "role": user.role},
        expires_delta=access_token_expires
    )

    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_token(
        data={"sub": str(user.id), "type": "refresh"},
        expires_delta=refresh_token_expires
    )

    set_auth_cookies(response, access_token, refresh_token)

    # ✅ PROFILE IMAGE URL
    base_url = str(request.base_url).rstrip('/')
    profile_picture_url = None

    if user.profile_picture:
        if hasattr(user.profile_picture, 'url'):
            profile_picture_url = f"{base_url}{user.profile_picture.url}"
        else:
            pic_path = str(user.profile_picture).lstrip('/')
            profile_picture_url = f"{base_url}/media/{pic_path}"

    return {
        "message": "Login successful",
        "user_id": user.id,
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email,
        "profile_picture": profile_picture_url,
        "status": user.status
    }
   
  


# ================================
# REFRESH TOKEN ENDPOINT
# ================================
@router.post("/refresh")
def refresh_token(request: Request, response: Response):
    """
    Reads refresh cookie and issues a new access token.
    """
    ensure_db_connection()

    refresh_token_cookie = request.cookies.get("refresh_token")

    if not refresh_token_cookie:
        raise HTTPException(
            status_code=401,
            detail="Refresh token missing"
        )

    try:
        payload = jwt.decode(
            refresh_token_cookie,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")
        token_type = payload.get("type")

        if not user_id or token_type != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

        user = UserData.objects.get(
            id=int(user_id)
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Refresh token expired"
        )

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

    except UserData.DoesNotExist:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    new_access_token = create_token(
        {
            "sub": str(user.id),
            "type": "access",
            "role": user.role,
        },
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    set_auth_cookies(
        response,
        new_access_token,
        refresh_token_cookie
    )

    return {
        "message": "Token refreshed"
    }


# ================================
# LOGOUT
# ================================

@router.post("/logout")
def logout(request: Request, response: Response):
    """
    Logs out user by clearing cookies and setting user status to Inactive.
    Also blacklists refresh token to prevent reuse.
    """
    ensure_db_connection()
    
    print(f"\n🚪 Logout attempt")
    
    # ✅ Get the refresh token BEFORE clearing cookies
    refresh_token = request.cookies.get("refresh_token")
    
    # ✅ Try to get the current user from token to update their status
    try:
        # Get token from cookie or header (don't verify expiration)
        token = request.cookies.get("access_token")
        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if token:
            try:
                # Decode without verifying expiration to get email
                payload = jwt.decode(
                    token, 
                    SECRET_KEY, 
                    algorithms=[ALGORITHM], 
                    options={"verify_exp": False}
                )
                user_id = payload.get("sub")

                if user_id:
                    user = UserData.objects.get(
                        id=int(user_id)
                    )
                    
                    # Only set to Inactive if user is Active (don't override Banned)
                    if user.status and user.status.lower() == "active":
                        user.status = "Inactive"
                        user.save(update_fields=['status'])
                        print(f"✅ User status set to Inactive: {user.id}")                  
                    else:
                        print(f"ℹ️ User status unchanged (was '{user.status}'): {user.id}")
                        
            except jwt.PyJWTError as e:
                print(f"⚠️ JWT error during logout status update: {e}")
            except UserData.DoesNotExist:
                print(f"⚠️ User not found for status update")
                
    except Exception as e:
        print(f"⚠️ Error updating user status on logout: {e}")
        # Continue with cookie clearing even if status update fails
    
    # ✅ BLACKLIST THE REFRESH TOKEN (prevent reuse)
    if refresh_token:
        try:
            # Option 1: If you have Redis
            try:
                from fastapi_app.routes.dbconnection import redis_client
                if redis_client:
                    redis_client.setex(
                        f"blacklist:{refresh_token}", 
                        REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60, 
                        "1"
                    )
                    print("✅ Refresh token blacklisted in Redis")
            except ImportError:
                pass
            
            # Option 2: Store in Django cache if available
            try:
                from django.core.cache import cache
                cache.set(
                    f"blacklist:{refresh_token}", 
                    "1", 
                    REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
                )
                print("✅ Refresh token blacklisted in Django cache")
            except:
                pass
                
        except Exception as e:
            print(f"⚠️ Could not blacklist token: {e}")
    
    # ✅ Clear ALL cookies aggressively
    cookie_settings = {
        "path": "/",
        "httponly": True,
        "samesite": "lax",
        "secure": SECURE_COOKIES,
    }
    
    # Delete access token cookie
    response.delete_cookie(
        key="access_token",
        **cookie_settings
    )
    
    # Delete refresh token cookie
    response.delete_cookie(
        key="refresh_token",
        **cookie_settings
    )
    
    # Also clear any other potential cookies
    response.delete_cookie(key="sessionid", **cookie_settings)
    response.delete_cookie(key="csrftoken", **cookie_settings)
    
    # Set max_age=0 as additional safety
    response.set_cookie(
        key="access_token",
        value="",
        max_age=0,
        expires=0,
        **cookie_settings
    )
    
    response.set_cookie(
        key="refresh_token",
        value="",
        max_age=0,
        expires=0,
        **cookie_settings
    )
    
    print("✅ All cookies cleared, logout complete")
    
    return {"message": "Logged out successfully"}


# ================================
# GET CURRENT USER INFO
# ================================
@router.get("/me")
def read_users_me(request: Request, current_user: UserData = Depends(get_current_user)):
    """
    Get current authenticated user details with full profile picture URL
    Now fetches location, state, and about from the appropriate profile model
    """
    ensure_db_connection()

    base_url = str(request.base_url).rstrip('/')
    profile_picture_url = None

    if current_user.profile_picture:
        pic_path = str(current_user.profile_picture).lstrip("/")
        profile_picture_url = f"{base_url}/media/{pic_path}"

    # Try to get profile data based on user role
    location = None
    state = None
    about = None

    try:
        if current_user.role == "creator":
            from creator_app.models import CreatorProfile
            profile = CreatorProfile.objects.filter(user=current_user).first()
            if profile:
                location = profile.location
                state = profile.state
                about = profile.about
        elif current_user.role == "collaborator":
            from creator_app.models import CollaboratorProfile
            profile = CollaboratorProfile.objects.filter(user=current_user).first()
            if profile:
                location = profile.location
                state = profile.state
                about = profile.about
    except ImportError:
        # Models not available yet
        pass
    except Exception as e:
        print(f"Warning: Could not fetch profile data for user {current_user.email}: {e}")

    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "full_name": current_user.full_name,
        "profile_picture": profile_picture_url,
        "phone_number": current_user.phone_number,
        "status": current_user.status,
        "location": location,
        "state": state,
        "about": about,
        "created_at": current_user.created_at,
        "last_active": current_user.last_active,
        "provider": current_user.provider
    }
 


# ================================
# SIGNUP OTP ENDPOINTS (Stateless JWT-based)
# ================================
@router.post("/signup/send-otp")
def send_signup_otp(email: str):
    """Send OTP for signup verification - stateless"""
    ensure_db_connection()
    
    # Check if email already exists
    if UserData.objects.filter(email=email).exists():
        raise HTTPException(400, "Email already registered")
    
    otp = randint(100000, 999999)
    
    # Create OTP token
    otp_token = create_otp_token(email, otp, "signup")

    # Send email
    send_mail(
        subject="Your Talenta Email Verification Code",
        message=f"Your email verification code is: {otp}\n\nThis code expires in 10 minutes.",
        from_email=None,
        recipient_list=[email],
    )
    
    return {
        "message": "Verification code sent",
        "otp_token": otp_token
    }


@router.post("/signup/resend-otp")
def resend_signup_otp(email: str, cooldown_token: str = None):
    """Resend OTP for signup with rate limiting"""
    ensure_db_connection()
    
    # Check cooldown
    allowed, new_cooldown_token = check_resend_cooldown(email, "signup", cooldown_token)
    if not allowed:
        raise HTTPException(429, f"Please wait {RESEND_COOLDOWN} seconds before requesting another OTP")
    
    # Check if email already exists
    if UserData.objects.filter(email=email).exists():
        raise HTTPException(400, "Email already registered")
    
    otp = randint(100000, 999999)
    otp_token = create_otp_token(email, otp, "signup")
    
    send_mail(
        subject="Your Talenta Email Verification Code",
        message=f"Your email verification code is: {otp}\n\nThis code expires in 10 minutes.",
        from_email=None,
        recipient_list=[email],
    )
    
    return {
        "message": "Verification code resent",
        "otp_token": otp_token,
        "cooldown_token": new_cooldown_token
    }


@router.post("/signup/verify-otp")
def verify_signup_otp(email: str, otp: int, otp_token: str):
    """Verify OTP for signup - stateless"""
    # Stateless verification
    if not verify_otp_token(otp_token, otp, email, "signup"):
        raise HTTPException(400, "Invalid or expired OTP")
    
    # Create verification token for signup (valid for 30 minutes)
    signup_token = jwt.encode(
        {
            "email": email,
            "purpose": "signup",
            "exp": datetime.utcnow() + timedelta(minutes=30),
            "iat": datetime.utcnow()
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return {
        "message": "Email verified successfully",
        "signup_token": signup_token
    }


# ================================
# FORGOT PASSWORD OTP ENDPOINTS (Stateless JWT-based)
# ================================
@router.post("/forgot-password/send-otp")
def send_forgot_password_otp(email: str):
    """Send OTP for password reset - stateless"""
    ensure_db_connection()

    try:
        user = UserData.objects.get(email=email)
    except UserData.DoesNotExist:
        # Show email not found error
        raise HTTPException(status_code=404, detail="Email not found. Please sign up first.")

    otp = randint(100000, 999999)
    
    # Create OTP token
    otp_token = create_otp_token(email, otp, "forgot_password")

    # Send email with OTP
    send_mail(
        subject="Your Talenta Password Reset OTP",
        message=f"Your password reset code is: {otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.",
        from_email=None,
        recipient_list=[email],
    )
    
    return {
        "message": "OTP sent successfully to your email",
        "otp_token": otp_token
    }


@router.post("/forgot-password/resend-otp")
def resend_forgot_password_otp(email: str, cooldown_token: str = None):
    """Resend OTP for password reset with rate limiting"""
    ensure_db_connection()
    
    # Check cooldown
    allowed, new_cooldown_token = check_resend_cooldown(email, "forgot_password", cooldown_token)
    if not allowed:
        raise HTTPException(429, f"Please wait {RESEND_COOLDOWN} seconds before requesting another OTP")
    
    try:
        user = UserData.objects.get(email=email)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Email not found. Please sign up first.")
    
    otp = randint(100000, 999999)
    otp_token = create_otp_token(email, otp, "forgot_password")
    
    send_mail(
        subject="Your Talenta Password Reset OTP",
        message=f"Your password reset code is: {otp}\n\nThis code expires in 10 minutes.",
        from_email=None,
        recipient_list=[email],
    )
    
    return {
        "message": "OTP resent successfully to your email",
        "otp_token": otp_token,
        "cooldown_token": new_cooldown_token
    }


@router.post("/forgot-password/verify-otp")
def verify_forgot_password_otp(email: str, otp: int, otp_token: str):
    """Verify OTP for password reset - stateless"""
    # Verify using token only - no cache needed!
    if not verify_otp_token(otp_token, otp, email, "forgot_password"):
        raise HTTPException(400, "Invalid or expired OTP")
    
    # Create verification token for password reset (valid for 10 minutes)
    reset_token = jwt.encode(
        {
            "email": email,
            "purpose": "password_reset",
            "exp": datetime.utcnow() + timedelta(minutes=10),
            "iat": datetime.utcnow()
        },
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    
    return {
        "message": "OTP verified successfully",
        "reset_token": reset_token
    }


@router.post("/forgot-password/reset")
def reset_password(email: str, new_password: str, confirm_password: str, reset_token: str):
    """Reset password using verified reset token"""
    ensure_db_connection()
    
    # Verify reset token
    try:
        payload = jwt.decode(reset_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload["email"] != email or payload["purpose"] != "password_reset":
            raise HTTPException(400, "Invalid reset token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(400, "Reset token expired. Please request a new OTP.")
    except jwt.PyJWTError:
        raise HTTPException(400, "Invalid reset token")
    
    if new_password != confirm_password:
        raise HTTPException(400, "Passwords do not match")
    
    strong_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
    if not re.match(strong_regex, new_password):
        raise HTTPException(400, "Weak password")
    
    try:
        user = UserData.objects.get(email=email)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")
    
    user.set_password(new_password)
    user.save()
    
    return {"message": "Password reset successful. You can now login with your new password."}


# ================================
# CHANGE PASSWORD (Authenticated)
# ================================
@router.post("/change-password/{user_id}")
def change_password(user_id: int, old_password: str, new_password: str, confirm_password: str):
    ensure_db_connection()

    try:
        user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")
    if not user.check_password(old_password):
        raise HTTPException(400, "Old password incorrect")
    if new_password != confirm_password:
        raise HTTPException(400, "Passwords do not match")

    strong_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
    if not re.match(strong_regex, new_password):
        raise HTTPException(400, "Weak password")

    user.set_password(new_password)
    user.save()
    return {"message": "Password changed successfully"}


# ================================
# AUTH0 & SOCIAL LOGIN
# ================================
PROVIDER_CONNECTIONS = {
    "google": "google-oauth2",
    "facebook": "facebook",
    "apple": "apple"
}


@router.get("/auth0/login")
def auth0_login(provider: str = None):
    """
    Initiates Auth0 login.
    Usage: /auth/auth0/login?provider=google
    """
    print(f"\n🔐 Auth0 login initiated with provider: {provider}")

    if not AUTH0_DOMAIN or not AUTH0_CLIENT_ID:
        raise HTTPException(500, "Auth0 environment variables are missing.")

    params = {
        "response_type": "code",
        "client_id": AUTH0_CLIENT_ID,
        "redirect_uri": AUTH0_CALLBACK_URL,
        "scope": "openid profile email",
        "prompt": "select_account",
    }

    if provider and provider.lower() in PROVIDER_CONNECTIONS:
        params["connection"] = PROVIDER_CONNECTIONS[provider.lower()]
        
        # ✅ For Google, add login_hint to suggest Gmail domain
        if provider.lower() == "google":
            params["login_hint"] = "domain:gmail.com"

    query_string = urllib.parse.urlencode(params)
    auth0_url = f"https://{AUTH0_DOMAIN}/authorize?{query_string}"
    print(f"➡ Redirecting to Auth0: {auth0_url}")
    return RedirectResponse(auth0_url)


@router.get("/auth0/callback")
def auth0_callback(
    request: Request,
    code: str = None,
    error: str = None
):
    """
    Auth0 callback — exchanges code for tokens,
    finds/creates user,
    then redirects frontend to /auth-callback
    with a short-lived handshake token.
    """

    print(f"\n🔄 Auth0 callback received")

    if error:
        print(f"❌ Auth0 error: {error}")

        FRONTEND_BASE_URL = os.getenv(
        "FRONTEND_BASE_URL",
        "http://localhost:5173"
        )

        # User clicked Cancel on Facebook/Auth0 screen
        if error == "access_denied":
            return RedirectResponse(
                url=f"{FRONTEND_BASE_URL}/signup",
                status_code=302
            )

        return RedirectResponse(
            url=f"{FRONTEND_BASE_URL}/signup?error={urllib.parse.quote(error)}",
        status_code=302
        )

    if not code:
        print("❌ Missing authentication code")
        raise HTTPException(
            status_code=400,
            detail="Missing authentication code"
        )

    # =====================================================
    # Exchange Authorization Code for Token
    # =====================================================
    token_url = f"https://{AUTH0_DOMAIN}/oauth/token"

    token_payload = {
        "grant_type": "authorization_code",
        "client_id": AUTH0_CLIENT_ID,
        "client_secret": AUTH0_CLIENT_SECRET,
        "code": code,
        "redirect_uri": AUTH0_CALLBACK_URL,
    }

    token_res = requests.post(
        token_url,
        json=token_payload
    )

    token_data = token_res.json()

    if "error" in token_data:
        print(
            f"❌ Token exchange error: "
            f"{token_data.get('error_description')}"
        )

        raise HTTPException(
            status_code=400,
            detail=f"Token Exchange Error: {token_data.get('error_description')}"
        )

    auth0_access_token = token_data.get("access_token")

    # =====================================================
    # Get User Info From Auth0
    # =====================================================
    user_info_res = requests.get(
        f"https://{AUTH0_DOMAIN}/userinfo",
        headers={
            "Authorization": f"Bearer {auth0_access_token}"
        }
    )

    user_info = user_info_res.json()

    print("USER INFO:", user_info)

    auth0_user_id = user_info.get("sub")
    email = user_info.get("email")
    picture = user_info.get("picture")

    # =====================================================
    # Detect Provider
    # =====================================================
    if "facebook" in auth0_user_id:
        provider = "facebook"
    elif "apple" in auth0_user_id:
        provider = "apple"
    elif "google" in auth0_user_id:
        provider = "google"
    else:
        provider = "auth0"

    # =====================================================
    # Google Gmail Validation
    # =====================================================
    is_google_auth = False

    identities = user_info.get("identities", [])

    for identity in identities:
        if identity.get("connection") == "google-oauth2":
            is_google_auth = True
            break

    if "google-oauth2" in user_info.get("sub", ""):
        is_google_auth = True

    print(
        f"🔍 Google Auth Detection: "
        f"{is_google_auth}"
    )

    print(
        f"📧 Email: {email}"
    )

    if is_google_auth:

        if not email:
            FRONTEND_BASE_URL = os.getenv(
                "FRONTEND_BASE_URL",
                "http://localhost:5173"
            )

            error_message = urllib.parse.quote(
                "Google account must provide an email address."
            )

            return RedirectResponse(
                url=f"{FRONTEND_BASE_URL}/auth-callback?error={error_message}",
                status_code=302
            )

        if not email.lower().endswith("@gmail.com"):

            FRONTEND_BASE_URL = os.getenv(
                "FRONTEND_BASE_URL",
                "http://localhost:5173"
            )

            error_message = urllib.parse.quote(
                "Only @gmail.com accounts are allowed for Google sign-in."
            )

            return RedirectResponse(
                url=f"{FRONTEND_BASE_URL}/auth-callback?error={error_message}",
                status_code=302
            )

    print(
        f"✅ Auth0 user info retrieved "
        f"for provider={provider}"
    )

    # =====================================================
    # Find / Create User
    # =====================================================
    ensure_db_connection()

    user = None

    # -----------------------------------------
    # Lookup by Auth0 User ID
    # -----------------------------------------
    try:
        user = UserData.objects.get(
            userid=auth0_user_id
        )

        print(
            f"✅ Existing social user found "
            f"ID={user.id}"
        )

    except UserData.DoesNotExist:
        pass

    # -----------------------------------------
    # Link existing email account
    # -----------------------------------------
    if not user and email:

        try:
            user = UserData.objects.get(
                email__iexact=email
            )

            user.userid = auth0_user_id

            if not user.provider:
                user.provider = provider

            user.save(
                update_fields=[
                    "userid",
                    "provider"
                ]
            )

            print(
                f"✅ Linked existing account "
                f"ID={user.id}"
            )

        except UserData.DoesNotExist:
            pass

    # -----------------------------------------
    # Create new user
    # -----------------------------------------
    if not user:

        print(
            f"✨ Creating new social user "
            f"(email={email})"
        )

        random_password = make_password(
            f"social_login_{randint(1000,99999)}_{time.time()}"
        )

        full_name = (
            f"{user_info.get('given_name', '')} "
            f"{user_info.get('family_name', '')}"
        ).strip()

        user = UserData.objects.create(
            email=email if email else None,
            userid=auth0_user_id,
            password=random_password,
            full_name=full_name,
            profile_picture=None,
            role="",
            provider=provider,
        )

        print(
            f"✅ New user created "
            f"ID={user.id}"
        )

    # =====================================================
    # Create JWT Tokens
    # =====================================================
    access_token = create_token(
        {
            "sub": str(user.id),
            "type": "access",
            "role": user.role
        },
        timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    refresh_token_val = create_token(
        {
            "sub": str(user.id),
            "type": "refresh"
        },
        timedelta(
            days=REFRESH_TOKEN_EXPIRE_DAYS
        )
    )

    print("✅ JWT tokens created")

    # =====================================================
    # Handshake Token
    # =====================================================
    handshake_token = create_handshake_token(
        access_token,
        refresh_token_val,
        user.role or ""
    )

    print(
        f"✅ Handshake token created "
        f"expires in {HANDSHAKE_EXPIRY_SECONDS}s"
    )

    # =====================================================
    # Redirect To Frontend
    # =====================================================
    FRONTEND_BASE_URL = os.getenv(
        "FRONTEND_BASE_URL",
        "http://localhost:5173"
    )

    redirect_url = (
        f"{FRONTEND_BASE_URL}"
        f"/auth-callback?token={handshake_token}"
    )

    print(
        f"➡ Redirecting to frontend: "
        f"{redirect_url}"
    )

    return RedirectResponse(
        url=redirect_url,
        status_code=302
    )

def create_handshake_token(access_token: str, refresh_token: str, role: str) -> str:
    """Encode tokens directly into a short-lived signed JWT."""
    payload = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "role": role,
        "exp": datetime.utcnow() + timedelta(seconds=HANDSHAKE_EXPIRY_SECONDS),
        "type": "handshake",
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/session-handshake")
def session_handshake(response: Response, token: str):
    """Exchange handshake token for HttpOnly cookies"""
    if not token:
        raise HTTPException(status_code=400, detail="Handshake token required")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Handshake token expired. Please log in again.")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid handshake token")

    if payload.get("type") != "handshake":
        raise HTTPException(status_code=401, detail="Invalid token type")

    access_token = payload["access_token"]
    refresh_token_val = payload["refresh_token"]
    role = payload.get("role", "")

    set_auth_cookies(response, access_token, refresh_token_val)
    print(f"✅ Session handshake complete — cookies set, role: '{role}'")

    return {"message": "Session established", "role": role}


# ================================
# EMAIL CHECK ENDPOINT
# ================================
@router.get("/check-email")
def check_email(email: str):
    ensure_db_connection()
    try:
        exists = UserData.objects.filter(email__iexact=email).exists()
        return {"exists": exists}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ================================
# PHONE CHECK ENDPOINT
# ================================
@router.get("/check-phone")
def check_phone(phone: str):
    ensure_db_connection()
    try:
        exists = UserData.objects.filter(phone_number=phone).exists()
        return {"exists": exists}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.post("/complete-social-email")
# def complete_social_email(data: SocialEmailRequest):
#     ensure_db_connection()

#     email = data.email.strip().lower()

#     if UserData.objects.filter(email__iexact=email).exists():
#         raise HTTPException(
#             status_code=400,
#             detail="Email already exists"
#         )

#     try:
#         user = UserData.objects.get(
#             userid=data.auth0_id
#         )
#     except UserData.DoesNotExist:
#         raise HTTPException(
#             status_code=404,
#             detail="User not found"
#         )

#     user.email = email
#     user.save(update_fields=["email"])

#     access_token = create_token(
#         {
#             "sub": user.email,
#             "type": "access",
#             "role": user.role
#         },
#         timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
#     )

#     refresh_token = create_token(
#         {
#             "sub": user.email,
#             "type": "refresh"
#         },
#         timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
#     )

#     handshake_token = create_handshake_token(
#         access_token,
#         refresh_token,
#         user.role or ""
#     )

#     return {
#         "token": handshake_token
#     }
    
@router.get("/health")
def auth_health():
    ensure_db_connection()
    return {"status": "ok"}