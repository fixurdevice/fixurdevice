"""Settings package selector based on DJANGO_ENV or RENDER environment."""
import os

if os.environ.get("DJANGO_ENV") == "production" or os.environ.get("RENDER"):
    from .production import *
else:
    from .development import *
