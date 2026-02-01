from django.urls import path
from django.http import JsonResponse
from .views import verify_product


from .views import (
    ProductListAPIView,
    ProductCreateAPIView,
    ProductUpdateAPIView,
    NewsListAPIView,
    CategoryListAPIView,
    CheckoutCreateAPIView,
    PayHereInitFromCart,
    PayHereManualCompleteAPIView,
    PayHereInvoiceAPIView,
    payhere_notify,
    AddToCartView,
    CartDetailView,
    CartClearView,
    CartItemUpdateDeleteView,
    MyOrdersAPIView,
    OrderDetailAPIView,
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
    path("<int:pk>/", ProductUpdateAPIView.as_view(), name="product-update"),
    path("news/", NewsListAPIView.as_view(), name="news-list"),
    path("categories/", CategoryListAPIView.as_view(), name="category-list"),
    path("checkout/", CheckoutCreateAPIView.as_view(), name="checkout-create"),
    path("payhere/init-cart/", PayHereInitFromCart.as_view(), name="payhere-init-cart"),
    path("payhere/complete/<str:order_id>/", PayHereManualCompleteAPIView.as_view(), name="payhere-complete"),
    path("payhere/invoice/<str:order_id>/", PayHereInvoiceAPIView.as_view(), name="payhere-invoice"),
    path("payhere/notify/", payhere_notify, name="payhere-notify"),

    # ----- Cart (AUTH REQUIRED) -----
    path("cart/add/", AddToCartView.as_view(), name="cart-add"),
    path("cart/", CartDetailView.as_view(), name="cart-detail"),
    path("cart/clear/", CartClearView.as_view(), name="cart-clear"),
    path(
        "cart/item/<int:pk>/",
        CartItemUpdateDeleteView.as_view(),
        name="cart-item-update-delete",
    ),

    # ----- Customer Orders -----
    path("orders/", MyOrdersAPIView.as_view(), name="my-orders"),
    path("orders/<int:order_id>/", OrderDetailAPIView.as_view(), name="order-detail"),

    # ----- Health -----
    path("health/", health_check, name="health-check"),

    #Blockchain - verify
    path("<int:pk>/verify/", verify_product, name="verify-product")

]
