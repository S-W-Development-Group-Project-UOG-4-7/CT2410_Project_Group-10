#from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import hello_coco, register, login, users_list, users_delete, users_update,NewsViewSet

router = DefaultRouter()
router.register(r"news", NewsViewSet, basename="news")

urlpatterns = [
    path('hello/', hello_coco),
    path("register/", register),
    path("login/", login),

    # USERS API
    path("users/", users_list),                 # GET (list + search)
    path("users/<int:user_id>/", users_delete), # DELETE
    path("users/<int:user_id>/update/", users_update),

    #path("admin/", admin.site.urls),
    path("blockchain/", include("blockchain_records.urls")),

    path("", include(router.urls)),
]


