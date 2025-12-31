from django.db import models

from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = [
        ("farmer", "Farmer"),
        ("investor", "Investor"),
        ("buyer", "Buyer"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role}"


class News(models.Model):
    STATUS_CHOICES = (
        ("Draft", "Draft"),
        ("Published", "Published"),
    )

    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)  # optional (for "View" page)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Draft")
    image = models.ImageField(upload_to="news/", null=True, blank=True)
    date = models.DateField()  # you can also use auto_now_add if you want
    likes = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def _str_(self):
        return self.title