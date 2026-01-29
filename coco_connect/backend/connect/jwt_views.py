from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from connect.models import Profile


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # Get user's profile role if exists
        try:
            profile = Profile.objects.get(user=user)
            role = profile.role
        except Profile.DoesNotExist:
            # Default role based on user flags
            role = "Admin" if user.is_staff else "User"
            # Create profile if doesn't exist
            Profile.objects.create(user=user, role=role)

        # Add user data to response
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "name": user.first_name or user.username,
            "role": role,
            "is_staff": user.is_staff,
        }

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Get user's role
        try:
            profile = Profile.objects.get(user=user)
            role = profile.role
        except Profile.DoesNotExist:
            role = "Admin" if user.is_staff else "User"
        
        # Add custom claims to token
        token["user_id"] = user.id
        token["username"] = user.username
        token["email"] = user.email
        token["role"] = role
        token["name"] = user.first_name or user.username
        token["is_staff"] = user.is_staff
        
        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer