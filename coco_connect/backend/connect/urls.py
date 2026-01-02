from django.urls import path, include
from .views import hello_coco, register, login, me
from rest_framework_simplejwt.views import TokenRefreshView
from connect.jwt_views import MyTokenObtainPairView

urlpatterns = [
    path("hello/", hello_coco),
    path("register/", register),
    path("login/", login),

    path("me/", me),
    path("blockchain/", include("blockchain_records.urls")),

    # ✅ remove the extra "api/"
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
