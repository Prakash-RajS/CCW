# from django.utils.timezone import now
# from datetime import timedelta
# import os
# from creator_app.models import (
#     UserData,
#     BillingHistory,
#     JobPost,
#     Proposal,
#     Contract
# )
# BASE_URL = os.getenv("BASE_URL")


# def get_profile_image(user):

#     if not user:
#         return None

#     if not user.profile_picture:
#         return None

#     profile = str(user.profile_picture)

#     # If image already external (Google / Auth0)
#     if profile.startswith("http"):
#         return profile

#     # If stored locally
#     return f"{BASE_URL}/media/{profile}"

# def get_admin_notifications(admin):
#     notifications = []

#     # show last 7 days notifications
#     since_time = now() - timedelta(days=7)

#     # ---------------------------------------------------
#     # NEW USERS REGISTERED
#     # ---------------------------------------------------
#     new_users = UserData.objects.filter(
#         created_at__gte=since_time
#     ).order_by("-created_at")[:5]

#     for u in new_users:
#         notifications.append({
#             "id": f"user_{u.id}",
#             "type": "new_user",
#             "title": "New user registered",
#             "subtitle": f"{u.full_name or u.email} joined the platform",  # Changed from first_name/last_name to full_name
#             "time": u.created_at,
#             "profile_image": get_profile_image(u),
#             "is_read": False
#         })

#     # ---------------------------------------------------
#     # NEW JOB POSTS
#     # ---------------------------------------------------
#     jobs = JobPost.objects.filter(
#         created_at__gte=since_time
#     ).order_by("-created_at")[:5]

#     for j in jobs:
#         notifications.append({
#             "id": f"job_{j.id}",
#             "type": "job_post",
#             "title": "New job posted",
#             "subtitle": j.title,
#             "time": j.created_at,
#             "is_read": False
#         })
#   # ---------------------------------------------------
#     # NEW PROPOSALS
#   # ---------------------------------------------------
#     proposals = Proposal.objects.filter(
#         created_at__gte=since_time
#     ).order_by("-created_at")[:5]

#     for p in proposals:
#         notifications.append({
#             "id": f"proposal_{p.id}",
#             "type": "proposal",
#             "title": "New proposal submitted",
#             "subtitle": f"Job: {p.job.title if p.job else 'Unknown'}",
#             "time": p.created_at,
#             "is_read": False
#         })

#   # ---------------------------------------------------
#     # PROPOSALS REJECTED
#   # ---------------------------------------------------
#     rejected_proposals = Proposal.objects.filter(
#         status__iexact="rejected",
#         updated_at__gte=since_time
#     ).order_by("-updated_at")[:5]

#     for p in rejected_proposals:
#         notifications.append({
#             "id": f"proposal_rejected_{p.id}",
#             "type": "proposal_rejected",
#             "title": "Proposal rejected",
#             "subtitle": f"Proposal for job '{p.job.title if p.job else 'Unknown'}' was rejected",
#             "time": p.updated_at,
#             "is_read": False
#         })
        

#     # ---------------------------------------------------
#     # PAYMENTS RECEIVED
#     # ---------------------------------------------------
#     payments = BillingHistory.objects.filter(
#         status="paid",
#         paid_on__gte=since_time
#     ).order_by("-paid_on")[:5]

#     for payment in payments:
#         notifications.append({
#             "id": f"payment_{payment.id}",
#             "type": "payment",
#             "title": "New payment received",
#             "subtitle": f"${payment.amount} from {payment.user.email}",
#             "time": payment.paid_on,
#             "is_read": False
#         })

#     # ---------------------------------------------------
#     # CONTRACT COMPLETED
#     # ---------------------------------------------------
#     contracts = Contract.objects.filter(
#         status__iexact="completed",
#         updated_at__gte=since_time
#     ).order_by("-updated_at")[:5]

#     for c in contracts:
#         notifications.append({
#             "id": f"contract_{c.id}",
#             "type": "contract_completed",
#             "title": "Contract completed",
#             "subtitle": f"Contract ID: {c.id}",
#             "time": c.updated_at,
#             "is_read": False
#         })
        
#     # ---------------------------------------------------
#     # PASSWORD CHANGED
#     # ---------------------------------------------------
#     password_updates = UserData.objects.filter(
#         updated_at__gte=since_time
#     ).order_by("-updated_at")[:5]

#     for user in password_updates:
#         notifications.append({
#             "id": f"password_change_{user.id}",
#             "type": "password_change",
#             "title": "User changed password",
#             "subtitle": f"{user.full_name or user.email} updated their password",  # Changed from first_name/last_name to full_name
#             "time": user.updated_at,
#             "is_read": False
#         })


#     # ---------------------------------------------------
#     # Remove duplicates
#     # ---------------------------------------------------
#     notifications = list({n["id"]: n for n in notifications}.values())

#     # ---------------------------------------------------
#     # Sort newest first
#     # ---------------------------------------------------
#     notifications.sort(key=lambda x: x["time"], reverse=True)

#     return notifications[:10]

# fastapi_app/services/admin_notification_service.py
# fastapi_app/services/admin_notification_service.py
from django.utils.timezone import now
from datetime import timedelta
import os
import logging
from typing import Optional

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up Django environment
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'CCW_project.settings')
django.setup()

from creator_app.models import (
    AdminUser,
    AdminNotification,
)

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")


def create_admin_notification(
    admin: AdminUser,
    notification_type: str,
    title: str,
    subtitle: str,
    related_id: Optional[int] = None
):
    """
    Create a notification for a specific admin
    """
    try:
        logger.info(f"🔔 Creating notification for admin {admin.email}: {notification_type}")
        logger.info(f"   Title: {title}")
        logger.info(f"   Subtitle: {subtitle}")
        
        notification = AdminNotification.objects.create(
            admin=admin,
            notification_type=notification_type,
            title=title,
            subtitle=subtitle,
            related_id=related_id
        )
        logger.info(f"✅ Notification created successfully! ID: {notification.id}")
        return notification
    except Exception as e:
        logger.error(f"❌ Error creating notification: {e}")
        import traceback
        traceback.print_exc()
        return None


def create_notification_for_all_admins(
    notification_type: str,
    title: str,
    subtitle: str,
    exclude_admin: Optional[AdminUser] = None,
    related_id: Optional[int] = None
):
    """
    Create a notification for all admin users
    """
    try:
        logger.info(f"🔔 Creating notification for ALL admins: {notification_type}")
        logger.info(f"   Title: {title}")
        logger.info(f"   Subtitle: {subtitle}")
        
        admins = AdminUser.objects.all()
        logger.info(f"   Total admins found: {admins.count()}")
        
        if exclude_admin:
            admins = admins.exclude(id=exclude_admin.id)
            logger.info(f"   Excluding admin: {exclude_admin.email}, remaining: {admins.count()}")
        
        notifications = []
        for admin in admins:
            notification = AdminNotification.objects.create(
                admin=admin,
                notification_type=notification_type,
                title=title,
                subtitle=subtitle,
                related_id=related_id
            )
            notifications.append(notification)
            logger.info(f"   ✅ Created for: {admin.email}")
        
        logger.info(f"✅ Created {len(notifications)} notifications successfully!")
        return notifications
    except Exception as e:
        logger.error(f"❌ Error creating notifications for all admins: {e}")
        import traceback
        traceback.print_exc()
        return []


def get_admin_notifications(admin: AdminUser, limit: int = 50):
    """
    Get ONLY admin action notifications from the database.
    No system/user notifications.
    """
    try:
        db_notifications = AdminNotification.objects.filter(
            admin=admin
        ).order_by("-created_at")[:limit]
        
        logger.info(f"📬 Found {db_notifications.count()} admin notifications for {admin.email}")
        
        result = []
        for n in db_notifications:
            result.append({
                "id": n.id,  # Integer ID
                "type": n.notification_type,
                "title": n.title,
                "subtitle": n.subtitle,
                "time": n.created_at,
                "is_read": n.is_read,
                "related_id": n.related_id
            })
        
        unread_count = sum(1 for n in result if not n["is_read"])
        logger.info(f"📬 Total notifications: {len(result)} (Unread: {unread_count})")
        
        return result
    except Exception as e:
        logger.error(f"❌ Error fetching notifications: {e}")
        return []


def clear_all_notifications(admin: AdminUser):
    """
    Clear ALL admin notifications for a specific admin.
    """
    try:
        deleted_count, _ = AdminNotification.objects.filter(admin=admin).delete()
        logger.info(f"🗑️ Cleared {deleted_count} notifications for {admin.email}")
        return deleted_count
    except Exception as e:
        logger.error(f"❌ Error clearing notifications: {e}")
        return 0