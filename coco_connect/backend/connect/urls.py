from django.urls import path
from .views import hello_coco,  register, login

urlpatterns = [
    path('hello/', hello_coco),
    path("register/", register),
    path("login/", login),
]


