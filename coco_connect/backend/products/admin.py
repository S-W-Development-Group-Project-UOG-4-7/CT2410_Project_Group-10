from django.contrib import admin
from .models import (
    Category,
    ProductType,
    Product,
    NewsItem,
    Cart,
    CartItem,
)


# =========================
# CATEGORY ADMIN
# =========================
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin configuration for Category model"""
    list_display = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ["name"]


# =========================
# PRODUCT TYPE ADMIN
# =========================
@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):
    """Admin configuration for ProductType model"""
    list_display = ["name"]
    search_fields = ["name"]


# =========================
# PRODUCT ADMIN
# =========================
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin configuration for Product model"""
    list_display = [
        "name",
        "author",
        "category",
        "product_type",
        "price",
        "stock_status",
        "created_at",
    ]
    list_filter = [
        "category",
        "product_type",
        "stock_status",
        "created_at",
    ]
    search_fields = ["name", "description"]
    readonly_fields = ["created_at"]
    list_editable = ["price", "stock_status"]


# =========================
# NEWS ADMIN
# =========================
@admin.register(NewsItem)
class NewsItemAdmin(admin.ModelAdmin):
    """Admin configuration for NewsItem model"""
    list_display = ["text", "is_active", "created_at"]
    list_filter = ["is_active", "created_at"]
    search_fields = ["text"]
    list_editable = ["is_active"]


# =========================
# CART ITEM INLINE
# =========================
class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ["product", "quantity", "total_price"]
    can_delete = True


# =========================
# CART ADMIN
# =========================
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    """Admin configuration for Cart model"""
    list_display = ["user", "total_items", "created_at"]
    search_fields = ["user__email", "user__username"]
    readonly_fields = ["created_at", "total_items"]
    inlines = [CartItemInline]


# =========================
# CART ITEM ADMIN (OPTIONAL)
# =========================
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """Admin configuration for CartItem model"""
    list_display = ["cart", "product", "quantity", "total_price"]
    search_fields = ["product__name", "cart__user__email"]
    list_filter = ["product"]
