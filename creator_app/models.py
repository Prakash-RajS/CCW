#models.py

from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.hashers import make_password, check_password

# ============================================================
# 1. ADMIN USER (For Dashboard Login & createsuperuser)
# ============================================================

class AdminUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'SuperAdmin') 
        return self.create_user(email, password, **extra_fields)

class AdminUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100, default="Admin")
    role = models.CharField(max_length=50, default="Admin")

    # Required for Django Admin
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=True) 
    date_joined = models.DateTimeField(default=timezone.now)

    objects = AdminUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return f"Admin: {self.email}"


# ============================================================
# 2. APP USER DATA (For Creators & Collaborators)
# ============================================================

class UserData(models.Model):
    id = models.AutoField(primary_key=True)

    email = models.EmailField(unique=True, blank=True, null=True)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    password = models.CharField(max_length=255, blank=True, null=True)

    userid = models.CharField(max_length=255, unique=True, null=True, blank=True) # Auth0 ID
    provider = models.CharField(max_length=50, blank=True, null=True) 

    role = models.CharField(max_length=50, blank=True, null=True) # Creator or Collaborator
    status = models.CharField(max_length=20, default="Active")
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    location = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True)
    stripe_account_id = models.CharField(max_length=100, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(null=True, blank=True)
    is_typing = models.BooleanField(default=False)
    typing_with = models.IntegerField(null=True, blank=True)

    # Note: No 'is_staff' or 'is_superuser' here because these are NOT admins.

    def set_password(self, raw_password):
        self.password = make_password(raw_password)
        self.save()

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return f"{self.email} ({self.role})"


# ============================================================
# 3. PROFILES (Linked to UserData)
# ============================================================

class CreatorProfile(models.Model):
    user = models.OneToOneField("creator_app.UserData", on_delete=models.CASCADE)
 
    creator_name = models.CharField(max_length=255)
    creator_type = models.CharField(max_length=255)
    experience_level = models.CharField(max_length=100)
 
    primary_niche = models.CharField(max_length=255)
    secondary_niche = models.CharField(max_length=255, blank=True, null=True)
    about = models.TextField(blank=True, null=True)
 
    platforms = models.CharField(max_length=255, blank=True, null=True)
    followers = models.IntegerField(blank=True, null=True)
 
    portfolio_category = models.CharField(max_length=255)

    collaboration_type = models.CharField(max_length=255)
    project_type = models.CharField(max_length=255)
 
    location = models.CharField(max_length=255, blank=True, null=True)
 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    def __str__(self):
        return f"{self.user.email} - Creator Profile"
 
 
# ============================================================
# COLLABORATOR PROFILE MODEL
# ============================================================
 
class CollaboratorProfile(models.Model):
    user = models.OneToOneField("creator_app.UserData", on_delete=models.CASCADE)
 
    name = models.CharField(max_length=255)
    language = models.CharField(max_length=100)
 
    skill_category = models.CharField(max_length=255)
    experience = models.CharField(max_length=100)
    # ✅ ADD THIS LINE:
    skills = models.JSONField(default=list, blank=True) 
    # (Note: If you are on an old Django version, use models.TextField instead)
 
    pricing_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    pricing_unit = models.CharField(max_length=50, blank=True, null=True)
 
    availability = models.CharField(max_length=255, blank=True, null=True)
    timing = models.CharField(max_length=255, blank=True, null=True)
 
    social_link = models.URLField(blank=True, null=True)

    portfolio_category =  models.CharField(max_length=255, blank=True, null=True)
 
    badges = models.CharField(max_length=255, blank=True, null=True)
    skills_rating = models.IntegerField(blank=True, null=True)
    about = models.TextField(blank=True, null=True)
 
    location = models.CharField(max_length=255, blank=True, null=True)
 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
 
    def __str__(self):
        return f"{self.user.email} - Collaborator Profile"


# ============================================================
# 4. JOBS & PROPOSALS
# ============================================================

class JobPost(models.Model):
    TIMELINE_CHOICES = (("small", "Small"), ("medium", "Medium"), ("large", "Large"))
    DURATION_CHOICES = (("1-6 months", "1-6 months"), ("6-12 months", "6-12 months"), ("1+ year", "1+ year"), ("less than 1 month", "Less than 1 month"))
    EXPERTISE_CHOICES = (("fresher", "Fresher"), ("medium", "Medium"), ("experienced", "Experienced"))
    BUDGET_TYPE_CHOICES = (("fixed", "Fixed Price"), ("hourly", "Hourly"))
    STATUS_CHOICES = (("draft", "Draft"), ("posted", "Posted"), ("closed", "Closed"))

    employer = models.ForeignKey(UserData, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    skills = models.JSONField(default=list, blank=True)
    timeline = models.CharField(max_length=20, choices=TIMELINE_CHOICES)
    duration = models.CharField(max_length=50, choices=DURATION_CHOICES)
    expertise_level = models.CharField(max_length=20, choices=EXPERTISE_CHOICES)
    budget_type = models.CharField(max_length=20, choices=BUDGET_TYPE_CHOICES)
    budget_from = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_to = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="posted")
    attachments = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self): return self.title

class Proposal(models.Model):
    STATUS_CHOICES = (("submitted", "Submitted"), ("withdrawn", "Withdrawn"), ("accepted", "Accepted"), ("rejected", "Rejected"))
    PAYMENT_CHOICES = (("project", "By Project"), ("milestone", "By Milestone"))

    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="proposals")
    freelancer = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="my_proposals")
    payment_type = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="project")
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    milestone_description = models.TextField(blank=True, null=True)
    milestone_due_date = models.DateField(blank=True, null=True) 
    milestone_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    duration = models.CharField(max_length=100, blank=True, null=True)
    cover_letter = models.TextField(blank=True, null=True)
    skills = models.JSONField(default=list, blank=True, null=True)
    expertise = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    attachments = models.JSONField(default=list, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self): return f"Proposal {self.id}"

class Contract(models.Model):
    STATUS_CHOICES = (("pending", "Pending"), ("awaiting", "Awaiting"), ("in_progress", "In Progress"), ("completed", "Completed"), ("cancelled", "Cancelled"))
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE)
    creator = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="creator_contracts")
    collaborator = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="collaborator_contracts")
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    work_description = models.TextField(blank=True, null=True)
    work_attachment = models.FileField(upload_to="work_submissions/", null=True, blank=True)
    work_submitted_at = models.DateTimeField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

class Invitation(models.Model):
    STATUS_CHOICES = (("Pending", "Pending"), ("Accepted", "Accepted"), ("Rejected", "Rejected"))
    sender = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="sent_invitations")
    receiver = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="received_invitations")
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="invitations", null=True, blank=True)
    client_name = models.CharField(max_length=255)
    project_name = models.CharField(max_length=255)
    date = models.DateField()
    revenue = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    created_at = models.DateTimeField(auto_now_add=True)

# ============================================================
# 5. CHAT / MESSAGING
# ============================================================

class Conversation(models.Model):
    user1 = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="convo_user1")
    user2 = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="convo_user2")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: unique_together = ('user1', 'user2')
    def __str__(self): return f"Convo: {self.user1.email} & {self.user2.email}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(UserData, on_delete=models.CASCADE)
    content = models.TextField()
    is_seen = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    seen_at = models.DateTimeField(null=True, blank=True)
    reply_to = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL, related_name="replies")
    file = models.FileField(upload_to="message_files/", null=True, blank=True)
    message_type = models.CharField(max_length=20, default="text")
    def __str__(self): return f"Msg from {self.sender.email}"

# ============================================================
# 6. SUBSCRIPTIONS & PLANS
# ============================================================

class SubscriptionPlan(models.Model):
    DURATION_CHOICES = (("monthly", "Monthly"), ("yearly", "Yearly"), ("lifetime", "Lifetime"))
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    duration = models.CharField(max_length=20, choices=DURATION_CHOICES, default="monthly")
    features = models.JSONField(default=dict, blank=True)
    limits = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def max_users(self): return self._get_limit("max_users", 1)
    @property
    def max_workspaces(self): return self._get_limit("max_workspaces", 1)
    @property
    def max_storage(self): return self._get_limit("max_storage", 1)
    @property
    def max_invitations(self): return self._get_limit("max_invitations", 5)
    @property
    def max_job_posts(self): return self._get_limit("max_job_posts", 2)
    @property
    def max_proposals(self): return self._get_limit("max_proposals", 5)

    def _get_limit(self, key, default):
        if isinstance(self.features, dict):
            limits = self.features.get("limits", {})
            return limits.get(key) if limits.get(key) is not None else default
        return default
    def __str__(self): return f"{self.name} ({self.duration})"

class UserSubscription(models.Model):
    user = models.OneToOneField(UserData, on_delete=models.CASCADE)
    email = models.EmailField()
    current_plan = models.CharField(max_length=50, default="Basic")
    duration = models.CharField(max_length=20, blank=True, null=True)
    renew_date = models.DateTimeField(blank=True, null=True)          
    plan_started_at = models.DateTimeField(auto_now_add=True)
    plan_expires_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self): return f"{self.user.email} - {self.current_plan}"

# ============================================================
# 7. WALLET & BILLING
# ============================================================

class Wallet(models.Model):
    user = models.OneToOneField(UserData, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=10, default="USD")
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self): return f"{self.user.email} - ${self.balance}"

class WalletTransaction(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=255)
    user = models.ForeignKey(UserData, on_delete=models.SET_NULL, null=True, blank=True, related_name="my_wallet_actions")
    from_user = models.ForeignKey(UserData, on_delete=models.SET_NULL, null=True, blank=True, related_name="sent_transactions")
    to_user = models.ForeignKey(UserData, on_delete=models.SET_NULL, null=True, blank=True, related_name="received_transactions")
    created_at = models.DateTimeField(auto_now_add=True)

class BillingHistory(models.Model):
    user = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="invoices")
    plan_name = models.CharField(max_length=50)
    duration = models.CharField(max_length=20, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50, default="Card", blank=True, null=True)
    status = models.CharField(max_length=50)
    invoice_id = models.CharField(max_length=255, blank=True, null=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    paid_on = models.DateTimeField(auto_now_add=True)

class BillingInfo(models.Model):
    user = models.OneToOneField(UserData, on_delete=models.CASCADE, related_name="billing_info")
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

# ============================================================
# 8. MISC & UTILITIES
# ============================================================

class UserVerification(models.Model):
    user = models.OneToOneField(UserData, on_delete=models.CASCADE, related_name="verification")
    phone_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    phone_otp = models.CharField(max_length=6, blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    email = models.EmailField(blank=True, null=True)
    email_otp = models.CharField(max_length=6, blank=True, null=True)
    facebook_verified = models.BooleanField(default=False)
    facebook_user_id = models.CharField(max_length=100, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
    def is_fully_verified(self): return all([self.phone_verified, self.email_verified])

class UserPreferences(models.Model):
    user = models.OneToOneField(UserData, on_delete=models.CASCADE, related_name='preferences')
    theme = models.CharField(max_length=20, default='System')
    time_zone = models.CharField(max_length=50, default='UTC')
    date_format = models.CharField(max_length=20, default='ISO Format')
    default_dashboard = models.CharField(max_length=50, default='Overview Dashboard')

class SavedJob(models.Model):
    user = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="saved_jobs")
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="saved_by_users")
    saved_at = models.DateTimeField(auto_now_add=True)
    class Meta: unique_together = ('user', 'job')

class RecentlyViewedJob(models.Model):
    user = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="viewed_jobs")
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="views")
    viewed_at = models.DateTimeField(auto_now=True)

class Review(models.Model):
    reviewer = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="given_reviews")
    recipient = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="received_reviews")
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta: unique_together = ('reviewer', 'recipient')

class TransactionHistory(models.Model):
    STATUS_CHOICES = [('Success', 'Success'), ('Pending', 'Pending'), ('Rejected', 'Rejected')]
    user = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="transactions")
    date = models.DateField(auto_now_add=True)
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=50, default="Card")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    class Meta: ordering = ['-date']

class TestModel(models.Model):
    name = models.CharField(max_length=255)
    def __str__(self): return self.name
    
def portfolio_upload_path(instance, filename):
    """
    Stores files based on role:
    - creator      -> portfolio_uploads/creator/
    - collaborator -> portfolio_uploads/collaborator/
    """
    return f"portfolio_uploads/{instance.role}/{filename}"

class PortfolioItem(models.Model):
    user = models.ForeignKey(
        "creator_app.UserData",
        on_delete=models.CASCADE,
        related_name="portfolio_items"
    )

    role = models.CharField(
        max_length=20,
        choices=[("creator", "Creator"), ("collaborator", "Collaborator")]
    )

    title = models.CharField(max_length=255)
    media_link = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    file = models.FileField(
        upload_to=portfolio_upload_path,  # 🔥 dynamic path
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)