#from django.contrib import admin
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import hello_coco, register, login, users_list, users_delete, users_update,NewsViewSet

router = DefaultRouter()
router.register(r"news", NewsViewSet, basename="news")

urlpatterns = [
    path('hello/', hello_coco),
    path("register/", register),
    path("login/", login),

    # USERS API
    path("users/", views.users_list),
    path("users/<int:user_id>/", views.users_delete),
    path("users/<int:user_id>/update/", views.users_update),

    #path("admin/", admin.site.urls),
    path("blockchain/", include("blockchain_records.urls")),

    path("", include(router.urls)),
]


