from rest_framework import serializers
from .models import Product, NewsItem, Category, ProductType, CartItem


# =========================
# PRODUCT LIST SERIALIZER
# =========================
class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""

    # Frontend expects category slug string
    category = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.all()
    )

    author = serializers.SerializerMethodField()
    type = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "stock_status",
            "reviews",
            "category",
            "type",
            "image",
            "author",
        ]

    def get_author(self, obj):
        try:
            return obj.author.username if obj.author else None
        except Exception:
            return None

    def get_type(self, obj):
        """Safely get product type name, handling null cases"""
        try:
            if obj.product_type and hasattr(obj.product_type, "name"):
                return obj.product_type.name
        except (AttributeError, TypeError):
            pass
        return None

    def get_image(self, obj):
        """Safely get image URL, handling missing images"""
        try:
            if obj.image and hasattr(obj.image, "url"):
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
        except (AttributeError, ValueError, Exception):
            pass
        return None


# =========================
# PRODUCT CREATE SERIALIZER
# =========================
class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating products with validation"""

    author = serializers.StringRelatedField(read_only=True)

    category = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.all()
    )

    product_type = serializers.SlugRelatedField(
        slug_field="name",
        queryset=ProductType.objects.all()
    )

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
        if value is None:
            raise serializers.ValidationError("Price is required.")
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate_image(self, image):
        # Keep your current rules
        if not image:
            raise serializers.ValidationError("Product image is required.")

        if image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Image size must be under 5MB.")

        # Some storages may not have content_type; handle safely
        content_type = getattr(image, "content_type", None)
        if content_type and not content_type.startswith("image/"):
            raise serializers.ValidationError("Uploaded file must be an image.")

        return image

    def validate(self, data):
        if not data.get("category"):
            raise serializers.ValidationError({"category": "Category is required."})

        if not data.get("product_type"):
            raise serializers.ValidationError({"product_type": "Product type is required."})

        return data


# =========================
# NEWS SERIALIZER
# =========================
class NewsSerializer(serializers.ModelSerializer):
    """Serializer for NewsItem model"""
    image = serializers.SerializerMethodField()

    class Meta:
        model = NewsItem
        fields = ["id", "text", "image"]

    def get_image(self, obj):
        """Safely get image URL, handling missing images"""
        try:
            if obj.image and hasattr(obj.image, "url"):
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
        except (AttributeError, ValueError, Exception):
            pass
        return None


# =========================
# CART ITEM SERIALIZER ✅ (FIXES YOUR ERROR)
# =========================
class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_price = serializers.DecimalField(
        source="product.price",
        max_digits=8,
        decimal_places=2,
        read_only=True,
    )
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_name",
            "product_price",
            "product_image",
            "quantity",
        ]

    def get_product_image(self, obj):
        try:
            if obj.product and obj.product.image and hasattr(obj.product.image, "url"):
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(obj.product.image.url)
                return obj.product.image.url
        except Exception:
            pass
        return None
