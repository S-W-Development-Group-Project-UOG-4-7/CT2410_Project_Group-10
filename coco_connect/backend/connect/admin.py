from django.contrib import admin
from .models import Profile
from .models import News

admin.site.register(Profile)

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "date", "status", "created_at")
    list_filter = ("status", "date")
    search_fields = ("title",)

# ADD THESE AFTER YOUR EXISTING admin.site.register(Profile)

from .models import InvestmentCategory, InvestmentProject, Investment

@admin.register(InvestmentCategory)
class InvestmentCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']

@admin.register(InvestmentProject)
class InvestmentProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'farmer', 'category', 'status', 'target_amount', 'current_amount']
    list_filter = ['status', 'category', 'risk_level']
    search_fields = ['title', 'description', 'location']

@admin.register(Investment)
class InvestmentAdmin(admin.ModelAdmin):
    list_display = ['investor', 'project', 'amount', 'status', 'transaction_id', 'created_at']
    list_filter = ['status']
    search_fields = ['investor__username', 'project__title', 'transaction_id']
