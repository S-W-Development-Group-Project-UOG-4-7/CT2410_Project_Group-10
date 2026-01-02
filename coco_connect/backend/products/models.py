from django.db import models
from django.conf import settings


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

    def __str__(self):
        return self.name


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
