
import os
import django
from rest_framework.exceptions import ValidationError

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from products.serializers import ProductCreateSerializer
from products.models import Category, ProductType

def test_serializer():
    # Ensure a category and type exist
    cat, _ = Category.objects.get_or_create(name="Test Category", slug="test-cat")
    pt, _ = ProductType.objects.get_or_create(name="Raw Materials")

    print(f"Category ID: {cat.id}, Slug: {cat.slug}")
    print(f"ProductType Name: {pt.name}")

    # Test 1: Using Slug (Expected)
    data_slug = {
        "name": "Test Product Slug",
        "description": "A description longer than 10 chars",
        "price": 10.00,
        "category": cat.slug,
        "type": pt.name,
        # Image is tricky to mock simply in script without file, but let's see if partial validation works 
        # or we just check the category field specifically
    }
    
    ser_slug = ProductCreateSerializer(data=data_slug)
    # We expect image error but NOT category error
    if not ser_slug.is_valid():
        print("Slug validation errors:", ser_slug.errors)
        if 'category' in ser_slug.errors:
            print("❌ Slug failed category validation")
        else:
            print("✅ Slug passed category validation")
    else:
        print("✅ Slug valid")

    # Test 2: Using ID (User instruction)
    data_id = {
        "name": "Test Product ID",
        "description": "A description longer than 10 chars",
        "price": 10.00,
        "category": cat.id, # Passing Integer ID
        "type": pt.name,
    }

    ser_id = ProductCreateSerializer(data=data_id)
    if not ser_id.is_valid():
         print("ID validation errors:", ser_id.errors)
         if 'category' in ser_id.errors:
             print("❌ ID failed category validation")
         else:
             print("✅ ID passed category validation (Unexpected)")
    else:
        print("✅ ID valid")

if __name__ == "__main__":
    test_serializer()
