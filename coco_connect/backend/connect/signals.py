# connect/jwt_views.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # ✅ No profile table link in your DB, so derive role from is_staff
        data["role"] = "Admin" if user.is_staff else "User"
        data["name"] = user.first_name
        data["email"] = user.email
        data["id"] = user.id

        return data
