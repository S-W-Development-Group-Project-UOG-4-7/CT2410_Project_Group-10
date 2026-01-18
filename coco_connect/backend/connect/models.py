from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone  # ✅ needed for Investment.save()


class Idea(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ideas")

    title = models.CharField(max_length=255)
    short_description = models.TextField()
    full_description = models.TextField()

    is_paid = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    document = models.FileField(upload_to="ideas/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # ✅ AI Embedding Vector (for similarity checking)
    embedding = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]  # ✅ newest first automatically

    def __str__(self):
        return f"{self.title}"
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

    # optional fields
    address = models.TextField(null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


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
# INVESTMENT PROJECT
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
        ("active", "Active"),
        ("funded", "Funded"),
        ("completed", "Completed"),
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

    # Farmer
    farmer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="investment_projects"
    )

    # Investment details
    target_amount = models.DecimalField(max_digits=12, decimal_places=2, default=100000)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    expected_roi = models.DecimalField(max_digits=5, decimal_places=2, default=10.0)
    duration_months = models.PositiveIntegerField(default=12)

    # Metadata
    investment_type = models.CharField(
        max_length=10, choices=TYPE_CHOICES, default="equity"
    )
    risk_level = models.CharField(
        max_length=10, choices=RISK_CHOICES, default="medium"
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")

    # Additional
    tags = models.TextField(blank=True, default="", help_text="Comma-separated tags")
    days_left = models.IntegerField(default=30)
    investors_count = models.PositiveIntegerField(default=0)

    # Dates
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

# ----------------------------
# IDEA (AI Similarity Enabled)
# ----------------------------
class Idea(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ideas")

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
        Auto-generate embedding if missing or content changed.
        Keeps similarity system stable and error-free.
        """
        if not self.embedding:
            from .services.embeddings import get_embedding
            text = self.build_text_for_embedding()
            self.embedding = get_embedding(text)

        super().save(*args, **kwargs)

# ----------------------------
# INVESTMENT
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

    investor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="investments"
    )
    project = models.ForeignKey(
        InvestmentProject, on_delete=models.CASCADE, related_name="project_investments"
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=100)

    payment_method = models.CharField(
        max_length=20, choices=PAYMENT_METHOD_CHOICES, default="payhere"
    )
    transaction_id = models.CharField(max_length=100, blank=True, default="")

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    notes = models.TextField(blank=True, default="")
    payment_status = models.CharField(max_length=20, default="pending")

    def __str__(self):
        return f"{self.investor.username} - {self.project.title} - RS.{self.amount}"

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
            self.project.current_amount += self.amount
            self.project.investors_count += 1

            if not self.completed_at:
                self.completed_at = timezone.now()
                super().save(update_fields=["completed_at"])

            if self.project.current_amount >= self.project.target_amount:
                self.project.status = "funded"
                self.project.days_left = 0

            self.project.save()
