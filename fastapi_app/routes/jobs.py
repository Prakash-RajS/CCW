import fastapi_app.django_setup

from fastapi import APIRouter, Form, UploadFile, File, HTTPException
import os
import re

from django.conf import settings
from creator_app.models import JobPost, UserData

# 🔒 PLAN GUARD
from fastapi_app.routes.plan_guard import check_job_limit


router = APIRouter(prefix="/jobs", tags=["Jobs"])
BASE_DIR = settings.BASE_DIR


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


# =========================================================
# CREATE JOB (DRAFT / POSTED)
# =========================================================
@router.post("/create/{employer_id}")
def create_job(
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
    try:
        employer = UserData.objects.get(id=employer_id)

        # 🔒 PLAN LIMIT CHECK (THIS IS THE ONLY ADDITION)
        check_job_limit(employer)

        # Parse skills
        skills_list = [s.strip() for s in skills.split(",") if s.strip()]

        # Auto timeline
        auto_timeline = calculate_timeline(duration)

        # Create job
        job = JobPost.objects.create(
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

        # Save attachments
        if attachments:
            upload_dir = os.path.join(BASE_DIR, "fastapi_app", "job_attachments")
            os.makedirs(upload_dir, exist_ok=True)

            uploaded_files = []

            for file in attachments:
                save_path = os.path.join(upload_dir, file.filename)
                with open(save_path, "wb") as f:
                    f.write(file.file.read())
                uploaded_files.append(f"job_attachments/{file.filename}")

            job.attachments = uploaded_files
            job.save()

        return {"message": "Job created successfully", "job_id": job.id}

    except UserData.DoesNotExist:
        raise HTTPException(status_code=404, detail="User not found")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# GET JOBS BY EMPLOYER WITH STATUS FILTER
# =========================================================
@router.get("/my-jobs/{employer_id}")
def get_my_jobs(employer_id: int, status: str = "posted"):
    try:
        UserData.objects.get(id=employer_id)

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
            data.append({
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "skills": job.skills,
                "timeline": job.timeline,
                "duration": job.duration,
                "expertise_level": job.expertise_level,
                "budget_type": job.budget_type,
                "budget_from": job.budget_from,
                "budget_to": job.budget_to,
                "status": job.status,
                "attachments": job.attachments,
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
        raise HTTPException(status_code=500, detail=str(e))


# =========================================================
# EDIT JOB
# =========================================================
@router.put("/edit/{job_id}")
def edit_job(
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
    try:
        job = JobPost.objects.get(id=job_id)
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
        upload_dir = os.path.join(BASE_DIR, "fastapi_app", "job_attachments")
        os.makedirs(upload_dir, exist_ok=True)

        uploaded_files = []

        for file in attachments:
            save_path = os.path.join(upload_dir, file.filename)
            with open(save_path, "wb") as f:
                f.write(file.file.read())
            uploaded_files.append(f"job_attachments/{file.filename}")

        job.attachments = uploaded_files

    job.save()

    return {
        "message": "Job updated successfully",
        "job_id": job.id,
        "status": job.status
    }

# =========================================================
# DELETE JOB
# =========================================================
@router.delete("/{job_id}/delete")
def delete_job(job_id: int):
    try:
        job = JobPost.objects.get(id=job_id)
    except JobPost.DoesNotExist:
        raise HTTPException(status_code=404, detail="Job not found")

    job.delete()

    return {
        "message": "Job deleted successfully",
        "job_id": job_id
    }

# =========================================================
# LIST ALL JOBS (ADMIN / PUBLIC)
# =========================================================
@router.get("/all")
def list_all_jobs(status: str | None = None):
    try:
        jobs = JobPost.objects.all().order_by("-id")

        if status:
            status = status.lower()
            if status not in ["draft", "posted"]:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid status. Allowed values: draft, posted"
                )
            jobs = jobs.filter(status__iexact=status)

        data = []
        for job in jobs:
            data.append({
                "id": job.id,
                "employer_id": job.employer_id,
                "title": job.title,
                "description": job.description,
                "skills": job.skills,
                "timeline": job.timeline,
                "duration": job.duration,
                "expertise_level": job.expertise_level,
                "budget_type": job.budget_type,
                "budget_from": job.budget_from,
                "budget_to": job.budget_to,
                "status": job.status,
                "attachments": job.attachments,
            })

        return {
            "count": len(data),
            "jobs": data
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




