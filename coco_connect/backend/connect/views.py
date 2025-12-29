from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import News

@api_view(['GET'])
def news_list(request):
    news = News.objects.all().order_by('-date')

    data = []
    for n in news:
        data.append({
            "id": n.id,
            "title": n.title,
            "shortDescription": n.short_description,
            "fullDescription": n.full_description,
            "date": n.date,
            "image": n.image,
        })

    return Response(data)
