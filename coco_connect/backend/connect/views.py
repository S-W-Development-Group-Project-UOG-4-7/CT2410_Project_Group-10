from django.contrib.auth.models import User
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response
from rest_framework import status

from .models import Idea
from .serializers import IdeaSerializer
from .permissions import IsOwner

# ✅ AI similarity imports (FREE)
from .services.embeddings import get_embedding
from .services.similarity import cosine_similarity


# ============================
# 🔓 REGISTER (PUBLIC)
# ============================
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get("name")
        email = request.data.get("email")
        password = request.data.get("password")
        role = request.data.get("role")

        if not all([name, email, password, role]):
            return Response(
                {"error": "All fields are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=email).exists():
            return Response(
                {"error": "User already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

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


# ============================
# 🔐 IDEAS API (AI Similarity Check)
# ============================
class IdeaViewSet(ModelViewSet):
    queryset = Idea.objects.all().order_by("-created_at")
    serializer_class = IdeaSerializer

    # ✅ similarity threshold
    # 0.85 = strict, 0.80 = best, 0.75 = very sensitive
    SIM_THRESHOLD = 0.80

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            permissions = [IsAuthenticated, IsOwner]
        elif self.action == "create":
            permissions = [IsAuthenticated]
        else:
            permissions = [IsAuthenticatedOrReadOnly]

        return [permission() for permission in permissions]

    # ✅ helper: build text for embedding
    def build_combined_text(self, title, short_desc, full_desc):
        return f"""
        Title: {title}
        Short Description: {short_desc}
        Full Description: {full_desc}
        """

    # ✅ helper: find similar ideas
    def find_similar_ideas(self, new_embedding, exclude_id=None):
        matches = []

        # ✅ check ALL IDEAS from ALL USERS
        qs = Idea.objects.exclude(embedding=None)

        # ✅ exclude current idea when editing
        if exclude_id:
            qs = qs.exclude(id=exclude_id)

        for idea in qs:
            score = cosine_similarity(new_embedding, idea.embedding)

            if score >= self.SIM_THRESHOLD:
                matches.append({
                    "id": idea.id,
                    "title": idea.title,
                    "score": round(score, 3),
                })

        matches = sorted(matches, key=lambda x: x["score"], reverse=True)[:5]
        return matches

    # ✅ CREATE IDEA with AI Similarity Check
    def create(self, request, *args, **kwargs):
        title = request.data.get("title", "")
        short_desc = request.data.get("short_description", "")
        full_desc = request.data.get("full_description", "")

        combined_text = self.build_combined_text(title, short_desc, full_desc)
        new_embedding = get_embedding(combined_text)

        matches = self.find_similar_ideas(new_embedding)

        # ✅ if similar ideas exist → block publish
        if matches:
            return Response(
                {
                    "error": "Similar idea already exists. Please check before publishing.",
                    "matches": matches
                },
                status=status.HTTP_409_CONFLICT
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj = serializer.save(author=request.user, embedding=new_embedding)

        return Response(self.get_serializer(obj).data, status=status.HTTP_201_CREATED)

    # ✅ UPDATE IDEA → regenerate embedding and re-check similarity
    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        title = request.data.get("title", instance.title)
        short_desc = request.data.get("short_description", instance.short_description)
        full_desc = request.data.get("full_description", instance.full_description)

        combined_text = self.build_combined_text(title, short_desc, full_desc)
        new_embedding = get_embedding(combined_text)

        matches = self.find_similar_ideas(new_embedding, exclude_id=instance.id)

        # ✅ prevent updating into duplicate
        if matches:
            return Response(
                {
                    "error": "Updating this idea will create a duplicate. Please modify before saving.",
                    "matches": matches
                },
                status=status.HTTP_409_CONFLICT
            )

        serializer = self.get_serializer(instance, data=request.data, partial=False)
        serializer.is_valid(raise_exception=True)

        obj = serializer.save()
        obj.embedding = new_embedding
        obj.save(update_fields=["embedding"])

        return Response(self.get_serializer(obj).data, status=status.HTTP_200_OK)

    # ✅ PATCH IDEA (partial update) also checks similarity
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        title = request.data.get("title", instance.title)
        short_desc = request.data.get("short_description", instance.short_description)
        full_desc = request.data.get("full_description", instance.full_description)

        combined_text = self.build_combined_text(title, short_desc, full_desc)
        new_embedding = get_embedding(combined_text)

        matches = self.find_similar_ideas(new_embedding, exclude_id=instance.id)

        if matches:
            return Response(
                {
                    "error": "Updating this idea will create a duplicate. Please modify before saving.",
                    "matches": matches
                },
                status=status.HTTP_409_CONFLICT
            )

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        obj = serializer.save()
        obj.embedding = new_embedding
        obj.save(update_fields=["embedding"])

        return Response(self.get_serializer(obj).data, status=status.HTTP_200_OK)
