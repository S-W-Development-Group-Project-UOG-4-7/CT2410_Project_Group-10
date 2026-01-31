from django.db import models
from django.conf import settings


# =========================
# CATEGORY
# =========================
class Category(models.Model):
    """
    Product category model
    """
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


# =========================
# PRODUCT TYPE
# =========================
class ProductType(models.Model):
    """
    Product type model (Raw Materials, Processed Goods, Equipment)
    """
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name_plural = "Product Types"
        ordering = ["name"]

    def __str__(self):
        return self.name


# =========================
# PRODUCT
# =========================
class Product(models.Model):
    """
    Product model
    """

    STOCK_CHOICES = (
        ("in stock", "In Stock"),
        ("out of stock", "Out of Stock"),
    )

    # 🔐 Author (who added the product)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="products",
        null=True,
        blank=True,
    )

    # 📦 Product info
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    stock_status = models.CharField(
        max_length=20,
        choices=STOCK_CHOICES,
        default="in stock",
    )
    reviews = models.PositiveIntegerField(default=0)

    # 🔗 Relations
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products",
    )
    product_type = models.ForeignKey(
        ProductType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )

    # 🖼 Image
    image = models.ImageField(upload_to="products/", null=True, blank=True)

    # 🕒 Metadata
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Products"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["price"]),
            models.Index(fields=["created_at"]),
        ]

    tx_hash = models.CharField(max_length=66, blank=True, null=True)
    product_hash = models.CharField(max_length=66, blank=True, null=True)
    verified_at = models.DateTimeField(blank=True, null=True)


    def __str__(self):
        return self.name


# =========================
# NEWS
# =========================
class NewsItem(models.Model):
    """
    News item model
    """
    text = models.CharField(max_length=255)
    image = models.ImageField(upload_to="news/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "News Items"
        ordering = ["-created_at"]

    def __str__(self):
        return self.text


# =========================
# CART
# =========================
class Cart(models.Model):
    """
    Shopping cart (one per user)
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email}'s Cart"

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())


# =========================
# CART ITEM
# =========================
class CartItem(models.Model):
    """
    Cart item model
    """
    cart = models.ForeignKey(
        Cart,
        related_name="items",
        on_delete=models.CASCADE
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="cart_items"
    )
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("cart", "product")
        verbose_name_plural = "Cart Items"

    def __str__(self):
        return f"{self.product.name} × {self.quantity}"

    @property
    def total_price(self):
        return self.quantity * self.product.price


# =========================
# ORDER
# =========================
class Order(models.Model):
    """
    Order record for completed checkouts
    """
    STATUS_CHOICES = (
        ("paid", "Paid"),
        ("pending", "Pending"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    )

    PAYMENT_PROVIDERS = (
        ("payhere", "PayHere"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders",
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=8, default="LKR")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="paid")

    payment_provider = models.CharField(
        max_length=20,
        choices=PAYMENT_PROVIDERS,
        default="payhere",
    )
    payhere_order_id = models.CharField(max_length=100, blank=True, null=True)
    payhere_payment_id = models.CharField(max_length=100, blank=True, null=True)
    raw_payload = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} - {self.user.email}"


# =========================
# ORDER ITEM
# =========================
class OrderItem(models.Model):
    """
    Order line item snapshot
    """
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="order_items",
    )
    product_name = models.CharField(max_length=200)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)
    supplied = models.BooleanField(default=False)
    supplied_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"
