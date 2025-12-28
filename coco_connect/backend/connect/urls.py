from django.urls import path
from .views import hello_coco, product_list

urlpatterns = [
    path('hello/', hello_coco),
    path('products/', product_list),
]
