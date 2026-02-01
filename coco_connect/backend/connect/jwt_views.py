# connect/jwt_views.py
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import AuthLog
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class MyTokenObtainPairView(TokenObtainPairView):
    """
    Accepts BOTH:
      { "email": "...", "password": "..." }
      { "username": "...", "password": "..." }

    Always logs to AuthLog.
    """

    serializer_class = TokenObtainPairSerializer  # ✅ use default serializer

    def post(self, request, *args, **kwargs):
        email = (request.data.get("email") or "").strip().lower()
        username = (request.data.get("username") or "").strip()
        password = request.data.get("password")

        # Normalize: if email provided, use it as username (your users have username=email)
        login_id = email or username

        user_obj = None
        if login_id:
            user_obj = (
                User.objects.filter(username=login_id).first()
                or User.objects.filter(email=login_id).first()
            )

        # Basic payload check
        if not login_id or not password:
            AuthLog.objects.create(
                user=user_obj,
                action=AuthLog.Action.LOGIN,
                status=AuthLog.Status.FAILED,
                message=f"JWT login payload invalid (missing username/email/password) for login_id={login_id}",
            )
            return Response({"detail": "username/email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate first (so we can log FAIL cleanly)
        user_auth = authenticate(username=login_id, password=password)
        if not user_auth:
            AuthLog.objects.create(
                user=user_obj,
                action=AuthLog.Action.LOGIN,
                status=AuthLog.Status.FAILED,
                message=f"JWT login failed for login_id={login_id}",
            )
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Now call SimpleJWT with correct payload structure
        request.data["username"] = login_id

        resp = super().post(request, *args, **kwargs)

        AuthLog.objects.create(
            user=user_auth,
            action=AuthLog.Action.LOGIN,
            status=AuthLog.Status.SUCCESS,
            message="JWT login success",
        )

        return resp
