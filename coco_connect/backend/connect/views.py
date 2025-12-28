from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Product


@api_view(['GET'])
def hello_coco(request):
    return Response({
        "message": "Hello from Coco Connect Django backend!"
    })


@api_view(['GET'])
def product_list(request):
    products = Product.objects.all()

    data = []
    for p in products:
        data.append({
            "id": p.id,
            "name": p.name,
            "price": float(p.price),
            "stock": p.stock,
            "description": p.description,
            "reviews": p.reviews,
            "category": p.category,
            "type": p.type,
        })

    return Response(data)
