
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



# fastapi_app/routes/jobs.py
import fastapi_app.django_setup
from fastapi import APIRouter, Form, UploadFile, File, HTTPException, Request, Query
from fastapi.responses import FileResponse
import os
import re
import mimetypes  
from django.db import transaction
import pycountry
import asyncio
from concurrent.futures import ThreadPoolExecutor
from asgiref.sync import sync_to_async
from creator_app.models import Invitation, Notification, track_file_upload, track_file_deletion
from django.conf import settings
from creator_app.models import CollaboratorProfile, JobPost, UserData, Contract, Proposal, Review
from fastapi_app.services.notification_service import create_notification

# ✅ DATABASE CONNECTION MANAGEMENT
from fastapi_app.routes.dbconnection import ensure_db_connection, check_db_connection

# 🔒 PLAN GUARD
from fastapi_app.routes.plan_guard import check_job_limit, check_storage_limit

# ============================================================
# S3 STORAGE IMPORTS
# ============================================================
from fastapi_app.routes.storage import (
    USE_S3,
    save_upload_file,
    build_full_url,
    delete_file,
    generate_presigned_url,
    ExpiryPreset,
    StoragePath,
    get_storage_path,
    get_s3_key_from_path,
)

router = APIRouter(prefix="/jobs", tags=["Jobs"])
BASE_DIR = settings.BASE_DIR

# Create a thread pool for sync operations
thread_pool = ThreadPoolExecutor(max_workers=10)


# ============================================================
# S3 HELPER FUNCTIONS FOR JOB ATTACHMENTS
# ============================================================
async def save_job_attachment_s3(file: UploadFile, job_id: int, filename: str) -> str:
    """
    Save job attachment to S3 or local storage
    S3 Folder Used: job_attachments/
    """
    # Clean filename
    safe_filename = filename.replace("..", "").replace("/", "").replace("\\", "")
    # Create unique filename
    name, ext = os.path.splitext(safe_filename)
    unique_filename = f"{job_id}_{int(asyncio.get_event_loop().time())}_{name}{ext}"
    
    if USE_S3:
        # S3 path
        s3_key = f"job_attachments/{unique_filename}"
        await save_upload_file(file, s3_key)
        return s3_key
    else:
        # Local storage
        upload_dir = os.path.join(BASE_DIR, "fastapi_app", "media", "job_attachments")
        os.makedirs(upload_dir, exist_ok=True)
        save_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        await file.seek(0)
        content = await file.read()
        
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(thread_pool, lambda: open(save_path, "wb").write(content))
        
        # Return relative path
        return f"job_attachments/{unique_filename}"


async def delete_job_attachment_s3(file_path: str, user: UserData = None) -> bool:
    """
    Delete job attachment from S3 or local storage
    """
    if USE_S3:
        # For S3, extract the key
        s3_key = get_s3_key_from_path(file_path)
        return delete_file(s3_key)
    else:
        # Local storage
        full_path = os.path.join(BASE_DIR, "fastapi_app", "media", file_path)
        if os.path.exists(full_path):
            if user:
                file_size = os.path.getsize(full_path)
                await sync_to_async(track_file_deletion)(user, file_size)
            os.remove(full_path)
            return True
        return False


def get_job_attachment_url(request: Request, file_path: str) -> str:
    """
    Get URL for job attachment with S3 support
    """
    if not file_path:
        return None
    
    return build_full_url(
        request=request,
        path=file_path,
        file_type="job"
    )


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
# JOB SEARCH SUGGESTIONS (for autocomplete)
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
    print(f"🔍 Search suggestions called with search='{search}', limit={limit}")
    
    await sync_to_async(ensure_db_connection)()
    
    if not search or not search.strip():
        return []
    
    search_query = search.strip()
    
    if len(search_query) < 2:
        return []
    
    try:
        def get_suggestions():
            from django.db.models import Q
            
            print(f"🔎 Searching for jobs containing: {search_query}")
            
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
            
            suggestions = []
            for job in jobs:
                if job and job.strip() and job not in suggestions:
                    suggestions.append(job.strip())
            
            print(f"✅ Found {len(suggestions)} suggestions: {suggestions}")
            return suggestions
        
        suggestions = await sync_to_async(get_suggestions)()
        return suggestions
        
    except Exception as e:
        print(f"❌ Error fetching search suggestions: {str(e)}")
        import traceback
        traceback.print_exc()
        return []


# =========================================================
# CREATE JOB (DRAFT / POSTED) - UPDATED WITH S3
# =========================================================
@router.post("/create/{employer_id}")
async def create_job(
    request: Request,
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
    """
    Create a new job with S3 support for attachments
    S3 Folder Used: job_attachments/
    File Type: job
    """
    await sync_to_async(ensure_db_connection)()
    
    try:
        employer = await sync_to_async(UserData.objects.get)(id=employer_id)

        # 🔒 PLAN LIMIT CHECK
        await sync_to_async(check_job_limit)(employer)

        # Parse skills
        skills_list = [s.strip() for s in skills.split(",") if s.strip()]

        # Auto timeline
        auto_timeline = calculate_timeline(duration)

        # Create job
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

        # Save attachments using S3
        if attachments:
            uploaded_files = []
            total_new_bytes = 0
            
            # Calculate total size for storage limit
            for file in attachments:
                await file.seek(0)
                content = await file.read()
                total_new_bytes += len(content)
                await file.seek(0)
            
            if total_new_bytes > 0:
                await sync_to_async(check_storage_limit)(employer, total_new_bytes)

            for file in attachments:
                if file.filename:
                    # Save attachment using S3-aware function
                    saved_path = await save_job_attachment_s3(
                        file, 
                        job.id, 
                        file.filename
                    )
                    uploaded_files.append(saved_path)
                    
                    # Track file upload for storage limits (only for local)
                    if not USE_S3:
                        full_path = os.path.join(BASE_DIR, "fastapi_app", "media", saved_path)
                        if os.path.exists(full_path):
                            file_size = os.path.getsize(full_path)
                            await sync_to_async(track_file_upload)(employer, full_path, file_size)

            job.attachments = uploaded_files
            await sync_to_async(job.save)()

        return {
            "message": "Job created successfully", 
            "job_id": job.id, 
            "has_contract": job.has_contract,
            "attachments": uploaded_files if attachments else [],
            "storage_mode": "s3" if USE_S3 else "local"
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        print("JOB CREATE ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# GET JOBS BY EMPLOYER WITH STATUS FILTER (UPDATED WITH S3)
# =========================================================
@router.get("/my-jobs/{employer_id}")
async def get_my_jobs(request: Request, employer_id: int, status: str = "posted"):
    """
    Get jobs by employer with S3 support for attachments
    """
    await sync_to_async(ensure_db_connection)()

    try:
        # ✅ FIX: Use sync_to_async for all database operations
        employer = await sync_to_async(UserData.objects.get)(id=employer_id)

        status = status.lower()
        if status not in ["draft", "posted"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status. Allowed values: draft, posted"
            )

        # ✅ FIX: Define a synchronous function and call it with sync_to_async
        def get_jobs_data():
            jobs = JobPost.objects.filter(
                employer_id=employer_id,
                status__iexact=status
            ).order_by("-id")

            data = []
            for job in jobs:
                # Get location from CreatorProfile
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

                proposals_count = Proposal.objects.filter(job_id=job.id).count()
                hired_count = Contract.objects.filter(job_id=job.id, status__in=["in_progress", "completed", "awaiting"]).count()
                has_completed_contract = Contract.objects.filter(job_id=job.id, status="completed").exists()
                
                reviews = Review.objects.filter(recipient=employer)
                review_count = reviews.count()
                
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

            return data

        # ✅ FIX: Get jobs data using sync_to_async
        jobs_data = await sync_to_async(get_jobs_data)()
        
        # Generate attachment URLs (this part can stay outside since it's async-safe)
        for job_data in jobs_data:
            # Get the actual job object to access attachments
            job = await sync_to_async(JobPost.objects.get)(id=job_data["id"])
            attachment_urls = []
            if job.attachments:
                for att in job.attachments:
                    url = get_job_attachment_url(request, att)
                    if url:
                        attachment_urls.append(url)
            job_data["attachments"] = attachment_urls
            job_data["attachments_paths"] = job.attachments
            job_data["storage_mode"] = "s3" if USE_S3 else "local"

        return {
            "employer_id": employer_id,
            "status": status,
            "count": len(jobs_data),
            "jobs": jobs_data,
            "storage_mode": "s3" if USE_S3 else "local"
        }

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Employer not found")
    except Exception as e:
        print(f"Error in get_my_jobs: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# EDIT JOB (UPDATED WITH S3)
# =========================================================
@router.put("/edit/{job_id}")
async def edit_job(
    request: Request,
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
    """
    Edit job with S3 support for attachments
    S3 Folder Used: job_attachments/
    File Type: job
    """
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

    # Handle attachments with S3
    if attachments:
        # Calculate total size for storage limit
        total_new_bytes = 0
        for file in attachments:
            await file.seek(0)
            content = await file.read()
            total_new_bytes += len(content)
            await file.seek(0)
        
        if total_new_bytes > 0:
            await sync_to_async(check_storage_limit)(job.employer, total_new_bytes)

        # Delete old attachments
        if job.attachments:
            for old_path in job.attachments:
                await delete_job_attachment_s3(old_path, job.employer)

        # Save new attachments
        uploaded_files = []
        for file in attachments:
            if file.filename:
                saved_path = await save_job_attachment_s3(
                    file, 
                    job.id, 
                    file.filename
                )
                uploaded_files.append(saved_path)
                
                if not USE_S3:
                    full_path = os.path.join(BASE_DIR, "fastapi_app", "media", saved_path)
                    if os.path.exists(full_path):
                        file_size = os.path.getsize(full_path)
                        await sync_to_async(track_file_upload)(job.employer, full_path, file_size)

        job.attachments = uploaded_files

    await sync_to_async(job.save)()
    
    return {
        "message": "Job updated successfully",
        "job_id": job.id,
        "status": job.status,
        "has_contract": job.has_contract,
        "storage_mode": "s3" if USE_S3 else "local"
    }


# =========================================================
# DELETE JOB (UPDATED WITH S3)
# =========================================================
@router.delete("/{job_id}/delete")
async def delete_job(job_id: int):
    """
    Delete job with S3 support for attachments
    """
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

        # Collect users to notify
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

        # Notify creator
        create_notification(
            user=creator,
            notification_type="system",
            title="Job deleted successfully",
            message=f'Your job "{job.title}" has been deleted.',
            job=job,
            url="/jobpost"
        )

        # Notify proposal submitters
        for proposal in proposals:
            collaborator = proposal.freelancer
            if not collaborator or collaborator.id in notified_users:
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

        # Notify invited collaborators
        for invitation in invitations:
            collaborator = invitation.receiver
            if not collaborator or collaborator.id in notified_users:
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

        # Notify contract collaborators
        for contract in contracts:
            collaborator = contract.collaborator
            if not collaborator or collaborator.id in notified_users:
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

        # Delete job attachments from S3 or local
        if job.attachments:
            for file_path in job.attachments:
                try:
                    # Use S3-aware deletion
                    if USE_S3:
                        s3_key = get_s3_key_from_path(file_path)
                        delete_file(s3_key)
                    else:
                        full_path = os.path.join(BASE_DIR, "fastapi_app", "media", file_path)
                        if os.path.exists(full_path):
                            os.remove(full_path)
                except Exception as e:
                    print(f"Attachment delete error: {e}")

        # Delete related records
        Proposal.objects.filter(job=job).delete()
        Invitation.objects.filter(job=job).delete()
        Contract.objects.filter(job=job).delete()

        # Delete job
        job.delete()

    await sync_to_async(perform_delete)()

    return {
        "success": True,
        "message": "Job and all related data deleted successfully",
        "job_id": job_id,
        "storage_mode": "s3" if USE_S3 else "local"
    }


# =========================================================
# LIST ALL JOBS (ADMIN / PUBLIC) - UPDATED WITH S3
# =========================================================
@router.get("/all")
async def list_all_jobs(request: Request, status: str | None = None):
    """
    Get all jobs with S3 support for attachments
    """
    await sync_to_async(ensure_db_connection)()
    
    try:
        def get_jobs():
            jobs = JobPost.objects.filter(status__in=["posted", "active"]).order_by("-id")

            if status:
                status_lower = status.lower()
                if status_lower not in ["draft", "posted", "active"]:
                    return []
                jobs = jobs.filter(status__iexact=status_lower)

            data = []
            for job in jobs:
                employer = job.employer
                
                reviews = Review.objects.filter(recipient=employer)
                review_count = reviews.count()
                if review_count > 0:
                    total_rating = sum(r.rating for r in reviews)
                    avg_rating = round(total_rating / review_count, 1)
                else:
                    avg_rating = 0
                
                # Get location from CreatorProfile
                employer_location = None
                employer_state = None
                employer_country_code = None
                
                try:
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
                
                employer_name = "Client"
                if employer:
                    if employer.full_name:
                        employer_name = employer.full_name
                    elif employer.email:
                        employer_name = employer.email.split('@')[0]
                
                # Generate attachment URLs with S3 support
                attachment_urls = []
                if job.attachments:
                    for att in job.attachments:
                        url = get_job_attachment_url(request, att)
                        if url:
                            attachment_urls.append(url)
                
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
                    "attachments": attachment_urls,  # Now returns URLs
                    "attachments_paths": job.attachments,  # Still return paths
                    "created_at": job.created_at.isoformat() if job.created_at else None,
                    "has_contract": job.has_contract,
                    "storage_mode": "s3" if USE_S3 else "local"
                })

            return data

        jobs_data = await sync_to_async(get_jobs)()
        return jobs_data

    except Exception as e:
        print(f"Error in list_all_jobs: {str(e)}")
        import traceback
        traceback.print_exc()
        return []


# =========================================================
# LIST ALL JOBS WITH PAGINATION (UPDATED WITH S3)
# =========================================================
@router.get("/all-paginated")
async def list_all_jobs_paginated(
    request: Request,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status: str | None = None
):
    """
    Get all jobs with pagination and S3 support
    """
    await sync_to_async(ensure_db_connection)()
    
    try:
        def get_jobs():
            jobs = JobPost.objects.filter(status__in=["posted", "active"]).order_by("-id")
            
            if status:
                status_lower = status.lower()
                jobs = jobs.filter(status__iexact=status_lower)
            
            total = jobs.count()
            
            start = (page - 1) * limit
            end = start + limit
            paginated_jobs = jobs[start:end]
            
            data = []
            for job in paginated_jobs:
                employer = job.employer
                
                reviews = Review.objects.filter(recipient=employer)
                review_count = reviews.count()
                avg_rating = round(sum(r.rating for r in reviews) / review_count, 1) if review_count > 0 else 0
                
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
                
                # Generate attachment URLs
                attachment_urls = []
                if job.attachments:
                    for att in job.attachments:
                        url = get_job_attachment_url(request, att)
                        if url:
                            attachment_urls.append(url)
                
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
                    "attachments": attachment_urls,
                    "created_at": job.created_at.isoformat() if job.created_at else None,
                    "storage_mode": "s3" if USE_S3 else "local"
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
# GET JOBS USER IS WORKING ON (UPDATED WITH S3)
# =========================================================
@router.get("/working/{user_id}")
async def get_working_jobs(
    request: Request,
    user_id: int
):
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

                from fastapi_app.routes.storage import build_full_url

                return build_full_url(
                    request=request,
                    path=pic.name if hasattr(pic, "name") else str(pic),
                    file_type="profile"
                )

            except Exception:
                return None

        def get_contracts():
            try:
                UserData.objects.get(id=user_id)

            except UserData.DoesNotExist:
                return {
                    "user_id": user_id,
                    "total_working_jobs": 0,
                    "contracts": [],
                    "error": "User not found"
                }

            contracts = (
                Contract.objects.filter(
                    collaborator_id=user_id,
                    status="in_progress"
                )
                .select_related(
                    "job",
                    "job__employer",
                    "creator",
                    "collaborator"
                )
                .order_by("-updated_at")
            )

            print(
                f"Found {contracts.count()} "
                f"in_progress contracts for user {user_id}"
            )

            jobs_data = []

            for contract in contracts:

                try:
                    job = contract.job

                    if not job:
                        print(
                            f"Contract {contract.id} "
                            f"has no associated job"
                        )
                        continue

                    employer = job.employer or contract.creator

                    creator_name = None
                    if contract.creator:
                        creator_name = (
                            contract.creator.full_name
                            or contract.creator.email
                        )

                    collaborator_name = None
                    if contract.collaborator:
                        collaborator_name = (
                            contract.collaborator.full_name
                            or contract.collaborator.email
                        )

                    # ======================================
                    # Creator Rating
                    # ======================================

                    creator_rating = 0
                    creator_reviews_count = 0

                    if employer:
                        reviews = Review.objects.filter(
                            recipient=employer
                        )

                        if reviews.exists():
                            total_rating = sum(
                                r.rating for r in reviews
                            )

                            creator_rating = (
                                total_rating / reviews.count()
                            )

                            creator_reviews_count = reviews.count()

                    # ======================================
                    # Creator Profile Location
                    # ======================================

                    creator_location = ""
                    creator_state = ""

                    if employer:
                        try:
                            from creator_app.models import CreatorProfile

                            creator_profile = (
                                CreatorProfile.objects.filter(
                                    user=employer
                                ).first()
                            )

                            if creator_profile:
                                creator_location = (
                                    creator_profile.location or ""
                                )

                                creator_state = (
                                    creator_profile.state or ""
                                )

                        except Exception as e:
                            print(
                                f"Could not fetch creator "
                                f"profile location: {e}"
                            )

                    # ======================================
                    # Job Attachments
                    # ======================================

                    attachment_urls = []

                    if (
                        hasattr(job, "attachments")
                        and job.attachments
                    ):
                        for att in job.attachments:
                            try:
                                url = get_job_attachment_url(
                                    request,
                                    att
                                )

                                if url:
                                    attachment_urls.append(url)

                            except Exception as e:
                                print(
                                    f"Attachment URL error: {e}"
                                )

                    # ======================================
                    # Job Details
                    # ======================================

                    job_details = {
                        "skills": (
                            job.skills
                            if hasattr(job, "skills")
                            else []
                        ),
                        "duration": (
                            job.duration
                            if hasattr(job, "duration")
                            else ""
                        ),
                        "expertise_level": (
                            job.expertise_level
                            if hasattr(job, "expertise_level")
                            else ""
                        ),
                        "budget_type": (
                            job.budget_type
                            if hasattr(job, "budget_type")
                            else ""
                        ),
                        "budget_from": (
                            float(job.budget_from)
                            if job.budget_from
                            else None
                        ),
                        "budget_to": (
                            float(job.budget_to)
                            if job.budget_to
                            else None
                        ),
                        "attachments": attachment_urls,
                    }

                    # ======================================
                    # Dates
                    # ======================================

                    start_date = None

                    if contract.start_date:
                        start_date = (
                            contract.start_date.isoformat()
                        )

                    elif (
                        hasattr(contract, "created_at")
                        and contract.created_at
                    ):
                        start_date = (
                            contract.created_at.isoformat()
                        )

                    end_date = None

                    if (
                        hasattr(contract, "end_date")
                        and contract.end_date
                    ):
                        end_date = (
                            contract.end_date.isoformat()
                        )

                    # ======================================
                    # Budget
                    # ======================================

                    budget_amount = (
                        float(contract.budget)
                        if contract.budget
                        else None
                    )

                    if (
                        not budget_amount
                        and job.budget_from
                    ):
                        budget_amount = float(
                            job.budget_from
                        )

                    # ======================================
                    # Contract Data
                    # ======================================

                    contract_data = {
                        "id": job.id,
                        "contract_id": contract.id,

                        "job_title": (
                            job.title
                            if hasattr(job, "title")
                            else "Untitled Project"
                        ),

                        "title": (
                            job.title
                            if hasattr(job, "title")
                            else "Untitled Project"
                        ),

                        "description": (
                            job.description
                            if hasattr(job, "description")
                            else ""
                        ),

                        "budget": budget_amount,
                        "amount": budget_amount,

                        "budget_type": (
                            job.budget_type
                            if hasattr(job, "budget_type")
                            else "hourly"
                        ),

                        "status": contract.status,

                        "start_date": start_date,
                        "end_date": end_date,

                        "work_description": (
                            contract.work_description
                            if hasattr(
                                contract,
                                "work_description"
                            )
                            else ""
                        ),

                        "work_attachment": (
                            str(contract.work_attachment)
                            if (
                                hasattr(
                                    contract,
                                    "work_attachment"
                                )
                                and contract.work_attachment
                            )
                            else None
                        ),

                        "has_contract": job.has_contract,

                        "creator": {
                            "id": (
                                employer.id
                                if employer
                                else None
                            ),
                            "name": (
                                employer.full_name
                                or employer.email
                                if employer
                                else "Client"
                            ),
                            "email": (
                                employer.email
                                if employer
                                else ""
                            ),
                            "location": creator_location,
                            "state": creator_state,
                            "profile_picture": build_pic_url(
                                employer
                            ),
                            "rating": round(
                                creator_rating,
                                1
                            ),
                            "reviews_count": (
                                creator_reviews_count
                            ),
                        },

                        "collaborator": {
                            "id": (
                                contract.collaborator.id
                                if contract.collaborator
                                else None
                            ),
                            "name": collaborator_name,
                            "email": (
                                contract.collaborator.email
                                if contract.collaborator
                                else ""
                            ),
                            "profile_picture": build_pic_url(
                                contract.collaborator
                            ),
                        },

                        "job_details": job_details,

                        "created_at": (
                            contract.created_at.isoformat()
                            if (
                                hasattr(
                                    contract,
                                    "created_at"
                                )
                                and contract.created_at
                            )
                            else None
                        ),

                        "updated_at": (
                            contract.updated_at.isoformat()
                            if (
                                hasattr(
                                    contract,
                                    "updated_at"
                                )
                                and contract.updated_at
                            )
                            else None
                        ),

                        "storage_mode": (
                            "s3"
                            if USE_S3
                            else "local"
                        ),
                    }

                    jobs_data.append(contract_data)

                except Exception as e:
                    print(
                        f"Error processing contract "
                        f"{contract.id}: {e}"
                    )

                    import traceback
                    traceback.print_exc()
                    continue

            return {
                "user_id": user_id,
                "total_working_jobs": len(jobs_data),
                "contracts": jobs_data,
            }

        response = await sync_to_async(
            get_contracts
        )()

        print(
            f"Returning "
            f"{len(response.get('contracts', []))} "
            f"jobs for user {user_id}"
        )

        return response

    except Exception as e:
        print(
            f"Server error in "
            f"get_working_jobs: {e}"
        )

        import traceback
        traceback.print_exc()

        return {
            "user_id": user_id,
            "total_working_jobs": 0,
            "contracts": [],
            "error": str(e),
        }


# =========================================================
# GET COLLABORATOR CONTRACT STATISTICS
# =========================================================
@router.get("/contract-stats/{collaborator_id}")
async def get_contract_stats(collaborator_id: int):
    """
    Get statistics for contracts where the user is a collaborator
    """
    await sync_to_async(ensure_db_connection)()
    
    try:
        def get_stats():
            try:
                user = UserData.objects.get(id=collaborator_id)
            except UserData.DoesNotExist:
                raise HTTPException(status_code=404, detail="User not found")
            
            all_contracts = Contract.objects.filter(collaborator_id=collaborator_id)
            
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
    await sync_to_async(ensure_db_connection)()
   
    try:
        def toggle_like():
            try:
                collaborator = CollaboratorProfile.objects.get(user_id=user_id)
            except CollaboratorProfile.DoesNotExist:
                raise HTTPException(status_code=404, detail="Collaborator profile not found")
           
            try:
                job = JobPost.objects.get(id=job_id)
            except JobPost.DoesNotExist:
                raise HTTPException(status_code=404, detail="Job not found")
           
            liked_jobs = collaborator.liked_jobs
            if liked_jobs is None:
                liked_jobs = []
           
            if job_id in liked_jobs:
                liked_jobs.remove(job_id)
                action = 'unliked'
                message = 'Job unliked successfully'
            else:
                liked_jobs.append(job_id)
                action = 'liked'
                message = 'Job liked successfully'
               
                from fastapi_app.services.notification_service import create_job_like_notification
               
                collaborator_user = UserData.objects.get(id=user_id)
                job_creator = job.employer
               
                create_job_like_notification(collaborator_user, job_creator, job)
                print(f"✅ Like notification sent for job {job_id} by user {user_id}")
           
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
    await sync_to_async(ensure_db_connection)()
    
    try:
        def get_likes():
            try:
                collaborator = CollaboratorProfile.objects.get(user_id=collaborator_id)
            except CollaboratorProfile.DoesNotExist:
                return {
                    'status': 'error',
                    'message': 'Collaborator profile not found',
                    'liked_jobs': []
                }
            
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
# GET JOB BY ID (UPDATED WITH S3)
# =========================================================
@router.get("/{job_id}")
async def get_job_by_id(request: Request, job_id: int):
    """
    Get job details by ID with S3 support for attachments
    """
    await sync_to_async(ensure_db_connection)()
    
    try:
        def get_job_details():
            job = JobPost.objects.get(id=job_id)
            
            employer = job.employer
            employer_name = employer.full_name or employer.email if employer else "Unknown"
            employer_profile_pic = None
            
            if employer and hasattr(employer, 'profile_picture') and employer.profile_picture:
                try:
                    from fastapi_app.routes.storage import build_full_url
                    employer_profile_pic = build_full_url(
                        request=request,
                        path=employer.profile_picture.name if hasattr(employer.profile_picture, 'name') else str(employer.profile_picture),
                        file_type="profile"
                    )
                except:
                    pass
            
            country_code = None
            if employer and employer.location:
                try:
                    country_code = get_country_code(employer.location)
                except:
                    pass
            
            # Generate attachment URLs with S3 support
            attachment_urls = []
            if job.attachments:
                for att in job.attachments:
                    url = get_job_attachment_url(request, att)
                    if url:
                        attachment_urls.append(url)
            
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
                "attachments": attachment_urls,  # Now returns URLs
                "attachments_paths": job.attachments,  # Still return paths
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
                },
                "storage_mode": "s3" if USE_S3 else "local"
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
# GET JOBS WITHOUT CONTRACTS (for inviting collaborators)
# =========================================================
@router.get("/available-for-invite/{employer_id}")
async def get_available_jobs_for_invite(request: Request, employer_id: int):
    """
    Get all posted jobs for an employer that don't have contracts yet.
    These are the jobs that can be used to invite collaborators.
    """
    await sync_to_async(ensure_db_connection)()
    
    try:
        employer = await sync_to_async(UserData.objects.get)(id=employer_id)
    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="Employer not found")
    
    def get_jobs():
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
        "jobs": jobs,
        "storage_mode": "s3" if USE_S3 else "local"
    }


# =========================================================
# DOWNLOAD JOB ATTACHMENT (UPDATED WITH S3)
# =========================================================
@router.get("/download-attachment/{job_id}/{filename}")
async def download_job_attachment(job_id: int, filename: str):
    """
    Download job attachment with S3 support
    S3 Folder Used: job_attachments/
    File Type: job
    """
    try:
        ensure_db_connection()

        job = JobPost.objects.get(id=job_id)

        if not job.attachments:
            raise HTTPException(status_code=404, detail="No attachments found for this job")

        # Find the attachment
        attachment_path = None
        for att in job.attachments:
            if filename == att or att.endswith(filename) or filename in att:
                attachment_path = att
                break

        if not attachment_path:
            for att in job.attachments:
                if att.split('/')[-1] == filename:
                    attachment_path = att
                    break

        if not attachment_path:
            raise HTTPException(status_code=404, detail=f"Attachment '{filename}' not found")

        if USE_S3:
            # For S3, generate a presigned download URL
            s3_key = get_s3_key_from_path(attachment_path)
            download_url = generate_presigned_url(
                file_path=s3_key,
                expires_in=ExpiryPreset.DAILY,
                force_download=True
            )
            
            if download_url:
                return {
                    "download_url": download_url,
                    "filename": filename,
                    "storage_mode": "s3"
                }
            else:
                raise HTTPException(status_code=404, detail="File not found in S3")
        else:
            # Local storage download
            full_path = os.path.join(BASE_DIR, "fastapi_app", "media", attachment_path)

            if not os.path.exists(full_path):
                alt_path = os.path.join(BASE_DIR, attachment_path)
                if os.path.exists(alt_path):
                    full_path = alt_path
                else:
                    raise HTTPException(status_code=404, detail="File not found on server")

            original_filename = os.path.basename(attachment_path)
            parts = original_filename.split('_', 2)
            if len(parts) >= 3 and parts[0].isdigit():
                original_filename = parts[2]

            mime_type, _ = mimetypes.guess_type(original_filename)
            if not mime_type:
                mime_type = 'application/octet-stream'

            return FileResponse(
                full_path,
                media_type=mime_type,
                filename=original_filename,
                headers={
                    "Content-Disposition": f"attachment; filename*=UTF-8''{original_filename}"
                }
            )

    except JobPost.DoesNotExist:
        raise HTTPException(status_code=404, detail="Job not found")
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"❌ Download attachment error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))