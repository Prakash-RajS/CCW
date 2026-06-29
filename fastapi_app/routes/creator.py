


#fastapi_app/routes/creator.py
from typing import Any, Dict, Optional, List
from django.db.models import Q
import os
from fastapi import APIRouter, File, Form, HTTPException, Path, Query, Request, UploadFile
from pydantic import BaseModel

# ✅ DATABASE CONNECTION MANAGEMENT (Import from dbconnection)
from fastapi_app.routes.dbconnection import ensure_db_connection, check_db_connection

from creator_app.models import Review, SubscriptionHistory, SubscriptionPlan, UserData, CreatorProfile, UserSubscription, UserVerification, Notification
from creator_app.models import UserData, CollaboratorProfile, JobPost, PortfolioItem
from pathlib import Path as PathLib
from asgiref.sync import sync_to_async
import random
import string
from django.core.files.base import ContentFile
import pycountry
import pytz
from django.db.models import Avg, Count
from datetime import datetime, timedelta
from timezonefinder import TimezoneFinder
from fastapi_app.services.notification_service import create_notification
from fastapi_app.routes.storage import get_profile_pic_url, save_profile_pic



router = APIRouter(prefix="/creator", tags=["Creator"])

FASTAPI_BASE_DIR = PathLib(__file__).resolve().parent.parent


def generate_random_digits(length=4):
    """Generate random digits for filename"""
    return ''.join(random.choices(string.digits, k=length))


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

# fastapi_app/routes/creator.py - Update build_full_url function

def build_full_url(request: Request, path: str | None, use_s3: bool = True) -> str | None:
    """Build full URL from relative path with S3 support for all file types"""
    if not path:
        return None
    if path.startswith('http'):
        return path
    
    # Check if using S3
    use_s3_env = os.getenv("USE_S3", "False").lower() == "true"
    if use_s3 and use_s3_env:
        s3_key = path.lstrip('/')
        
        # Check if we have a cached URL
        from django.core.cache import cache
        cache_key = f"presigned_url_{s3_key}_86400"  # 24 hours expiry
        cached_url = cache.get(cache_key)
        if cached_url:
            return cached_url
        
        # Determine which S3 URL generator to use based on path
        if s3_key.startswith('profile_pics/'):
            from fastapi_app.routes.storage import get_profile_pic_url
            file_url = get_profile_pic_url(s3_key)
        elif s3_key.startswith('portfolio_uploads/'):
            from fastapi_app.routes.storage import get_portfolio_upload_url
            file_url = get_portfolio_upload_url(s3_key)
        else:
            # Generic fallback - try profile pic first
            from fastapi_app.routes.storage import get_profile_pic_url
            file_url = get_profile_pic_url(s3_key)
            if not file_url:
                from fastapi_app.routes.storage import get_portfolio_upload_url
                file_url = get_portfolio_upload_url(s3_key)
        
        if file_url:
            # Cache the URL
            cache.set(cache_key, file_url, timeout=3600)  # Cache for 1 hour
            return file_url
    
    # Fallback to local media path
    base_url = str(request.base_url).rstrip('/')
    clean_path = path.lstrip('/')
    return f"{base_url}/media/{clean_path}"
# ------------------------------------------------
# FILTER CREATORS
# ------------------------------------------------
@router.get("/search")
def search_creators(
    search: Optional[str] = None,
    niche: Optional[str] = None,
    creator_type: Optional[str] = None,
    location: Optional[str] = None,
    min_followers: Optional[int] = None,
    max_followers: Optional[int] = None,
    platforms: Optional[List[str]] = Query(None),
    experience_level: Optional[str] = None,
    collaboration_type: Optional[str] = None,
):
    # Ensure database connection
    ensure_db_connection()
    
    profiles = CreatorProfile.objects.all()

    # Text search
    if search:
        profiles = profiles.filter(
            # Q(creator_name__icontains=search) |
            Q(user__full_name__icontains=search) |
            Q(primary_niche__icontains=search)
        )

    # Filters
    if niche:
        profiles = profiles.filter(primary_niche__iexact=niche)

    if creator_type:
        profiles = profiles.filter(creator_type__iexact=creator_type)

    if location:
        profiles = profiles.filter(location__icontains=location)

    if min_followers is not None:
        profiles = profiles.filter(followers__gte=min_followers)

    if max_followers is not None:
        profiles = profiles.filter(followers__lte=max_followers)

    if experience_level:
        profiles = profiles.filter(experience_level__iexact=experience_level)

    if collaboration_type:
        profiles = profiles.filter(collaboration_type__iexact=collaboration_type)

    # Multi-platform filter (OR logic)
    if platforms:
        q = Q()
        for p in platforms:
            q |= Q(platforms__icontains=p)
        profiles = profiles.filter(q)

    return [
        {
            "user_id": p.user.id,
            "email": p.user.email,
            # "creator_name": p.creator_name,
            "name": p.user.full_name,
            "creator_type": p.creator_type,
            "primary_niche": p.primary_niche,
            "location": p.location,
            "followers": p.followers,
            "platforms": p.platforms,
            "experience_level": p.experience_level,
            "collaboration_type": p.collaboration_type,
            "project_type": p.project_type,
        }
        for p in profiles
    ]


@router.post("/save/{user_id}")
async def save_creator_profile(
    user_id: int,
    creator_name: str = Form(...),
    creator_type: str = Form(...),
    experience_level: str = Form(...),
    primary_niche: str = Form(...),
    secondary_niche: Optional[str] = Form(None),
    platforms: Optional[str] = Form(None),
    followers: Optional[int] = Form(None),
    about: Optional[str] = Form(None),
    portfolio_category: str = Form(...),
    collaboration_type: str = Form(...),
    project_type: str = Form(...),
    location: Optional[str] = Form(None),
    portfolio_link: Optional[str] = Form(None),
    portfolio_uploads: Optional[UploadFile] = File(None),
    profile_picture: Optional[UploadFile] = File(None),
):
    # ✅ FORCE DATABASE RECONNECTION (same as collaborator)
    from django.db import connection
    try:
        @sync_to_async
        def reset_connection():
            connection.close()
            connection.ensure_connection()
        await reset_connection()
    except Exception:
        pass
    ensure_db_connection()

    # ========== GET USER ==========
    try:
        @sync_to_async
        def get_user():
            return UserData.objects.get(id=user_id)
        
        user = await get_user()
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        # ✅ RETRY ON CONNECTION ERROR (same as collaborator)
        try:
            @sync_to_async
            def reset_connection_retry():
                connection.close()
                connection.ensure_connection()
            await reset_connection_retry()
            
            @sync_to_async
            def get_user_retry():
                return UserData.objects.get(id=user_id)
            
            user = await get_user_retry()
        except UserData.DoesNotExist:
            raise HTTPException(status_code=404, detail="User not found")
        except Exception as inner_e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(inner_e)}")

    use_s3 = os.getenv("USE_S3", "False").lower() == "true"

    # ---------------- Profile Picture ----------------
    if profile_picture:
        try:
            if use_s3:
                s3_key = await save_profile_pic(profile_picture, str(user_id))
                @sync_to_async
                def update_profile_pic():
                    user.profile_picture = s3_key
                    user.save()
                await update_profile_pic()
            else:
                ext = PathLib(profile_picture.filename).suffix
                filename = f"creator_{user_id}_{generate_random_digits()}{ext}"
                content = await profile_picture.read()
                @sync_to_async
                def save_profile_pic_local():
                    user.profile_picture.save(
                        filename,
                        ContentFile(content),
                        save=True
                    )
                await save_profile_pic_local()
        except Exception as e:
            pass
            # print(f"⚠️ Profile picture error: {e}")

    # ---------------- Save / Update Creator Profile ----------------
    defaults = {
        "creator_type": creator_type,
        "experience_level": experience_level,
        "primary_niche": primary_niche,
        "secondary_niche": secondary_niche,
        "platforms": platforms,
        "followers": followers,
        "about": about,
        "portfolio_category": portfolio_category,
        "collaboration_type": collaboration_type,
        "project_type": project_type,
        "location": location,
    }

    try:
        @sync_to_async
        def save_profile():
            profile, _ = CreatorProfile.objects.update_or_create(
                user=user,
                defaults=defaults
            )
            return profile
        
        profile = await save_profile()
    except Exception as e:
        @sync_to_async
        def reset_connection_on_error():
            connection.close()
            connection.ensure_connection()
        
        await reset_connection_on_error()
        raise HTTPException(status_code=500, detail=f"Profile save error: {str(e)}")

    # ---------------- SAVE PORTFOLIO INTO PortfolioItem ----------------
    if portfolio_uploads:
        try:
            content = await portfolio_uploads.read()

            @sync_to_async
            def create_portfolio_item():
                return PortfolioItem.objects.create(
                    user=user,
                    role="creator",
                    title=portfolio_category or "Portfolio",
                    media_link=portfolio_link.strip() if portfolio_link else None,
                )
            
            portfolio_item = await create_portfolio_item()

            if use_s3:
                from fastapi_app.routes.storage import save_portfolio_upload_creator
                try:
                    s3_key = await save_portfolio_upload_creator(portfolio_uploads, str(user_id), str(portfolio_item.id))
                    @sync_to_async
                    def update_portfolio_s3():
                        portfolio_item.file.name = s3_key
                        portfolio_item.save()
                    await update_portfolio_s3()
                except Exception as s3_error:
                    ext = PathLib(portfolio_uploads.filename).suffix
                    filename = f"{user_id}_{generate_random_digits()}{ext}"
                    @sync_to_async
                    def save_portfolio_local():
                        portfolio_item.file.save(
                            filename,
                            ContentFile(content),
                            save=True,
                        )
                    await save_portfolio_local()
            else:
                ext = PathLib(portfolio_uploads.filename).suffix
                filename = f"{user_id}_{generate_random_digits()}{ext}"
                @sync_to_async
                def save_portfolio_local():
                    portfolio_item.file.save(
                        filename,
                        ContentFile(content),
                        save=True,
                    )
                await save_portfolio_local()

        except Exception as e:
            # print(f"⚠️ Portfolio upload error: {e}")
            pass

    elif portfolio_link and portfolio_link.strip():
        @sync_to_async
        def create_portfolio_link():
            PortfolioItem.objects.create(
                user=user,
                role="creator",
                title=portfolio_category or "Portfolio",
                media_link=portfolio_link.strip(),
            )
        await create_portfolio_link()

    # ---------------- Update user role ----------------
    @sync_to_async
    def update_user():
        user.role = "creator"
        user.full_name = creator_name 
        user.save()
    await update_user()

    # ========== SUBSCRIPTION CREATION ==========
    try:
        @sync_to_async
        def create_subscription():
            basic_plan = get_or_create_basic_plan("creator")
            
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
        # print(f"⚠️ Subscription creation error: {e}")
        pass

    return {
        "message": "Creator profile saved successfully"
    }

# ------------------------------------------------
# Get Creator Profile by USER ID
# ------------------------------------------------

tf = TimezoneFinder()

def get_country_code(country_name: str | None):
    if not country_name:
        return None
    try:
        country = pycountry.countries.search_fuzzy(country_name)[0]
        return country.alpha_2
    except Exception:
        return None


def get_local_time_from_country(country_name: str | None):
    """
    Returns formatted local time like: 7:45 PM
    """
    if not country_name:
        return None

    try:
        code = get_country_code(country_name)
        if not code:
            return None

        timezones = pytz.country_timezones.get(code)
        if not timezones:
            return None

        tz = pytz.timezone(timezones[0])
        now = datetime.now(tz)

        return now.strftime("%I:%M %p").lstrip("0")

    except Exception:
        return None


@router.get("/get/{user_id}")
def get_creator_profile(user_id: int, request: Request):
    # Ensure database connection
    ensure_db_connection()

    try:
        user = UserData.objects.get(id=user_id)

        try:
            profile = CreatorProfile.objects.get(user=user)
        except CreatorProfile.DoesNotExist:
            profile = None

        # Get country code from profile location (country)
        country_code = get_country_code(profile.location if profile else None)
        local_time = get_local_time_from_country(profile.location if profile else None)
        verification = UserVerification.objects.filter(user=user).first()

        phone_verified = verification.phone_verified if verification else False
        email_verified = verification.email_verified if verification else False

        review_stats = Review.objects.filter(recipient=user).aggregate(
            avg_rating=Avg("rating"),
            total_reviews=Count("id")
        )

        avg_rating = round(review_stats["avg_rating"] or 0, 1)
        total_reviews = review_stats["total_reviews"] or 0

        # ✅ UPDATED: Handle profile picture with S3 or local support
        profile_picture_url = None
        if user.profile_picture:
            stored_path = str(user.profile_picture)
            
            # Check if it's already a URL
            if stored_path.startswith(('http://', 'https://')):
                profile_picture_url = stored_path
            else:
                # Get the key (remove leading slash)
                s3_key = stored_path.lstrip('/')
                
                # Check if we should use S3
                use_s3 = os.getenv("USE_S3", "False").lower() == "true"
                
                if use_s3:
                    # Try S3 presigned URL
                    profile_picture_url = get_profile_pic_url(s3_key)
                
                # Fallback to local media path if S3 fails or not using S3
                if not profile_picture_url:
                    base_url = str(request.base_url).rstrip('/')
                    pic_path = stored_path.lstrip('/')
                    profile_picture_url = f"{base_url}/media/{pic_path}"

        return {
            "user_id": user_id,
            "email": user.email,
            "full_name": user.full_name or "",
            "profile_picture": profile_picture_url,
            "state": profile.state if profile else "",
            "country_code": country_code,
            "local_time": local_time,
            "country": profile.location if profile else "",
            "about": profile.about if profile else "",
            "creator_type": profile.creator_type if profile else "",
            "primary_niche": profile.primary_niche if profile else "",
            "experience_level": profile.experience_level if profile else "",
            "joined_date": profile.created_at.strftime("%B %d, %Y") if profile and profile.created_at else "Joined December 5, 2020",
            "skills_required": profile.skills_required if profile else [],
            "phone_verified": phone_verified,
            "phone_number": user.phone_number or "",
            "email_verified": email_verified,
            "rating": avg_rating,
            "reviews_count": total_reviews,
        }
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")


@router.put("/edit/{user_id}")
async def edit_creator_profile(
    user_id: int,
    full_name: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    about: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    profile_picture: Optional[UploadFile] = File(None),
):
    # Ensure database connection
    ensure_db_connection()
    
    # ---------------- FETCH USER ----------------
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    # ---------------- UPDATE FULL NAME ----------------
    if full_name is not None:
        user.full_name = full_name.strip()

    # ---------------- UPDATE PHONE NUMBER ----------------
    if phone_number is not None:
        user.phone_number = phone_number

    # ---------------- UPDATE EMAIL (with validation) ----------------
    if email is not None and email.strip():
        email_clean = email.strip().lower()
        
        # Check if email already exists for another user
        email_exists = await sync_to_async(
            lambda: UserData.objects.filter(email=email_clean).exclude(id=user_id).exists()
        )()
        
        if email_exists:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email_clean):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        user.email = email_clean

    # ---------------- PROFILE PICTURE ----------------
    if profile_picture:
        # Check if we should use S3 or local storage
        use_s3 = os.getenv("USE_S3", "False").lower() == "true"
        
        # Delete old image
        if user.profile_picture:
            old_picture_name = str(user.profile_picture)
            if old_picture_name and not old_picture_name.startswith(('http://', 'https://')):
                try:
                    if use_s3:
                        from fastapi_app.routes.storage import delete_file
                        s3_key = old_picture_name.lstrip('/')
                        delete_file(s3_key)
                        # print(f"✅ Deleted old profile picture from S3: {s3_key}")
                    else:
                        # Delete local file
                        from pathlib import Path
                        local_path = Path(f"fastapi_app/local_storage/{old_picture_name}")
                        if local_path.exists():
                            local_path.unlink()
                            # print(f"✅ Deleted old profile picture from local: {old_picture_name}")
                except Exception as e:
                    pass
                    # print(f"Warning: Could not delete old profile picture: {e}")

        # Save new profile picture
        if use_s3:
            # Use S3 storage
            try:
                from fastapi_app.routes.storage import save_profile_pic
                s3_key = await save_profile_pic(profile_picture, str(user_id))
                user.profile_picture = s3_key
                # print(f"✅ Profile picture saved to S3: {s3_key}")
            except Exception as e:
                # print(f"❌ Error saving profile picture to S3: {e}")
                # Fallback to local storage if S3 fails
                ext = PathLib(profile_picture.filename).suffix
                filename = f"creator_{user_id}_{generate_random_digits()}{ext}"
                content = await profile_picture.read()
                await sync_to_async(user.profile_picture.save)(
                    filename,
                    ContentFile(content),
                    save=False
                )
                # print(f"✅ Profile picture saved locally (fallback): {filename}")
        else:
            # Use local storage
            ext = PathLib(profile_picture.filename).suffix
            filename = f"creator_{user_id}_{generate_random_digits()}{ext}"
            content = await profile_picture.read()
            await sync_to_async(user.profile_picture.save)(
                filename,
                ContentFile(content),
                save=False
            )
            # print(f"✅ Profile picture saved locally: {filename}")

    # ---------------- SAVE USER ----------------
    await sync_to_async(user.save)()
    
    # ---------------- GET OR CREATE CREATOR PROFILE ----------------
    profile = await sync_to_async(
        lambda: CreatorProfile.objects.filter(user=user).first()
    )()
    
    if not profile:
        # Create profile if it doesn't exist
        profile = await sync_to_async(CreatorProfile.objects.create)(
            user=user,
            creator_name=user.full_name or "",
            creator_type="",
            experience_level="",
            primary_niche="",
            portfolio_category="",
            collaboration_type="",
            project_type=""
        )
    
    # ---------------- UPDATE PROFILE FIELDS ----------------
    if about is not None:
        profile.about = about
    
    if state is not None:
        profile.state = state
    
    if country is not None:
        profile.location = country
    
    await sync_to_async(profile.save)()
    
    # ---------------- CREATE NOTIFICATION ----------------
    await sync_to_async(create_notification)(
        user=user,
        notification_type="profile_updated",
        title="Profile Updated",
        message="Your creator profile has been updated successfully.",
        url="/creator-edit-profile"
    )

    # ---------------- RESPONSE ----------------
    return {
        "status": "success",
        "message": "Profile updated successfully"
    }

# ------------------------------------------------
# List All Creators
# ------------------------------------------------
@router.get("/list")
def list_creators(request: Request):
    # Ensure database connection
    ensure_db_connection()
    
    profiles = CreatorProfile.objects.all()

    result = []
    for p in profiles:
        # Build profile picture URL with S3 support
        profile_picture_url = None
        if p.user and p.user.profile_picture:
            profile_picture_url = build_full_url(request, p.user.profile_picture.name)
        
        result.append({
            "user_id": p.user.id,
            "email": p.user.email,
            "name": p.user.full_name,
            "creator_type": p.creator_type,
            "primary_niche": p.primary_niche,
            "location": p.location,
            "followers": p.followers,
            "profile_picture": profile_picture_url,  # ✅ Added S3 support
        })
    
    return result


# ------------------------------------------------
# Delete Creator Profile by USER ID
# ------------------------------------------------
@router.delete("/delete/{user_id}")
def delete_creator_profile(user_id: int):
    # Ensure database connection
    ensure_db_connection()
    
    try:
        user = UserData.objects.get(id=user_id)
        CreatorProfile.objects.get(user=user).delete()
    except (UserData.DoesNotExist, CreatorProfile.DoesNotExist):
        raise HTTPException(status_code=404, detail="Creator profile not found")

    return {"message": "Creator profile deleted"}



# ------------------------------------------------
# BEST MATCH COLLABORATORS (For Creator Dashboard)
# ------------------------------------------------
# ------------------------------------------------
# BEST MATCH COLLABORATORS (For Creator Dashboard)
# ------------------------------------------------
# fastapi_app/routes/creator.py - Update get_best_match_collaborators

@router.get("/collaborators/best-match/{user_id}")
def get_best_match_collaborators(user_id: int, request: Request):
    """Get best match collaborators with scoring"""
    ensure_db_connection()

    try:
        user = UserData.objects.get(id=user_id)

        active_jobs = JobPost.objects.filter(employer=user, status="posted")

        needed_skills = set()

        # Collect required skills from active jobs
        for job in active_jobs:
            if job.skills:
                if isinstance(job.skills, list):
                    for skill in job.skills:
                        needed_skills.add(skill.lower().strip())
                elif isinstance(job.skills, str):
                    try:
                        import json
                        skills_list = json.loads(job.skills)
                        for skill in skills_list:
                            needed_skills.add(skill.lower().strip())
                    except:
                        for skill in job.skills.split(','):
                            needed_skills.add(skill.lower().strip())

            if job.title:
                needed_skills.add(job.title.lower().strip())

        if not needed_skills:
            return []

        all_collaborators = CollaboratorProfile.objects.select_related("user").all()

        scored_results = []
        user_ids = []
        user_pic_map = {}

        for collab in all_collaborators:
            score = 0

            # Parse skills properly
            collab_skills = set()
            if collab.skills:
                if isinstance(collab.skills, list):
                    collab_skills = set([s.lower().strip() for s in collab.skills])
                elif isinstance(collab.skills, str):
                    try:
                        import json
                        skills_list = json.loads(collab.skills)
                        collab_skills = set([s.lower().strip() for s in skills_list])
                    except:
                        collab_skills = set([s.lower().strip() for s in collab.skills.split(',') if s.strip()])

            collab_category = (collab.skill_category or "").lower()

            # Skill Matching
            for req in needed_skills:
                if req in collab_skills:
                    score += 20
                elif any(req in skill or skill in req for skill in collab_skills):
                    score += 10
                elif req in collab_category:
                    score += 5

            # Experience Boost
            if collab.experience:
                exp_lower = collab.experience.lower()
                if "expert" in exp_lower or "senior" in exp_lower or "experienced" in exp_lower:
                    score += 10
                elif "medium" in exp_lower or "intermediate" in exp_lower:
                    score += 5
                elif "beginner" in exp_lower:
                    score += 2

            # Followers Boost
            if collab.followers:
                if collab.followers > 10000:
                    score += 10
                elif collab.followers > 1000:
                    score += 5
                elif collab.followers > 100:
                    score += 2

            review_rating = getattr(collab, 'rating', 0)
            skill_rating = float(collab.skills_rating) if collab.skills_rating is not None else 0

            if score > 0:
                # ========== PRICING FORMATTING ==========
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
                        pricing_type_display = 'hourly'
                else:
                    hourly_rate = 20
                    formatted_rate = "₹20.00/hr"
                    pricing_type_display = "hourly"

                # Get the correct name
                collaborator_name = "Collaborator"
                if collab.user:
                    if collab.user.full_name:
                        collaborator_name = collab.user.full_name
                    elif collab.user.name:
                        collaborator_name = collab.user.name
                    else:
                        collaborator_name = collab.user.email.split('@')[0] if collab.user.email else "Collaborator"

                # Track user ID for batch profile picture fetching
                if collab.user and collab.user.id:
                    user_ids.append(collab.user.id)

                scored_results.append({
                    "user_id": collab.user.id if collab.user else None,
                    "id": collab.user.id if collab.user else None,
                    "name": collaborator_name,
                    "full_name": collaborator_name,
                    "skill_category": collab.skill_category,
                    "skills": collab.skills,
                    "job_title": collab.skill_category or "Professional",
                    "match_score": score,
                    "pricing_amount": collab.pricing_amount,
                    "pricing_type": pricing_type_display,
                    "pricing_unit": collab.pricing_unit,
                    "formatted_rate": formatted_rate,
                    "hourly_rate": hourly_rate,
                    "location": collab.location,
                    "experience": collab.experience,
                    "followers": collab.followers,
                    "about": collab.about or "No description available.",
                    "portfolio_link": collab.portfolio_link,
                    "country_code": get_country_code(collab.location),
                    "rating": review_rating,
                    "ratingValue": review_rating,
                    "skill_rating": skill_rating,
                    "skills_rating": skill_rating,
                    "reviews_count": getattr(collab, 'reviews_count', 0),
                    "reviewsCount": getattr(collab, 'reviews_count', 0),
                    "total_earnings": getattr(collab, 'total_earnings', 0),
                    "is_online": getattr(collab, 'is_online', True),
                    "badge": getattr(collab, 'badge', None),
                })

        # ========== BATCH FETCH PROFILE PICTURES ==========
        if user_ids:
            try:
                from fastapi_app.routes.storage import generate_presigned_urls_batch, ExpiryPreset
                
                # Get all users with profile pictures
                users_with_pics = UserData.objects.filter(
                    id__in=user_ids
                ).exclude(profile_picture__isnull=True).exclude(profile_picture='')
                
                # Collect S3 keys
                s3_keys = []
                for u in users_with_pics:
                    if u.profile_picture:
                        s3_key = str(u.profile_picture).lstrip('/')
                        s3_keys.append(s3_key)
                
                # Generate all URLs in batch
                if s3_keys:
                    url_map = generate_presigned_urls_batch(s3_keys, expires_in=ExpiryPreset.DAILY)
                    
                    # Map back to user IDs
                    user_pic_map = {}
                    for u in users_with_pics:
                        if u.profile_picture:
                            s3_key = str(u.profile_picture).lstrip('/')
                            user_pic_map[u.id] = url_map.get(s3_key)
                    
                    # Update results with profile pictures
                    for result in scored_results:
                        if result['id'] in user_pic_map:
                            result['profile_picture'] = user_pic_map[result['id']]
            except Exception as e:
                pass
                # print(f"❌ Batch profile picture error: {e}")

        # Sort by score descending
        scored_results.sort(key=lambda x: x["match_score"], reverse=True)

        return scored_results

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        # print(f"Error in get_best_match_collaborators: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

 


@router.get("/review-stats/{user_id}")
async def get_review_stats(user_id: int):
    ensure_db_connection()   # ← already present, good
    
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    stats = await sync_to_async(
        lambda: Review.objects.filter(recipient=user_id).aggregate(
            avg_rating=Avg("rating"),
            total_reviews=Count("id")
        )
    )()

    avg_rating = round(stats["avg_rating"] or 0, 1)
    total_reviews = stats["total_reviews"] or 0

    return {
        "avg_rating": avg_rating,
        "total_reviews": total_reviews
    }


@router.get("/review-latest/{user_id}")
async def get_latest_reviews(user_id: int, request: Request):
    # Ensure database connection
    ensure_db_connection()
    
    try:
        recipient = await sync_to_async(UserData.objects.get)(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    # Get latest 3 reviews instead of 2
    reviews = await sync_to_async(list)(
        Review.objects.filter(recipient=recipient)
        .select_related("reviewer")
        .order_by("-created_at")[:3]  # Changed to 3
    )

    results = []
    for r in reviews:
        reviewer = r.reviewer
        
        # Get collaborator profile if exists
        collaborator_profile = await sync_to_async(
            lambda: CollaboratorProfile.objects.filter(user=reviewer).first()
        )()
        
        # Get creator profile if exists (for role)
        creator_profile = await sync_to_async(
            lambda: CreatorProfile.objects.filter(user=reviewer).first()
        )()
        
        role = ""
        if collaborator_profile and collaborator_profile.skill_category:
            role = collaborator_profile.skill_category
        elif creator_profile and creator_profile.creator_type:
            role = creator_profile.creator_type
        
        # Handle profile picture
        profile_pic_url = None
        if reviewer.profile_picture:
            profile_pic_url = build_full_url(request, reviewer.profile_picture.name)
        
        results.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment or "",
            "reviewer_name": (
                reviewer.full_name.strip() if reviewer.full_name else reviewer.email.split('@')[0]
            ),
            "reviewer_role": role,
            "reviewer_profile_picture": profile_pic_url,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })

    # Return as array directly (not wrapped in {"reviews": results})
    return results

@router.get("/profile-completion/{user_id}")
async def get_creator_profile_completion(user_id: int) -> Dict[str, Any]:

    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        profile = await sync_to_async(CreatorProfile.objects.get)(user=user)
    except CreatorProfile.DoesNotExist:
        profile = None

    # portfolio items
    portfolio_items = await sync_to_async(list)(
        PortfolioItem.objects.filter(user=user, role="creator")
    )

    completed = 0
    total = 10
    missing_fields = []

    # 1 profile picture
    if user.profile_picture:
        completed += 1
    else:
        missing_fields.append("profile_picture")

    ## 2 full name
    if user.full_name:
      completed += 2   # replaces first + last
    else:
        missing_fields.append("full_name")
    
    
    
    
    # 4 bio/about
    if profile and profile.about:
        completed += 1
    else:
        missing_fields.append("about")

    # 5 primary niche
    if profile and profile.primary_niche:
        completed += 1
    else:
        missing_fields.append("primary_niche")

    # 6 location
    if profile and profile.location:
        completed += 1
    else:
        missing_fields.append("location")

    # 7 title
    if profile and profile.creator_name:
        completed += 1
    else:
        missing_fields.append("title")

    # 8 phone verification
    if getattr(user, "phone_verified", False):
        completed += 1
    else:
        missing_fields.append("phone_verification")

    # 9 email verification
    if getattr(user, "email_verified", False):
        completed += 1
    else:
        missing_fields.append("email_verification")

    # 10 portfolio
    if len(portfolio_items) > 0:
        completed += 1
    else:
        missing_fields.append("portfolio")

    completion_percentage = round((completed / total) * 100)

    return {
        "user_id": user_id,
        "completion": completion_percentage,
        "completed_fields": completed,
        "total_fields": total,
        "missing_fields": missing_fields
    }

class SkillsUpdateRequest(BaseModel):
    skills_required: List[str]

@router.put("/update-skills/{user_id}")
async def update_creator_skills(
    user_id: int,
    request: SkillsUpdateRequest
):
    """
    Update creator's required skills
    """

    ensure_db_connection()

    try:
        # GET USER
        user = await sync_to_async(UserData.objects.get)(
            id=user_id
        )

        # print(f"✅ User found: {user.email}")

        # GET OR CREATE PROFILE
        try:
            profile = await sync_to_async(
                CreatorProfile.objects.get
            )(user=user)

            # print("✅ Existing creator profile found")

        except CreatorProfile.DoesNotExist:

            profile = await sync_to_async(
                CreatorProfile.objects.create
            )(
                user=user,
                creator_name=user.full_name or "",
                creator_type="",
                experience_level="",
                primary_niche="",
                portfolio_category="",
                collaboration_type="",
                project_type="",
                skills_required=request.skills_required
            )

            # print("✅ New creator profile created")

            # CREATE NOTIFICATION
            try:
                await sync_to_async(create_notification)(
                    user=user,
                    notification_type="skills",
                    title="Skills Updated",
                    message="Your skills have been updated successfully.",
                    url="/creator-edit-profile"
                )

                # print(
                #     f"✅ Skills notification created for {user.email}"
                # )

            except Exception as notification_error:
                pass

                # print(
                #     f"❌ Skills notification error: {notification_error}"
                # )

            return {
                "status": "success",
                "message": "Skills updated successfully",
                "skills": request.skills_required
            }

        # UPDATE SKILLS
        profile.skills_required = request.skills_required

        await sync_to_async(profile.save)()

        # print(f"✅ Skills updated for {user.email}")

        # CREATE NOTIFICATION
        try:
            await sync_to_async(create_notification)(
                user=user,
                notification_type="skills",
                title="Skills Updated",
                message="Your skills have been updated successfully.",
                url="/creator-edit-profile"
            )

            # print(
            #     f"✅ Skills notification created for {user.email}"
            # )

        except Exception as notification_error:
            pass

            # print(
            #     f"❌ Skills notification error: {notification_error}"
            # )

        return {
            "status": "success",
            "message": "Skills updated successfully",
            "skills": request.skills_required
        }

    except UserData.DoesNotExist:

        # print(f"❌ User not found: {user_id}")

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    except Exception as e:

        # print(f"❌ UPDATE SKILLS ERROR: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.get("/reviews/{user_id}")
async def get_all_reviews(user_id: int, request: Request):
    """Get all reviews for a user (for View All popup)"""
    ensure_db_connection()
    
    try:
        recipient = await sync_to_async(UserData.objects.get)(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    reviews = await sync_to_async(list)(
        Review.objects.filter(recipient=recipient)
        .select_related("reviewer")
        .order_by("-created_at")
    )

    results = []
    for r in reviews:
        reviewer = r.reviewer
        
        collaborator_profile = await sync_to_async(
            lambda: CollaboratorProfile.objects.filter(user=reviewer).first()
        )()
        
        creator_profile = await sync_to_async(
            lambda: CreatorProfile.objects.filter(user=reviewer).first()
        )()
        
        role = ""
        if collaborator_profile and collaborator_profile.skill_category:
            role = collaborator_profile.skill_category
        elif creator_profile and creator_profile.creator_type:
            role = creator_profile.creator_type
        
        profile_pic_url = None
        if reviewer.profile_picture:
            profile_pic_url = build_full_url(request, reviewer.profile_picture.name)
        
        results.append({
            "id": r.id,
            "rating": r.rating,
            "comment": r.comment or "",
            "reviewer_name": (
                reviewer.full_name.strip() if reviewer.full_name else reviewer.email.split('@')[0]
            ),
            "reviewer_role": role,
            "reviewer_profile_picture": profile_pic_url,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })

    return results

@router.post("/batch-profile-pictures")
def batch_get_profile_pictures(
    user_ids: List[int],
    request: Request
):
    """
    Get profile pictures for multiple users in a single request.
    This significantly reduces loading time by batching S3 URL generation.
    """
    ensure_db_connection()
    
    if not user_ids:
        return {"profiles": {}}
    
    use_s3 = os.getenv("USE_S3", "False").lower() == "true"
    base_url = str(request.base_url).rstrip('/')
    
    # Fetch all users in one query
    users = UserData.objects.filter(id__in=user_ids).only('id', 'profile_picture')
    
    result = {}
    s3_keys_to_generate = []
    user_pic_map = {}
    
    for user in users:
        if user and user.profile_picture:
            pic_path = str(user.profile_picture).lstrip("/")
            user_pic_map[user.id] = pic_path
            if use_s3:
                s3_keys_to_generate.append(pic_path)
        else:
            result[user.id] = None
    
    # Generate all S3 URLs in batch
    if use_s3 and s3_keys_to_generate:
        try:
            from fastapi_app.routes.storage import generate_presigned_urls_batch
            from fastapi_app.routes.storage import ExpiryPreset
            
            # Get all URLs in one batch operation
            url_map = generate_presigned_urls_batch(
                s3_keys_to_generate,
                expires_in=ExpiryPreset.DAILY
            )
            
            # Map URLs back to user IDs
            for user_id, pic_path in user_pic_map.items():
                result[user_id] = url_map.get(pic_path)
        except Exception as e:
            # print(f"❌ Error generating batch URLs: {e}")
            # Fallback to local URLs
            for user_id, pic_path in user_pic_map.items():
                result[user_id] = f"{base_url}/media/{pic_path}"
    else:
        # Local storage
        for user_id, pic_path in user_pic_map.items():
            result[user_id] = f"{base_url}/media/{pic_path}"
    
    return {"profiles": result}