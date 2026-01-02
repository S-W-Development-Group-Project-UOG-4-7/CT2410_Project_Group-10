from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework import status

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.contrib.auth import authenticate


def hello_coco(request):
    return JsonResponse({"message": "CocoConnect API is running"})

@csrf_exempt
def register(request):
    if request.method == "POST":
        data = json.loads(request.body or "{}")

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

        # ✅ role is not stored in Profile (no User<->Profile relation in DB)
        # Optional: if you want Admin role to mean staff:
        if role == "Admin":
            user.is_staff = True
            user.save()

        return JsonResponse({"message": "User registered successfully"}, status=201)

    return JsonResponse({"error": "Invalid request"}, status=405)


@csrf_exempt
def login(request):
    if request.method == "POST":
        data = json.loads(request.body or "{}")

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
                "role": "Admin" if user.is_staff else "User",
            }
        }, status=200)

    return JsonResponse({"error": "Invalid request"}, status=405)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user

    if request.method == "PUT":
        user.first_name = request.data.get("name", user.first_name)
        user.email = request.data.get("email", user.email)
        user.save()

    return Response({
        "id": user.id,
        "email": user.email,
        "name": user.first_name,
        "role": "Admin" if user.is_staff else "User",
        "is_active": user.is_active,
    })
