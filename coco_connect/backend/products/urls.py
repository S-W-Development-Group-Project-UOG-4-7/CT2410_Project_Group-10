from django.urls import path
from django.http import JsonResponse
from .views import ProductListAPIView, NewsListAPIView, ProductCreateAPIView

app_name = 'products'

def health_check(request):
    """Health check endpoint to verify API is working"""
    return JsonResponse({
        'status': 'healthy',
        'message': 'Products API is running',
        'endpoints': {
            'products': '/api/products/',
            'news': '/api/products/news/',
        }
    })

urlpatterns = [
    path('', ProductListAPIView.as_view(), name='product-list'),
    path('create/', ProductCreateAPIView.as_view(), name='product-create'),
    path('news/', NewsListAPIView.as_view(), name='news-list'),
    path('health/', health_check, name='health-check'),
]
