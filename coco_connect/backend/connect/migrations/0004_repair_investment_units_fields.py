from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("connect", "0003_repair_units_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="investment",
            name="units",
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="investment",
            name="unit_price",
            field=models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True),
        ),
        migrations.AddField(
            model_name="investment",
            name="total_units",
            field=models.IntegerField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name="investment",
            name="investment_type",
            field=models.CharField(max_length=20, default="fixed_amount"),
        ),
        migrations.AddField(
            model_name="investment",
            name="investment_structure",
            field=models.CharField(max_length=20, default="fixed"),
        ),
        migrations.AddField(
            model_name="investment",
            name="ownership_percentage",
            field=models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True),
        ),
    ]
