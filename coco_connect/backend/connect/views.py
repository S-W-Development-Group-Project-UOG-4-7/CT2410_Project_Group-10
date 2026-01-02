# connect/views.py

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from rest_framework.viewsets import ModelViewSet
from .models import News
from .serializers import NewsSerializer


def hello_coco(request):
    return JsonResponse({"message": "CocoConnect API is working 🚀"})


@csrf_exempt
def register(request):
    """
    Creates a Django auth User.
    NOTE: Your current DB schema shows connect_profile has NO user_id and NO role,
    so we do NOT touch user.profile here.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    role = (data.get("role") or "").strip()  # accepted but not stored (see note above)

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

    # If you want Admin creation via this endpoint, you can optionally do:
    # if role == "Admin":
    #     user.is_staff = True
    #     user.save()

    return JsonResponse({"message": "User registered successfully"}, status=201)


@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not email or not password:
        return JsonResponse({"error": "Email and password required"}, status=400)

    user = authenticate(username=email, password=password)
    if user is None:
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    return JsonResponse(
        {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.first_name,
                # No profile.role in your schema; derive from Django flags:
                "role": "Admin" if user.is_staff else "User",
            },
        },
        status=200,
    )


@csrf_exempt
def users_list(request):
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request"}, status=405)

    q = (request.GET.get("q") or "").strip()

    qs = User.objects.all().order_by("-date_joined")
    if q:
        qs = qs.filter(
            Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
            | Q(email__icontains=q)
            | Q(username__icontains=q)
        )

    data = []
    for u in qs:
        data.append(
            {
                "id": u.id,
                "name": (u.first_name + " " + u.last_name).strip() or u.username,
                "email": u.email,
                # No profile.role in your schema; derive from Django flags:
                "role": "Admin" if u.is_staff else "User",
                "is_active": u.is_active,
            }
        )

    return JsonResponse({"users": data}, status=200)


@csrf_exempt
def users_delete(request, user_id):
    if request.method != "DELETE":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        u = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    if u.is_superuser:
        return JsonResponse({"error": "Cannot delete superuser"}, status=403)

    u.delete()
    return JsonResponse({"message": "User deleted"}, status=200)


@csrf_exempt
def users_update(request, user_id):
    """
    PATCH supports updating is_active.
    NOTE: We do NOT update role via profile because your schema has no profile.user/role.
    """
    if request.method != "PATCH":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        u = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User not found"}, status=404)

    try:
        data = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    if "is_active" in data:
        u.is_active = bool(data["is_active"])
        u.save()

    # Optional: allow changing staff flag as "role" (if you WANT that behavior)
    # role = data.get("role")
    # if role in ["Admin", "User"]:
    #     u.is_staff = (role == "Admin")
    #     u.save()

    return JsonResponse({"message": "User updated"}, status=200)


class NewsViewSet(ModelViewSet):
    queryset = News.objects.all().order_by("-date", "-id")
    serializer_class = NewsSerializer
