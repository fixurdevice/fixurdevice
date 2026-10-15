"""Audit middleware — captures request metadata for audit events."""
from django.utils.deprecation import MiddlewareMixin


class AuditMiddleware(MiddlewareMixin):
    """Attaches request IP and user agent to the request for audit logging."""

    def process_request(self, request):
        request._audit_ip = self._get_ip(request)
        request._audit_ua = request.META.get("HTTP_USER_AGENT", "")[:500]

    @staticmethod
    def _get_ip(request):
        x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded:
            return x_forwarded.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "")
