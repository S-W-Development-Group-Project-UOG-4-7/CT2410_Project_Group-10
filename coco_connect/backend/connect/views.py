# connect/views.py - FIXED VERSION
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.db.models import Q  # For database queries

# IMPORT YOUR MODELS - THIS WAS MISSING!
from connect.models import InvestmentProject, InvestmentCategory, Investment, Profile

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
                "role": user.profile.role
            }
        }, status=200)

    return JsonResponse({"error": "Invalid request"}, status=405)

# ADD THESE VIEW FUNCTIONS AFTER YOUR EXISTING login function

@csrf_exempt
def investment_projects(request):
    if request.method == "GET":
        # Get filter parameters
        category = request.GET.get('category', '')
        location = request.GET.get('location', '')
        min_roi = request.GET.get('minROI', 0)
        max_roi = request.GET.get('maxROI', 50)
        risk_level = request.GET.get('riskLevel', '')
        investment_type = request.GET.get('investmentType', '')
        search = request.GET.get('search', '')
        
        # Start with all projects
        projects = InvestmentProject.objects.filter(status='active')
        
        # Apply filters
        if category and category != 'All Categories':
            projects = projects.filter(category__name=category)
        
        if location and location != 'All Locations':
            projects = projects.filter(location=location)
        
        if min_roi:
            projects = projects.filter(expected_roi__gte=float(min_roi))
        
        if max_roi:
            projects = projects.filter(expected_roi__lte=float(max_roi))
        
        if risk_level:
            projects = projects.filter(risk_level=risk_level)
        
        if investment_type and investment_type != 'all':
            projects = projects.filter(investment_type=investment_type)
        
        if search:
            projects = projects.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(farmer__first_name__icontains=search) |
                Q(farmer__last_name__icontains(search))
            )
        
        # Prepare response data
        projects_data = []
        for project in projects:
            projects_data.append({
                'id': project.id,
                'title': project.title,
                'description': project.description,
                'category': project.category.name if project.category else 'Coconut Farming',
                'location': project.location,
                'farmerName': f"{project.farmer.first_name} {project.farmer.last_name}",
                'farmerExperience': 5,  # Default value
                'farmerRating': 4.5,    # Default value
                'roi': float(project.expected_roi),
                'duration': project.duration_months,
                'targetAmount': float(project.target_amount),
                'currentAmount': float(project.current_amount),
                'investorsCount': project.investors_count,
                'status': project.status,
                'daysLeft': project.days_left,
                'investmentType': project.investment_type,
                'riskLevel': project.risk_level,
                'tags': project.tag_list,
                'createdAt': project.created_at.isoformat(),
                'fundingPercentage': round(project.funding_percentage, 1),
                'fundingNeeded': float(project.funding_needed),
            })
        
        return JsonResponse({'projects': projects_data})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def make_investment(request):
    if request.method == "POST":
        data = json.loads(request.body)
        
        project_id = data.get('project_id')
        amount = float(data.get('amount', 0))
        payment_method = data.get('payment_method', 'payhere')
        
        if not project_id or not amount:
            return JsonResponse({'error': 'Project ID and amount required'}, status=400)
        
        try:
            project = InvestmentProject.objects.filter(id=project_id).first()
            if not project:
                return JsonResponse({'error': 'Project not found'}, status=404)

            # Check minimum investment
            if amount < 100:
                return JsonResponse({'error': 'Minimum investment is $100'}, status=400)
            
            # Check if amount exceeds funding needed
            if amount > project.funding_needed:
                return JsonResponse({'error': f'Maximum investment allowed is ${project.funding_needed}'}, status=400)
            
            # Create investment (in real app, get user from session/token)
            # For demo, we'll create with a default user
            from django.contrib.auth.models import User
            user = User.objects.first()  # Get first user for demo
            
            investment = Investment.objects.create(
                investor=user,
                project=project,
                amount=amount,
                payment_method=payment_method,
                status='confirmed'
            )
            
            # Update project
            project.current_amount += amount
            project.investors_count += 1
            
            if project.current_amount >= project.target_amount:
                project.status = 'funded'
            
            project.save()
            
            return JsonResponse({
                'success': True,
                'message': f'Successfully invested ${amount} in "{project.title}"',
                'transaction_id': investment.transaction_id,
                'new_funding_percentage': round(project.funding_percentage, 1)
            })
        
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def investment_stats(request):
    if request.method == "GET":
        from django.db.models import Sum, Avg
        
        stats = {
            'total_projects': InvestmentProject.objects.count(),
            'total_investment': float(InvestmentProject.objects.aggregate(
                total=Sum('current_amount')
            )['total'] or 0),
            'average_roi': InvestmentProject.objects.aggregate(
                avg=Avg('expected_roi')
            )['avg'] or 0,
            'active_projects': InvestmentProject.objects.filter(status='active').count(),
            'fully_funded': InvestmentProject.objects.filter(status='funded').count(),
        }
        
        return JsonResponse(stats)
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def investment_categories(request):
    if request.method == "GET":
        categories = InvestmentCategory.objects.all()
        categories_data = [{'id': cat.id, 'name': cat.name} for cat in categories]
        return JsonResponse({'categories': categories_data})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def project_locations(request):
    if request.method == "GET":
        locations = InvestmentProject.objects.values_list('location', flat=True).distinct()
        return JsonResponse({'locations': list(locations)})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)