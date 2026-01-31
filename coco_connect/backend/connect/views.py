# connect/views.py
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate, login as auth_login
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Q, Sum
from django.utils import timezone
from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .permissions import IsOwner
from .services.embeddings import get_embedding
from .services.similarity import cosine_similarity
from .serializers import AuthLogSerializer
from .models import AuthLog

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
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAdminUser


from .models import (
    Idea,
    Profile,
    InvestmentCategory,
    InvestmentProject,
    Investment,
    Product,
    News,
    SimilarityAlert,
)
from .serializers import (
    IdeaSerializer,
    NewsSerializer,
    SimilarityAlertSerializer,
)

# =================================================
# AUTH LOG HELPER
# =================================================
def log_auth(user, action, status, message=""):
    AuthLog.objects.create(
        user=user,          # can be None for failed login
        action=action,      # LOGIN / LOGOUT
        status=status,      # SUCCESS / FAILED
        message=message or ""
    )

# =================================================
# AUTH HELPER (SESSION + JWT)
# =================================================
def check_auth(request):
    """
    Supports:
    - Session auth (request.user)
    - JWT Bearer token in Authorization header
    """
    if getattr(request, "user", None) and request.user.is_authenticated:
        return request.user

    auth_header = (
        request.headers.get("Authorization")
        or request.META.get("HTTP_AUTHORIZATION")
        or ""
    )
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

        # ✅ Accept both old + new payloads
        first_name = (data.get("first_name") or "").strip()
        last_name = (data.get("last_name") or "").strip()
        name = (data.get("name") or "").strip()  # backward compatibility

        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        # ✅ DEFAULT ROLE = user
        role = (data.get("role") or "User").strip()

        # 🔁 fallback: split full name if first/last not provided
        if not first_name and name:
            parts = name.split()
            first_name = parts[0]
            last_name = " ".join(parts[1:]) if len(parts) > 1 else ""

        if not first_name or not email or not password:
            return JsonResponse(
                {"error": "First name, email, and password are required"},
                status=400,
            )

        if User.objects.filter(username=email).exists():
            return JsonResponse({"error": "User already exists"}, status=400)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        Profile.objects.get_or_create(
            user=user,
            defaults={"role": role},
        )

        return JsonResponse(
            {
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "full_name": f"{user.first_name} {user.last_name}".strip(),
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
            log_auth(
                user=None,
                action=AuthLog.Action.LOGIN,
                status=AuthLog.Status.FAILED,
                message="Invalid credentials",
            )
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        if not user.is_active:
            log_auth(
                user=user,
                action=AuthLog.Action.LOGIN,
                status=AuthLog.Status.FAILED,
                message="User inactive",
            )
            return JsonResponse({"error": "Account disabled"}, status=403)

        auth_login(request, user)

        log_auth(
            user=user,
            action=AuthLog.Action.LOGIN,
            status=AuthLog.Status.SUCCESS,
            message="Login success",
        )

        profile, _ = Profile.objects.get_or_create(user=user)

        # Generate JWT token for frontend
        refresh = RefreshToken.for_user(user)

        return JsonResponse(
            {
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.first_name,
                    "role": profile.role,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=200,
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

# ================================================
#   Logout 
# ================================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    log_auth(
        user=request.user,
        action=AuthLog.Action.LOGOUT,
        status=AuthLog.Status.SUCCESS,
        message="Logout success",
    )
    return Response({"detail": "Logged out"})

# =================================================
# USER PROFILE
# =================================================
@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    profile = getattr(user, "profile", None)

    if request.method in ["PUT", "PATCH"]:
        # Allow updating first/last name safely.
        first_name = (request.data.get("first_name") or "").strip()
        last_name = (request.data.get("last_name") or "").strip()

        if first_name != "":
            user.first_name = first_name
        # last name can be empty intentionally
        user.last_name = last_name

        user.save()

    full_name = f"{user.first_name} {user.last_name}".strip()

    # ✅ Roles from Django Groups (auth_group)
    roles = list(user.groups.values_list("name", flat=True))

    # ✅ keep old field for compatibility (optional)
    legacy_role = getattr(profile, "role", "user") if profile else "user"

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name or "",
            "last_name": user.last_name or "",
            "full_name": full_name,
            "name": full_name or user.username,  # frontend compatibility

            # ✅ NEW: the roles to show on dashboard
            "roles": roles,

            # (optional) old field you already use
            "role": legacy_role,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")  # ✅ accept confirm too

    if not current_password or not new_password:
        return Response(
            {"error": "current_password and new_password are required"},
            status=400,
        )

    if confirm_password is not None and new_password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=400)

    user = request.user

    if not user.check_password(current_password):
        return Response({"error": "Current password is incorrect"}, status=400)

    try:
        validate_password(new_password, user=user)
    except ValidationError as e:
        return Response({"error": e.messages}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password changed successfully"})

# =================================================
# ADMIN: USERS - UPDATED (MULTI-ROLE SUPPORT)
# =================================================
@api_view(["GET"])
@permission_classes([IsAdminUser])
def users_list(request):
    """
    Returns users with ALL roles (groups) included.
    Frontend-friendly:
      - roles: ["Investor", "Customer"]
      - role_ids: [2, 4]
      - role: kept for backward compatibility (first role OR profile.role)
    """
    q = (request.GET.get("q") or "").strip()

    qs = (
        User.objects.all()
        .select_related("profile")
        .prefetch_related("groups")  # ✅ important to fetch roles efficiently
        .order_by("-date_joined")
    )

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

        group_names = list(u.groups.values_list("name", flat=True))
        group_ids = list(u.groups.values_list("id", flat=True))

        # Backward compatibility for older UI that expects a single "role"
        primary_role = None
        if group_names:
            primary_role = group_names[0]
        elif profile and getattr(profile, "role", None):
            primary_role = profile.role
        else:
            primary_role = "user"

        users.append(
            {
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}".strip() or u.username,
                "email": u.email,
                "roles": group_names,      # ✅ NEW: all role names
                "role_ids": group_ids,     # ✅ NEW: all role ids
                "role": primary_role,      # ✅ kept for older frontend compatibility
                "is_active": u.is_active,
                "is_staff": u.is_staff,
                "is_superuser": u.is_superuser,
                "date_joined": u.date_joined.isoformat() if u.date_joined else None,
                "created_at": u.date_joined.isoformat() if u.date_joined else None,
            }
        )

    return Response({"users": users})

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_user_roles(request, user_id):
    try:
        u = User.objects.prefetch_related("groups").get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    return Response({
        "role_ids": list(u.groups.values_list("id", flat=True)),
        "roles": [{"id": g.id, "name": g.name} for g in u.groups.all().order_by("name")],
    })


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
    """
    Supports:
      - Update basic fields: is_active, is_staff, name
      - Role management via Django Groups:
          A) Replace all roles:
              { "roles": ["Investor", "Customer"] }
              OR { "role_ids": [2, 4] }

          B) Add roles:
              { "add_roles": ["Farmer"] }
              OR { "add_role_ids": [6] }

          C) Remove roles:
              { "remove_roles": ["Customer"] }
              OR { "remove_role_ids": [4] }

    Returns updated user roles in response.
    """
    try:
        u = User.objects.prefetch_related("groups").get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    if u.is_superuser and not request.user.is_superuser:
        return Response({"error": "Only a superuser can modify another superuser"}, status=403)

    data = request.data

    # -------------------------
    # Update user fields
    # -------------------------
    if "is_active" in data:
        u.is_active = bool(data["is_active"])

    if "is_staff" in data:
        u.is_staff = bool(data["is_staff"])

    if "name" in data and isinstance(data["name"], str):
        name = data["name"].strip()
        if name:
            parts = name.split(" ", 1)
            u.first_name = parts[0]
            u.last_name = parts[1] if len(parts) > 1 else ""

    u.save()

    # -------------------------
    # Role management (auth_group)
    # -------------------------
    def groups_from_names(names):
        clean = [n.strip() for n in names if isinstance(n, str) and n.strip()]
        return list(Group.objects.filter(name__in=clean))

    def groups_from_ids(ids):
        clean = [int(i) for i in ids if str(i).isdigit()]
        return list(Group.objects.filter(id__in=clean))

    # A) Replace all roles
    if "roles" in data and isinstance(data["roles"], list):
        new_groups = groups_from_names(data["roles"])
        u.groups.set(new_groups)

    if "role_ids" in data and isinstance(data["role_ids"], list):
        new_groups = groups_from_ids(data["role_ids"])
        u.groups.set(new_groups)

    # B) Add roles
    if "add_roles" in data and isinstance(data["add_roles"], list):
        add_groups = groups_from_names(data["add_roles"])
        if add_groups:
            u.groups.add(*add_groups)

    if "add_role_ids" in data and isinstance(data["add_role_ids"], list):
        add_groups = groups_from_ids(data["add_role_ids"])
        if add_groups:
            u.groups.add(*add_groups)

    # C) Remove roles
    if "remove_roles" in data and isinstance(data["remove_roles"], list):
        remove_groups = groups_from_names(data["remove_roles"])
        if remove_groups:
            u.groups.remove(*remove_groups)

    if "remove_role_ids" in data and isinstance(data["remove_role_ids"], list):
        remove_groups = groups_from_ids(data["remove_role_ids"])
        if remove_groups:
            u.groups.remove(*remove_groups)

    # OPTIONAL: keep Profile.role in sync with "primary" role (if your UI still uses it)
    if data.get("sync_profile_role", False) is True:
        profile, _ = Profile.objects.get_or_create(user=u)
        role_names = list(u.groups.values_list("name", flat=True))
        profile.role = role_names[0] if role_names else "user"
        profile.save()

    # Return updated user roles
    role_names = list(u.groups.values_list("name", flat=True))
    role_ids = list(u.groups.values_list("id", flat=True))

    return Response(
        {
            "message": "User updated",
            "user": {
                "id": u.id,
                "roles": role_names,
                "role_ids": role_ids,
            },
        }
    )


# =================================================
# ROLES & PERMISSIONS ENDPOINTS (UPDATED - REAL IMPLEMENTATION)
# =================================================
@api_view(["GET"])
@permission_classes([IsAdminUser])
def roles_list(request):
    """
    Return available roles (Django Groups)
    """
    groups = Group.objects.all().order_by('name')
    
    groups_data = []
    for group in groups:
        groups_data.append({
            "id": group.id,
            "name": group.name,
            "description": f"{group.name} role",  # You can add a description field if needed
            "permission_ids": list(group.permissions.values_list('id', flat=True))
        })
    
    return Response({"groups": groups_data})


@api_view(["POST"])
@permission_classes([IsAdminUser])
def roles_create(request):
    name = request.data.get("name", "").strip()
    
    if not name:
        return Response({"error": "Role name is required"}, status=400)
    
    # Check if group already exists
    if Group.objects.filter(name=name).exists():
        return Response({"error": f"Role '{name}' already exists"}, status=400)
    
    try:
        # Create the actual Django Group
        group = Group.objects.create(name=name)
        
        # Optionally add description if you have a custom model
        # For now, we'll just use the name as description
        
        return Response({
            "message": "Role created successfully",
            "group": {
                "id": group.id,
                "name": group.name,
                "description": f"{group.name} role",
                "permission_ids": []
            }
        }, status=201)
        
    except Exception as e:
        return Response({"error": f"Failed to create role: {str(e)}"}, status=500)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def roles_update(request, group_id):
    """
    Update role permissions
    """
    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({"error": "Role not found"}, status=404)
    
    # Update name if provided
    new_name = request.data.get("name", "").strip()
    if new_name and new_name != group.name:
        # Check if new name already exists
        if Group.objects.filter(name=new_name).exclude(id=group_id).exists():
            return Response({"error": f"Role '{new_name}' already exists"}, status=400)
        group.name = new_name
        group.save()
    
    # Update permissions if provided
    permission_ids = request.data.get("permission_ids")
    if permission_ids is not None:
        try:
            # Clear existing permissions
            group.permissions.clear()
            # Add new permissions
            if permission_ids:
                from django.contrib.auth.models import Permission
                permissions = Permission.objects.filter(id__in=permission_ids)
                group.permissions.set(permissions)
        except Exception as e:
            return Response({"error": f"Failed to update permissions: {str(e)}"}, status=400)
    
    return Response({
        "message": "Role updated successfully",
        "group": {
            "id": group.id,
            "name": group.name,
            "description": f"{group.name} role",
            "permission_ids": list(group.permissions.values_list('id', flat=True))
        }
    })


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def roles_delete(request, group_id):
    """
    Delete a role (Django Group)
    """
    try:
        group = Group.objects.get(id=group_id)
    except Group.DoesNotExist:
        return Response({"error": "Role not found"}, status=404)
    
    # Check if this is a system/default role that shouldn't be deleted
    default_roles = ["Admin", "User"]  # Add any other protected roles
    if group.name in default_roles:
        return Response({"error": f"Cannot delete default role '{group.name}'"}, status=403)
    
    # Check if any users are assigned to this group
    user_count = group.user_set.count()
    if user_count > 0:
        return Response({
            "error": f"Cannot delete role '{group.name}' because {user_count} user(s) are assigned to it"
        }, status=400)
    
    try:
        group_name = group.name
        group.delete()
        return Response({"message": f"Role '{group_name}' deleted successfully"})
    except Exception as e:
        return Response({"error": f"Failed to delete role: {str(e)}"}, status=500)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def permissions_list(request):
    """
    Return available permissions from Django
    """
    from django.contrib.auth.models import Permission
    from django.contrib.contenttypes.models import ContentType
    
    permissions = Permission.objects.all().order_by('content_type__app_label', 'codename')
    
    permission_data = []
    for perm in permissions:
        permission_data.append({
            "id": perm.id,
            "name": perm.name,
            "codename": perm.codename,
            "content_type": perm.content_type.app_label,
            "app_label": perm.content_type.app_label,
            "model": perm.content_type.model,
        })
    
    return Response({"permissions": permission_data})


# Keep the existing groups_list endpoint for backward compatibility
@api_view(["GET", "POST"])
@permission_classes([IsAdminUser])
def groups_list(request):
    """
    Handle GET (list) and POST (create) for Django Groups
    """
    if request.method == "GET":
        groups = Group.objects.all().order_by('name')
        data = [{
            "id": g.id,
            "name": g.name,
            "description": f"{g.name} role",
            "permission_ids": list(g.permissions.values_list('id', flat=True))
        } for g in groups]
        return Response({"groups": data})
    
    elif request.method == "POST":
        # Create new group
        name = request.data.get("name", "").strip()
        description = request.data.get("description", "").strip()
        
        if not name:
            return Response({"error": "Role name is required"}, status=400)
        
        # Check if group already exists
        if Group.objects.filter(name=name).exists():
            return Response({"error": f"Role '{name}' already exists"}, status=400)
        
        try:
            # Create the actual Django Group
            group = Group.objects.create(name=name)
            
            return Response({
                "message": "Role created successfully",
                "group": {
                    "id": group.id,
                    "name": group.name,
                    "description": description or f"{group.name} role",
                    "permission_ids": []
                }
            }, status=201)
            
        except Exception as e:
            return Response({"error": f"Failed to create role: {str(e)}"}, status=500)

@api_view(["POST"])
@permission_classes([IsAdminUser])
def groups_create(request):
    """
    Create a new role (Django Group)
    """
    name = request.data.get("name", "").strip()
    description = request.data.get("description", "").strip()
    
    if not name:
        return Response({"error": "Role name is required"}, status=400)
    
    # Check if group already exists
    if Group.objects.filter(name=name).exists():
        return Response({"error": f"Role '{name}' already exists"}, status=400)
    
    try:
        # Create the actual Django Group
        group = Group.objects.create(name=name)
        
        return Response({
            "message": "Role created successfully",
            "group": {
                "id": group.id,
                "name": group.name,
                "description": description or f"{group.name} role",
                "permission_ids": []
            }
        }, status=201)
        
    except Exception as e:
        return Response({"error": f"Failed to create role: {str(e)}"}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_role_details(request, user_id):
    """
    Get roles for a specific user
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
    
    profile = getattr(user, "profile", None)
    role = getattr(profile, "role", "user")
    
    return Response({
        "role_ids": [role.lower().replace(" ", "-")],
        "roles": [{"id": role.lower().replace(" ", "-"), "name": role}]
    })


@api_view(["POST"])
@permission_classes([IsAdminUser])
def assign_user_role(request, user_id):
    """
    Assign a role to a user
    """
    try:
        user = User.objects.get(id=user_id)
        role_name = request.data.get("role_id", "").strip()
        
        if not role_name:
            return Response({"error": "Role ID is required"}, status=400)
        
        # Convert role_id back to proper case
        if role_name == "admin":
            role_name = "Admin"
        elif role_name == "user":
            role_name = "User"
        else:
            # Capitalize first letter of each word
            role_name = " ".join(word.capitalize() for word in role_name.split("-"))
        
        profile, created = Profile.objects.get_or_create(user=user)
        profile.role = role_name
        profile.save()
        
        return Response({"message": "Role assigned"})
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def remove_user_role(request, user_id):
    """
    Remove a role from a user
    """
    try:
        user = User.objects.get(id=user_id)
        profile = getattr(user, "profile", None)
        
        if profile:
            # Set default role
            profile.role = "User"
            profile.save()
        
        return Response({"message": "Role removed"})
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

# =================================================
# NEWS (DRF ViewSet)
# =================================================
class NewsViewSet(ModelViewSet):
    queryset = News.objects.all().order_by("-date", "-id")
    serializer_class = NewsSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]


# ==================================================
# IDEAS (AI similarity: BLOCK/WARN/FORCE + ALERTS)
# ==================================================
class IdeaViewSet(ModelViewSet):
    queryset = Idea.objects.all().order_by("-created_at")
    serializer_class = IdeaSerializer

    # Thresholds from error-correction3 (more complete flow)
    BLOCK_THRESHOLD = 0.85
    WARNING_THRESHOLD = 0.65

    # Also keep main's simpler threshold concept as a constant (no loss)
    SIM_THRESHOLD = 0.80

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsOwner()]
        elif self.action == "create":
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]

    def build_text(self, title, short_desc, full_desc):
        # Combines both styles ("Title: …" and plain join) in a stable way
        title = title or ""
        short_desc = short_desc or ""
        full_desc = full_desc or ""
        return f"Title: {title}\nShort Description: {short_desc}\nFull Description: {full_desc}".strip()

    def find_similar(self, embedding, exclude_id=None):
        """
        Returns top 5 similar ideas, including Idea objects for alerts + UI.
        """
        matches = []
        qs = Idea.objects.exclude(embedding=None)

        if exclude_id:
            qs = qs.exclude(id=exclude_id)

        for idea in qs:
            score = cosine_similarity(embedding, idea.embedding)
            if score is None:
                continue
            matches.append({"idea": idea, "score": float(score)})

        matches.sort(key=lambda x: x["score"], reverse=True)
        return matches[:5]

    def serialize_matches(self, matches):
        return [
            {
                "id": m["idea"].id,
                "title": m["idea"].title,
                "author": (m["idea"].author.get_full_name() or m["idea"].author.username)
                if getattr(m["idea"], "author", None)
                else "",
                "score": round(m["score"], 3),
            }
            for m in matches
        ]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        title = request.data.get("title", "") or ""
        short_desc = request.data.get("short_description", "") or ""
        full_desc = request.data.get("full_description", "") or ""

        # frontend sends "1"/true/yes when user clicks Publish Anyway
        force_publish = str(request.data.get("force_publish", "")).lower() in [
            "1",
            "true",
            "yes",
        ]

        embedding = get_embedding(self.build_text(title, short_desc, full_desc))

        matches = self.find_similar(embedding)
        best_score = matches[0]["score"] if matches else 0.0

        # 🔴 BLOCK
        if best_score >= self.BLOCK_THRESHOLD:
            return Response(
                {
                    "type": "BLOCK",
                    "similarity": round(best_score, 3),
                    "message": (
                        "Cannot publish this idea because a very similar idea already exists. "
                        "Please edit your idea."
                    ),
                    "matches": self.serialize_matches(matches),
                },
                status=status.HTTP_409_CONFLICT,
            )

        # 🟡 WARNING
        if self.WARNING_THRESHOLD <= best_score < self.BLOCK_THRESHOLD and not force_publish:
            return Response(
                {
                    "type": "WARNING",
                    "similarity": round(best_score, 3),
                    "message": (
                        "Similar ideas found. You can view similar ideas, edit/cancel, "
                        "or publish anyway."
                    ),
                    "matches": self.serialize_matches(matches),
                },
                status=status.HTTP_200_OK,
            )

        # 🟢 CREATE
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_idea = serializer.save(
            author=request.user,
            embedding=embedding,
        )

        # Create alerts when forced publish within warning zone
        if self.WARNING_THRESHOLD <= best_score < self.BLOCK_THRESHOLD:
            for m in matches:
                old_idea = m["idea"]
                if old_idea.author_id == request.user.id:
                    continue

                SimilarityAlert.objects.get_or_create(
                    idea=old_idea,          # ORIGINAL
                    similar_idea=new_idea,  # NEW
                    defaults={"similarity_score": round(m["score"], 3)},
                )

        return Response(self.get_serializer(new_idea).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        title = request.data.get("title", instance.title)
        short_desc = request.data.get("short_description", instance.short_description)
        full_desc = request.data.get("full_description", instance.full_description)

        embedding = get_embedding(self.build_text(title, short_desc, full_desc))

        matches = self.find_similar(embedding, exclude_id=instance.id)
        best_score = matches[0]["score"] if matches else 0.0

        if best_score >= self.BLOCK_THRESHOLD:
            return Response(
                {
                    "type": "BLOCK",
                    "similarity": round(best_score, 3),
                    "message": "Updated idea is too similar to an existing idea.",
                    "matches": self.serialize_matches(matches),
                },
                status=status.HTTP_409_CONFLICT,
            )

        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        idea = serializer.save(embedding=embedding)
        return Response(self.get_serializer(idea).data)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()

        title = request.data.get("title", instance.title)
        short_desc = request.data.get("short_description", instance.short_description)
        full_desc = request.data.get("full_description", instance.full_description)

        embedding = get_embedding(self.build_text(title, short_desc, full_desc))

        matches = self.find_similar(embedding, exclude_id=instance.id)
        best_score = matches[0]["score"] if matches else 0.0

        if best_score >= self.BLOCK_THRESHOLD:
            return Response(
                {
                    "type": "BLOCK",
                    "similarity": round(best_score, 3),
                    "message": "Updated idea is too similar to an existing idea.",
                    "matches": self.serialize_matches(matches),
                },
                status=status.HTTP_409_CONFLICT,
            )

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        idea = serializer.save(embedding=embedding)
        return Response(self.get_serializer(idea).data)


# ==================================================
# SIMILARITY ALERTS (ViewSet)
# ==================================================
class SimilarityAlertViewSet(ModelViewSet):
    serializer_class = SimilarityAlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            SimilarityAlert.objects.filter(
                idea__author=self.request.user,
                is_dismissed=False,
            )
            .select_related("idea__author", "similar_idea__author")
            .order_by("-created_at")
        )

    def get_object(self):
        obj = super().get_object()
        if obj.idea.author_id != self.request.user.id:
            raise PermissionDenied("Not your alert")
        return obj

    @action(detail=True, methods=["post"])
    def report(self, request, pk=None):
        alert = self.get_object()
        alert.is_reported = True
        alert.save(update_fields=["is_reported"])
        return Response({"ok": True})

    @action(detail=True, methods=["post"])
    def dismiss(self, request, pk=None):
        alert = self.get_object()
        alert.is_dismissed = True
        alert.save(update_fields=["is_dismissed"])
        return Response({"ok": True})


# =================================================
# INVESTMENT ENDPOINTS (function-based)
# =================================================

@csrf_exempt
def get_projects(request):
    try:
        projects_qs = InvestmentProject.objects.select_related("category", "farmer").all()

        category = request.GET.get("category", "")
        if category and category != "All Categories":
            projects_qs = projects_qs.filter(category__name=category)

        location = request.GET.get("location", "")
        if location and location != "All Locations":
            projects_qs = projects_qs.filter(location=location)

        min_roi = request.GET.get("minROI", "0")
        max_roi = request.GET.get("maxROI", "50")
        try:
            projects_qs = projects_qs.filter(expected_roi__gte=decimal.Decimal(min_roi))
            projects_qs = projects_qs.filter(expected_roi__lte=decimal.Decimal(max_roi))
        except Exception:
            pass

        risk_level = request.GET.get("riskLevel", "")
        if risk_level:
            projects_qs = projects_qs.filter(risk_level=risk_level)

        investment_type = request.GET.get("investmentType", "")
        if investment_type and investment_type != "all":
            projects_qs = projects_qs.filter(investment_type=investment_type)

        search = request.GET.get("search", "")
        if search:
            projects_qs = projects_qs.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(farmer__first_name__icontains=search)
                | Q(farmer__last_name__icontains=search)
            )

        status_q = request.GET.get("status", "")
        if status_q:
            projects_qs = projects_qs.filter(status=status_q)

        sort_by = request.GET.get("sortBy", "roi_desc")
        if sort_by == "roi_desc":
            projects_qs = projects_qs.order_by("-expected_roi")
        elif sort_by == "roi_asc":
            projects_qs = projects_qs.order_by("expected_roi")
        elif sort_by == "date_newest":
            projects_qs = projects_qs.order_by("-created_at")
        elif sort_by == "date_oldest":
            projects_qs = projects_qs.order_by("created_at")
        elif sort_by == "popularity":
            projects_qs = projects_qs.order_by("-investors_count")

        projects_list = list(projects_qs)
        if sort_by == "funding_needed":
            projects_list.sort(key=lambda p: float(p.funding_needed()), reverse=True)

        projects_data = []
        for project in projects_list:
            projects_data.append(
                {
                    "id": project.id,
                    "title": project.title,
                    "description": project.description,
                    "category": project.category.name if project.category else "",
                    "location": project.location,
                    "farmer": project.farmer.id,
                    "farmer_name": f"{project.farmer.first_name} {project.farmer.last_name}".strip(),
                    "roi": float(project.expected_roi),
                    "duration": project.duration_months,
                    "target_amount": float(project.target_amount),
                    "current_amount": float(project.current_amount),
                    "investment_type": project.investment_type,
                    "risk_level": project.risk_level,
                    "status": project.status,
                    "tags": project.get_tags_list(),
                    "created_at": project.created_at.strftime("%Y-%m-%d"),
                    "investors_count": project.investors_count,
                    "days_left": project.days_left,
                    "progress_percentage": float(project.progress_percentage()),
                    "funding_needed": float(project.funding_needed()),
                }
            )

        return JsonResponse({"success": True, "projects": projects_data, "total": len(projects_data)})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
def get_project_detail(request, project_id):
    try:
        project = InvestmentProject.objects.select_related("category", "farmer").get(id=project_id)

        return JsonResponse(
            {
                "success": True,
                "project": {
                    "id": project.id,
                    "title": project.title,
                    "description": project.description,
                    "category": project.category.name if project.category else "",
                    "location": project.location,
                    "farmer_name": f"{project.farmer.first_name} {project.farmer.last_name}".strip(),
                    "roi": float(project.expected_roi),
                    "duration": project.duration_months,
                    "target_amount": float(project.target_amount),
                    "current_amount": float(project.current_amount),
                    "investment_type": project.investment_type,
                    "risk_level": project.risk_level,
                    "status": project.status,
                    "tags": project.get_tags_list(),
                    "created_at": project.created_at.strftime("%Y-%m-%d"),
                    "investors_count": project.investors_count,
                    "days_left": project.days_left,
                    "progress_percentage": float(project.progress_percentage()),
                    "funding_needed": float(project.funding_needed()),
                },
            }
        )

    except InvestmentProject.DoesNotExist:
        return JsonResponse({"success": False, "error": "Project not found"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)

@csrf_exempt
def create_investment(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        user = check_auth(request)
        if not user:
            return JsonResponse({"error": "Authentication required"}, status=401)

        data = json.loads(request.body or "{}")
        project_id = data.get("project_id")
        amount = data.get("amount")
        payment_method = data.get("payment_method", "payhere")

        if not project_id or amount is None:
            return JsonResponse({"error": "Project ID and amount are required"}, status=400)

        project = InvestmentProject.objects.get(id=project_id)

        amount_decimal = decimal.Decimal(str(amount))
        if amount_decimal < decimal.Decimal("100"):
            return JsonResponse({"error": "Minimum investment amount is RS.100"}, status=400)

        if project.status != "active":
            return JsonResponse({"error": "Project is not accepting investments"}, status=400)

        funding_needed = project.funding_needed()
        if amount_decimal > funding_needed:
            return JsonResponse({"error": f"Maximum investment is RS.{funding_needed:.2f}"}, status=400)

        txid = "INV-" + timezone.now().strftime("%Y%m%d-%H%M%S") + "-" + "".join(
            random.choices(string.ascii_uppercase + string.digits, k=6)
        )

        inv = Investment.objects.create(
            investor=user,
            project=project,
            amount=amount_decimal,
            payment_method=payment_method,
            transaction_id=txid,
            status="completed",  # adjust if you have payment gateway callback later
            payment_status="completed",
            completed_at=timezone.now(),
        )

        return JsonResponse(
            {
                "success": True,
                "investment": {
                    "id": inv.id,
                    "transaction_id": inv.transaction_id,
                    "amount": float(inv.amount),
                    "project_id": project.id,
                },
            },
            status=201,
        )

    except InvestmentProject.DoesNotExist:
        return JsonResponse({"success": False, "error": "Project not found"}, status=404)
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_investments(request):
    qs = (
        Investment.objects.filter(investor=request.user)
        .select_related("project")
        .order_by("-created_at")
    )

    data = []
    for inv in qs:
        data.append(
            {
                "id": inv.id,
                "amount": float(inv.amount),
                "status": inv.status,
                "payment_method": inv.payment_method,
                "transaction_id": inv.transaction_id,
                "created_at": inv.created_at.isoformat(),
                "project": {
                    "id": inv.project.id,
                    "title": inv.project.title,
                    "status": inv.project.status,
                },
            }
        )
    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_categories(request):
    qs = InvestmentCategory.objects.all().order_by("name")
    return Response([{"id": c.id, "name": c.name, "description": c.description} for c in qs])

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_locations(request):
    # Minimal: derive locations from projects (no separate Location model needed)
    qs = InvestmentProject.objects.all()

    values = []
    for field in ["location", "district", "city", "area"]:
        try:
            values = list(qs.values_list(field, flat=True))
            break
        except Exception:
            continue

    cleaned = sorted({v.strip() for v in values if isinstance(v, str) and v.strip()})
    return Response(cleaned)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_platform_stats(request):
    total_projects = InvestmentProject.objects.count()
    active_projects = InvestmentProject.objects.filter(status="active").count()

    total_investments = Investment.objects.count()
    total_invested_amount = Investment.objects.filter(status="completed").aggregate(
        total=Sum("amount")
    )["total"] or decimal.Decimal("0")

    total_users = User.objects.count()

    return Response(
        {
            "total_projects": total_projects,
            "active_projects": active_projects,
            "total_investments": total_investments,
            "total_invested_amount": float(total_invested_amount),
            "total_users": total_users,
        }
    )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_demo_projects(request):
    """
    Creates a few demo projects if none exist.
    Safe to run multiple times.
    """
    if InvestmentProject.objects.exists():
        return Response({"detail": "Projects already exist"}, status=200)

    # pick an admin/staff or fallback to first user
    farmer = User.objects.filter(is_staff=True).first() or User.objects.first()
    if not farmer:
        return Response({"detail": "No users found to assign as farmer"}, status=400)

    cat, _ = InvestmentCategory.objects.get_or_create(
        name="Default",
        defaults={"description": "Default category"},
    )

    demo = [
        {
            "title": "Coconut Farm Expansion",
            "description": "Expand coconut farm capacity with irrigation and seedlings.",
            "expected_roi": 12.5,
            "risk_level": "medium",
            "investment_type": "equity",
            "location": "Colombo",
            "target_amount": decimal.Decimal("250000"),
            "days_left": 45,
        },
        {
            "title": "Coir Processing Upgrade",
            "description": "Upgrade machinery for higher output and efficiency.",
            "expected_roi": 15.0,
            "risk_level": "high",
            "investment_type": "loan",
            "location": "Gampaha",
            "target_amount": decimal.Decimal("400000"),
            "days_left": 60,
        },
    ]

    for d in demo:
        InvestmentProject.objects.create(
            category=cat,
            farmer=farmer,
            current_amount=decimal.Decimal("0"),
            duration_months=12,
            status="active",
            investors_count=0,
            tags="demo,coconut",
            **d,
        )

    return Response({"detail": "Demo projects created"}, status=201)


# =================================================
# ADMIN: IDEA MODERATION (SAFE ADDITION)
# =================================================
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_all_ideas(request):
    """
    Admin can see ALL ideas
    """
    ideas = Idea.objects.select_related("author").order_by("-created_at")
    return Response(IdeaSerializer(ideas, many=True).data)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_reported_ideas(request):
    """
    Admin can see ONLY reported ideas
    (reported = is_reported=True and not dismissed)
    """
    alerts = (
        SimilarityAlert.objects
        .filter(is_reported=True, is_dismissed=False)
        .select_related("similar_idea", "similar_idea__author", "idea")
        .order_by("-created_at")
    )

    data = []
    for alert in alerts:
        reported = alert.similar_idea  # 🔴 the reported idea

        data.append({
            "idea_id": reported.id,
            "title": reported.title,
            "short_description": reported.short_description,
            "full_description": reported.full_description,
            "author_name": reported.author.get_full_name() or reported.author.username,
            "author_email": reported.author.email,
            "similarity": alert.similarity_score,
            "created_at": alert.created_at,
            "original_idea_title": alert.idea.title,
        })

    return Response(data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_keep_idea(request, idea_id):
    """
    Admin keeps idea (dismiss report)
    """
    SimilarityAlert.objects.filter(
        similar_idea_id=idea_id,
        is_reported=True
    ).update(is_dismissed=True)

    return Response({"message": "Idea kept (report dismissed)"})


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def admin_delete_idea(request, idea_id):
    """
    Admin deletes idea completely
    """
    idea = Idea.objects.get(id=idea_id)
    idea.delete()

    SimilarityAlert.objects.filter(
        Q(similar_idea_id=idea_id) | Q(idea_id=idea_id)
    ).delete()

    return Response({"message": "Idea removed"})

# --------------------------------------
# Admin AuthLog
# --------------------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_auth_logs(request):
    qs = AuthLog.objects.select_related("user").all().order_by("-created_at")

    user_id = (request.GET.get("user_id") or "").strip()
    action_q = (request.GET.get("action") or "").strip().upper()
    status_q = (request.GET.get("status") or "").strip().upper()
    q = (request.GET.get("q") or "").strip()
    date_from = (request.GET.get("from") or "").strip()
    date_to = (request.GET.get("to") or "").strip()

    if user_id.isdigit():
        qs = qs.filter(user_id=int(user_id))

    if action_q in ["LOGIN", "LOGOUT"]:
        qs = qs.filter(action=action_q)

    if status_q in ["SUCCESS", "FAILED"]:
        qs = qs.filter(status=status_q)

    if date_from:
        qs = qs.filter(created_at__date__gte=date_from)

    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)

    if q:
        qs = qs.filter(
            Q(message__icontains=q)
            | Q(user__username__icontains=q)
            | Q(user__email__icontains=q)
        )

    try:
        limit = int(request.GET.get("limit", 100))
    except Exception:
        limit = 100
    limit = max(1, min(limit, 500))

    logs = qs[:limit]
    return Response(
        {
            "count": qs.count(),
            "limit": limit,
            "results": AuthLogSerializer(logs, many=True).data,
        }
    )

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_auth_logs(request):
    """
    Admin-only: list auth logs with optional filters.

    Query params:
      - user_id=#
      - action=LOGIN|LOGOUT
      - status=SUCCESS|FAILED
      - q=search by username/email/message
      - from=YYYY-MM-DD (created_at date)
      - to=YYYY-MM-DD (created_at date)
      - limit=100 (default 100, max 500)
    """
    qs = AuthLog.objects.select_related("user").all().order_by("-created_at")

    user_id = (request.GET.get("user_id") or "").strip()
    action_q = (request.GET.get("action") or "").strip().upper()
    status_q = (request.GET.get("status") or "").strip().upper()
    q = (request.GET.get("q") or "").strip()
    date_from = (request.GET.get("from") or "").strip()
    date_to = (request.GET.get("to") or "").strip()

    if user_id.isdigit():
        qs = qs.filter(user_id=int(user_id))

    if action_q in ["LOGIN", "LOGOUT"]:
        qs = qs.filter(action=action_q)

    if status_q in ["SUCCESS", "FAILED"]:
        qs = qs.filter(status=status_q)

    if date_from:
        # filters by date portion of created_at
        qs = qs.filter(created_at__date__gte=date_from)

    if date_to:
        qs = qs.filter(created_at__date__lte=date_to)

    if q:
        qs = qs.filter(
            Q(message__icontains=q)
            | Q(user__username__icontains=q)
            | Q(user__email__icontains=q)
        )

    # simple limit (avoid returning huge lists)
    try:
        limit = int(request.GET.get("limit", 100))
    except Exception:
        limit = 100
    limit = max(1, min(limit, 500))

    logs = qs[:limit]
    return Response(
        {
            "count": qs.count(),
            "limit": limit,
            "results": AuthLogSerializer(logs, many=True).data,
        }
    )

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_auth_logs_stats(request):
    """
    Admin-only: basic stats summary.
    Optional query param:
      - days=7  (default 7)
    """
    try:
        days = int(request.GET.get("days", 7))
    except Exception:
        days = 7
    days = max(1, min(days, 365))

    start = timezone.now() - timezone.timedelta(days=days)

    qs = AuthLog.objects.filter(created_at__gte=start)

    data = {
        "days": days,
        "total": qs.count(),
        "login_success": qs.filter(action="LOGIN", status="SUCCESS").count(),
        "login_failed": qs.filter(action="LOGIN", status="FAILED").count(),
        "logout_success": qs.filter(action="LOGOUT", status="SUCCESS").count(),
    }
    return Response(data)


