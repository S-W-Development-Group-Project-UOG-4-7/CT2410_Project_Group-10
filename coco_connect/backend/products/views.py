from decimal import Decimal, ROUND_HALF_UP
import traceback
import time
import io

from django.contrib.auth.models import Group
from django.db import transaction

from django.conf import settings
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView, DestroyAPIView
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.http import HttpResponse
from django.http import HttpResponse
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
def payhere_hash(merchant_id: str, order_id: str, amount: str, currency: str, merchant_secret: str) -> str:
    secret_md5 = hashlib.md5(merchant_secret.encode("utf-8")).hexdigest().upper()
    raw = f"{merchant_id}{order_id}{amount}{currency}{secret_md5}"
    return hashlib.md5(raw.encode("utf-8")).hexdigest().upper()


class PayHereInitFromCart(APIView):
    """
    Initialize PayHere payment for the current user's cart.
    Returns a signed payment object for payhere.startPayment().
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items_qs = cart.items.select_related("product")

        if not items_qs.exists():
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        merchant_id = settings.PAYHERE_MERCHANT_ID
        merchant_secret = settings.PAYHERE_MERCHANT_SECRET
        if not merchant_id or not merchant_secret:
            return Response(
                {"detail": "PayHere merchant settings are not configured."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        total = Decimal("0.00")
        item_names = []
        for it in items_qs:
            total += (it.product.price * it.quantity)
            if it.product and it.product.name:
                item_names.append(it.product.name)

        total = total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        amount_str = f"{total:.2f}"

        order_id = f"CC_{request.user.id}_{int(time.time())}"
        currency = getattr(settings, "PAYHERE_CURRENCY", "LKR")

        hash_value = payhere_hash(merchant_id, order_id, amount_str, currency, merchant_secret)

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                subtotal=total,
                tax=Decimal("0.00"),
                shipping=Decimal("0.00"),
                total_amount=total,
                currency=currency,
                status="pending",
                payment_provider="payhere",
                payhere_order_id=order_id,
                raw_payload={"items_label": ", ".join(item_names)[:255]},
            )

            OrderItem.objects.bulk_create(
                [
                    OrderItem(
                        order=order,
                        product=it.product,
                        product_name=it.product.name,
                        unit_price=it.product.price,
                        quantity=it.quantity,
                        line_total=it.product.price * it.quantity,
                    )
                    for it in items_qs
                ]
            )

        payment = {
            "sandbox": True,  # set False in production
            "merchant_id": merchant_id,
            "return_url": f"{settings.FRONTEND_URL}/payment/success?order_id={order_id}",
            "cancel_url": f"{settings.FRONTEND_URL}/payment/cancel?order_id={order_id}",
            "notify_url": f"{settings.BACKEND_PUBLIC_URL}/api/products/payhere/notify/",
            "order_id": order_id,
            "items": ", ".join(item_names)[:255],
            "amount": amount_str,
            "currency": currency,
            "hash": hash_value,
            "first_name": request.user.first_name or "Coco",
            "last_name": request.user.last_name or "Customer",
            "email": request.user.email or "noemail@example.com",
            "phone": "0770000000",
            "address": "N/A",
            "city": "N/A",
            "country": "Sri Lanka",
        }

        return Response(payment, status=status.HTTP_200_OK)


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
            status="pending",
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

        return Response(
            {
                "order_id": order.id,
                "total_amount": str(order.total_amount),
                "currency": order.currency,
            },
            status=status.HTTP_201_CREATED,
        )


# ======================================================
# PAYHERE MANUAL COMPLETE (CLIENT CONFIRM)
# ======================================================
class PayHereManualCompleteAPIView(APIView):
    """
    Mark order as paid after client completion (no signature check).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, order_id: str):
        order = Order.objects.filter(payhere_order_id=order_id, user=request.user).first()
        if not order:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status != "paid":
            order.status = "paid"
            order.save(update_fields=["status", "updated_at"])

        return Response({"detail": "OK", "status": order.status}, status=status.HTTP_200_OK)


# ======================================================
# PAYHERE INVOICE (DOWNLOAD)
# ======================================================
class PayHereInvoiceAPIView(APIView):
    """
    Download a PDF invoice for a paid order.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id: str):
        order = (
            Order.objects.filter(payhere_order_id=order_id, user=request.user)
            .prefetch_related("items")
            .first()
        )
        if not order:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status != "paid":
            return Response({"detail": "Invoice available after payment is verified."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import A4
            from reportlab.lib import colors
        except Exception:
            return Response(
                {"detail": "PDF generator not installed. Please install reportlab."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Header
        c.setFillColor(colors.HexColor("#0f5132"))
        c.rect(0, height - 80, width, 80, stroke=0, fill=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 20)
        c.drawString(40, height - 50, "COCOCONNECT")
        c.setFont("Helvetica", 10)
        c.drawString(40, height - 68, "Invoice")

        # Meta
        c.setFillColor(colors.black)
        y = height - 110
        c.setFont("Helvetica", 10)
        c.drawString(40, y, f"Invoice ID: {order.payhere_order_id}")
        c.drawString(320, y, f"Date: {order.updated_at.strftime('%Y-%m-%d %H:%M') if order.updated_at else ''}")
        y -= 16
        c.drawString(40, y, f"Billed To: {request.user.get_full_name() or request.user.email}")

        # Table header
        y -= 30
        c.setFillColor(colors.HexColor("#f3f4f6"))
        c.rect(40, y, width - 80, 22, stroke=0, fill=1)
        c.setFillColor(colors.black)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(50, y + 6, "Item")
        c.drawString(330, y + 6, "Qty")
        c.drawString(380, y + 6, "Unit Price")
        c.drawString(480, y + 6, "Total")

        # Table rows
        y -= 18
        c.setFont("Helvetica", 10)
        for item in order.items.all():
            c.drawString(50, y, item.product_name[:45])
            c.drawRightString(360, y, str(item.quantity))
            c.drawRightString(450, y, f"{item.unit_price:.2f}")
            c.drawRightString(540, y, f"{item.line_total:.2f}")
            y -= 16
            if y < 140:
                c.showPage()
                y = height - 60

        # Totals
        y -= 8
        c.setLineWidth(0.5)
        c.line(320, y, width - 40, y)
        y -= 16
        c.setFont("Helvetica-Bold", 10)
        c.drawRightString(450, y, "Subtotal:")
        c.drawRightString(540, y, f"{order.subtotal:.2f}")
        y -= 14
        c.drawRightString(450, y, "Tax:")
        c.drawRightString(540, y, f"{order.tax:.2f}")
        y -= 14
        c.drawRightString(450, y, "Shipping:")
        c.drawRightString(540, y, f"{order.shipping:.2f}")
        y -= 16
        c.setFont("Helvetica-Bold", 11)
        c.drawRightString(450, y, "Total:")
        c.drawRightString(540, y, f"{order.total_amount:.2f} {order.currency}")

        # Footer
        c.setFont("Helvetica", 9)
        c.setFillColor(colors.HexColor("#6b7280"))
        c.drawString(40, 40, "Thank you for shopping with CocoConnect.")

        c.showPage()
        c.save()

        pdf = buffer.getvalue()
        buffer.close()

        response = HttpResponse(pdf, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="invoice_{order.payhere_order_id}.pdf"'
        return response


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

    merchant_secret = settings.PAYHERE_MERCHANT_SECRET or os.getenv("PAYHERE_MERCHANT_SECRET", "").strip()

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

    if status_code == "2":
        cart = Cart.objects.filter(user=order.user).first()
        if cart:
            cart.items.all().delete()

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
# CART – CLEAR ALL ITEMS
# ======================================================
class CartClearView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({"detail": "Cart cleared."}, status=status.HTTP_200_OK)


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
class MyOrdersAPIView(APIView):
    """
    Customer orders list for dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = (
            Order.objects.filter(user=request.user, status="paid")
            .order_by("-created_at")
        )

        data = []
        for order in qs:
            data.append(
                {
                    "id": order.id,
                    "created_at": order.created_at.isoformat(),
                    "total_amount": float(order.total_amount),
                    "status": "completed",
                }
            )

        return Response(data, status=status.HTTP_200_OK)

# ======================================================
# ORDER DETAIL (CUSTOMER)
# ======================================================
class OrderDetailAPIView(APIView):
    """
    Customer order detail (with items).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id: int):
        order = (
            Order.objects.filter(id=order_id, user=request.user)
            .prefetch_related("items")
            .first()
        )
        if not order:
            return Response({"detail": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        items = []
        for item in order.items.all():
            items.append(
                {
                    "id": item.id,
                    "product_name": item.product_name,
                    "unit_price": float(item.unit_price),
                    "quantity": item.quantity,
                    "line_total": float(item.line_total),
                }
            )

        return Response(
            {
                "id": order.id,
                "order_id": order.payhere_order_id or f"#{order.id}",
                "created_at": order.created_at.isoformat(),
                "status": "completed" if order.status == "paid" else order.status,
                "currency": order.currency,
                "subtotal": float(order.subtotal),
                "tax": float(order.tax),
                "shipping": float(order.shipping),
                "total_amount": float(order.total_amount),
                "items": items,
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
