from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("connect", "0002_idealegacy_alter_investmentcategory_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="investmentproject",
            name="total_units",
            field=models.IntegerField(default=1000),
        ),
        migrations.AddField(
            model_name="investmentproject",
            name="available_units",
            field=models.IntegerField(default=1000),
        ),
        migrations.AddField(
            model_name="investmentproject",
            name="unit_price",
            field=models.DecimalField(max_digits=15, decimal_places=2, default=0),
        ),
        migrations.AddField(
            model_name="investmentproject",
            name="investment_structure",
            field=models.CharField(
                max_length=20,
                choices=[("fixed", "Fixed Amount"), ("units", "Share/Unit Based")],
                default="fixed",
            ),
        ),
    ]
