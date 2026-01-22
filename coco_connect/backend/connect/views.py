# ============================
# DJANGO
# ============================
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Q, Sum
from django.utils import timezone
from django.db import transaction

# ============================
# PYTHON
# ============================
import json
import decimal
import random
import string

# ============================
# DRF
# ============================
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import PermissionDenied

# ============================
# JWT
# ============================
from rest_framework_simplejwt.tokens import AccessToken

# ============================
# LOCAL MODELS
# ============================
from .models import (
    Idea,
    Profile,
    InvestmentCategory,
    InvestmentProject,
    Investment,
    Product,
    SimilarityAlert,
)

# ============================
# LOCAL SERIALIZERS
# ============================
from .serializers import (
    IdeaSerializer,
    SimilarityAlertSerializer,
)

# ============================
# PERMISSIONS
# ============================
from .permissions import IsOwner

# ============================
# AI SIMILARITY SERVICES
# ============================
from .services.embeddings import get_embedding
from .services.similarity import cosine_similarity


# ==================================================
# BASIC TEST VIEW
# ==================================================
def hello_coco(request):
    return JsonResponse({"message": "Hello from Coco Connect"})




# ----------------------------
# AUTH HELPER (SESSION + JWT)
# ----------------------------
def check_auth(request):
    # 1) Session auth
    if getattr(request, "user", None) and request.user.is_authenticated:
        return request.user

    # 2) JWT auth
    auth_header = (
        request.headers.get("Authorization")
        or request.META.get("HTTP_AUTHORIZATION")
        or ""
    )

    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
        try:
            access = AccessToken(token)
            user_id = access.get("user_id")
            if not user_id:
                return None
            return User.objects.get(id=int(user_id))
        except Exception as e:
            print("JWT AUTH ERROR:", str(e))
            return None

    return None


# ------------------ Hello API ------------------
@csrf_exempt
def hello_coco(request):
    return JsonResponse({"message": "CocoConnect API is running"})


# ------------------ Register (FUNCTION) ------------------
@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body or "{}")

        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")
        role = (data.get("role") or "").strip()  # optional

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


# ------------------ Login (SESSION) ------------------
@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        data = json.loads(request.body or "{}")

        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)

        user = authenticate(username=email, password=password)
        if user is None:
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        profile, _ = Profile.objects.get_or_create(user=user)

        # session login
        from django.contrib.auth import login as auth_login
        auth_login(request, user)

        return JsonResponse(
            {
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.first_name,
                    "role": getattr(profile, "role", ""),
                },
            },
            status=200,
        )

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ============================
# 🔐 IDEAS API (AI Similarity)
# ============================
class IdeaViewSet(ModelViewSet):
    queryset = Idea.objects.all().order_by("-created_at")
    serializer_class = IdeaSerializer

    # thresholds
    BLOCK_THRESHOLD = 0.85
    WARNING_THRESHOLD = 0.65

    # ----------------------------
    # PERMISSIONS
    # ----------------------------
    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsOwner()]
        elif self.action == "create":
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]

    # ----------------------------
    # BUILD TEXT FOR EMBEDDING
    # ----------------------------
    def build_text(self, title, short_desc, full_desc):
        return f"{title}\n{short_desc}\n{full_desc}".strip()

    # ----------------------------
    # FIND SIMILAR IDEAS (top 5)
    # ----------------------------
    def find_similar(self, embedding, exclude_id=None):
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
        """Return frontend-friendly match objects"""
        return [
            {
                "id": m["idea"].id,
                "title": m["idea"].title,
                "author": m["idea"].author.get_full_name()
                or m["idea"].author.username,
                "score": round(m["score"], 3),  # 0.000 -> 1.000
            }
            for m in matches
        ]

    # ----------------------------
    # CREATE IDEA
    # ----------------------------
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        title = request.data.get("title", "") or ""
        short_desc = request.data.get("short_description", "") or ""
        full_desc = request.data.get("full_description", "") or ""

        # frontend sends "1" when user clicks Publish Anyway
        force_publish = str(request.data.get("force_publish", "")).lower() in [
            "1",
            "true",
            "yes",
        ]

        # build embedding
        embedding = get_embedding(self.build_text(title, short_desc, full_desc))

        # find top matches
        matches = self.find_similar(embedding)
        best_score = matches[0]["score"] if matches else 0.0

        # 🔴 BLOCK: >= 0.85 (NO publish)
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

        # 🟡 WARNING: 0.65 - 0.85 (publish ONLY if force_publish=1)
        if (
            self.WARNING_THRESHOLD <= best_score < self.BLOCK_THRESHOLD
            and not force_publish
        ):
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
                status=status.HTTP_200_OK,  # frontend uses this to open modal
            )

        # 🟢 PUBLISH: <0.65 OR force_publish in warning range
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_idea = serializer.save(
            author=request.user,
            embedding=embedding,
        )

        # ✅ If published in WARNING range (force publish), create alerts for original owners
        if self.WARNING_THRESHOLD <= best_score < self.BLOCK_THRESHOLD:
            for m in matches:
                old_idea = m["idea"]

                # don't alert if same author
                if old_idea.author_id == request.user.id:
                    continue

                SimilarityAlert.objects.get_or_create(
                    idea=old_idea,          # ORIGINAL idea (owner receives alert)
                    similar_idea=new_idea,  # NEW published idea
                    defaults={"similarity_score": round(m["score"], 3)},
                )

        return Response(
            self.get_serializer(new_idea).data,
            status=status.HTTP_201_CREATED,
        )

    # ----------------------------
    # UPDATE IDEA (hard block only)
    # ----------------------------
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

    # ----------------------------
    # PARTIAL UPDATE (hard block only)
    # ----------------------------
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


# ============================
# 🔔 SIMILARITY ALERTS API
# ============================
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




# ----------------------------
# GET PROJECTS
# ----------------------------
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

        investment = Investment.objects.create(
            investor=user,
            project=project,
            amount=amount_decimal,
            payment_method=payment_method,
            transaction_id=txid,
            status="completed",
            payment_status="completed",
            notes="",
            completed_at=timezone.now(),
        )

        return JsonResponse(
            {
                "success": True,
                "message": "Investment successful!",
                "investment": {
                    "id": investment.id,
                    "project_title": project.title,
                    "amount": float(investment.amount),
                    "status": investment.status,
                    "created_at": investment.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                },
            },
            status=201,
        )

    except InvestmentProject.DoesNotExist:
        return JsonResponse({"error": "Project not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def get_categories(request):
    try:
        categories = InvestmentCategory.objects.all()
        return JsonResponse({"success": True, "categories": [{"id": c.id, "name": c.name} for c in categories]})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def get_locations(request):
    try:
        locations = InvestmentProject.objects.values_list("location", flat=True).distinct()
        return JsonResponse({"success": True, "locations": list(locations)})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def get_platform_stats(request):
    try:
        total_projects = InvestmentProject.objects.count()
        total_investment = Investment.objects.filter(status="completed").aggregate(total=Sum("amount"))["total"] or 0
        unique_investors = Investment.objects.filter(status="completed").values("investor").distinct().count()

        avg_roi = 0
        projects = InvestmentProject.objects.all()
        if projects.exists():
            avg_roi = sum(float(p.expected_roi) for p in projects) / len(projects)

        return JsonResponse(
            {
                "success": True,
                "stats": {
                    "total_projects": total_projects,
                    "total_investment": float(total_investment),
                    "total_investors": unique_investors,
                    "average_roi": round(avg_roi, 1),
                    "active_projects": InvestmentProject.objects.filter(status="active").count(),
                    "funded_projects": InvestmentProject.objects.filter(status="funded").count(),
                },
            }
        )
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def create_demo_projects(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        farmer, created = User.objects.get_or_create(
            username="demo_farmer@coco.com",
            defaults={"email": "demo_farmer@coco.com", "first_name": "Ravi", "last_name": "Perera"},
        )
        if created:
            farmer.set_password("demo123")
            farmer.save()
            Profile.objects.get_or_create(user=farmer, defaults={"role": "farmer"})

        coconut_farming, _ = InvestmentCategory.objects.get_or_create(name="Coconut Farming")

        project = InvestmentProject.objects.create(
            title="Organic Coconut Farm Expansion",
            description="Expanding organic coconut farm with sustainable practices and modern irrigation in Kurunegala.",
            category=coconut_farming,
            location="Kurunegala",
            farmer=farmer,
            target_amount=5000000,
            current_amount=3250000,
            expected_roi=18.5,
            duration_months=24,
            investment_type="equity",
            risk_level="medium",
            status="active",
            tags="Organic,Sustainable,Modern Irrigation",
            days_left=45,
            investors_count=24,
        )

        return JsonResponse({"success": True, "message": "Created 1 demo project", "project_id": project.id})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def my_investments(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    user = check_auth(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)

    investments_qs = (
        Investment.objects.select_related("project")
        .filter(investor=user)
        .order_by("-created_at")
    )

    investments_data = []
    for inv in investments_qs:
        investments_data.append(
            {
                "id": inv.id,
                "amount": float(inv.amount),
                "status": inv.status,
                "payment_status": getattr(inv, "payment_status", ""),
                "transaction_id": inv.transaction_id,
                "created_at": inv.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "project": {
                    "id": inv.project.id,
                    "title": inv.project.title,
                    "location": inv.project.location,
                    "roi": float(inv.project.expected_roi),
                    "duration": inv.project.duration_months,
                },
            }
        )

    return JsonResponse({"success": True, "investments": investments_data})


# ----------------------------
# DRF endpoints used by dashboard
# ----------------------------
@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user

    if request.method == "PUT":
        username = request.data.get("username", "").strip()
        first_name = request.data.get("first_name", user.first_name).strip()
        last_name = request.data.get("last_name", user.last_name).strip()

        if username:
            if User.objects.exclude(id=user.id).filter(username=username).exists():
                return Response({"error": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
            user.username = username

        user.first_name = first_name
        user.last_name = last_name
        user.save()

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": "Admin" if user.is_staff else "User",
            "is_active": user.is_active,
        }
    )


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




# ============================
# 🔔 SIMILARITY ALERTS API
# ============================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_similarity_alerts(request):
    alerts = SimilarityAlert.objects.filter(
        owner=request.user
    ).order_by("-created_at")

    serializer = SimilarityAlertSerializer(alerts, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def report_similarity_alert(request, alert_id):
    try:
        alert = SimilarityAlert.objects.get(
            id=alert_id,
            owner=request.user
        )
    except SimilarityAlert.DoesNotExist:
        return Response(
            {"error": "Alert not found"},
            status=404
        )

    alert.is_reported = True
    alert.save()

    return Response({"success": True})