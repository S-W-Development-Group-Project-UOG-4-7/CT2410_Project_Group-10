from django.contrib import admin
from .models import Product, Category, ProductType, NewsItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin configuration for Category model"""
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ['name']


@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):
    """Admin configuration for ProductType model"""
    list_display = ['name']
    search_fields = ['name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin configuration for Product model"""
    list_display = ['name', 'author', 'category', 'product_type', 'price', 'stock_status', 'created_at']
    list_filter = ['category', 'product_type', 'stock_status', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']
    list_editable = ['price', 'stock_status']


@admin.register(NewsItem)
class NewsItemAdmin(admin.ModelAdmin):
    """Admin configuration for NewsItem model"""
    list_display = ['text', 'is_active']
    list_filter = ['is_active']
    search_fields = ['text']
    list_editable = ['is_active']
