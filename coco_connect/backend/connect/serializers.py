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


# ==================================================
# PROJECT DRAFT MATERIAL SERIALIZER
# ==================================================
class ProjectDraftMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDraftMaterial
        fields = ["id", "name", "quantity", "unit_cost"]
        read_only_fields = ["id"]


# ==================================================
# PROJECT DRAFT SERIALIZER (FINAL - SAFE)
# ==================================================
class ProjectDraftSerializer(serializers.ModelSerializer):
    materials = ProjectDraftMaterialSerializer(many=True, required=False)

    class Meta:
        model = ProjectDraft
        fields = [
            "id",
            "idea",
            "title",
            "description",
            "location",
            "duration_months",

            # 🔘 investment toggle
            "needs_investment",

            # 💰 investment fields
            "target_amount",
            "expected_roi",
            "investment_type",
            "total_stocks",

            "status",
            "materials",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "created_at",
            "target_amount",  # auto-calculated
        ]

    def create(self, validated_data):
        materials_data = validated_data.pop("materials", [])
        request = self.context.get("request")

        # ----------------------------
        # CREATE PROJECT DRAFT
        # ----------------------------
        draft = ProjectDraft.objects.create(
            owner=request.user if request else None,
            **validated_data
        )

        # ----------------------------
        # CREATE MATERIALS
        # ----------------------------
        for m in materials_data:
            ProjectDraftMaterial.objects.create(
                project=draft,
                name=m.get("name", ""),
                quantity=m.get("quantity", 0),
                unit_cost=m.get("unit_cost", 0),
            )

        # ----------------------------
        # INVESTMENT HANDLING
        # ----------------------------
        if not draft.needs_investment:
            draft.expected_roi = None
            draft.investment_type = None
            draft.total_stocks = None
            draft.target_amount = 0
            draft.save(update_fields=[
                "expected_roi",
                "investment_type",
                "total_stocks",
                "target_amount",
            ])
        else:
            # auto-calc from materials
            draft.recalculate_target_amount()

        return draft