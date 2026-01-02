from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework import status


from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json


def hello_coco(request):
    return JsonResponse({"message": "CocoConnect API is running"})


@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except Exception:
            return JsonResponse({"error": "Invalid JSON body"}, status=400)

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")
        role = data.get("role")

        if not all([name, email, password, role]):
            return JsonResponse({"error": "All fields required"}, status=400)

        if User.objects.filter(username=email).exists():
            return JsonResponse({"error": "User already exists"}, status=400)

        try:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=name,
            )

            # update role in profile (signal should have created it)
            try:
                user.profile.role = role
                user.profile.save()
            except Exception:
                # fallback: create or update profile
                from .models import Profile
                Profile.objects.update_or_create(user=user, defaults={"role": role})

            return JsonResponse({"message": "User registered successfully"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request"}, status=405)




from django.contrib.auth import authenticate

@csrf_exempt
def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except Exception:
            return JsonResponse({"error": "Invalid JSON body"}, status=400)

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)

        try:
            user = authenticate(username=email, password=password)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

        if user is None:
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        role = None
        try:
            role = user.profile.role
        except Exception:
            role = None

        return JsonResponse({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.first_name,
                "role": role
            }
        }, status=200)

    return JsonResponse({"error": "Invalid request"}, status=405)

