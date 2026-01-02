from decimal import Decimal
from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Product, NewsItem
from .serializers import ProductSerializer, NewsSerializer


class ProductListAPIView(ListAPIView):
    """API view for listing products with filtering and sorting"""
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Public endpoint

    def get_queryset(self):
        # Use select_related to optimize database queries
        try:
            qs = Product.objects.select_related('category', 'product_type', 'author').all()
        except Exception as e:
            # Fallback if select_related fails
            qs = Product.objects.all()

        category = self.request.GET.get('category')
        price_max = self.request.GET.get('price_max')
        product_type = self.request.GET.get('type')
        sort = self.request.GET.get('sort')

        if category and category != 'all':
            qs = qs.filter(category__slug=category)

        if price_max:
            try:
                # Safely convert price_max to Decimal (proper type for DecimalField)
                price_max_decimal = Decimal(str(price_max))
                qs = qs.filter(price__lte=price_max_decimal)
            except (ValueError, TypeError):
                # If conversion fails, ignore the filter
                pass

        if product_type and product_type != 'all':
            qs = qs.filter(product_type__name=product_type)

        if sort == 'price_low_high':
            qs = qs.order_by('price')
        elif sort == 'price_high_low':
            qs = qs.order_by('-price')

        return qs

    def get_serializer_context(self):
        """Add request to serializer context for absolute URL generation"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def list(self, request, *args, **kwargs):
        """Override list to add error handling"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            from rest_framework.response import Response
            from rest_framework import status
            return Response(
                {'error': 'Failed to fetch products', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProductCreateAPIView(CreateAPIView):
    """API view to allow authenticated users to create products"""
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        # Automatically set author to the current authenticated user
        serializer.save(author=self.request.user)


class NewsListAPIView(ListAPIView):
    """API view for listing active news items"""
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]  # Public endpoint

    def get_queryset(self):
        """Return active news items"""
        try:
            return NewsItem.objects.filter(is_active=True)
        except Exception:
            return NewsItem.objects.none()

    def get_serializer_context(self):
        """Add request to serializer context for absolute URL generation"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def list(self, request, *args, **kwargs):
        """Override list to add error handling"""
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            from rest_framework.response import Response
            from rest_framework import status
            return Response(
                {'error': 'Failed to fetch news', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
