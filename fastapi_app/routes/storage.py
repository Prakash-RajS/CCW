# fastapi_app/routes/storage.py
from fastapi import APIRouter, Request
import os
from pathlib import Path
from typing import Optional, Union, Dict, Any, List
import boto3
from fastapi import UploadFile, HTTPException
from dotenv import load_dotenv
import logging
from botocore.config import Config
from botocore.exceptions import ClientError
import mimetypes
from enum import Enum
import uuid
from datetime import datetime

from django.core.cache import cache
import hashlib

logger = logging.getLogger(__name__)
router = APIRouter()
env_path = Path(__file__).parent.parent / '.env'  # Fastapi_app/.env
load_dotenv(dotenv_path=env_path)

# =====================================================
# CONFIG
# =====================================================
USE_S3 = os.getenv("USE_S3", "False").lower() == "true"  # Use environment variable
S3_BUCKET = os.getenv("S3_BUCKET", "ccw-test-s3")
S3_REGION = os.getenv("S3_REGION", "us-east-2")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

if USE_S3:
    if not AWS_ACCESS_KEY_ID or not AWS_SECRET_ACCESS_KEY:
        raise RuntimeError("AWS credentials missing")

    S3_CLIENT = boto3.client(
        "s3",
        region_name=S3_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        config=Config(
            signature_version='s3v4',
            s3={'addressing_style': 'virtual'}
        )
    )
else:
    S3_CLIENT = None

# =====================================================
# URL EXPIRATION PRESETS (in seconds)
# =====================================================
class ExpiryPreset:
    SHORT = 300          # 5 minutes - for temporary previews
    STANDARD = 3600      # 1 hour - default
    EXTENDED = 14400     # 4 hours - for report viewing
    DAILY = 86400        # 24 hours - for patient sharing
    WEEKLY = 604800      # 7 days - for long-term access

# =====================================================
# CCW STORAGE PATHS (from your S3 bucket)
# =====================================================
class StoragePath(str, Enum):
    ADMIN_PROFILES = "admin_profiles"
    CHAT_FILES = "chat_files"
    INVOICES = "invoices"
    JOB_ATTACHMENTS = "job_attachments"
    MESSAGE_FILES = "message_files"
    MILESTONE_SUBMISSIONS = "milestone_submissions"
    PORTFOLIO_UPLOADS_COLLABORATOR = "portfolio_uploads/collaborator"
    PORTFOLIO_UPLOADS_CREATOR = "portfolio_uploads/creator"
    PROFILE_PICS = "profile_pics"
    PROPOSAL_ATTACHMENTS = "proposal_attachments"
    WORK_ASSIGNMENTS = "work_assignments"
    WORK_SUBMISSIONS = "work_submissions"

# =====================================================
# LOCAL STORAGE (FALLBACK FOR DEVELOPMENT)
# =====================================================
BASE_DIR = Path(__file__).parent.parent  # Points to Fastapi_app/
LOCAL_STORAGE = BASE_DIR / "local_storage"
LOCAL_PATHS = {
    StoragePath.ADMIN_PROFILES: LOCAL_STORAGE / "admin_profiles",
    StoragePath.CHAT_FILES: LOCAL_STORAGE / "chat_files",
    StoragePath.INVOICES: LOCAL_STORAGE / "invoices",
    StoragePath.JOB_ATTACHMENTS: LOCAL_STORAGE / "job_attachments",
    StoragePath.MESSAGE_FILES: LOCAL_STORAGE / "message_files",
    StoragePath.MILESTONE_SUBMISSIONS: LOCAL_STORAGE / "milestone_submissions",
    StoragePath.PORTFOLIO_UPLOADS_COLLABORATOR: LOCAL_STORAGE / "portfolio_uploads/collaborator",
    StoragePath.PORTFOLIO_UPLOADS_CREATOR: LOCAL_STORAGE / "portfolio_uploads/creator",
    StoragePath.PROFILE_PICS: LOCAL_STORAGE / "profile_pics",
    StoragePath.PROPOSAL_ATTACHMENTS: LOCAL_STORAGE / "proposal_attachments",
    StoragePath.WORK_ASSIGNMENTS: LOCAL_STORAGE / "work_assignments",
    StoragePath.WORK_SUBMISSIONS: LOCAL_STORAGE / "work_submissions",
}

# Create local directories if not using S3
if not USE_S3:
    for path in LOCAL_PATHS.values():
        path.mkdir(parents=True, exist_ok=True)

# =====================================================
# FILE TYPE DETECTION
# =====================================================
def detect_file_type_from_path(path: str) -> str:
    """
    Detect file type from S3 path or local path
    
    Returns:
    - "profile" -> profile_pics
    - "portfolio" -> portfolio_uploads
    - "portfolio_collaborator" -> portfolio_uploads/collaborator
    - "portfolio_creator" -> portfolio_uploads/creator
    - "job" -> job_attachments
    - "message" -> message_files
    - "invoice" -> invoices
    - "chat" -> chat_files
    - "admin" -> admin_profiles
    - "milestone" -> milestone_submissions
    - "proposal" -> proposal_attachments
    - "work_assignment" -> work_assignments
    - "work_submission" -> work_submissions
    """
    if not path:
        return "unknown"
    
    path_lower = path.lower()
    
    if "profile_pics" in path_lower:
        return "profile"
    elif "portfolio_uploads/collaborator" in path_lower or "portfolio_uploads\\collaborator" in path_lower:
        return "portfolio_collaborator"
    elif "portfolio_uploads/creator" in path_lower or "portfolio_uploads\\creator" in path_lower:
        return "portfolio_creator"
    elif "portfolio_uploads" in path_lower:
        return "portfolio"
    elif "job_attachments" in path_lower:
        return "job"
    elif "message_files" in path_lower:
        return "message"
    elif "invoices" in path_lower:
        return "invoice"
    elif "chat_files" in path_lower:
        return "chat"
    elif "admin_profiles" in path_lower:
        return "admin"
    elif "milestone_submissions" in path_lower:
        return "milestone"
    elif "proposal_attachments" in path_lower:
        return "proposal"
    elif "work_assignments" in path_lower:
        return "work_assignment"
    elif "work_submissions" in path_lower:
        return "work_submission"
    else:
        return "unknown"

def get_folder_for_file_type(file_type: str) -> str:
    """Get the appropriate folder name for a file type"""
    folder_map = {
        "profile": "profile_pics",
        "portfolio": "portfolio_uploads",
        "portfolio_collaborator": "portfolio_uploads/collaborator",
        "portfolio_creator": "portfolio_uploads/creator",
        "job": "job_attachments",
        "message": "message_files",
        "invoice": "invoices",
        "chat": "chat_files",
        "admin": "admin_profiles",
        "milestone": "milestone_submissions",
        "proposal": "proposal_attachments",
        "work_assignment": "work_assignments",
        "work_submission": "work_submissions",
    }
    return folder_map.get(file_type, "unknown")

def get_expiry_for_file_type(file_type: str) -> int:
    """Get expiry time for a file type"""
    expiry_map = {
        "profile": ExpiryPreset.DAILY,
        "portfolio": ExpiryPreset.WEEKLY,
        "portfolio_collaborator": ExpiryPreset.WEEKLY,
        "portfolio_creator": ExpiryPreset.WEEKLY,
        "job": ExpiryPreset.DAILY,
        "message": ExpiryPreset.STANDARD,
        "invoice": ExpiryPreset.WEEKLY,
        "chat": ExpiryPreset.SHORT,
        "admin": ExpiryPreset.STANDARD,
        "milestone": ExpiryPreset.DAILY,
        "proposal": ExpiryPreset.WEEKLY,
        "work_assignment": ExpiryPreset.EXTENDED,
        "work_submission": ExpiryPreset.WEEKLY,
    }
    return expiry_map.get(file_type, ExpiryPreset.STANDARD)

# =====================================================
# PATH HELPERS
# =====================================================
def get_storage_path(storage_type: StoragePath, filename: str) -> str:
    """Generate full path for a file based on storage type"""
    if USE_S3:
        return f"{storage_type.value}/{filename}"
    else:
        return str(LOCAL_PATHS[storage_type] / filename)

def extract_filename_from_path(file_path: str) -> str:
    """Extract filename from full path"""
    return Path(file_path).name

def get_s3_key_from_path(file_path) -> str:
    """
    Extract S3 key from a file path.
    Handles both string and Path objects safely.
    """
    # Convert to string first if needed
    if file_path is None:
        return ""
    
    # If it's a coroutine, return empty string
    import asyncio
    if asyncio.iscoroutine(file_path):
        logger.warning(f"Received coroutine in get_s3_key_from_path: {file_path}")
        return ""
    
    # Convert Path to string
    if isinstance(file_path, Path):
        file_path = str(file_path)
    
    # Ensure it's a string
    if not isinstance(file_path, str):
        try:
            file_path = str(file_path)
        except Exception:
            logger.error(f"Cannot convert {type(file_path)} to string in get_s3_key_from_path")
            return ""
    
    if not file_path:
        return ""
    
    # If it's already a relative path (S3 key) and doesn't contain backslashes
    if not Path(file_path).is_absolute() and '/' in file_path:
        return file_path
    
    # Try to find the relative path from BASE_DIR
    try:
        return str(Path(file_path).relative_to(BASE_DIR))
    except ValueError:
        # If not under BASE_DIR, try LOCAL_STORAGE
        try:
            return str(Path(file_path).relative_to(LOCAL_STORAGE))
        except ValueError:
            # Return just the filename
            return Path(file_path).name


def ensure_string_path(file_path) -> str:
    """
    Ensure file_path is a string, converting from Path or coroutine if needed.
    """
    if file_path is None:
        return ""
    
    # If it's a coroutine, return empty string (shouldn't happen)
    import asyncio
    if asyncio.iscoroutine(file_path):
        logger.warning(f"Received coroutine instead of path: {file_path}")
        return ""
    
    # Convert Path to string
    if isinstance(file_path, Path):
        return str(file_path)
    
    # Already a string
    if isinstance(file_path, str):
        return file_path
    
    # Try to convert to string
    try:
        return str(file_path)
    except Exception:
        logger.error(f"Cannot convert {type(file_path)} to string")
        return ""


# CCW-specific path helpers
def admin_profile_path(filename: str) -> str:
    return get_storage_path(StoragePath.ADMIN_PROFILES, filename)

def chat_file_path(filename: str) -> str:
    return get_storage_path(StoragePath.CHAT_FILES, filename)

def invoice_path(filename: str) -> str:
    return get_storage_path(StoragePath.INVOICES, filename)

def job_attachment_path(filename: str) -> str:
    return get_storage_path(StoragePath.JOB_ATTACHMENTS, filename)

def message_file_path(filename: str) -> str:
    return get_storage_path(StoragePath.MESSAGE_FILES, filename)

def milestone_submission_path(filename: str) -> str:
    return get_storage_path(StoragePath.MILESTONE_SUBMISSIONS, filename)

def portfolio_upload_collaborator_path(filename: str) -> str:
    return get_storage_path(StoragePath.PORTFOLIO_UPLOADS_COLLABORATOR, filename)

def portfolio_upload_creator_path(filename: str) -> str:
    return get_storage_path(StoragePath.PORTFOLIO_UPLOADS_CREATOR, filename)

def profile_pic_path(filename: str) -> str:
    return get_storage_path(StoragePath.PROFILE_PICS, filename)

def proposal_attachment_path(filename: str) -> str:
    return get_storage_path(StoragePath.PROPOSAL_ATTACHMENTS, filename)

def work_assignment_path(filename: str) -> str:
    return get_storage_path(StoragePath.WORK_ASSIGNMENTS, filename)

def work_submission_path(filename: str) -> str:
    return get_storage_path(StoragePath.WORK_SUBMISSIONS, filename)

# =====================================================
# SAVE FILES
# =====================================================
async def save_upload_file(
    file: UploadFile, 
    s3_key: str, 
    content_type: str = None,
    acl: str = "private"
):
    """Save uploaded file to S3 or local storage"""
    if USE_S3:
        await file.seek(0)
        try:
            extra_args = {
                "ACL": acl,
                "ContentType": content_type or file.content_type or "application/octet-stream",
                # ✅ CHANGE: Allow caching for profile pics
                "CacheControl": "public, max-age=86400",
                "ContentDisposition": "inline",
            }

            # Add metadata for tracking
            extra_args["Metadata"] = {
                "uploaded-via": "CCW-FastAPI",
                "file-original-name": file.filename or "unknown",
                "upload-timestamp": datetime.utcnow().isoformat()
            }

            S3_CLIENT.upload_fileobj(
                file.file,
                S3_BUCKET,
                s3_key,
                ExtraArgs=extra_args,
            )
            logger.info(f"File uploaded to S3: {s3_key}")
            return s3_key
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")
    else:
        # Local storage fallback
        file_path = Path(s3_key)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        await file.seek(0)
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        logger.info(f"File saved locally: {file_path}")
        return str(file_path)

async def save_bytes_content(
    content: bytes, 
    s3_key: str, 
    content_type: str = "application/octet-stream",
    acl: str = "private"
):
    """Save bytes content to S3 or local storage"""
    if USE_S3:
        try:
            S3_CLIENT.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=content,
                ACL=acl,
                ContentType=content_type,
                CacheControl="no-store, no-cache, must-revalidate",
                ContentDisposition="inline",
                Metadata={
                    "uploaded-via": "CCW-FastAPI",
                    "upload-timestamp": datetime.utcnow().isoformat()
                }
            )
            logger.info(f"Bytes saved to S3: {s3_key}, size: {len(content)} bytes")
            return s3_key
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    else:
        file_path = Path(s3_key)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(content)
        return str(file_path)

# fastapi_app/routes/storage.py - Add this after save_bytes_content function

def save_bytes_content_sync(
    content: bytes, 
    s3_key: str, 
    content_type: str = "application/octet-stream",
    acl: str = "private"
):
    """
    Save bytes content to S3 or local storage (SYNCHRONOUS VERSION).
    This is used in non-async contexts like invoice generation.
    """
    if USE_S3:
        try:
            S3_CLIENT.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=content,
                ACL=acl,
                ContentType=content_type,
                CacheControl="no-store, no-cache, must-revalidate",
                ContentDisposition="inline",
                Metadata={
                    "uploaded-via": "CCW-FastAPI",
                    "upload-timestamp": datetime.utcnow().isoformat()
                }
            )
            logger.info(f"Bytes saved to S3 (sync): {s3_key}, size: {len(content)} bytes")
            return s3_key
        except Exception as e:
            logger.error(f"Failed to save bytes to S3 (sync): {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    else:
        file_path = Path(s3_key)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        with open(file_path, "wb") as f:
            f.write(content)
        logger.info(f"Bytes saved locally (sync): {file_path}")
        return str(file_path)

# =====================================================
# CCW-SPECIFIC SAVE FUNCTIONS
# =====================================================
async def save_admin_profile(file: UploadFile, admin_id: str) -> str:
    """Save admin profile document"""
    file_extension = Path(file.filename).suffix if file.filename else ".pdf"
    filename = f"admin_{admin_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = admin_profile_path(filename)
    return await save_upload_file(file, s3_key)

async def save_chat_file(file: UploadFile, chat_id: str, user_id: str) -> str:
    """Save chat file attachment"""
    file_extension = Path(file.filename).suffix if file.filename else ".bin"
    filename = f"chat_{chat_id}_user_{user_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = chat_file_path(filename)
    return await save_upload_file(file, s3_key)

async def save_invoice(file: UploadFile, invoice_id: str) -> str:
    """Save invoice document"""
    file_extension = Path(file.filename).suffix if file.filename else ".pdf"
    filename = f"invoice_{invoice_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = invoice_path(filename)
    return await save_upload_file(file, s3_key)

async def save_job_attachment(file: UploadFile, job_id: str, user_id: str) -> str:
    """Save job attachment"""
    file_extension = Path(file.filename).suffix if file.filename else ".bin"
    filename = f"job_{job_id}_user_{user_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = job_attachment_path(filename)
    return await save_upload_file(file, s3_key)

async def save_message_file(file: UploadFile, message_id: str) -> str:
    """Save message file attachment"""
    file_extension = Path(file.filename).suffix if file.filename else ".bin"
    filename = f"message_{message_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = message_file_path(filename)
    return await save_upload_file(file, s3_key)

async def save_milestone_submission(file: UploadFile, milestone_id: str, user_id: str) -> str:
    """Save milestone submission"""
    file_extension = Path(file.filename).suffix if file.filename else ".zip"
    filename = f"milestone_{milestone_id}_user_{user_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = milestone_submission_path(filename)
    return await save_upload_file(file, s3_key)

async def save_portfolio_upload_collaborator(file: UploadFile, user_id: str, portfolio_id: str) -> str:
    """Save collaborator portfolio upload"""
    file_extension = Path(file.filename).suffix if file.filename else ".pdf"
    filename = f"collaborator_{user_id}_portfolio_{portfolio_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = portfolio_upload_collaborator_path(filename)
    return await save_upload_file(file, s3_key)

async def save_portfolio_upload_creator(file: UploadFile, user_id: str, portfolio_id: str) -> str:
    """Save creator portfolio upload"""
    file_extension = Path(file.filename).suffix if file.filename else ".pdf"
    filename = f"creator_{user_id}_portfolio_{portfolio_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = portfolio_upload_creator_path(filename)
    return await save_upload_file(file, s3_key)

async def save_profile_pic(file: UploadFile, user_id: str) -> str:
    """Save profile picture"""
    file_extension = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"user_{user_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = profile_pic_path(filename)
    return await save_upload_file(file, s3_key)

async def save_proposal_attachment(file: UploadFile, proposal_id: str, user_id: str) -> str:
    """Save proposal attachment"""
    file_extension = Path(file.filename).suffix if file.filename else ".pdf"
    filename = f"proposal_{proposal_id}_user_{user_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = proposal_attachment_path(filename)
    return await save_upload_file(file, s3_key)

async def save_work_assignment(file: UploadFile, assignment_id: str) -> str:
    """Save work assignment document"""
    file_extension = Path(file.filename).suffix if file.filename else ".pdf"
    filename = f"assignment_{assignment_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = work_assignment_path(filename)
    return await save_upload_file(file, s3_key)

async def save_work_submission(file: UploadFile, submission_id: str, user_id: str) -> str:
    """Save work submission"""
    file_extension = Path(file.filename).suffix if file.filename else ".zip"
    filename = f"submission_{submission_id}_user_{user_id}_{uuid.uuid4().hex[:8]}{file_extension}"
    s3_key = work_submission_path(filename)
    return await save_upload_file(file, s3_key)

# =====================================================
# DELETE FILE
# =====================================================
def delete_file(s3_key: str):
    """Delete file from S3 or local storage"""
    if not s3_key:
        return False
    
    if USE_S3:
        try:
            # Check if file exists first
            S3_CLIENT.head_object(Bucket=S3_BUCKET, Key=s3_key)
            S3_CLIENT.delete_object(Bucket=S3_BUCKET, Key=s3_key)
            logger.info(f"File deleted from S3: {s3_key}")
            return True
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                logger.warning(f"File not found in S3: {s3_key}")
                return False
            raise
    else:
        path = Path(s3_key)
        if path.exists():
            path.unlink()
            logger.info(f"File deleted locally: {s3_key}")
            return True
        return False

def delete_file_by_path(storage_type: StoragePath, filename: str):
    """Delete file using storage type and filename"""
    s3_key = get_storage_path(storage_type, filename)
    return delete_file(s3_key)

# =====================================================
# PRE-SIGNED URL WITH AUTO EXPIRE
# =====================================================
def generate_presigned_url(
    s3_key: str,
    expires_in: int = ExpiryPreset.STANDARD,
    force_download: bool = False
) -> Optional[str]:
    """
    Generate presigned URL that AUTO EXPIRES after specified time.
    """
    if not USE_S3:
        return f"/media/{s3_key}"

    if not s3_key or not s3_key.strip():
        logger.warning("Empty S3 key provided for presigned URL")
        return None

    try:
        head = S3_CLIENT.head_object(Bucket=S3_BUCKET, Key=s3_key)
        content_type = head.get("ContentType") or mimetypes.guess_type(s3_key)[0]

        params = {
            "Bucket": S3_BUCKET,
            "Key": s3_key,
            # ✅ CHANGE: Allow caching in browser
            "ResponseCacheControl": "public, max-age=86400, immutable",
        }

        if content_type:
            params["ResponseContentType"] = content_type

        if force_download:
            filename = extract_filename_from_path(s3_key)
            params["ResponseContentDisposition"] = f'attachment; filename="{filename}"'

        url = S3_CLIENT.generate_presigned_url(
            ClientMethod="get_object",
            Params=params,
            ExpiresIn=expires_in,
        )

        logger.info(f"Generated presigned URL for: {s3_key} (expires in {expires_in}s)")
        return url

    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            logger.warning(f"File not found for presigned URL: {s3_key}")
            return None
        logger.error(f"Failed to generate presigned URL for '{s3_key}': {str(e)}")
        return None

# =====================================================
# BUILD FULL URL - MAIN HELPER FUNCTION
# =====================================================
def build_full_url(
    request: Request,
    path: str | None,
    file_type: str = "auto"
) -> str | None:
    """
    Build full URL with S3 support for different file types
    
    This is the main function to use when you need to generate a URL for a file.
    It automatically handles S3 vs local storage and applies appropriate expiry times.
    
    Args:
        request: FastAPI Request object
        path: File path (S3 key or local path)
        file_type: Type of file for appropriate URL generation
                  Options: "profile", "portfolio", "portfolio_collaborator", 
                          "portfolio_creator", "job", "message", "invoice", 
                          "chat", "admin", "milestone", "proposal", 
                          "work_assignment", "work_submission", "auto"
        
    Returns:
        Full URL string or None
    """
    if not path:
        return None
    
    # Auto-detect file type if not specified
    if file_type == "auto":
        file_type = detect_file_type_from_path(path)
    
    # If using S3, generate presigned URL
    if USE_S3:
        # Extract the S3 key from the path
        s3_key = get_s3_key_from_path(path)
        
        # Get expiry time based on file type
        expires_in = get_expiry_for_file_type(file_type)
        
        # Generate presigned URL
        return generate_presigned_url(s3_key, expires_in=expires_in)
    
    else:
        # Local storage - return URL path
        # Clean up the path to be relative to media
        media_path = path
        
        # Check if path is already relative to LOCAL_STORAGE
        try:
            rel_path = str(Path(path).relative_to(LOCAL_STORAGE))
            media_path = rel_path
        except ValueError:
            # If path is absolute but not under LOCAL_STORAGE, try to extract
            for folder in LOCAL_PATHS.values():
                if str(folder) in path:
                    try:
                        media_path = str(Path(path).relative_to(LOCAL_STORAGE))
                        break
                    except ValueError:
                        continue
        
        # If path doesn't start with media, add it
        if not media_path.startswith("media/"):
            media_path = f"media/{media_path}"
        
        # Build full URL
        base_url = str(request.base_url).rstrip("/")
        return f"{base_url}/{media_path}".replace("\\", "/")

# =====================================================
# CCW-SPECIFIC URL GENERATORS (with pre-set expiry)
# =====================================================
def get_admin_profile_url(s3_key: str) -> Optional[str]:
    """Get admin profile URL - expires in 1 hour"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.STANDARD)

def get_chat_file_url(s3_key: str) -> Optional[str]:
    """Get chat file URL - expires in 5 minutes (quick preview)"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.SHORT)

def get_invoice_url(s3_key: str) -> Optional[str]:
    """Get invoice URL - expires in 7 days"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.WEEKLY)

def get_job_attachment_url(s3_key: str) -> Optional[str]:
    """Get job attachment URL - expires in 24 hours"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.DAILY)

def get_message_file_url(s3_key: str) -> Optional[str]:
    """Get message file URL - expires in 1 hour"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.STANDARD)

def get_milestone_submission_url(s3_key: str) -> Optional[str]:
    """Get milestone submission URL - expires in 24 hours"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.DAILY)

def get_portfolio_upload_url(s3_key: str) -> Optional[str]:
    """Get portfolio upload URL - expires in 7 days"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.WEEKLY)

def get_profile_pic_url(s3_key: str) -> Optional[str]:
    """Get profile picture URL - expires in 24 hours"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.DAILY)

def get_proposal_attachment_url(s3_key: str) -> Optional[str]:
    """Get proposal attachment URL - expires in 7 days"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.WEEKLY)

def get_work_assignment_url(s3_key: str) -> Optional[str]:
    """Get work assignment URL - expires in 4 hours"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.EXTENDED)

def get_work_submission_url(s3_key: str) -> Optional[str]:
    """Get work submission URL - expires in 7 days"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.WEEKLY)

def get_temp_preview_url(s3_key: str) -> Optional[str]:
    """Get temporary preview URL - expires in 5 minutes"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.SHORT)

def get_download_url(s3_key: str) -> Optional[str]:
    """Get download URL - expires in 1 hour, forces download"""
    return generate_presigned_url(s3_key, expires_in=ExpiryPreset.STANDARD, force_download=True)

# =====================================================
# FILE RETRIEVAL
# =====================================================
def read_file_bytes(s3_key: str) -> bytes:
    """Read file bytes from S3 or local storage"""
    if USE_S3:
        try:
            response = S3_CLIENT.get_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
            )
            return response["Body"].read()
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                raise HTTPException(status_code=404, detail=f"File not found: {s3_key}")
            raise HTTPException(status_code=500, detail=f"Failed to read file: {str(e)}")
    else:
        path = Path(s3_key)
        if not path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        return path.read_bytes()

def get_file_info(s3_key: str) -> dict:
    """Get file metadata from S3"""
    if USE_S3:
        try:
            response = S3_CLIENT.head_object(Bucket=S3_BUCKET, Key=s3_key)
            return {
                "size": response.get("ContentLength", 0),
                "content_type": response.get("ContentType", "unknown"),
                "last_modified": response.get("LastModified", None),
                "etag": response.get("ETag", "").strip('"'),
            }
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return None
            raise
    else:
        path = Path(s3_key)
        if not path.exists():
            return None
        return {
            "size": path.stat().st_size,
            "content_type": mimetypes.guess_type(s3_key)[0] or "unknown",
            "last_modified": path.stat().st_mtime,
        }

# =====================================================
# BULK OPERATIONS (CCW SPECIFIC)
# =====================================================
async def bulk_upload_job_attachments(files: list[UploadFile], job_id: str, user_id: str) -> list[str]:
    """Upload multiple job attachments at once"""
    uploaded_keys = []
    for file in files:
        try:
            s3_key = await save_job_attachment(file, job_id, user_id)
            uploaded_keys.append(s3_key)
        except Exception as e:
            # Rollback uploaded files on failure
            for key in uploaded_keys:
                delete_file(key)
            raise HTTPException(status_code=500, detail=f"Bulk upload failed: {str(e)}")
    return uploaded_keys

async def bulk_upload_work_submissions(files: list[UploadFile], submission_id: str, user_id: str) -> list[str]:
    """Upload multiple work submissions at once"""
    uploaded_keys = []
    for file in files:
        try:
            s3_key = await save_work_submission(file, submission_id, user_id)
            uploaded_keys.append(s3_key)
        except Exception as e:
            for key in uploaded_keys:
                delete_file(key)
            raise HTTPException(status_code=500, detail=f"Bulk upload failed: {str(e)}")
    return uploaded_keys

def get_all_files_in_folder(storage_type: StoragePath) -> list[str]:
    """List all files in a specific storage folder"""
    prefix = f"{storage_type.value}/"

    if USE_S3:
        try:
            response = S3_CLIENT.list_objects_v2(
                Bucket=S3_BUCKET,
                Prefix=prefix
            )
            if 'Contents' in response:
                return [obj['Key'] for obj in response['Contents']]
            return []
        except Exception as e:
            logger.error(f"Failed to list files in {prefix}: {str(e)}")
            return []
    else:
        local_path = LOCAL_PATHS[storage_type]
        if local_path.exists():
            return [str(f.relative_to(BASE_DIR)) for f in local_path.rglob("*") if f.is_file()]
        return []

def get_files_by_prefix(prefix: str) -> list[dict]:
    """Get all files with a specific prefix with metadata"""
    if USE_S3:
        try:
            response = S3_CLIENT.list_objects_v2(
                Bucket=S3_BUCKET,
                Prefix=prefix
            )
            if 'Contents' in response:
                return [
                    {
                        "key": obj['Key'],
                        "size": obj.get('Size', 0),
                        "last_modified": obj.get('LastModified', None),
                    }
                    for obj in response['Contents']
                ]
            return []
        except Exception as e:
            logger.error(f"Failed to list files with prefix {prefix}: {str(e)}")
            return []
    else:
        base_path = BASE_DIR / prefix
        if base_path.exists():
            files = []
            for f in base_path.rglob("*"):
                if f.is_file():
                    files.append({
                        "key": str(f.relative_to(BASE_DIR)),
                        "size": f.stat().st_size,
                        "last_modified": f.stat().st_mtime,
                    })
            return files
        return []

# =====================================================
# HEALTH CHECK ENDPOINT
# =====================================================
@router.get("/storage/health")
async def storage_health_check():
    """Check storage configuration status"""
    return {
        "storage_mode": "s3" if USE_S3 else "local",
        "use_s3": USE_S3,
        "bucket": S3_BUCKET if USE_S3 else None,
        "region": S3_REGION if USE_S3 else None,
        "local_storage_path": str(LOCAL_STORAGE),
        "local_directories": {k: str(v) for k, v in LOCAL_PATHS.items()},
        "folders_ready": all(p.exists() for p in LOCAL_PATHS.values()) if not USE_S3 else True
    }

# =====================================================
# MEDIA FILE SERVING FOR LOCAL STORAGE
# =====================================================
if not USE_S3:
    from fastapi.responses import FileResponse
    
    @router.get("/media/{file_path:path}")
    async def serve_media(file_path: str):
        """Serve media files from local storage (only when not using S3)"""
        local_file = LOCAL_STORAGE / file_path
        
        # Check for security - prevent path traversal
        try:
            resolved_path = local_file.resolve()
            if not str(resolved_path).startswith(str(LOCAL_STORAGE.resolve())):
                raise HTTPException(status_code=403, detail="Access denied")
        except Exception:
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not local_file.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Get MIME type
        mime_type, _ = mimetypes.guess_type(str(local_file))
        if not mime_type:
            mime_type = "application/octet-stream"
        
        return FileResponse(
            path=local_file,
            media_type=mime_type,
            headers={
                "Cache-Control": "public, max-age=86400",
                "Access-Control-Allow-Origin": "*",
            }
        )
        
def generate_presigned_urls_batch(
    s3_keys: List[str],
    expires_in: int = ExpiryPreset.DAILY
) -> Dict[str, Optional[str]]:
    """
    Generate presigned URLs for multiple S3 keys in batch.
    This is much faster than generating them one by one.
    """
    if not USE_S3:
        return {key: f"/media/{key}" for key in s3_keys}
    
    result = {}
    for s3_key in s3_keys:
        if not s3_key or not s3_key.strip():
            result[s3_key] = None
            continue
        
        try:
            # Use a shorter expiry for batch to reduce load
            url = S3_CLIENT.generate_presigned_url(
                ClientMethod="get_object",
                Params={
                    "Bucket": S3_BUCKET,
                    "Key": s3_key,
                    "ResponseCacheControl": "public, max-age=86400, immutable",
                },
                ExpiresIn=expires_in,
            )
            result[s3_key] = url
        except Exception as e:
            logger.error(f"Failed to generate presigned URL for {s3_key}: {e}")
            result[s3_key] = None
    
    return result

# fastapi_app/routes/storage.py - Add this function


# fastapi_app/routes/storage.py - Update generate_presigned_url_with_cache

def generate_presigned_url_with_cache(
    s3_key: str,
    expires_in: int = ExpiryPreset.STANDARD,
    force_download: bool = False
) -> Optional[str]:
    """
    Generate presigned URL with caching to reduce AWS API calls.
    Also caches "not found" results to prevent repeated checks.
    """
    if not USE_S3:
        return f"/media/{s3_key}"

    if not s3_key or not s3_key.strip():
        logger.warning("Empty S3 key provided for presigned URL")
        return None

    # Create a cache key
    cache_key = f"presigned_url_{s3_key}_{expires_in}_{force_download}"
    cache_key = hashlib.md5(cache_key.encode()).hexdigest()
    
    # Try to get from cache
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        # If cached result is "NOT_FOUND", return None without hitting AWS
        if cached_result == "NOT_FOUND":
            logger.info(f"✅ Using cached 'not found' result for: {s3_key}")
            return None
        logger.info(f"✅ Using cached presigned URL for: {s3_key}")
        return cached_result

    try:
        # First, check if the file exists
        try:
            head = S3_CLIENT.head_object(Bucket=S3_BUCKET, Key=s3_key)
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                # Cache the "not found" result for a longer time (1 hour)
                cache.set(cache_key, "NOT_FOUND", timeout=3600)
                logger.warning(f"File not found in S3: {s3_key} (cached for 1 hour)")
                return None
            raise e

        content_type = head.get("ContentType") or mimetypes.guess_type(s3_key)[0]

        params = {
            "Bucket": S3_BUCKET,
            "Key": s3_key,
            "ResponseCacheControl": "public, max-age=86400, immutable",
        }

        if content_type:
            params["ResponseContentType"] = content_type

        if force_download:
            filename = extract_filename_from_path(s3_key)
            params["ResponseContentDisposition"] = f'attachment; filename="{filename}"'

        url = S3_CLIENT.generate_presigned_url(
            ClientMethod="get_object",
            Params=params,
            ExpiresIn=expires_in,
        )

        # Cache the URL for a shorter time than expiry
        cache_timeout = min(expires_in // 2, 3600)
        if url:
            cache.set(cache_key, url, timeout=cache_timeout)
            logger.info(f"✅ Generated and cached presigned URL for: {s3_key} (expires in {expires_in}s, cached for {cache_timeout}s)")
        else:
            cache.set(cache_key, "NOT_FOUND", timeout=3600)

        return url

    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            cache.set(cache_key, "NOT_FOUND", timeout=3600)
            logger.warning(f"File not found for presigned URL: {s3_key}")
            return None
        logger.error(f"Failed to generate presigned URL for '{s3_key}': {str(e)}")
        return None