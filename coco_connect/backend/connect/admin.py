from django.contrib import admin
from .models import Profile
from .models import News

admin.site.register(Profile)

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "date", "status", "created_at")
    list_filter = ("status", "date")
    search_fields = ("title",)