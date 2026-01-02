# connect/jwt_views.py

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # ✅ Your DB has no Profile.user/role, so derive role from User flags
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "name": user.first_name,
            "role": "Admin" if user.is_staff else "User",
        }

        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = "Admin" if user.is_staff else "User"
        token["name"] = user.first_name
        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
