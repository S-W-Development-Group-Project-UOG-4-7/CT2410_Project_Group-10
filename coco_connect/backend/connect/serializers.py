from rest_framework import serializers
from .models import Idea


class IdeaSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(
        source="author.username",
        read_only=True
    )

    class Meta:
        model = Idea
        fields = [
            "id",
            "author",
            "author_username",
            "title",
            "short_description",
            "full_description",
            "is_paid",
            "price",
            "attachment",
            "created_at",
        ]
        read_only_fields = ["author", "created_at"]
