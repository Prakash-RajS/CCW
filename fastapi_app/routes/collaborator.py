# import fastapi_app.django_setup

# from typing import Optional
# from django.db.models import Q
# from fastapi import APIRouter, HTTPException, Query

# from creator_app.models import UserData, CollaboratorProfile

# router = APIRouter(prefix="/collaborator", tags=["Collaborator"])
# from creator_app.models import UserData, CollaboratorProfile, JobPost, SavedJob, RecentlyViewedJob

# from creator_app.models import Contract, Review


# # ------------------------------------------------
# # FILTER COLLABORATORS  (ADDED — NOTHING REMOVED)
# # ------------------------------------------------
# @router.get("/search")
# def search_collaborators(
#     search: Optional[str] = None,
#     skill_category: Optional[str] = None,
#     location: Optional[str] = None,
#     min_price: Optional[float] = None,
#     max_price: Optional[float] = None,
#     experience: Optional[str] = None,
#     language: Optional[str] = None,
#     availability: Optional[str] = None
# ):
#     profiles = CollaboratorProfile.objects.all()

#     if search:
#         profiles = profiles.filter(
#             Q(name__icontains=search) |
#             Q(skill_category__icontains=search)
#         )

#     if skill_category:
#         profiles = profiles.filter(skill_category__iexact=skill_category)

#     if location:
#         profiles = profiles.filter(location__icontains=location)

#     if min_price is not None:
#         profiles = profiles.filter(pricing_amount__gte=min_price)

#     if max_price is not None:
#         profiles = profiles.filter(pricing_amount__lte=max_price)

#     if experience:
#         profiles = profiles.filter(experience__iexact=experience)

#     if language:
#         profiles = profiles.filter(language__icontains=language)

#     if availability:
#         profiles = profiles.filter(availability__iexact=availability)

#     return [
#         {
#             "id": p.id,
#             "email": p.user.email,
#             "name": p.name,
#             "skill_category": p.skill_category,
#             "pricing": f"{p.pricing_amount} {p.pricing_unit}",
#             "location": p.location,
#             "experience": p.experience,
#             "language": p.language,
#             "availability": p.availability,
#             "social_link": p.social_link,
#             "portfolio_link": p.portfolio_link,
#         }
#         for p in profiles
#     ]


# # ------------------------------------------------
# # Create / Update Collaborator Profile (USER ID VERSION)
# # ------------------------------------------------
# @router.post("/save/{user_id}")
# def save_collaborator_profile(
#     user_id: int,
#     name: str,
#     language: str,
#     skill_category: str,
#     experience: str,
#     pricing_amount: float | None = None,
#     pricing_unit: str | None = None,
#     availability: str | None = None,
#     timing: str | None = None,
#     social_link: str | None = None,
#     portfolio_link: str | None = None,
#     badges: str | None = None,
#     skills_rating: int | None = None,
#     about: str | None = None,
#     location: str | None = None,
# ):
#     try:
#         user = UserData.objects.get(id=user_id)
#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="User not found")

#     profile, created = CollaboratorProfile.objects.update_or_create(
#         user=user,
#         defaults={
#             "name": name,
#             "language": language,
#             "skill_category": skill_category,
#             "experience": experience,
#             "pricing_amount": pricing_amount,
#             "pricing_unit": pricing_unit,
#             "availability": availability,
#             "timing": timing,
#             "social_link": social_link,
#             "portfolio_link": portfolio_link,
#             "badges": badges,
#             "skills_rating": skills_rating,
#             "about": about,
#             "location": location,
#         },
#     )

#     user.role = "collaborator"
#     user.save()

#     return {"message": "Collaborator profile saved", "created": created}


# # ------------------------------------------------
# # Get Collaborator Profile by USER ID
# # ------------------------------------------------
# @router.get("/get/{user_id}")
# def get_collaborator_profile(user_id: int):
#     try:
#         user = UserData.objects.get(id=user_id)
#         profile = CollaboratorProfile.objects.get(user=user)
#     except (UserData.DoesNotExist, CollaboratorProfile.DoesNotExist):
#         raise HTTPException(status_code=404, detail="Profile not found")

#     return {
#         "user_id": user_id,
#         "email": user.email,
#         "name": profile.name,
#         "language": profile.language,
#         "skill_category": profile.skill_category,
#         "experience": profile.experience,
#         "pricing_amount": profile.pricing_amount,
#         "pricing_unit": profile.pricing_unit,
#         "availability": profile.availability,
#         "timing": profile.timing,
#         "social_link": profile.social_link,
#         "portfolio_link": profile.portfolio_link,
#         "badges": profile.badges,
#         "skills_rating": profile.skills_rating,
#         "about": profile.about,
#         "location": profile.location,
#     }


# # ------------------------------------------------
# # List All Collaborators
# # ------------------------------------------------
# @router.get("/list")
# def list_collaborators():
#     profiles = CollaboratorProfile.objects.all()
#     return [
#         {
#             "user_id": p.user.id,
#             "email": p.user.email,
#             "name": p.name,
#             "skill_category": p.skill_category,
#             "location": p.location,
#         }
#         for p in profiles
#     ]


# # ------------------------------------------------
# # Delete Collaborator Profile by USER ID
# # ------------------------------------------------
# @router.delete("/delete/{user_id}")
# def delete_collaborator_profile(user_id: int):
#     try:
#         user = UserData.objects.get(id=user_id)
#         CollaboratorProfile.objects.get(user=user).delete()
#     except (UserData.DoesNotExist, CollaboratorProfile.DoesNotExist):
#         raise HTTPException(status_code=404, detail="Profile not found")

#     return {"message": "Collaborator profile deleted"}


# # ------------------------------------------------
# # Edit Collaborator Profile (USER ID VERSION)
# # ------------------------------------------------
# @router.put("/edit/{user_id}")
# def edit_collaborator_profile(
#     user_id: int,
#     name: str | None = None,
#     language: str | None = None,
#     skill_category: str | None = None,
#     experience: str | None = None,
#     pricing_amount: float | None = None,
#     pricing_unit: str | None = None,
#     availability: str | None = None,
#     timing: str | None = None,
#     social_link: str | None = None,
#     portfolio_link: str | None = None,
#     badges: str | None = None,
#     skills_rating: int | None = None,
#     about: str | None = None,
#     location: str | None = None,
# ):
#     try:
#         user = UserData.objects.get(id=user_id)
#         profile = CollaboratorProfile.objects.get(user=user)
#     except (UserData.DoesNotExist, CollaboratorProfile.DoesNotExist):
#         raise HTTPException(status_code=404, detail="Collaborator profile not found")

#     if name is not None: profile.name = name
#     if language is not None: profile.language = language
#     if skill_category is not None: profile.skill_category = skill_category
#     if experience is not None: profile.experience = experience
#     if pricing_amount is not None: profile.pricing_amount = pricing_amount
#     if pricing_unit is not None: profile.pricing_unit = pricing_unit
#     if availability is not None: profile.availability = availability
#     if timing is not None: profile.timing = timing
#     if social_link is not None: profile.social_link = social_link
#     if portfolio_link is not None: profile.portfolio_link = portfolio_link
#     if badges is not None: profile.badges = badges
#     if skills_rating is not None: profile.skills_rating = skills_rating
#     if about is not None: profile.about = about
#     if location is not None: profile.location = location

#     profile.save()

#     return {"message": "Collaborator profile updated successfully"}



# #  1. ACTIONS: SAVE & VIEW (How to save/track jobs)
# # ==============================================================================
 
# @router.post("/jobs/toggle-save")
# def toggle_save_job(user_id: int, job_id: int):
#     """
#     Saves a job if not saved. Removes it if already saved (Toggle).
#     """
#     try:
#         user = UserData.objects.get(id=user_id)
#         job = JobPost.objects.get(id=job_id)
 
#         # Check if already saved
#         existing = SavedJob.objects.filter(user=user, job=job).first()
       
#         if existing:
#             existing.delete()
#             return {"status": "removed", "message": "Job removed from saved list"}
#         else:
#             SavedJob.objects.create(user=user, job=job)
#             return {"status": "saved", "message": "Job added to saved list"}
 
#     except (UserData.DoesNotExist, JobPost.DoesNotExist):
#         raise HTTPException(status_code=404, detail="User or Job not found")
 
# @router.post("/jobs/track-view")
# def track_job_view(user_id: int, job_id: int):
#     """
#     Call this API when a user CLICKS on a job to view details.
#     Updates the 'Recent' list.
#     """
#     try:
#         user = UserData.objects.get(id=user_id)
#         job = JobPost.objects.get(id=job_id)
       
#         # Update or Create (Updates timestamp if exists)
#         RecentlyViewedJob.objects.update_or_create(user=user, job=job)
#         return {"status": "success"}
 
#     except Exception:
#         raise HTTPException(status_code=404, detail="Error tracking view")
 
 
# # ==============================================================================
# #  2. FEEDS: BEST MATCH, RECENT, SAVED
# # ==============================================================================
 
# # fastapi_app/routes/collaborator.py

# @router.get("/jobs/best-match/{user_id}")
# def get_best_match_jobs(user_id: int):
#     """
#     Returns jobs matching the user's specific SKILLS list.
#     """
#     try:
#         # 1. Get User's Specific Skills
#         user = UserData.objects.get(id=user_id)
#         my_skills_list = []
        
#         try:
#             profile = CollaboratorProfile.objects.get(user=user)

#             # ✅ FIX: Safely get skills. If 'skills' field is missing, default to empty list [].
#             user_skills = getattr(profile, 'skills', [])
            
#             # Convert "Python, Django" string -> ["python", "django"] list
#             if profile.skills:
#                 my_skills_list = [s.strip().lower() for s in profile.skills.split(',') if s.strip()]
            
#             # Also include the category as a fallback keyword
#             if profile.skill_category:
#                 my_skills_list.append(profile.skill_category.strip().lower())
                
#         except CollaboratorProfile.DoesNotExist:
#             return [] # No profile, no matches

#         if not my_skills_list:
#             return [] # No skills listed, no matches

#         # 2. Get All Active Jobs
#         jobs = JobPost.objects.filter(status="posted").order_by('-created_at')
#         scored_jobs = []

#         for job in jobs:
#             score = 0
#             job_skills = [s.lower() for s in job.skills] if job.skills else []
#             job_title = job.title.lower()
#             job_desc = job.description.lower()

#             # --- SCORING ALGORITHM ---
#             for my_skill in my_skills_list:
#                 # High Score: Exact match in Job's skill tags
#                 if any(my_skill == js for js in job_skills):
#                     score += 10
#                 # Medium Score: Skill mentioned in Title
#                 elif my_skill in job_title:
#                     score += 5
#                 # Low Score: Skill mentioned in Description
#                 elif my_skill in job_desc:
#                     score += 2

#             # Only show if there is at least some match
#             if score > 0:
#                 scored_jobs.append({
#                     "job": job,
#                     "score": score
#                 })

#         # 3. Sort by Score (Highest matches first)
#         scored_jobs.sort(key=lambda x: x["score"], reverse=True)

#         # 4. Return Data
#         return [
#             {
#                 "id": item["job"].id,
#                 "title": item["job"].title,
#                 "description": item["job"].description,
#                 "budget": f"{item['job'].budget_from} - {item['job'].budget_to}",
#                 "match_score": f"{item['score']} points",
#                 "skills": item["job"].skills,
#                 "posted_at": item["job"].created_at.strftime("%d %b %Y")
#             }
#             for item in scored_jobs
#         ]

#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="User not found")
 
 
# @router.get("/jobs/saved/{user_id}")
# def get_saved_jobs(user_id: int):
#     """
#     Returns jobs that the user explicitly SAVED.
#     """
#     saved_entries = SavedJob.objects.filter(user_id=user_id).order_by('-saved_at')
   
#     return [
#         {
#             "id": entry.job.id,
#             "title": entry.job.title,
#             "description": entry.job.description,
#             "budget": f"{entry.job.budget_from} - {entry.job.budget_to}",
#             "saved_at": entry.saved_at.strftime("%d %b %Y"),
#             "skills": entry.job.skills
#         }
#         for entry in saved_entries
#     ]
 
 
# @router.get("/jobs/recent/{user_id}")
# def get_recent_jobs(user_id: int):
#     """
#     Returns jobs the user clicked on (History).
#     """
#     recent_entries = RecentlyViewedJob.objects.filter(user_id=user_id).order_by('-viewed_at')
   
#     return [
#         {
#             "id": entry.job.id,
#             "title": entry.job.title,
#             "description": entry.job.description,
#             "viewed_at": entry.viewed_at.strftime("%d %b %Y %H:%M"),
#             "skills": entry.job.skills
#         }
#         for entry in recent_entries
#     ]




# # ==============================================================================
# #  3. REVIEWS (Creator -> Collaborator)
# # ==============================================================================
# @router.post("/reviews/add-or-edit")
# def add_collaborator_review(
#     creator_id: int,
#     collaborator_id: int,
#     rating: int,
#     comment: str
# ):
#     """
#     Allows a Creator to review a Collaborator ONLY IF they have a 'completed' contract.
#     If a review already exists, this endpoint EDITS it.
#     """
#     try:
#         creator = UserData.objects.get(id=creator_id)
#         collaborator = UserData.objects.get(id=collaborator_id)
 
#         # 1. SECURITY CHECK: Has the work been completed?
#         # We look for ANY contract between these two that is 'completed'.
#         has_completed_work = Contract.objects.filter(
#             creator=creator,
#             collaborator=collaborator,
#             status__iexact="completed"
#         ).exists()
 
#         if not has_completed_work:
#             raise HTTPException(
#                 status_code=403,
#                 detail="You are not allowed to review this collaborator. No completed work found."
#             )
 
#         # 2. Add or Edit Review
#         # update_or_create handles the "One Time / Edit" requirement automatically.
#         review, created = Review.objects.update_or_create(
#             reviewer=creator,
#             recipient=collaborator,
#             defaults={
#                 "rating": rating,
#                 "comment": comment
#             }
#         )
       
#         # 3. (Optional) Update Collaborator's Average Rating in Profile
#         # This keeps the profile simple to query later
#         try:
#             profile = CollaboratorProfile.objects.get(user=collaborator)
#             # Calculate new average
#             all_reviews = Review.objects.filter(recipient=collaborator)
#             avg = sum(r.rating for r in all_reviews) / all_reviews.count()
#             profile.skills_rating = int(avg) # Update the existing rating column
#             profile.save()
#         except CollaboratorProfile.DoesNotExist:
#             pass
 
#         action = "Created" if created else "Edited"
#         return {
#             "status": "success",
#             "message": f"Review {action} successfully",
#             "updated_at": review.updated_at
#         }
 
#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="User not found")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
 
 
# @router.get("/reviews/list/{user_id}")
# def get_collaborator_reviews(user_id: int):
#     """
#     Get all reviews received by a specific Collaborator.
#     """
#     reviews = Review.objects.filter(recipient_id=user_id).order_by('-updated_at')
   
#     return [
#         {
#             "reviewer_name": f"{r.reviewer.first_name} {r.reviewer.last_name}",
#             "rating": r.rating,
#             "comment": r.comment,
#             "date": r.updated_at.strftime("%d %b %Y")
#         }
#         for r in reviews
#     ]


import fastapi_app.django_setup
from typing import Optional
from django.db.models import Q
from fastapi import APIRouter, HTTPException, Form
from django.conf import settings
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional

from asgiref.sync import sync_to_async
from django.db.models import Q, F, Value
from django.db.models.functions import Concat
import random
import string
from pathlib import Path as PathLib
from django.core.files.base import ContentFile

# Import your Django Models
from creator_app.models import (
    CreatorProfile,
    PortfolioItem,
    UserData, 
    CollaboratorProfile, 
    JobPost, 
    SavedJob, 
    RecentlyViewedJob, 
    Contract, 
    Review
)

router = APIRouter(prefix="/collaborator", tags=["Collaborator"])

FASTAPI_BASE_DIR = PathLib(__file__).resolve().parent.parent


def generate_random_digits(length=4):
    """Generate random digits for filename"""
    return ''.join(random.choices(string.digits, k=length))

# ==============================================================================
#  1. SEARCH & FILTER
# ==============================================================================
@router.get("/search")
def search_collaborators(
    search: Optional[str] = None,
    skill_category: Optional[str] = None,
    location: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    experience: Optional[str] = None,
    language: Optional[str] = None,
    availability: Optional[str] = None
):
    profiles = CollaboratorProfile.objects.all()

    if search:
        profiles = profiles.filter(
            Q(name__icontains=search) |
            Q(skill_category__icontains=search) |
            Q(skills__icontains=search) # Also search inside the JSON list
        )

    if skill_category:
        profiles = profiles.filter(skill_category__iexact=skill_category)

    if location:
        profiles = profiles.filter(location__icontains=location)

    if min_price is not None:
        profiles = profiles.filter(pricing_amount__gte=min_price)

    if max_price is not None:
        profiles = profiles.filter(pricing_amount__lte=max_price)

    if experience:
        profiles = profiles.filter(experience__iexact=experience)

    if language:
        profiles = profiles.filter(language__icontains=language)

    if availability:
        profiles = profiles.filter(availability__iexact=availability)

    return [
        {
            "id": p.id,
            "email": p.user.email,
            "name": p.name,
            "skill_category": p.skill_category,
            "skills": p.skills,  # Return the list of skills
            "pricing": f"{p.pricing_amount} {p.pricing_unit}",
            "location": p.location,
            "experience": p.experience,
            "language": p.language,
            "availability": p.availability,
            "social_link": p.social_link,
            "portfolio_link": p.portfolio_link,
            "rating": p.skills_rating
        }
        for p in profiles
    ]


# ==============================================================================
#  2. PROFILE MANAGEMENT (Create, Get, Edit, Delete)
# ==============================================================================

# Create / Update Collaborator Profile
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
    social_link: Optional[str] = Form(None),
    badges: Optional[str] = Form(None),
    about: Optional[str] = Form(None),
    location: str = Form(...),
    skills_rating: Optional[int] = Form(None),
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
        filename = f"collaborator_{user_id}_{generate_random_digits()}{ext}"

        content = await profile_picture.read()

        await sync_to_async(user.profile_picture.save)(
            filename,
            ContentFile(content),
            save=True
        )

    # ---------------- Skills ----------------
    skills_list = []
    if skills:
        skills_list = [s.strip() for s in skills.split(",") if s.strip()]

    pricing_amount_decimal = None
    if pricing_amount:
        try:
            pricing_amount_decimal = float(pricing_amount)
        except ValueError:
            pass

    # ---------------- Save / Update Collaborator Profile ----------------
    defaults = {
        "name": name,
        "language": language,
        "skill_category": skill_category,
        "experience": experience,
        "skills": skills_list,
        "pricing_amount": pricing_amount_decimal,
        "pricing_unit": pricing_unit,
        "availability": availability,
        "timing": timing,
        "portfolio_category": portfolio_category,
        "social_link": social_link,
        "badges": badges,
        "skills_rating": skills_rating,
        "about": about,
        "location": location,
    }

    profile, _ = await sync_to_async(
        lambda: CollaboratorProfile.objects.update_or_create(
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
            role="collaborator",                 # decides folder
            title=portfolio_category or "Portfolio",
            file=ContentFile(content, name=filename),
        )


    # ---------------- Update Role ----------------
    user.role = "collaborator"
    await sync_to_async(user.save)()

    return {
        "message": "Collaborator profile saved successfully"
    }


@router.get("/get/{user_id}")
def get_collaborator_profile(user_id: int):
    try:
        user = UserData.objects.get(id=user_id)
        profile = CollaboratorProfile.objects.get(user=user)
    except (UserData.DoesNotExist, CollaboratorProfile.DoesNotExist):
        raise HTTPException(status_code=404, detail="Profile not found")

    return {
        "user_id": user_id,
        "email": user.email,
        "name": profile.name,
        "language": profile.language,
        "skill_category": profile.skill_category,
        "skills": profile.skills, # Returns list
        "experience": profile.experience,
        "pricing_amount": profile.pricing_amount,
        "pricing_unit": profile.pricing_unit,
        "availability": profile.availability,
        "timing": profile.timing,
        "social_link": profile.social_link,
        "portfolio_link": profile.portfolio_link,
        "badges": profile.badges,
        "skills_rating": profile.skills_rating,
        "about": profile.about,
        "location": profile.location,
    }


@router.put("/edit/{user_id}")
def edit_collaborator_profile(
    user_id: int,
    name: str | None = None,
    language: str | None = None,
    skill_category: str | None = None,
    experience: str | None = None,
    skills: str | None = None, # Input as string "A, B"
    pricing_amount: float | None = None,
    pricing_unit: str | None = None,
    availability: str | None = None,
    timing: str | None = None,
    social_link: str | None = None,
    portfolio_link: str | None = None,
    badges: str | None = None,
    about: str | None = None,
    location: str | None = None,
):
    try:
        user = UserData.objects.get(id=user_id)
        profile = CollaboratorProfile.objects.get(user=user)
    except (UserData.DoesNotExist, CollaboratorProfile.DoesNotExist):
        raise HTTPException(status_code=404, detail="Collaborator profile not found")

    if name is not None: profile.name = name
    if language is not None: profile.language = language
    if skill_category is not None: profile.skill_category = skill_category
    if experience is not None: profile.experience = experience
    
    # Handle Skills Update
    if skills is not None:
        profile.skills = [s.strip() for s in skills.split(',') if s.strip()]

    if pricing_amount is not None: profile.pricing_amount = pricing_amount
    if pricing_unit is not None: profile.pricing_unit = pricing_unit
    if availability is not None: profile.availability = availability
    if timing is not None: profile.timing = timing
    if social_link is not None: profile.social_link = social_link
    if portfolio_link is not None: profile.portfolio_link = portfolio_link
    if badges is not None: profile.badges = badges
    if about is not None: profile.about = about
    if location is not None: profile.location = location

    profile.save()

    return {"message": "Collaborator profile updated successfully", "skills": profile.skills}


@router.delete("/delete/{user_id}")
def delete_collaborator_profile(user_id: int):
    try:
        user = UserData.objects.get(id=user_id)
        CollaboratorProfile.objects.get(user=user).delete()
    except (UserData.DoesNotExist, CollaboratorProfile.DoesNotExist):
        raise HTTPException(status_code=404, detail="Profile not found")

    return {"message": "Collaborator profile deleted"}


@router.get("/list")
def list_collaborators():
    profiles = CollaboratorProfile.objects.all()
    return [
        {
            "user_id": p.user.id,
            "email": p.user.email,
            "name": p.name,
            "skill_category": p.skill_category,
            "location": p.location,
        }
        for p in profiles
    ]


# ==============================================================================
#  3. JOB ACTIONS (Save & View History)
# ==============================================================================
@router.post("/jobs/toggle-save")
def toggle_save_job(user_id: int, job_id: int):
    try:
        user = UserData.objects.get(id=user_id)
        job = JobPost.objects.get(id=job_id)

        existing = SavedJob.objects.filter(user=user, job=job).first()
        
        if existing:
            existing.delete()
            return {"status": "removed", "message": "Job removed from saved list"}
        else:
            SavedJob.objects.create(user=user, job=job)
            return {"status": "saved", "message": "Job added to saved list"}

    except (UserData.DoesNotExist, JobPost.DoesNotExist):
        raise HTTPException(status_code=404, detail="User or Job not found")


@router.post("/jobs/track-view")
def track_job_view(user_id: int, job_id: int):
    try:
        user = UserData.objects.get(id=user_id)
        job = JobPost.objects.get(id=job_id)
        
        RecentlyViewedJob.objects.update_or_create(user=user, job=job)
        return {"status": "success"}

    except Exception:
        raise HTTPException(status_code=404, detail="Error tracking view")


# ==============================================================================
#  4. FEEDS (Best Match, Saved, Recent)
# ==============================================================================
@router.get("/jobs/best-match/{user_id}")
def get_best_match_jobs(user_id: int):
    """
    Returns jobs matching the user's skills.
    """
    try:
        profile = CollaboratorProfile.objects.get(user_id=user_id)
        
        # Safely get user skills
        user_skills = getattr(profile, 'skills', [])
        
        # Handle if stored as string by mistake in older DB entries
        if isinstance(user_skills, str):
            user_skills = [s.strip().lower() for s in user_skills.split(',') if s.strip()]
        else:
            # Ensure all lower case for comparison
            user_skills = [s.lower() for s in user_skills]

        # Add category as a keyword
        if profile.skill_category:
            user_skills.append(profile.skill_category.strip().lower())
        
        if not user_skills:
            return [] # No skills, no match

        # Get all posted jobs
        jobs = JobPost.objects.filter(status__iexact="posted").order_by('-created_at')
        scored_jobs = []

        for job in jobs:
            score = 0
            # Normalize job skills
            job_skills = getattr(job, 'skills', [])
            if isinstance(job_skills, str):
                job_skills = [s.strip().lower() for s in job_skills.split(',')]
            else:
                job_skills = [s.lower() for s in job_skills]

            job_title = job.title.lower()
            job_desc = job.description.lower()

            for my_skill in user_skills:
                # 10 Points: Exact Skill Match
                if my_skill in job_skills:
                    score += 10
                # 5 Points: Skill in Title
                elif my_skill in job_title:
                    score += 5
                # 2 Points: Skill in Description
                elif my_skill in job_desc:
                    score += 2

            if score > 0:
                scored_jobs.append({"job": job, "score": score})

        # Sort by highest score
        scored_jobs.sort(key=lambda x: x["score"], reverse=True)

        return [
            {
                "id": item["job"].id,
                "title": item["job"].title,
                "description": item["job"].description,
                "skills": item["job"].skills,
                "budget_type": item["job"].budget_type,
                "budget_from": item["job"].budget_from,
                "budget_to": item["job"].budget_to,
                "expertise_level": item["job"].expertise_level,
                "created_at": item["job"].created_at.isoformat(),
                "match_score": item["score"],
                "employer_id": item["job"].employer_id,
            }
            for item in scored_jobs
        ]

    except CollaboratorProfile.DoesNotExist:
        return [] # Return empty list if no profile found

@router.get("/jobs/saved/{user_id}")
def get_saved_jobs(user_id: int):
    saved_entries = SavedJob.objects.filter(user_id=user_id).order_by('-saved_at')
    
    return [
        {
            "id": entry.job.id,
            "title": entry.job.title,
            "description": entry.job.description,
            "skills": entry.job.skills,
            "budget_type": entry.job.budget_type,
            "budget_from": entry.job.budget_from,
            "budget_to": entry.job.budget_to,
            "expertise_level": entry.job.expertise_level,
            "created_at": entry.job.created_at.isoformat(),
            "saved_at": entry.saved_at.isoformat(),
            "employer_id": entry.job.employer_id,
        }
        for entry in saved_entries
    ]

@router.get("/jobs/recent/{user_id}")
def get_recent_jobs(user_id: int):
    recent_entries = RecentlyViewedJob.objects.filter(user_id=user_id).order_by('-viewed_at')
    
    return [
        {
            "id": entry.job.id,
            "title": entry.job.title,
            "description": entry.job.description,
            "skills": entry.job.skills,
            "budget_type": entry.job.budget_type,
            "budget_from": entry.job.budget_from,
            "budget_to": entry.job.budget_to,
            "expertise_level": entry.job.expertise_level,
            "created_at": entry.job.created_at.isoformat(),
            "viewed_at": entry.viewed_at.isoformat(),
            "employer_id": entry.job.employer_id,
        }
        for entry in recent_entries
    ]


# ==============================================================================
#  5. REVIEWS
# ==============================================================================
@router.post("/reviews/add-or-edit")
def add_collaborator_review(
    creator_id: int,
    collaborator_id: int,
    rating: int,
    comment: str
):
    try:
        creator = UserData.objects.get(id=creator_id)
        collaborator = UserData.objects.get(id=collaborator_id)

        # 1. Security Check: Has completed work?
        has_completed_work = Contract.objects.filter(
            creator=creator,
            collaborator=collaborator,
            status__iexact="completed"
        ).exists()

        if not has_completed_work:
            raise HTTPException(
                status_code=403,
                detail="You can only review collaborators you have completed work with."
            )

        # 2. Add/Edit Review
        review, created = Review.objects.update_or_create(
            reviewer=creator,
            recipient=collaborator,
            defaults={"rating": rating, "comment": comment}
        )
        
        # 3. Update Average Rating
        try:
            profile = CollaboratorProfile.objects.get(user=collaborator)
            all_reviews = Review.objects.filter(recipient=collaborator)
            if all_reviews.exists():
                avg = sum(r.rating for r in all_reviews) / all_reviews.count()
                profile.skills_rating = int(avg)
                profile.save()
        except CollaboratorProfile.DoesNotExist:
            pass

        return {"status": "success", "message": "Review saved successfully"}

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")


@router.get("/reviews/list/{user_id}")
def get_collaborator_reviews(user_id: int):
    reviews = Review.objects.filter(recipient_id=user_id).order_by('-updated_at')
    
    return [
        {
            "reviewer_name": f"{r.reviewer.first_name} {r.reviewer.last_name}",
            "rating": r.rating,
            "comment": r.comment,
            "date": r.updated_at.strftime("%d %b %Y")
        }
        for r in reviews
    ]


@router.get("/jobs/{job_id}")
def get_job_details(job_id: int):
    """
    Get job details with creator information.
    """
    try:
        job = JobPost.objects.get(id=job_id)
        
        # Get creator details
        try:
            creator_profile = CreatorProfile.objects.get(user_id=job.employer_id)
            creator_info = {
                "creator_name": creator_profile.creator_name,
                "creator_type": creator_profile.creator_type,
                "experience_level": creator_profile.experience_level,
                "location": creator_profile.location,
            }
        except CreatorProfile.DoesNotExist:
            creator_info = {
                "creator_name": "Anonymous",
                "creator_type": "Unknown",
                "experience_level": "Unknown",
                "location": "Remote",
            }
        
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
            "updated_at": job.updated_at.isoformat(),
            "employer_id": job.employer_id,
            "creator": creator_info
        }
        
    except JobPost.DoesNotExist:
        raise HTTPException(status_code=404, detail="Job not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/job-search")
def search_jobs(search: Optional[str] = None):

    jobs = JobPost.objects.select_related(
        "employer",
        "employer__creatorprofile"
    ).filter(status="posted")

    if search:
        jobs = jobs.filter(
            Q(title__icontains=search) |
            Q(description__icontains=search) |
            Q(skills__icontains=search) |

            # ✅ creator name from CreatorProfile
            Q(employer__creatorprofile__creator_name__icontains=search) |

            # ✅ creator location from CreatorProfile
            Q(employer__creatorprofile__location__icontains=search)
        )

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

            # ✅ pull from CreatorProfile safely
            "creator_name": cp.creator_name if cp else "Unknown",
            "location": cp.location if cp and cp.location else "Remote",
        })

    return results