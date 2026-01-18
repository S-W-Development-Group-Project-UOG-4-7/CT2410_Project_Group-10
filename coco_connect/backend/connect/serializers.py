from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Idea


# ==================================================
# IDEA SERIALIZER (FIXED)
# ==================================================
class IdeaSerializer(serializers.ModelSerializer):
    # ✅ Send owner info to frontend
    author_email = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = "__all__"

        # backend-controlled fields
        read_only_fields = [
            "author",
            "created_at",
            "embedding",
        ]

    def get_author_email(self, obj):
        return obj.author.email if obj.author else ""

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username


# ==================================================
# JWT LOGIN WITH EMAIL (UNCHANGED & WORKING)
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

        # map email → username (SimpleJWT requirement)
        attrs["username"] = user.username

        return super().validate(attrs)
