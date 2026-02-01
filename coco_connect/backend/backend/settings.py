"""
Django settings for backend project.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv(".env.local")

# -------------------------------------------------
# BASE DIR
# -------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent


# -------------------------------------------------
# SECURITY
# -------------------------------------------------
SECRET_KEY = "django-insecure-at&fdji3%7$q!^d&ja!bu8@#afa^wg$bp82m(_h+l#kn4n-4**"
DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
]

# -------------------------------------------------
# STATIC & MEDIA FILES
# -------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# -------------------------------------------------
# APPLICATIONS
# -------------------------------------------------
INSTALLED_APPS = [
    # Django core
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",

    # Local apps
    "connect",
    "products",

    "blockchain_records"
]


# -------------------------------------------------
# MIDDLEWARE
# -------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must be first
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# -------------------------------------------------
# URL / WSGI
# -------------------------------------------------
ROOT_URLCONF = "backend.urls"
WSGI_APPLICATION = "backend.wsgi.application"


# -------------------------------------------------
# TEMPLATES
# -------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# -------------------------------------------------
# DATABASE (PostgreSQL)
# -------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "coco_db",
        "USER": "admin",
        "PASSWORD": "admin123",
        "HOST": "localhost",
        "PORT": "5432",
    }
}


# -------------------------------------------------
# PASSWORD VALIDATION
# -------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# -------------------------------------------------
# INTERNATIONALIZATION
# -------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# -------------------------------------------------
# STATIC & MEDIA FILES
# -------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# -------------------------------------------------
# CORS (React ↔ Django)
# -------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True  # DEV ONLY
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


# -------------------------------------------------
# DRF + JWT
# -------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
    ),
    "DEFAULT_PARSER_CLASSES": (
        "rest_framework.parsers.JSONParser",
        "rest_framework.parsers.FormParser",
        "rest_framework.parsers.MultiPartParser",
    ),

    "DATE_INPUT_FORMATS": ["%Y-%m-%d", "%m/%d/%Y"],
    "DATE_FORMAT": "%Y-%m-%d",
}


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# -------------------------------------------------
# DEFAULT PRIMARY KEY
# -------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# -------------------------------------------------
# PAYHERE (ENV)
# -------------------------------------------------
PAYHERE_MERCHANT_ID = os.getenv("PAYHERE_MERCHANT_ID", "")
PAYHERE_MERCHANT_SECRET = os.getenv("PAYHERE_MERCHANT_SECRET", "")
PAYHERE_CURRENCY = os.getenv("PAYHERE_CURRENCY", "LKR")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_PUBLIC_URL = os.getenv("BACKEND_PUBLIC_URL", "http://localhost:8000")
