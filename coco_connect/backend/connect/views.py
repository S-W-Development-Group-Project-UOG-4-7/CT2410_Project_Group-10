# connect/views.py

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Q, Sum
from django.utils import timezone
import json
import decimal
import random
import string

from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import (
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
    IsAdminUser,
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken

from .models import (
    Idea,
    Profile,
    InvestmentCategory,
    InvestmentProject,
    Investment,
    Product,
    News,
)
from .serializers import IdeaSerializer, NewsSerializer
from .permissions import IsOwner

# AI similarity
from .services.embeddings import get_embedding
from .services.similarity import cosine_similarity


# =================================================
# AUTH HELPER (SESSION + JWT)
# =================================================
def check_auth(request):
    if getattr(request, "user", None) and request.user.is_authenticated:
        return request.user

    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION") or ""
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
        try:
            access = AccessToken(token)
            user_id = access.get("user_id")
            return User.objects.get(id=user_id)
        except Exception:
            return None

    return None


# =================================================
# BASIC API
# =================================================
@csrf_exempt
def hello_coco(request):
    return JsonResponse({"message": "CocoConnect API is running"})


# =================================================
# REGISTER
# =================================================
@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body or "{}")

        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")
        role = (data.get("role") or "buyer").strip()

        if not all([name, email, password]):
            return JsonResponse(
                {"error": "Name, email, and password are required"},
                status=400,
            )

        if User.objects.filter(username=email).exists():
            return JsonResponse({"error": "User already exists"}, status=400)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name,
        )

        Profile.objects.get_or_create(user=user, defaults={"role": role})

        return JsonResponse(
            {
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.first_name,
                    "role": role,
                },
            },
            status=201,
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# =================================================
# LOGIN (SESSION)
# =================================================
@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body or "{}")

        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)

        user = authenticate(username=email, password=password)
        if user is None:
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        auth_login(request, user)

        profile, _ = Profile.objects.get_or_create(user=user)

        return JsonResponse(
            {
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.first_name,
                    "role": profile.role,
                },
            },
            status=200,
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# =================================================
# ADMIN: USERS
# =================================================
@api_view(["GET"])
@permission_classes([IsAdminUser])
def users_list(request):
    q = (request.GET.get("q") or "").strip()

    qs = User.objects.all().order_by("-date_joined")
    if q:
        qs = qs.filter(
            Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
            | Q(email__icontains=q)
            | Q(username__icontains=q)
        )

    users = []
    for u in qs:
        profile = getattr(u, "profile", None)
        users.append(
            {
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}".strip() or u.username,
                "email": u.email,
                "role": getattr(profile, "role", ""),
                "is_active": u.is_active,
                "is_staff": u.is_staff,
            }
        )

    return Response({"users": users})


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def users_delete(request, user_id):
    try:
        u = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if u.is_superuser:
        return Response({"error": "Cannot delete superuser"}, status=403)

    u.delete()
    return Response({"message": "User deleted"})


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def users_update(request, user_id):
    try:
        u = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if "is_active" in request.data:
        u.is_active = bool(request.data["is_active"])
    if "is_staff" in request.data:
        u.is_staff = bool(request.data["is_staff"])
    u.save()

    if "role" in request.data:
        profile, _ = Profile.objects.get_or_create(user=u)
        profile.role = request.data["role"]
        profile.save()

    return Response({"message": "User updated"})


# =================================================
# NEWS
# =================================================
class NewsViewSet(ModelViewSet):
    queryset = News.objects.all().order_by("-date", "-id")
    serializer_class = NewsSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]


# =================================================
# IDEAS (AI SIMILARITY)
# =================================================
class IdeaViewSet(ModelViewSet):
    queryset = Idea.objects.all().order_by("-created_at")
    serializer_class = IdeaSerializer
    SIM_THRESHOLD = 0.80

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsOwner()]
        elif self.action == "create":
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]

    def build_combined_text(self, title, short_desc, full_desc):
        return f"Title: {title}\nShort Description: {short_desc}\nFull Description: {full_desc}"

    def find_similar_ideas(self, embedding, exclude_id=None):
        matches = []
        qs = Idea.objects.exclude(embedding=None)
        if exclude_id:
            qs = qs.exclude(id=exclude_id)

        for idea in qs:
            score = cosine_similarity(embedding, idea.embedding)
            if score >= self.SIM_THRESHOLD:
                matches.append({"id": idea.id, "title": idea.title, "score": round(score, 3)})

        return sorted(matches, key=lambda x: x["score"], reverse=True)[:5]
