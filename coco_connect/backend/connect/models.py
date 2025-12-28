from django.db import models

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('oil', 'Coconut Oil'),
        ('fiber', 'Coir Fiber'),
        ('water', 'Coconut Water'),
    ]

    TYPE_CHOICES = [
        ('Raw Materials', 'Raw Materials'),
        ('Processed Goods', 'Processed Goods'),
        ('Equipment', 'Equipment'),
    ]

    STOCK_CHOICES = [
        ('In Stock', 'In Stock'),
        ('Low Stock', 'Low Stock'),
        ('Out of Stock', 'Out of Stock'),
    ]

    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    stock = models.CharField(max_length=20, choices=STOCK_CHOICES)
    description = models.TextField()
    reviews = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)

    def __str__(self):
        return self.name
