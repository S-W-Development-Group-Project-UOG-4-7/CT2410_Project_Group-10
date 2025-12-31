from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.db.models import Q

from rest_framework.viewsets import ModelViewSet
from .models import News
from .serializers import NewsSerializer

@csrf_exempt
def register(request):
    if request.method == "POST":
        data = json.loads(request.body)

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        if not all([name, email, password, role]):
            return JsonResponse({"error": "All fields required"}, status=400)

        if User.objects.filter(username=email).exists():
            return JsonResponse({"error": "User already exists"}, status=400)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name,
        )

        # update role in profile
        # If you have Profile model/signals this works; otherwise avoid crashing
        if hasattr(user, "profile"):
            user.profile.role = role
            user.profile.save()


        return JsonResponse({"message": "User registered successfully"}, status=201)

    return JsonResponse({"error": "Invalid request"}, status=405)

from django.http import JsonResponse

def hello_coco(request):
    return JsonResponse({
        "message": "CocoConnect API is working 🚀"
    })

from django.contrib.auth import authenticate

@csrf_exempt
def login(request):
    if request.method == "POST":
        data = json.loads(request.body)

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)

        user = authenticate(username=email, password=password)

        if user is None:
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        return JsonResponse({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.first_name,
                "role": user.profile.role if hasattr(user, "profile") else "User"

            }
        }, status=200)

    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
def users_list(request):
    if request.method == "GET":
        q = request.GET.get("q", "").strip()

        qs = User.objects.all().order_by("-date_joined")
        if q:
            qs = qs.filter(
                Q(first_name__icontains=q) |
                Q(last_name__icontains=q) |
                Q(email__icontains=q) |
                Q(username__icontains=q)
            )

        data = []
        for u in qs:
          data.append({
            "id": u.id,
            "name": (u.first_name + " " + u.last_name).strip() or u.username,
            "email": u.email,
            "role": (
                u.profile.role
                if hasattr(u, "profile")
                else ("Admin" if u.is_staff else "User")
            ),
            "is_active": u.is_active,
        })


        return JsonResponse({"users": data}, status=200)

    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
def users_delete(request, user_id):
    if request.method == "DELETE":
        try:
            u = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

        # optional safety: avoid deleting superuser
        if u.is_superuser:
            return JsonResponse({"error": "Cannot delete superuser"}, status=403)

        u.delete()
        return JsonResponse({"message": "User deleted"}, status=200)

    return JsonResponse({"error": "Invalid request"}, status=405)

@csrf_exempt
def users_update(request, user_id):
    # PATCH: update fields like is_active (deactivate/activate)
    if request.method == "PATCH":
        try:
            u = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

        data = json.loads(request.body or "{}")

        # deactivate/activate
        if "is_active" in data:
            u.is_active = bool(data["is_active"])
            u.save()

        # optionally update role if you want (safe)
        if "role" in data and hasattr(u, "profile"):
            u.profile.role = data["role"]
            u.profile.save()

        return JsonResponse({"message": "User updated"}, status=200)

    return JsonResponse({"error": "Invalid request"}, status=405)


class NewsViewSet(ModelViewSet):
    queryset = News.objects.all().order_by("-date", "-id")
    serializer_class = NewsSerializer