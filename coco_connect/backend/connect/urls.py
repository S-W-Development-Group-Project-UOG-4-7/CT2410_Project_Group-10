from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from connect.jwt_views import MyTokenObtainPairView
from . import views
from .views import (
    IdeaViewSet,
    SimilarityAlertViewSet,
    NewsViewSet,

    # ADMIN – IDEA MODERATION
    admin_all_ideas,
    admin_reported_ideas,
    admin_keep_idea,
    admin_delete_idea,
)

# =========================
# DRF ROUTER
# =========================
router = DefaultRouter()
router.register(r"ideas", IdeaViewSet, basename="ideas")
router.register(r"alerts", SimilarityAlertViewSet, basename="alerts")
router.register(r"news", NewsViewSet, basename="news")

# =========================
# URL PATTERNS
# =========================
urlpatterns = [

    # =========================
    # BASIC
    # =========================
    path("hello/", views.hello_coco, name="hello_coco"),

    # =========================
    # AUTH (SESSION)
    # =========================
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),

    # =========================
    # AUTH (JWT)
    # =========================
    path("token/", MyTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # =========================
    # USER PROFILE
    # =========================
    path("me/", views.me, name="me"),
    path("change-password/", views.change_password, name="change_password"),

    # =========================
    # ADMIN – USER MANAGEMENT
    # =========================
    path("users/", views.users_list, name="users_list"),
    path("users/<int:user_id>/", views.users_delete, name="users_delete"),
    path("users/<int:user_id>/update/", views.users_update, name="users_update"),

    # =========================
    # ADMIN – IDEA MODERATION
    # =========================
    path("admin/ideas/", admin_all_ideas, name="admin_all_ideas"),
    path("admin/reported-ideas/", admin_reported_ideas, name="admin_reported_ideas"),
    path("admin/ideas/<int:idea_id>/keep/", admin_keep_idea, name="admin_keep_idea"),
    path("admin/ideas/<int:idea_id>/delete/", admin_delete_idea, name="admin_delete_idea"),

    # =========================
    # PROJECTS (PUBLISHED / INVESTMENT)
    # =========================
    path("projects/", views.get_projects, name="get_projects"),
    path(
        "projects/<int:project_id>/",
        views.get_project_detail,
        name="get_project_detail",
    ),

    # =========================
    # PROJECT DRAFTS (IDEA + MATERIALS ONLY)
    # =========================
    path(
        "project-drafts/create/",
        views.create_project_draft,
        name="create_project_draft",
    ),
    path(
        "project-drafts/",
        views.get_my_project_drafts,
        name="get_my_project_drafts",
    ),
    path(
        "project-drafts/<int:draft_id>/",
        views.get_project_draft_detail,  # ✅ CORRECT FIX
        name="get_project_draft_detail",
    ),
    path(
        "project-drafts/<int:draft_id>/delete/",
        views.delete_project_draft,
        name="delete_project_draft",
    ),

    # =========================
    # INVESTMENT
    # =========================
    path("make-investment/", views.create_investment, name="create_investment"),
    path("my-investments/", views.my_investments, name="my_investments"),
    path("categories/", views.get_categories, name="get_categories"),
    path("locations/", views.get_locations, name="get_locations"),
    path("stats/", views.get_platform_stats, name="get_platform_stats"),
    path(
        "create-demo-projects/",
        views.create_demo_projects,
        name="create_demo_projects",
    ),

    # =========================
    # BLOCKCHAIN
    # =========================
    path("blockchain/", include("blockchain_records.urls")),
]

# =========================
# DRF ROUTER ENDPOINTS
# =========================
urlpatterns += router.urls