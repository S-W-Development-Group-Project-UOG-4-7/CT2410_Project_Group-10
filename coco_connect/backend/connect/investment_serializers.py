# connect/investment_serializers.py
from rest_framework import serializers
from .models import InvestmentProject, Investment, InvestmentCategory
from django.contrib.auth.models import User
import decimal

class InvestmentProjectCreateSerializer(serializers.ModelSerializer):
    roi = serializers.DecimalField(max_digits=5, decimal_places=2, write_only=True)
    duration = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = InvestmentProject
        fields = [
            'title', 'description', 'category', 'location',
            'farmer_name', 'farmer_experience', 'farmer_rating',
            'roi', 'duration', 'target_amount', 'investment_type',
            'risk_level', 'tags', 'total_units', 'image',
            'business_plan', 'additional_docs'
        ]
        extra_kwargs = {
            'image': {'required': False},
            'business_plan': {'required': False},
            'additional_docs': {'required': False},
            'tags': {'required': False},
        }
    
    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        
        # Convert category name to object if needed
        category = validated_data.get('category')
        if isinstance(category, str):
            category_obj, created = InvestmentCategory.objects.get_or_create(
                name=category,
                defaults={'description': category}
            )
            validated_data['category'] = category_obj
        
        # Map frontend fields to model fields
        validated_data['farmer'] = user
        validated_data['expected_roi'] = validated_data.pop('roi', 15.0)
        validated_data['duration_months'] = validated_data.pop('duration', 12)
        
        # Set default values if not provided
        if not validated_data.get('farmer_name'):
            validated_data['farmer_name'] = f"{user.first_name} {user.last_name}".strip() or user.username
        
        if not validated_data.get('farmer_rating'):
            validated_data['farmer_rating'] = 4.5
        
        # Set status to pending for admin approval
        validated_data['status'] = 'pending'
        
        # Calculate unit price for equity projects
        if validated_data.get('investment_type') == 'equity' and validated_data.get('total_units'):
            total_units = int(validated_data['total_units'])
            if total_units > 0:
                validated_data['unit_price'] = validated_data['target_amount'] / total_units
                validated_data['available_units'] = total_units
                validated_data['investment_structure'] = 'units'
        
        return super().create(validated_data)

class InvestmentProjectListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    farmer_name_display = serializers.SerializerMethodField()
    farmer_experience_display = serializers.SerializerMethodField()
    farmer_rating_display = serializers.SerializerMethodField()
    tags_list = serializers.SerializerMethodField()
    roi = serializers.DecimalField(source='expected_roi', max_digits=5, decimal_places=2)
    duration = serializers.IntegerField(source='duration_months')
    progress_percentage = serializers.SerializerMethodField()
    funding_needed = serializers.SerializerMethodField()
    
    class Meta:
        model = InvestmentProject
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'location', 'farmer_name', 'farmer_experience', 'farmer_rating',
            'farmer_name_display', 'farmer_experience_display', 'farmer_rating_display',
            'roi', 'duration', 'target_amount', 'current_amount', 'investors_count',
            'status', 'days_left', 'investment_type', 'risk_level', 'created_at',
            'tags', 'tags_list', 'total_units', 'available_units', 'unit_price',
            'investment_structure', 'progress_percentage', 'funding_needed'
        ]
    
    def get_farmer_name_display(self, obj):
        if obj.farmer_name:
            return obj.farmer_name
        return f"{obj.farmer.first_name} {obj.farmer.last_name}".strip() or obj.farmer.username
    
    def get_farmer_experience_display(self, obj):
        return obj.farmer_experience or 0
    
    def get_farmer_rating_display(self, obj):
        return float(obj.farmer_rating) if obj.farmer_rating else 4.5
    
    def get_tags_list(self, obj):
        if obj.tags:
            return [tag.strip() for tag in obj.tags.split(',') if tag.strip()]
        return []
    
    def get_progress_percentage(self, obj):
        if obj.target_amount > 0:
            return float((obj.current_amount / obj.target_amount) * 100)
        return 0
    
    def get_funding_needed(self, obj):
        return float(obj.target_amount - obj.current_amount)

class InvestmentCreateSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(write_only=True)
    units = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = Investment
        fields = [
            'project_id', 'amount', 'units', 'payment_method',
            'investment_type', 'investment_structure'
        ]
    
    def validate(self, data):
        project_id = data.get('project_id')
        units = data.get('units')
        amount = data.get('amount')
        
        try:
            project = InvestmentProject.objects.get(id=project_id)
        except InvestmentProject.DoesNotExist:
            raise serializers.ValidationError("Project not found")
        
        if project.status != 'active':
            raise serializers.ValidationError("Project is not accepting investments")
        
        # Handle share-based investment
        if units is not None and project.investment_structure == 'units':
            if units <= 0:
                raise serializers.ValidationError("Number of units must be greater than 0")
            
            if units > project.available_units:
                raise serializers.ValidationError(f"Only {project.available_units} shares available")
            
            calculated_amount = units * project.unit_price
            data['amount'] = calculated_amount
            data['units'] = units
            data['unit_price'] = project.unit_price
            data['total_units'] = project.total_units
            data['investment_type'] = 'unit_purchase'
            data['investment_structure'] = 'units'
            data['ownership_percentage'] = (units / project.total_units) * 100 if project.total_units > 0 else 0
            
        else:  # Fixed amount investment
            if amount is None or amount < 100:
                raise serializers.ValidationError("Minimum investment amount is RS. 100")
            
            funding_needed = project.target_amount - project.current_amount
            if amount > funding_needed:
                raise serializers.ValidationError(f"Maximum investment is RS. {funding_needed:.2f}")
            
            data['investment_type'] = 'fixed_amount'
            data['investment_structure'] = 'fixed'
        
        return data
    
    def create(self, validated_data):
        request = self.context['request']
        user = request.user
        project_id = validated_data.pop('project_id')
        
        project = InvestmentProject.objects.get(id=project_id)
        
        # Generate transaction ID
        import random
        import string
        from django.utils import timezone
        
        txid = "INV-" + timezone.now().strftime("%Y%m%d-%H%M%S") + "-" + "".join(
            random.choices(string.ascii_uppercase + string.digits, k=6)
        )
        
        investment = Investment.objects.create(
            investor=user,
            project=project,
            transaction_id=txid,
            status='completed',  # Change to 'pending' if using payment gateway
            payment_status='completed',
            **validated_data
        )
        
        return investment

class MyInvestmentSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)
    project_location = serializers.CharField(source='project.location', read_only=True)
    project_status = serializers.CharField(source='project.status', read_only=True)
    
    class Meta:
        model = Investment
        fields = [
            'id', 'project', 'project_title', 'project_location', 'project_status',
            'amount', 'units', 'unit_price', 'total_units', 'investment_type',
            'investment_structure', 'ownership_percentage', 'status', 
            'payment_method', 'payment_status', 'transaction_id', 
            'created_at', 'completed_at'
        ]