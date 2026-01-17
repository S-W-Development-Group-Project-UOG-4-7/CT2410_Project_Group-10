from rest_framework import serializers
from .models import Product, NewsItem, Category, ProductType


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


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating products with validation"""
    author = serializers.StringRelatedField(read_only=True)
    category = serializers.SlugRelatedField(slug_field='slug', queryset=Category.objects.all())
    product_type = serializers.SlugRelatedField(slug_field='name', queryset=ProductType.objects.all())

    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ["author", "created_at"]

    def validate_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Product name must be at least 3 characters long."
            )
        return value

    def validate_description(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError(
                "Description must be at least 10 characters long."
            )
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than 0."
            )
        return value

    def validate_image(self, image):
        if not image:
            raise serializers.ValidationError("Product image is required.")

        if image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Image size must be under 5MB."
            )

        if not image.content_type.startswith("image/"):
            raise serializers.ValidationError(
                "Uploaded file must be an image."
            )

        return image

    def validate(self, data):
        if not data.get("category"):
            raise serializers.ValidationError(
                {"category": "Category is required."}
            )

        if not data.get("product_type"):
            raise serializers.ValidationError(
                {"product_type": "Product type is required."}
            )

        return data


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

