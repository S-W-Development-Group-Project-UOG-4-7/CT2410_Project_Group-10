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

    # ADMIN USER ROLES VIEW
    admin_user_roles,
)

# =========================
# DRF ROUTER
# =========================
router = DefaultRouter()
router.register(r"ideas", IdeaViewSet, basename="ideas")
router.register(r"alerts", SimilarityAlertViewSet, basename="alerts")
router.register(r"news", NewsViewSet, basename="news")

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
    path("logout/", views.logout_view, name="logout"),

    # ========================
    # Admin AuthLog
    # ========================
    path("admin/auth-logs/", views.admin_auth_logs, name="admin_auth_logs"),
    path("admin/auth-logs/stats/", views.admin_auth_logs_stats, name="admin_auth_logs_stats"),

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
    # ADMIN – USER ROLES (GROUPS)
    # =========================
    path("roles/", views.roles_list, name="roles_list"),
    path('roles/<int:group_id>/', views.roles_update, name='roles_update'),  # PATCH update
    path('roles/<int:group_id>/delete/', views.roles_delete, name='roles_delete'),  # DELETE
    path("users/<int:user_id>/roles/", admin_user_roles, name="admin_user_roles"),  # CHANGED HERE
    path("permissions/", views.permissions_list, name="permissions_list"),

    path("groups/", views.groups_list, name="groups_list"),
    path('groups/create/', views.groups_create, name='groups_create'),  # POST create

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
    path( "project-drafts/create/", views.create_project_draft, name="create_project_draft",),
    path( "project-drafts/", views.get_my_project_drafts, name="get_my_project_drafts",),
    path( "project-drafts/<int:draft_id>/",views.get_project_draft_detail,  name="get_project_draft_detail",),
    path( "project-drafts/<int:draft_id>/delete/", views.delete_project_draft, name="delete_project_draft",),

    # =========================
    # INVESTMENT
    # =========================
    path("projects/", views.get_projects, name="get_projects"),
    path("projects/<int:project_id>/", views.get_project_detail, name="get_project_detail"),
    path("make-investment/", views.create_investment, name="create_investment"),
    path("my-investments/", views.my_investments, name="my_investments"),
    path("categories/", views.get_categories, name="get_categories"),
    path("locations/", views.get_locations, name="get_locations"),
    path("stats/", views.get_platform_stats, name="get_platform_stats"),
    path( "create-demo-projects/",views.create_demo_projects,name="create_demo_projects", ),

    # =========================
    # BLOCKCHAIN
    # =========================
    path("blockchain/", include("blockchain_records.urls")),
]

# =========================
# DRF ROUTER ENDPOINTS
# =========================
urlpatterns += router.urls