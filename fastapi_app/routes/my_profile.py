# import fastapi_app.django_setup
# from fastapi import APIRouter, HTTPException, Form, File, UploadFile
# from creator_app.models import UserData
# from django.conf import settings
# import os

# router = APIRouter(prefix='/profile', tags=['Profile'])

# BASE_DIR = settings.BASE_DIR


# # ------------------------------
# # GET USER DATA BY ID
# # ------------------------------
# @router.get('/get/{user_id}')
# def get_user_data(user_id: int):
#     try:
#         user = UserData.objects.get(id=user_id)
#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="User not found")

#     return {
#         'profile_picture': user.profile_picture.url if user.profile_picture else None,
#         'email': user.email,
#         'first_name': user.first_name,
#         'last_name': user.last_name,
#         'phone_number': user.phone_number,
#         'address': user.address,
#         'city': user.city,
#         'state': user.state
#     }


# # ------------------------------
# # EDIT USER DATA USING USER ID
# # ------------------------------
# @router.put('/edit/{user_id}')
# def edit_user_data(
#     user_id: int,
#     first_name: str | None = Form(None),
#     last_name: str | None = Form(None),
#     phone_number: str | None = Form(None),
#     address: str | None = Form(None),
#     city: str | None = Form(None),
#     state: str | None = Form(None),
#     profile_pic: UploadFile | None = File(None)
# ):
#     try:
#         user = UserData.objects.get(id=user_id)
#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="User not found")

#     # Update fields
#     if first_name is not None:
#         user.first_name = first_name
#     if last_name is not None:
#         user.last_name = last_name
#     if phone_number is not None:
#         user.phone_number = phone_number
#     if address is not None:
#         user.address = address
#     if city is not None:
#         user.city = city
#     if state is not None:
#         user.state = state

#     # Handle profile picture upload
#     if profile_pic is not None:
#         save_path = os.path.join(BASE_DIR, "fastapi_app", "profile_pic")
#         os.makedirs(save_path, exist_ok=True)

#         file_path = os.path.join(save_path, profile_pic.filename)

#         with open(file_path, "wb") as f:
#             f.write(profile_pic.file.read())

#         user.profile_pic = f"profile_pic/{profile_pic.filename}"

#     user.save()

#     return {"message": "UserData updated successfully"}

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
        user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    profile_pic_url = None
    if user.profile_picture:
        profile_pic_url = (
            f"http://127.0.0.1:8000/uploads/{user.profile_picture}"
        )

    return {
        "profile_picture": profile_pic_url,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
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
    first_name: str | None = Form(None),
    last_name: str | None = Form(None),
    phone_number: str | None = Form(None),
    address: str | None = Form(None),
    city: str | None = Form(None),
    state: str | None = Form(None),
    status: str | None = Form(None),
    profile_pic: UploadFile | None = File(None),
):
    # ---------------- Fetch User ----------------
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    # ---------------- Update Fields ----------------
    if first_name is not None:
        user.first_name = first_name
    if last_name is not None:
        user.last_name = last_name
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




@router.patch('/update-status/{user_id}')
def update_status(
    user_id: int,
    request: UpdateStatusRequest
):
    try:
        user = UserData.objects.get(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    
    if request.status is not None:
        user.status = request.status
    
    user.save()

    return {"message": "User status updated successfully", "status": user.status}
