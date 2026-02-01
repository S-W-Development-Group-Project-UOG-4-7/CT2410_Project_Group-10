# connect/views.py
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Q, Sum
from django.utils import timezone
from django.db import transaction

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
from rest_framework.decorators import api_view, permission_classes, action, parser_classes
from rest_framework.response import Response
from rest_framework import status, parsers
from rest_framework.exceptions import PermissionDenied

from rest_framework_simplejwt.tokens import AccessToken

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

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
    UserSerializer,
)
from .investment_serializers import (
    InvestmentProjectCreateSerializer,
    InvestmentProjectListSerializer,
    InvestmentCreateSerializer,
    MyInvestmentSerializer,
)
from .permissions import IsOwner

from .services.embeddings import get_embedding
from .services.similarity import cosine_similarity


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

        # Optional: if you REALLY want username update (NOT recommended if you login with email)
        # username = (request.data.get("username") or "").strip()
        # if username and username != user.username:
        #     if User.objects.filter(username=username).exclude(id=user.id).exists():
        #         return Response({"error": "Username already taken"}, status=400)
        #     user.username = username

        if first_name != "":
            user.first_name = first_name
        # last name can be empty intentionally
        user.last_name = last_name

        user.save()

    full_name = f"{user.first_name} {user.last_name}".strip()

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name or "",
            "last_name": user.last_name or "",
            "full_name": full_name,
            "role": getattr(profile, "role", "buyer"),
            "name": full_name or user.username,  # keep old frontend compatibility
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
# NEW INVESTMENT ENDPOINTS
# =================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([parsers.MultiPartParser, parsers.FormParser])
def create_project(request):
    """
    Create new investment project
    """
    try:
        data = request.data.copy()
        
        # Check if user has farmer profile
        #profile = getattr(request.user, 'profile', None)
        #if profile and profile.role != 'farmer':
        #    return Response({
        #        'success': False,
        #        'error': 'Only farmers can create projects'
        #   }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = InvestmentProjectCreateSerializer(data=data, context={'request': request})
        
        if serializer.is_valid():
            project = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Project created successfully and sent for admin approval',
                'project': InvestmentProjectListSerializer(project).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def make_investment(request):
    """
    Make an investment (supports both fixed amount and share-based)
    """
    try:
        user = request.user
        
        # Check if user has investor profile
        profile = getattr(user, 'profile', None)
        if profile and profile.role != 'investor':
            return Response({
                'success': False,
                'error': 'Only investors can make investments'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = InvestmentCreateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            investment = serializer.save()
            
            return Response({
                'success': True,
                'message': 'Investment successful!',
                'investment': MyInvestmentSerializer(investment).data,
                'ownership_percentage': investment.ownership_percentage
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_investments(request):
    """
    Get current user's investments with full project details
    """
    try:
        investments = Investment.objects.filter(
            investor=request.user
        ).select_related('project').order_by('-created_at')
        
        serializer = MyInvestmentSerializer(investments, many=True)
        
        # Calculate total invested
        total_invested = investments.aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'success': True,
            'investments': serializer.data,
            'total_invested': float(total_invested),
            'count': investments.count()
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def get_projects_api(request):
    """
    Get projects with advanced filtering
    """
    try:
        queryset = InvestmentProject.objects.select_related('category', 'farmer')
        
        # Filter by status (default: active)
        status_param = request.GET.get('status', 'active')
        queryset = queryset.filter(status=status_param)
        
        # ... (rest of your filtering code remains the same) ...
        
        # Handle funding_needed sorting
        if sort_by == 'funding_needed':
            projects_list = list(queryset)
            projects_list.sort(key=lambda p: float(p.target_amount - p.current_amount), reverse=True)
        else:
            projects_list = list(queryset)
        
        # ROBUST FIX: Add missing fields with proper error handling
        for project in projects_list:
            try:
                # Check if total_units exists as a database field
                if not hasattr(project, 'total_units') or project.total_units is None:
                    project.total_units = 1000
                if not hasattr(project, 'available_units') or project.available_units is None:
                    project.available_units = 1000
                if not hasattr(project, 'unit_price') or project.unit_price is None:
                    project.unit_price = project.target_amount / 1000 if project.target_amount > 0 else 0
                if not hasattr(project, 'investment_structure') or project.investment_structure is None:
                    project.investment_structure = 'fixed'
                if not hasattr(project, 'farmer_name') or project.farmer_name is None:
                    project.farmer_name = f"{project.farmer.first_name} {project.farmer.last_name}".strip()
                if not hasattr(project, 'farmer_experience') or project.farmer_experience is None:
                    project.farmer_experience = 0
                if not hasattr(project, 'farmer_rating') or project.farmer_rating is None:
                    project.farmer_rating = 4.5
            except Exception as e:
                print(f"Error setting defaults for project {project.id}: {e}")
                # Set defaults anyway
                project.total_units = 1000
                project.available_units = 1000
                project.unit_price = project.target_amount / 1000 if hasattr(project, 'target_amount') and project.target_amount > 0 else 0
                project.investment_structure = 'fixed'
        
        serializer = InvestmentProjectListSerializer(projects_list, many=True)
        
        # Get unique categories and locations for filters
        categories = InvestmentCategory.objects.values_list('name', flat=True).distinct()
        locations = InvestmentProject.objects.values_list('location', flat=True).distinct()
        
        return Response({
            'success': True,
            'projects': serializer.data,
            'total': len(projects_list),
            'categories': list(categories),
            'locations': list(locations)
        })
        
    except Exception as e:
        print(f"Error in get_projects_api: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# =================================================
# EXISTING INVESTMENT ENDPOINTS (keep for backward compatibility)
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