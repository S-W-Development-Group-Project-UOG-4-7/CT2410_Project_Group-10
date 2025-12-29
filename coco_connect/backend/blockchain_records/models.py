from django.db import models

class InvestmentChainRecord(models.Model):
    investment_id = models.IntegerField(unique=True)
    tx_hash = models.CharField(max_length=66)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Investment {self.investment_id} -> {self.tx_hash}"
