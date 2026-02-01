# connect/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings
# =================================================
# NOTE ABOUT MERGE CLASH (IMPORTANT)
# =================================================
# You had TWO classes named `Idea` in the same file (one from "main" branch
# and one AI-enhanced version later). Django cannot have two models with the
# same class name in one app.
#
# To avoid losing any code, the older/simple version is preserved as
# `IdeaLegacy` and the newer AI-enabled one remains `Idea`.
#
# If you want to keep only one in the DB later, we can migrate safely.
# =================================================

# ----------------------------
# IDEA SHARING (Legacy version preserved)
# ----------------------------
class IdeaLegacy(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ideas_legacy")

    title = models.CharField(max_length=255)
    short_description = models.TextField()
    full_description = models.TextField()

    is_paid = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    document = models.FileField(upload_to="ideas/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # AI Embedding Vector (for similarity checking) — kept because it existed in this branch
    embedding = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]  # newest first

    def __str__(self):
        return self.title


# ----------------------------
# PROFILE
# ----------------------------
class Profile(models.Model):
    ROLE_CHOICES = [
        ("farmer", "Farmer"),
        ("investor", "Investor"),
        ("buyer", "Buyer"),
        ("admin", "Admin"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="buyer")

    address = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)

    # These fields appeared in your migrations merge output (bio, created_at),
    # but weren’t present in the snippet above. Keeping them would avoid future drift.
    # If you *don’t* actually have these in DB yet, migrations will handle it.
    bio = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# ----------------------------
# NEWS CORNER
# ----------------------------
class News(models.Model):
    STATUS_CHOICES = (
        ("Draft", "Draft"),
        ("Published", "Published"),
    )

    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Draft")

    image = models.ImageField(upload_to="news/", null=True, blank=True)

    date = models.DateField()
    likes = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


# ----------------------------
# PRODUCT (Marketplace)
# ----------------------------
class Product(models.Model):
    CATEGORY_CHOICES = [
        ("oil", "Coconut Oil"),
        ("fiber", "Coir Fiber"),
        ("water", "Coconut Water"),
    ]

    TYPE_CHOICES = [
        ("Raw Materials", "Raw Materials"),
        ("Processed Goods", "Processed Goods"),
        ("Equipment", "Equipment"),
    ]

    STOCK_CHOICES = [
        ("In Stock", "In Stock"),
        ("Low Stock", "Low Stock"),
        ("Out of Stock", "Out of Stock"),
    ]

    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    stock = models.CharField(max_length=20, choices=STOCK_CHOICES)
    description = models.TextField()
    reviews = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)

    def __str__(self):
        return self.name


# ----------------------------
# INVESTMENT CATEGORY
# ----------------------------
class InvestmentCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ----------------------------
# INVESTMENT PROJECT (UPDATED with new fields)
# ----------------------------
class InvestmentProject(models.Model):
    TYPE_CHOICES = [
        ("equity", "Equity Investment"),
        ("loan", "Loan"),
    ]

    RISK_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending Approval"),
        ("active", "Active"),
        ("funded", "Funded"),
        ("completed", "Completed"),
        ("rejected", "Rejected"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()

    category = models.ForeignKey(
        InvestmentCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )
    location = models.CharField(max_length=100, default="Colombo")

    farmer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="investment_projects",
    )
    
    # New farmer fields for frontend display
    #farmer_name = models.CharField(max_length=255, blank=True)
    #farmer_experience = models.IntegerField(default=0)
    #farmer_rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.5)

    target_amount = models.DecimalField(max_digits=12, decimal_places=2, default=100000)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    expected_roi = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    duration_months = models.PositiveIntegerField(default=12)

    investment_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default="equity")
    risk_level = models.CharField(max_length=10, choices=RISK_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    tags = models.TextField(blank=True, default="", help_text="Comma-separated tags")
    days_left = models.IntegerField(default=30)
    investors_count = models.PositiveIntegerField(default=0)

    # NEW FIELDS for share-based investment
    total_units = models.IntegerField(default=1000)
    available_units = models.IntegerField(default=1000)
    unit_price = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    investment_structure = models.CharField(
        max_length=20, 
        choices=[('fixed', 'Fixed Amount'), ('units', 'Share/Unit Based')], 
        default='fixed'
    )
    
    # File fields
    image = models.ImageField(upload_to='project_images/', null=True, blank=True)
    business_plan = models.FileField(upload_to='business_plans/', null=True, blank=True)
    additional_docs = models.FileField(upload_to='additional_docs/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def get_tags_list(self):
        if self.tags:
            return [tag.strip() for tag in self.tags.split(",") if tag.strip()]
        return []

    def progress_percentage(self):
        if self.target_amount > 0:
            return (self.current_amount / self.target_amount) * 100
        return 0

    def funding_needed(self):
        return self.target_amount - self.current_amount
    
    def save(self, *args, **kwargs):
        # Auto-calculate unit price for equity projects
        if self.investment_type == 'equity' and self.total_units > 0:
            if not self.unit_price or self.unit_price == 0:
                self.unit_price = self.target_amount / self.total_units
            if self.available_units == 1000:  # Default value
                self.available_units = self.total_units
            self.investment_structure = 'units'
        
        # Set farmer name if not provided
        #if not self.farmer_name and self.farmer:
        #    self.farmer_name = f"{self.farmer.first_name} {self.farmer.last_name}".strip()
        
        super().save(*args, **kwargs)

# ----------------------------
# INVESTMENT (FINAL – KEEP THIS ONE)
# ----------------------------
class Investment(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    PAYMENT_METHOD_CHOICES = [
        ("payhere", "PayHere"),
        ("stripe", "Stripe/Card"),
        ("bank", "Bank Transfer"),
    ]

    INVESTMENT_TYPE_CHOICES = [
        ("fixed_amount", "Fixed Amount"),
        ("unit_purchase", "Share / Unit Purchase"),
    ]

    INVESTMENT_STRUCTURE_CHOICES = [
        ("fixed", "Fixed Amount"),
        ("units", "Share / Unit Based"),
    ]

    investor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="investments",
    )

    project = models.ForeignKey(
        InvestmentProject,
        on_delete=models.CASCADE,
        related_name="project_investments",
    )

    amount = models.DecimalField(max_digits=12, decimal_places=2, default=100)

    # Unit-based investment fields
    units = models.IntegerField(null=True, blank=True)
    unit_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )
    total_units = models.IntegerField(null=True, blank=True)
    ownership_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )

    investment_type = models.CharField(
        max_length=20,
        choices=INVESTMENT_TYPE_CHOICES,
        default="fixed_amount",
    )

    investment_structure = models.CharField(
        max_length=20,
        choices=INVESTMENT_STRUCTURE_CHOICES,
        default="fixed",
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default="payhere",
    )

    transaction_id = models.CharField(max_length=100, blank=True, default="")

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    notes = models.TextField(blank=True, default="")
    payment_status = models.CharField(max_length=20, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.investor.username} → {self.project.title} → Rs.{self.amount}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        old_status = None

        if not is_new:
            old_status = (
                Investment.objects.filter(pk=self.pk)
                .values_list("status", flat=True)
                .first()
            )

        super().save(*args, **kwargs)

        became_completed = (
            (is_new and self.status == "completed")
            or (old_status != "completed" and self.status == "completed")
        )

        if became_completed:
            project = self.project

            # Update funding
            project.current_amount += self.amount
            project.investors_count += 1

            # Update units if unit-based
            if self.units and self.investment_type == "unit_purchase":
                project.available_units -= self.units

            if not self.completed_at:
                self.completed_at = timezone.now()
                super().save(update_fields=["completed_at"])

            if project.current_amount >= project.target_amount:
                project.status = "funded"
                project.days_left = 0

            project.save()


# ----------------------------
# IDEA (AI Similarity Enabled)  ✅ This remains the primary Idea model
# ----------------------------
class Idea(models.Model):
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="ideas",
    )

    title = models.CharField(max_length=255)
    short_description = models.TextField()
    full_description = models.TextField()

    is_paid = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    document = models.FileField(upload_to="ideas/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # ✅ AI Embedding Vector (used for similarity)
    embedding = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def build_text_for_embedding(self):
        return f"{self.title}\n{self.short_description}\n{self.full_description}".strip()

    def save(self, *args, **kwargs):
        """
        Auto-generate embedding if missing.
        Keeps similarity system stable.
        """
        if not self.embedding:
            from .services.embeddings import get_embedding
            self.embedding = get_embedding(self.build_text_for_embedding())

        super().save(*args, **kwargs)


# ----------------------------
# SIMILARITY ALERT (FIXED)
# ----------------------------
class SimilarityAlert(models.Model):
    # 🟢 ORIGINAL IDEA (owner receives alert)
    idea = models.ForeignKey(
        "Idea",
        on_delete=models.CASCADE,
        related_name="similarity_alerts",
    )

    # 🔴 NEW IDEA (created later by another user)
    similar_idea = models.ForeignKey(
        "Idea",
        on_delete=models.CASCADE,
        related_name="triggered_alerts",
    )

    similarity_score = models.FloatField()
    is_reported = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["idea", "similar_idea"],
                name="unique_similarity_alert",
            )
        ]

    def __str__(self):
        return (
            f"Alert → {self.idea.author.email} | "
            f"{self.idea.title} ~ {self.similar_idea.title} | "
            f"{round(self.similarity_score * 100)}%"
        )


#---------------------------------
#   Auth Log
#---------------------------------
class AuthLog(models.Model):
    class Action(models.TextChoices):
        LOGIN = "LOGIN", "Login"
        LOGOUT = "LOGOUT", "Logout"

    class Status(models.TextChoices):
        SUCCESS = "SUCCESS", "Success"
        FAILED = "FAILED", "Failed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="auth_logs",
    )
    action = models.CharField(max_length=10, choices=Action.choices)
    status = models.CharField(max_length=10, choices=Status.choices)
    message = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["created_at"]),
            models.Index(fields=["action", "status"]),
        ]

    def __str__(self):
        username = self.user.username if self.user else "UnknownUser"
        return f"{self.created_at:%Y-%m-%d %H:%M:%S} | {username} | {self.action} | {self.status}"
    
    
# ----------------------------
# PROJECT DRAFT (USED BY REACT)
# ----------------------------
class ProjectDraft(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="project_drafts",
    )

    idea = models.ForeignKey(
        Idea,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="draft_projects",
    )

    title = models.CharField(max_length=255)
    description = models.TextField()

    location = models.CharField(max_length=100, default="Colombo")
    duration_months = models.PositiveIntegerField(default=12)

    # Investment toggle
    needs_investment = models.BooleanField(default=False)

    # Investment planning
    target_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
    )

    expected_roi = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )

    investment_type = models.CharField(
        max_length=10,
        choices=[
            ("equity", "Equity"),
            ("loan", "Loan"),
        ],
        null=True,
        blank=True,
        default="loan",
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ("draft", "Draft"),
            ("submitted", "Submitted"),
            ("approved", "Approved"),
        ],
        default="draft",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Draft: {self.title}"


# ----------------------------
# PROJECT DRAFT MATERIAL
# ----------------------------
class ProjectDraftMaterial(models.Model):
    draft = models.ForeignKey(          # ✅ FIXED NAME
        ProjectDraft,
        on_delete=models.CASCADE,
        related_name="materials",       # ✅ REQUIRED for React
    )

    name = models.CharField(max_length=100)
    quantity = models.FloatField(default=0)

    unit_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def total_cost(self):
        try:
            return float(self.quantity) * float(self.unit_cost)
        except Exception:
            return 0

    def __str__(self):
        return f"{self.name} × {self.quantity}"