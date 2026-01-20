from decimal import Decimal

from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
    UpdateAPIView,
    DestroyAPIView,
)
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

from .models import Product, NewsItem, Cart, CartItem
from .serializers import (
    ProductSerializer,
    ProductCreateSerializer,
    NewsSerializer,
    CartItemSerializer,
)


# ======================================================
# PRODUCT LIST
# ======================================================
class ProductListAPIView(ListAPIView):
    """API view for listing products with filtering and sorting"""
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        try:
            qs = Product.objects.select_related(
                "category", "product_type", "author"
            ).all()
        except Exception:
            qs = Product.objects.all()

        category = self.request.GET.get("category")
        price_max = self.request.GET.get("price_max")
        product_type = self.request.GET.get("type")
        sort = self.request.GET.get("sort")

        if category and category != "all":
            qs = qs.filter(category__slug=category)

        if price_max:
            try:
                qs = qs.filter(price__lte=Decimal(str(price_max)))
            except (ValueError, TypeError):
                pass

        if product_type and product_type != "all":
            qs = qs.filter(product_type__name=product_type)

        if sort == "price_low_high":
            qs = qs.order_by("price")
        elif sort == "price_high_low":
            qs = qs.order_by("-price")

        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"error": "Failed to fetch products", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ======================================================
# PRODUCT CREATE
# ======================================================
class ProductCreateAPIView(CreateAPIView):
    """Allow authenticated users to create products"""
    serializer_class = ProductCreateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


# ======================================================
# NEWS LIST
# ======================================================
class NewsListAPIView(ListAPIView):
    """API view for listing active news items"""
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        try:
            return NewsItem.objects.filter(is_active=True)
        except Exception:
            return NewsItem.objects.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"error": "Failed to fetch news", "detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ======================================================
# CART – ADD ITEM
# ======================================================
class AddToCartView(APIView):
    """
    Add a product to cart (increase quantity if exists)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")

        if not product_id:
            return Response(
                {"error": "product_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        cart, _ = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
        )

        if not created:
            cart_item.quantity += 1
            cart_item.save()

        return Response(
            {
                "message": "Product added to cart",
                "cart_count": cart.total_items,
            },
            status=status.HTTP_200_OK,
        )


# ======================================================
# CART – GET CART DETAILS
# ======================================================
class CartDetailView(APIView):
    """
    Get current user's cart and items
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = cart.items.select_related("product")

        serializer = CartItemSerializer(items, many=True)

        return Response(
            {
                "items": serializer.data,
                "total_items": cart.total_items,
            },
            status=status.HTTP_200_OK,
        )


# ======================================================
# CART ITEM – UPDATE / DELETE
# ======================================================
class CartItemUpdateDeleteView(UpdateAPIView, DestroyAPIView):
    """
    Update quantity or remove cart item
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer

    def get_queryset(self):
        # Security: user can only access their own cart items
        return CartItem.objects.filter(cart__user=self.request.user)
