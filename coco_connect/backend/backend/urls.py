from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

from rest_framework_simplejwt.views import TokenRefreshView
from connect.jwt_views import MyTokenObtainPairView


def api_root(request):
    return JsonResponse(
        {
            "status": "ok",
            "routes": {
                "hello": "/api/hello/",
                "register": "/api/register/",
                "login": "/api/login/",
                "me": "/api/me/",
                "users": "/api/users/",
                "products": "/api/products/",
                "token": "/api/token/",
                "token_refresh": "/api/token/refresh/",
                "blockchain": "/api/blockchain/",
            },
        }
    )


urlpatterns = [
    # Admin
    path("admin/", admin.site.urls),

    # ✅ API root (must be ABOVE "api/" include if it was same path; we use "" here)
    path("api/", api_root, name="api_root"),

    # ✅ Main API (connect app endpoints)
    path("api/", include("connect.urls")),

    # Products app
    path("api/products/", include("products.urls")),

    # Blockchain app (if you want it directly here; optional if already inside connect.urls)
    # path("api/blockchain/", include("blockchain_records.urls")),

    # JWT AUTH (single source of truth)
    path("api/token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)