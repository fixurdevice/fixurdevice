"""
Customer views for CRM operations.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django.conf import settings
from django.db.models import Count, Sum

from .models import Customer
from .serializers import CustomerSerializer
from apps.accounts.models import UserRole


class IsCRMAccess(permissions.BasePermission):
    """Allows authenticated staff or debug mode access."""
    def has_permission(self, request, view):
        if settings.DEBUG:
            return True
        return (
            request.user.is_authenticated
            and request.user.role in [UserRole.ADMIN, UserRole.CRM_EXECUTIVE, UserRole.MANAGER]
        )


class CustomerListView(generics.ListCreateAPIView):
    """List and create customers in SQLite database."""
    queryset = Customer.objects.all().order_by("-created_at")
    serializer_class = CustomerSerializer
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["full_name", "phone", "email", "area"]
    ordering_fields = ["created_at", "full_name"]

    def get_permissions(self):
        return [IsCRMAccess()]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data

        # Enrich each customer with repair device counts and total spent
        for item in data:
            c_id = item["id"]
            cust = Customer.objects.filter(id=c_id).first()
            if cust:
                repairs_count = cust.repair_orders.count()
                total_spent = cust.invoices.filter(status="paid").aggregate(
                    total=Sum("final_billed_amount")
                )["total"] or 0
                item["total_devices"] = repairs_count
                item["total_spent"] = float(total_spent)
            else:
                item["total_devices"] = 0
                item["total_spent"] = 0.0

        return Response(data)

    def create(self, request, *args, **kwargs):
        data = request.data
        full_name = data.get("name") or data.get("full_name") or "New Customer"
        phone = data.get("phone", "")
        email = data.get("email", "")
        area = data.get("area", "Bangalore")
        notes = data.get("notes", "")

        customer = None
        if phone:
            customer = Customer.objects.filter(phone=phone, full_name__iexact=full_name).first()
        if not customer:
            customer = Customer.objects.create(
                phone=phone,
                full_name=full_name,
                email=email,
                area=area,
                internal_notes=notes,
            )
        else:
            if email and not customer.email:
                customer.email = email
            if area and not customer.area:
                customer.area = area
            customer.save()

        return Response(CustomerSerializer(customer).data, status=status.HTTP_201_CREATED)


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a customer."""
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    def get_permissions(self):
        return [IsCRMAccess()]


@api_view(["POST", "DELETE"])
@permission_classes([permissions.AllowAny])
def clear_all_customers(request):
    """Delete all customers from SQLite database."""
    count = Customer.objects.count()
    Customer.objects.all().delete()
    return Response({"message": f"Successfully deleted {count} customers from SQLite database.", "cleared": count})
