from django.contrib import admin
from django.urls import path, include
from .views import hello_coco,  register, login

urlpatterns = [
    path('hello/', hello_coco),
    path("register/", register),
    path("login/", login),
    path("admin/", admin.site.urls),
    path("blockchain/", include("blockchain_records.urls")),

]


