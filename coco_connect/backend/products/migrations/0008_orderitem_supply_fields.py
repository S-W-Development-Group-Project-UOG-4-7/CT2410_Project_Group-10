from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0007_merge_20260130_1548"),
    ]

    operations = [
        migrations.AddField(
            model_name="orderitem",
            name="supplied",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="orderitem",
            name="supplied_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
