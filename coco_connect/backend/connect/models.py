from django.db import models
from django.contrib.auth.models import User


class Idea(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ideas")

    title = models.CharField(max_length=255)
    short_description = models.TextField()
    full_description = models.TextField()

    is_paid = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    document = models.FileField(upload_to="ideas/", null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # ✅ AI Embedding Vector
    embedding = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class SimilarityAlert(models.Model):
    original_idea = models.ForeignKey(
        Idea,
        on_delete=models.CASCADE,
        related_name="alerts_as_original"
    )
    similar_idea = models.ForeignKey(
        Idea,
        on_delete=models.CASCADE,
        related_name="alerts_as_similar"
    )
    original_owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="similarity_alerts"
    )

    similarity_score = models.FloatField(default=0)

    is_reported = models.BooleanField(default=False)
    report_reason = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Alert: {self.original_idea.title} ↔ {self.similar_idea.title}"
