from decimal import Decimal
import traceback

from django.contrib.auth.models import Group
from django.db import transaction

from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

import hashlib
import os
from rest_framework.decorators import api_view, permission_classes

from .models import Product, NewsItem, Cart, CartItem, Category, Order, OrderItem
from .serializers import (
    ProductSerializer,
    ProductCreateSerializer,
    ProductUpdateSerializer,
    NewsSerializer,
    CartItemSerializer,
)

from blockchain_records.web3_client import record_proof, make_product_hash, now_utc


# ======================================================
# ROLE HELPERS (EARNED ROLES)
# ======================================================
def ensure_user_in_group(user, group_name: str) -> bool:
    """
    Ensures the given user belongs to the Django auth Group (role).
    Returns True if added now, False if user already had it.
    Idempotent: calling multiple times won't duplicate.
    """
    group, _ = Group.objects.get_or_create(name=group_name)
    if user.groups.filter(id=group.id).exists():
        return False
    user.groups.add(group)
    return True


# ======================================================
# PRODUCT LIST
# ======================================================
class ProductListAPIView(ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Prefer select_related for performance, but fallback safely
        try:
            qs = Product.objects.select_related("category", "product_type", "author").all()
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
# PRODUCT CREATE  (EARN "FARMER" ROLE ON SUCCESS)
# ======================================================
class ProductCreateAPIView(CreateAPIView):
    serializer_class = ProductCreateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    @transaction.atomic
    def perform_create(self, serializer):
        # 1) Create product
        serializer.save(author=self.request.user)

        # 2) Earn role (idempotent)
        # Use "Farmer" because that's what exists in your auth_group table.
        ensure_user_in_group(self.request.user, "Farmer")


# ======================================================
# PRODUCT UPDATE (OWNER ONLY)
# ======================================================
class ProductUpdateAPIView(UpdateAPIView):
    serializer_class = ProductUpdateSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    queryset = Product.objects.select_related("author")

    def get_object(self):
        obj = super().get_object()
        if not obj.author_id or obj.author_id != self.request.user.id:
            raise PermissionDenied("You can update only your own products.")
        return obj

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)


# ======================================================
# NEWS LIST
# ======================================================
class NewsListAPIView(ListAPIView):
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
# CATEGORY LIST (PUBLIC)
# ======================================================
class CategoryListAPIView(APIView):
    """Public list of product categories for dropdowns"""
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            qs = Category.objects.all().order_by("name")
        except Exception:
            qs = Category.objects.none()

        data = [{"id": c.id, "name": c.name, "slug": c.slug} for c in qs]
        return Response(data, status=status.HTTP_200_OK)


# ======================================================
# CHECKOUT (PAYHERE SANDBOX)
# ======================================================
class CheckoutCreateAPIView(APIView):
    """
    Create an order from the current user's cart after payment
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        cart = Cart.objects.filter(user=user).first()
        if not cart:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

        items = cart.items.select_related("product")
        if not items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        payload = request.data or {}
        payment_provider = payload.get("payment_provider", "payhere")
        currency = payload.get("currency", "LKR")
        payhere_order_id = payload.get("payhere_order_id")
        payhere_payment_id = payload.get("payhere_payment_id")

        def to_decimal(value):
            try:
                return Decimal(str(value))
            except Exception:
                return Decimal("0")

        subtotal = sum((item.product.price * item.quantity) for item in items)
        tax = to_decimal(payload.get("tax", 0))
        shipping = to_decimal(payload.get("shipping", 0))
        total_amount = to_decimal(payload.get("total_amount", subtotal + tax + shipping))

        order = Order.objects.create(
            user=user,
            subtotal=subtotal,
            tax=tax,
            shipping=shipping,
            total_amount=total_amount,
            currency=currency,
            status="paid",
            payment_provider=payment_provider,
            payhere_order_id=payhere_order_id,
            payhere_payment_id=payhere_payment_id,
            raw_payload=payload,
        )

        OrderItem.objects.bulk_create(
            [
                OrderItem(
                    order=order,
                    product=item.product,
                    product_name=item.product.name,
                    unit_price=item.product.price,
                    quantity=item.quantity,
                    line_total=item.product.price * item.quantity,
                )
                for item in items
            ]
        )

        items.delete()

        return Response(
            {
                "order_id": order.id,
                "total_amount": str(order.total_amount),
                "currency": order.currency,
            },
            status=status.HTTP_201_CREATED,
        )


# ======================================================
# PAYHERE NOTIFY (SERVER CALLBACK)
# ======================================================
@csrf_exempt
def payhere_notify(request):
    """
    PayHere server-to-server callback.
    Validates signature (if secret configured) and updates order status.
    """
    if request.method != "POST":
        return JsonResponse({"detail": "Method not allowed"}, status=405)

    data = request.POST or {}
    order_id = data.get("order_id")
    payment_id = data.get("payment_id")
    status_code = str(data.get("status_code", "")).strip()
    merchant_id = data.get("merchant_id")
    payhere_amount = data.get("payhere_amount")
    payhere_currency = data.get("payhere_currency")
    md5sig = data.get("md5sig")

    merchant_secret = os.getenv("PAYHERE_MERCHANT_SECRET", "").strip()

    if merchant_secret:
        # PayHere signature verification
        secret_hash = hashlib.md5(merchant_secret.encode("utf-8")).hexdigest().upper()
        raw = f"{merchant_id}{order_id}{payhere_amount}{payhere_currency}{status_code}{secret_hash}"
        local_sig = hashlib.md5(raw.encode("utf-8")).hexdigest().upper()

        if not md5sig or local_sig != str(md5sig).upper():
            return JsonResponse({"detail": "Invalid signature"}, status=400)

    order = Order.objects.filter(payhere_order_id=order_id).first()
    if not order:
        # Accept the callback to avoid retries; frontend will still finalize on success
        return JsonResponse({"detail": "Order not found"}, status=200)

    status_map = {
        "2": "paid",
        "0": "pending",
        "1": "cancelled",
        "-1": "failed",
        "-2": "failed",
        "-3": "failed",
    }

    order.status = status_map.get(status_code, order.status)
    if payment_id:
        order.payhere_payment_id = payment_id
    order.raw_payload = data.dict() if hasattr(data, "dict") else dict(data)
    order.save(update_fields=["status", "payhere_payment_id", "raw_payload", "updated_at"])

    return JsonResponse({"detail": "OK"}, status=200)


# ======================================================
# CART – ADD ITEM
# ======================================================
class AddToCartView(APIView):
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
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        cart, _ = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            cart_item.quantity += 1
            cart_item.save()

        return Response(
            {"message": "Product added to cart", "cart_count": cart.total_items},
            status=status.HTTP_200_OK,
        )


# ======================================================
# CART – GET CART DETAILS
# ======================================================
class CartDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = cart.items.select_related("product")

        serializer = CartItemSerializer(items, many=True, context={"request": request})

        return Response(
            {"items": serializer.data, "total_items": cart.total_items},
            status=status.HTTP_200_OK,
        )


# ======================================================
# CART ITEM – UPDATE / DELETE
# ======================================================
class CartItemUpdateDeleteView(UpdateAPIView, DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)


# ======================================================
# SELLER ORDERS (PRODUCT AUTHORS)
# ======================================================
class SellerOrdersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = (
            OrderItem.objects.select_related("order", "product", "order__user")
            .filter(product__author=request.user)
            .order_by("-order__created_at", "id")
        )

        data = []
        for item in items:
            order = item.order
            buyer = order.user
            data.append(
                {
                    "id": item.id,
                    "order_id": order.id,
                    "order_status": order.status,
                    "order_created_at": order.created_at.isoformat(),
                    "buyer_email": buyer.email,
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "unit_price": str(item.unit_price),
                    "quantity": item.quantity,
                    "line_total": str(item.line_total),
                    "supplied": bool(item.supplied),
                    "supplied_at": item.supplied_at.isoformat() if item.supplied_at else None,
                }
            )

        return Response(data, status=status.HTTP_200_OK)


class SellerSupplyOrderItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        try:
            item = OrderItem.objects.select_related("product").get(pk=item_id)
        except OrderItem.DoesNotExist:
            return Response({"detail": "Order item not found"}, status=status.HTTP_404_NOT_FOUND)

        if not item.product or item.product.author_id != request.user.id:
            raise PermissionDenied("You can supply only your own order items.")

        if not item.supplied:
            item.supplied = True
            item.supplied_at = timezone.now()
            item.save(update_fields=["supplied", "supplied_at"])

        return Response(
            {
                "id": item.id,
                "supplied": item.supplied,
                "supplied_at": item.supplied_at.isoformat() if item.supplied_at else None,
            },
            status=status.HTTP_200_OK,
        )


# ======================================================
# BLOCKCHAIN – VERIFY PRODUCT (ONLY OWNER)
# ======================================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_product(request, pk):
    try:
        product = Product.objects.select_related("author").get(pk=pk)
    except Product.DoesNotExist:
        return Response({"detail": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    # Only author can verify
    if not product.author_id or product.author_id != request.user.id:
        return Response(
            {"detail": "Not allowed. You can verify only your own products."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Prevent duplicate verify
    if product.verified_at and product.tx_hash:
        return Response(
            {
                "detail": "Already verified",
                "id": product.id,
                "product_hash": product.product_hash,
                "tx_hash": product.tx_hash,
                "verified_at": product.verified_at,
            },
            status=status.HTTP_200_OK,
        )

    try:
        product_hash = make_product_hash(product)     # should return "0x..."
        tx_hash = record_proof(product.id, product_hash)  # should return "0x..."

        # Normalize tx hash for UI consistency
        if tx_hash and not str(tx_hash).startswith("0x"):
            tx_hash = "0x" + str(tx_hash)

    except Exception as e:
        tb = traceback.format_exc()
        return Response(
            {"detail": "Blockchain verify failed", "error": str(e), "trace": tb},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    product.product_hash = product_hash
    product.tx_hash = tx_hash
    product.verified_at = now_utc()
    product.save(update_fields=["product_hash", "tx_hash", "verified_at"])

    return Response(
        {
            "id": product.id,
            "product_hash": product.product_hash,
            "tx_hash": product.tx_hash,
            "verified_at": product.verified_at,
        },
        status=status.HTTP_200_OK,
    )
