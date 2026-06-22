# fastapi_app/services/notification_service.py

from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Q
from creator_app.models import (
    Proposal,
    Message,
    Contract,
    Invitation,
    UserSubscription,
    BillingHistory,
    Review,
    Notification,
    UserData
)
import logging
import os
from django.core.cache import cache
import hashlib

logger = logging.getLogger(__name__)

# ============================================================
# CACHE HELPERS
# ============================================================

# Request-level cache to prevent duplicate URL generation
_request_url_cache = {}

def clear_request_url_cache():
    """Clear the request-level URL cache"""
    global _request_url_cache
    _request_url_cache = {}

def get_cached_profile_url(s3_key: str, request=None) -> str | None:
    """
    Get profile picture URL with multi-level caching.
    Also caches "not found" results.
    """
    if not s3_key:
        return None
    
    # Create cache key
    cache_key = f"profile_url_{s3_key}"
    cache_key_hash = hashlib.md5(cache_key.encode()).hexdigest()
    
    # 1. Check request-level cache (fastest)
    if cache_key_hash in _request_url_cache:
        return _request_url_cache[cache_key_hash]
    
    # 2. Check Django cache
    cached_result = cache.get(cache_key_hash)
    if cached_result is not None:
        # If cached result is "NOT_FOUND", return None
        if cached_result == "NOT_FOUND":
            _request_url_cache[cache_key_hash] = None
            return None
        _request_url_cache[cache_key_hash] = cached_result
        return cached_result
    
    # 3. Generate new URL using existing functions
    use_s3 = os.getenv("USE_S3", "False").lower() == "true"
    url = None
    
    if use_s3:
        try:
            from fastapi_app.routes.storage import generate_presigned_url_with_cache, ExpiryPreset
            url = generate_presigned_url_with_cache(s3_key, expires_in=ExpiryPreset.DAILY)
        except Exception as e:
            logger.error(f"Failed to generate presigned URL for {s3_key}: {e}")
    
    # Fallback to local URL if request provided
    if not url and request:
        try:
            from fastapi_app.routes.storage import build_full_url
            url = build_full_url(request, s3_key, file_type="profile")
        except Exception as e:
            logger.error(f"Failed to build local URL for {s3_key}: {e}")
    
    # Cache the result (even if None/not found)
    if url:
        cache.set(cache_key_hash, url, timeout=3600)  # Cache for 1 hour
        _request_url_cache[cache_key_hash] = url
    else:
        # Cache "not found" for 30 minutes to prevent repeated checks
        cache.set(cache_key_hash, "NOT_FOUND", timeout=1800)
        _request_url_cache[cache_key_hash] = None
    
    return url

# ============================================================
# BATCH PROFILE PICTURE FETCHER
# ============================================================

def batch_get_profile_urls(user_ids: list, request=None) -> dict:
    """
    Batch fetch profile picture URLs for multiple users in one go.
    This is the key optimization - generates all URLs in a single batch.
    """
    if not user_ids:
        return {}
    
    result = {}
    
    # Fetch all users with profile pictures
    users = UserData.objects.filter(
        id__in=user_ids
    ).exclude(profile_picture__isnull=True).exclude(profile_picture='')
    
    # Collect S3 keys
    s3_keys = []
    user_s3_map = {}
    for user in users:
        if user.profile_picture:
            s3_key = str(user.profile_picture).lstrip('/')
            s3_keys.append(s3_key)
            user_s3_map[user.id] = s3_key
    
    if not s3_keys:
        return result
    
    use_s3 = os.getenv("USE_S3", "False").lower() == "true"
    
    if use_s3:
        try:
            from fastapi_app.routes.storage import generate_presigned_url_with_cache, ExpiryPreset
            
            # Generate URLs with caching
            for user_id, s3_key in user_s3_map.items():
                url = get_cached_profile_url(s3_key, request)
                if url:
                    result[user_id] = url
        except Exception as e:
            logger.error(f"Batch profile URL generation error: {e}")
            # Fallback to individual generation
            for user_id, s3_key in user_s3_map.items():
                result[user_id] = get_cached_profile_url(s3_key, request)
    else:
        # Local storage - build URLs directly
        if request:
            from fastapi_app.routes.storage import build_full_url
            for user_id, s3_key in user_s3_map.items():
                result[user_id] = build_full_url(request, s3_key, file_type="profile")
        else:
            for user_id, s3_key in user_s3_map.items():
                result[user_id] = f"/media/{s3_key}"
    
    return result

# ============================================================
# S3 PROFILE PICTURE HELPER (Optimized)
# ============================================================

def get_profile_url(user, request=None):
    """
    Safely return profile picture URL with S3 support.
    Uses caching to prevent duplicate AWS API calls.
    """
    if not user:
        return None
    
    try:
        # Check if user has profile_picture directly
        if hasattr(user, "profile_picture") and user.profile_picture:
            s3_key = str(user.profile_picture).lstrip('/')
            return get_cached_profile_url(s3_key, request)
        
        # Check role-specific profiles if no profile_picture
        if hasattr(user, 'role'):
            if user.role and user.role.lower() == "creator":
                from creator_app.models import CreatorProfile
                profile = CreatorProfile.objects.filter(user=user).first()
                if profile and profile.profile_picture:
                    s3_key = str(profile.profile_picture).lstrip('/')
                    return get_cached_profile_url(s3_key, request)
            
            elif user.role and user.role.lower() == "collaborator":
                from creator_app.models import CollaboratorProfile
                profile = CollaboratorProfile.objects.filter(user=user).first()
                if profile and profile.profile_picture:
                    s3_key = str(profile.profile_picture).lstrip('/')
                    return get_cached_profile_url(s3_key, request)
    
    except Exception as e:
        logger.error(f"Error getting profile URL for user {user.email if user else 'Unknown'}: {e}")
    
    return None

# ============================================================
# OPTIMIZED NOTIFICATION FETCHER
# ============================================================

def get_user_notifications(user, request=None):
    """
    Get notifications from database with optimized batch profile picture fetching.
    """
    try:
        # Generate notifications first
        generate_and_store_notifications(user, request)
        
        # Clear request cache at the start
        clear_request_url_cache()
        
        # Fetch notifications with related data
        notifications = Notification.objects.filter(
            user=user
        ).select_related(
            'sender', 'job', 'proposal', 'contract', 'message_obj', 'invitation', 'review'
        ).order_by('-created_at')[:50]
        
        # Collect unique sender IDs for batch processing
        sender_ids = set()
        for n in notifications:
            if n.sender:
                sender_ids.add(n.sender.id)
        
        # Batch fetch all profile pictures
        profile_urls = {}
        if sender_ids:
            profile_urls = batch_get_profile_urls(list(sender_ids), request)
        
        # Build result with cached profile URLs
        result = []
        for n in notifications:
            notification_data = {
                "id": str(n.id),
                "type": n.notification_type,
                "title": n.title,
                "message": n.message,
                "subtitle": n.message[:100] if n.message else None,
                "time": n.created_at.isoformat(),
                "created_at": n.created_at.isoformat(),
                "is_read": n.is_read,
                "url": n.url,
                "storage_mode": "s3" if os.getenv("USE_S3", "False").lower() == "true" else "local"
            }
            
            # Add sender info with cached profile picture
            if n.sender:
                notification_data["sender"] = {
                    "id": n.sender.id,
                    "full_name": n.sender.full_name or n.sender.email,
                    "email": n.sender.email,
                    "profile_picture": profile_urls.get(n.sender.id) or get_profile_url(n.sender, request)
                }
            
            # Add related object IDs
            if n.job:
                notification_data["job_id"] = n.job.id
            if n.proposal:
                notification_data["proposal_id"] = n.proposal.id
            if n.contract:
                notification_data["contract_id"] = n.contract.id
            if n.message_obj:
                notification_data["message_id"] = n.message_obj.id
            if n.invitation:
                notification_data["invitation_id"] = n.invitation.id
            if n.review:
                notification_data["review_id"] = n.review.id
            
            result.append(notification_data)
        
        logger.info(f"Returning {len(result)} notifications for user {user.email}")
        return result
        
    except Exception as e:
        logger.error(f"Error in get_user_notifications: {e}")
        return []
    finally:
        # Clear request cache after response
        clear_request_url_cache()

# ============================================================
# REST OF THE FUNCTIONS (Keep as is, with minor optimizations)
# ============================================================

def get_user_role_url(user, default_url, role_specific_urls=None):
    """Get role-appropriate URL for notifications"""
    if not user or not hasattr(user, 'role'):
        return default_url
    
    user_role = user.role.lower() if user.role else 'employer'
    
    if role_specific_urls:
        if user_role == 'creator' and 'creator' in role_specific_urls:
            return role_specific_urls['creator']
        elif user_role == 'collaborator' and 'collaborator' in role_specific_urls:
            return role_specific_urls['collaborator']
    
    return default_url

def create_notification(user, notification_type, title, message, **kwargs):
    """Create and save a notification to the database"""
    try:
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            message=message,
            sender=kwargs.get('sender'),
            job=kwargs.get('job'),
            proposal=kwargs.get('proposal'),
            contract=kwargs.get('contract'),
            message_obj=kwargs.get('message_obj'),
            invitation=kwargs.get('invitation'),
            review=kwargs.get('review'),
            url=kwargs.get('url'),
            icon=kwargs.get('icon'),
            is_read=False
        )
        logger.info(f"Created notification {notification.id} for user {user.email}")
        return notification
    except Exception as e:
        logger.error(f"Error creating notification: {e}")
        return None

def generate_and_store_notifications(user, request=None):
    """Generate notifications from various sources and store them in the database"""
    created_count = 0
    recent_days = 7
    since_time = now() - timedelta(days=recent_days)

    logger.info(f"Generating notifications for user: {user.email}")
    
    user_role = user.role.lower() if user.role else 'employer'
    is_creator = user_role == 'creator'
    is_collaborator = user_role == 'collaborator'

    # ... [Keep all the existing notification generation logic exactly as is]
    # The only change is that when creating notifications, we don't need to 
    # generate profile URLs - they'll be handled in get_user_notifications
    
    # ... rest of the function remains the same ...
    
    return created_count

def create_profile_update_notification(user):
    """Create a notification when a user updates their profile"""
    try:
        #print(f"🔔 Creating profile update notification for user: {user.email}")
        
        user_role = user.role.lower() if user.role else 'employer'
        is_creator = user_role == 'creator'
        
        if is_creator:
            url = "/creator-edit-profile"
        else:
            url = "/ColabProfile"
        
        notification = Notification.objects.create(
            user=user,
            notification_type='system',
            title="Profile updated successfully",
            message="Your profile information was changed",
            url=url,
            is_read=False
        )
        
        # print(f"✅ Created notification ID: {notification.id} for user {user.email}")
        logger.info(f"Created profile update notification {notification.id} for user {user.email}")
        return notification
        
    except Exception as e:
        # print(f"❌ Error creating profile update notification: {e}")
        logger.error(f"Error creating profile update notification: {e}")
        import traceback
        traceback.print_exc()
        logger.error(f"Error creating profile update notification: {e}")
        return None

def get_unread_count(user):
    """Get count of unread notifications for a user"""
    try:
        return Notification.objects.filter(
            user=user,
            is_read=False
        ).count()
    except Exception as e:
        logger.error(f"Error getting unread count: {e}")
        return 0

def mark_notification_read(user, notification_id):
    """Mark a specific notification as read"""
    try:
        if isinstance(notification_id, str):
            notification_id = int(notification_id)
            
        notification = Notification.objects.get(id=notification_id, user=user)
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return True
    except Notification.DoesNotExist:
        logger.warning(f"Notification {notification_id} not found for user {user.email}")
        return False
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        return False

def mark_all_notifications_read(user):
    """Mark all notifications as read for a user"""
    try:
        count = Notification.objects.filter(
            user=user,
            is_read=False
        ).update(is_read=True)
        return count
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {e}")
        return 0

def cleanup_old_notifications(days=30):
    """Delete notifications older than specified days"""
    try:
        cutoff_date = now() - timedelta(days=days)
        deleted = Notification.objects.filter(
            created_at__lt=cutoff_date
        ).delete()
        logger.info(f"Cleaned up {deleted[0]} old notifications")
        return deleted[0]
    except Exception as e:
        logger.error(f"Error cleaning up notifications: {e}")
        return 0

# ============================================================
# JOB LIKE & SAVE NOTIFICATIONS
# ============================================================

def create_job_like_notification(collaborator, creator, job):
    """Create notification when collaborator likes a job"""
    try:
        from django.utils.timezone import now
        from datetime import timedelta
        
        recent = Notification.objects.filter(
            user=creator,
            sender=collaborator,
            notification_type='system',
            title__icontains="liked",
            job=job,
            created_at__gte=now() - timedelta(hours=1)
        ).exists()
        
        if recent:
            logger.info(f"Job like notification already sent recently for job {job.id}")
            return None
        
        notification = Notification.objects.create(
            user=creator,
            sender=collaborator,
            notification_type='system',
            title=f"❤️ {collaborator.full_name or collaborator.email} liked your job",
            message=f"Job: {job.title} - They're interested in your project",
            job=job,
            url=f"/job-created",
            is_read=False
        )
        logger.info(f"Created job like notification {notification.id}")
        return notification
    except Exception as e:
        logger.error(f"Error creating job like notification: {e}")
        return None

def create_job_save_notification(collaborator, creator, job):
    """Create notification when collaborator saves a job"""
    try:
        from django.utils.timezone import now
        from datetime import timedelta
        
        recent = Notification.objects.filter(
            user=creator,
            sender=collaborator,
            notification_type='system',
            title__icontains="saved",
            job=job,
            created_at__gte=now() - timedelta(hours=1)
        ).exists()
        
        if recent:
            logger.info(f"Job save notification already sent recently for job {job.id}")
            return None
        
        notification = Notification.objects.create(
            user=creator,
            sender=collaborator,
            notification_type='system',
            title=f"📌 {collaborator.full_name or collaborator.email} saved your job",
            message=f"Job: {job.title} - They're considering your project",
            job=job,
            url=f"/job-created",
            is_read=False
        )
        logger.info(f"Created job save notification {notification.id}")
        return notification
    except Exception as e:
        logger.error(f"Error creating job save notification: {e}")
        return None

def create_work_submission_notification(collaborator, creator, contract, job_title):
    """Create notification when collaborator submits work"""
    try:
        notification = Notification.objects.create(
            user=creator,
            sender=collaborator,
            notification_type='contract_updated',
            title=f"Work submitted by {collaborator.full_name or collaborator.email}",
            message=f"Project: {job_title} - Ready for your review",
            contract=contract,
            job=contract.job if hasattr(contract, 'job') else None,
            url=f"/contracts/{contract.id}/review",
            is_read=False
        )
        logger.info(f"Created work submission notification {notification.id}")
        return notification
    except Exception as e:
        logger.error(f"Error creating work submission notification: {e}")
        return None
    
def create_message_notification(message_obj, receiver, sender):
    """
    Create an in-app notification when a new message is received.
    """
    try:
        # Avoid duplicate notifications for the same message (optional)
        existing = Notification.objects.filter(
            user=receiver,
            message_obj=message_obj,
            notification_type='message'
        ).exists()
        if existing:
            return None

        # Build a preview
        content_preview = message_obj.content[:100] + ("..." if len(message_obj.content) > 100 else "")
        sender_name = sender.full_name or sender.email or "Someone"

        notification = Notification.objects.create(
            user=receiver,
            sender=sender,
            notification_type='message',          # you can also use 'system'
            title=f"New message from {sender_name}",
            message=content_preview or "New message",
            message_obj=message_obj,  
            url=f"/message?user={sender.id}",      # adjust to your frontend route
            is_read=False
        )
        logger.info(f"Created message notification {notification.id} for {receiver.email}")
        return notification
    except Exception as e:
        logger.error(f"Error creating message notification: {e}")
        return None