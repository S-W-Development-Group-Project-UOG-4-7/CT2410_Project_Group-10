from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


def api_root(request):
    """Simple API root to verify backend is running"""
    return JsonResponse({
        "status": "ok",
        "routes": {
            "auth": "/api/auth/",
            "products": "/api/products/",
            "token": "/api/token/",
            "token_refresh": "/api/token/refresh/",
        }
    })


urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # API Root (optional but helpful)
    path("api/", api_root),

    # Authentication (login / register)
    path("api/auth/", include("connect.urls")),

    # Products + News + Cart (mounted inside products.urls)
    path("api/products/", include("products.urls")),

    # JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
