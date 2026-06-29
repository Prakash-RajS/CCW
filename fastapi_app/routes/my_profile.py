

import uuid
from pydantic import BaseModel
import fastapi_app.django_setup
from fastapi import APIRouter, HTTPException, Form, File, UploadFile
from creator_app.models import UserData
import os
from PIL import Image  # ✅ Added Pillow for image conversion
from pathlib import Path as PathLib
from asgiref.sync import sync_to_async
import random
import string
from django.core.files.base import ContentFile
from fastapi_app.routes.dbconnection import ensure_db_connection  # Import database connection helper

BASE_URL = os.getenv("BASE_URL")


router = APIRouter(prefix='/profile', tags=['Profile'])

def generate_random_digits(length=4):
    """Generate random digits for filename"""
    return ''.join(random.choices(string.digits, k=length))

FASTAPI_BASE_DIR = PathLib(__file__).resolve().parent.parent


class UpdateStatusRequest(BaseModel):
    status: str | None = None

# ------------------------------
# GET USER DATA BY ID
# ------------------------------
@router.get('/get/{user_id}')
def get_user_data(user_id: int):
    try:
        # Ensure database connection is alive
        ensure_db_connection()
        
        user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    profile_pic_url = None
    if user.profile_picture:
        profile_pic_url = (
            f"{BASE_URL}/uploads/{user.profile_picture}"
        )

    return {
        "profile_picture": profile_pic_url,
        "email": user.email,
        # "first_name": user.first_name,
        # "last_name": user.last_name,
        "full_name": user.full_name,
        "phone_number": user.phone_number,
        "address": user.address,
        "city": user.city,
        "state": user.state,
        "status": user.status,
    }


# ------------------------------
# EDIT USER DATA USING USER ID
# ------------------------------
@router.put("/edit/{user_id}")
async def edit_user_data(
    user_id: int,
    # first_name: str | None = Form(None),
    # last_name: str | None = Form(None),
    full_name: str | None = Form(None),
    phone_number: str | None = Form(None),
    address: str | None = Form(None),
    city: str | None = Form(None),
    state: str | None = Form(None),
    status: str | None = Form(None),
    profile_pic: UploadFile | None = File(None),
):
    # Ensure database connection is alive
    ensure_db_connection()
    
    # ---------------- Fetch User ----------------
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    # ---------------- Update Fields ----------------
    # if first_name is not None:
    #     user.first_name = first_name
    # if last_name is not None:
    #     user.last_name = last_name
    # if first_name and last_name:
    #  user.full_name = f"{first_name} {last_name}"
    # elif first_name:
    #  user.full_name = first_name
    if full_name is not None:
     user.full_name = full_name.strip()
    if phone_number is not None:
        user.phone_number = phone_number
    if address is not None:
        user.address = address
    if city is not None:
        user.city = city
    if state is not None:
        user.state = state
    if status is not None:
        user.status = status

    # ---------------- Profile Picture (Django-safe) ----------------
    if profile_pic:
        # 🔥 delete old file (if exists)
        if user.profile_picture:
            await sync_to_async(user.profile_picture.delete)(save=False)

        # keep your filename logic
        random_digits = generate_random_digits()
        ext = PathLib(profile_pic.filename).suffix.lower()
        filename = f"{user.role}_{user_id}_{random_digits}{ext}"

        content = await profile_pic.read()

        await sync_to_async(user.profile_picture.save)(
            filename,
            ContentFile(content),
            save=False
        )

    # ---------------- Save User ----------------
    await sync_to_async(user.save)()

    return {"message": "UserData updated successfully"}




@router.put('/update-status/{user_id}/', status_code=200)
async def update_status(
    user_id: int,
    request: UpdateStatusRequest
):
    # ✅ FIX HERE
    await sync_to_async(ensure_db_connection)()
    
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    if request.status is not None:
        user.status = request.status
        await sync_to_async(user.save)()
        
        return {
            "message": "User status updated successfully", 
            "status": user.status
        }

    raise HTTPException(status_code=400, detail="Status is required")