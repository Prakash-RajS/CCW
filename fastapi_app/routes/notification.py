# fastapi_app/routes/notifications.py

from fastapi import APIRouter, Depends, HTTPException, Query
from asgiref.sync import sync_to_async
from fastapi_app.routes.auth import get_current_user
from fastapi_app.services.notification_service import (
    get_user_notifications,
    get_unread_count,
    mark_notification_read as service_mark_read,
    mark_all_notifications_read as service_mark_all_read
)
from creator_app.models import UserData, Notification
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


# ---------------------------------------------------
# GET USER NOTIFICATIONS
# ---------------------------------------------------
@router.get("/")
async def fetch_notifications(
    limit: int = Query(50, ge=1, le=100),
    include_read: bool = Query(True, description="Include read notifications"),
    current_user: UserData = Depends(get_current_user)
):
    """
    Get user notifications from database with proper read status
    """
    try:
        logger.info(f"Fetching notifications for user: {current_user.email}")
        
        # Get notifications from service (now using database)
        notifications = await sync_to_async(get_user_notifications)(current_user)
        
        if not notifications:
            logger.info(f"No notifications found for user: {current_user.email}")
            return []
        
        # Filter by read status if needed
        if not include_read:
            notifications = [n for n in notifications if not n["is_read"]]
        
        # Apply limit
        notifications = notifications[:limit]
        
        logger.info(f"Returning {len(notifications)} notifications for user: {current_user.email}")
        return notifications
        
    except Exception as e:
        logger.error(f"Error fetching notifications: {str(e)}")
        return []


# ---------------------------------------------------
# GET UNREAD COUNT
# ---------------------------------------------------
@router.get("/unread-count")
async def get_unread_notification_count(
    current_user: UserData = Depends(get_current_user)
):
    """
    Get count of unread notifications from database
    """
    try:
        count = await sync_to_async(get_unread_count)(current_user)
        return {"count": count}
    except Exception as e:
        logger.error(f"Error getting unread count: {e}")
        return {"count": 0}


# ---------------------------------------------------
# MARK SINGLE NOTIFICATION READ
# ---------------------------------------------------
@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: UserData = Depends(get_current_user)
):
    """
    Mark a specific notification as read in database
    """
    try:
        # Convert to integer (since your IDs are integers)
        try:
            notif_id = int(notification_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid notification ID format - must be an integer")
        
        # Use service to mark as read
        success = await sync_to_async(service_mark_read)(current_user, notif_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        logger.info(f"Notification {notification_id} marked as read for {current_user.email}")
        
        return {
            "status": "success",
            "message": "Notification marked as read",
            "notification_id": notification_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------
# MARK ALL NOTIFICATIONS READ
# ---------------------------------------------------
@router.post("/mark-all-read")
async def mark_all_notifications_read(
    current_user: UserData = Depends(get_current_user)
):
    """
    Mark all notifications as read in database
    """
    try:
        # Use service to mark all as read
        updated = await sync_to_async(service_mark_all_read)(current_user)
        
        logger.info(f"Marked {updated} notifications as read for {current_user.email}")
        
        return {
            "status": "success",
            "message": f"{updated} notifications marked as read"
        }
        
    except Exception as e:
        logger.error(f"Error marking all notifications as read: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------
# MARK BULK NOTIFICATIONS READ
# ---------------------------------------------------
@router.post("/mark-bulk-read")
async def mark_bulk_notifications_read(
    notification_ids: List[str],
    current_user: UserData = Depends(get_current_user)
):
    """
    Mark multiple specific notifications as read
    """
    try:
        if not notification_ids:
            return {
                "status": "success",
                "message": "No notifications to mark",
                "count": 0
            }
        
        # Convert to integers and filter valid ones
        valid_ids = []
        for nid in notification_ids:
            try:
                valid_ids.append(int(nid))
            except ValueError:
                continue
        
        if not valid_ids:
            raise HTTPException(status_code=400, detail="No valid notification IDs provided")
        
        # Bulk update in database
        updated = await sync_to_async(Notification.objects.filter)(
            id__in=valid_ids,
            user=current_user,
            is_read=False
        ).update(is_read=True)
        
        logger.info(f"Marked {updated} notifications as read for {current_user.email}")
        
        return {
            "status": "success",
            "message": f"{updated} notifications marked as read",
            "count": updated
        }
        
    except Exception as e:
        logger.error(f"Error marking bulk notifications as read: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------
# HANDLE NOTIFICATION CLICK
# ---------------------------------------------------
@router.post("/{notification_id}/click")
async def notification_clicked(
    notification_id: str,
    current_user: UserData = Depends(get_current_user)
):
    """
    Handle notification click - marks as read and returns URL
    """
    try:
        # Convert to integer
        try:
            notif_id = int(notification_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid notification ID format - must be an integer")
        
        # Find notification in database
        notification = await sync_to_async(Notification.objects.filter)(
            id=notif_id,
            user=current_user
        ).first()
        
        if notification:
            # Mark as read
            notification.is_read = True
            await sync_to_async(notification.save)(update_fields=['is_read'])
            
            logger.info(f"Notification {notification_id} clicked and marked as read")
            
            return {
                "status": "success",
                "message": "Notification marked as read",
                "notification_id": notification_id,
                "url": notification.url,
                "type": notification.notification_type
            }
        else:
            # Notification not found
            return {
                "status": "success",
                "message": "Notification processed",
                "notification_id": notification_id,
                "url": None
            }
        
    except Exception as e:
        logger.error(f"Error processing notification click: {str(e)}")
        return {
            "status": "error",
            "message": "Failed to process notification",
            "error": str(e)
        }


# ---------------------------------------------------
# DELETE NOTIFICATION
# ---------------------------------------------------
@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: UserData = Depends(get_current_user)
):
    """
    Delete a specific notification
    """
    try:
        # Convert to integer
        try:
            notif_id = int(notification_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid notification ID format - must be an integer")
        
        # Find and delete notification
        deleted = await sync_to_async(Notification.objects.filter)(
            id=notif_id,
            user=current_user
        ).delete()
        
        if deleted[0] == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        logger.info(f"Notification {notification_id} deleted for {current_user.email}")
        
        return {
            "status": "success",
            "message": "Notification deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting notification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------
# CLEAR ALL NOTIFICATIONS
# ---------------------------------------------------
@router.delete("/clear-all")
async def clear_all_notifications(
    current_user: UserData = Depends(get_current_user)
):
    """
    Delete all notifications for current user
    """
    try:
        deleted = await sync_to_async(Notification.objects.filter)(
            user=current_user
        ).delete()
        
        logger.info(f"Deleted {deleted[0]} notifications for {current_user.email}")
        
        return {
            "status": "success",
            "message": f"{deleted[0]} notifications deleted"
        }
        
    except Exception as e:
        logger.error(f"Error clearing notifications: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------
# GET NOTIFICATIONS BY TYPE
# ---------------------------------------------------
@router.get("/by-type/{notification_type}")
async def get_notifications_by_type(
    notification_type: str,
    limit: int = Query(20, ge=1, le=50),
    current_user: UserData = Depends(get_current_user)
):
    """
    Get notifications filtered by type
    """
    try:
        notifications = await sync_to_async(list)(
            Notification.objects.filter(
                user=current_user,
                notification_type=notification_type
            ).order_by('-created_at')[:limit]
        )
        
        result = []
        for n in notifications:
            result.append({
                "id": str(n.id),
                "type": n.notification_type,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "created_at": n.created_at.isoformat(),
                "url": n.url
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Error fetching notifications by type: {str(e)}")
        return []


# ---------------------------------------------------
# GET NOTIFICATION COUNTS BY TYPE
# ---------------------------------------------------
@router.get("/counts-by-type")
async def get_notification_counts_by_type(
    current_user: UserData = Depends(get_current_user)
):
    """
    Get notification counts grouped by type
    """
    try:
        from django.db.models import Count
        
        # Get all notifications for user
        notifications = await sync_to_async(list)(
            Notification.objects.filter(user=current_user)
        )
        
        if not notifications:
            return {"total": {}, "unread": {}}
        
        # Count notifications by type
        total_counts = {}
        unread_counts = {}
        
        for notification in notifications:
            n_type = notification.notification_type
            
            # Total count
            total_counts[n_type] = total_counts.get(n_type, 0) + 1
            
            # Unread count
            if not notification.is_read:
                unread_counts[n_type] = unread_counts.get(n_type, 0) + 1
        
        return {
            "total": total_counts,
            "unread": unread_counts
        }
        
    except Exception as e:
        logger.error(f"Error getting counts by type: {str(e)}")
        return {"total": {}, "unread": {}}


# ---------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------
@router.get("/health")
async def notifications_health_check():
    """Health check endpoint for notifications service"""
    try:
        # Test database connection
        count = await sync_to_async(Notification.objects.count)()
        
        return {
            "status": "healthy",
            "service": "notifications",
            "database": "connected",
            "total_notifications": count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "notifications",
            "error": str(e)
        }


# ---------------------------------------------------
# TEST ENDPOINT (for development only)
# ---------------------------------------------------
@router.post("/test/create")
async def create_test_notification(
    current_user: UserData = Depends(get_current_user)
):
    """
    Create a test notification (for development purposes only)
    """
    try:
        from fastapi_app.services.notification_service import create_notification
        
        notification = await sync_to_async(create_notification)(
            user=current_user,
            notification_type='system',
            title='Test Notification',
            message='This is a test notification created for development',
            url='/dashboard',
            icon=''
        )
        
        if notification:
            return {
                "status": "success",
                "message": "Test notification created",
                "notification_id": str(notification.id)
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to create notification")
        
    except Exception as e:
        logger.error(f"Error creating test notification: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))