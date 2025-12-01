from django.urls import path
from .views import hello_coco

urlpatterns = [
    path('hello/', hello_coco),
]
