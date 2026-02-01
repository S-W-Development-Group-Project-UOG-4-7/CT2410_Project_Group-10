from django.contrib import admin

from .models import (
    Profile,
    News,
    InvestmentCategory,
    InvestmentProject,
    Investment,
    AuthLog,
)

# -----------------------------
# Profile
# -----------------------------
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "city", "phone", "created_at")
    list_filter = ("role",)
    search_fields = ("user__username", "user__email")


# -----------------------------
# News
# -----------------------------
@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "date", "status", "created_at")
    list_filter = ("status", "date")
    search_fields = ("title",)


# -----------------------------
# Investment Category
# -----------------------------
@admin.register(InvestmentCategory)
class InvestmentCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at")
    search_fields = ("name",)


# -----------------------------
# Investment Project
# -----------------------------
@admin.register(InvestmentProject)
class InvestmentProjectAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "farmer",
        "category",
        "status",
        "target_amount",
        "current_amount",
        "expected_roi",
        "duration_months",
        "created_at",
    )
    list_filter = ("status", "category", "risk_level", "investment_type")
    search_fields = ("title", "description", "location", "farmer__username")

# -----------------------------
# Investment
# -----------------------------
@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ("investor", "project", "amount", "status", "transaction_id", "created_at")
    list_filter = ("status",)
    search_fields = ("investor__username", "project__title", "transaction_id")


#-----------------------------
#  Auth Log 
#-----------------------------
@admin.register(AuthLog)
class AuthLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "user", "action", "status", "message")
    list_filter = ("action", "status", "created_at")
    search_fields = ("user__username", "user__email", "message")
    ordering = ("-created_at",)