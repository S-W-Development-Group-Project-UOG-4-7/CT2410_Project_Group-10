from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Profile


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
# connect/jwt_views.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # ✅ No profile table link in your DB, so derive role from is_staff
        data["role"] = "Admin" if user.is_staff else "User"
        data["name"] = user.first_name
        data["email"] = user.email
        data["id"] = user.id

        return data
