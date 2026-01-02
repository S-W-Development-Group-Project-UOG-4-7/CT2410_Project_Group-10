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
# 🔐 IDEAS API
# ============================
class IdeaViewSet(ModelViewSet):
    queryset = Idea.objects.all().order_by("-created_at")
    serializer_class = IdeaSerializer

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            permissions = [IsAuthenticated, IsOwner]
        elif self.action == "create":
            permissions = [IsAuthenticated]
        else:
            permissions = [IsAuthenticatedOrReadOnly]

        return [permission() for permission in permissions]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
