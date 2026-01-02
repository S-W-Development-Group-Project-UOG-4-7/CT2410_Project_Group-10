from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Idea


# ==================================================
# IDEA SERIALIZER
# ==================================================
class IdeaSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(
        source="author.email",
        read_only=True
    )

    class Meta:
        model = Idea
        fields = "__all__"
        read_only_fields = ["author", "created_at"]


# ==================================================
# JWT LOGIN WITH EMAIL (🔥 IMPORTANT FIX)
# ==================================================
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allows JWT login using email instead of username
    """

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError(
                "Email and password are required"
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No active account found with the given credentials"
            )

        # Map email → username for JWT
        attrs["username"] = user.username

        return super().validate(attrs)
