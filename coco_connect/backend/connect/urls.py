# connect/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("hello/", views.hello_coco, name="hello_coco"),

    # Investment
    path("projects/", views.get_projects, name="get_projects"),
    path("projects/<int:project_id>/", views.get_project_detail, name="get_project_detail"),
    path("make-investment/", views.create_investment, name="create_investment"),
    path("my-investments/", views.my_investments),


    # Optional
    path("categories/", views.get_categories, name="get_categories"),
    path("locations/", views.get_locations, name="get_locations"),
    path("stats/", views.get_platform_stats, name="get_platform_stats"),
    path("create-demo-projects/", views.create_demo_projects, name="create_demo_projects"),

    # Auth (if you use them)
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
]
from django.urls import path, include
from .views import hello_coco, register, login, me, change_password
from rest_framework_simplejwt.views import TokenRefreshView
from connect.jwt_views import MyTokenObtainPairView

urlpatterns = [
    path("hello/", hello_coco),
    path("register/", register),
    path("login/", login),

    path("me/", me),
    path("api/change-password/", change_password),
    path("blockchain/", include("blockchain_records.urls")),

    # ✅ remove the extra "api/"
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
