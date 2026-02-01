# connect/investment_serializers.py
from rest_framework import serializers
from django.db import transaction
from .models import InvestmentProject, Investment


class InvestmentProjectCreateSerializer(serializers.ModelSerializer):
    """
    IMPORTANT:
    - Do NOT reference farmer_name / farmer_experience / farmer_rating here
      unless those fields exist on the InvestmentProject model.
    - We set farmer=request.user and let list serializer expose farmer info.
    """

    class Meta:
        model = InvestmentProject
        fields = [
            "title",
            "description",
            "category",
            "location",
            "target_amount",
            "expected_roi",
            "duration_months",
            "investment_type",
            "risk_level",
            "tags",
            "total_units",
            "unit_price",
            "investment_structure",
            "image",
            "business_plan",
            "additional_docs",
        ]
        read_only_fields = ["status", "current_amount", "investors_count", "days_left"]

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["farmer"] = request.user

        # Auto-calc unit price & structure for equity projects
        if validated_data.get("investment_type") == "equity" and validated_data.get("total_units"):
          target_amount = validated_data.get("target_amount") or 0
          total_units = validated_data.get("total_units") or 1000
          if total_units > 0:
              # if unit_price not sent, compute it
              if not validated_data.get("unit_price"):
                  validated_data["unit_price"] = target_amount / total_units
              validated_data["available_units"] = total_units
              validated_data["investment_structure"] = "units"

        return super().create(validated_data)


class InvestmentProjectListSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.name", read_only=True)
    roi = serializers.DecimalField(source="expected_roi", max_digits=5, decimal_places=2)
    duration = serializers.IntegerField(source="duration_months")
    farmer_name = serializers.SerializerMethodField()
    farmer_experience = serializers.SerializerMethodField()
    farmer_rating = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

    class Meta:
        model = InvestmentProject
        fields = [
            "id",
            "title",
            "description",
            "category",
            "location",
            "farmer_name",
            "farmer_experience",
            "farmer_rating",
            "roi",
            "duration",
            "target_amount",
            "current_amount",
            "investment_type",
            "risk_level",
            "status",
            "tags",
            "created_at",
            "investors_count",
            "days_left",
            "total_units",
            "available_units",
            "unit_price",
            "investment_structure",
        ]

    def get_farmer_name(self, obj):
        user = getattr(obj, "farmer", None)
        if not user:
            return "Farmer"
        full = f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip()
        return full or getattr(user, "username", "Farmer") or "Farmer"

    def get_farmer_experience(self, obj):
        # If you later add profile fields, read them here.
        # For now, safe default:
        return 0

    def get_farmer_rating(self, obj):
        # If you later add profile fields, read them here.
        # For now, safe default:
        return 4.5

    def get_tags(self, obj):
        if obj.tags:
            return [tag.strip() for tag in obj.tags.split(",") if tag.strip()]
        return []


class InvestmentCreateSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Investment
        fields = [
            "project_id",
            "amount",
            "units",
            "unit_price",
            "investment_type",
            "investment_structure",
            "payment_method",
            "notes",
        ]

    def validate(self, data):
        project_id = data.get("project_id")

        try:
            project = InvestmentProject.objects.get(id=project_id)
        except InvestmentProject.DoesNotExist:
            raise serializers.ValidationError({"project_id": "Project not found"})

        if project.status != "active":
            raise serializers.ValidationError({"project": "Project is not accepting investments"})

        amount = data.get("amount", 0)
        if amount < 100:
            raise serializers.ValidationError({"amount": "Minimum investment is RS.100"})

        funding_needed = project.target_amount - project.current_amount
        if amount > funding_needed:
            raise serializers.ValidationError({"amount": f"Maximum investment is RS.{funding_needed:.2f}"})

        # Unit-based investments
        if data.get("investment_type") == "unit_purchase":
            units = data.get("units", 0)
            if units < 1:
                raise serializers.ValidationError({"units": "Minimum 1 unit required"})

            if units > project.available_units:
                raise serializers.ValidationError({"units": f"Only {project.available_units} units available"})

            unit_price = project.unit_price or (project.target_amount / project.total_units)
            calculated_amount = units * unit_price

            data["amount"] = calculated_amount
            data["unit_price"] = unit_price
            data["total_units"] = project.total_units
            data["ownership_percentage"] = (units / project.total_units) * 100

        data["project"] = project
        return data

    def create(self, validated_data):
        request = self.context.get("request")
        project = validated_data.pop("project")
        validated_data.pop("project_id", None)

        with transaction.atomic():
            investment = Investment.objects.create(
                investor=request.user,
                project=project,
                **validated_data,
            )

            # Update project totals
            project.current_amount += investment.amount
            project.investors_count += 1

            if investment.investment_type == "unit_purchase" and investment.units:
                project.available_units -= investment.units

            if project.current_amount >= project.target_amount:
                project.status = "funded"
                project.days_left = 0

            project.save()
            return investment


class MyInvestmentSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)
    project_location = serializers.CharField(source="project.location", read_only=True)
    project_roi = serializers.DecimalField(
        source="project.expected_roi", max_digits=5, decimal_places=2, read_only=True
    )

    class Meta:
        model = Investment
        fields = [
            "id",
            "project",
            "project_title",
            "project_location",
            "project_roi",
            "amount",
            "units",
            "unit_price",
            "total_units",
            "ownership_percentage",
            "investment_type",
            "investment_structure",
            "payment_method",
            "transaction_id",
            "status",
            "payment_status",
            "created_at",
            "completed_at",
            "notes",
        ]
