"""
Repair order views for CRM workshop, technician assignment, and booking management.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
from django.utils import timezone
from decimal import Decimal

from .models import RepairOrder, RepairStatus, RepairPriority
from .serializers import RepairOrderSerializer
from apps.customers.models import Customer
from apps.leads.models import Lead, LeadStatus
from apps.accounts.models import User, UserRole


class IsCRMAccess(permissions.BasePermission):
    def has_permission(self, request, view):
        if settings.DEBUG:
            return True
        return (
            request.user.is_authenticated
            and request.user.role in [UserRole.ADMIN, UserRole.CRM_EXECUTIVE, UserRole.MANAGER]
        )


class RepairOrderListView(generics.ListCreateAPIView):
    serializer_class = RepairOrderSerializer
    permission_classes = [IsCRMAccess]

    def get_queryset(self):
        qs = RepairOrder.objects.select_related(
            "customer", "assigned_technician", "lead"
        ).prefetch_related("invoice").filter(is_archived=False)

        # Filters
        status_param = self.request.query_params.get("status")
        if status_param and status_param != "all":
            qs = qs.filter(status=status_param)

        tech_param = self.request.query_params.get("technician")
        if tech_param:
            qs = qs.filter(assigned_technician_id=tech_param)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                models.Q(order_number__icontains=search)
                | models.Q(customer__full_name__icontains=search)
                | models.Q(customer__phone__icontains=search)
                | models.Q(device_model_text__icontains=search)
            )

        return qs.order_by("-created_at")

    def create(self, request, *args, **kwargs):
        data = request.data
        cust_name = data.get("customer_name") or data.get("customer", "Customer")
        cust_phone = data.get("customer_phone") or data.get("phone", "9845012345")
        cust_email = data.get("customer_email") or data.get("email", "")
        device_text = data.get("device_model_text") or data.get("device", "Device")
        issue_text = data.get("issue") or data.get("service") or data.get("reported_problem", "Repair Issue")
        confirmed_issue = data.get("confirmed_issue") or data.get("diagnosis", "")
        work_performed = data.get("work_performed", "")
        parts_used = data.get("parts_used") or data.get("parts_used_notes") or data.get("partChanged", "")

        part_name = data.get("part_name") or data.get("parts_used") or parts_used or ""
        vendor_name = data.get("vendor_name") or data.get("vendor", "")
        vendor_cost = Decimal(str(data.get("vendor_cost") or data.get("product_price") or data.get("partCost") or data.get("part_cost", 0)))
        
        cust_total_input = data.get("total_customer_charge") or data.get("total_price") or data.get("customer_price")
        if cust_total_input is not None and str(cust_total_input).strip() != "":
            total_charged = Decimal(str(cust_total_input))
            part_cost = total_charged
            service_charge = Decimal("0.00")
            internal_profit = max(Decimal("0.00"), total_charged - vendor_cost)
        else:
            part_cost = Decimal(str(data.get("product_price") or data.get("partCost") or data.get("part_cost", 0)))
            service_charge = Decimal(str(data.get("service_charges") or data.get("serviceCharge") or data.get("service_charge", 0)))
            internal_profit = Decimal(str(data.get("internal_profit", service_charge)))
            total_charged = part_cost + service_charge

        customer = None
        if cust_phone:
            customer = Customer.objects.filter(phone=cust_phone, full_name__iexact=cust_name).first()
        if not customer:
            customer = Customer.objects.create(
                phone=cust_phone or "9845012345",
                full_name=cust_name,
                email=cust_email,
                consent_timestamp=timezone.now(),
            )
        else:
            if cust_email and not customer.email:
                customer.email = cust_email
                customer.save(update_fields=["email"])

        # Find linked lead if provided
        lead_id = data.get("lead") or data.get("lead_id") or data.get("linked_lead_id")
        lead = None
        if lead_id:
            lead = Lead.objects.filter(reference=lead_id).first()
            if not lead:
                try:
                    lead = Lead.objects.filter(id=lead_id).first()
                except Exception:
                    lead = None

        if lead:
            # Update lead status to interested
            if lead.status != LeadStatus.INTERESTED:
                lead.status = LeadStatus.INTERESTED
                lead.save(update_fields=["status", "updated_at"])

            # Check if this lead already has a repair order — PREVENT DUPLICATES
            existing_repair = RepairOrder.objects.filter(lead=lead).first()
            if existing_repair:
                # Update existing repair order
                existing_repair.customer = customer
                existing_repair.device_model_text = device_text or existing_repair.device_model_text
                existing_repair.intake_condition = issue_text or existing_repair.intake_condition
                if confirmed_issue:
                    existing_repair.confirmed_issue = confirmed_issue
                if work_performed:
                    existing_repair.work_performed = work_performed
                if parts_used or part_name:
                    existing_repair.parts_used_notes = parts_used or part_name
                if part_name:
                    existing_repair.part_name = part_name
                if vendor_name:
                    existing_repair.vendor_name = vendor_name
                if vendor_cost > 0:
                    existing_repair.vendor_cost = vendor_cost
                if total_charged > 0:
                    existing_repair.total_customer_charge = total_charged
                    existing_repair.product_price = total_charged
                    existing_repair.service_charges = Decimal("0.00")
                    existing_repair.internal_profit = max(Decimal("0.00"), total_charged - existing_repair.vendor_cost)

                # Assign technician if specified
                tech_id = data.get("technician_id") or data.get("assigned_technician")
                tech_name = data.get("technician") or data.get("technician_name")
                if tech_id:
                    existing_repair.assigned_technician = User.objects.filter(id=tech_id).first()
                elif tech_name:
                    existing_repair.assigned_technician = User.objects.filter(full_name__icontains=tech_name).first()

                if "status" in data:
                    existing_repair.status = data["status"]

                existing_repair.save()
                return Response(RepairOrderSerializer(existing_repair).data, status=status.HTTP_200_OK)
        else:
            # Create a lead for this booking so they are always linked
            lead = Lead.objects.create(
                customer=customer,
                device_model_text=device_text,
                reported_problem=issue_text,
                status=LeadStatus.INTERESTED,
                source=data.get("source", "walk_in"),
            )

        # Resolve technician
        tech_id = data.get("technician_id") or data.get("assigned_technician")
        tech_name = data.get("technician") or data.get("technician_name")
        assigned_tech = None
        if tech_id:
            assigned_tech = User.objects.filter(id=tech_id).first()
        elif tech_name:
            assigned_tech = User.objects.filter(full_name__icontains=tech_name).first() or \
                            User.objects.filter(email__icontains=tech_name).first()

        repair = RepairOrder.objects.create(
            lead=lead,
            customer=customer,
            device_model_text=device_text,
            intake_condition=issue_text,
            confirmed_issue=confirmed_issue,
            diagnosis=f"{issue_text} — {confirmed_issue}".strip(" —"),
            work_performed=work_performed,
            parts_used_notes=parts_used or part_name,
            part_name=part_name,
            vendor_name=vendor_name,
            vendor_cost=vendor_cost,
            product_price=part_cost,
            service_charges=service_charge,
            total_customer_charge=total_charged,
            internal_profit=internal_profit,
            actual_parts_cost=vendor_cost,
            actual_labor_cost=service_charge,
            internal_estimated_cost=total_charged,
            assigned_technician=assigned_tech,
            status=data.get("status", RepairStatus.PENDING),
            priority=data.get("priority", RepairPriority.NORMAL),
        )
        return Response(RepairOrderSerializer(repair).data, status=status.HTTP_201_CREATED)


class RepairOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RepairOrder.objects.select_related("customer", "assigned_technician", "lead")
    serializer_class = RepairOrderSerializer
    permission_classes = [IsCRMAccess]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data

        # Status update
        if "status" in data:
            new_status = data["status"]
            instance.status = new_status
            if new_status in [RepairStatus.COMPLETED, "completed"]:
                instance.repair_completed_at = timezone.now()
            elif new_status in [RepairStatus.REWORK, "rework"]:
                instance.rework_reason = data.get("rework_reason", "Customer/QC reported rework required")
                # Do not treat rework as completed!
                instance.repair_completed_at = None

        if "rework_reason" in data:
            instance.rework_reason = data["rework_reason"]

        # Technician assignment
        if "assigned_technician" in data or "technician_id" in data:
            tech_id = data.get("assigned_technician") or data.get("technician_id")
            if tech_id:
                instance.assigned_technician = User.objects.filter(id=tech_id).first()
            else:
                instance.assigned_technician = None
        elif "technician" in data or "technician_name" in data:
            tech_name = data.get("technician") or data.get("technician_name")
            if tech_name:
                instance.assigned_technician = User.objects.filter(full_name__icontains=tech_name).first()

        # Work tracking fields
        if "confirmed_issue" in data:
            instance.confirmed_issue = data["confirmed_issue"]
        if "work_performed" in data:
            instance.work_performed = data["work_performed"]
        if "parts_used_notes" in data or "parts_used" in data:
            instance.parts_used_notes = data.get("parts_used_notes") or data.get("parts_used", "")
        if "internal_notes" in data:
            instance.internal_notes = data["internal_notes"]

        # Vendor & Part purchase tracking
        if "part_name" in data:
            instance.part_name = data["part_name"]
            if not instance.parts_used_notes:
                instance.parts_used_notes = data["part_name"]
        if "vendor_name" in data or "vendor" in data:
            instance.vendor_name = data.get("vendor_name") or data.get("vendor", "")
        if "vendor_cost" in data:
            instance.vendor_cost = Decimal(str(data["vendor_cost"]))
            instance.actual_parts_cost = instance.vendor_cost

        # Single customer price or legacy breakdown
        cust_total = data.get("total_customer_charge") or data.get("total_price") or data.get("customer_price")
        if cust_total is not None and str(cust_total).strip() != "":
            instance.total_customer_charge = Decimal(str(cust_total))
            instance.product_price = instance.total_customer_charge
            instance.service_charges = Decimal("0.00")
            instance.internal_profit = max(Decimal("0.00"), instance.total_customer_charge - instance.vendor_cost)
        else:
            if "product_price" in data or "partCost" in data or "part_cost" in data:
                val = data.get("product_price") or data.get("partCost") or data.get("part_cost", 0)
                instance.product_price = Decimal(str(val))
                instance.actual_parts_cost = instance.product_price

            if "service_charges" in data or "serviceCharge" in data or "service_charge" in data:
                val = data.get("service_charges") or data.get("serviceCharge") or data.get("service_charge", 0)
                instance.service_charges = Decimal(str(val))
                instance.actual_labor_cost = instance.service_charges

            if "internal_profit" in data:
                instance.internal_profit = Decimal(str(data["internal_profit"]))

            # Recalculate total
            instance.total_customer_charge = instance.product_price + instance.service_charges

        instance.internal_estimated_cost = instance.total_customer_charge

        instance.save()
        return Response(RepairOrderSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        """Safe soft delete of booking."""
        instance = self.get_object()
        instance.is_archived = True
        instance.save(update_fields=["is_archived"])
        return Response({"message": f"Booking {instance.order_number} successfully archived."}, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
@permission_classes([IsCRMAccess])
def technicians_list_create_view(request):
    """
    Connected technician list stored in the database.
    Seeds default active technicians if database has none.
    """
    techs = User.objects.filter(role=UserRole.TECHNICIAN)

    if request.method == "POST":
        data = request.data
        name = data.get("full_name") or data.get("name")
        email = data.get("email") or f"{name.lower().replace(' ', '')}@fixurdevice.in"
        phone = data.get("phone", "")
        user = User.objects.create_user(
            email=email,
            full_name=name,
            phone=phone,
            role=UserRole.TECHNICIAN,
            is_active=True,
        )
        return Response({
            "id": user.id,
            "name": user.full_name,
            "phone": user.phone,
            "email": user.email,
            "is_active": user.is_active,
            "active_jobs_count": 0,
        }, status=status.HTTP_201_CREATED)

    result = []
    for t in techs:
        active_count = RepairOrder.objects.filter(
            assigned_technician=t,
            status__in=[RepairStatus.IN_PROGRESS, RepairStatus.PENDING, RepairStatus.SCHEDULED, RepairStatus.REWORK]
        ).count()
        result.append({
            "id": t.id,
            "name": t.full_name,
            "phone": t.phone,
            "email": t.email,
            "is_active": t.is_active,
            "active_jobs_count": active_count,
        })
    return Response(result)


@api_view(["POST", "DELETE"])
@permission_classes([permissions.AllowAny])
def clear_all_repairs(request):
    """Delete all repair orders from SQLite database."""
    count = RepairOrder.objects.count()
    RepairOrder.objects.all().delete()
    return Response({"message": f"Successfully deleted {count} repairs from SQLite database.", "cleared": count})
