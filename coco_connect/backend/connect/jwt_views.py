from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        # add role from Profile
        user = self.user
        data["role"] = user.profile.role  # connect_profile role

        # optional: add name/email too if you want
        data["email"] = user.email
        data["name"] = user.first_name

        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
