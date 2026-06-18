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

logger = logging.getLogger(__name__)

def get_profile_url(user):
    """
    Safely return profile picture URL
    """
    if hasattr(user, "profile_picture") and user.profile_picture:
        if user.profile_picture.name.startswith(('http://', 'https://')):
            return user.profile_picture.name
        return f"/media/{user.profile_picture.name}"
    return None


def get_user_role_url(user, default_url, role_specific_urls=None):
    """
    Get role-appropriate URL for notifications
    
    Args:
        user: UserData object
        default_url: Default URL if role not matched
        role_specific_urls: Dict with 'creator' and 'employer' URLs
    """
    if not user or not hasattr(user, 'role'):
        return default_url
    
    user_role = user.role.lower() if user.role else 'employer'
    
    if role_specific_urls:
        if user_role == 'creator' and 'creator' in role_specific_urls:
            return role_specific_urls['creator']
        elif user_role == 'employer' and 'employer' in role_specific_urls:
            return role_specific_urls['employer']
    
    return default_url


def create_notification(user, notification_type, title, message, **kwargs):
    """
    Create and save a notification to the database
    """
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


def generate_and_store_notifications(user):
    """
    Generate notifications from various sources and store them in the database
    """
    created_count = 0
    recent_days = 7
    since_time = now() - timedelta(days=recent_days)

    logger.info(f"Generating notifications for user: {user.email}")
    
    # Determine user role
    user_role = user.role.lower() if user.role else 'employer'
    is_creator = user_role == 'creator'
    is_collaborator = user_role == 'collaborator'

    # ---------------------------------------------------
    # PROPOSALS ON MY JOB (for employers who posted jobs)
    # ---------------------------------------------------
    proposals = Proposal.objects.filter(
        job__employer=user,
        created_at__gte=since_time
    ).select_related("freelancer", "job").order_by("-created_at")[:10]

    for p in proposals:
        # Check if notification already exists
        if not Notification.objects.filter(
            user=user,
            notification_type='proposal_submitted',
            proposal=p
        ).exists():
            
            # freelancer_name = (
            #     f"{p.freelancer.first_name} {p.freelancer.last_name}".strip()
            #     if p.freelancer.first_name
            #     else p.freelancer.email
            # )
             freelancer_name = p.freelancer.full_name or p.freelancer.email

             job_title = p.job.title if p.job else "your job"
            
            # ✅ Role-appropriate URL for proposals
            # Employers/Creators go to proposalspage, Collaborators go to all-contacts
             url = get_user_role_url(
                user,
                "/proposalspage",
                {
                    'creator': "/proposalspage",      # Creator/Employer goes to proposalspage
                    'collaborator': "/all-contacts"   # Collaborator goes to all-contacts
                }
            )

            # Create notification in database
             notification = Notification.objects.create(
                user=user,
                sender=p.freelancer,
                notification_type='proposal_submitted',
                title=f"{freelancer_name} submitted a proposal",
                message=f"For job: {job_title}",
                job=p.job,
                proposal=p,
                url=url,
                is_read=False
            )
             created_count += 1
             logger.info(f"Created proposal notification: {notification.id}")

    # ---------------------------------------------------
# PROPOSAL STATUS UPDATE (for freelancers/creators)
# ---------------------------------------------------
    my_proposals = Proposal.objects.filter(
        freelancer=user,
        updated_at__gte=since_time
    ).exclude(status="submitted").order_by("-updated_at")[:10]

    for p in my_proposals:
        status_type = f'proposal_{p.status}'
        if not Notification.objects.filter(
            user=user,
            notification_type=status_type,
            proposal=p
        ).exists():
            
            job_title = p.job.title if p.job else "your job"
            
            # ✅ CORRECTED: Get role-appropriate URL based on user's actual role
            # Check if user is a collaborator or creator/employer
            if hasattr(user, 'role') and user.role == 'collaborator':
                url = "/all-contacts"
            else:
                url = "/proposalspage"
            
            notification = Notification.objects.create(
                user=user,
                notification_type=status_type,
                title=f"Your proposal was {p.status}",
                message=f"Job: {job_title}",
                job=p.job,
                proposal=p,
                url=url,  # Now uses the correct role-based URL
                is_read=False
            )
            created_count += 1
            logger.info(f"Created proposal status notification: {notification.id}")

        # ---------------------------------------------------
    # NEW MESSAGES - Fixed version
    # ---------------------------------------------------
    # Get messages where the user is the receiver (not the sender)
    messages = Message.objects.filter(
        created_at__gte=since_time
    ).exclude(sender=user).select_related("sender", "conversation").order_by("-created_at")[:20]

    logger.info(f"Found {messages.count()} new messages for user {user.email}")

    for m in messages:
        # Check if user is the receiver in the conversation
        is_receiver = False
        if hasattr(m.conversation, 'user1') and hasattr(m.conversation, 'user2'):
            if m.conversation.user1 == user or m.conversation.user2 == user:
                is_receiver = True
        
        if not is_receiver:
            logger.warning(f"Message {m.id} - User {user.email} is not a participant")
            continue
        
        # Check if notification already exists for this message
        if Notification.objects.filter(
            user=user,
            notification_type='new_message',
            message_obj=m
        ).exists():
            logger.info(f"Message notification already exists for message {m.id}")
            continue
        
        sender_name = m.sender.full_name or m.sender.email
        url = f"/message?conversation={m.conversation.id}&user={m.sender.id}" 
        
        notification = Notification.objects.create(
            user=user,
            sender=m.sender,
            notification_type='new_message',
            title=f"New message from {sender_name}",
            message=m.content[:100] if m.content else "New message received",
            message_obj=m,
            url=url,
            is_read=False
        )
        created_count += 1
        logger.info(f"✅ Created message notification {notification.id} for user {user.email} from {sender_name}")

    # ---------------------------------------------------
    # CONTRACT UPDATES
    # ---------------------------------------------------
    contracts = Contract.objects.filter(
        Q(creator=user) | Q(collaborator=user),
        updated_at__gte=since_time
    ).order_by("-updated_at")[:10]

    for c in contracts:
        if not Notification.objects.filter(
            user=user,
            notification_type='contract_updated',
            contract=c
        ).exists():
            
            # ✅ Role-appropriate URL for contracts
            if is_creator:
                url = "/activecontracts"  # Creator/Employer uses activecontracts
            else:
                url = "/all-contacts"  # Collaborator uses all-contacts

            notification = Notification.objects.create(
                user=user,
                notification_type='contract_updated',
                title=f"Contract {c.status}",
                message=f"Project: {c.job.title if c.job else 'Contract'}",
                contract=c,
                job=c.job,
                url=url,
                is_read=False
            )
            created_count += 1
            logger.info(f"Created contract notification: {notification.id}")

    # ---------------------------------------------------
    # INVITATIONS
    # ---------------------------------------------------
    invitations = Invitation.objects.filter(
        receiver=user,
        created_at__gte=since_time
    ).order_by("-created_at")[:10]

    for inv in invitations:
        if not Notification.objects.filter(
            user=user,
            notification_type='invitation_received',
            invitation=inv
        ).exists():
            
            # sender_name = (
            #     f"{inv.sender.first_name} {inv.sender.last_name}".strip()
            #     if inv.sender.first_name
            #     else inv.sender.email
            # )
            sender_name = inv.sender.full_name or inv.sender.email
            
            # Invitations URL is same for both
            url = "/all-contacts"

            notification = Notification.objects.create(
                user=user,
                sender=inv.sender,
                notification_type='invitation_received',
                title=f"Invitation from {sender_name}",
                message=f"Project: {inv.project_name}",
                invitation=inv,
                job=inv.job,
                url=url,
                is_read=False
            )
            created_count += 1
            logger.info(f"Created invitation notification: {notification.id}")

    # ---------------------------------------------------
    # SUBSCRIPTION EXPIRY
    # ---------------------------------------------------
    subscription = UserSubscription.objects.filter(
        user=user,
        status="active"
    ).first()
    
    if subscription and subscription.plan_end_date:
    
        days_until_expiry = (
            subscription.plan_end_date.date() - now().date()
        ).days
    
        print(
            f"🔔 Subscription check: "
            f"{user.email} | "
            f"Days Remaining = {days_until_expiry}"
        )
    
        if days_until_expiry in [3, 2, 1]:
        
            existing_notification = Notification.objects.filter(
                user=user,
                notification_type='subscription_updated',
                title__icontains=f"{days_until_expiry} day"
            ).exists()
    
            if not existing_notification:
            
                if is_creator:
                    url = "/subscription"
                else:
                    url = "/collab-subscription"
    
                notification = Notification.objects.create(
                    user=user,
                    notification_type='subscription_updated',
                    title=f"Your subscription expires in {days_until_expiry} day{'s' if days_until_expiry > 1 else ''}",
                    message=(
                        f"Your current plan "
                        f"({subscription.current_plan}) "
                        f"will expire soon. Renew now."
                    ),
                    url=url,
                    is_read=False
                )
    
                created_count += 1
    
                logger.info(
                    f"✅ Created expiry notification: "
                    f"{notification.id}"
                )
    
        elif days_until_expiry < 0:
        
            existing_expired = Notification.objects.filter(
                user=user,
                notification_type='subscription_updated',
                title__icontains="expired"
            ).exists()
    
            if not existing_expired:
            
                if is_creator:
                    url = "/subscription"
                else:
                    url = "/collab-subscription"
    
                notification = Notification.objects.create(
                    user=user,
                    notification_type='subscription_updated',
                    title="Your subscription has expired",
                    message=(
                        "Your premium plan has expired. "
                        "Renew now to continue premium access."
                    ),
                    url=url,
                    is_read=False
                )
    
                created_count += 1
    
                logger.info(
                    f"✅ Created expired notification: "
                    f"{notification.id}"
                )

    # ---------------------------------------------------
    # REVIEWS
    # ---------------------------------------------------
    reviews = Review.objects.filter(
        recipient=user,
        created_at__gte=since_time
    ).order_by("-created_at")[:5]

    for r in reviews:
        if not Notification.objects.filter(
            user=user,
            notification_type='review_received',
            review=r
        ).exists():
            
            # reviewer_name = (
            #     f"{r.reviewer.first_name} {r.reviewer.last_name}".strip()
            #     if r.reviewer.first_name
            #     else r.reviewer.email
            # )
            reviewer_name = r.reviewer.full_name or r.reviewer.email

            # ✅ Role-appropriate review URL
            if is_creator:
                url = "/creator-edit-profile"  # Creator profile edit
            else:
                url = "/ColabProfile"  # Collaborator profile
            
            notification = Notification.objects.create(
                user=user,
                sender=r.reviewer,
                notification_type='review_received',
                title=f"You received a {r.rating}-star review",
                message=f"From: {reviewer_name}",
                review=r,
                url=url,
                is_read=False
            )
            created_count += 1
            logger.info(f"Created review notification: {notification.id}")

    # ---------------------------------------------------
    # MENTIONS
    # ---------------------------------------------------
    mentions = Message.objects.filter(
        Q(conversation__user1=user) |
        Q(conversation__user2=user),
        content__icontains=f"@{user.email}",
        created_at__gte=since_time
    ).exclude(sender=user).select_related("sender").order_by("-created_at")[:5]

    for m in mentions:
        if not Notification.objects.filter(
            user=user,
            notification_type='new_message',
            message_obj=m,
            title__icontains="mentioned"
        ).exists():
            
            # sender_name = (
            #     f"{m.sender.first_name} {m.sender.last_name}".strip()
            #     if m.sender.first_name
            #     else m.sender.email
            # )
            sender_name = m.sender.full_name or m.sender.email
            
            url = f"/message?conversation={m.conversation.id}"

            notification = Notification.objects.create(
                user=user,
                sender=m.sender,
                notification_type='new_message',
                title=f"{sender_name} mentioned you",
                message=m.content[:100],
                message_obj=m,
                url=url,
                is_read=False
            )
            created_count += 1
            logger.info(f"Created mention notification: {notification.id}")

    # ---------------------------------------------------
    # WELCOME NOTIFICATION (for new users)
    # ---------------------------------------------------
    if hasattr(user, "created_at") and user.created_at:
        account_age = (now() - user.created_at).days
        if account_age <= 1:  # User joined within last day
            if not Notification.objects.filter(
                user=user,
                notification_type='system',
                title__icontains="Welcome"
            ).exists():
                
                # ✅ Role-appropriate profile URL
                if is_creator:
                    url = "/creator-edit-profile"  # Creator profile
                else:
                    url = "/ColabProfile"  # Collaborator profile
                
                notification = Notification.objects.create(
                    user=user,
                    notification_type='system',
                    title="Welcome to Talenta!",
                    message="Complete your profile to get started",
                    url=url,
                    is_read=False
                )
                created_count += 1
                logger.info(f"Created welcome notification: {notification.id}")

# ============================================================
# DEDICATED FUNCTION FOR PROFILE UPDATE NOTIFICATIONS
# ============================================================
def create_profile_update_notification(user):
    """
    Create a notification when a user updates their profile
    Creates notification EVERY time (no duplicate prevention)
    """
    try:
        print(f"🔔 Creating profile update notification for user: {user.email}")
        
        # Determine role-appropriate URL
        user_role = user.role.lower() if user.role else 'employer'
        is_creator = user_role == 'creator'
        
        if is_creator:
            url = "/creator-edit-profile"
        else:
            url = "/ColabProfile"
        
        # Create notification - WITHOUT timestamp in message
        notification = Notification.objects.create(
            user=user,
            notification_type='system',
            title="Profile updated successfully",
            message="Your profile information was changed",  # Removed the timestamp
            url=url,
            is_read=False
        )
        
        print(f"✅ Created notification ID: {notification.id} for user {user.email}")
        logger.info(f"Created profile update notification {notification.id} for user {user.email}")
        return notification
        
    except Exception as e:
        print(f"❌ Error creating profile update notification: {e}")
        import traceback
        traceback.print_exc()
        logger.error(f"Error creating profile update notification: {e}")
        return None


def get_user_notifications(user):
    """
    Get notifications from database for a user
    If no notifications exist, generate them first
    """
    try:
        generate_and_store_notifications(user)
        
        # Get notifications from database
        notifications = Notification.objects.filter(
            user=user
        ).select_related(
            'sender', 'job', 'proposal', 'contract', 'message_obj', 'invitation', 'review'
        ).order_by('-created_at')[:50]
        
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
                "url": n.url
            }
            
            # Add sender info if exists
            if n.sender:
                notification_data["sender"] = {
                    "id": n.sender.id,
                    # "first_name": n.sender.first_name or n.sender.email,
                    # "last_name": n.sender.last_name,
                    "full_name": n.sender.full_name or n.sender.email,
                    "email": n.sender.email,
                    "profile_picture": get_profile_url(n.sender)
                }
            
            # Add related object IDs for reference
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


def get_unread_count(user):
    """
    Get count of unread notifications for a user
    """
    try:
        return Notification.objects.filter(
            user=user,
            is_read=False
        ).count()
    except Exception as e:
        logger.error(f"Error getting unread count: {e}")
        return 0


def mark_notification_read(user, notification_id):
    """
    Mark a specific notification as read
    """
    try:
        # Ensure notification_id is integer
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
    """
    Mark all notifications as read for a user
    """
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
    """
    Delete notifications older than specified days
    Call this periodically via cron job
    """
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
    """
    Create notification when collaborator likes a job
    """
    try:
        from django.utils.timezone import now
        from datetime import timedelta
        
        # Avoid spam - check if already liked recently (within 1 hour)
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
    """
    Create notification when collaborator saves a job
    """
    try:
        from django.utils.timezone import now
        from datetime import timedelta
        
        # Avoid spam - check if already saved recently (within 1 hour)
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
    """
    Create notification when collaborator submits work
    Notifies the creator that work is ready for review
    """
    try:
        from django.utils.timezone import now
        
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