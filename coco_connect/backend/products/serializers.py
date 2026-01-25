# products/serializers.py
from rest_framework import serializers
from .models import Product, NewsItem, Category, ProductType, CartItem


# =========================
# PRODUCT LIST SERIALIZER
# =========================
class ProductSerializer(serializers.ModelSerializer):
    # ✅ list should be read_only (no queryset needed)
    category = serializers.SlugRelatedField(read_only=True, slug_field="slug")
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
        try:
            return obj.product_type.name if obj.product_type else None
        except Exception:
            return None

    def get_image(self, obj):
        try:
            if obj.image and hasattr(obj.image, "url"):
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
        except Exception:
            pass
        return None


# =========================
# PRODUCT CREATE SERIALIZER
# =========================
class ProductCreateSerializer(serializers.ModelSerializer):
    """
    ✅ Frontend sends:
      category = "food-items" (slug)
      type     = "Processed Goods" (ProductType.name)
    """

    category = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.all(),
        required=True,
    )

    # ✅ accept "type" from frontend, map it to product_type FK
    type = serializers.SlugRelatedField(
        source="product_type",
        slug_field="name",
        queryset=ProductType.objects.all(),
        required=True,
        write_only=True,
    )

    class Meta:
        model = Product
        fields = [
            "name",
            "description",
            "price",
            "category",
            "type",
            "image",
        ]

    def validate_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Product name must be at least 3 characters long.")
        return value

    def validate_description(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters long.")
        return value

    def validate_price(self, value):
        if value is None:
            raise serializers.ValidationError("Price is required.")
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate_image(self, image):
        if not image:
            raise serializers.ValidationError("Product image is required.")
        if image.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Image size must be under 5MB.")
        content_type = getattr(image, "content_type", None)
        if content_type and not content_type.startswith("image/"):
            raise serializers.ValidationError("Uploaded file must be an image.")
        return image


# =========================
# NEWS SERIALIZER
# =========================
class NewsSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = NewsItem
        fields = ["id", "text", "image"]

    def get_image(self, obj):
        try:
            if obj.image and hasattr(obj.image, "url"):
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(obj.image.url)
                return obj.image.url
        except Exception:
            pass
        return None


# =========================
# CART ITEM SERIALIZER
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
