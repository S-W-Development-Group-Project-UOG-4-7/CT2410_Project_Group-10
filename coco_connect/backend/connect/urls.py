from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import IdeaViewSet, RegisterView

router = DefaultRouter()
router.register(r"ideas", IdeaViewSet, basename="ideas")

urlpatterns = [
    # 🔓 Register
    path("register/", RegisterView.as_view(), name="register"),

    # 🔐 JWT Login (THIS WAS MISSING ❌)
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

urlpatterns += router.urls
