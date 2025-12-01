from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def hello_coco(request):
    return Response({"message": "Hello from Coco Connect Django backend!"})
