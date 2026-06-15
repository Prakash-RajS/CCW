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
    profile_image = models.CharField(max_length=500, blank=True, null=True)
    preferences = models.JSONField(default=dict, blank=True)

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
    full_name = models.CharField(max_length=100, blank=True, null=True)
    password = models.CharField(max_length=255, blank=True, null=True)

    userid = models.CharField(max_length=255, unique=True, null=True, blank=True)  # Auth0 ID
    provider = models.CharField(max_length=50, blank=True, null=True)

    role = models.CharField(max_length=50, blank=True, null=True)  # Creator or Collaborator
    status = models.CharField(max_length=20, default="Active")
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)


    # Stripe — kept for subscription billing
    stripe_account_id = models.CharField(max_length=100, null=True, blank=True)

    # Cashfree — wallet payouts only
    cashfree_beneficiary_id = models.CharField(
        max_length=100, null=True, blank=True,
        help_text="Cashfree Payout beneficiary ID for wallet withdrawals"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(null=True, blank=True)
    is_typing = models.BooleanField(default=False)
    typing_with = models.IntegerField(null=True, blank=True)

    withdrawal_methods = models.JSONField(default=list, blank=True)

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
    skills_required = models.JSONField(default=list, blank=True)


    platforms = models.CharField(max_length=255, blank=True, null=True)
    followers = models.IntegerField(blank=True, null=True)

    portfolio_category = models.CharField(max_length=255)

    collaboration_type = models.CharField(max_length=255)
    project_type = models.CharField(max_length=255)

    location = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - Creator Profile"


class CollaboratorProfile(models.Model):
    user = models.OneToOneField("creator_app.UserData", on_delete=models.CASCADE, related_name="collaborator_profile")

    name = models.CharField(max_length=255)
    language = models.CharField(max_length=100)   
    skill_category = models.CharField(max_length=255)
    experience = models.CharField(max_length=100)
    skills = models.JSONField(default=list, blank=True)
    collaboration_type = models.CharField(max_length=255, blank=True, null=True)
    followers = models.IntegerField(default=0, blank=True, null=True)
    pricing_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    pricing_unit = models.CharField(max_length=50, blank=True, null=True)
    pricing_type = models.CharField(max_length=50, default="hourly", blank=True, null=True)
    availability = models.CharField(max_length=255, blank=True, null=True)
    timing = models.CharField(max_length=255, blank=True, null=True)
    social_link = models.URLField(blank=True, null=True)
    portfolio_link = models.URLField(max_length=500, blank=True, null=True)
    liked_jobs = models.JSONField(default=list, blank=True)

    # REMOVED: portfolio_uploads and portfolio_headings - now using PortfolioItem model

    portfolio_category = models.CharField(max_length=255, blank=True, null=True)
    badges = models.CharField(max_length=255, blank=True, null=True)
    skills_rating = models.IntegerField(blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=255, blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_projects = models.IntegerField(default=0, blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.skill_category}"
 
 





# ============================================================
# 4. JOBS & PROPOSALS
# ============================================================

class JobPost(models.Model):
    TIMELINE_CHOICES = (("small", "Small"), ("medium", "Medium"), ("large", "Large"))
    # Updated DURATION_CHOICES to include days, weeks, months, years
    DURATION_CHOICES = (
        # Days
        ("1 Day", "1 Day"),
        ("2 Days", "2 Days"),
        ("3 Days", "3 Days"),
        ("4 Days", "4 Days"),
        ("5 Days", "5 Days"),
        ("6 Days", "6 Days"),
        ("7 Days", "7 Days"),
        ("14 Days", "14 Days"),
        ("21 Days", "21 Days"),
        ("30 Days", "30 Days"),
        # Weeks
        ("1 Week", "1 Week"),
        ("2 Weeks", "2 Weeks"),
        ("3 Weeks", "3 Weeks"),
        # Months
        ("1 Month", "1 Month"),
        ("2 Months", "2 Months"),
        ("3 Months", "3 Months"),
        ("4 Months", "4 Months"),
        ("5 Months", "5 Months"),
        ("6 Months", "6 Months"),
        ("7 Months", "7 Months"),
        ("8 Months", "8 Months"),
        ("9 Months", "9 Months"),
        ("10 Months", "10 Months"),
        ("11 Months", "11 Months"),
        ("12 Months", "12 Months"),
        # Years
        ("1 Year", "1 Year"),
        ("2 Years", "2 Years"),
        ("3 Years", "3 Years"),
    )
    EXPERTISE_CHOICES = (("fresher", "Fresher"), ("medium", "Medium"), ("experienced", "Experienced"))
    BUDGET_TYPE_CHOICES = (("fixed", "Fixed Price"), ("hourly", "Hourly"))
    STATUS_CHOICES = (("draft", "Draft"), ("posted", "Posted"), ("closed", "Closed"))

    employer = models.ForeignKey(UserData, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField()
    skills = models.JSONField(default=list, blank=True)
    timeline = models.CharField(max_length=20, choices=TIMELINE_CHOICES)
    duration = models.CharField(max_length=50, choices=DURATION_CHOICES)  # Now includes days!
    expertise_level = models.CharField(max_length=20, choices=EXPERTISE_CHOICES)
    budget_type = models.CharField(max_length=20, choices=BUDGET_TYPE_CHOICES)
    budget_from = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_to = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="posted")
    attachments = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    has_contract = models.BooleanField(default=False)

    # NEW FIELD: Store duration in days for easy calculation
    duration_days = models.IntegerField(null=True, blank=True, default=0, help_text="Duration in days (auto-calculated)")


    def __str__(self): 
        return self.title

    def calculate_duration_days(self):
        """Convert duration string to days"""
        if not self.duration:
            return 30

        duration_str = self.duration.lower().strip()

        # Extract number from string
        import re
        numbers = re.findall(r'\d+', duration_str)
        if not numbers:
            return 30

        value = int(numbers[0])

        # Calculate days based on unit
        if 'day' in duration_str:
            return value
        elif 'week' in duration_str:
            return value * 7
        elif 'month' in duration_str:
            return value * 30
        elif 'year' in duration_str:
            return value * 365
        else:
            return 30

    def save(self, *args, **kwargs):
        """Calculate duration_days before saving"""
        if self.duration:
            self.duration_days = self.calculate_duration_days()
            print(f"📝 Job '{self.title}': duration='{self.duration}', days={self.duration_days}")
        super().save(*args, **kwargs)

class Proposal(models.Model):
    STATUS_CHOICES = (("submitted", "Submitted"), ("withdrawn", "Withdrawn"), ("accepted", "Accepted"), ("rejected", "Rejected"))
    PAYMENT_CHOICES = (("project", "By Project"), ("milestone", "By Milestone"))

    job = models.ForeignKey(JobPost, on_delete=models.CASCADE, related_name="proposals")
    freelancer = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="my_proposals")
    payment_type = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="project")
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    milestone_description = models.TextField(blank=True, null=True)
    milestone_due_date = models.DateField(blank=True, null=True) 
    milestones_data = models.JSONField(default=list, blank=True, null=True)
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
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("awaiting", "Awaiting"),
        ("in_progress", "In Progress"),
        ("in_review", "In Review"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled")
    )

    job = models.ForeignKey(JobPost, on_delete=models.CASCADE)
    creator = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="creator_contracts")
    collaborator = models.ForeignKey(UserData, on_delete=models.CASCADE, related_name="collaborator_contracts")
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    milestones_data = models.JSONField(default=list, blank=True, null=True)
    work_description = models.TextField(blank=True, null=True)
    external_file_link = models.URLField(max_length=1000, blank=True, null=True)
    work_attachment = models.FileField(upload_to="work_submissions/", null=True, blank=True)
    work_submitted_at = models.DateTimeField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_paid = models.BooleanField(default=False)
    revision_description = models.TextField(blank=True, null=True, help_text="Creator's feedback when requesting revision")
    status_reason = models.TextField(
    blank=True, null=True,
    help_text="Reason provided when setting status to pending or cancelled"
)
    current_milestone = models.IntegerField(default=0, help_text="Index of current active milestone (0-based)")
    total_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def calculate_end_date(self):
        """Calculate end_date based on job duration from start_date"""
        if not self.start_date or not self.job:
            return None

        from datetime import timedelta

        # ✅ FIRST: Use duration_days from job
        if hasattr(self.job, 'duration_days') and self.job.duration_days and self.job.duration_days > 0:
            days = self.job.duration_days
            print(f"📅 Contract {self.id}: Using {days} days from job.duration_days")
            return self.start_date + timedelta(days=days)

        # ❌ FALLBACK: Only if duration_days is not set
        duration_str = self.job.duration.lower().strip()
        import re
        numbers = re.findall(r'\d+', duration_str)

        if not numbers:
            days = 30
        else:
            value = int(numbers[0])
            if 'day' in duration_str:
                days = value
            elif 'week' in duration_str:
                days = value * 7
            elif 'month' in duration_str:
                days = value * 30
            elif 'year' in duration_str:
                days = value * 365
            else:
                days = 30

        print(f"📅 Contract {self.id}: Parsed {days} days from '{duration_str}'")
        return self.start_date + timedelta(days=days)


    def save(self, *args, **kwargs):
        """Auto-calculate end_date when start_date is set"""
        if self.start_date and not self.end_date:
            self.end_date = self.calculate_end_date()
            print(f"📅 Contract {self.id}: Auto-calculated end_date = {self.end_date}")
        super().save(*args, **kwargs)
 

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
    edited = models.BooleanField(default=False)

    def __str__(self): return f"Msg from {self.sender.email}"

# In creator_app/models.py
class MessageReaction(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(UserData, on_delete=models.CASCADE)
    emoji = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['message', 'user', 'emoji']  # Prevent duplicate reactions

    def __str__(self):
        return f"{self.user.email} reacted {self.emoji} to message {self.message.id}"
 

# ============================================================
# 6. SUBSCRIPTIONS & PLANS
# ============================================================

class SubscriptionPlan(models.Model):
    DURATION_CHOICES = (
        ("monthly", "Monthly"),
        ("yearly", "Yearly"),
        ("lifetime", "Lifetime"),
    )

    # FIXED: Remove 'both' option, keep only creator and collaborator
    ROLE_CHOICES = (
        ("creator", "Creator"),
        ("collaborator", "Collaborator"),
    )

    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    duration = models.CharField(max_length=20, choices=DURATION_CHOICES, default="monthly")

    # FIXED: Default to None - require explicit role assignment
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        blank=True,  # Allow blank temporarily
        null=True,   # Allow null temporarily
        help_text="Which user role this plan is for"
    )

    # Features stored as JSON - includes both display text and limits
    features = models.JSONField(default=list, blank=True)
    limits = models.JSONField(default=dict, blank=True)

    description = models.TextField(blank=True, null=True)
    is_popular = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    created_by = models.EmailField(blank=True, null=True)
    updated_by = models.EmailField(blank=True, null=True)

    discount_code = models.CharField(max_length=50, blank=True, null=True)
    discount_percentage = models.IntegerField(default=0, blank=True, null=True)
    discount_description = models.CharField(max_length=255, blank=True, null=True)

    # =========================================================
    # PROPERTIES
    # =========================================================

    @property
    def max_users(self):
        return self._get_limit("max_users", default=1)

    @property
    def max_workspaces(self):
        return self._get_limit("max_workspaces", default=1)

    @property
    def max_storage(self):
        return self._get_limit("max_storage", default=1)

    @property
    def max_invitations(self):
        return self._get_limit("max_invitations", default=5)

    @property
    def max_job_posts(self):
        return self._get_limit("max_job_posts", default=2)

    @property
    def max_proposals(self):
        return self._get_limit("max_proposals", default=5)

    @property
    def discounted_price(self):
        """Calculate discounted price"""
        if self.discount_percentage and self.discount_percentage > 0:
            discount = (self.discount_percentage / 100) * float(self.price)
            return float(self.price) - discount
        return float(self.price)

    def _get_limit(self, key, default):
        if isinstance(self.limits, dict):
            val = self.limits.get(key)
            return val if val is not None else default
        return default

    def __str__(self):
        role_display = dict(self.ROLE_CHOICES).get(self.role, "")
        return f"{self.name} - ₹{self.price}/{self.duration} ({role_display})"

    class Meta:
        ordering = ['price']
 
    
# ============================================================
# USER SUBSCRIPTION MODEL
# ============================================================

class UserSubscription(models.Model):
    """
    Cleaned & optimized subscription model
    Compatible with FastAPI expiry checker
    """

    user = models.OneToOneField(
        "creator_app.UserData",
        on_delete=models.CASCADE,
        related_name="subscription"
    )

    email = models.EmailField()

    # =========================================================
    # PLAN INFO
    # =========================================================
    current_plan = models.CharField(
        max_length=100,
        default="Basic"
    )

    plan_name = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    duration = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    # =========================================================
    # PRICING
    # =========================================================
    plan_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0.00
    )

    # =========================================================
    # SUBSCRIPTION DATES
    # =========================================================
    plan_start_date = models.DateTimeField(
        blank=True,
        null=True
    )

    plan_end_date = models.DateTimeField(
        blank=True,
        null=True
    )

    renewal_date = models.DateTimeField(
        blank=True,
        null=True
    )

    # =========================================================
    # PAYMENT / STRIPE
    # =========================================================
    stripe_subscription_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    stripe_customer_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    # =========================================================
    # STATUS
    # =========================================================
    status = models.CharField(
        max_length=20,
        default="active",
        choices=[
            ("active", "Active"),
            ("cancelled", "Cancelled"),
            ("expired", "Expired"),
            ("past_due", "Past Due"),
            ("trialing", "Trialing"),
            ("incomplete", "Incomplete"),
            ("pending", "Pending"),
            ("failed", "Failed"),
        ]
    )

    # =========================================================
    # CANCELLATION
    # =========================================================
    cancel_at_period_end = models.BooleanField(
        default=False
    )

    canceled_at = models.DateTimeField(
        blank=True,
        null=True
    )

    # =========================================================
    # INVOICE INFO
    # =========================================================
    last_invoice_url = models.TextField(
        blank=True,
        null=True
    )

    last_invoice_number = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    last_payment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    last_payment_date = models.DateTimeField(
        blank=True,
        null=True
    )

    # =========================================================
    # TRIAL
    # =========================================================
    is_trial = models.BooleanField(
        default=False
    )

    trial_ends_at = models.DateTimeField(
        blank=True,
        null=True
    )

    # =========================================================
    # METADATA
    # =========================================================
    metadata = models.JSONField(
        default=dict,
        blank=True
    )

    # =========================================================
    # TIMESTAMPS
    # =========================================================
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # =========================================================
    # META
    # =========================================================
    class Meta:

        verbose_name = "User Subscription"

        verbose_name_plural = "User Subscriptions"

        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["status"]),
            models.Index(fields=["plan_end_date"]),
        ]

    # =========================================================
    # STRING
    # =========================================================
    def __str__(self):

        trial_msg = " (Trial)" if self.is_trial else ""

        return (
            f"{self.email} - "
            f"{self.current_plan}"
            f"{trial_msg} "
            f"({self.status})"
        )

    # =========================================================
    # ACTIVE CHECK
    # =========================================================
    @property
    def is_active(self):

        now = timezone.now()

        if self.status not in ["active", "trialing"]:
            return False

        if self.plan_end_date:

            if self.plan_end_date < now:
                return False

        return True

    # =========================================================
    # DAYS REMAINING
    # =========================================================
    @property
    def days_remaining(self):

        if not self.is_active:
            return 0

        if not self.plan_end_date:
            return 0

        now = timezone.now()

        if self.plan_end_date > now:

            delta = self.plan_end_date - now

            return delta.days

        return 0

    # =========================================================
    # TRIAL DAYS REMAINING
    # =========================================================
    @property
    def trial_days_remaining(self):

        if not self.is_trial:
            return 0

        if not self.trial_ends_at:
            return 0

        now = timezone.now()

        if self.trial_ends_at > now:

            delta = self.trial_ends_at - now

            return delta.days

        return 0

    # =========================================================
    # NEXT BILLING DATE
    # =========================================================
    @property
    def next_billing_date(self):

        if self.renewal_date:
            return self.renewal_date

        return self.plan_end_date

    # =========================================================
    # TOTAL PAID
    # =========================================================
    @property
    def total_paid(self):

        if self.last_payment_amount:
            return self.last_payment_amount

        return self.plan_price

    # =========================================================
    # SAVE
    # =========================================================
    def save(self, *args, **kwargs):

        # Sync email
        if self.user and not self.email:
            self.email = self.user.email

        # Auto set renewal date
        if not self.renewal_date and self.plan_end_date:
            self.renewal_date = self.plan_end_date

        super().save(*args, **kwargs)

    # =========================================================
    # CANCEL SUBSCRIPTION
    # =========================================================
    def cancel_subscription(self, at_period_end=True):

        self.cancel_at_period_end = at_period_end

        self.canceled_at = timezone.now()

        if at_period_end:
            self.status = "active"
        else:
            self.status = "cancelled"

        self.save()

    # =========================================================
    # ACTIVATE SUBSCRIPTION
    # =========================================================
    def activate_subscription(self):

        self.status = "active"

        self.cancel_at_period_end = False

        self.canceled_at = None

        self.save()

# ============================================================
# INVOICE MODEL (OPTIONAL - for better invoice management)
# ============================================================
class Invoice(models.Model):
    """Model to track invoices - COMPATIBLE WITH FASTAPI"""
    user = models.ForeignKey(
        "creator_app.UserData", 
        on_delete=models.CASCADE,
         related_name="stripe_invoices"
    )
    subscription = models.ForeignKey(
        UserSubscription,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="invoices"
    )
    
    # Invoice details
    invoice_number = models.CharField(max_length=100, unique=True)
    stripe_invoice_id = models.CharField(max_length=255, blank=True, null=True)
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default='usd')
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Invoice status
    status = models.CharField(
        max_length=20,
        choices=[
            ('draft', 'Draft'),
            ('open', 'Open'),
            ('paid', 'Paid'),
            ('uncollectible', 'Uncollectible'),
            ('void', 'Void'),
        ],
        default='draft'
    )
    
    # Dates
    invoice_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(blank=True, null=True)
    paid_date = models.DateTimeField(blank=True, null=True)
    
    # File storage
    pdf_file = models.FileField(
        upload_to='invoices/',
        blank=True,
        null=True,
        help_text="Downloaded invoice PDF"
    )
    pdf_url = models.URLField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-invoice_date']
        verbose_name = "Invoice"
        verbose_name_plural = "Invoices"
    
    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.user.email}"

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
    email_verified = models.BooleanField(default=False)
    email = models.EmailField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Verification for {self.user.email}"

    def is_fully_verified(self): 
        return all([self.phone_verified, self.email_verified])
 
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
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="reviews", null=True, blank=True)  # ← add this
    rating = models.IntegerField(default=5)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta: unique_together = ('reviewer', 'contract') 

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
    
# ==============================================================================
#                        P o r t f o l i o   I t e m   (FINAL CHECK)
# ==============================================================================

from django.db import models


# 🔹 Dynamic upload path
def portfolio_upload_path(instance, filename):
    return f"portfolio_uploads/{instance.role}/{filename}"


class PortfolioItem(models.Model):
    ROLE_CHOICES = [
        ("creator", "Creator"),
        ("collaborator", "Collaborator"),
    ]

    # 🔹 Linked User
    user = models.ForeignKey(
        "creator_app.UserData",
        on_delete=models.CASCADE,
        related_name="portfolio_items",
        null=True,
        blank=True
    )

    # 🔹 Role (Creator / Collaborator)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="creator"
    )

    # 🔹 Work Name/Title
    heading = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Work name/title"
    )

    # 🔹 Optional media URL (YouTube / Behance etc.)
    media_link = models.URLField(
        blank=True,
        null=True
    )
    
    # 🔹 Keep title for backward compatibility or remove it
    title = models.CharField(max_length=255, blank=True, null=True)

    # 🔹 Description
    description = models.TextField(
        blank=True,
        null=True
    )

    # 🔹 File Upload
    file = models.FileField(
        upload_to=portfolio_upload_path,
        blank=True,
        null=True,
        max_length=500
    )

    # 🔹 Display Order
    order = models.IntegerField(
        default=0,
        help_text="Order of display"
    )

    # 🔹 Created timestamp
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["order", "-created_at"]
        verbose_name = "Portfolio Item"
        verbose_name_plural = "Portfolio Items"

    def __str__(self):
        if self.user:
            user_email = self.user.email
        else:
            user_email = "No User"

        heading_text = self.heading[:30] if self.heading else "No Heading"
        return f"{self.role} - {user_email} - {heading_text}"

# Add this new model after UserSubscription model

# Add or update this model in your models.py

class SubscriptionHistory(models.Model):
    """
    Immutable log of every subscription event for a user.
    One new row per event — never updated after creation.

    action choices cover every call-site in payment.py:
      created  | renewed | expired | downgraded | cancelled |
      updated  | trial_started | trial_ended | converted
    """
    id = models.AutoField(primary_key=True)

    user = models.ForeignKey(
        "creator_app.UserData",
        on_delete=models.CASCADE,
        related_name="subscription_history"
    )
    email = models.EmailField()

    # ── Plan snapshot at the time of the event ────────────────────────────────
    plan_name  = models.CharField(max_length=100)
    duration   = models.CharField(max_length=50, default="monthly")
    plan_price = models.DecimalField(max_digits=10, decimal_places=2)

    # ── Period covered by this subscription event ─────────────────────────────
    start_date = models.DateTimeField()
    end_date   = models.DateTimeField(null=True, blank=True)

    # ── Trial flag (preserved for eligibility checks) ─────────────────────────
    was_trial        = models.BooleanField(default=False)
    trial_started_at = models.DateTimeField(null=True, blank=True)
    trial_ended_at   = models.DateTimeField(null=True, blank=True)

    # ── Status at the time of the event ──────────────────────────────────────
    status = models.CharField(max_length=20, default="active")

    # ── Stripe references (snapshot) ─────────────────────────────────────────
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_customer_id     = models.CharField(max_length=255, blank=True, null=True)

    # ── Invoice reference ─────────────────────────────────────────────────────
    invoice_number = models.CharField(max_length=100, blank=True, null=True)

    # ── What happened ────────────────────────────────────────────────────────
    action = models.CharField(
        max_length=20,
        choices=[
            ('created',       'Created'),
            ('renewed',       'Renewed'),          # ← NEW
            ('updated',       'Updated'),
            ('cancelled',     'Cancelled'),
            ('expired',       'Expired'),
            ('downgraded',    'Downgraded'),        # ← NEW
            ('trial_started', 'Trial Started'),
            ('trial_ended',   'Trial Ended'),
            ('converted',     'Trial Converted to Paid'),
        ],
        default='created'
    )

    # ── When this record was written ─────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)

    # ── ForeignKey to the plan row (optional — plan may be deleted later) ─────
    plan_id = models.IntegerField(null=True, blank=True)

    stripe_event_id = models.CharField(
    max_length=255,
    unique=True,
    null=True,
    blank=True
)


    class Meta:
        ordering = ['-created_at']
        verbose_name = "Subscription History"
        verbose_name_plural = "Subscription History"
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['email', 'was_trial']),
            models.Index(fields=['user', 'stripe_subscription_id']),
        ]

    def __str__(self):
        trial = " (Trial)" if self.was_trial else ""
        return f"{self.email} — {self.plan_name}{trial} — {self.action} @ {self.created_at.date()}"
 
        
        
# ============================================================
# WORK EXPERIENCE MODEL (for Collaborator)
# ============================================================
 
class WorkExperience(models.Model):
    """Model to store work experience entries for collaborators"""
    user = models.ForeignKey(
        "creator_app.UserData",
        on_delete=models.CASCADE,
        related_name="work_experiences"
    )
   
    company_name = models.CharField(max_length=255)
    role = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    start_year = models.CharField(max_length=20)  # e.g., "Sep 2016"
    end_year = models.CharField(max_length=20, blank=True, null=True)  # e.g., "July 2020" or "Present"
    is_current = models.BooleanField(default=False)
   
    # Order for display
    order = models.IntegerField(default=0, help_text="Order of display (newest first)")
   
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
   
    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = "Work Experience"
        verbose_name_plural = "Work Experiences"
   
    def __str__(self):
        return f"{self.company_name} - {self.role} ({self.start_year} - {self.end_year or 'Present'})"
 
 
# ============================================================
# EDUCATION MODEL (for Collaborator)
# ============================================================
 
class Education(models.Model):
    """Model to store education entries for collaborators"""
    user = models.ForeignKey(
        "creator_app.UserData",
        on_delete=models.CASCADE,
        related_name="educations"
    )
   
    institution_name = models.CharField(max_length=255)  # University/School name
    degree = models.CharField(max_length=255)  # e.g., "Master in Design"
    field_of_study = models.CharField(max_length=255, blank=True, null=True)  # e.g., "Computer Science"
    description = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    start_year = models.CharField(max_length=20)  # e.g., "2019" or "Sep 2016"
    end_year = models.CharField(max_length=20, blank=True, null=True)  # e.g., "2021" or "Present"
    is_current = models.BooleanField(default=False)  # For ongoing education
   
    # Order for display
    order = models.IntegerField(default=0, help_text="Order of display (newest first)")
   
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
   
    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = "Education"
        verbose_name_plural = "Educations"
   
    def __str__(self):
        return f"{self.institution_name} - {self.degree} ({self.start_year} - {self.end_year or 'Present'})"
    
# ============================================================
# ADMIN NOTIFICATION READ STATUS
# ============================================================

class AdminNotificationRead(models.Model):
    """
    Stores which admin has read which notification.
    We only store the notification ID, not the notification itself.
    """

    admin = models.ForeignKey(
        "creator_app.AdminUser",
        on_delete=models.CASCADE,
        related_name="read_notifications"
    )

    notification_id = models.CharField(max_length=255)

    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("admin", "notification_id")
        indexes = [
            models.Index(fields=["admin", "notification_id"])
        ]

    def __str__(self):
        return f"{self.admin.email} read {self.notification_id}"
    
    
   
# ============================================================
# NOTIFICATION MODEL
# ============================================================
 
class Notification(models.Model):
 
    NOTIFICATION_TYPES = [
        ("proposal_submitted", "Proposal Submitted"),
        ("proposal_accepted", "Proposal Accepted"),
        ("proposal_rejected", "Proposal Rejected"),
        ("new_message", "New Message"),
        ("contract_created", "Contract Created"),
        ("contract_updated", "Contract Updated"),
        ("invitation_received", "Invitation Received"),
        ("job_posted", "Job Posted"),
        ("payment_received", "Payment Received"),
        ("subscription_updated", "Subscription Updated"),
        ("review_received", "Review Received"),
        ("system", "System Notification"),
    ]
 
    # Receiver
    user = models.ForeignKey(
        "creator_app.UserData",
        on_delete=models.CASCADE,
        related_name="notifications"
    )
 
    # Sender (optional)
    sender = models.ForeignKey(
        "creator_app.UserData",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_notifications"
    )
 
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES
    )
 
    title = models.CharField(max_length=255)
    message = models.TextField()
 
    is_read = models.BooleanField(default=False)
 
    # Optional object references
    job = models.ForeignKey(
        "creator_app.JobPost",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
 
    proposal = models.ForeignKey(
        "creator_app.Proposal",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
 
    contract = models.ForeignKey(
        "creator_app.Contract",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
 
    message_obj = models.ForeignKey(
        "creator_app.Message",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
 
    invitation = models.ForeignKey(
        "creator_app.Invitation",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
 
    review = models.ForeignKey(
        "creator_app.Review",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
 
    # frontend redirect url
    url = models.CharField(
        max_length=500,
        blank=True,
        null=True
    )
 
    # Optional icon for UI
    icon = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )
 
    created_at = models.DateTimeField(auto_now_add=True)
 
    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read"]),
            models.Index(fields=["created_at"]),
        ]
 
    def __str__(self):
        return f"{self.user.email} - {self.notification_type}"
    
class ContractWorkAssignment(models.Model):


    contract = models.ForeignKey(
        Contract,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    attachment = models.FileField(
        upload_to="work_assignments/",
        null=True,
        blank=True
    )


    created_at = models.DateTimeField(auto_now_add=True)
    
# ============================================================
# ADD THIS TO YOUR creator_app/models.py  (at the bottom)
# ============================================================

class DropdownOption(models.Model):
    CATEGORY_CHOICES = [
        ('creator_category',  'Creator Category'),
        ('primary_niche',     'Primary Niche'),
        ('secondary_niche',   'Secondary Niche'),
        ('platform',          'Platform'),
        ('followers_range',   'Followers Range'),
        ('portfolio_category','Portfolio Category'),
        ('skill_category',    'Skill Category'),
    ]

    category   = models.CharField(max_length=60, choices=CATEGORY_CHOICES, db_index=True)
    label      = models.CharField(max_length=120)   # shown to user: "UI/UX Designer"
    value      = models.CharField(max_length=120)   # sent to API:   "uiux"
    order      = models.PositiveIntegerField(default=0)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'order', 'label']
        unique_together = [['category', 'value']]

    def __str__(self):
        return f"[{self.get_category_display()}] {self.label}"
 
 
 # creator_app/models.py

class AdminNotification(models.Model):
    """
    Model to store admin-specific notifications for tracking admin activities
    """
    NOTIFICATION_TYPES = [
        ('admin_login', 'Admin Login'),
        ('admin_logout', 'Admin Logout'),
        ('admin_profile_updated', 'Admin Profile Updated'),
        ('admin_password_changed', 'Admin Password Changed'),
        ('admin_2fa_toggled', '2FA Setting Changed'),
        ('admin_image_uploaded', 'Admin Image Uploaded'),
        ('admin_image_removed', 'Admin Image Removed'),
        ('admin_preferences_updated', 'Admin Preferences Updated'),
        ('admin_account_deleted', 'Admin Account Deleted'),
        ('user_created', 'User Created'),
        ('user_updated', 'User Updated'),
        ('user_deleted', 'User Deleted'),
        ('user_password_changed', 'User Password Changed'),
        ('users_exported', 'Users Data Exported'),
        ('new_user', 'New User Registered'),
        ('job_post', 'New Job Posted'),
        ('proposal', 'New Proposal Submitted'),
        ('proposal_rejected', 'Proposal Rejected'),
        ('payment', 'Payment Received'),
        ('contract_completed', 'Contract Completed'),
        ('password_change', 'User Password Changed'),
        ('plan_created', 'Subscription Plan Created'),
        ('plan_updated', 'Subscription Plan Updated'),
        ('plan_deleted', 'Subscription Plan Deleted'),
    ]
    
    admin = models.ForeignKey(
        'AdminUser', 
        on_delete=models.CASCADE, 
        related_name='notifications',
        help_text="The admin user who should receive this notification"
    )
    notification_type = models.CharField(
        max_length=50, 
        choices=NOTIFICATION_TYPES,
        help_text="Type of notification"
    )
    title = models.CharField(
        max_length=255,
        help_text="Notification title"
    )
    subtitle = models.TextField(
        help_text="Notification description/subtitle"
    )
    related_id = models.IntegerField(
        null=True, 
        blank=True,
        help_text="ID of related object (user_id, job_id, etc.)"
    )
    is_read = models.BooleanField(
        default=False,
        help_text="Whether the notification has been read"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the notification was created"
    )
    
    class Meta:
        db_table = 'admin_notifications'
        ordering = ['-created_at']
        verbose_name = 'Admin Notification'
        verbose_name_plural = 'Admin Notifications'
        indexes = [
            models.Index(fields=['admin', '-created_at']),
            models.Index(fields=['admin', 'is_read']),
            models.Index(fields=['notification_type']),
        ]
    
    def __str__(self):
        return f"[{self.notification_type}] {self.title} - {self.admin.email}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.save(update_fields=['is_read'])
        
        
class UserLoginActivity(models.Model):
    user = models.ForeignKey("creator_app.UserData", on_delete=models.CASCADE)
    device = models.CharField(max_length=50)
    location = models.CharField(max_length=100, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    login_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.device}"
    
    
class UserStorage(models.Model):
    """Track user storage usage with automatic plan limit updates"""
    user = models.OneToOneField(
        "creator_app.UserData", 
        on_delete=models.CASCADE,
        related_name="storage_tracking"
    )

    # Current storage usage (in bytes)
    used_bytes = models.BigIntegerField(default=0, help_text="Current storage used in bytes")

    # Storage limit from current plan (in bytes) - cached for performance
    limit_bytes = models.BigIntegerField(default=0, help_text="Storage limit from current plan in bytes")

    # For quick display (cached values)
    used_gb = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    limit_gb = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Tracking
    last_updated = models.DateTimeField(auto_now=True)
    plan_snapshot = models.JSONField(default=dict, blank=True, help_text="Snapshot of the plan when last updated")

    class Meta:
        verbose_name = "User Storage"
        verbose_name_plural = "User Storage"
        indexes = [
            models.Index(fields=['user', 'used_bytes']),
        ]

    def __str__(self):
        return f"{self.user.email}: {self.used_gb} GB / {self.limit_gb} GB"

    @property
    def percentage_used(self):
        """Calculate percentage of storage used"""
        if self.limit_bytes == 0:
            return 0
        return (self.used_bytes / self.limit_bytes) * 100

    @property
    def is_unlimited(self):
        """Check if user has unlimited storage"""
        return self.limit_bytes == 0

    @property
    def remaining_bytes(self):
        """Calculate remaining storage in bytes"""
        if self.limit_bytes == 0:
            return float('inf')
        return max(0, self.limit_bytes - self.used_bytes)

    @property
    def remaining_gb(self):
        """Calculate remaining storage in GB"""
        if self.limit_bytes == 0:
            return float('inf')
        return round(self.remaining_bytes / (1024 ** 3), 2)

    def update_limit_from_plan(self, plan):
        """Update storage limit based on subscription plan"""
        if plan and plan.limits:
            max_storage_gb = plan.limits.get("max_upload_storage_gb", 0)
            # Convert GB to bytes (0 means unlimited)
            self.limit_bytes = max_storage_gb * (1024 ** 3) if max_storage_gb > 0 else 0
            self.limit_gb = max_storage_gb

            # Store plan snapshot for audit
            self.plan_snapshot = {
                "plan_name": plan.name,
                "plan_role": plan.role,
                "max_storage_gb": max_storage_gb,
                "updated_at": timezone.now().isoformat()
            }
        else:
            self.limit_bytes = 0
            self.limit_gb = 0
            self.plan_snapshot = {}

        self.save(update_fields=['limit_bytes', 'limit_gb', 'plan_snapshot', 'last_updated'])

    def add_usage(self, bytes_to_add):
        """Add to storage usage"""
        self.used_bytes += bytes_to_add
        self.used_gb = self.used_bytes / (1024 ** 3)
        self.save(update_fields=['used_bytes', 'used_gb', 'last_updated'])

    def remove_usage(self, bytes_to_remove):
        """Remove from storage usage"""
        self.used_bytes = max(0, self.used_bytes - bytes_to_remove)
        self.used_gb = self.used_bytes / (1024 ** 3)
        self.save(update_fields=['used_bytes', 'used_gb', 'last_updated'])

    def can_upload(self, file_size_bytes):
        """Check if user can upload a file of given size"""
        if self.limit_bytes == 0:  # Unlimited
            return True, None

        if self.used_bytes + file_size_bytes <= self.limit_bytes:
            return True, None

        remaining_gb = self.remaining_gb
        return False, f"Storage limit exceeded. Available: {remaining_gb:.2f} GB"

# ============================================================
# SIGNALS FOR AUTO-UPDATING STORAGE LIMITS
# ============================================================

from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
import os

@receiver(post_save, sender=UserSubscription)
def update_storage_limit_on_subscription_change(sender, instance, created, **kwargs):
    """Update user's storage limit when subscription changes"""
    try:
        # Try to get or create UserStorage record
        storage, created = UserStorage.objects.get_or_create(user=instance.user)

        # Get the plan details
        if instance.current_plan:
            plan = SubscriptionPlan.objects.filter(
                name__iexact=instance.current_plan,
                is_active=True
            ).first()

            if plan:
                storage.update_limit_from_plan(plan)
            else:
                # Default to 0 (unlimited) if plan not found
                storage.limit_bytes = 0
                storage.limit_gb = 0
                storage.save()
    except Exception as e:
        # Log error but don't break the subscription save
        print(f"Error updating storage limit: {e}")


@receiver(post_save, sender=UserData)
def create_user_storage_on_user_creation(sender, instance, created, **kwargs):
    """Create storage tracking record when a new user is created"""
    if created:
        UserStorage.objects.get_or_create(user=instance)

        # If user has a subscription, update limits
        try:
            if hasattr(instance, 'subscription') and instance.subscription:
                subscription = instance.subscription
                if subscription.current_plan:
                    plan = SubscriptionPlan.objects.filter(
                        name__iexact=subscription.current_plan,
                        is_active=True
                    ).first()
                    if plan:
                        storage = UserStorage.objects.get(user=instance)
                        storage.update_limit_from_plan(plan)
        except:
            pass


# Signal handlers for file uploads/deletions
# Add these when a file is uploaded in your application
def track_file_upload(user, file_path, file_size_bytes):
    """Call this function when a file is uploaded"""
    try:
        storage = UserStorage.objects.get(user=user)
        storage.add_usage(file_size_bytes)

        # Optionally, store file reference for later cleanup
        # You might want to create a FileReference model to track which files belong to which user
        return True
    except UserStorage.DoesNotExist:
        # Create storage record if it doesn't exist
        storage = UserStorage.objects.create(user=user)
        storage.add_usage(file_size_bytes)
        return True
    except Exception as e:
        print(f"Error tracking file upload: {e}")
        return False


def track_file_deletion(user, file_size_bytes):
    """Call this function when a file is deleted"""
    try:
        storage = UserStorage.objects.get(user=user)
        storage.remove_usage(file_size_bytes)
        return True
    except UserStorage.DoesNotExist:
        return False
    except Exception as e:
        print(f"Error tracking file deletion: {e}")
        return False
    
 