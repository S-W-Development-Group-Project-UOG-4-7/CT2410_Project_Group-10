from django.urls import path
from .views import record_investment

urlpatterns = [
    path("record-investment/", record_investment),
]
