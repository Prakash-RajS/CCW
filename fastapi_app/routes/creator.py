import time
from creator_backend import settings
import fastapi_app.django_setup

from typing import Optional, List
from django.db.models import Q
from fastapi import APIRouter, File, Form, HTTPException, Path, Query, UploadFile

from creator_app.models import UserData, CreatorProfile
from creator_app.models import UserData, CollaboratorProfile,JobPost, PortfolioItem
from pathlib import Path as PathLib
from asgiref.sync import sync_to_async
import random
import string
from django.core.files.base import ContentFile

router = APIRouter(prefix="/creator", tags=["Creator"])

FASTAPI_BASE_DIR = PathLib(__file__).resolve().parent.parent


def generate_random_digits(length=4):
    """Generate random digits for filename"""
    return ''.join(random.choices(string.digits, k=length))


# ------------------------------------------------
# FILTER CREATORS  (ADDED — NOTHING REMOVED)
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
    profiles = CreatorProfile.objects.all()

    # Text search
    if search:
        profiles = profiles.filter(
            Q(creator_name__icontains=search) |
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
            "creator_name": p.creator_name,
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
    portfolio_uploads: Optional[UploadFile] = File(None),
    profile_picture: Optional[UploadFile] = File(None),
):
    try:
        user = await sync_to_async(UserData.objects.get)(id=user_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    # ---------------- Profile Picture ----------------
    if profile_picture:
        ext = PathLib(profile_picture.filename).suffix
        filename = f"creator_{user_id}_{generate_random_digits()}{ext}"
        content = await profile_picture.read()
        await sync_to_async(user.profile_picture.save)(
            filename,
            ContentFile(content),
            save=True
        )

    # ---------------- Save / Update Creator Profile ----------------
    defaults = {
        "creator_name": creator_name,
        "creator_type": creator_type,
        "experience_level": experience_level,
        "primary_niche": primary_niche,
        "secondary_niche": secondary_niche,
        "platforms": platforms,
        "followers": followers,
        "about":about,
        "portfolio_category": portfolio_category,
        "collaboration_type": collaboration_type,
        "project_type": project_type,
        "location": location,
    }

    profile, _ = await sync_to_async(
        lambda: CreatorProfile.objects.update_or_create(
            user=user,
            defaults=defaults
        )
    )()

    # ---------------- SAVE PORTFOLIO INTO PortfolioItem ----------------
    if portfolio_uploads:
        # 🔹 keep your filename logic
        ext = PathLib(portfolio_uploads.filename).suffix
        filename = f"{user_id}_{generate_random_digits()}{ext}"
    
        content = await portfolio_uploads.read()
    
        await sync_to_async(PortfolioItem.objects.create)(
            user=user,
            role="creator",                 # decides folder
            title=portfolio_category or "Portfolio",
            file=ContentFile(content, name=filename),
        )

    # ---------------- Update user role ----------------
    user.role = "creator"
    await sync_to_async(user.save)()

    return {
        "message": "Creator profile saved successfully"
    }


# ------------------------------------------------
# Get Creator Profile by USER ID
# ------------------------------------------------
@router.get("/get/{user_id}")
def get_creator_profile(user_id: int):
    try:
        user = UserData.objects.get(id=user_id)
        profile = CreatorProfile.objects.get(user=user)
    except (UserData.DoesNotExist, CreatorProfile.DoesNotExist):
        raise HTTPException(status_code=404, detail="Creator profile not found")

    return {
        "user_id": user_id,
        "email": user.email,
        "creator_name": profile.creator_name,
        "creator_type": profile.creator_type,
        "experience_level": profile.experience_level,
        "primary_niche": profile.primary_niche,
        "secondary_niche": profile.secondary_niche,
        "platforms": profile.platforms,
        "followers": profile.followers,
        "portfolio_category": profile.portfolio_category,
        "portfolio_link": profile.portfolio_link,
        "collaboration_type": profile.collaboration_type,
        "project_type": profile.project_type,
        "location": profile.location,
    }


# ------------------------------------------------
# List All Creators
# ------------------------------------------------
@router.get("/list")
def list_creators():
    profiles = CreatorProfile.objects.all()

    return [
        {
            "user_id": p.user.id,
            "email": p.user.email,
            "creator_name": p.creator_name,
            "creator_type": p.creator_type,
            "primary_niche": p.primary_niche,
            "location": p.location,
            "followers": p.followers,
        }
        for p in profiles
    ]


# ------------------------------------------------
# Delete Creator Profile by USER ID
# ------------------------------------------------
@router.delete("/delete/{user_id}")
def delete_creator_profile(user_id: int):
    try:
        user = UserData.objects.get(id=user_id)
        CreatorProfile.objects.get(user=user).delete()
    except (UserData.DoesNotExist, CreatorProfile.DoesNotExist):
        raise HTTPException(status_code=404, detail="Creator profile not found")

    return {"message": "Creator profile deleted"}


# ------------------------------------------------
# Edit Creator Profile (USER ID VERSION)
# ------------------------------------------------
@router.put("/edit/{user_id}")
def edit_creator_profile(
    user_id: int,
    creator_name: str | None = None,
    creator_type: str | None = None,
    experience_level: str | None = None,
    primary_niche: str | None = None,
    secondary_niche: str | None = None,
    platforms: str | None = None,
    followers: int | None = None,
    portfolio_category: str | None = None,
    portfolio_link: str | None = None,
    collaboration_type: str | None = None,
    project_type: str | None = None,
    location: str | None = None,
):
    try:
        user = UserData.objects.get(id=user_id)
        profile = CreatorProfile.objects.get(user=user)
    except (UserData.DoesNotExist, CreatorProfile.DoesNotExist):
        raise HTTPException(status_code=404, detail="Creator profile not found")

    if creator_name is not None: profile.creator_name = creator_name
    if creator_type is not None: profile.creator_type = creator_type
    if experience_level is not None: profile.experience_level = experience_level
    if primary_niche is not None: profile.primary_niche = primary_niche
    if secondary_niche is not None: profile.secondary_niche = secondary_niche
    if platforms is not None: profile.platforms = platforms
    if followers is not None: profile.followers = followers
    if portfolio_category is not None: profile.portfolio_category = portfolio_category
    if portfolio_link is not None: profile.portfolio_link = portfolio_link
    if collaboration_type is not None: profile.collaboration_type = collaboration_type
    if project_type is not None: profile.project_type = project_type
    if location is not None: profile.location = location

    profile.save()

    return {"message": "Creator profile updated successfully"}





# ------------------------------------------------
# BEST MATCH COLLABORATORS (For Creator Dashboard)
# ------------------------------------------------
@router.get("/collaborators/best-match/{user_id}")
def get_best_match_collaborators(user_id: int):
    """
    Finds collaborators that match the skills required in the Creator's active Job Posts.
    Ranked from Highest Match to Lowest Match.
    """
    try:
        user = UserData.objects.get(id=user_id)
 
        # 1. Collect Skills from Creator's Active Job Posts
        # We look at what the creator is hiring for RIGHT NOW.
        active_jobs = JobPost.objects.filter(employer=user, status="posted")
       
        needed_skills = set() # Use a set to avoid duplicates
       
        for job in active_jobs:
            # Add skills from the JSON list (e.g. ["Python", "React"])
            if job.skills:
                for skill in job.skills:
                    needed_skills.add(skill.lower())
           
            # Also add the Job Title keywords (e.g. "UI/UX Designer")
            if job.title:
                needed_skills.add(job.title.lower())
 
        # If creator has no jobs, return empty or all collaborators (Decision: Empty for relevance)
        if not needed_skills:
            return []
 
        # 2. Score Collaborators against these Skills
        all_collaborators = CollaboratorProfile.objects.all()
        scored_results = []
 
        for collab in all_collaborators:
            score = 0
            # Get collaborator's main skill category (e.g. "Frontend Developer")
            collab_skill = (collab.skill_category or "").lower()
           
            # --- SCORING LOGIC ---
            # Check if their category matches any of our needed skills
            for req_skill in needed_skills:
                if req_skill in collab_skill:
                    score += 10 # Direct match
                elif collab_skill in req_skill:
                    score += 5  # Partial match
           
            # Only include if there is at least some match
            if score > 0:
                scored_results.append({
                    "collaborator": collab,
                    "score": score
                })
 
        # 3. Sort by Score (Highest first)
        scored_results.sort(key=lambda x: x["score"], reverse=True)
 
        # 4. Format the Output
        return [
            {
                "user_id": item["collaborator"].user.id,
                "name": item["collaborator"].name,
                "skill_category": item["collaborator"].skill_category,
                "match_score": f"{item['score']} points", # For debugging/UI
                "pricing": f"{item['collaborator'].pricing_amount} {item['collaborator'].pricing_unit}",
                "location": item["collaborator"].location,
                "experience": item["collaborator"].experience,
                "social_link": item["collaborator"].social_link,
                "portfolio_link": item["collaborator"].portfolio_link
            }
            for item in scored_results
        ]
 
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

