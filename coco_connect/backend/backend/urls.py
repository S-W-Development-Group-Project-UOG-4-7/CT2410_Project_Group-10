from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home(request):
    return JsonResponse({
        "message": "Coco Connect Backend Running Successfully 🚀"
    })

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/', include('connect.urls')),
]
