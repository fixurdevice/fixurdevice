"""
FixUrDevice URL configuration.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

def health_check(request):
    """Ultra-lightweight endpoint for uptime pingers, Render health check, and keep-awake crons."""
    return JsonResponse({"status": "healthy", "service": "fixurdevice-backend"})

def root_view(request):
    """Root endpoint for Render health checkers and API discovery."""
    return JsonResponse({
        "status": "healthy",
        "service": "FixUrDevice Backend API",
        "version": "1.0.0",
        "docs": "/api/docs/",
        "health": "/healthz/",
    })

urlpatterns = [
    # Root & Health check endpoints (used by Render health check and keep-awake crons)
    path("", root_view, name="root"),
    path("healthz/", health_check, name="health_check"),
    path("api/health/", health_check, name="api_health_check"),

    # Django Admin (for super-admin only)
    path("django-admin/", admin.site.urls),

    # API v1
    path("api/v1/", include([
        path("auth/", include("apps.accounts.urls")),
        path("customers/", include("apps.customers.urls")),
        path("leads/", include("apps.leads.urls")),
        path("pickups/", include("apps.pickups.urls")),
        path("repairs/", include("apps.repairs.urls")),
        path("quotations/", include("apps.quotations.urls")),
        path("parts/", include("apps.parts.urls")),
        path("payments/", include("apps.payments.urls")),
        path("feedback/", include("apps.feedback.urls")),
        path("services/", include("apps.services.urls")),
        path("notifications/", include("apps.notifications.urls")),
        path("audit/", include("apps.audit.urls")),
    ])),

    # Public API (no auth — limited safe endpoints)
    path("api/public/", include([
        path("enquiry/", include("apps.leads.public_urls")),
        path("services/", include("apps.services.public_urls")),
        path("track/", include("apps.repairs.track_urls")),
    ])),

    # OpenAPI schema
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
