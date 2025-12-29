from django.urls import path
from .views import hello_coco,  register, login

urlpatterns = [
    path('hello/', hello_coco),
    path("register/", register),
    path("login/", login),
]
# ADD THESE URL PATTERNS TO YOUR EXISTING urlpatterns list

from django.urls import path
from .views import (
    hello_coco, register, login, 
    investment_projects, make_investment, 
    investment_stats, investment_categories, 
    project_locations
)

urlpatterns = [
    path('hello/', hello_coco),
    path("register/", register),
    path("login/", login),
    
    # Investment API URLs
    path("investment-projects/", investment_projects),
    path("make-investment/", make_investment),
    path("investment-stats/", investment_stats),
    path("investment-categories/", investment_categories),
    path("project-locations/", project_locations),
]

