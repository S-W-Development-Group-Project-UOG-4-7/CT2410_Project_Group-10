from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .models import InvestmentChainRecord
from .blockchain_service import record_investment_on_chain

@csrf_exempt
def record_investment(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    data = json.loads(request.body)
    investment_id = data.get("investment_id")
    amount = data.get("amount")

    if not investment_id or not amount:
        return JsonResponse({"error": "investment_id and amount required"}, status=400)

    try:
        tx_hash = record_investment_on_chain(investment_id, amount)

        InvestmentChainRecord.objects.update_or_create(
            investment_id=investment_id,
            defaults={"tx_hash": tx_hash},
        )

        return JsonResponse({
            "status": "success",
            "investment_id": investment_id,
            "tx_hash": tx_hash
        })

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
