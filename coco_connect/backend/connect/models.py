from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [
        ("farmer", "Farmer"),
        ("investor", "Investor"),
        ("buyer", "Buyer"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
# ADD THESE MODELS AFTER YOUR EXISTING Profile model

# Investment Category Model
class InvestmentCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

# Investment Project Model
class InvestmentProject(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('funded', 'Fully Funded'),
        ('completed', 'Completed'),
    ]
    
    INVESTMENT_TYPE_CHOICES = [
        ('equity', 'Equity Investment'),
        ('loan', 'Loan'),
    ]
    
    RISK_LEVEL_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(InvestmentCategory, on_delete=models.SET_NULL, null=True, blank=True)
    location = models.CharField(max_length=100)
    
    # Farmer Information (linked to User)
    farmer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    
    # Financial Information
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    expected_roi = models.FloatField()
    duration_months = models.IntegerField()
    investment_type = models.CharField(max_length=20, choices=INVESTMENT_TYPE_CHOICES)
    risk_level = models.CharField(max_length=10, choices=RISK_LEVEL_CHOICES)
    
    # Project Details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    investors_count = models.IntegerField(default=0)
    days_left = models.IntegerField(default=30)
    
    # Tags
    tags = models.CharField(max_length=500, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    @property
    def funding_percentage(self):
        if self.target_amount == 0:
            return 0
        return (self.current_amount / self.target_amount) * 100
    
    @property
    def funding_needed(self):
        return self.target_amount - self.current_amount
    
    @property
    def tag_list(self):
        return [tag.strip() for tag in self.tags.split(',')] if self.tags else []

# Investment Model
class Investment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
    ]
    
    investor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='investments')
    project = models.ForeignKey(InvestmentProject, on_delete=models.CASCADE, related_name='project_investments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Payment Information
    payment_method = models.CharField(max_length=50, default='payhere')
    transaction_id = models.CharField(max_length=100, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.investor.username} - ${self.amount}"
    
    def save(self, *args, **kwargs):
        # Generate transaction ID
        if not self.transaction_id:
            count = Investment.objects.count()
            self.transaction_id = f"INV-{count + 1:06d}"
        super().save(*args, **kwargs)
