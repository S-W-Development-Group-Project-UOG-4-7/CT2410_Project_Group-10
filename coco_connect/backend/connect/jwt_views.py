# connect/jwt_views.py

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from connect.models import Profile
from .models import AuthLog


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Adds custom claims + user object in token response.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Ensure profile exists + role is set
        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={"role": "Admin" if user.is_staff else "User"},
        )

        role = profile.role or ("Admin" if user.is_staff else "User")

        # Custom claims
        token["user_id"] = user.id
        token["username"] = user.username
        token["email"] = user.email
        token["role"] = role
        token["name"] = user.first_name or user.username
        token["is_staff"] = user.is_staff

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user  # set by TokenObtainPairSerializer internally

        profile, _ = Profile.objects.get_or_create(
            user=user,
            defaults={"role": "Admin" if user.is_staff else "User"},
        )

        role = profile.role or ("Admin" if user.is_staff else "User")

        # include user info in response
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "name": user.first_name or user.username,
            "role": role,
            "is_staff": user.is_staff,
        }

        return data


class MyTokenObtainPairView(TokenObtainPairView):
    """
    Accepts BOTH:
      { "email": "...", "password": "..." }
      { "username": "...", "password": "..." }

    Always logs to AuthLog.
    """

    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        email = (request.data.get("email") or "").strip().lower()
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password")

        # Normalize login id
        login_id = email or username

        user_obj = None
        if login_id:
            user_obj = (
                User.objects.filter(username=login_id).first()
                or User.objects.filter(email=login_id).first()
            )

        # Validate payload
        if not login_id or not password:
            AuthLog.objects.create(
                user=user_obj,
                action=AuthLog.Action.LOGIN,
                status=AuthLog.Status.FAILED,
                message=f"JWT login payload invalid (missing username/email/password) for login_id={login_id}",
            )
            return Response(
                {"detail": "username/email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Authenticate (so we can log failures cleanly)
        user_auth = authenticate(username=login_id, password=password)
        if not user_auth:
            AuthLog.objects.create(
                user=user_obj,
                action=AuthLog.Action.LOGIN,
                status=AuthLog.Status.FAILED,
                message=f"JWT login failed for login_id={login_id}",
            )
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Ensure request payload is what SimpleJWT expects
        mutable = getattr(request.data, "_mutable", None)
        try:
            if mutable is not None:
                request.data._mutable = True
            request.data["username"] = login_id
        finally:
            if mutable is not None:
                request.data._mutable = mutable

        # Call SimpleJWT
        resp = super().post(request, *args, **kwargs)

        # Log success
        AuthLog.objects.create(
            user=user_auth,
            action=AuthLog.Action.LOGIN,
            status=AuthLog.Status.SUCCESS,
            message="JWT login success",
        )

        return resp
