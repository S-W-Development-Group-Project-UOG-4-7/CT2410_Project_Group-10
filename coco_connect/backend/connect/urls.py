# connect/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("hello/", views.hello_coco, name="hello_coco"),

    # Investment
    path("projects/", views.get_projects, name="get_projects"),
    path("projects/<int:project_id>/", views.get_project_detail, name="get_project_detail"),
    path("make-investment/", views.create_investment, name="create_investment"),
    path("my-investments/", views.my_investments),


    # Optional
    path("categories/", views.get_categories, name="get_categories"),
    path("locations/", views.get_locations, name="get_locations"),
    path("stats/", views.get_platform_stats, name="get_platform_stats"),
    path("create-demo-projects/", views.create_demo_projects, name="create_demo_projects"),

    # Auth (if you use them)
    path("register/", views.register, name="register"),
    path("login/", views.login, name="login"),
]