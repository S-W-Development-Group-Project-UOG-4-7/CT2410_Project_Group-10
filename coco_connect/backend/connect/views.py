# connect/views.py
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Q, Sum
import json
import decimal
from django.utils import timezone
import random, string

from rest_framework_simplejwt.tokens import AccessToken

from .models import Profile, InvestmentCategory, InvestmentProject, Investment, Product


# ----------------------------
# AUTH HELPER (SESSION + JWT)
# ----------------------------
def check_auth(request):
    """
    Supports BOTH:
    1) Session auth (request.user.is_authenticated)
    2) JWT Bearer token in Authorization header
    """
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
            user_id = int(user_id)  # ✅ important
            return User.objects.get(id=user_id)
        except Exception as e:
            print("JWT AUTH ERROR:", str(e))
            return None

    return None


# ----------------------------
# REGISTER
# ----------------------------
@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        data = json.loads(request.body)
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

        Profile.objects.create(user=user, role=role)

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


# ----------------------------
# LOGIN (SESSION ONLY)
# ----------------------------
@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request"}, status=405)

    try:
        data = json.loads(request.body)

        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Email and password required"}, status=400)

        user = authenticate(username=email, password=password)
        if user is None:
            return JsonResponse({"error": "Invalid credentials"}, status=401)

        profile, _ = Profile.objects.get_or_create(user=user)

        # Optional session login
        from django.contrib.auth import login as auth_login
        auth_login(request, user)

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

        status = request.GET.get("status", "")
        if status:
            projects_qs = projects_qs.filter(status=status)

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
                    "farmer_experience": 0,
                    "farmer_rating": 4.5,
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


# ----------------------------
# PROJECT DETAIL
# ----------------------------
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


# ----------------------------
# CREATE INVESTMENT
# ----------------------------
@csrf_exempt
def create_investment(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        # DEBUG
        print("AUTH HEADER headers:", request.headers.get("Authorization"))
        print("AUTH HEADER META:", request.META.get("HTTP_AUTHORIZATION"))

        user = check_auth(request)
        if not user:
            return JsonResponse({"error": "Authentication required"}, status=401)

        data = json.loads(request.body or "{}")
        project_id = data.get("project_id")
        amount = data.get("amount")
        payment_method = data.get("payment_method", "payhere")

        if not project_id or amount is None:
            return JsonResponse({"error": "Project ID and amount are required"}, status=400)

        try:
            project = InvestmentProject.objects.get(id=project_id)
        except InvestmentProject.DoesNotExist:
            return JsonResponse({"error": "Project not found"}, status=404)

        try:
            amount_decimal = decimal.Decimal(str(amount))
            if amount_decimal < decimal.Decimal("100"):
                return JsonResponse({"error": "Minimum investment amount is RS.100"}, status=400)
        except Exception:
            return JsonResponse({"error": "Invalid amount"}, status=400)

        if project.status != "active":
            return JsonResponse({"error": "Project is not accepting investments"}, status=400)

        funding_needed = project.funding_needed()
        if amount_decimal > funding_needed:
            return JsonResponse(
                {"error": f"Maximum investment for this project is RS.{funding_needed:.2f}"},
                status=400,
            )

        

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

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ----------------------------
# CATEGORIES
# ----------------------------
@csrf_exempt
def get_categories(request):
    try:
        categories = InvestmentCategory.objects.all()
        categories_data = [{"id": cat.id, "name": cat.name} for cat in categories]
        return JsonResponse({"success": True, "categories": categories_data})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ----------------------------
# LOCATIONS
# ----------------------------
@csrf_exempt
def get_locations(request):
    try:
        locations = InvestmentProject.objects.values_list("location", flat=True).distinct()
        return JsonResponse({"success": True, "locations": list(locations)})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ----------------------------
# STATS
# ----------------------------
@csrf_exempt
def get_platform_stats(request):
    try:
        total_projects = InvestmentProject.objects.count()

        total_investment_result = Investment.objects.filter(status="completed").aggregate(total=Sum("amount"))
        total_investment = total_investment_result["total"] or decimal.Decimal("0")

        unique_investors = Investment.objects.filter(status="completed").values("investor").distinct().count()

        projects = InvestmentProject.objects.all()
        avg_roi = 0
        if projects.exists():
            total_roi = sum(float(p.expected_roi) for p in projects)
            avg_roi = total_roi / len(projects)

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


# ----------------------------
# DEMO PROJECTS
# ----------------------------
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
            Profile.objects.create(user=farmer, role="farmer")

        coconut_farming, _ = InvestmentCategory.objects.get_or_create(name="Coconut Farming")
        coconut_oil, _ = InvestmentCategory.objects.get_or_create(name="Coconut Oil Production")
        coir_products, _ = InvestmentCategory.objects.get_or_create(name="Coir Products")

        demo_projects = [
            {
                "title": "Organic Coconut Farm Expansion",
                "description": "Expanding organic coconut farm with sustainable practices and modern irrigation in Kurunegala.",
                "category": coconut_farming,
                "location": "Kurunegala",
                "farmer": farmer,
                "target_amount": 5000000,
                "current_amount": 3250000,
                "expected_roi": 18.5,
                "duration_months": 24,
                "investment_type": "equity",
                "risk_level": "medium",
                "status": "active",
                "tags": "Organic,Sustainable,Modern Irrigation",
                "days_left": 45,
                "investors_count": 24,
            }
        ]

        created_projects = []
        for pdata in demo_projects:
            project = InvestmentProject.objects.create(**pdata)
            created_projects.append({"id": project.id, "title": project.title, "status": project.status})

        return JsonResponse({"success": True, "message": f"Created {len(created_projects)} demo projects", "projects": created_projects})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ----------------------------
# TEST
# ----------------------------
@csrf_exempt
def hello_coco(request):
    return JsonResponse(
        {
            "message": "CocoConnect API is running",
            "endpoints": {
                "projects": "/api/projects/",
                "stats": "/api/stats/",
                "categories": "/api/categories/",
                "locations": "/api/locations/",
                "make_investment": "/api/make-investment/",
                "demo_projects": "/api/create-demo-projects/",
            },
        }
    )

from django.utils import timezone  # (only if you already use it elsewhere)
# add Sum import already exists

@csrf_exempt
def my_investments(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    user = check_auth(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)

    investments_qs = (
        Investment.objects
        .select_related("project")
        .filter(investor=user)
        .order_by("-created_at")
    )

    investments_data = []
    for inv in investments_qs:
        investments_data.append({
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
            }
        })

    return JsonResponse({"success": True, "investments": investments_data})
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
