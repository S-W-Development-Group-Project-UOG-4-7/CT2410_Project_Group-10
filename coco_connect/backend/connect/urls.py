from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    IdeaViewSet,
    RegisterView,
    SimilarityAlertViewSet,
    EmailTokenObtainPairView,
)

router = DefaultRouter()
router.register(r"ideas", IdeaViewSet, basename="ideas")
router.register(r"alerts", SimilarityAlertViewSet, basename="alerts")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", EmailTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("", include(router.urls)),
]
