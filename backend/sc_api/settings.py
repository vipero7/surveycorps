from datetime import timedelta
from pathlib import Path

from decouple import config

# Build paths inside the project like this: BASE_DIR / 'subdir'.
PROJECT_DIR = Path(__file__).resolve().parent
BASE_DIR = PROJECT_DIR.parent
RESOURCES_DIR = PROJECT_DIR / "resources"


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config("ALLOWED_HOSTS", cast=lambda v: [s.strip() for s in v.split(",")])
ENV = config("ENV", default="local")

# Application definition

DJANGO_CORE_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = ["rest_framework", "rest_framework_simplejwt", "corsheaders"]
SC_APPS = ["sc_api.apps.schema", "sc_api.apps.authentication"]

INSTALLED_APPS = DJANGO_CORE_APPS + THIRD_PARTY_APPS + SC_APPS

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "sc_api.apps.authentication.base.CustomAuthentication",
        # "rest_framework.authentication.BasicAuthentication",
        # 'rest_framework.authentication.TokenAuthentication',
        "rest_framework.authentication.SessionAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticatedOrReadOnly",),
}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "sc_api.urls"

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

WSGI_APPLICATION = "sc_api.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": config("django.db.backends.postgresql", default="django.db.backends.sqlite3"),
        "NAME": config("DATABASE_NAME", default=BASE_DIR / "db.sqlite3"),
        "USER": config("DATABASE_USER", default="user"),
        "PASSWORD": config("DATABASE_USER_PASSWORD", default="password"),
        "HOST": config("DATABASE_HOST", default="localhost"),
        "PORT": config("DATABASE_PORT", default=5432),
    }
}

AUTH_USER_MODEL = "schema.User"


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIAFILES_DIRS = [
    PROJECT_DIR / "media",
]
MEDIA_ROOT = BASE_DIR / "mediafiles"

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Logging
# https://docs.djangoproject.com/en/4.0/topics/logging/
FORMATTERS = {
    "verbose": {
        "format": "{name} {levelname} [{asctime}] {process}/{thread} {filename} {funcName} {lineno}: {message}",
        "style": "{",
    },
    "simple": {
        "format": "{name} {levelname} [{asctime}] {filename} {funcName} {lineno}: {message}",
        "style": "{",
    },
}

FILTERS = {
    "require_debug_true": {
        "()": "django.utils.log.RequireDebugTrue",
    },
    "require_debug_false": {
        "()": "django.utils.log.RequireDebugFalse",
    },
}

HANDLERS = {"console": {"level": "DEBUG", "class": "logging.StreamHandler", "formatter": "verbose"}}

if ENV == "local":
    log_path = BASE_DIR / "logs"
    log_path.mkdir(parents=True, exist_ok=True)
    HANDLERS["file"] = {
        "level": "DEBUG",
        "class": "logging.handlers.TimedRotatingFileHandler",
        "filename": log_path / "app.log",
        "when": "midnight",
        "formatter": "verbose",
    }

LOGGERS = {
    app: {"handlers": HANDLERS.keys(), "level": "DEBUG", "propagate": False} for app in SC_APPS
}

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": FORMATTERS,
    "filters": FILTERS,
    "handlers": HANDLERS,
    "loggers": LOGGERS,
}

# CORS
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:3000",
    ]
CORS_ALLOW_CREDENTIALS = True


# Simple JWT
SIMPLE_JWT = {
    "USER_ID_FIELD": "oid",
    "USER_ID_CLAIM": "mpl",
    "AUTH_COOKIE": "access_token",  # Cookie name. Enables cookies if value is set.
    "REFRESH_COOKIE": "refresh_token",  # Refresh token name. Enables cookies if value is set.
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),  # Access token life time set to 15 minutes
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),  # Refresh token life time set to 1 day
    "INVITATION_TOKEN_LIFETIME": timedelta(days=10),
    "AUTH_COOKIE_DOMAIN": "surveycorps.com",  # A string like "example.com", or None for standard domain cookie.
    "AUTH_COOKIE_SECURE": True,  # Whether the auth cookies should be secure (https:// only).
    "AUTH_COOKIE_HTTP_ONLY": True,  # Http only cookie flag.It's not fetch by javascript.
    "AUTH_COOKIE_PATH": "/",  # The path of the auth cookie.
    "AUTH_COOKIE_SAMESITE": "Lax",  # Whether to set the flag restricting cookie leaks on cross-site requests.
    # This can be 'Lax', 'Strict', or None to disable the flag.
}
