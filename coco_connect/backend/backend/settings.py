"""
Django settings for backend project.
"""

from pathlib import Path
from datetime import timedelta

# -------------------------------------------------
# BASE DIR
# -------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

<<<<<<< HEAD

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
=======
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370

# -------------------------------------------------
# SECURITY
# -------------------------------------------------
SECRET_KEY = "django-insecure-at&fdji3%7$q!^d&ja!bu8@#afa^wg$bp82m(_h+l#kn4n-4**"
DEBUG = True

<<<<<<< HEAD
ALLOWED_HOSTS = []


# Application definition

=======
ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]


# -------------------------------------------------
# APPLICATIONS
# -------------------------------------------------
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",
    "rest_framework_simplejwt",
    "django_filters",

<<<<<<< HEAD
    # your app
    'connect',

    'rest_framework_simplejwt',

=======
    # Local apps
    "connect.apps.ConnectConfig",
    "blockchain_records",
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370
]


# -------------------------------------------------
# MIDDLEWARE
# -------------------------------------------------
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
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

<<<<<<< HEAD
WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
=======
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370

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

<<<<<<< HEAD



# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators
=======
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370

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
CORS_ALLOW_ALL_ORIGINS = True  # DEV ONLY
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True

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
        # Optional: for Django admin / browsable API sessions
        "rest_framework.authentication.SessionAuthentication",
    ),
<<<<<<< HEAD
=======
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),

    # ✅ from admin-dashboard branch (safe to keep)
    "DATE_INPUT_FORMATS": ["%Y-%m-%d", "%m/%d/%Y"],
    "DATE_FORMAT": "%Y-%m-%d",
>>>>>>> 45b3043379462f7f9d97cc4240df94bff04de370
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
