#auth.py
import fastapi_app.django_setup
import re
import time
import logging
import os
import requests
import urllib.parse
import jwt
from random import randint
from datetime import datetime, timedelta
from dotenv import load_dotenv
 
from fastapi import APIRouter, HTTPException, Request, Depends, status, Response
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
 
from creator_app.models import UserData
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password
 
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
 
# Cookie Security Settings (Set SECURE_COOKIES=True in .env for Production)
SECURE_COOKIES = os.getenv("SECURE_COOKIES", "False").lower() == "true"
 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
 
def create_token(data: dict, expires_delta: timedelta):
    """Generic helper to create JWT tokens (access or refresh)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
 
def get_current_user(request: Request):
    """
    Validates the token from HTTP-only Cookies (Preferred) or Auth Header.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
 
    # 1. Try getting token from Cookie first
    token = request.cookies.get("access_token")
 
    # 2. If no cookie, try Authorization Header (Bearer ...)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
 
    if not token:
        raise credentials_exception
 
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
 
        # Optional: Check if this is specifically an access token
        if payload.get("type") != "access":
            raise credentials_exception
 
    except jwt.PyJWTError:
        raise credentials_exception
 
    # 3. Get User from Django DB
    try:
        user = UserData.objects.get(email=email)
    except UserData.DoesNotExist:
        raise credentials_exception
 
    return user
 
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
AUTH0_CALLBACK_URL = os.getenv(
    "AUTH0_CALLBACK_URL",
    "http://localhost:8000/auth/auth0/callback"
)
 
# ================================
# OTP CACHE
# ================================
OTP_CACHE = {}
OTP_EXPIRY = 600            
RESEND_COOLDOWN = 5        
 
def hash_password(value: str):
    return make_password(value)
 
 
# ================================
# SIGNUP
# ================================
@router.post("/signup")
def signup(email: str, phone: str, password: str, role: str | None = None):
    # Regex for Strong Password
    strong_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
 
    if not re.match(strong_regex, password):
        raise HTTPException(400, "Weak password")
 
    if UserData.objects.filter(email=email).exists():
        raise HTTPException(400, "Email already exists")
 
    # Create User
    user = UserData(email=email, phone_number=phone, role="")
    user.set_password(password)
    user.save()
 
    # Create Subscription
    from creator_app.models import UserSubscription
    UserSubscription.objects.create(
        user=user, email=email, current_plan="Basic"
    )
 
    return {"message": "Signup successful", "user_id": user.id}
 
 
# ================================
# LOGIN (UPDATED: COOKIES)
# ================================
@router.post("/login")
def login(response: Response, email: str, password: str):
    """
    Logs in user and sets HttpOnly cookies for Access & Refresh tokens.
    """
    try:
        user = UserData.objects.get(email=email)
    except UserData.DoesNotExist:
        raise HTTPException(401, "Invalid email or password")
 
    if not user.check_password(password):
        raise HTTPException(401, "Invalid email or password")
 
    # 1. Create Access Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(
        data={"sub": user.email, "type": "access", "role": user.role},
        expires_delta=access_token_expires
    )
 
    # 2. Create Refresh Token (Longer validity)
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_token(
        data={"sub": user.email, "type": "refresh"},
        expires_delta=refresh_token_expires
    )
 
    # 3. Create Encrypted User Data Token (For Frontend State)
    # We sign this so frontend can trust it, but we don't put sensitive secrets here.
    user_data_payload = {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "provider": user.provider
    }
    user_data_token = create_token(user_data_payload, expires_delta=refresh_token_expires)
 
    # ==========================
    # SET COOKIES
    # ==========================
 
    # Access Token: Short lived, HTTPOnly (Strict security)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="Lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
 
    # Refresh Token: Long lived, HTTPOnly (Used to get new access tokens)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="Lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )
 
    # User Session Data: HTTPOnly (Or False if you want JS to read it directly)
    # User asked for "Safest Encrypted Data". keeping it HttpOnly is safer.
    # Frontend should query a /me endpoint to get this data instead of reading cookie.
 
 
    return {
        "message": "Login successful",
        "user_id": user.id,
        "role": user.role
    }
 
 
# ================================
# REFRESH TOKEN ENDPOINT
# ================================
@router.post("/refresh")
def refresh_token(request: Request, response: Response):
    """
    Reads the 'refresh_token' cookie and issues a new 'access_token' cookie.
    """
    refresh_token = request.cookies.get("refresh_token")
 
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
 
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
 
        if email is None or token_type != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
 
        # Check if user still exists
        user = UserData.objects.get(email=email)
 
    except (jwt.PyJWTError, UserData.DoesNotExist):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
 
    # Issue New Access Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_token(
        data={"sub": user.email, "type": "access", "role": user.role},
        expires_delta=access_token_expires
    )
 
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="Lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
 
    return {"message": "Token refreshed"}
 
 
# ================================
# LOGOUT
# ================================
@router.post("/logout")
def logout(response: Response):
    """
    Clears all authentication cookies.
    """
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("user_session")
    return {"message": "Logged out successfully"}
 
 
# ================================
# GET CURRENT USER INFO (To replace reading cookie in JS)
# ================================
@router.get("/me")
def read_users_me(current_user: UserData = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name
    }
 
# ================================
# PASSWORD RESET & OTP (Existing)
# ================================
@router.post("/forgot-password/send-otp")
def send_otp(email: str):
    try:
        user = UserData.objects.get(email=email)
    except UserData.DoesNotExist:
        raise HTTPException(404, "Email not found")
 
    otp = randint(100000, 999999)
    now = time.time()
    OTP_CACHE[email] = {"otp": otp, "expires": now + OTP_EXPIRY, "sent_time": now}
 
    send_mail(
        subject="Your Stackly.AI OTP Code",
        message=f"Your verification code is: {otp}",
        from_email=None,
        recipient_list=[email],
    )
    return {"message": "OTP sent"}
 
 
@router.post("/forgot-password/resend-otp")
def resend_otp(email: str):
    if email in OTP_CACHE:
        if time.time() - OTP_CACHE[email].get("sent_time") < RESEND_COOLDOWN:
            raise HTTPException(429, f"Please wait {RESEND_COOLDOWN} seconds.")
    return send_otp(email)
 
 
@router.post("/forgot-password/verify-otp")
def verify_otp(email: str, otp: int):
    if email not in OTP_CACHE:
        raise HTTPException(400, "OTP not requested")
    entry = OTP_CACHE[email]
    if time.time() > entry["expires"]:
        del OTP_CACHE[email]
        raise HTTPException(400, "OTP expired")
    if entry["otp"] != otp:
        raise HTTPException(400, "Invalid OTP")
    return {"message": "OTP verified"}
 
 
@router.post("/forgot-password/reset")
def reset_password(email: str, new_password: str, confirm_password: str):
    if new_password != confirm_password:
        raise HTTPException(400, "Passwords do not match")
    try:
        user = UserData.objects.get(email=email)
    except UserData.DoesNotExist:
        raise HTTPException(404, "User not found")
    user.set_password(new_password)
    user.save()
    return {"message": "Password reset successful"}
 
 
@router.post("/change-password/{user_id}")
def change_password(user_id: int, old_password: str, new_password: str, confirm_password: str):
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
 
# # ================================
# # AUTH0 ROUTES (Existing)
# # ================================
# @router.get("/auth0/login/google")
# def login_google():
#     url = f"https://{AUTH0_DOMAIN}/authorize?response_type=code&client_id={AUTH0_CLIENT_ID}&redirect_uri={AUTH0_CALLBACK_URL}&scope=openid profile email&connection=google-oauth2"
#     return RedirectResponse(url)
 
# @router.get("/auth0/callback")
# def auth0_callback(response: Response, code: str = None, error: str = None):
#     # This needs similar update to /login to set cookies if used for session
#     # For now, keeping it basic, but you should apply set_cookie logic here too.
#     if error:
#         raise HTTPException(400, f"Auth0 Error: {error}")
#     if not code:
#         raise HTTPException(400, "Missing code")
 
#     # ... (Your existing Auth0 logic here) ...
#     # Note: If Auth0 logs them in, make sure to call create_token and response.set_cookie()
#     # inside _auth0_callback_logic just like we did in login()

# ================================
# 5. AUTH0 & SOCIAL (Updated for Google, Apple, Facebook)
# ================================
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET")
AUTH0_CALLBACK_URL = os.getenv("AUTH0_CALLBACK_URL", "http://localhost:8000/auth/auth0/callback")
 
# Helper to map simple names to Auth0 Connection names
PROVIDER_CONNECTIONS = {
    "google": "google-oauth2",
    "facebook": "facebook",
    "apple": "apple"
}
 
@router.get("/auth0/login")
def auth0_login(provider: str = None):
    """
    Initiates login.
    Usage: /auth/auth0/login?provider=google 
    (or leave provider empty to show the Auth0 universal login widget)
    """
    if not AUTH0_DOMAIN or not AUTH0_CLIENT_ID:
        raise HTTPException(500, "Auth0 environment variables are missing.")
 
    # Base Auth0 params
    params = {
        "response_type": "code",
        "client_id": AUTH0_CLIENT_ID,
        "redirect_uri": AUTH0_CALLBACK_URL,
        "scope": "openid profile email",
        "prompt": "select_account",
    }
 
    # If user specifically asked for 'google', 'facebook', or 'apple', force that connection
    if provider and provider.lower() in PROVIDER_CONNECTIONS:
        params["connection"] = PROVIDER_CONNECTIONS[provider.lower()]
 
    # Construct URL
    query_string = urllib.parse.urlencode(params)
    auth0_url = f"https://{AUTH0_DOMAIN}/authorize?{query_string}"
    return RedirectResponse(auth0_url)
 
 
@router.get("/auth0/callback")
def auth0_callback(response: Response, code: str = None, error: str = None):
    if error:
        raise HTTPException(status_code=400, detail=f"Auth0 Error: {error}")
    if not code:
        raise HTTPException(status_code=400, detail="Missing authentication code")

    # 1. Exchange code for Auth0 Access Token
    token_url = f"https://{AUTH0_DOMAIN}/oauth/token"
    token_payload = {
        "grant_type": "authorization_code",
        "client_id": AUTH0_CLIENT_ID,
        "client_secret": AUTH0_CLIENT_SECRET,
        "code": code,
        "redirect_uri": AUTH0_CALLBACK_URL,
    }
    token_res = requests.post(token_url, json=token_payload)
    token_data = token_res.json()

    if "error" in token_data:
        raise HTTPException(
            status_code=400,
            detail=f"Token Exchange Error: {token_data.get('error_description')}"
        )

    auth0_access_token = token_data.get("access_token")

    # 2. Get User Info from Auth0
    user_info_res = requests.get(
        f"https://{AUTH0_DOMAIN}/userinfo",
        headers={"Authorization": f"Bearer {auth0_access_token}"}
    )
    user_info = user_info_res.json()

    email = user_info.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="No email returned from social provider")

    # 3. Find or Create User in Django DB
    try:
        user = UserData.objects.get(email__iexact=email)
        print(f"✅ Social Login: User Found ({email})")
    except UserData.DoesNotExist:
        print(f"✨ Social Login: Creating New User ({email})")
        random_password = make_password(f"social_login_{randint(1000,99999)}_{time.time()}")
        user = UserData.objects.create(
            email=email,
            password=random_password,
            first_name=user_info.get("given_name", ""),
            last_name=user_info.get("family_name", ""),
            role="",          # ⬅️ IMPORTANT: let frontend choose role
            is_active=True
        )
        from creator_app.models import UserSubscription
        UserSubscription.objects.create(user=user, email=email, current_plan="Basic")

    # 4. CREATE TOKENS (same pattern as /login)
    access_token = create_token(
        {"sub": user.email, "type": "access", "role": user.role},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_token(
        {"sub": user.email, "type": "refresh"},
        timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )

    # 5. SET COOKIES
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="Lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=SECURE_COOKIES,
        samesite="Lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

    # 6. REDIRECT BACK TO FRONTEND ✅
    return RedirectResponse(
        url="http://localhost:5173/home",
        status_code=302
    )

@router.get("/health")
def auth_health():
    return {"status": "ok"}
