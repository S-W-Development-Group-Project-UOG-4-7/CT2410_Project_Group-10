from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from connect.jwt_views import MyTokenObtainPairView
from . import views
from .views import IdeaViewSet

router = DefaultRouter()
router.register(r"ideas", IdeaViewSet, basename="ideas")

urlpatterns = [
    # BASIC
    path("hello/", views.hello_coco, name="hello_coco"),

    # AUTH
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
    path("me/", views.me, name="me"),
    path("change-password/", views.change_password, name="change_password"),

    # JWT
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # INVESTMENT
    path("projects/", views.get_projects, name="get_projects"),
    path("projects/<int:project_id>/", views.get_project_detail, name="get_project_detail"),
    path("make-investment/", views.create_investment, name="create_investment"),
    path("my-investments/", views.my_investments, name="my_investments"),
    path("categories/", views.get_categories, name="get_categories"),
    path("locations/", views.get_locations, name="get_locations"),
    path("stats/", views.get_platform_stats, name="get_platform_stats"),
    path("create-demo-projects/", views.create_demo_projects, name="create_demo_projects"),

    # BLOCKCHAIN
    path("blockchain/", include("blockchain_records.urls")),
]

# ✅ this line is what enables /api/ideas/
urlpatterns += router.urls
