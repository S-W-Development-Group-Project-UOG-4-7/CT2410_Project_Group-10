# connect/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Keep everything from both branches
from .models import Idea, SimilarityAlert, News, InvestmentProject, Investment, Profile

# ==================================================
# PROFILE SERIALIZER
# ==================================================
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['role', 'address', 'phone', 'city', 'bio', 'created_at']

# ==================================================
# USER SERIALIZER
# ==================================================
class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']
from .models import Idea, SimilarityAlert, News, AuthLog

# ==================================================
# IDEA SERIALIZER (FULL IDEA)
# ==================================================
class IdeaSerializer(serializers.ModelSerializer):
    # send owner info to frontend
    author_email = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = "__all__"
        # embedding is read-only (backend handles it)
        read_only_fields = [
            "author",
            "created_at",
            "embedding",
        ]

    def get_author_email(self, obj):
        return obj.author.email if getattr(obj, "author", None) else ""

    def get_author_name(self, obj):
        if not getattr(obj, "author", None):
            return ""
        return obj.author.get_full_name() or obj.author.username


# ==================================================
# BASIC IDEA SERIALIZER (USED INSIDE ALERTS)
# ==================================================
class BasicIdeaSerializer(serializers.ModelSerializer):
    author_email = serializers.CharField(source="author.email", read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Idea
        fields = [
            "id",
            "title",
            "short_description",
            "author_email",
            "author_name",
            "created_at",
        ]

    def get_author_name(self, obj):
        if not getattr(obj, "author", None):
            return ""
        return obj.author.get_full_name() or obj.author.username


# ==================================================
# SIMILARITY ALERT SERIALIZER (FINAL)
# ==================================================
class SimilarityAlertSerializer(serializers.ModelSerializer):
    # 🟢 ORIGINAL idea (owned by logged-in user)
    idea = BasicIdeaSerializer(read_only=True)

    # 🔴 NEW idea (created by another user)
    similar_idea = BasicIdeaSerializer(read_only=True)

    class Meta:
        model = SimilarityAlert
        fields = [
            "id",
            "idea",                 # original idea (my idea)
            "similar_idea",         # new idea (other user)
            "similarity_score",
            "is_reported",
            "is_dismissed",
            "created_at",
        ]


# ==================================================
# NEWS SERIALIZER
# ==================================================
class NewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = News
        fields = [
            "id",
            "title",
            "content",
            "date",
            "status",
            "image",
            "likes",
            "created_at",
            "updated_at",
        ]


# ==================================================
# INVESTMENT PROJECT SIMPLE SERIALIZER
# ==================================================
class InvestmentProjectSimpleSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = InvestmentProject
        fields = ['id', 'title', 'location', 'status', 'progress_percentage']
    
    def get_progress_percentage(self, obj):
        if obj.target_amount > 0:
            return float((obj.current_amount / obj.target_amount) * 100)
        return 0


# ==================================================
# JWT LOGIN WITH EMAIL (IMPORTANT FIX)
# ==================================================
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Allows JWT login using email instead of username.
    Expects: { "email": "...", "password": "..." }
    """

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "No active account found with the given credentials"
            )

        # Map email -> username for JWT (SimpleJWT expects username)
        attrs["username"] = user.username
        attrs["password"] = password
        return super().validate(attrs)    

# ===================================================
# Auth Log
# ===================================================
# connect/serializers.py
class AuthLogSerializer(serializers.ModelSerializer):
    # extra read-only fields for frontend display
    username = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = AuthLog
        fields = [
            "id",
            "user",
            "username",
            "email",
            "action",
            "status",
            "message",
            "created_at",
        ]
        read_only_fields = fields

    def get_username(self, obj):
        return obj.user.username if obj.user else None

    def get_email(self, obj):
        return obj.user.email if obj.user else None

