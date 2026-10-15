"""
Parts and Vendor views for CRM.
Allows viewing and creating product distributors/vendors and tracking spare parts.
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.conf import settings
from .models import Vendor, Part, PartUsage
from .serializers import VendorSerializer
from apps.accounts.models import UserRole


class IsCRMAccess(permissions.BasePermission):
    def has_permission(self, request, view):
        if settings.DEBUG:
            return True
        return (
            request.user.is_authenticated
            and request.user.role in [UserRole.ADMIN, UserRole.CRM_EXECUTIVE, UserRole.MANAGER]
        )


class VendorListCreateView(generics.ListCreateAPIView):
    """List all distributors/vendors or register a new vendor."""
    queryset = Vendor.objects.filter(is_active=True).order_by("name")
    serializer_class = VendorSerializer
    permission_classes = [IsCRMAccess]

    def create(self, request, *args, **kwargs):
        name = request.data.get("name", "").strip()
        if not name:
            return Response({"name": ["Vendor / Distributor name is required."]}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already exists
        existing = Vendor.objects.filter(name__iexact=name).first()
        if existing:
            return Response(VendorSerializer(existing).data, status=status.HTTP_200_OK)
        
        return super().create(request, *args, **kwargs)


class VendorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or soft-delete a distributor/vendor."""
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer
    permission_classes = [IsCRMAccess]
