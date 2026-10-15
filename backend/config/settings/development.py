"""Development settings."""
from .base import *

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Use SQLite for fast local dev (override with PostgreSQL via env)
if not os.environ.get("DB_NAME"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Email backend configuration:
# Defaults to console backend in development so testing is smooth.
# If EMAIL_HOST_PASSWORD is provided, automatically uses real SMTP (Gmail).
EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    "django.core.mail.backends.smtp.EmailBackend"
    if os.environ.get("EMAIL_HOST_PASSWORD")
    else "django.core.mail.backends.console.EmailBackend",
)


CORS_ALLOW_ALL_ORIGINS = True

# Disable throttling in development
REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = []

# Django debug toolbar (optional)
INTERNAL_IPS = ["127.0.0.1"]
