from django.contrib import admin

from .models import (
    Profile,
    News,
    InvestmentCategory,
    InvestmentProject,
    Investment,
)

# -----------------------------
# Profile
# -----------------------------
admin.site.register(Profile)


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


# -----------------------------
# Investment Project
# -----------------------------
@admin.register(InvestmentProject)
class InvestmentProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "farmer", "category", "status", "target_amount", "current_amount")
    list_filter = ("status", "category", "risk_level")
    search_fields = ("title", "description", "location")


# -----------------------------
# Investment
# -----------------------------
@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ("investor", "project", "amount", "status", "transaction_id", "created_at")
    list_filter = ("status",)
    search_fields = ("investor__username", "project__title", "transaction_id")
