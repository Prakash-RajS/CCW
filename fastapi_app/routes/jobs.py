
# import fastapi_app.django_setup

# from fastapi import APIRouter, Form, UploadFile, File, HTTPException
# import os
# import re
# import pycountry

# from django.conf import settings
# from creator_app.models import CollaboratorProfile, JobPost, UserData, Contract

# # ✅ DATABASE CONNECTION MANAGEMENT (Import from dbconnection)
# from fastapi_app.routes.dbconnection import ensure_db_connection, check_db_connection

# # 🔒 PLAN GUARD
# from fastapi_app.routes.plan_guard import check_job_limit


# router = APIRouter(prefix="/jobs", tags=["Jobs"])
# BASE_DIR = settings.BASE_DIR


# # =========================================================
# # HELPER – AUTO CALCULATE TIMELINE
# # =========================================================
# def calculate_timeline(duration: str) -> str:
#     text = duration.lower()

#     if "year" in text:
#         return "large"

#     numbers = [int(n) for n in re.findall(r'\d+', text)]

#     if not numbers:
#         if "less" in text or "short" in text:
#             return "small"
#         return "medium"

#     max_val = max(numbers)

#     if max_val <= 3:
#         return "small"
#     elif max_val <= 6:
#         return "medium"
#     else:
#         return "large"


# def get_country_code(country_name):
#     try:
#         return pycountry.countries.search_fuzzy(country_name)[0].alpha_2
#     except:
#         return None


# # =========================================================
# # CREATE JOB (DRAFT / POSTED)
# # =========================================================
# @router.post("/create/{employer_id}")
# def create_job(
#     employer_id: int,
#     title: str = Form(...),
#     description: str = Form(...),
#     skills: str = Form(...),
#     duration: str = Form(...),
#     expertise_level: str = Form(...),
#     budget_type: str = Form(...),
#     budget_from: float | None = Form(None),
#     budget_to: float | None = Form(None),
#     attachments: list[UploadFile] = File(None),
#     status: str = Form(...),
# ):
#     # Ensure database connection
#     ensure_db_connection()
    
#     try:
#         employer = UserData.objects.get(id=employer_id)

#         # 🔒 PLAN LIMIT CHECK
#         check_job_limit(employer)

#         # Parse skills
#         skills_list = [s.strip() for s in skills.split(",") if s.strip()]

#         # Auto timeline
#         auto_timeline = calculate_timeline(duration)

#         # Create job (has_contract defaults to False)
#         job = JobPost.objects.create(
#             employer=employer,
#             title=title,
#             description=description,
#             skills=skills_list,
#             timeline=auto_timeline,
#             duration=duration,
#             expertise_level=expertise_level,
#             budget_type=budget_type,
#             budget_from=budget_from,
#             budget_to=budget_to,
#             status=status.lower(),
#         )

#         # Save attachments
#         if attachments:
#             upload_dir = os.path.join(BASE_DIR, "fastapi_app", "job_attachments")
#             os.makedirs(upload_dir, exist_ok=True)

#             uploaded_files = []

#             for file in attachments:
#                 save_path = os.path.join(upload_dir, file.filename)
#                 with open(save_path, "wb") as f:
#                     f.write(file.file.read())
#                 uploaded_files.append(f"job_attachments/{file.filename}")

#             job.attachments = uploaded_files
#             job.save()

#         return {"message": "Job created successfully", "job_id": job.id, "has_contract": job.has_contract}

#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="User not found")
#     except Exception as e:
#         print("JOB CREATE ERROR:", e)
#         raise HTTPException(status_code=500, detail=str(e))


# # =========================================================
# # GET JOBS BY EMPLOYER WITH STATUS FILTER
# # =========================================================
# @router.get("/my-jobs/{employer_id}")
# def get_my_jobs(employer_id: int, status: str = "posted"):
#     # Ensure database connection
#     ensure_db_connection()
    
#     try:
#         UserData.objects.get(id=employer_id)

#         status = status.lower()
#         if status not in ["draft", "posted"]:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Invalid status. Allowed values: draft, posted"
#             )

#         jobs = JobPost.objects.filter(
#             employer_id=employer_id,
#             status__iexact=status
#         ).order_by("-id")

#         data = []
#         for job in jobs:
#             employer = job.employer

#             country = employer.location or ""
#             state = employer.state or ""

#             country_code = get_country_code(country)

#             data.append({
#                 "id": job.id,
#                 "title": job.title,
#                 "description": job.description,
#                 "skills": job.skills,
#                 "timeline": job.timeline,
#                 "duration": job.duration,
#                 "expertise_level": job.expertise_level,
#                 "budget_type": job.budget_type,
#                 "budget_from": float(job.budget_from) if job.budget_from else None,
#                 "budget_to": float(job.budget_to) if job.budget_to else None,
#                 "status": job.status,
#                 "attachments": job.attachments,
#                 "created_at": job.created_at.isoformat() if job.created_at else None,
#                 "has_contract": job.has_contract,  # ✅ ADDED
#                 "country": country,
#                 "state": state,
#                 "country_code": country_code,
#             })

#         return {
#             "employer_id": employer_id,
#             "status": status,
#             "count": len(data),
#             "jobs": data
#         }

#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Employer not found")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# # =========================================================
# # EDIT JOB
# # =========================================================
# @router.put("/edit/{job_id}")
# def edit_job(
#     job_id: int,
#     title: str | None = Form(None),
#     description: str | None = Form(None),
#     skills: str | None = Form(None),
#     duration: str | None = Form(None),
#     expertise_level: str | None = Form(None),
#     budget_type: str | None = Form(None),
#     budget_from: float | None = Form(None),
#     budget_to: float | None = Form(None),
#     status: str | None = Form(None),
#     attachments: list[UploadFile] | None = File(None),
# ):
#     # Ensure database connection
#     ensure_db_connection()
    
#     try:
#         job = JobPost.objects.get(id=job_id)
#     except JobPost.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Job not found")

#     if title is not None:
#         job.title = title

#     if description is not None:
#         job.description = description

#     if skills is not None:
#         job.skills = [s.strip() for s in skills.split(",") if s.strip()]

#     if duration is not None:
#         job.duration = duration
#         job.timeline = calculate_timeline(duration)

#     if expertise_level is not None:
#         job.expertise_level = expertise_level

#     if budget_type is not None:
#         job.budget_type = budget_type

#     if budget_from is not None:
#         job.budget_from = budget_from

#     if budget_to is not None:
#         job.budget_to = budget_to

#     if status is not None:
#         status = status.lower()
#         if status not in ["draft", "posted"]:
#             raise HTTPException(
#                 status_code=400,
#                 detail="Invalid status. Allowed values: draft, posted"
#             )
#         job.status = status

#     if attachments:
#         upload_dir = os.path.join(BASE_DIR, "fastapi_app", "job_attachments")
#         os.makedirs(upload_dir, exist_ok=True)

#         uploaded_files = []

#         for file in attachments:
#             save_path = os.path.join(upload_dir, file.filename)
#             with open(save_path, "wb") as f:
#                 f.write(file.file.read())
#             uploaded_files.append(f"job_attachments/{file.filename}")

#         job.attachments = uploaded_files

#     job.save()
#     return {
#         "message": "Job updated successfully",
#         "job_id": job.id,
#         "status": job.status,
#         "has_contract": job.has_contract  # ✅ ADDED
#     }


# # =========================================================
# # DELETE JOB
# # =========================================================
# @router.delete("/{job_id}/delete")
# def delete_job(job_id: int):
#     # Ensure database connection
#     ensure_db_connection()
    
#     try:
#         job = JobPost.objects.get(id=job_id)
#     except JobPost.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Job not found")

#     job.delete()
#     return {
#         "message": "Job deleted successfully",
#         "job_id": job_id
#     }


# # =========================================================
# # LIST ALL JOBS (ADMIN / PUBLIC)
# # =========================================================
# @router.get("/all")
# def list_all_jobs(status: str | None = None):
#     # Ensure database connection
#     ensure_db_connection()
    
#     try:
#         jobs = JobPost.objects.all().order_by("-id")

#         if status:
#             status = status.lower()
#             if status not in ["draft", "posted"]:
#                 raise HTTPException(
#                     status_code=400,
#                     detail="Invalid status. Allowed values: draft, posted"
#                 )
#             jobs = jobs.filter(status__iexact=status)

#         data = []
#         for job in jobs:
#             data.append({
#                 "id": job.id,
#                 "employer_id": job.employer_id,
#                 "title": job.title,
#                 "description": job.description,
#                 "skills": job.skills,
#                 "timeline": job.timeline,
#                 "duration": job.duration,
#                 "expertise_level": job.expertise_level,
#                 "budget_type": job.budget_type,
#                 "budget_from": float(job.budget_from) if job.budget_from else None,
#                 "budget_to": float(job.budget_to) if job.budget_to else None,
#                 "status": job.status,
#                 "attachments": job.attachments,
#                 "created_at": job.created_at.isoformat() if job.created_at else None,
#                 "has_contract": job.has_contract,  # ✅ ADDED
#             })

#         return {
#             "count": len(data),
#             "jobs": data
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# # =========================================================
# # GET JOBS USER IS WORKING ON (AS COLLABORATOR)
# # =========================================================
# @router.get("/working/{user_id}")
# def get_working_jobs(user_id: int):
#     """
#     Get all jobs where the user is working as a collaborator
#     (through contracts with status = in_progress)
#     """
#     # Ensure database connection
#     ensure_db_connection()
    
#     try:
#         # Verify user exists
#         try:
#             user = UserData.objects.get(id=user_id)
#         except UserData.DoesNotExist:
#             return {
#                 "user_id": user_id,
#                 "total_working_jobs": 0,
#                 "contracts": [],
#                 "error": "User not found"
#             }

#         # Get all in_progress contracts where user is the collaborator
#         contracts = Contract.objects.filter(
#             collaborator_id=user_id,
#             status="in_progress"
#         ).select_related('job', 'job__employer', 'creator').order_by('-updated_at')
        
#         print(f"Found {contracts.count()} in_progress contracts for user {user_id}")
        
#         jobs_data = []
#         for contract in contracts:
#             try:
#                 job = contract.job
#                 if not job:
#                     print(f"Contract {contract.id} has no associated job")
#                     continue
                
#                 # Get employer (creator) info
#                 employer = job.employer or contract.creator
                
#                 # Get creator/collaborator names and profile pictures
#                 creator_name = None
#                 creator_profile_pic = None
#                 if contract.creator:
#                     creator_name = contract.creator.full_name or contract.creator.email
#                     # Get profile picture for creator
#                     if hasattr(contract.creator, 'profile_picture') and contract.creator.profile_picture:
#                         try:
#                             creator_profile_pic = contract.creator.profile_picture.url if hasattr(contract.creator.profile_picture, 'url') else str(contract.creator.profile_picture)
#                         except:
#                             creator_profile_pic = None
                
#                 collaborator_name = None
#                 collaborator_profile_pic = None
#                 if contract.collaborator:
#                     collaborator_name = contract.collaborator.full_name or contract.collaborator.email
#                     # Get profile picture for collaborator
#                     if hasattr(contract.collaborator, 'profile_picture') and contract.collaborator.profile_picture:
#                         try:
#                             collaborator_profile_pic = contract.collaborator.profile_picture.url if hasattr(contract.collaborator.profile_picture, 'url') else str(contract.collaborator.profile_picture)
#                         except:
#                             collaborator_profile_pic = None
                
#                 # Get employer profile picture
#                 employer_profile_pic = None
#                 if employer and hasattr(employer, 'profile_picture') and employer.profile_picture:
#                     try:
#                         employer_profile_pic = employer.profile_picture.url if hasattr(employer.profile_picture, 'url') else str(employer.profile_picture)
#                     except:
#                         employer_profile_pic = None
                
#                 # Build job data
#                 job_details = {
#                     "skills": job.skills if hasattr(job, 'skills') else [],
#                     "duration": job.duration if hasattr(job, 'duration') else '',
#                     "expertise_level": job.expertise_level if hasattr(job, 'expertise_level') else '',
#                     "budget_type": job.budget_type if hasattr(job, 'budget_type') else '',
#                     "budget_from": float(job.budget_from) if job.budget_from else None,
#                     "budget_to": float(job.budget_to) if job.budget_to else None
#                 }
                
#                 # Format dates
#                 start_date = None
#                 if contract.start_date:
#                     start_date = contract.start_date.isoformat()
#                 elif hasattr(contract, 'created_at') and contract.created_at:
#                     start_date = contract.created_at.isoformat()
                
#                 # Get budget amount
#                 budget_amount = float(contract.budget) if contract.budget else None
#                 if not budget_amount and job.budget_from:
#                     budget_amount = float(job.budget_from)
                
#                 contract_data = {
#                     "id": job.id,
#                     "contract_id": contract.id,
#                     "job_title": job.title if hasattr(job, 'title') else "Untitled Project",
#                     "title": job.title if hasattr(job, 'title') else "Untitled Project",
#                     "description": job.description if hasattr(job, 'description') else "",
#                     "budget": budget_amount,
#                     "amount": budget_amount,
#                     "budget_type": job.budget_type if hasattr(job, 'budget_type') else 'hourly',
#                     "status": contract.status,
#                     "start_date": start_date,
#                     "work_description": contract.work_description if hasattr(contract, 'work_description') else "",
#                     "work_attachment": str(contract.work_attachment) if contract.work_attachment and hasattr(contract, 'work_attachment') else None,
#                     "has_contract": job.has_contract,  # ✅ ADDED
#                     "creator": {
#                         "id": employer.id if employer else None,
#                         "name": employer.full_name  or employer.email if employer else "Client",
#                         "email": employer.email if employer else "",
#                         # "full_name": employer.first_name if employer else "",
#                         # "first_name": employer.first_name if employer else "",
#                         # "last_name": employer.last_name if employer else "",
#                         "location": employer.location if employer and hasattr(employer, 'location') else "",
#                         "city": employer.city if employer and hasattr(employer, 'city') else "",
#                         "profile_picture": creator_profile_pic or employer_profile_pic,
#                     },
#                     "collaborator": {
#                         "id": contract.collaborator.id if contract.collaborator else None,
#                         "name": collaborator_name,
#                         "email": contract.collaborator.email if contract.collaborator else "",
#                         "profile_picture": collaborator_profile_pic,
#                     },
#                     "job_details": job_details,
#                     "created_at": contract.created_at.isoformat() if hasattr(contract, 'created_at') and contract.created_at else None,
#                     "updated_at": contract.updated_at.isoformat() if hasattr(contract, 'updated_at') and contract.updated_at else None
#                 }
#                 jobs_data.append(contract_data)
                
#             except Exception as e:
#                 print(f"Error processing contract {contract.id}: {str(e)}")
#                 import traceback
#                 traceback.print_exc()
#                 continue
        
#         response = {
#             "user_id": user_id,
#             "total_working_jobs": len(jobs_data),
#             "contracts": jobs_data
#         }
        
#         print(f"Returning {len(jobs_data)} jobs for user {user_id}")
#         return response
        
#     except Exception as e:
#         print(f"Server error in get_working_jobs: {str(e)}")
#         import traceback
#         traceback.print_exc()
        
#         # Return a proper response even on error
#         return {
#             "user_id": user_id,
#             "total_working_jobs": 0,
#             "contracts": [],
#             "error": str(e)
#         }
        

# # =========================================================
# # GET COLLABORATOR CONTRACT STATISTICS
# # =========================================================
# @router.get("/contract-stats/{collaborator_id}")
# def get_contract_stats(collaborator_id: int):
#     """
#     Get statistics for contracts where the user is a collaborator
#     """
#     # Ensure database connection
#     ensure_db_connection()
    
#     try:
#         # Verify user exists
#         try:
#             user = UserData.objects.get(id=collaborator_id)
#         except UserData.DoesNotExist:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Get all contracts where this user is the collaborator
#         all_contracts = Contract.objects.filter(collaborator_id=collaborator_id)
        
#         # Calculate statistics
#         stats = {
#             'active': all_contracts.filter(status='in_progress').count(),
#             'completed': all_contracts.filter(status='completed').count(),
#             'canceled': all_contracts.filter(status__in=['cancelled', 'canceled']).count(),
#             'total': all_contracts.count()
#         }
        
#         print(f"Contract stats for user {collaborator_id}: {stats}")
        
#         return {
#             'status': 'success',
#             'collaborator_id': collaborator_id,
#             **stats
#         }
        
#     except Exception as e:
#         print(f"Error getting contract stats: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))


# # =========================================================
# # JOB LIKE FUNCTIONALITY
# # =========================================================

# @router.post("/toggle-like/{user_id}/{job_id}")
# def toggle_job_like(user_id: int, job_id: int):
#     """
#     Toggle like on a job for a collaborator
#     """
#     # Ensure database connection
#     ensure_db_connection()
    
#     try:
#         # Get the collaborator profile
#         try:
#             collaborator = CollaboratorProfile.objects.get(user_id=user_id)
#         except CollaboratorProfile.DoesNotExist:
#             raise HTTPException(status_code=404, detail="Collaborator profile not found")
        
#         # Get current liked jobs (handle both list and None)
#         liked_jobs = collaborator.liked_jobs
#         if liked_jobs is None:
#             liked_jobs = []
        
#         # Toggle the like
#         if job_id in liked_jobs:
#             liked_jobs.remove(job_id)
#             action = 'unliked'
#             message = 'Job unliked successfully'
#         else:
#             liked_jobs.append(job_id)
#             action = 'liked'
#             message = 'Job liked successfully'
        
#         # Save back to database
#         collaborator.liked_jobs = liked_jobs
#         collaborator.save()
        
#         return {
#             'status': 'success',
#             'action': action,
#             'message': message,
#             'liked_jobs': liked_jobs,
#             'user_id': user_id,
#             'job_id': job_id
#         }
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"Error toggling job like: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))


# @router.get("/liked-jobs/{collaborator_id}")
# def get_liked_jobs(collaborator_id: int):
#     """
#     Get all jobs liked by a collaborator
#     """
#     # Ensure database connection
#     ensure_db_connection()
    
#     try:
#         # Get the collaborator profile
#         try:
#             collaborator = CollaboratorProfile.objects.get(user_id=collaborator_id)
#         except CollaboratorProfile.DoesNotExist:
#             return {
#                 'status': 'error',
#                 'message': 'Collaborator profile not found',
#                 'liked_jobs': []
#             }
        
#         # Get liked jobs
#         liked_jobs = collaborator.liked_jobs or []
        
#         return {
#             'status': 'success',
#             'collaborator_id': collaborator_id,
#             'liked_jobs': liked_jobs,
#             'total_likes': len(liked_jobs)
#         }
        
#     except Exception as e:
#         print(f"Error getting liked jobs: {str(e)}")
#         return {
#             'status': 'error',
#             'message': str(e),
#             'liked_jobs': []
#         }


# # =========================================================
# # GET JOB BY ID (for invitation details)
# # =========================================================
# @router.get("/{job_id}")
# def get_job_by_id(job_id: int):
#     """
#     Get job details by ID
#     """
#     # Ensure database connection
#     ensure_db_connection()
    
#     try:
#         job = JobPost.objects.get(id=job_id)
        
#         # Get employer info
#         employer = job.employer
#         employer_name = employer.full_name or employer.email if employer else "Unknown"
#         employer_profile_pic = None
        
#         if employer and hasattr(employer, 'profile_picture') and employer.profile_picture:
#             try:
#                 employer_profile_pic = employer.profile_picture.url if hasattr(employer.profile_picture, 'url') else str(employer.profile_picture)
#             except:
#                 pass
        
#         # Get country code for location
#         country_code = None
#         if employer and employer.location:
#             try:
#                 country_code = get_country_code(employer.location)
#             except:
#                 pass
        
#         return {
#             "id": job.id,
#             "title": job.title,
#             "description": job.description,
#             "skills": job.skills if isinstance(job.skills, list) else (job.skills.split(',') if job.skills else []),
#             "duration": job.duration,
#             "timeline": job.timeline,
#             "expertise_level": job.expertise_level,
#             "budget_type": job.budget_type,
#             "budget_from": float(job.budget_from) if job.budget_from else None,
#             "budget_to": float(job.budget_to) if job.budget_to else None,
#             "status": job.status,
#             "attachments": job.attachments,
#             "created_at": job.created_at.isoformat() if job.created_at else None,
#             "has_contract": job.has_contract,  # ✅ ADDED
#             "employer": {
#                 "id": employer.id if employer else None,
#                 "name": employer_name,
#                 "email": employer.email if employer else "",
#                 "location": employer.location if employer else "",
#                 "state": employer.state if employer else "",
#                 "country_code": country_code,
#                 "profile_picture": employer_profile_pic
#             }
#         }
        
#     except JobPost.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Job not found")
#     except Exception as e:
#         print(f"Error fetching job: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))


# # =========================================================
# # ✅ NEW: GET JOBS WITHOUT CONTRACTS (for inviting collaborators)
# # =========================================================
# @router.get("/available-for-invite/{employer_id}")
# def get_available_jobs_for_invite(employer_id: int):
#     """
#     Get all posted jobs for an employer that don't have contracts yet.
#     These are the jobs that can be used to invite collaborators.
#     """
#     # Ensure database connection
#     ensure_db_connection()
    
#     try:
#         employer = UserData.objects.get(id=employer_id)
#     except UserData.DoesNotExist:
#         raise HTTPException(status_code=404, detail="Employer not found")
    
#     # Get posted/active jobs without contracts
#     available_jobs = JobPost.objects.filter(
#         employer=employer,
#         status__in=["posted", "active"],
#         has_contract=False  # ✅ Only jobs without contracts
#     ).order_by("-created_at")
    
#     result = []
#     for job in available_jobs:
#         result.append({
#             "id": job.id,
#             "title": job.title,
#             "description": job.description,
#             "skills": job.skills,
#             "duration": job.duration,
#             "expertise_level": job.expertise_level,
#             "budget_type": job.budget_type,
#             "budget_from": float(job.budget_from) if job.budget_from else None,
#             "budget_to": float(job.budget_to) if job.budget_to else None,
#             "created_at": job.created_at.isoformat() if job.created_at else None,
#             "has_contract": job.has_contract
#         })
    
#     return {
#         "employer_id": employer_id,
#         "count": len(result),
#         "jobs": result
#     }



import fastapi_app.django_setup

from fastapi import APIRouter, Form, UploadFile, File, HTTPException, Request, Query
import os
import re
from django.db import transaction
import pycountry
import asyncio
from concurrent.futures import ThreadPoolExecutor
from asgiref.sync import sync_to_async
from creator_app.models import Invitation, Notification, track_file_upload, track_file_deletion
from django.conf import settings
from creator_app.models import CollaboratorProfile, JobPost, UserData, Contract, Proposal, Review
from fastapi_app.services.notification_service import create_notification

# ✅ DATABASE CONNECTION MANAGEMENT (Import from dbconnection)
from fastapi_app.routes.dbconnection import ensure_db_connection, check_db_connection

# 🔒 PLAN GUARD
from fastapi_app.routes.plan_guard import check_job_limit, check_storage_limit


router = APIRouter(prefix="/jobs", tags=["Jobs"])
BASE_DIR = settings.BASE_DIR

# Create a thread pool for sync operations
thread_pool = ThreadPoolExecutor(max_workers=10)


# =========================================================
# HELPER – AUTO CALCULATE TIMELINE
# =========================================================
def calculate_timeline(duration: str) -> str:
    text = duration.lower()

    if "year" in text:
        return "large"

    numbers = [int(n) for n in re.findall(r'\d+', text)]

    if not numbers:
        if "less" in text or "short" in text:
            return "small"
        return "medium"

    max_val = max(numbers)

    if max_val <= 3:
        return "small"
    elif max_val <= 6:
        return "medium"
    else:
        return "large"


def get_country_code(country_name):
    try:
        return pycountry.countries.search_fuzzy(country_name)[0].alpha_2
    except:
        return None
    
# =========================================================
# JOB SEARCH SUGGESTIONS (for autocomplete) - MUST BE BEFORE /{job_id}
# =========================================================
@router.get("/job-search-suggestions")
async def job_search_suggestions(
    request: Request,
    search: str = Query(default="", description="Search query"),
    limit: int = Query(default=10, ge=1, le=50, description="Maximum number of suggestions")
):
    """
    Get job title suggestions based on search query for autocomplete.
    Returns unique job titles that match the search term.
    """
    print(f"🔍 Search suggestions called with search='{search}', limit={limit}")  # Debug log
    
    # Ensure database connection
    await sync_to_async(ensure_db_connection)()
    
    # Early return for empty search
    if not search or not search.strip():
        return []
    
    search_query = search.strip()
    
    # Only search if query has at least 2 characters
    if len(search_query) < 2:
        return []
    
    try:
        def get_suggestions():
            from django.db.models import Q
            
            print(f"🔎 Searching for jobs containing: {search_query}")  # Debug log
            
            # Get unique job titles from posted/active jobs
            jobs = JobPost.objects.filter(
                Q(status__in=["posted", "active"]),
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(skills__icontains=search_query)
            ).exclude(
                title__isnull=True
            ).exclude(
                title__exact=''
            ).values_list('title', flat=True).distinct()[:limit]
            
            # Clean and return results
            suggestions = []
            for job in jobs:
                if job and job.strip() and job not in suggestions:
                    suggestions.append(job.strip())
            
            print(f"✅ Found {len(suggestions)} suggestions: {suggestions}")  # Debug log
            return suggestions
        
        suggestions = await sync_to_async(get_suggestions)()
        return suggestions
        
    except Exception as e:
        print(f"❌ Error fetching search suggestions: {str(e)}")
        import traceback
        traceback.print_exc()
        return []

#updated file to use only if we want to exclude jobs with active contracts from search suggestions. Otherwise, we can use the above version which is simpler and faster.
# @router.get("/job-search-suggestions")
# async def job_search_suggestions(
#     request: Request,
#     search: str = Query(default="", description="Search query"),
#     limit: int = Query(default=10, ge=1, le=50, description="Maximum number of suggestions")
# ):
#     """
#     Get job title suggestions based on search query for autocomplete.
#     Returns unique job titles that match the search term.
#     Only returns jobs that are NOT already assigned/contracted.
#     """
#     print(f"🔍 Search suggestions called with search='{search}', limit={limit}")  # Debug log
    
#     # Ensure database connection
#     await sync_to_async(ensure_db_connection)()
    
#     # Early return for empty search
#     if not search or not search.strip():
#         return []
    
#     search_query = search.strip()
    
#     # Only search if query has at least 2 characters
#     if len(search_query) < 2:
#         return []
    
#     try:
#         def get_suggestions():
#             from django.db.models import Q
            
#             print(f"🔎 Searching for jobs containing: {search_query}")  # Debug log
            
#             # Get unique job titles from posted/active jobs that DON'T have active contracts
#             jobs = JobPost.objects.filter(
#                 Q(status__in=["posted", "active"]),
#                 Q(title__icontains=search_query) |
#                 Q(description__icontains=search_query) |
#                 Q(skills__icontains=search_query),
#                 # ✅ EXCLUDE JOBS WITH ACTIVE CONTRACTS
#                 Q(has_contract=False)  # Only jobs that haven't been contracted at all
#             ).exclude(
#                 # ✅ EXCLUDE JOBS THAT HAVE ANY ACTIVE CONTRACTS (awaiting, in_progress, in_review)
#                 id__in=Contract.objects.filter(
#                     status__in=["awaiting", "in_progress", "in_review", "pending"]
#                 ).values_list('job_id', flat=True)
#             ).exclude(
#                 title__isnull=True
#             ).exclude(
#                 title__exact=''
#             ).values_list('title', flat=True).distinct()[:limit]
            
#             # Clean and return results
#             suggestions = []
#             for job in jobs:
#                 if job and job.strip() and job not in suggestions:
#                     suggestions.append(job.strip())
            
#             print(f"✅ Found {len(suggestions)} suggestions: {suggestions}")  # Debug log
#             return suggestions
        
#         suggestions = await sync_to_async(get_suggestions)()
#         return suggestions
        
#     except Exception as e:
#         print(f"❌ Error fetching search suggestions: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return []

# =========================================================
# CREATE JOB (DRAFT / POSTED)
# =========================================================
@router.post("/create/{employer_id}")
async def create_job(
    employer_id: int,
    title: str = Form(...),
    description: str = Form(...),
    skills: str = Form(...),
    duration: str = Form(...),
    expertise_level: str = Form(...),
    budget_type: str = Form(...),
    budget_from: float | None = Form(None),
    budget_to: float | None = Form(None),
    attachments: list[UploadFile] = File(None),
    status: str = Form(...),
):
    # Ensure database connection
    await sync_to_async(ensure_db_connection)()
    
    try:
        employer = await sync_to_async(UserData.objects.get)(id=employer_id)

        # 🔒 PLAN LIMIT CHECK
        await sync_to_async(check_job_limit)(employer)

        # Parse skills
        skills_list = [s.strip() for s in skills.split(",") if s.strip()]

        # Auto timeline
        auto_timeline = calculate_timeline(duration)

        # Create job (has_contract defaults to False)
        job = await sync_to_async(JobPost.objects.create)(
            employer=employer,
            title=title,
            description=description,
            skills=skills_list,
            timeline=auto_timeline,
            duration=duration,
            expertise_level=expertise_level,
            budget_type=budget_type,
            budget_from=budget_from,
            budget_to=budget_to,
            status=status.lower(),
        )
        
        # CREATE JOB POST NOTIFICATION
        await sync_to_async(create_notification)(
            user=employer,
            notification_type='job_posted',
            title='Job Posted Successfully',
            message=f'Your job "{title}" has been posted successfully.',
            url='/job-created'
        )

        print(f"🔔 Job notification created for {employer.email}")

        # Save attachments
        if attachments:
            upload_dir = os.path.join(BASE_DIR, "fastapi_app", "media", "job_attachments")
            os.makedirs(upload_dir, exist_ok=True)
            uploaded_files = []

            for file in attachments:
                file_content = await file.read()
                file_size = len(file_content)

                # 🔒 ADD THIS — check per file before writing to disk
                await sync_to_async(check_storage_limit)(employer, file_size)

                save_path = os.path.join(upload_dir, file.filename)
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(thread_pool, lambda: open(save_path, "wb").write(file_content))
                uploaded_files.append(f"job_attachments/{file.filename}")

                # ✅ Track after save
                await sync_to_async(track_file_upload)(employer, save_path, file_size)

            job.attachments = uploaded_files
            await sync_to_async(job.save)()

        return {"message": "Job created successfully", "job_id": job.id, "has_contract": job.has_contract}

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        print("JOB CREATE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# GET JOBS BY EMPLOYER WITH STATUS FILTER
# =========================================================

@router.get("/my-jobs/{employer_id}")
def get_my_jobs(employer_id: int, status: str = "posted"):
    # Ensure database connection
    ensure_db_connection()

    try:
        employer = UserData.objects.get(id=employer_id)

        status = status.lower()
        if status not in ["draft", "posted"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status. Allowed values: draft, posted"
            )

        jobs = JobPost.objects.filter(
            employer_id=employer_id,
            status__iexact=status
        ).order_by("-id")

        data = []
        for job in jobs:
            # ✅ FIXED: Get location from CreatorProfile
            employer_location = None
            employer_state = None
            country_code = None
            
            try:
                from creator_app.models import CreatorProfile
                creator_profile = CreatorProfile.objects.filter(user=employer).first()
                if creator_profile:
                    employer_location = creator_profile.location or ""
                    employer_state = creator_profile.state or ""
                    if employer_location:
                        try:
                            country_code = get_country_code(employer_location)
                        except:
                            pass
            except:
                pass

            # Count PROPOSALS (applications/bids from collaborators)
            proposals_count = Proposal.objects.filter(job_id=job.id).count()

            # Count hired (accepted proposals that became contracts)
            hired_count = Contract.objects.filter(job_id=job.id, status__in=["in_progress", "completed", "awaiting"]).count()

            has_completed_contract = Contract.objects.filter(
    job_id=job.id,
    status="completed"
).exists()
            
            # Get all reviews for this employer (creator)
            reviews = Review.objects.filter(recipient=employer)
            review_count = reviews.count()
            
            # Calculate average rating
            if review_count > 0:
                total_rating = sum(r.rating for r in reviews)
                avg_rating = round(total_rating / review_count, 1)
            else:
                avg_rating = 0

            data.append({
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
                "attachments": job.attachments,
                "created_at": job.created_at.isoformat() if job.created_at else None,
                "has_contract": job.has_contract,
                "has_completed_contract": has_completed_contract,
                "country": employer_location,
                "state": employer_state,
                "country_code": country_code,
                "proposals_count": proposals_count,
                "hired_count": hired_count,
                "rating": avg_rating,
                "reviews_count": review_count,
            })

        return {
            "employer_id": employer_id,
            "status": status,
            "count": len(data),
            "jobs": data
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Employer not found")
    except Exception as e:
        print(f"Error in get_my_jobs: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
# =========================================================
# EDIT JOB
# =========================================================
@router.put("/edit/{job_id}")
async def edit_job(
    job_id: int,
    title: str | None = Form(None),
    description: str | None = Form(None),
    skills: str | None = Form(None),
    duration: str | None = Form(None),
    expertise_level: str | None = Form(None),
    budget_type: str | None = Form(None),
    budget_from: float | None = Form(None),
    budget_to: float | None = Form(None),
    status: str | None = Form(None),
    attachments: list[UploadFile] | None = File(None),
):
    # Ensure database connection
    await sync_to_async(ensure_db_connection)()
    
    try:
        job = await sync_to_async(JobPost.objects.get)(id=job_id)
    except JobPost.DoesNotExist:
        raise HTTPException(status_code=404, detail="Job not found")

    if title is not None:
        job.title = title

    if description is not None:
        job.description = description

    if skills is not None:
        job.skills = [s.strip() for s in skills.split(",") if s.strip()]

    if duration is not None:
        job.duration = duration
        job.timeline = calculate_timeline(duration)

    if expertise_level is not None:
        job.expertise_level = expertise_level

    if budget_type is not None:
        job.budget_type = budget_type

    if budget_from is not None:
        job.budget_from = budget_from

    if budget_to is not None:
        job.budget_to = budget_to

    if status is not None:
        status = status.lower()
        if status not in ["draft", "posted"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status. Allowed values: draft, posted"
            )
        job.status = status

    if attachments:
        upload_dir = os.path.join(BASE_DIR, "fastapi_app", "media", "job_attachments")
        os.makedirs(upload_dir, exist_ok=True)
        uploaded_files = []

        for file in attachments:
            file_content = await file.read()
            file_size = len(file_content)

            # 🔒 ADD THIS
            await sync_to_async(check_storage_limit)(job.employer, file_size)

            save_path = os.path.join(upload_dir, file.filename)
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(thread_pool, lambda: open(save_path, "wb").write(file_content))
            uploaded_files.append(f"job_attachments/{file.filename}")

            # ✅ Track after save
            await sync_to_async(track_file_upload)(job.employer, save_path, file_size)

        job.attachments = uploaded_files

    await sync_to_async(job.save)()
    return {
        "message": "Job updated successfully",
        "job_id": job.id,
        "status": job.status,
        "has_contract": job.has_contract
    }


# =========================================================
# DELETE JOB
# =========================================================
@router.delete("/{job_id}/delete")
async def delete_job(job_id: int):
    await sync_to_async(ensure_db_connection)()

    try:
        job = await sync_to_async(
            JobPost.objects.select_related("employer").get
        )(id=job_id)

    except JobPost.DoesNotExist:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    @transaction.atomic
    def perform_delete():

        creator = job.employer

        # ==================================================
        # COLLECT USERS TO NOTIFY
        # ==================================================

        notified_users = set()

        proposals = list(
            Proposal.objects.filter(job=job)
            .select_related("freelancer")
        )

        invitations = list(
            Invitation.objects.filter(job=job)
            .select_related("receiver")
        )

        contracts = list(
            Contract.objects.filter(job=job)
            .select_related("collaborator")
        )

        # ==================================================
        # NOTIFY CREATOR
        # ==================================================

        create_notification(
            user=creator,
            notification_type="system",
            title="Job deleted successfully",
            message=f'Your job "{job.title}" has been deleted.',
            job=job,
            url="/jobpost"
        )

        # ==================================================
        # NOTIFY PROPOSAL SUBMITTERS
        # ==================================================

        for proposal in proposals:

            collaborator = proposal.freelancer

            if not collaborator:
                continue

            if collaborator.id in notified_users:
                continue

            notified_users.add(collaborator.id)

            create_notification(
                user=collaborator,
                sender=creator,
                notification_type="system",
                title="Job deleted by creator",
                message=f'The job "{job.title}" was deleted by the creator.',
                job=job,
                proposal=proposal,
                url="/all-contacts"
            )

        # ==================================================
        # NOTIFY INVITED COLLABORATORS
        # ==================================================

        for invitation in invitations:

            collaborator = invitation.receiver

            if not collaborator:
                continue

            if collaborator.id in notified_users:
                continue

            notified_users.add(collaborator.id)

            create_notification(
                user=collaborator,
                sender=creator,
                notification_type="system",
                title="Job deleted by creator",
                message=f'The job "{job.title}" was deleted by the creator.',
                job=job,
                invitation=invitation,
                url="/all-contacts"
            )

        # ==================================================
        # NOTIFY CONTRACT COLLABORATORS
        # ==================================================

        for contract in contracts:

            collaborator = contract.collaborator

            if not collaborator:
                continue

            if collaborator.id in notified_users:
                continue

            notified_users.add(collaborator.id)

            create_notification(
                user=collaborator,
                sender=creator,
                notification_type="contract_updated",
                title="Contract removed",
                message=f'Contract for "{job.title}" was removed because the creator deleted the job.',
                contract=contract,
                job=job,
                url="/all-contacts"
            )

        # ==================================================
        # DELETE JOB ATTACHMENTS
        # ==================================================

        if job.attachments:

            for file_path in job.attachments:

                try:
                    full_path = os.path.join(
                        BASE_DIR,
                        "fastapi_app",
                        "media",
                        file_path
                    )

                    if os.path.exists(full_path):
                        os.remove(full_path)

                except Exception as e:
                    print(
                        f"Attachment delete error: {e}"
                    )

        # ==================================================
        # DELETE RELATED RECORDS
        # ==================================================

        Proposal.objects.filter(
            job=job
        ).delete()

        Invitation.objects.filter(
            job=job
        ).delete()

        Contract.objects.filter(
            job=job
        ).delete()

        # ==================================================
        # DELETE JOB
        # ==================================================

        job.delete()

    await sync_to_async(
        perform_delete
    )()

    return {
        "success": True,
        "message": "Job and all related data deleted successfully",
        "job_id": job_id
    }


# =========================================================
# LIST ALL JOBS (ADMIN / PUBLIC)
# =========================================================
@router.get("/all")
async def list_all_jobs(status: str | None = None):
    """
    Get all jobs. Can filter by status (draft, posted)
    Returns array directly for easier frontend consumption
    """
    # Ensure database connection
    await sync_to_async(ensure_db_connection)()
    
    try:
        def get_jobs():
            jobs = JobPost.objects.filter(status__in=["posted", "active"]).order_by("-id")

            # Only filter by status if provided and valid
            if status:
                status_lower = status.lower()
                if status_lower not in ["draft", "posted", "active"]:
                    return []  # Return empty array instead of raising error
                jobs = jobs.filter(status__iexact=status_lower)

            data = []
            for job in jobs:
                employer = job.employer
                
                # Calculate rating for the employer
                reviews = Review.objects.filter(recipient=employer)
                review_count = reviews.count()
                if review_count > 0:
                    total_rating = sum(r.rating for r in reviews)
                    avg_rating = round(total_rating / review_count, 1)
                else:
                    avg_rating = 0
                
                # ✅ FIXED: Get location from CreatorProfile instead of UserData
                employer_location = None
                employer_state = None
                employer_country_code = None
                
                try:
                    # Try to get location from CreatorProfile
                    from creator_app.models import CreatorProfile
                    creator_profile = CreatorProfile.objects.filter(user=employer).first()
                    if creator_profile:
                        employer_location = creator_profile.location or ""
                        employer_state = creator_profile.state or ""
                        if employer_location:
                            try:
                                employer_country_code = get_country_code(employer_location)
                            except:
                                pass
                except Exception as e:
                    print(f"Could not fetch creator profile location: {e}")
                    # Don't fail the whole job fetch - just continue with None values
                
                # Get employer name - handle None case
                employer_name = "Client"
                if employer:
                    if employer.full_name:
                        employer_name = employer.full_name
                    elif employer.email:
                        employer_name = employer.email.split('@')[0]
                
                data.append({
                    "id": job.id,
                    "employer_id": job.employer_id,
                    "employer_name": employer_name,
                    "employer_location": employer_location,
                    "employer_state": employer_state,
                    "employer_country_code": employer_country_code,
                    "employer_rating": avg_rating,
                    "employer_reviews_count": review_count,
                    "title": job.title,
                    "description": job.description,
                    "skills": job.skills if isinstance(job.skills, list) else [],
                    "timeline": job.timeline,
                    "duration": job.duration,
                    "expertise_level": job.expertise_level,
                    "budget_type": job.budget_type,
                    "budget_from": float(job.budget_from) if job.budget_from else None,
                    "budget_to": float(job.budget_to) if job.budget_to else None,
                    "status": job.status,
                    "attachments": job.attachments if job.attachments else [],
                    "created_at": job.created_at.isoformat() if job.created_at else None,
                    "has_contract": job.has_contract,
                })

            return data  # Return array directly

        jobs_data = await sync_to_async(get_jobs)()
        
        # Return array directly for easier frontend use
        return jobs_data

    except Exception as e:
        print(f"Error in list_all_jobs: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return empty array instead of throwing error
        return []

@router.get("/all-paginated")
async def list_all_jobs_paginated(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status: str | None = None
):
    """
    Get all jobs with pagination
    """
    await sync_to_async(ensure_db_connection)()
    
    try:
        def get_jobs():
            jobs = JobPost.objects.filter(status__in=["posted", "active"]).order_by("-id")
            
            if status:
                status_lower = status.lower()
                jobs = jobs.filter(status__iexact=status_lower)
            
            total = jobs.count()
            
            # Apply pagination
            start = (page - 1) * limit
            end = start + limit
            paginated_jobs = jobs[start:end]
            
            data = []
            for job in paginated_jobs:
                employer = job.employer
                
                # Calculate rating for the employer
                reviews = Review.objects.filter(recipient=employer)
                review_count = reviews.count()
                avg_rating = round(sum(r.rating for r in reviews) / review_count, 1) if review_count > 0 else 0
                
                # Get location from CreatorProfile
                employer_location = None
                employer_state = None
                
                try:
                    from creator_app.models import CreatorProfile
                    creator_profile = CreatorProfile.objects.filter(user=employer).first()
                    if creator_profile:
                        employer_location = creator_profile.location or ""
                        employer_state = creator_profile.state or ""
                except:
                    pass
                
                employer_name = "Client"
                if employer:
                    if employer.full_name:
                        employer_name = employer.full_name
                    elif employer.email:
                        employer_name = employer.email.split('@')[0]
                
                data.append({
                    "id": job.id,
                    "employer_id": job.employer_id,
                    "employer_name": employer_name,
                    "employer_location": employer_location,
                    "employer_state": employer_state,
                    "employer_rating": avg_rating,
                    "title": job.title,
                    "description": job.description,
                    "skills": job.skills if isinstance(job.skills, list) else [],
                    "duration": job.duration,
                    "budget_type": job.budget_type,
                    "budget_from": float(job.budget_from) if job.budget_from else None,
                    "budget_to": float(job.budget_to) if job.budget_to else None,
                    "created_at": job.created_at.isoformat() if job.created_at else None,
                })
            
            return {
                "total": total,
                "page": page,
                "limit": limit,
                "total_pages": (total + limit - 1) // limit,
                "jobs": data
            }
        
        result = await sync_to_async(get_jobs)()
        return result
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "total": 0,
            "page": page,
            "limit": limit,
            "total_pages": 0,
            "jobs": []
        }

# =========================================================
# GET JOBS USER IS WORKING ON (AS COLLABORATOR)
# =========================================================
@router.get("/working/{user_id}")
async def get_working_jobs(user_id: int, request: Request):
    """
    Get all jobs where the user is working as a collaborator
    (through contracts with status = in_progress)
    """
    await sync_to_async(ensure_db_connection)()

    try:
        base_url = str(request.base_url).rstrip("/")

        def build_pic_url(user_obj):
            if not user_obj:
                return None
            try:
                pic = user_obj.profile_picture
                if not pic:
                    return None
                pic_name = str(pic.name).lstrip("/")
                if not pic_name:
                    return None
                return f"{base_url}/media/{pic_name}"
            except Exception:
                return None

        def get_contracts():
            try:
                user = UserData.objects.get(id=user_id)
            except UserData.DoesNotExist:
                return {
                    "user_id": user_id,
                    "total_working_jobs": 0,
                    "contracts": [],
                    "error": "User not found"
                }

            contracts = Contract.objects.filter(
                collaborator_id=user_id,
                status="in_progress"
            ).select_related('job', 'job__employer', 'creator').order_by('-updated_at')

            print(f"Found {contracts.count()} in_progress contracts for user {user_id}")

            jobs_data = []
            for contract in contracts:
                try:
                    job = contract.job
                    if not job:
                        print(f"Contract {contract.id} has no associated job")
                        continue

                    employer = job.employer or contract.creator

                    creator_name = None
                    if contract.creator:
                        creator_name = contract.creator.full_name or contract.creator.email

                    collaborator_name = None
                    if contract.collaborator:
                        collaborator_name = contract.collaborator.full_name or contract.collaborator.email

                    # ========== ADD THIS: Calculate creator rating ==========
                    creator_rating = 0
                    creator_reviews_count = 0
                    
                    if employer:
                        # Get all reviews for this creator
                        reviews = Review.objects.filter(recipient=employer)
                        if reviews.exists():
                            total_rating = sum(r.rating for r in reviews)
                            creator_rating = total_rating / reviews.count()
                            creator_reviews_count = reviews.count()
                    
                    # ========== END ADD ==========

                    job_details = {
                        "skills": job.skills if hasattr(job, 'skills') else [],
                        "duration": job.duration if hasattr(job, 'duration') else '',
                        "expertise_level": job.expertise_level if hasattr(job, 'expertise_level') else '',
                        "budget_type": job.budget_type if hasattr(job, 'budget_type') else '',
                        "budget_from": float(job.budget_from) if job.budget_from else None,
                        "budget_to": float(job.budget_to) if job.budget_to else None
                    }

                    start_date = None
                    if contract.start_date:
                        start_date = contract.start_date.isoformat()
                    elif hasattr(contract, 'created_at') and contract.created_at:
                        start_date = contract.created_at.isoformat()

                    budget_amount = float(contract.budget) if contract.budget else None
                    if not budget_amount and job.budget_from:
                        budget_amount = float(job.budget_from)

                    contract_data = {
                        "id": job.id,
                        "contract_id": contract.id,
                        "job_title": job.title if hasattr(job, 'title') else "Untitled Project",
                        "title": job.title if hasattr(job, 'title') else "Untitled Project",
                        "description": job.description if hasattr(job, 'description') else "",
                        "budget": budget_amount,
                        "amount": budget_amount,
                        "budget_type": job.budget_type if hasattr(job, 'budget_type') else 'hourly',
                        "status": contract.status,
                        "start_date": start_date,
                        "work_description": contract.work_description if hasattr(contract, 'work_description') else "",
                        "work_attachment": str(contract.work_attachment) if contract.work_attachment and hasattr(contract, 'work_attachment') else None,
                        "has_contract": job.has_contract,
                        "creator": {
                            "id": employer.id if employer else None,
                            "name": employer.full_name or employer.email if employer else "Client",
                            "email": employer.email if employer else "",
                            "location": employer.location if employer and hasattr(employer, 'location') else "",
                            "city": employer.city if employer and hasattr(employer, 'city') else "",
                            "profile_picture": build_pic_url(employer),
                            # ========== ADD THESE FIELDS ==========
                            "rating": round(creator_rating, 1),
                            "reviews_count": creator_reviews_count,
                            # ========== END ADD ==========
                        },
                        "collaborator": {
                            "id": contract.collaborator.id if contract.collaborator else None,
                            "name": collaborator_name,
                            "email": contract.collaborator.email if contract.collaborator else "",
                            "profile_picture": build_pic_url(contract.collaborator),
                        },
                        "job_details": job_details,
                        "created_at": contract.created_at.isoformat() if hasattr(contract, 'created_at') and contract.created_at else None,
                        "updated_at": contract.updated_at.isoformat() if hasattr(contract, 'updated_at') and contract.updated_at else None
                    }
                    jobs_data.append(contract_data)

                except Exception as e:
                    print(f"Error processing contract {contract.id}: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    continue

            return {
                "user_id": user_id,
                "total_working_jobs": len(jobs_data),
                "contracts": jobs_data
            }

        response = await sync_to_async(get_contracts)()
        print(f"Returning {len(response.get('contracts', []))} jobs for user {user_id}")
        return response

    except Exception as e:
        print(f"Server error in get_working_jobs: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "user_id": user_id,
            "total_working_jobs": 0,
            "contracts": [],
            "error": str(e)
        }
        

# =========================================================
# GET COLLABORATOR CONTRACT STATISTICS
# =========================================================
@router.get("/contract-stats/{collaborator_id}")
async def get_contract_stats(collaborator_id: int):
    """
    Get statistics for contracts where the user is a collaborator
    """
    # Ensure database connection
    await sync_to_async(ensure_db_connection)()
    
    try:
        def get_stats():
            # Verify user exists
            try:
                user = UserData.objects.get(id=collaborator_id)
            except UserData.DoesNotExist:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Get all contracts where this user is the collaborator
            all_contracts = Contract.objects.filter(collaborator_id=collaborator_id)
            
            # Calculate statistics
            stats = {
                'active': all_contracts.filter(status='in_progress').count(),
                'completed': all_contracts.filter(status='completed').count(),
                'canceled': all_contracts.filter(status__in=['cancelled', 'canceled']).count(),
                'total': all_contracts.count()
            }
            
            return stats

        stats = await sync_to_async(get_stats)()
        
        print(f"Contract stats for user {collaborator_id}: {stats}")
        
        return {
            'status': 'success',
            'collaborator_id': collaborator_id,
            **stats
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting contract stats: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# JOB LIKE FUNCTIONALITY
# =========================================================
@router.post("/toggle-like/{user_id}/{job_id}")
async def toggle_job_like(user_id: int, job_id: int):
    """
    Toggle like on a job for a collaborator
    """
    # Ensure database connection
    await sync_to_async(ensure_db_connection)()
   
    try:
        def toggle_like():
            # Get the collaborator profile
            try:
                collaborator = CollaboratorProfile.objects.get(user_id=user_id)
            except CollaboratorProfile.DoesNotExist:
                raise HTTPException(status_code=404, detail="Collaborator profile not found")
           
            # Get the job to get the employer/creator
            try:
                job = JobPost.objects.get(id=job_id)
            except JobPost.DoesNotExist:
                raise HTTPException(status_code=404, detail="Job not found")
           
            # Get current liked jobs (handle both list and None)
            liked_jobs = collaborator.liked_jobs
            if liked_jobs is None:
                liked_jobs = []
           
            # Toggle the like
            if job_id in liked_jobs:
                liked_jobs.remove(job_id)
                action = 'unliked'
                message = 'Job unliked successfully'
            else:
                liked_jobs.append(job_id)
                action = 'liked'
                message = 'Job liked successfully'
               
                # ⭐⭐⭐ ADD NOTIFICATION WHEN JOB IS LIKED ⭐⭐⭐
                from fastapi_app.services.notification_service import create_job_like_notification
               
                # Get the collaborator user and job employer
                collaborator_user = UserData.objects.get(id=user_id)
                job_creator = job.employer
               
                # Send notification to job creator
                create_job_like_notification(collaborator_user, job_creator, job)
                print(f"✅ Like notification sent for job {job_id} by user {user_id}")
           
            # Save back to database
            collaborator.liked_jobs = liked_jobs
            collaborator.save()
           
            return {
                'status': 'success',
                'action': action,
                'message': message,
                'liked_jobs': liked_jobs,
                'user_id': user_id,
                'job_id': job_id
            }
 
        result = await sync_to_async(toggle_like)()
        return result
       
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error toggling job like: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/liked-jobs/{collaborator_id}")
async def get_liked_jobs(collaborator_id: int):
    """
    Get all jobs liked by a collaborator
    """
    # Ensure database connection
    await sync_to_async(ensure_db_connection)()
    
    try:
        def get_likes():
            # Get the collaborator profile
            try:
                collaborator = CollaboratorProfile.objects.get(user_id=collaborator_id)
            except CollaboratorProfile.DoesNotExist:
                return {
                    'status': 'error',
                    'message': 'Collaborator profile not found',
                    'liked_jobs': []
                }
            
            # Get liked jobs
            liked_jobs = collaborator.liked_jobs or []
            
            return {
                'status': 'success',
                'collaborator_id': collaborator_id,
                'liked_jobs': liked_jobs,
                'total_likes': len(liked_jobs)
            }

        result = await sync_to_async(get_likes)()
        return result
        
    except Exception as e:
        print(f"Error getting liked jobs: {str(e)}")
        return {
            'status': 'error',
            'message': str(e),
            'liked_jobs': []
        }


# =========================================================
# GET JOB BY ID (for invitation details)
# =========================================================
@router.get("/{job_id}")
async def get_job_by_id(job_id: int):
    """
    Get job details by ID
    """
    # Ensure database connection
    await sync_to_async(ensure_db_connection)()
    
    try:
        def get_job_details():
            job = JobPost.objects.get(id=job_id)
            
            # Get employer info
            employer = job.employer
            employer_name = employer.full_name or employer.email if employer else "Unknown"
            employer_profile_pic = None
            
            if employer and hasattr(employer, 'profile_picture') and employer.profile_picture:
                try:
                    employer_profile_pic = employer.profile_picture.url if hasattr(employer.profile_picture, 'url') else str(employer.profile_picture)
                except:
                    pass
            
            # Get country code for location
            country_code = None
            if employer and employer.location:
                try:
                    country_code = get_country_code(employer.location)
                except:
                    pass
            
            return {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "skills": job.skills if isinstance(job.skills, list) else (job.skills.split(',') if job.skills else []),
                "duration": job.duration,
                "timeline": job.timeline,
                "expertise_level": job.expertise_level,
                "budget_type": job.budget_type,
                "budget_from": float(job.budget_from) if job.budget_from else None,
                "budget_to": float(job.budget_to) if job.budget_to else None,
                "status": job.status,
                "attachments": job.attachments,
                "created_at": job.created_at.isoformat() if job.created_at else None,
                "has_contract": job.has_contract,
                "employer": {
                    "id": employer.id if employer else None,
                    "name": employer_name,
                    "email": employer.email if employer else "",
                    "location": employer.location if employer else "",
                    "state": employer.state if employer else "",
                    "country_code": country_code,
                    "profile_picture": employer_profile_pic
                }
            }

        job_data = await sync_to_async(get_job_details)()
        return job_data
        
    except JobPost.DoesNotExist:
        raise HTTPException(status_code=404, detail="Job not found")
    except Exception as e:
        print(f"Error fetching job: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# ✅ NEW: GET JOBS WITHOUT CONTRACTS (for inviting collaborators)
# =========================================================
@router.get("/available-for-invite/{employer_id}")
async def get_available_jobs_for_invite(employer_id: int):
    """
    Get all posted jobs for an employer that don't have contracts yet.
    These are the jobs that can be used to invite collaborators.
    """
    # Ensure database connection
    await sync_to_async(ensure_db_connection)()
    
    try:
        employer = await sync_to_async(UserData.objects.get)(id=employer_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Employer not found")
    
    def get_jobs():
        # Get posted/active jobs without contracts
        available_jobs = JobPost.objects.filter(
            employer=employer,
            status__in=["posted", "active"],
            has_contract=False
        ).order_by("-created_at")
        
        result = []
        for job in available_jobs:
            result.append({
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "skills": job.skills,
                "duration": job.duration,
                "expertise_level": job.expertise_level,
                "budget_type": job.budget_type,
                "budget_from": float(job.budget_from) if job.budget_from else None,
                "budget_to": float(job.budget_to) if job.budget_to else None,
                "created_at": job.created_at.isoformat() if job.created_at else None,
                "has_contract": job.has_contract
            })
        
        return result

    jobs = await sync_to_async(get_jobs)()
    
    return {
        "employer_id": employer_id,
        "count": len(jobs),
        "jobs": jobs
    }
    