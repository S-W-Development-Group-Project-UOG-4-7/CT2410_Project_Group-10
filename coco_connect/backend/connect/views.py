from django.contrib.auth.models import User
from django.utils import timezone

from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Idea, SimilarityAlert
from .serializers import (
    IdeaSerializer,
    SimilarityAlertSerializer,
    EmailTokenObtainPairSerializer,
)
from .permissions import IsOwner

# 🤖 AI Similarity
from .services.embeddings import get_embedding
from .services.similarity import cosine_similarity


# =====================================================
# 🔐 EMAIL-BASED JWT LOGIN (Frontend sends email)
# =====================================================
class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        """
        Frontend sends:
        {
            email: "...",
            password: "..."
        }

        SimpleJWT expects:
        {
            username: "...",
            password: "..."
        }

        We map email → username internally.
        """
        data = request.data.copy()

        if "email" in data and "username" not in data:
            data["username"] = data["email"]

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)


# =====================================================
# 🔓 REGISTER API
# =====================================================
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get("name", "").strip()
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "").strip()
        role = request.data.get("role", "").strip()

        if not all([name, email, password, role]):
            return Response(
                {"error": "All fields are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "User already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 🔑 IMPORTANT: username = email
        User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name,
        )

        return Response(
            {"message": "User registered successfully"},
            status=status.HTTP_201_CREATED,
        )


# =====================================================
# 💡 IDEAS API (AI DUPLICATION PREVENTION)
# =====================================================
class IdeaViewSet(ModelViewSet):
    queryset = Idea.objects.all().order_by("-created_at")
    serializer_class = IdeaSerializer

    # 🎯 Similarity thresholds
    BLOCK_THRESHOLD = 0.85    # Hard block
    WARNING_THRESHOLD = 0.80  # Warning + alert

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsOwner()]
        elif self.action == "create":
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]

    # -------- HELPERS --------
    def build_combined_text(self, title, short_desc, full_desc):
        return f"""
        Title: {title}
        Short Description: {short_desc}
        Full Description: {full_desc}
        """

    def find_similar_ideas(self, new_embedding, exclude_id=None):
        matches = []
        qs = Idea.objects.exclude(embedding=None)

        if exclude_id:
            qs = qs.exclude(id=exclude_id)

        for idea in qs:
            score = cosine_similarity(new_embedding, idea.embedding)

            # 🧪 Debug
            print(f"SIMILARITY vs Idea {idea.id}: {score}")

            if score >= self.WARNING_THRESHOLD:
                matches.append({
                    "id": idea.id,
                    "title": idea.title,
                    "author": idea.author.email,
                    "score": round(score, 3),
                })

        return sorted(matches, key=lambda x: x["score"], reverse=True)[:5]

    def create_similarity_alerts(self, new_idea, matches):
        for match in matches:
            try:
                original = Idea.objects.get(id=match["id"])
            except Idea.DoesNotExist:
                continue

            SimilarityAlert.objects.create(
                original_idea=original,
                similar_idea=new_idea,
                original_owner=original.author,
                similarity_score=match["score"],
            )

    # -------- CREATE --------
    def create(self, request, *args, **kwargs):
        title = request.data.get("title", "")
        short_desc = request.data.get("short_description", "")
        full_desc = request.data.get("full_description", "")

        combined_text = self.build_combined_text(title, short_desc, full_desc)
        new_embedding = get_embedding(combined_text)

        matches = self.find_similar_ideas(new_embedding)

        # ❌ HARD BLOCK
        if matches and matches[0]["score"] >= self.BLOCK_THRESHOLD:
            return Response(
                {
                    "type": "BLOCK",
                    "error": f"This idea is too similar ({int(self.BLOCK_THRESHOLD * 100)}%+).",
                    "matches": matches,
                },
                status=status.HTTP_409_CONFLICT,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        idea = serializer.save(author=request.user, embedding=new_embedding)

        # ⚠️ WARNING + ALERTS
        if matches:
            self.create_similarity_alerts(idea, matches)
            return Response(
                {
                    "type": "WARNING",
                    "matches": matches,
                    "idea": self.get_serializer(idea).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(self.get_serializer(idea).data, status=status.HTTP_201_CREATED)

    # -------- UPDATE / PATCH --------
    def _update_with_similarity(self, request, partial=False):
        instance = self.get_object()

        title = request.data.get("title", instance.title)
        short_desc = request.data.get("short_description", instance.short_description)
        full_desc = request.data.get("full_description", instance.full_description)

        combined_text = self.build_combined_text(title, short_desc, full_desc)
        new_embedding = get_embedding(combined_text)

        matches = self.find_similar_ideas(new_embedding, exclude_id=instance.id)

        if matches and matches[0]["score"] >= self.BLOCK_THRESHOLD:
            return Response(
                {
                    "type": "BLOCK",
                    "error": f"Update would create a duplicate ({int(self.BLOCK_THRESHOLD * 100)}%+).",
                    "matches": matches,
                },
                status=status.HTTP_409_CONFLICT,
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        idea = serializer.save()
        idea.embedding = new_embedding
        idea.save(update_fields=["embedding"])

        if matches:
            self.create_similarity_alerts(idea, matches)
            return Response(
                {
                    "type": "WARNING",
                    "matches": matches,
                    "idea": self.get_serializer(idea).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(self.get_serializer(idea).data, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        return self._update_with_similarity(request, partial=False)

    def partial_update(self, request, *args, **kwargs):
        return self._update_with_similarity(request, partial=True)


# =====================================================
# 🚨 SIMILARITY ALERTS API
# =====================================================
class SimilarityAlertViewSet(ModelViewSet):
    serializer_class = SimilarityAlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            SimilarityAlert.objects
            .filter(original_owner=self.request.user)
            .select_related("original_idea", "similar_idea")
            .order_by("-created_at")
        )

    @action(detail=True, methods=["post"])
    def report(self, request, pk=None):
        alert = self.get_object()

        if alert.original_owner != request.user:
            raise PermissionDenied("You cannot report this idea")

        if alert.is_reported:
            return Response(
                {"error": "This idea is already reported"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        alert.is_reported = True
        alert.report_reason = request.data.get("report_reason", "")
        alert.reported_at = timezone.now()
        alert.save()

        return Response(
            {"message": "Idea reported successfully. Admin review pending."},
            status=status.HTTP_200_OK,
        )
