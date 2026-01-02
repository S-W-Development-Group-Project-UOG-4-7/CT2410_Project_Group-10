from rest_framework import serializers
from .models import Product, NewsItem, Category


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    category = serializers.SlugRelatedField(slug_field='slug', queryset=Category.objects.all())
    author = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    def get_author(self, obj):
        try:
            return obj.author.username if obj.author else None
        except Exception:
            return None

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'stock_status',
            'reviews',
            'category',
            'type',
            'image',
            'author',
        ]

    def get_type(self, obj):
        """Safely get product type name, handling null cases"""
        try:
            if obj.product_type and hasattr(obj.product_type, 'name'):
                return obj.product_type.name
        except (AttributeError, TypeError):
            pass
        return None

    def get_image(self, obj):
        """Safely get image URL, handling missing images"""
        try:
            if obj.image and hasattr(obj.image, 'url'):
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
        except (AttributeError, ValueError, Exception):
            pass
        return None


class NewsSerializer(serializers.ModelSerializer):
    """Serializer for NewsItem model"""
    image = serializers.SerializerMethodField()

    class Meta:
        model = NewsItem
        fields = ['id', 'text', 'image']

    def get_image(self, obj):
        """Safely get image URL, handling missing images"""
        try:
            if obj.image and hasattr(obj.image, 'url'):
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
        except (AttributeError, ValueError, Exception):
            pass
        return None

