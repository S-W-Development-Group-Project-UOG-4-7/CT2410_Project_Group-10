from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate

# ------------------ Hello API ------------------
def hello_coco(request):
    return JsonResponse({"message": "CocoConnect API is running"})

# ------------------ Register ------------------
@csrf_exempt
def register(request):
    if request.method == "POST":
        data = json.loads(request.body or "{}")

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")  # optional, can store in DB later

        if not all([name, email, password]):
            return JsonResponse({"error": "Name, email, and password required"}, status=400)

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

        # For now, skip role until you create a Profile model
        return JsonResponse({"message": "User registered successfully"}, status=201)

    return JsonResponse({"error": "Invalid request"}, status=405)

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

# ------------------ Login ------------------
@csrf_exempt
def login(request):
    if request.method == "POST":
        data = json.loads(request.body or "{}")

        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)

        # ✅ find user by email
        try:
            u = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        # ✅ authenticate using the real username (whatever it is)
        user = authenticate(username=u.username, password=password)

        if user is None:
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        return JsonResponse({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.first_name,
                "role": "Admin" if user.is_staff else "User",
                # "role": role,  # skip role for now
            }
        }, status=200)

    return JsonResponse({"error": "Invalid request"}, status=405)



@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user

    if request.method == "PUT":
        username = request.data.get("username", "").strip()
        first_name = request.data.get("first_name", user.first_name).strip()
        last_name = request.data.get("last_name", user.last_name).strip()

        if username:
            # ✅ block duplicates
            if User.objects.exclude(id=user.id).filter(username=username).exists():
                return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
            user.username = username

        user.first_name = first_name
        user.last_name = last_name
        user.save()

    return Response({
        "id": user.id,
        "username": user.username,          # ✅ send username to frontend
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": "Admin" if user.is_staff else "User",
        "is_active": user.is_active,
    })



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user

    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not current_password or not new_password:
        return Response({"error": "Current and new password required"}, status=status.HTTP_400_BAD_REQUEST)

    if confirm_password is not None and new_password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)

    if not user.check_password(current_password):
        return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
