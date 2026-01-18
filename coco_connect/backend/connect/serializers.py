from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Idea, SimilarityAlert


# =========================
# 💡 IDEA SERIALIZER
# =========================
class IdeaSerializer(serializers.ModelSerializer):
    # ✅ used when viewing similar idea inline
    author_email = serializers.EmailField(
        source="author.email",
        read_only=True
    )

    class Meta:
        model = Idea
        fields = "__all__"
        read_only_fields = [
            "author",
            "created_at",
            "embedding",
        ]


# =========================
# 🚨 SIMILARITY ALERT SERIALIZER
# =========================
class SimilarityAlertSerializer(serializers.ModelSerializer):
    # titles for UI
    original_idea_title = serializers.CharField(
        source="original_idea.title",
        read_only=True
    )
    similar_idea_title = serializers.CharField(
        source="similar_idea.title",
        read_only=True
    )

    # owner email (display only)
    similar_idea_owner = serializers.EmailField(
        source="similar_idea.author.email",
        read_only=True
    )

    # ✅ REQUIRED for "View Similar" (VERY IMPORTANT)
    similar_idea_id = serializers.IntegerField(
        source="similar_idea.id",
        read_only=True
    )

    class Meta:
        model = SimilarityAlert
        fields = "__all__"
        read_only_fields = [
            "original_owner",
            "created_at",
            "similarity_score",
        ]


# =========================
# 🔐 EMAIL JWT LOGIN SERIALIZER
# =========================
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    FINAL VERSION:
    - Email → username handled in view
    - SimpleJWT authenticates once
    - Clean response for frontend
    """

    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "name": user.first_name,
        }

        return data
