from django.urls import path
from django.http import JsonResponse
from .views import verify_product


from .views import (
    ProductListAPIView,
    ProductCreateAPIView,
    NewsListAPIView,
    CategoryListAPIView,
    AddToCartView,
    CartDetailView,
    CartItemUpdateDeleteView,
)

app_name = "products"


# =========================
# HEALTH CHECK
# =========================
def health_check(request):
    """
    Health check endpoint to verify API is working.
    NOTE: In your backend/main urls.py you mount this app at:
      path("api/products/", include("products.urls"))
    So the real URLs start with /api/products/
    """
    return JsonResponse(
        {
            "status": "healthy",
            "message": "Products API is running",
            "endpoints": {
                "products": "/api/products/",
                "create_product": "/api/products/create/",
                "news": "/api/products/news/",
                "cart_add": "/api/products/cart/add/",
                "cart_detail": "/api/products/cart/",
                "cart_item": "/api/products/cart/item/<id>/",
                "health": "/api/products/health/",
            },
        }
    )


# =========================
# URL PATTERNS
# =========================
urlpatterns = [
    # ----- Products -----
    path("", ProductListAPIView.as_view(), name="product-list"),
    path("create/", ProductCreateAPIView.as_view(), name="product-create"),
    path("news/", NewsListAPIView.as_view(), name="news-list"),
    path("categories/", CategoryListAPIView.as_view(), name="category-list"),

    # ----- Cart (AUTH REQUIRED) -----
    path("cart/add/", AddToCartView.as_view(), name="cart-add"),
    path("cart/", CartDetailView.as_view(), name="cart-detail"),
    path(
        "cart/item/<int:pk>/",
        CartItemUpdateDeleteView.as_view(),
        name="cart-item-update-delete",
    ),

    # ----- Health -----
    path("health/", health_check, name="health-check"),

    #Blockchain - verify
    path("<int:pk>/verify/", verify_product, name="verify-product")

]
