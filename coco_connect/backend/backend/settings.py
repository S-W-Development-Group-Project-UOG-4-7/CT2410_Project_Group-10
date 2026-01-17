"""
Django settings for backend project.
"""

from pathlib import Path
from datetime import timedelta

# -------------------------------------------------
# BASE DIR
# -------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent


# -------------------------------------------------
# SECURITY
# -------------------------------------------------
# ✅ Keep these ONLY ONCE (you had duplicates later in the file)
SECRET_KEY = "django-insecure-at&fdji3%7$q!^d&ja!bu8@#afa^wg$bp82m(_h+l#kn4n-4**"
DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]

# ❌ WRONG (duplicate settings) — this overwrote your correct values above
# SECRET_KEY = 'django-insecure-at&fdji3%7$q!^d&ja!bu8@#afa^wg$bp82m(_h+l#kn4n-4**'
# DEBUG = True
# ALLOWED_HOSTS = []   # ❌ would override and block localhost


# -------------------------------------------------
# APPLICATIONS
# -------------------------------------------------
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party (✅ correct place)
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt",
    "django_filters",  # ✅ if you use filtering

    # Local apps (✅ correct place)
    "connect.apps.ConnectConfig",
    "blockchain_records",
]

# ❌ WRONG (you had apps inside MIDDLEWARE) — apps must be in INSTALLED_APPS, not middleware:
# 'rest_framework', 'corsheaders', 'django_filters', 'blockchain_records', 'connect.apps.ConnectConfig', 'rest_framework_simplejwt'


# -------------------------------------------------
# MIDDLEWARE
# -------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # ✅ should be near the top
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",

    # ❌ WRONG (you put apps here). Middleware should ONLY contain middleware classes:
    # 'rest_framework',
    # 'corsheaders',
    # 'django_filters',
    # "blockchain_records",
    # 'connect.apps.ConnectConfig',
    # 'rest_framework_simplejwt',
]


# -------------------------------------------------
# URL / WSGI
# -------------------------------------------------
ROOT_URLCONF = "backend.urls"

WSGI_APPLICATION = "backend.wsgi.application"

# ❌ WRONG (duplicate line)
# WSGI_APPLICATION = 'backend.wsgi.application'


# -------------------------------------------------
# TEMPLATES
# -------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
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

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# -------------------------------------------------
# CORS (React ↔ Django)
# -------------------------------------------------
CORS_ALLOW_ALL_ORIGINS = True          # ✅ DEV ONLY
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]


# -------------------------------------------------
# DRF + JWT
# -------------------------------------------------
REST_FRAMEWORK = {
    # ✅ JWT auth
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        # If you also want session login support (admin / browser):
        # "rest_framework.authentication.SessionAuthentication",
    ),

    # ✅ pick ONE default permission policy
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),

    # If you want EVERYTHING public (not recommended), use this instead:
    # "DEFAULT_PERMISSION_CLASSES": (
    #     "rest_framework.permissions.AllowAny",
    # ),
}

# ❌ WRONG (your REST_FRAMEWORK block had duplicates + broken brackets)
# REST_FRAMEWORK = {
#     ...
#     "DEFAULT_PERMISSION_CLASSES": (
#         "rest_framework.permissions.IsAuthenticatedOrReadOnly",
#     "DEFAULT_PERMISSION_CLASSES": (
#         "rest_framework.permissions.AllowAny",
#     ),
# }


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# -------------------------------------------------
# DEFAULT PRIMARY KEY
# -------------------------------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
