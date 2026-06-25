import fastapi_app.django_setup
from typing import Optional, List, Dict, Any
from django.db.models import Q
from fastapi_app.services.notification_service import create_job_save_notification
from fastapi import APIRouter, HTTPException, Form, Request, UploadFile, File, Response, Query
import random
import io
import string
from pathlib import Path as PathLib
from asgiref.sync import sync_to_async
import os
from django.conf import settings
from fastapi.responses import FileResponse
from fastapi.responses import StreamingResponse
import mimetypes
import json
from datetime import datetime, timedelta
from django.core.files.base import ContentFile
from django.db.models import Avg, Count
from creator_app.models import Education, SubscriptionHistory, SubscriptionPlan, UserSubscription, UserVerification
import pycountry
from fastapi_app.routes.plan_guard import check_storage_limit
from creator_app.models import track_file_upload, track_file_deletion
from fastapi_app.services.notification_service import create_notification
from fastapi_app.routes.storage import get_profile_pic_url, save_profile_pic, delete_file, get_portfolio_upload_url  # ✅ Add get_portfolio_upload_url
import os
from fastapi_app.routes.storage import (
    get_profile_pic_url, 
    save_profile_pic, 
    delete_file, 
    get_portfolio_upload_url,
    read_file_bytes  # Also import this for S3 file reading
)


# ✅ DATABASE CONNECTION MANAGEMENT (Import from dbconnection)
from fastapi_app.routes.dbconnection import ensure_db_connection, check_db_connection

# Import your Django Models
from creator_app.models import (
    UserData, 
    CollaboratorProfile, 
    JobPost, 
    SavedJob, 
    RecentlyViewedJob, 
    Contract, 
    Review,
    PortfolioItem,
    CreatorProfile,
    WorkExperience,
    Proposal,
    Invitation
)

router = APIRouter(prefix="/collaborator", tags=["Collaborator"])

FASTAPI_BASE_DIR = PathLib(__file__).resolve().parent.parent

BASE_URL = os.getenv("BACKEND_BASE_URL", "http://67.202.26.110/api")


def get_country_code(location: str | None):
    if not location:
        return None
    location = location.lower()
    for country in pycountry.countries:
        if country.name.lower() in location:
            return country.alpha_2
    try:
        last_word = location.split(",")[-1].strip()
        country = pycountry.countries.search_fuzzy(last_word)[0]
        return country.alpha_2
    except:
        return None

def get_or_create_basic_plan(role: str):
    """
    Returns a SubscriptionPlan object for the given role with price=0 and duration='lifetime'.
    Creates it if it doesn't exist.
    """
    plan_name = "Basic"
    duration = "lifetime"  # ✅ CHANGED: Monthly → Lifetime
    price = 0.00

    plan, created = SubscriptionPlan.objects.get_or_create(
        name=plan_name,
        role=role,
        duration=duration,  # ✅ CHANGED: Monthly → Lifetime
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
        pass
        # print(f"✅ Created new Basic plan for {role}")
    return plan

def build_full_url(request: Request, path: str | None, use_s3: bool = True) -> str | None:
    """Build full URL from relative path with S3 support for all file types"""
    if not path:
        return None
    if path.startswith('http'):
        return path
    
    # Check if using S3
    use_s3_env = os.getenv("USE_S3", "False").lower() == "true"
    base_url = str(request.base_url).rstrip('/')
    clean_path = path.lstrip('/')
    
    if use_s3 and use_s3_env:
        s3_key = path.lstrip('/')
        
        # Determine which S3 URL generator to use based on path
        if s3_key.startswith('profile_pics/'):
            from fastapi_app.routes.storage import get_profile_pic_url
            file_url = get_profile_pic_url(s3_key)
            if file_url:
                return file_url
        elif s3_key.startswith('portfolio_uploads/'):
            from fastapi_app.routes.storage import get_portfolio_upload_url
            file_url = get_portfolio_upload_url(s3_key)
            if file_url:
                return file_url
        elif s3_key.startswith('collaborator_') or s3_key.startswith('creator_'):
            from fastapi_app.routes.storage import get_profile_pic_url, get_portfolio_upload_url
            
            full_s3_key = f"profile_pics/{PathLib(s3_key).name}"
            file_url = get_profile_pic_url(full_s3_key)
            if file_url:
                return file_url
            
            full_s3_key = f"portfolio_uploads/creator/{PathLib(s3_key).name}"
            file_url = get_portfolio_upload_url(full_s3_key)
            if file_url:
                return file_url
            
            full_s3_key = f"portfolio_uploads/collaborator/{PathLib(s3_key).name}"
            file_url = get_portfolio_upload_url(full_s3_key)
            if file_url:
                return file_url
        else:
            from fastapi_app.routes.storage import get_profile_pic_url
            file_url = get_profile_pic_url(s3_key)
            if file_url:
                return file_url
            
            from fastapi_app.routes.storage import get_portfolio_upload_url
            file_url = get_portfolio_upload_url(s3_key)
            if file_url:
                return file_url
        
        # ✅ NEW: Check if file exists locally before falling back to local URL
        local_path = PathLib(f"media/{clean_path}")
        if local_path.exists():
            # print(f"📁 File not in S3, serving from local: {clean_path}")
            return f"{base_url}/media/{clean_path}"
    
    # Fallback to local media path
    return f"{base_url}/media/{clean_path}"

def get_user_location_from_profile(user: UserData):
    """
    Get location from user's CreatorProfile.
    ✅ FIXED: Now properly handles async context with sync_to_async
    """
    try:
        # Directly try to get CreatorProfile without checking role
        # Use sync_to_async to handle the ORM call in async context
        @sync_to_async
        def get_profile():
            return CreatorProfile.objects.filter(user=user).first()
        
        # But wait - this function might be called from both sync and async contexts
        # We need to handle both cases
        
        # Check if we're in an async context by trying to see if sync_to_async is needed
        import asyncio
        try:
            loop = asyncio.get_running_loop()
            # We're in an async context, need to use sync_to_async
            # But we can't use await here if this function is sync
            # So we need to use sync_to_async with a different approach
            from asyncio import run_coroutine_threadsafe
            import concurrent.futures
            
            # Use a thread pool to run the sync code
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(
                    lambda: CreatorProfile.objects.filter(user=user).first()
                )
                profile = future.result(timeout=5)
        except RuntimeError:
            # No running loop, we're in sync context
            profile = CreatorProfile.objects.filter(user=user).first()
        
        if profile:
            return {
                "location": profile.location or "",
                "state": profile.state or "",
                "city": getattr(profile, 'city', "") or "",
                "address": getattr(profile, 'address', "") or ""
            }
            
    except Exception as e:
        pass
    
    return {"location": "", "state": "", "city": "", "address": ""}


def generate_random_digits(length=4):
    """Generate random digits for filename"""
    return ''.join(random.choices(string.digits, k=length))


def get_file_type(filename):
    """Determine file type based on extension"""
    if not filename:
        return "unknown"
    ext = PathLib(filename).suffix.lower()
    image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg']
    if ext in image_extensions:
        return "image"
    doc_extensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf']
    if ext in doc_extensions:
        return "document"
    spreadsheet_extensions = ['.csv', '.xls', '.xlsx', '.ods']
    if ext in spreadsheet_extensions:
        return "spreadsheet"
    video_extensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    if ext in video_extensions:
        return "video"
    audio_extensions = ['.mp3', '.wav', '.ogg', '.m4a']
    if ext in audio_extensions:
        return "audio"
    return "other"


# ==============================================================================
#  FILE SERVER - FastAPI endpoint to serve files
# ==============================================================================
from fastapi.responses import StreamingResponse, RedirectResponse
import os
import mimetypes
from typing import Optional
import hashlib
import urllib.parse


@router.get("/files/{file_path:path}")
async def serve_file(file_path: str, request: Request):
    """
    Stream files with support for range requests and caching.
    Also handles external URLs (Google/Auth0 profile pictures) by redirecting.
    """
    ensure_db_connection()
    
    # ✅ Check if the file_path is actually a full URL (Google/Auth0 profile pics)
    if file_path.startswith(('http://', 'https://')):
        # Decode URL if it was encoded
        decoded_url = urllib.parse.unquote(file_path)
        # print(f"🔄 Redirecting to external URL: {decoded_url}")
        return RedirectResponse(url=decoded_url, status_code=302)
    
    try:
        if ".." in file_path or file_path.startswith("/"):
            raise HTTPException(status_code=400, detail="Invalid file path")
        
        # For S3 files, check if we should redirect to presigned URL
        use_s3_env = os.getenv("USE_S3", "False").lower() == "true"
        if use_s3_env and file_path.startswith(('profile_pics/', 'portfolio_uploads/', 'work_submissions/')):
            from fastapi_app.routes.storage import (
                get_profile_pic_url,
                get_portfolio_upload_url,
                get_work_submission_url
            )
            
            # Determine which URL generator to use
            file_url = None
            if file_path.startswith('profile_pics/'):
                file_url = get_profile_pic_url(file_path)
            elif file_path.startswith('portfolio_uploads/'):
                file_url = get_portfolio_upload_url(file_path)
            elif file_path.startswith('work_submissions/'):
                file_url = get_work_submission_url(file_path)
            
            if file_url:
                # print(f"🔄 Redirecting to S3 presigned URL: {file_url}")
                return RedirectResponse(url=file_url, status_code=302)
        
        # Check local file paths
        storage_base = FASTAPI_BASE_DIR.parent / "media"
        possible_locations = [
            storage_base / file_path,
            FASTAPI_BASE_DIR / "media" / file_path,
            FASTAPI_BASE_DIR / file_path,
            FASTAPI_BASE_DIR.parent / file_path,
        ]
        
        file_location = None
        for loc in possible_locations:
            if loc.exists() and loc.is_file():
                file_location = loc
                break
        
        if not file_location:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get file stats
        file_size = file_location.stat().st_size
        filename = file_location.name
        modified_time = file_location.stat().st_mtime
        
        # Generate ETag
        etag = hashlib.md5(f"{modified_time}-{file_size}".encode()).hexdigest()
        
        # Check cache
        if_none_match = request.headers.get('if-none-match')
        if if_none_match and if_none_match == etag:
            return Response(status_code=304)
        
        # Determine content type
        mime_type, _ = mimetypes.guess_type(str(file_location))
        if not mime_type:
            mime_type = 'application/octet-stream'
        
        # Increase chunk size for better performance (64KB instead of 8KB)
        CHUNK_SIZE = 65536  # 64KB
        
        # Handle Range requests
        range_header = request.headers.get('range')
        
        if range_header:
            # Parse range header
            byte_range = range_header.replace('bytes=', '').split('-')
            start = int(byte_range[0]) if byte_range[0] else 0
            end = int(byte_range[1]) if byte_range[1] else file_size - 1
            
            # Validate range
            if start >= file_size or end >= file_size:
                return Response(
                    status_code=416,
                    headers={"Content-Range": f"bytes */{file_size}"}
                )
            
            content_length = end - start + 1
            
            def iterfile_range():
                with open(file_location, 'rb') as f:
                    f.seek(start)
                    remaining = content_length
                    while remaining > 0:
                        chunk_size = min(CHUNK_SIZE, remaining)
                        chunk = f.read(chunk_size)
                        if not chunk:
                            break
                        yield chunk
                        remaining -= len(chunk)
            
            headers = {
                "Content-Disposition": f"attachment; filename=\"{filename}\"",
                "Content-Type": mime_type,
                "Content-Range": f"bytes {start}-{end}/{file_size}",
                "Content-Length": str(content_length),
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=86400, immutable",
                "ETag": etag,
                "X-Content-Type-Options": "nosniff"
            }
            
            return StreamingResponse(
                iterfile_range(),
                status_code=206,  # Partial Content
                headers=headers,
                media_type=mime_type
            )
        
        # Full file request
        def iterfile():
            with open(file_location, 'rb') as f:
                while chunk := f.read(CHUNK_SIZE):
                    yield chunk
        
        headers = {
            "Content-Disposition": f"attachment; filename=\"{filename}\"",
            "Content-Type": mime_type,
            "Accept-Ranges": "bytes",
            "Cache-Control": "public, max-age=86400, immutable",
            "Content-Length": str(file_size),
            "ETag": etag,
            "X-Content-Type-Options": "nosniff"
        }
        
        return StreamingResponse(
            iterfile(),
            status_code=200,
            headers=headers,
            media_type=mime_type
        )
        
    except Exception as e:
        # print(f"Error serving file: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
#  1. GET DYNAMIC FILTER OPTIONS
# ==============================================================================
@router.get("/filters")
async def get_dynamic_filters():
    ensure_db_connection()
    try:
        niches = await sync_to_async(list)(CollaboratorProfile.objects.values_list('skill_category', flat=True).distinct())
        locations = await sync_to_async(list)(CollaboratorProfile.objects.values_list('location', flat=True).distinct())
        experiences = await sync_to_async(list)(CollaboratorProfile.objects.values_list('experience', flat=True).distinct())
        collab_types = await sync_to_async(list)(CollaboratorProfile.objects.values_list('collaboration_type', flat=True).distinct())
        return {
            "niches": sorted([n for n in niches if n and n.strip()]),
            "locations": sorted([l for l in locations if l and l.strip()]),
            "experiences": sorted([e for e in experiences if e and e.strip()]),
            "collaboration_types": sorted([c for c in collab_types if c and c.strip()])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
#  2. SEARCH & FILTER
# ==============================================================================
@router.get("/search")
async def search_collaborators(
    search: Optional[str] = None,
    skill_category: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    experience: Optional[str] = None,
    language: Optional[str] = None,
    availability: Optional[str] = None,
    collaboration_type: Optional[str] = None,
    audience: Optional[str] = None,
):
    ensure_db_connection()
    try:
        queryset = CollaboratorProfile.objects.select_related("user")

        if skill_category and skill_category != "Niche":
            queryset = queryset.filter(
                skill_category__iexact=skill_category
            )

        if location and location != "Location":
            queryset = queryset.filter(
                location__icontains=location
            )

        if experience and experience != "Experience":
            queryset = queryset.filter(
                experience__iexact=experience
            )

        if collaboration_type and collaboration_type != "Collaboration Type":
            queryset = queryset.filter(
                collaboration_type__iexact=collaboration_type
            )

        if language:
            queryset = queryset.filter(
                language__icontains=language
            )

        profiles = await sync_to_async(list)(queryset)
        filtered_profiles = []
        for p in profiles:
            include = True
            if search:
                search_lower = search.lower()
                name_match = search_lower in (p.user.full_name or "").lower()
                skill_match = search_lower in p.skill_category.lower() if p.skill_category else False
                if not name_match and not skill_match:
                    if isinstance(p.skills, str):
                        skills_match = search_lower in p.skills.lower()
                    elif isinstance(p.skills, list):
                        skills_match = any(search_lower in str(skill).lower() for skill in p.skills)
                    else:
                        skills_match = False
                    if not skills_match:
                        include = False
            if skill_category and skill_category != "Niche":
                if not p.skill_category or p.skill_category.lower() != skill_category.lower():
                    include = False
            if location and location != "Location":
                if not p.location or location.lower() not in p.location.lower():
                    include = False
            if min_price is not None:
                if not p.pricing_amount or p.pricing_amount < min_price:
                    include = False
            if max_price is not None:
                if not p.pricing_amount or p.pricing_amount > max_price:
                    include = False
            if experience and experience != "Experience":
                if not p.experience or p.experience.lower() != experience.lower():
                    include = False
            if language:
                if not p.language or language.lower() not in p.language.lower():
                    include = False
            if availability:
                if not p.availability or availability.lower() not in p.availability.lower():
                    include = False
            if collaboration_type and collaboration_type != "Collaboration Type":
                if not p.collaboration_type or collaboration_type.lower() != p.collaboration_type.lower():
                    include = False
            if audience and audience != "Audience":
                def parse_k(val):
                    if not val: return 0
                    val = val.lower().replace('+', '').strip()
                    try:
                        if 'k' in val:
                            return int(float(val.replace('k', '')) * 1000)
                        if 'm' in val:
                            return int(float(val.replace('m', '')) * 1000000)
                        return int(val) if val.isdigit() else 0
                    except ValueError:
                        return 0
                try:
                    min_f = 0
                    max_f = None
                    if '-' in audience:
                        parts = audience.split('-')
                        min_f = parse_k(parts[0])
                        max_f = parse_k(parts[1])
                    elif '+' in audience:
                        min_f = parse_k(audience)
                    if min_f and (not p.followers or p.followers < min_f):
                        include = False
                    if max_f and (not p.followers or p.followers > max_f):
                        include = False
                except ValueError:
                    pass
            if include:
                filtered_profiles.append(p)
        user_ids = [
            p.user_id
            for p in filtered_profiles
            if p.user
        ]

        all_portfolios = await sync_to_async(list)(
            PortfolioItem.objects.filter(
                user_id__in=user_ids,
                role="collaborator"
            ).order_by("order", "-created_at")
        )

        portfolio_map = {}

        for item in all_portfolios:
            portfolio_map.setdefault(
                item.user_id,
                []
            ).append(item)
        data = []
        for p in filtered_profiles:
            profile_pic_url = None
            if p.user and p.user.profile_picture:
                try:
                    profile_pic_url = f"/collaborator/files/{p.user.profile_picture.name}"
                except Exception:
                    profile_pic_url = None
            portfolio_items = portfolio_map.get(
    p.user_id,
    []
)
            portfolio_data = []
            for item in portfolio_items:
                file_url = None
                file_type = "unknown"
                if item.file:
                    file_url = f"/collaborator/files/{item.file.name}"
                    file_type = get_file_type(item.file.name)
                portfolio_data.append({
                    "id": item.id,
                    "heading": item.heading,
                    "description": item.description,
                    "media_link": item.media_link,
                    "file_url": file_url,
                    "file_type": file_type,
                    "original_filename": item.file.name.split('/')[-1] if item.file and '/' in item.file.name else (item.file.name if item.file else None),
                    "upload_date": item.created_at.strftime("%Y-%m-%d") if hasattr(item, 'created_at') else datetime.now().strftime("%Y-%m-%d")
                })
            pricing_str = ""
            if p.pricing_amount:
                pricing_str = f"{int(p.pricing_amount) if p.pricing_amount == int(p.pricing_amount) else p.pricing_amount}{p.pricing_unit or '$'}"
            else:
                pricing_str = f"0{p.pricing_unit or '$'}" if p.pricing_unit else "0$"
            data.append({
                "id": p.id,
                "user_id": p.user.id if p.user else None,
                "email": p.user.email if p.user else None,
                "name": p.user.full_name,
                "skill_category": p.skill_category,
                "skills": p.skills,
                "pricing": pricing_str,
                "location": p.location,
                "experience": p.experience,
                "language": p.language,
                "availability": p.availability,
                "collaboration_type": p.collaboration_type,
                "followers": p.followers if p.followers else 0,
                "about": p.about if p.about else "No description available.",
                "rating": p.skills_rating if p.skills_rating else 0,
                "social_link": p.social_link,
                "portfolio_link": p.portfolio_link,
                "profile_pic": profile_pic_url,
                "portfolio_items": portfolio_data,
            })
        return data
    except Exception as e:
        # print(f"ERROR in search_collaborators: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error searching collaborators: {str(e)}")


# ==============================================================================
#  3. PROFILE MANAGEMENT - WITH PORTFOLIO ITEMS
# ==============================================================================
@router.post("/save/{user_id}")
async def save_collaborator_profile(
    user_id: int,
    name: str = Form(...),
    language: Optional[str] = Form(None),
    skill_category: str = Form(...),
    experience: str = Form(...),
    skills: Optional[str] = Form(None),
    pricing_amount: Optional[str] = Form(None),
    pricing_unit: Optional[str] = Form(None),
    availability: Optional[str] = Form(None),
    timing: Optional[str] = Form(None),
    portfolio_category: Optional[str] = Form(None),
    portfolio_link: Optional[str] = Form(None),
    badges: Optional[str] = Form(None),
    about: Optional[str] = Form(None),
    location: str = Form(...),
    skills_rating: Optional[float] = Form(None),
    collaboration_type: Optional[str] = Form(None),
    followers: Optional[str] = Form(None),
    profile_picture: Optional[UploadFile] = File(None),
    portfolio_uploads: Optional[UploadFile] = File(None),
):
    # ✅ FORCE DATABASE RECONNECTION
    from django.db import connection
    try:
        connection.close()
        connection.ensure_connection()
    except Exception:
        pass
    ensure_db_connection()

    # ========== GET OR CREATE USER ==========
    try:
        @sync_to_async
        def get_user():
            return UserData.objects.get(id=user_id)
        user = await get_user()
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        # ✅ RETRY ON CONNECTION ERROR
        try:
            connection.close()
            connection.ensure_connection()
            @sync_to_async
            def get_user_retry():
                return UserData.objects.get(id=user_id)
            user = await get_user_retry()
        except UserData.DoesNotExist:
            raise HTTPException(status_code=404, detail="User not found")
        except Exception as inner_e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(inner_e)}")

    # ✅ UPDATE USER NAME
    try:
        @sync_to_async
        def update_user_name():
            user.full_name = name
            user.save()
        await update_user_name()
    except Exception as e:
        connection.close()
        connection.ensure_connection()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    random_digits = generate_random_digits()
    use_s3 = os.getenv("USE_S3", "False").lower() == "true"

    # ========== HANDLE PROFILE PICTURE ==========
    if profile_picture and profile_picture.filename:
        try:
            if use_s3:
                s3_key = await save_profile_pic(profile_picture, str(user_id))
                @sync_to_async
                def update_profile_pic_s3():
                    user.profile_picture = s3_key
                    user.save()
                await update_profile_pic_s3()
            else:
                media_dir = FASTAPI_BASE_DIR.parent / "media" / "profile_pics"
                media_dir.mkdir(parents=True, exist_ok=True)
                content = await profile_picture.read()
                ext = PathLib(profile_picture.filename).suffix
                if not ext:
                    ext = '.jpg'
                filename = f"collaborator_{user_id}_{random_digits}{ext}"
                @sync_to_async
                def update_profile_pic_local():
                    user.profile_picture.save(
                        filename,
                        ContentFile(content),
                        save=True
                    )
                await update_profile_pic_local()
        except Exception as e:
            # ✅ Don't fail the whole request if profile picture fails
            print(f"⚠️ Profile picture error: {e}")

    # ========== HANDLE PORTFOLIO UPLOADS ==========
    if portfolio_uploads and portfolio_uploads.filename:
        try:
            portfolio_content = await portfolio_uploads.read()
            portfolio_file_size = len(portfolio_content)
            original_filename = PathLib(portfolio_uploads.filename).stem
            portfolio_ext = PathLib(portfolio_uploads.filename).suffix or ".png"

            # ✅ Check storage limit
            @sync_to_async
            def check_storage():
                check_storage_limit(user, portfolio_file_size)
                return PortfolioItem.objects.create(
                    user=user,
                    role="collaborator",
                    media_link=portfolio_link if portfolio_link else None,
                    heading=original_filename,
                    description=None,
                    order=0,
                )

            portfolio_item = await check_storage()

            if use_s3:
                from fastapi_app.routes.storage import save_portfolio_upload_collaborator
                try:
                    s3_key = await save_portfolio_upload_collaborator(
                        portfolio_uploads,
                        str(user_id),
                        str(portfolio_item.id)
                    )
                    @sync_to_async
                    def update_portfolio_s3():
                        portfolio_item.file.name = s3_key
                        portfolio_item.save()
                    await update_portfolio_s3()
                except Exception as s3_error:
                    # Fallback to local storage
                    portfolio_filename = f"{user_id}_{random_digits}_portfolio_{original_filename}{portfolio_ext}"
                    @sync_to_async
                    def update_portfolio_local():
                        portfolio_item.file.save(
                            portfolio_filename,
                            ContentFile(portfolio_content),
                            save=True,
                        )
                    await update_portfolio_local()
            else:
                portfolio_filename = f"{user_id}_{random_digits}_portfolio_{original_filename}{portfolio_ext}"
                @sync_to_async
                def save_portfolio_local():
                    portfolio_item.file.save(
                        portfolio_filename,
                        ContentFile(portfolio_content),
                        save=True,
                    )
                await save_portfolio_local()

            # ✅ Track file upload
            @sync_to_async
            def track_upload():
                track_file_upload(
                    user,
                    str(portfolio_item.file.name),
                    portfolio_file_size,
                )
            await track_upload()

        except Exception as e:
            # ✅ Don't fail the whole request if portfolio upload fails
            print(f"⚠️ Portfolio upload error: {e}")

    # ========== PARSE TIMING ==========
    parsed_timing = timing
    timing_start = None
    timing_end = None
    if timing and timing != "Flexible":
        try:
            import re
            from datetime import datetime
            timing_clean = re.sub(r'\s+(IST|EST|GMT|UTC)$', '', timing.strip())
            parts = timing_clean.split(" - ")
            if len(parts) == 2:
                start_str = parts[0].strip()
                end_str = parts[1].strip()
                def convert_to_24h(time_str):
                    try:
                        time_str = time_str.strip().lower().replace(" ", "")
                        return datetime.strptime(time_str, "%I:%M%p").time()
                    except ValueError:
                        try:
                            return datetime.strptime(time_str, "%I%p").time()
                        except ValueError:
                            return None
                timing_start = convert_to_24h(start_str)
                timing_end = convert_to_24h(end_str)
        except Exception as e:
            pass

    # ========== PARSE SKILLS ==========
    skills_list = []
    if skills:
        skills_list = [s.strip() for s in skills.split(',') if s.strip()]

    # ========== PARSE PRICING ==========
    pricing_decimal = None
    if pricing_amount:
        try:
            pricing_decimal = float(pricing_amount)
        except ValueError:
            pass

    # ========== CREATE OR UPDATE COLLABORATOR PROFILE ==========
    defaults = {
        "language": language,
        "skill_category": skill_category,
        "experience": experience,
        "skills": skills_list,
        "pricing_amount": pricing_decimal,
        "pricing_unit": pricing_unit,
        "availability": availability,
        "timing": parsed_timing,
        "portfolio_category": portfolio_category,
        "portfolio_link": portfolio_link,
        "badges": badges,
        "skills_rating": skills_rating,
        "about": about,
        "location": location,
        "collaboration_type": collaboration_type,
        "followers": followers,
    }
    if hasattr(CollaboratorProfile, 'timing_start'):
        defaults["timing_start"] = timing_start
    if hasattr(CollaboratorProfile, 'timing_end'):
        defaults["timing_end"] = timing_end

    try:
        @sync_to_async
        def save_profile():
            profile, created = CollaboratorProfile.objects.update_or_create(
                user=user,
                defaults=defaults
            )
            return profile, created

        profile, created = await save_profile()
    except Exception as e:
        connection.close()
        connection.ensure_connection()
        raise HTTPException(status_code=500, detail=f"Profile save error: {str(e)}")

    # ========== UPDATE USER ROLE ==========
    if user.role != "collaborator":
        @sync_to_async
        def update_user_role():
            user.role = "collaborator"
            user.save()
        await update_user_role()

    # ========== SUBSCRIPTION CREATION ==========
    try:
        @sync_to_async
        def create_subscription():
            # Get or create Basic plan with price=0
            basic_plan = get_or_create_basic_plan("collaborator")

            if not UserSubscription.objects.filter(user=user).exists():
                now = datetime.now()
                is_basic = basic_plan.price == 0 or "basic" in basic_plan.name.lower()

                subscription = UserSubscription.objects.create(
                    user=user,
                    email=user.email or "",
                    current_plan=basic_plan.name,
                    plan_name=basic_plan.name,
                     duration="lifetime",  # ✅ CHANGED: basic_plan.duration.capitalize() → "lifetime"
    plan_price=basic_plan.price,
    plan_start_date=now,
    plan_end_date=None,  # ✅ NO END DATE
    renewal_date=None,   # ✅ NO RENEWAL
    status="active",
    is_trial=False,
                )

                # Create subscription history
                SubscriptionHistory.objects.create(
                    user=user,
                    email=user.email or "",
                    plan_name=basic_plan.name,
                    duration="lifetime", 
                    plan_price=basic_plan.price,
                    start_date=now,
                    end_date=None,
                    status="active",
                    action="created",
                    plan_id=basic_plan.id,
                    stripe_subscription_id=subscription.stripe_subscription_id,
                )

            return basic_plan

        await create_subscription()
    except Exception as e:
        # ✅ Don't fail the whole request if subscription creation fails
        print(f"⚠️ Subscription creation error: {e}")

    # ========== NOTIFICATIONS ==========
    try:
        notification_type = "profile_created" if created else "profile_updated"
        notification_title = "Collaborator Profile Created" if created else "Collaborator Profile Updated"
        notification_message = "Your collaborator profile has been created successfully." if created else "Your collaborator profile has been updated successfully."

        @sync_to_async
        def create_notification_sync():
            create_notification(
                user=user,
                notification_type=notification_type,
                title=notification_title,
                message=notification_message,
                url="/ColabProfile"
            )
        await create_notification_sync()

        if skills_list:
            @sync_to_async
            def create_skills_notification():
                create_notification(
                    user=user,
                    notification_type="skills_updated",
                    title="Skills Updated",
                    message=f"Your skills have been updated: {', '.join(skills_list[:5])}{'...' if len(skills_list) > 5 else ''}",
                    url="/ColabProfile"
                )
            await create_skills_notification()
    except Exception as e:
        # ✅ Don't fail the whole request if notification fails
        print(f"⚠️ Notification error: {e}")

    return {
        "message": "Collaborator profile saved successfully",
        "profile_id": profile.id,
        "user_id": user.id,
    }
 


# ==============================================================================
#  WORK EXPERIENCE ENDPOINTS
# ==============================================================================

@router.post("/work-experience/add/{user_id}")
async def add_work_experience(
    user_id: int,
    company_name: str = Form(...),
    role: str = Form(...),
    description: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    start_year: str = Form(...),
    end_year: Optional[str] = Form(None),
    is_current: bool = Form(False),
    order: int = Form(0),
):
    """Add a work experience entry for a collaborator"""
    ensure_db_connection()
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        work_exp = WorkExperience(
            user=user,
            company_name=company_name,
            role=role,
            description=description,
            location=location,
            start_year=start_year,
            end_year=end_year,
            is_current=is_current,
            order=order
        )
        await sync_to_async(work_exp.save)()

        # ========== 🔔 NOTIFICATION: WORK EXPERIENCE ADDED ==========
        await sync_to_async(create_notification)(
            user=user,
            notification_type="work_experience_added",
            title="Work Experience Added",
            message=f"Work experience at {company_name} as {role} has been added to your profile.",
            url="/ColabProfile"
        )

        return {
            "message": "Work experience added successfully",
            "id": work_exp.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/work-experience/list/{user_id}")
async def get_work_experiences(user_id: int):
    """Get all work experiences for a collaborator"""
    ensure_db_connection()
    try:
        experiences = await sync_to_async(list)(
            WorkExperience.objects.filter(user_id=user_id).order_by('order', '-created_at')
        )
        return [
            {
                "id": exp.id,
                "company_name": exp.company_name,
                "role": exp.role,
                "description": exp.description,
                "location": exp.location,
                "start_year": exp.start_year,
                "end_year": exp.end_year,
                "is_current": exp.is_current
            }
            for exp in experiences
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/work-experience/update/{exp_id}")
async def update_work_experience(
    exp_id: int,
    company_name: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    start_year: Optional[str] = Form(None),
    end_year: Optional[str] = Form(None),
    is_current: Optional[bool] = Form(None),
    order: Optional[int] = Form(None),
):
    """Update a work experience entry"""
    ensure_db_connection()
    try:
        work_exp = await sync_to_async(WorkExperience.objects.get)(id=exp_id)
        
        if company_name is not None:
            work_exp.company_name = company_name
        if role is not None:
            work_exp.role = role
        if description is not None:
            work_exp.description = description
        if location is not None:
            work_exp.location = location
        if start_year is not None:
            work_exp.start_year = start_year
        if end_year is not None:
            work_exp.end_year = end_year
        if is_current is not None:
            work_exp.is_current = is_current
        if order is not None:
            work_exp.order = order
            
        await sync_to_async(work_exp.save)()

        # ========== 🔔 NOTIFICATION: WORK EXPERIENCE UPDATED ==========
        user_obj = await sync_to_async(lambda: work_exp.user)()
        company_name_value = work_exp.company_name
        
        try:
            await sync_to_async(create_notification)(
                user=user_obj,
                notification_type="work_experience_updated",
                title="Work Experience Updated",
                message=f"Your work experience at {company_name_value} has been updated.",
                url="/ColabProfile"
            )
        except Exception as notif_error:
            pass
            # print(f"Warning: Could not send notification: {notif_error}")

        return {"message": "Work experience updated successfully"}
        
    except WorkExperience.DoesNotExist:
        raise HTTPException(status_code=404, detail="Work experience not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/work-experience/delete/{exp_id}")
async def delete_work_experience(exp_id: int):
    """Delete a work experience entry"""
    ensure_db_connection()
    try:
        work_exp = await sync_to_async(WorkExperience.objects.get)(id=exp_id)
        
        user_obj = await sync_to_async(lambda: work_exp.user)()
        company_name_value = work_exp.company_name
        
        await sync_to_async(work_exp.delete)()

        try:
            await sync_to_async(create_notification)(
                user=user_obj,
                notification_type="work_experience_deleted",
                title="Work Experience Removed",
                message=f"Your work experience at {company_name_value} has been removed from your profile.",
                url="/ColabProfile"
            )
        except Exception as notif_error:
            pass
            # print(f"Warning: Could not send notification: {notif_error}")

        return {"message": "Work experience deleted successfully"}
        
    except WorkExperience.DoesNotExist:
        raise HTTPException(status_code=404, detail="Work experience not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
#  PORTFOLIO MANAGEMENT ENDPOINTS - SEPARATE CRUD (Up to 10 items)
# ==============================================================================

@router.post("/portfolio/add")
async def add_portfolio_item(
    user_id: int = Form(...),
    heading: str = Form(...),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    media_link: Optional[str] = Form(None),
):
    ensure_db_connection()

    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)

        current_count = await sync_to_async(
            lambda: PortfolioItem.objects.filter(user=user, role="collaborator").count()
        )()

        if current_count >= 10:
            raise HTTPException(status_code=400, detail="Maximum 10 portfolio items allowed")

        portfolio_item = PortfolioItem(
            user=user,
            role="collaborator",
            heading=heading,
            description=description or "",
            media_link=media_link,
            order=current_count
        )

        await sync_to_async(portfolio_item.save)()

        file_size = 0
        use_s3 = os.getenv("USE_S3", "False").lower() == "true"

        if file and file.filename:
            content = await file.read()
            file_size = len(content)

            if content:
                await sync_to_async(check_storage_limit)(user, file_size)

                if use_s3:
                    # Use S3 storage for portfolio
                    from fastapi_app.routes.storage import save_portfolio_upload_collaborator
                    s3_key = await save_portfolio_upload_collaborator(file, str(user_id), str(portfolio_item.id))
                    portfolio_item.file.name = s3_key
                    await sync_to_async(portfolio_item.save)()
                    # print(f"✅ Portfolio saved to S3: {s3_key}")
                else:
                    # Use local storage
                    random_digits = generate_random_digits()
                    ext = PathLib(file.filename).suffix
                    filename = f"{user_id}_{random_digits}_portfolio_{portfolio_item.id}{ext}"
                    await sync_to_async(portfolio_item.file.save)(
                        filename,
                        ContentFile(content),
                        save=True
                    )

                await sync_to_async(track_file_upload)(
                    user,
                    str(portfolio_item.file.name),
                    file_size
                )

        # Generate file URL with S3 support
        file_url = None
        file_type = "unknown"
        if portfolio_item.file:
            # Use a function that will be called from the request context
            # We'll handle URL generation in the get endpoint
            file_url = f"/collaborator/files/{portfolio_item.file.name}"
            file_type = get_file_type(portfolio_item.file.name)

        await sync_to_async(create_notification)(
            user=user,
            notification_type="portfolio_added",
            title="Portfolio Item Added",
            message=f"Your portfolio item '{heading}' has been added successfully.",
            url="/ColabProfile"
        )

        return {
            "message": "Portfolio item added successfully",
            "id": portfolio_item.id,
            "heading": portfolio_item.heading,
            "description": portfolio_item.description,
            "file_url": file_url,
            "file_type": file_type
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/portfolio/list/{user_id}")
async def get_collaborator_portfolio(user_id: int, request: Request):
    """Get all portfolio items for a collaborator (up to 10 items) with S3 support"""
    ensure_db_connection()
    
    try:
        items = await sync_to_async(list)(
            PortfolioItem.objects.filter(
                user_id=user_id,
                role="collaborator"
            ).order_by('order', '-created_at')
        )
        
        portfolio_data = []
        for item in items:
            file_url = None
            file_type = "unknown"
            if item.file:
                # Use build_full_url with S3 support
                file_url = build_full_url(request, item.file.name)
                file_type = get_file_type(item.file.name)
            
            portfolio_data.append({
                "id": item.id,
                "heading": item.heading,
                "description": item.description,
                "media_link": item.media_link,
                "file_url": file_url,
                "file_type": file_type,
                "original_filename": item.file.name.split('/')[-1] if item.file and '/' in item.file.name else (item.file.name if item.file else None),
                "upload_date": item.created_at.strftime("%Y-%m-%d %H:%M:%S") if hasattr(item, 'created_at') else datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "order": item.order
            })
        
        return portfolio_data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/portfolio/item/{item_id}")
async def get_portfolio_item(item_id: int, request: Request):
    """Get a single portfolio item by ID with S3 support"""
    ensure_db_connection()
    try:
        item = await sync_to_async(PortfolioItem.objects.get)(
            id=item_id, 
            role="collaborator"
        )
        file_url = None
        file_type = "unknown"
        if item.file:
            file_url = build_full_url(request, item.file.name)
            file_type = get_file_type(item.file.name)
        return {
            "id": item.id,
            "user_id": item.user.id if item.user else None,
            "heading": item.heading,
            "description": item.description,
            "media_link": item.media_link,
            "file_url": file_url,
            "file_type": file_type,
            "original_filename": item.file.name.split('/')[-1] if item.file and '/' in item.file.name else (item.file.name if item.file else None),
            "upload_date": item.created_at.strftime("%Y-%m-%d %H:%M:%S") if hasattr(item, 'created_at') else None,
            "order": item.order
        }
    except PortfolioItem.DoesNotExist:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/portfolio/item/{item_id}")
async def update_portfolio_item(
    request: Request,
    item_id: int,
    heading: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    media_link: Optional[str] = Form(None),
    order: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    user_id: Optional[int] = Form(None),
):
    ensure_db_connection()

    try:
        query = PortfolioItem.objects.filter(id=item_id, role="collaborator")
        if user_id:
            query = query.filter(user_id=user_id)

        item = await sync_to_async(query.first)()
        if not item:
            raise HTTPException(status_code=404, detail="Portfolio item not found")

        old_heading = item.heading
        use_s3 = os.getenv("USE_S3", "False").lower() == "true"

        if heading is not None:
            item.heading = heading
        if description is not None:
            item.description = description
        if media_link is not None:
            item.media_link = media_link
        if order is not None:
            item.order = order

        if file and file.filename:
            content = await file.read()
            new_file_size = len(content)

            if content:
                old_file_size = 0
                old_file_name = None
                if item.file:
                    try:
                        old_file_size = await sync_to_async(lambda: item.file.size)()
                        old_file_name = item.file.name
                    except Exception:
                        old_file_size = 0

                net_increase = max(0, new_file_size - old_file_size)
                if net_increase > 0:
                    owner = await sync_to_async(lambda: item.user)()
                    await sync_to_async(check_storage_limit)(owner, net_increase)

                # Delete old file from S3 or local
                if item.file:
                    try:
                        if use_s3 and old_file_name:
                            s3_key = old_file_name.lstrip('/')
                            delete_file(s3_key)
                            # print(f"✅ Deleted old portfolio from S3: {s3_key}")
                        else:
                            await sync_to_async(item.file.delete)(save=False)
                            # print(f"✅ Deleted old portfolio locally")
                        
                        if old_file_size > 0:
                            owner = await sync_to_async(lambda: item.user)()
                            await sync_to_async(track_file_deletion)(owner, old_file_size)
                    except Exception as e:
                        pass
                        # print(f"Warning: Could not delete old file: {e}")

                # Save new file to S3 or local
                if use_s3:
                    from fastapi_app.routes.storage import save_portfolio_upload_collaborator
                    s3_key = await save_portfolio_upload_collaborator(file, str(item.user_id), str(item_id))
                    item.file.name = s3_key
                    # print(f"✅ Portfolio updated in S3: {s3_key}")
                else:
                    random_digits = generate_random_digits()
                    ext = PathLib(file.filename).suffix
                    filename = f"{item.user_id}_{random_digits}_updated_{item_id}{ext}"
                    await sync_to_async(item.file.save)(
                        filename,
                        ContentFile(content),
                        save=True
                    )

                owner = await sync_to_async(lambda: item.user)()
                await sync_to_async(track_file_upload)(
                    owner,
                    str(item.file.name),
                    new_file_size
                )

        await sync_to_async(item.save)()

        file_url = None
        file_type = "unknown"
        if item.file:
            file_url = build_full_url(request, item.file.name)
            file_type = get_file_type(item.file.name)

        user_obj = await sync_to_async(lambda: item.user)()
        
        await sync_to_async(create_notification)(
            user=user_obj,
            notification_type="portfolio_updated",
            title="Portfolio Item Updated",
            message=f"Your portfolio item '{heading or old_heading}' has been updated successfully.",
            url="/ColabProfile"
        )

        return {
            "message": "Portfolio item updated successfully",
            "id": item_id,
            "heading": item.heading,
            "description": item.description,
            "file_url": file_url,
            "file_type": file_type
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/portfolio/item/{item_id}")
async def delete_portfolio_item(item_id: int, user_id: Optional[int] = None):
    ensure_db_connection()
    try:
        query = PortfolioItem.objects.filter(id=item_id, role="collaborator")
        if user_id:
            query = query.filter(user_id=user_id)
        item = await sync_to_async(query.first)()
        if not item:
            raise HTTPException(status_code=404, detail="Portfolio item not found")
        
        file_size = 0
        owner = await sync_to_async(lambda: item.user)()
        item_user_id = item.user_id
        use_s3 = os.getenv("USE_S3", "False").lower() == "true"
        file_name = None  # ✅ Initialize file_name to None
        
        if item.file:
            try:
                file_size = await sync_to_async(lambda: item.file.size)()
                file_name = item.file.name  # ✅ Set file_name here
            except Exception as e:
                # print(f"Error getting file size: {e}")
                file_size = 0
            
            # Delete from S3 or local
            if use_s3 and file_name:
                s3_key = file_name.lstrip('/')
                delete_file(s3_key)
                # print(f"✅ Deleted portfolio from S3: {s3_key}")
            else:
                await sync_to_async(item.file.delete)(save=False)
                # print(f"✅ Deleted portfolio locally")
                
        await sync_to_async(item.delete)()
        
        if file_size > 0 and owner:
            await sync_to_async(track_file_deletion)(owner, file_size)
            
        remaining_items = await sync_to_async(list)(
            PortfolioItem.objects.filter(
                user_id=item_user_id,
                role="collaborator"
            ).order_by('order')
        )
        for idx, remaining_item in enumerate(remaining_items):
            if remaining_item.order != idx:
                remaining_item.order = idx
                await sync_to_async(remaining_item.save)()

        await sync_to_async(create_notification)(
            user=owner,
            notification_type="portfolio_deleted",
            title="Portfolio Item Removed",
            message="A portfolio item has been removed from your profile.",
            url="/ColabProfile"
        )

        return {"message": "Portfolio item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        # print(f"Error in delete_portfolio_item: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/portfolio/reorder")
async def reorder_portfolio_items(
    user_id: int = Form(...),
    item_orders: str = Form(...)
):
    """Reorder portfolio items"""
    ensure_db_connection()
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
        orders = json.loads(item_orders)
        for order_data in orders:
            item_id = order_data.get("id")
            new_order = order_data.get("order")
            if item_id is not None and new_order is not None:
                await sync_to_async(
                    PortfolioItem.objects.filter(
                        id=item_id, 
                        user=user, 
                        role="collaborator"
                    ).update
                )(order=new_order)

        await sync_to_async(create_notification)(
            user=user,
            notification_type="portfolio_reordered",
            title="Portfolio Reordered",
            message="Your portfolio items have been reordered successfully.",
            url="/ColabProfile"
        )

        return {"message": "Portfolio items reordered successfully"}
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
#  DEBUG ENDPOINT - Check Portfolio Items
# ==============================================================================
@router.get("/debug/portfolio/{user_id}")
async def debug_portfolio(user_id: int):
    """Debug endpoint to check what's in the database"""
    ensure_db_connection()
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
        items = await sync_to_async(list)(
            PortfolioItem.objects.filter(user=user, role="collaborator")
        )
        file_status = []
        for item in items:
            file_info = {
                "id": item.id,
                "heading": item.heading,
                "description": item.description,
                "file_name": item.file.name if item.file else None,
                "file_exists_on_disk": False,
                "file_url": None,
                "created_at": str(item.created_at),
                "order": item.order,
                "role": item.role
            }
            if item.file:
                try:
                    exists = await sync_to_async(item.file.storage.exists)(item.file.name)
                    file_info["file_exists_on_disk"] = exists
                    file_info["file_url"] = f"/collaborator/files/{item.file.name}"
                    file_info["file_path"] = item.file.path
                except:
                    pass
            file_status.append(file_info)
        media_dir = FASTAPI_BASE_DIR.parent / "media"
        portfolio_dir = media_dir / "portfolio_uploads" / "collaborator"
        files_in_dir = []
        if portfolio_dir.exists():
            files_in_dir = [f.name for f in portfolio_dir.iterdir() if f.is_file()]
        return {
            "user_id": user_id,
            "user_email": user.email,
            "portfolio_items_in_db": len(items),
            "portfolio_items": file_status,
            "media_base_dir": str(media_dir),
            "portfolio_dir_exists": portfolio_dir.exists(),
            "portfolio_dir": str(portfolio_dir),
            "files_in_directory": files_in_dir[:20],
        }
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        return {"error": str(e)}


from datetime import datetime


def calculate_experience_years(work_experiences):
    total_years = 0
    current_year = datetime.now().year

    for exp in work_experiences:
        try:
            start = int(exp.start_year)

            if exp.is_current:
                end = current_year
            else:
                end = int(exp.end_year) if exp.end_year else current_year

            if end >= start:
                total_years += (end - start)

        except Exception as e:
            pass
            # print(f"Experience calculation error: {e}")

    return total_years


@router.get("/get/{user_id}")
async def get_collaborator_profile(user_id: int, request: Request):
    ensure_db_connection()

    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)

        profile = await sync_to_async(
            lambda: CollaboratorProfile.objects.filter(user=user).first()
        )()

        if not profile:
            return {
                "user_id": user_id,
                "email": user.email,
                "message": "Profile not created yet"
            }

    except (UserData.DoesNotExist, CollaboratorProfile.DoesNotExist):
        raise HTTPException(status_code=404, detail="Profile not found")

    # ================= EDUCATION =================
    educations = await sync_to_async(list)(
        Education.objects.filter(user=user).order_by('order', '-created_at')
    )

    education_data = []

    for edu in educations:
        education_data.append({
            "id": edu.id,
            "institution_name": edu.institution_name,
            "degree": edu.degree,
            "field_of_study": edu.field_of_study,
            "description": edu.description,
            "location": edu.location,
            "start_year": edu.start_year,
            "end_year": edu.end_year,
            "is_current": edu.is_current
        })

    # ================= PORTFOLIO =================
    portfolio_items = await sync_to_async(list)(
        PortfolioItem.objects.filter(
            user=user,
            role="collaborator"
        ).order_by('order', '-created_at')
    )

    portfolio_data = []

    for item in portfolio_items:
        file_url = None
        file_type = "unknown"

        if item.file:
            # Use build_full_url with S3 support
            file_url = build_full_url(request, item.file.name)
            file_type = get_file_type(item.file.name)

        portfolio_data.append({
            "id": item.id,
            "heading": item.heading,
            "description": item.description,
            "media_link": item.media_link,
            "file_url": file_url,
            "file_type": file_type,
            "original_filename": item.file.name.split('/')[-1]
            if item.file and '/' in item.file.name
            else (item.file.name if item.file else None),
            "upload_date": (
                item.created_at.strftime("%Y-%m-%d %H:%M:%S")
                if hasattr(item, 'created_at')
                else datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            ),
            "order": item.order
        })

    # ================= WORK EXPERIENCE =================
    work_experiences = await sync_to_async(list)(
        WorkExperience.objects.filter(user=user).order_by(
            'order',
            '-created_at'
        )
    )

    work_data = []

    for exp in work_experiences:
        work_data.append({
            "id": exp.id,
            "company_name": exp.company_name,
            "role": exp.role,
            "description": exp.description,
            "location": exp.location,
            "start_year": exp.start_year,
            "end_year": exp.end_year,
            "is_current": exp.is_current
        })

    # ================= EXPERIENCE YEARS CALCULATION =================
    experience_years = calculate_experience_years(work_experiences)

    # ================= PROFILE PICTURE =================
    profile_pic_url = None
    if user.profile_picture:
        profile_pic_url = build_full_url(request, user.profile_picture.name)

    # ================= REVIEWS =================
    reviews = await sync_to_async(list)(
        Review.objects.select_related("reviewer")
        .filter(recipient=user)
        .order_by('-updated_at')
    )

    review_data = []

    for r in reviews:
        review_data.append({
            "reviewer_name": r.reviewer.full_name or r.reviewer.email,
            "rating": r.rating,
            "comment": r.comment,
            "date": r.updated_at.strftime("%d %b %Y")
        })

    # ================= CREATED DATE =================
    created_at = None

    if profile.created_at:
        created_at = profile.created_at
    elif hasattr(user, "date_joined") and user.date_joined:
        created_at = user.date_joined
    elif user.created_at:
        created_at = user.created_at

    # ================= VERIFICATION =================
    verification = await sync_to_async(
        lambda: UserVerification.objects.filter(user=user).first()
    )()

    email_verified = False
    phone_verified = False

    if verification:
        email_verified = verification.email_verified
        phone_verified = verification.phone_verified
        
    # ================= COMPLETED CONTRACTS =================
    from django.db.models import Sum
    
    completed_contracts = await sync_to_async(list)(
        Contract.objects.filter(
            collaborator=user,
            status='completed',
            is_paid=True
        )
    )
    
    total_earnings = sum(float(contract.budget) for contract in completed_contracts)
    completed_projects_count = len(completed_contracts)

    # ================= RESPONSE =================
    return {
        "user_id": user_id,
        "email": user.email,
        "full_name": user.full_name or "",
        "name": user.full_name,
        "language": profile.language,
        "skill_category": profile.skill_category,
        "skills": profile.skills,
        "experience": profile.experience,
        "experience_years": experience_years,
        "pricing_amount": (
            float(profile.pricing_amount)
            if profile.pricing_amount
            else None
        ),
        "pricing_unit": profile.pricing_unit,
        "pricing_type": profile.pricing_type or "hourly",
        "availability": profile.availability,
        "timing": profile.timing,
        "social_link": profile.social_link,
        "portfolio_link": profile.portfolio_link,
        "badges": profile.badges,
        "skills_rating": profile.skills_rating or 0,
        "about": profile.about,
        "location": profile.location,
        "collaboration_type": profile.collaboration_type,
        "followers": profile.followers,
        "total_earnings": total_earnings,
        "completed_projects_count": completed_projects_count,
        "profile_picture_url": profile_pic_url,
        "portfolio_items": portfolio_data,
        "work_experiences": work_data,
        "educations": education_data,
        "reviews": review_data,
        "review_count": len(reviews),
        "phone_number": user.phone_number or "",
        "created_at": (
            created_at.isoformat()
            if created_at
            else None
        ),
        "email_verified": email_verified,
        "phone_verified": phone_verified
    }


    
@router.put("/edit/{user_id}")
async def edit_collaborator_profile(
    user_id: int,
    name: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    email: Optional[str] = Form(None),     
    language: Optional[str] = Form(None),
    skill_category: Optional[str] = Form(None),
    experience: Optional[str] = Form(None),
    skills: Optional[str] = Form(None),
    pricing_amount: Optional[str] = Form(None),
    pricing_unit: Optional[str] = Form(None),
    pricing_type: Optional[str] = Form(None),
    availability: Optional[str] = Form(None),
    timing: Optional[str] = Form(None),
    badges: Optional[str] = Form(None),
    about: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    collaboration_type: Optional[str] = Form(None),
    followers: Optional[str] = Form(None),
    skills_rating: Optional[float] = Form(None),
    profile_picture: Optional[UploadFile] = File(None),
):
    ensure_db_connection()
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
        profile = await sync_to_async(
            lambda: CollaboratorProfile.objects.filter(user=user).first()
        )()
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
    except (UserData.DoesNotExist, CollaboratorProfile.DoesNotExist):
        raise HTTPException(status_code=404, detail="Collaborator profile not found")

    random_digits = generate_random_digits()
    profile_updated = False
    skills_updated = False
    use_s3 = os.getenv("USE_S3", "False").lower() == "true"

    # ========== PROFILE PICTURE ==========
    if profile_picture and profile_picture.filename:
        try:
            # Delete old image
            if user.profile_picture:
                old_picture_name = str(user.profile_picture)
                if old_picture_name and not old_picture_name.startswith(('http://', 'https://')):
                    try:
                        if use_s3:
                            s3_key = old_picture_name.lstrip('/')
                            delete_file(s3_key)
                            # print(f"✅ Deleted old profile picture from S3: {s3_key}")
                        else:
                            await sync_to_async(user.profile_picture.delete)(save=False)
                            # print(f"✅ Deleted old profile picture locally")
                    except Exception as e:
                        pass
                        # print(f"Warning: Could not delete old profile picture: {e}")

            # Save new profile picture
            if use_s3:
                s3_key = await save_profile_pic(profile_picture, str(user_id))
                user.profile_picture = s3_key
                # print(f"✅ Profile picture saved to S3: {s3_key}")
            else:
                ext = PathLib(profile_picture.filename).suffix
                filename = f"collaborator_{user_id}_{random_digits}{ext}"
                content = await profile_picture.read()
                await sync_to_async(user.profile_picture.save)(
                    filename,
                    ContentFile(content),
                    save=True
                )
                # print(f"✅ Profile picture saved locally: {filename}")
            
            profile_updated = True
        except Exception as e:
            pass
            # print(f"❌ Error updating profile picture: {e}")

    update_fields = []
    
    if email is not None and email.strip():
        email_clean = email.strip().lower()
        email_exists = await sync_to_async(
            lambda: UserData.objects.filter(email=email_clean).exclude(id=user_id).exists()
        )()
        if email_exists:
            raise HTTPException(status_code=400, detail="Email already registered")
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email_clean):
            raise HTTPException(status_code=400, detail="Invalid email format")
        user.email = email_clean
        await sync_to_async(user.save)()
        profile_updated = True
        
    if name is not None: 
        user.full_name = name
        await sync_to_async(user.save)()
        profile_updated = True

    if phone_number is not None:
        user.phone_number = phone_number
        await sync_to_async(user.save)()
        profile_updated = True

    if language is not None: 
        profile.language = language
        update_fields.append('language')
        profile_updated = True
    if skill_category is not None: 
        profile.skill_category = skill_category
        update_fields.append('skill_category')
        profile_updated = True
    if experience is not None: 
        profile.experience = experience
        update_fields.append('experience')
        profile_updated = True
    if skills is not None: 
        profile.skills = [s.strip() for s in skills.split(',') if s.strip()]
        update_fields.append('skills')
        profile_updated = True
        skills_updated = True
    if pricing_amount is not None: 
        try:
            profile.pricing_amount = float(pricing_amount)
            update_fields.append('pricing_amount')
            profile_updated = True
        except ValueError:
            pass
    if pricing_unit is not None: 
        profile.pricing_unit = pricing_unit
        update_fields.append('pricing_unit')
        profile_updated = True
    if pricing_type is not None:
        profile.pricing_type = pricing_type
        update_fields.append('pricing_type')
        profile_updated = True
    if availability is not None: 
        profile.availability = availability
        update_fields.append('availability')
        profile_updated = True
    if timing is not None: 
        profile.timing = timing
        update_fields.append('timing')
        profile_updated = True
    if badges is not None: 
        profile.badges = badges
        update_fields.append('badges')
        profile_updated = True
    if about is not None: 
        profile.about = about
        update_fields.append('about')
        profile_updated = True
    if location is not None: 
        profile.location = location
        update_fields.append('location')
        profile_updated = True
    if collaboration_type is not None: 
        profile.collaboration_type = collaboration_type
        update_fields.append('collaboration_type')
        profile_updated = True
    if followers is not None and followers != "":
        try:
            profile.followers = int(followers)
            update_fields.append('followers')
            profile_updated = True
        except ValueError:
            pass
    if skills_rating is not None and skills_rating != "":
        try:
            profile.skills_rating = float(skills_rating)
            update_fields.append('skills_rating')
            profile_updated = True
        except ValueError:
            pass
    
    if update_fields:
        await sync_to_async(profile.save)(update_fields=update_fields)

    if profile_updated:
        await sync_to_async(create_notification)(
            user=user,
            notification_type="profile_updated",
            title="Collaborator Profile Updated",
            message="Your collaborator profile has been updated successfully.",
            url="/ColabProfile"
        )

    # if skills_updated and profile.skills:
    #     skills_display = ', '.join(profile.skills[:5]) if isinstance(profile.skills, list) else str(profile.skills)[:100]
    #     await sync_to_async(create_notification)(
    #         user=user,
    #         notification_type="skills_updated",
    #         title="Skills Updated",
    #         message=f"Your skills have been updated: {skills_display}{'...' if len(str(profile.skills)) > 100 else ''}",
    #         url="/ColabProfile"
    #     )

    return {
        "status": "success",
        "message": "Collaborator profile updated successfully"
    }


# ==============================================================================
#  PROFILE DELETE
# ==============================================================================
@router.delete("/delete/{user_id}")
async def delete_collaborator_profile(user_id: int):
    ensure_db_connection()
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
        try:
            portfolio_items = await sync_to_async(list)(
                PortfolioItem.objects.filter(user=user, role="collaborator")
            )
            for item in portfolio_items:
                if item.file:
                    await sync_to_async(item.file.delete)(save=False)
                await sync_to_async(item.delete)()
            work_experiences = await sync_to_async(list)(
                WorkExperience.objects.filter(user=user)
            )
            for exp in work_experiences:
                await sync_to_async(exp.delete)()
            educations = await sync_to_async(list)(
                Education.objects.filter(user=user)
            )
            for edu in educations:
                await sync_to_async(edu.delete)()
            profile = await sync_to_async(
                lambda: CollaboratorProfile.objects.filter(user=user).first()
            )()
            if not profile:
                raise HTTPException(status_code=404, detail="Profile not found")
            await sync_to_async(profile.delete)()

            await sync_to_async(create_notification)(
                user=user,
                notification_type="profile_deleted",
                title="Collaborator Profile Deleted",
                message="Your collaborator profile has been deleted successfully.",
                url="/dashboard"
            )

        except CollaboratorProfile.DoesNotExist:
            pass
        return {"message": "Collaborator profile deleted"}
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Profile not found")


@router.get("/list")
def list_all_collaborators(request: Request):
    """Get all collaborators without scoring"""
    ensure_db_connection()
    try:
        all_collaborators = CollaboratorProfile.objects.select_related("user").all()
        result = []
        for collab in all_collaborators:
            if not collab.user:
                continue
            hourly_rate = None
            formatted_rate = "Rate not specified"
            pricing_type_display = "hourly"
            if collab.pricing_amount:
                amount = float(collab.pricing_amount)
                pricing_type = getattr(collab, 'pricing_type', None)
                if not pricing_type:
                    pricing_type = getattr(collab, 'pricing_unit', 'hourly')
                pricing_type_display = pricing_type
                if pricing_type in ['hourly', 'hour', 'hr']:
                    formatted_rate = f"₹{amount:.2f}/hr"
                    hourly_rate = amount
                elif pricing_type in ['daily', 'day']:
                    formatted_rate = f"₹{amount:.2f}/day"
                    hourly_rate = amount / 8
                elif pricing_type in ['weekly', 'week']:
                    formatted_rate = f"₹{amount:.2f}/week"
                    hourly_rate = amount / 40
                elif pricing_type in ['monthly', 'month']:
                    formatted_rate = f"₹{amount:.2f}/month"
                    hourly_rate = amount / 160
                elif pricing_type == 'project':
                    formatted_rate = f"₹{amount:.2f}/project"
                    hourly_rate = amount
                else:
                    formatted_rate = f"₹{amount:.2f}/hr"
                    hourly_rate = amount
                    pricing_type_display = "hourly"
            else:
                hourly_rate = 20
                formatted_rate = "₹20.00/hr"
                pricing_type_display = "hourly"
            collaborator_name = "Collaborator"
            if collab.user:
                if collab.user.full_name:
                    collaborator_name = collab.user.full_name
                elif collab.user.name:
                    collaborator_name = collab.user.name
                else:
                    collaborator_name = collab.user.email.split('@')[0] if collab.user.email else "Collaborator"
            
            # ✅ UPDATED: Use build_full_url for profile picture
            profile_picture_url = None
            if collab.user and collab.user.profile_picture:
                profile_picture_url = build_full_url(request, collab.user.profile_picture.name)
            
            rating_value = float(getattr(collab, 'rating', 0) or 0)
            reviews_count = int(getattr(collab, 'reviews_count', 0) or 0)

            skill_rating = (
                float(collab.skills_rating)
                if getattr(collab, "skills_rating", None) is not None
                else 0
            )
            
            result.append({
                "user_id": collab.user.id,
                "id": collab.user.id,
                "name": collaborator_name,
                "full_name": collaborator_name,
                "skill_category": collab.skill_category,
                "skills": collab.skills,
                "job_title": collab.skill_category or "Professional",
                "experience": collab.experience,
                "pricing_amount": float(collab.pricing_amount) if collab.pricing_amount else None,
                "pricing_type": pricing_type_display,
                "pricing_unit": pricing_type_display,
                "formatted_rate": formatted_rate,
                "hourly_rate": hourly_rate,
                "location": collab.location,
                "country_code": get_country_code(collab.location),
                "total_earnings": float(getattr(collab, 'total_earnings', 0) or 0),
                "followers": collab.followers,
                "portfolio_link": collab.portfolio_link,
                "rating": rating_value,
                "about": collab.about or "No description available.",   
                "ratingValue": rating_value,
                "skill_rating": skill_rating,
                "skills_rating": skill_rating,
                "is_online": getattr(collab, 'is_online', True),
                "badge": getattr(collab, 'badge', None),
                "profile_picture": profile_picture_url,
            })
        return result
    except Exception as e:
        # print(f"Error in list_all_collaborators: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
#  5. JOB ACTIONS
# ==============================================================================
@router.post("/jobs/toggle-save")
async def toggle_save_job(user_id: int, job_id: int):
    ensure_db_connection()
    try:
        # print(f"🔍 Toggle save called - user_id: {user_id}, job_id: {job_id}")
        user = await sync_to_async(UserData.objects.get)(id=user_id)
        # print(f"✅ User found: {user.email}")
        job = await sync_to_async(
            lambda: JobPost.objects.select_related('employer').get(id=job_id)
        )()
        # print(f"✅ Job found: {job.title}")
        existing = await sync_to_async(lambda: SavedJob.objects.filter(user=user, job=job).first())()
        if existing:
            # print(f"📌 Removing saved job")
            await sync_to_async(existing.delete)()

            await sync_to_async(create_notification)(
                user=user,
                notification_type="job_unsaved",
                title="Job Removed from Saved",
                message=f"Job '{job.title}' has been removed from your saved jobs.",
            )

            return {"status": "removed", "message": "Job removed from saved list"}
        else:
            # print(f"📌 Creating saved job")
            await sync_to_async(SavedJob.objects.create)(user=user, job=job)
            # print(f"📌 Sending notification to job creator: {job.employer.email}")
            await sync_to_async(create_job_save_notification)(user, job.employer, job)

            await sync_to_async(create_notification)(
                user=user,
                notification_type="job_saved",
                title="Job Saved",
                message=f"Job '{job.title}' has been added to your saved jobs.",
            )

            return {"status": "saved", "message": "Job added to saved list"}
    except UserData.DoesNotExist:
        # print(f"❌ User {user_id} not found")
        raise HTTPException(status_code=404, detail="User not found")
    except JobPost.DoesNotExist:
        # print(f"❌ Job {job_id} not found")
        raise HTTPException(status_code=404, detail="Job not found")
    except Exception as e:
        # print(f"❌ Error in toggle_save_job: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jobs/track-view")
async def track_job_view(user_id: int, job_id: int):
    """Track when a collaborator views a job"""
    ensure_db_connection()
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
        job = await sync_to_async(JobPost.objects.get)(id=job_id)
        from django.utils import timezone
        @sync_to_async
        def update_or_create_view():
            view, created = RecentlyViewedJob.objects.update_or_create(
                user=user, 
                job=job,
                defaults={'viewed_at': timezone.now()}
            )
            return view
        await update_or_create_view()
        return {"status": "success"}
    except Exception as e:
        # print(f"Error tracking view: {e}")
        raise HTTPException(status_code=404, detail="Error tracking view")


# ==============================================================================
#  6. FEEDS
# ==============================================================================
@router.get("/jobs/best-match/{user_id}")
async def get_best_match_jobs(user_id: int):
    """Get best matching jobs for a collaborator based on skills"""
    ensure_db_connection()
    try:
        @sync_to_async
        def get_best_match_jobs_sync():
            try:
                user = UserData.objects.get(id=user_id)
                profile = CollaboratorProfile.objects.filter(user=user).first()
                if not profile:
                    return []
                user_skills = []
                if profile.skills:
                    if isinstance(profile.skills, str):
                        user_skills = [s.strip().lower() for s in profile.skills.split(',') if s.strip()]
                    elif isinstance(profile.skills, list):
                        user_skills = [s.lower() for s in profile.skills if s]
                if profile.skill_category:
                    user_skills.append(profile.skill_category.strip().lower())
                if not user_skills:
                    return []
                jobs = JobPost.objects.filter(
                    status__iexact="posted",
                    has_contract=False
                ).select_related('employer').order_by('-created_at')
                scored_jobs = []
                for job in jobs:
                    score = 0
                    job_skills = []
                    if job.skills:
                        if isinstance(job.skills, str):
                            job_skills = [s.strip().lower() for s in job.skills.split(',')]
                        elif isinstance(job.skills, list):
                            job_skills = [s.lower() for s in job.skills]
                    job_title = job.title.lower() if job.title else ""
                    job_desc = job.description.lower() if job.description else ""
                    for my_skill in user_skills:
                        if my_skill in job_skills:
                            score += 10
                        elif my_skill in job_title:
                            score += 5
                        elif my_skill in job_desc:
                            score += 2
                    if score > 0:
                        creator = job.employer
                        review_stats = Review.objects.filter(recipient=creator).aggregate(
                            avg_rating=Avg("rating"),
                            total_reviews=Count("id")
                        )
                        rating = round(review_stats["avg_rating"] or 0, 1)
                        reviews_count = review_stats["total_reviews"] or 0
                        
                        # ✅ FIXED: Get creator location from CreatorProfile (no role check)
                        creator_location = get_user_location_from_profile(creator)
                        country = creator_location.get("location") or "Unknown"
                        state = creator_location.get("state") or None
                        country_code = get_country_code(country)
                        
                        budget = ""
                        if job.budget_from and job.budget_to:
                            budget = f"{job.budget_from} - {job.budget_to}"
                        elif job.budget_from:
                            budget = f"{job.budget_from}+"
                        elif job.budget_to:
                            budget = f"Up to {job.budget_to}"
                        scored_jobs.append({
                            "id": job.id,
                            "title": job.title,
                            "description": job.description,
                            "budget": budget,
                            "budget_from": float(job.budget_from) if job.budget_from else None,
                            "budget_to": float(job.budget_to) if job.budget_to else None,
                            "budget_type": job.budget_type,
                            "match_score": score,
                            "skills": job.skills,
                            "expertise_level": job.expertise_level,
                            "timeline": job.timeline,
                            "duration": job.duration,
                            "posted_at": job.created_at.strftime("%d %b %Y") if job.created_at else None,
                            "created_at": job.created_at.isoformat() if job.created_at else None,
                            "employer_id": job.employer_id,
                            "employer_name": job.employer.full_name if job.employer else "Unknown",
                            "creator_rating": rating,
                            "creator_reviews_count": reviews_count,
                            "creator_country": country,
                            "creator_state": state,
                            "creator_country_code": country_code
                        })
                scored_jobs.sort(key=lambda x: x["match_score"], reverse=True)
                return scored_jobs[:20]
            except UserData.DoesNotExist:
                return []
            except Exception as e:
                # print(f"Error in get_best_match_jobs_sync: {e}")
                raise e
        result = await get_best_match_jobs_sync()
        return result
    except Exception as e:
        # print(f"Error in get_best_match_jobs: {e}")
        return []


@router.get("/jobs/saved/{user_id}")
async def get_saved_jobs(user_id: int):
    """Get saved jobs for a collaborator"""
    ensure_db_connection()

    try:
        @sync_to_async
        def get_saved_jobs_sync():
            try:
                user = UserData.objects.get(id=user_id)
                saved_entries = SavedJob.objects.filter(
                    user=user,
                    job__has_contract=False
                ).select_related('job__employer').order_by('-saved_at')

                result = []
                for entry in saved_entries:
                    job = entry.job
                    if job:
                        budget = ""
                        if job.budget_from and job.budget_to:
                            budget = f"{job.budget_from} - {job.budget_to}"
                        elif job.budget_from:
                            budget = f"{job.budget_from}+"
                        elif job.budget_to:
                            budget = f"Up to {job.budget_to}"
                        skills = job.skills
                        if isinstance(skills, str):
                            try:
                                skills = json.loads(skills)
                            except:
                                skills = [s.strip() for s in skills.split(',') if s.strip()]
                        creator = job.employer
                        review_stats = Review.objects.filter(recipient=creator).aggregate(
                            avg_rating=Avg("rating"),
                            total_reviews=Count("id")
                        )
                        rating = round(review_stats["avg_rating"] or 0, 1)
                        reviews_count = review_stats["total_reviews"] or 0
                        
                        # ✅ FIXED: Get creator location from CreatorProfile (no role check)
                        creator_location = get_user_location_from_profile(creator)
                        country = creator_location.get("location") or None
                        state = creator_location.get("state") or None
                        
                        result.append({
                            "id": job.id,
                            "title": job.title,
                            "description": job.description,
                            "budget": budget,
                            "budget_from": float(job.budget_from) if job.budget_from else None,
                            "budget_to": float(job.budget_to) if job.budget_to else None,
                            "budget_type": job.budget_type,
                            "saved_at": entry.saved_at.strftime("%d %b %Y") if entry.saved_at else None,
                            "skills": skills,
                            "expertise_level": job.expertise_level,
                            "timeline": job.timeline,
                            "duration": job.duration,
                            "status": job.status,
                            "created_at": job.created_at.isoformat() if job.created_at else None,
                            "employer_id": job.employer_id,
                            "employer_name": job.employer.full_name if job.employer else "Unknown",
                            "creator_rating": rating,
                            "creator_reviews_count": reviews_count,
                            "creator_country": country,
                            "creator_state": state,
                            "creator_country_code": get_country_code(country) if country else None,
                        })

                return result

            except UserData.DoesNotExist:
                return None
            except Exception as e:
                # print(f"Error in get_saved_jobs_sync: {e}")
                raise e

        result = await get_saved_jobs_sync()

        if result is None:
            return []

        return result

    except Exception as e:
        # print(f"Error in get_saved_jobs: {e}")
        return []


@router.get("/jobs/recent/{user_id}")
async def get_recent_jobs(user_id: int):
    """Get recently viewed jobs for a collaborator (includes newly posted jobs)"""
    ensure_db_connection()
    try:
        @sync_to_async
        def get_recent_jobs_sync():
            try:
                user = UserData.objects.get(id=user_id)
                recent_entries = RecentlyViewedJob.objects.filter(
                    user=user,
                    job__has_contract=False
                ).select_related('job__employer').order_by('-viewed_at')
                viewed_job_ids = [entry.job_id for entry in recent_entries if entry.job]
                from datetime import timedelta
                from django.utils import timezone
                thirty_days_ago = timezone.now() - timedelta(days=30)
                new_jobs = JobPost.objects.filter(
                    status__iexact="posted",
                    has_contract=False,
                    created_at__gte=thirty_days_ago
                ).exclude(
                    id__in=viewed_job_ids
                ).order_by('-created_at')[:20]
                result = []
                for entry in recent_entries:
                    job = entry.job
                    if job:
                        budget = ""
                        if job.budget_from and job.budget_to:
                            budget = f"{job.budget_from} - {job.budget_to}"
                        elif job.budget_from:
                            budget = f"{job.budget_from}+"
                        elif job.budget_to:
                            budget = f"Up to {job.budget_to}"
                        skills = job.skills
                        if isinstance(skills, str):
                            try:
                                skills = json.loads(skills)
                            except:
                                skills = [s.strip() for s in skills.split(',') if s.strip()]
                        creator = job.employer
                        review_stats = Review.objects.filter(recipient=creator).aggregate(
                            avg_rating=Avg("rating"),
                            total_reviews=Count("id")
                        )
                        rating = round(review_stats["avg_rating"] or 0, 1)
                        reviews_count = review_stats["total_reviews"] or 0
                        
                        # ✅ FIXED: Get creator location from CreatorProfile (no role check)
                        creator_location = get_user_location_from_profile(creator)
                        country = creator_location.get("location") or None
                        state = creator_location.get("state") or None
                        
                        result.append({
                            "id": job.id,
                            "title": job.title,
                            "description": job.description,
                            "budget": budget,
                            "budget_from": float(job.budget_from) if job.budget_from else None,
                            "budget_to": float(job.budget_to) if job.budget_to else None,
                            "budget_type": job.budget_type,
                            "viewed_at": entry.viewed_at.isoformat() if entry.viewed_at else job.created_at.isoformat(),
                            "skills": skills,
                            "expertise_level": job.expertise_level,
                            "timeline": job.timeline,
                            "duration": job.duration,
                            "status": job.status,
                            "created_at": job.created_at.isoformat() if job.created_at else None,
                            "employer_id": job.employer_id,
                            "employer_name": job.employer.full_name if job.employer else "Unknown",
                            "creator_rating": rating,
                            "creator_reviews_count": reviews_count,
                            "creator_country": country,
                            "creator_state": state,
                            "creator_country_code": get_country_code(country) if country else None
                        })
                for job in new_jobs:
                    budget = ""
                    if job.budget_from and job.budget_to:
                        budget = f"{job.budget_from} - {job.budget_to}"
                    elif job.budget_from:
                        budget = f"{job.budget_from}+"
                    elif job.budget_to:
                        budget = f"Up to {job.budget_to}"
                    skills = job.skills
                    if isinstance(skills, str):
                        try:
                            skills = json.loads(skills)
                        except:
                            skills = [s.strip() for s in skills.split(',') if s.strip()]
                    creator = job.employer
                    review_stats = Review.objects.filter(recipient=creator).aggregate(
                        avg_rating=Avg("rating"),
                        total_reviews=Count("id")
                    )
                    rating = round(review_stats["avg_rating"] or 0, 1)
                    reviews_count = review_stats["total_reviews"] or 0
                    
                    # ✅ FIXED: Get creator location from CreatorProfile (no role check)
                    creator_location = get_user_location_from_profile(creator)
                    country = creator_location.get("location") or None
                    state = creator_location.get("state") or None
                    
                    result.append({
                        "id": job.id,
                        "title": job.title,
                        "description": job.description,
                        "budget": budget,
                        "budget_from": float(job.budget_from) if job.budget_from else None,
                        "budget_to": float(job.budget_to) if job.budget_to else None,
                        "budget_type": job.budget_type,
                        "viewed_at": job.created_at.isoformat(),
                        "skills": skills,
                        "expertise_level": job.expertise_level,
                        "timeline": job.timeline,
                        "duration": job.duration,
                        "status": job.status,
                        "created_at": job.created_at.isoformat() if job.created_at else None,
                        "employer_id": job.employer_id,
                        "employer_name": job.employer.full_name if job.employer else "Unknown",
                        "creator_rating": rating,
                        "creator_reviews_count": reviews_count,
                        "creator_country": country,
                        "creator_state": state,
                        "creator_country_code": get_country_code(country) if country else None
                    })
                result.sort(key=lambda x: x["viewed_at"], reverse=True)
                return result
            except UserData.DoesNotExist:
                return []
            except Exception as e:
                # print(f"Error in get_recent_jobs_sync: {e}")
                raise e
        result = await get_recent_jobs_sync()
        return result
    except Exception as e:
        # print(f"Error in get_recent_jobs: {e}")
        return []


# ==============================================================================
#  7. REVIEWS
# ==============================================================================
@router.post("/reviews/add-or-edit")
async def add_collaborator_review(creator_id: int, collaborator_id: int, rating: int, comment: str):
    ensure_db_connection()
    try:
        if rating < 0 or rating > 5:
            raise HTTPException(status_code=400, detail="Rating must be between 0 and 5")
        creator = await sync_to_async(UserData.objects.get)(id=creator_id)
        collaborator = await sync_to_async(UserData.objects.get)(id=collaborator_id)
        has_completed_work = await sync_to_async(
            lambda: Contract.objects.filter(
                creator=creator, collaborator=collaborator, status__iexact="completed"
            ).exists()
        )()
        if not has_completed_work:
            raise HTTPException(status_code=403, detail="No completed work found.")
        review, created = await sync_to_async(Review.objects.update_or_create)(
            reviewer=creator, recipient=collaborator,
            defaults={"rating": rating, "comment": comment}
        )
        try:
            profile = await sync_to_async(CollaboratorProfile.objects.get)(user=collaborator)
            all_reviews = await sync_to_async(list)(Review.objects.filter(recipient=collaborator))
            if all_reviews:
                avg = sum(r.rating for r in all_reviews) / len(all_reviews)
                profile.skills_rating = min(max(float(avg), 0), 5)
                await sync_to_async(profile.save)()
        except CollaboratorProfile.DoesNotExist:
            pass

        await sync_to_async(create_notification)(
            user=collaborator,
            notification_type="review_received",
            title="New Review Received",
            message=f"{creator.full_name or creator.email} left you a {rating}-star review: {comment[:100]}{'...' if len(comment) > 100 else ''}",
            url=f"/collaborator/get/{collaborator_id}"
        )

        await sync_to_async(create_notification)(
            user=creator,
            notification_type="review_submitted",
            title="Review Submitted",
            message=f"Your review for {collaborator.full_name or collaborator.email} has been submitted successfully.",
            url=f"/collaborator/get/{collaborator_id}"
        )

        return {"status": "success", "message": "Review saved"}
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")


@router.get("/reviews/list/{user_id}")
async def get_collaborator_reviews(user_id: int, request: Request):
    """
    Get all reviews for a collaborator with S3 support for reviewer profile pictures
    """
    ensure_db_connection()
    
    try:
        reviews = await sync_to_async(list)(
            Review.objects.select_related("reviewer")
            .filter(recipient_id=user_id)
            .order_by('-updated_at')
        )
        
        result = []
        for r in reviews:
            reviewer = r.reviewer
            
            # Handle reviewer profile picture with S3 support
            reviewer_profile_picture_url = None
            if reviewer and reviewer.profile_picture:
                # Use the build_full_url function which handles both S3 and local
                reviewer_profile_picture_url = build_full_url(request, str(reviewer.profile_picture.name))
            
            result.append({
                "reviewer_name": reviewer.full_name if reviewer else "Unknown",
                "reviewer_id": reviewer.id if reviewer else None,
                "rating": r.rating,
                "comment": r.comment,
                "date": r.updated_at.strftime("%d %b %Y") if r.updated_at else None,
                "reviewer_profile_picture": reviewer_profile_picture_url
            })
        
        return result
        
    except Exception as e:
        # print(f"Error in get_collaborator_reviews: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Add these to your collaborator.py

@router.get("/jobs/filter")
async def filter_jobs(
    search: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    skills: Optional[str] = None,
    location: Optional[str] = None,
    sort_by: Optional[str] = "latest",
    user_id: Optional[int] = None
):
    """Filter jobs with backend filtering - Fixed Price only"""
    ensure_db_connection()
    
    @sync_to_async
    def get_filtered_jobs():
        try:
            # Base query - only fixed price jobs
            jobs = JobPost.objects.filter(
                status__iexact="posted",
                has_contract=False,
                budget_type__iexact="fixed"
            ).select_related('employer')

            # Apply search filter
            if search and search.strip():
                search_lower = search.lower()
                jobs = jobs.filter(
                    Q(title__icontains=search_lower) |
                    Q(description__icontains=search_lower) |
                    Q(skills__icontains=search_lower)
                )

            # Apply budget range filters
            if min_budget is not None and min_budget > 0:
                jobs = jobs.filter(
                    Q(budget_from__gte=min_budget) | Q(budget_to__gte=min_budget)
                )
            if max_budget is not None and max_budget > 0:
                jobs = jobs.filter(
                    Q(budget_from__lte=max_budget) | Q(budget_to__lte=max_budget)
                )

            # Apply skills filter
            if skills and skills.strip():
                skill_list = [s.strip().lower() for s in skills.split(',') if s.strip()]
                for skill in skill_list:
                    jobs = jobs.filter(skills__icontains=skill)

            # Apply location filter (from creator profile)
            if location and location.strip():
                location_lower = location.lower()
                filtered_jobs = []
                for job in jobs:
                    creator = job.employer
                    creator_location = get_user_location_from_profile(creator)
                    loc = creator_location.get("location", "")
                    state = creator_location.get("state", "")
                    if (location_lower in loc.lower() or 
                        location_lower in state.lower() or
                        (loc and location_lower in loc.lower())):
                        filtered_jobs.append(job)
                jobs = filtered_jobs
            else:
                jobs = list(jobs)

            # Apply sorting
            if sort_by == "latest":
                jobs.sort(key=lambda x: x.created_at, reverse=True)
            elif sort_by == "oldest":
                jobs.sort(key=lambda x: x.created_at)
            elif sort_by == "budget_high":
                jobs.sort(key=lambda x: max(x.budget_to or 0, x.budget_from or 0), reverse=True)
            elif sort_by == "budget_low":
                jobs.sort(key=lambda x: min(x.budget_from or 0, x.budget_to or 0))
            elif sort_by == "rating_high":
                jobs.sort(key=lambda x: get_creator_rating(x.employer), reverse=True)

            # Build response
            result = []
            for job in jobs:
                creator = job.employer
                creator_location = get_user_location_from_profile(creator)
                country = creator_location.get("location") or "Remote"
                state = creator_location.get("state") or None
                rating = get_creator_rating(creator)
                reviews_count = get_creator_reviews_count(creator)

                result.append({
                    "id": job.id,
                    "title": job.title,
                    "description": job.description,
                    "budget_from": float(job.budget_from) if job.budget_from else None,
                    "budget_to": float(job.budget_to) if job.budget_to else None,
                    "budget_type": job.budget_type,
                    "skills": job.skills,
                    "expertise_level": job.expertise_level,
                    "created_at": job.created_at.isoformat() if job.created_at else None,
                    "employer_name": creator.full_name or "Anonymous",
                    "creator_rating": rating,
                    "creator_reviews_count": reviews_count,
                    "creator_country": country,
                    "creator_state": state,
                    "creator_country_code": get_country_code(country),
                    "has_contract": job.has_contract,
                    "status": job.status
                })

            return result
        except Exception as e:
            # print(f"Error in get_filtered_jobs: {e}")
            raise e
    
    try:
        result = await get_filtered_jobs()
        return result
    except Exception as e:
        # print(f"Error in filter_jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs/location-list")
async def get_job_locations():
    """Get list of unique locations from creator profiles (for filter dropdown)"""
    ensure_db_connection()
    
    @sync_to_async
    def get_locations():
        try:
            locations = set()
            profiles = CreatorProfile.objects.exclude(location__isnull=True).exclude(location__exact='')
            for profile in profiles:
                if profile.location and profile.location.strip():
                    locations.add(profile.location.strip())
                if profile.state and profile.state.strip():
                    locations.add(profile.state.strip())
            return sorted(list(locations))
        except Exception as e:
            # print(f"Error getting locations: {e}")
            return []
    
    try:
        result = await get_locations()
        return result
    except Exception as e:
        # print(f"Error in get_job_locations: {e}")
        return []


@router.get("/jobs/skills-list")
async def get_job_skills():
    """Get list of unique skills from job posts (for filter dropdown)"""
    ensure_db_connection()
    
    @sync_to_async
    def get_skills():
        try:
            skills_set = set()
            jobs = JobPost.objects.filter(
                status__iexact="posted", 
                budget_type__iexact="fixed"
            )
            for job in jobs:
                if job.skills:
                    if isinstance(job.skills, str):
                        try:
                            skills = json.loads(job.skills)
                        except:
                            skills = [s.strip() for s in job.skills.split(',') if s.strip()]
                    elif isinstance(job.skills, list):
                        skills = job.skills
                    else:
                        continue
                    for skill in skills:
                        if skill and skill.strip():
                            skills_set.add(skill.strip())
            return sorted(list(skills_set))
        except Exception as e:
            # print(f"Error getting skills: {e}")
            return []
    
    try:
        result = await get_skills()
        return result
    except Exception as e:
        # print(f"Error in get_job_skills: {e}")
        return []


def get_creator_rating(creator):
    """Get average rating for a creator (sync version)"""
    try:
        stats = Review.objects.filter(recipient=creator).aggregate(
            avg_rating=Avg("rating")
        )
        return round(stats["avg_rating"] or 0, 1)
    except:
        return 0


def get_creator_reviews_count(creator):
    """Get review count for a creator (sync version)"""
    try:
        return Review.objects.filter(recipient=creator).count()
    except:
        return 0


def format_budget_display(job):
    """Format budget for display in rupees - Fixed price only"""
    # Since we only show fixed price jobs, just show the fixed amount
    if job.budget_from and job.budget_from > 0:
        return f"₹{int(job.budget_from)}"
    elif job.budget_to and job.budget_to > 0:
        return f"₹{int(job.budget_to)}"
    return "₹0"
# ==============================================================================
#  8. JOB DETAILS
# ==============================================================================
@router.get("/jobs/{job_id}")
async def get_job_details(job_id: int, request: Request):
    ensure_db_connection()
    try:
        job = await sync_to_async(JobPost.objects.get)(id=job_id)
        proposal_count = await sync_to_async(
            lambda: Proposal.objects.filter(job=job).count()
        )()
        interviewing_count = await sync_to_async(
            lambda: Proposal.objects.filter(
                job=job,
                status="accepted"
            ).count()
        )()
        invites_sent = await sync_to_async(
            lambda: Invitation.objects.filter(job=job).count()
        )()
        unanswered_invites = await sync_to_async(
            lambda: Invitation.objects.filter(
                job=job,
                status="Pending"
            ).count()
        )()
        last_viewed_at = job.updated_at
        creator = await sync_to_async(UserData.objects.get)(id=job.employer_id)
        
        # ✅ FIXED: Get creator location from CreatorProfile (no role check)
        creator_location = get_user_location_from_profile(creator)
        country = creator_location.get("location") or "Unknown"
        state = creator_location.get("state") or None
        country_code = get_country_code(country)
        
        @sync_to_async
        def get_review_stats():
            stats = Review.objects.filter(recipient=creator).aggregate(
                avg_rating=Avg("rating"),
                total_reviews=Count("id")
            )
            return {
                "avg_rating": stats["avg_rating"] or 0,
                "total_reviews": stats["total_reviews"] or 0
            }
        review_stats = await get_review_stats()
        rating = round(float(review_stats["avg_rating"]), 1)
        reviews = int(review_stats["total_reviews"])
        profile_pic_url = None
        if creator.profile_picture:
            base_url = str(request.base_url).rstrip('/')
            profile_pic_url = f"{base_url}/media/{creator.profile_picture.name}"
        return {
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "skills": job.skills,
            "timeline": job.timeline,
            "duration": job.duration,
            "expertise_level": job.expertise_level,
            "budget_type": job.budget_type,
            "budget_from": float(job.budget_from) if job.budget_from else None,
            "budget_to": float(job.budget_to) if job.budget_to else None,
            "status": job.status,
            "created_at": job.created_at.isoformat(),
            "employer_id": job.employer_id,
            "proposal_count": proposal_count,
            "interviewing_count": interviewing_count,
            "invites_sent": invites_sent,
            "unanswered_invites": unanswered_invites,
            "last_viewed_at": last_viewed_at.isoformat() if last_viewed_at else None,
            "attachments": [
                f"{BASE_URL}/media/{a}"
                for a in (job.attachments or [])
            ],
            "creator": {
                "id": creator.id,
                "full_name": creator.full_name or "Anonymous",
                "state": state,
                "country": country,
                "country_code": country_code,
                "rating": rating,
                "reviews_count": reviews,
                "profile_picture": profile_pic_url
            },
        }
    except JobPost.DoesNotExist:
        raise HTTPException(status_code=404, detail="Job not found")
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Creator not found")
    except Exception as e:
        # print(f"Error in get_job_details: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/job-search")
async def search_jobs(search: Optional[str] = None):
    ensure_db_connection()
    jobs = await sync_to_async(list)(
        JobPost.objects.select_related(
            "employer",
            "employer__creatorprofile"
        ).filter(status="posted", has_contract=False)
    )
    if search:
        filtered_jobs = []
        for job in jobs:
            search_lower = search.lower()
            cp = getattr(job.employer, "creatorprofile", None)
            if (search_lower in job.title.lower() or
                search_lower in job.description.lower() or
                (isinstance(job.skills, str) and search_lower in job.skills.lower()) or
                (isinstance(job.skills, list) and any(search_lower in str(s).lower() for s in job.skills)) or
                (search_lower in (job.employer.full_name or "").lower()) or
                (cp and cp.location and search_lower in cp.location.lower())):
                filtered_jobs.append(job)
        jobs = filtered_jobs
    results = []
    for j in jobs:
        cp = getattr(j.employer, "creatorprofile", None)
        results.append({
            "id": j.id,
            "title": j.title,
            "description": j.description,
            "skills": j.skills,
            "budget_type": j.budget_type,
            "budget_from": j.budget_from,
            "budget_to": j.budget_to,
            "expertise_level": j.expertise_level,
            "created_at": j.created_at,
            "creator_name": j.employer.full_name or "Unknown",
            "location": cp.location if cp and cp.location else "Remote",
        })
    return results


# ==============================================================================
#  EDUCATION ENDPOINTS
# ==============================================================================

@router.post("/education/add/{user_id}")
async def add_education(
    user_id: int,
    institution_name: str = Form(...),
    degree: str = Form(...),
    field_of_study: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    start_year: str = Form(...),
    end_year: Optional[str] = Form(None),
    is_current: bool = Form(False),
    order: int = Form(0),
):
    """Add an education entry for a collaborator"""
    ensure_db_connection()
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        education = Education(
            user=user,
            institution_name=institution_name,
            degree=degree,
            field_of_study=field_of_study,
            description=description,
            location=location,
            start_year=start_year,
            end_year=end_year,
            is_current=is_current,
            order=order
        )
        await sync_to_async(education.save)()

        await sync_to_async(create_notification)(
            user=user,
            notification_type="education_added",
            title="Education Added",
            message=f"Education at {institution_name} ({degree}) has been added to your profile.",
            url="/ColabProfile"
        )

        return {
            "message": "Education added successfully",
            "id": education.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/education/list/{user_id}")
async def get_educations(user_id: int):
    """Get all education entries for a collaborator"""
    ensure_db_connection()
    try:
        educations = await sync_to_async(list)(
            Education.objects.filter(user_id=user_id).order_by('order', '-created_at')
        )
        return [
            {
                "id": edu.id,
                "institution_name": edu.institution_name,
                "degree": edu.degree,
                "field_of_study": edu.field_of_study,
                "description": edu.description,
                "location": edu.location,
                "start_year": edu.start_year,
                "end_year": edu.end_year,
                "is_current": edu.is_current
            }
            for edu in educations
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/education/update/{edu_id}")
async def update_education(
    edu_id: int,
    institution_name: Optional[str] = Form(None),
    degree: Optional[str] = Form(None),
    field_of_study: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    start_year: Optional[str] = Form(None),
    end_year: Optional[str] = Form(None),
    is_current: Optional[bool] = Form(None),
    order: Optional[int] = Form(None),
):
    """Update an education entry"""
    ensure_db_connection()
    try:
        education = await sync_to_async(Education.objects.get)(id=edu_id)
        
        if institution_name is not None:
            education.institution_name = institution_name
        if degree is not None:
            education.degree = degree
        if field_of_study is not None:
            education.field_of_study = field_of_study
        if description is not None:
            education.description = description
        if location is not None:
            education.location = location
        if start_year is not None:
            education.start_year = start_year
        if end_year is not None:
            education.end_year = end_year
        if is_current is not None:
            education.is_current = is_current
        if order is not None:
            education.order = order
            
        await sync_to_async(education.save)()

        user_obj = await sync_to_async(lambda: education.user)()
        institution_name_value = education.institution_name
        
        try:
            await sync_to_async(create_notification)(
                user=user_obj,
                notification_type="education_updated",
                title="Education Updated",
                message=f"Your education at {institution_name_value} has been updated.",
                url="/ColabProfile"
            )
        except Exception as notif_error:
            pass
            # print(f"Warning: Could not send notification: {notif_error}")

        return {"message": "Education updated successfully"}
        
    except Education.DoesNotExist:
        raise HTTPException(status_code=404, detail="Education not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/education/delete/{edu_id}")
async def delete_education(edu_id: int):
    """Delete an education entry"""
    ensure_db_connection()
    try:
        education = await sync_to_async(Education.objects.get)(id=edu_id)
        
        user_obj = await sync_to_async(lambda: education.user)()
        institution_name_value = education.institution_name
        
        await sync_to_async(education.delete)()

        try:
            await sync_to_async(create_notification)(
                user=user_obj,
                notification_type="education_deleted",
                title="Education Removed",
                message=f"Your education at {institution_name_value} has been removed from your profile.",
                url="/ColabProfile"
            )
        except Exception as notif_error:
            pass
            # print(f"Warning: Could not send notification: {notif_error}")

        return {"message": "Education deleted successfully"}
        
    except Education.DoesNotExist:
        raise HTTPException(status_code=404, detail="Education not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
#  COMPLETED PROJECTS ENDPOINTS
# ==============================================================================

@router.get("/completed-projects/{user_id}")
async def get_completed_projects_count(user_id: int):
    """Get count of completed projects for a collaborator from contracts table"""
    ensure_db_connection()
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
        completed_count = await sync_to_async(
            lambda: Contract.objects.filter(
                collaborator=user,
                status__iexact="completed"
            ).count()
        )()
        return {
            "user_id": user_id,
            "completed_projects": completed_count
        }
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/completed-projects/update/{user_id}")
async def update_completed_projects(user_id: int):
    """Update the completed_projects field in collaborator profile by counting completed contracts"""
    ensure_db_connection()
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
        profile = await sync_to_async(CollaboratorProfile.objects.get)(user=user)
        completed_count = await sync_to_async(
            lambda: Contract.objects.filter(
                collaborator=user,
                status__iexact="completed"
            ).count()
        )()
        old_count = profile.completed_projects or 0
        profile.completed_projects = completed_count
        await sync_to_async(profile.save)(update_fields=['completed_projects'])

        if old_count != completed_count:
            await sync_to_async(create_notification)(
                user=user,
                notification_type="completed_projects_updated",
                title="Completed Projects Updated",
                message=f"Your completed projects count has been updated from {old_count} to {completed_count}.",
                url="/ColabProfile"
            )

        return {
            "message": "Completed projects updated successfully",
            "completed_projects": completed_count
        }
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except CollaboratorProfile.DoesNotExist:
        raise HTTPException(status_code=404, detail="Collaborator profile not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/completed-projects/sync-all")
async def sync_all_completed_projects():
    """Sync completed_projects for all collaborators"""
    ensure_db_connection()
    try:
        profiles = await sync_to_async(list)(CollaboratorProfile.objects.select_related('user').all())
        updated_count = 0
        for profile in profiles:
            completed_count = await sync_to_async(
                lambda: Contract.objects.filter(
                    collaborator=profile.user,
                    status__iexact="completed"
                ).count()
            )()
            if profile.completed_projects != completed_count:
                profile.completed_projects = completed_count
                await sync_to_async(profile.save)(update_fields=['completed_projects'])
                updated_count += 1
        return {
            "message": f"Synced completed projects for {updated_count} profiles",
            "total_profiles": len(profiles),
            "updated_count": updated_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
#  USER CONNECTS ENDPOINT
# ==============================================================================
@router.get("/connects/{user_id}")
async def get_user_connects(user_id: int):
    """Get available connects for a collaborator"""
    ensure_db_connection()
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
        profile = await sync_to_async(
            lambda: CollaboratorProfile.objects.filter(user=user).first()
        )()
        connects = 10
        return {
            "user_id": user_id,
            "connects": connects,
            "message": "Connects retrieved successfully"
        }
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
# ==============================================================================
#  PORTFOLIO DOWNLOAD ENDPOINT
# ==============================================================================
@router.get("/portfolio/download/{item_id}")
async def download_portfolio_item(
    item_id: int,
    user_id: int = Query(...),
):
    """
    Download a portfolio item file directly through the backend.
    Handles both S3 and local storage with proper filename and content type.
    """
    ensure_db_connection()
    
    try:
        # Get the portfolio item
        item = await sync_to_async(
            lambda: PortfolioItem.objects.select_related("user").get(
                id=item_id,
                role="collaborator"
            )
        )()
        
        # Check if user is authorized
        if item.user_id != user_id:
            # Allow any authenticated user to view/download portfolio items
            # You can add more specific authorization logic here if needed
            pass
        
        if not item.file:
            raise HTTPException(status_code=404, detail="No file attached to this portfolio item")
        
        # Get the file path/name
        file_path = str(item.file.name)
        original_filename = item.heading or "portfolio-file"
        
        # Try to get original filename from the file
        if '/' in file_path:
            stored_filename = file_path.split('/')[-1]
            # Use stored filename if heading is not available
            if not item.heading:
                original_filename = stored_filename
        
        use_s3_env = os.getenv("USE_S3", "False").lower() == "true"
        
        if use_s3_env:
            # ========== S3 STORAGE ==========
            try:
                from fastapi_app.routes.storage import read_file_bytes
                s3_key = file_path.lstrip('/')
                file_content = read_file_bytes(s3_key)
                
                # Determine content type
                import mimetypes
                content_type, _ = mimetypes.guess_type(original_filename)
                if not content_type:
                    content_type = 'application/octet-stream'
                
                # Return as downloadable file
                return StreamingResponse(
                    io.BytesIO(file_content),
                    media_type=content_type,
                    headers={
                        "Content-Disposition": f'attachment; filename="{original_filename}"',
                        "Content-Type": content_type,
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        "Pragma": "no-cache",
                        "Expires": "0"
                    }
                )
            except Exception as e:
                # print(f"Error downloading from S3: {e}")
                raise HTTPException(status_code=500, detail=f"Failed to download file from S3: {str(e)}")
        else:
            # ========== LOCAL STORAGE ==========
            # Try to find the file in various locations
            possible_paths = [
                PathLib(f"media/{file_path}"),
                PathLib(f"fastapi_app/media/{file_path}"),
                PathLib(f"fastapi_app/local_storage/{file_path}"),
                PathLib(f"fastapi_app/{file_path}"),
                PathLib(f"media/portfolio_uploads/collaborator/{PathLib(file_path).name}"),
                PathLib(f"media/portfolio_uploads/creator/{PathLib(file_path).name}"),
            ]
            
            file_location = None
            for path in possible_paths:
                if path.exists() and path.is_file():
                    file_location = path
                    break
            
            if not file_location:
                raise HTTPException(status_code=404, detail="File not found on server")
            
            # Determine content type
            import mimetypes
            content_type, _ = mimetypes.guess_type(str(file_location))
            if not content_type:
                content_type = 'application/octet-stream'
            
            return FileResponse(
                path=file_location,
                filename=original_filename,
                media_type=content_type,
                headers={
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                }
            )
            
    except PortfolioItem.DoesNotExist:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    except Exception as e:
        # print(f"Error in download_portfolio_item: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))