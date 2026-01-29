<<<<<<< HEAD
from django.urls import path


from .views import hello_coco,  register, login
=======
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from connect.jwt_views import MyTokenObtainPairView
from . import views
from .views import IdeaViewSet, NewsViewSet


# ----------------------------
# DRF ROUTER
# ----------------------------
router = DefaultRouter()
router.register(r"ideas", IdeaViewSet, basename="ideas")
router.register(r"news", NewsViewSet, basename="news")
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370


# ----------------------------
# URL PATTERNS
# ----------------------------
urlpatterns = [
    # BASIC
    path("hello/", views.hello_coco, name="hello_coco"),

<<<<<<< HEAD
=======
    # AUTH (SESSION)
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),

    # AUTH (JWT)
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # USER PROFILE
    path("me/", views.me, name="me"),
    path("change-password/", views.change_password, name="change_password"),

    # ADMIN – USER MANAGEMENT
    path("users/", views.users_list, name="users_list"),
    path("users/<int:user_id>/", views.users_delete, name="users_delete"),
    path("users/<int:user_id>/update/", views.users_update, name="users_update"),

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
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370
]


# ----------------------------
# DRF ROUTER URLS
# Enables:
# /api/ideas/
# /api/news/
# ----------------------------
urlpatterns += router.urls
