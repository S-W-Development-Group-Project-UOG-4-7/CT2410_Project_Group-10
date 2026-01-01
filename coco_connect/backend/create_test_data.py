# create_test_data.py
import os
import sys
from decimal import Decimal

# Setup Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from connect.models import InvestmentCategory, InvestmentProject, Profile
from django.contrib.auth.models import User

print("=" * 60)
print("🚀 COCO CONNECT - TEST DATA CREATOR")
print("=" * 60)

# CREATE CATEGORIES
print("\n📊 STEP 1: Creating investment categories...")
categories = [
    'Coconut Farming',
    'Coconut Oil Production', 
    'Coir Products',
    'Coconut Shell Products',
    'Organic Fertilizer',
    'Research & Development'
]

for cat_name in categories:
    InvestmentCategory.objects.get_or_create(name=cat_name)
    print(f"   ✅ Created/Found: {cat_name}")

# CREATE OR GET TEST USERS
print("\n👥 STEP 2: Setting up test users...")

# Farmer User
farmer_user, farmer_created = User.objects.get_or_create(
    username='testfarmer',
    defaults={
        'email': 'farmer@test.com',
        'first_name': 'Ravi',
        'last_name': 'Perera'
    }
)

if farmer_created:
    farmer_user.set_password('test123')
    farmer_user.save()
    print("   ✅ Created Farmer: testfarmer / test123")
else:
    print("   ✅ Farmer already exists: testfarmer")

# Create or update farmer profile
profile, profile_created = Profile.objects.get_or_create(
    user=farmer_user,
    defaults={'role': 'farmer'}
)
if not profile_created:
    profile.role = 'farmer'
    profile.save()

# Investor User  
investor_user, investor_created = User.objects.get_or_create(
    username='testinvestor',
    defaults={
        'email': 'investor@test.com',
        'first_name': 'Kamal',
        'last_name': 'Fernando'
    }
)

if investor_created:
    investor_user.set_password('test123')
    investor_user.save()
    print("   ✅ Created Investor: testinvestor / test123")
else:
    print("   ✅ Investor already exists: testinvestor")

# Create or update investor profile
inv_profile, inv_profile_created = Profile.objects.get_or_create(
    user=investor_user,
    defaults={'role': 'investor'}
)
if not inv_profile_created:
    inv_profile.role = 'investor'
    inv_profile.save()

# GET CATEGORIES
print("\n🌴 STEP 3: Creating investment projects...")
coconut_farming = InvestmentCategory.objects.get(name='Coconut Farming')
coconut_oil = InvestmentCategory.objects.get(name='Coconut Oil Production')
coir_products = InvestmentCategory.objects.get(name='Coir Products')

# DELETE EXISTING PROJECTS FIRST (to avoid duplicates)
print("   Clearing existing projects...")
InvestmentProject.objects.all().delete()

# PROJECT 1: Organic Coconut Farm
project_data_1 = {
    'title': 'Organic Coconut Farm Expansion',
    'description': 'Expanding organic coconut farm with sustainable practices and modern irrigation in Kurunegala. This project focuses on organic certification and sustainable farming methods.',
    'category': coconut_farming,
    'location': 'Kurunegala',
    'farmer': farmer_user,
    'target_amount': Decimal('50000.00'),
    'current_amount': Decimal('32500.00'),
    'expected_roi': 18.5,
    'duration_months': 24,
    'investment_type': 'equity',
    'risk_level': 'medium',
    'status': 'active',
    'tags': 'Organic,Sustainable,Modern Irrigation',
    'days_left': 45,
    'investors_count': 24
}

project1 = InvestmentProject.objects.create(**project_data_1)
print(f"   ✅ Project 1: {project1.title}")

# PROJECT 2: Coconut Oil Production
project_data_2 = {
    'title': 'Cold-Press Coconut Oil Production',
    'description': 'Establishing cold-press coconut oil production facility with organic certification in Gampaha. Export quality oil for international markets.',
    'category': coconut_oil,
    'location': 'Gampaha',
    'farmer': farmer_user,
    'target_amount': Decimal('75000.00'),
    'current_amount': Decimal('75000.00'),
    'expected_roi': 22.0,
    'duration_months': 18,
    'investment_type': 'loan',
    'risk_level': 'low',
    'status': 'funded',
    'tags': 'Cold-Press,Organic Certified,Export Quality',
    'days_left': 0,
    'investors_count': 42
}

project2 = InvestmentProject.objects.create(**project_data_2)
print(f"   ✅ Project 2: {project2.title}")

# PROJECT 3: Coir Products
project_data_3 = {
    'title': 'Eco-Friendly Coir Products',
    'description': 'Developing innovative coir-based products with eco-friendly packaging for export markets. Sustainable manufacturing process.',
    'category': coir_products,
    'location': 'Puttalam',
    'farmer': farmer_user,
    'target_amount': Decimal('30000.00'),
    'current_amount': Decimal('12000.00'),
    'expected_roi': 25.5,
    'duration_months': 12,
    'investment_type': 'equity',
    'risk_level': 'high',
    'status': 'active',
    'tags': 'Eco-Friendly,Export Market,Innovation',
    'days_left': 60,
    'investors_count': 8
}

project3 = InvestmentProject.objects.create(**project_data_3)
print(f"   ✅ Project 3: {project3.title}")

# CREATE MORE PROJECTS FOR VARIETY
project_data_4 = {
    'title': 'Coconut Shell Activated Charcoal',
    'description': 'Producing activated charcoal from coconut shells for water purification and air filters.',
    'category': InvestmentCategory.objects.get(name='Coconut Shell Products'),
    'location': 'Matara',
    'farmer': farmer_user,
    'target_amount': Decimal('45000.00'),
    'current_amount': Decimal('18000.00'),
    'expected_roi': 20.0,
    'duration_months': 20,
    'investment_type': 'equity',
    'risk_level': 'medium',
    'status': 'active',
    'tags': 'Activated Charcoal,Water Purification,Health',
    'days_left': 30,
    'investors_count': 15
}

project4 = InvestmentProject.objects.create(**project_data_4)
print(f"   ✅ Project 4: {project4.title}")

# SUMMARY
print("\n" + "=" * 60)
print("📊 DATABASE SUMMARY")
print("=" * 60)
print(f"   👥 Total Users: {User.objects.count()}")
print(f"   📁 Total Categories: {InvestmentCategory.objects.count()}")
print(f"   🌴 Total Projects: {InvestmentProject.objects.count()}")
print(f"   🟢 Active Projects: {InvestmentProject.objects.filter(status='active').count()}")
print(f"   ✅ Funded Projects: {InvestmentProject.objects.filter(status='funded').count()}")

# Change this in create_test_data.py:
print("\n🔗 TEST YOUR API:")
print("   1. Projects: http://localhost:8000/api/projects/")  # ✅ Correct
print("   2. Stats: http://localhost:8000/api/stats/")        # ✅ Correct
print("   3. Categories: http://localhost:8000/api/categories/")  # ✅
print("   4. Locations: http://localhost:8000/api/locations/")   

print("\n👤 LOGIN CREDENTIALS:")
print("   👨‍🌾 Farmer: testfarmer / test123")
print("   👨‍💼 Investor: testinvestor / test123")

print("\n💡 TIPS:")
print("   1. Start server: python manage.py runserver")
print("   2. Test API in browser first")
print("   3. Then start React app")

print("=" * 60)