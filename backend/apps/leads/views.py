"""
CRM Lead views — authenticated staff access.
Supports 4 Main Actions: Interested, Not Interested, Wrong Number, Call Back Later.
Safe soft-deletion, callback rescheduling, and real database persistence.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction, models
from django.conf import settings
from decimal import Decimal
import datetime

from .models import (
    Lead, LeadStatus, LeadStatusHistory, CommunicationLog, FollowUpTask,
    CallbackSchedule, LeadSource
)
from .serializers import (
    LeadListSerializer, LeadDetailSerializer, LeadTransitionSerializer,
    LeadActionSerializer, CommunicationLogSerializer, FollowUpTaskSerializer,
    CallbackScheduleSerializer
)
from apps.customers.models import Customer
from apps.repairs.models import RepairOrder, RepairStatus, RepairPriority
from apps.accounts.models import User, UserRole


class IsCRMAccess(permissions.BasePermission):
    """Allows admin, CRM executive, and manager roles, or development access."""
    def has_permission(self, request, view):
        if settings.DEBUG:
            return True
        return (
            request.user.is_authenticated
            and request.user.role in [UserRole.ADMIN, UserRole.CRM_EXECUTIVE, UserRole.MANAGER]
        )


class LeadListView(generics.ListCreateAPIView):
    """Paginated, filtered, searchable lead list and lead creation for CRM."""
    serializer_class = LeadListSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["priority", "assigned_to", "pickup_pincode"]
    search_fields = ["customer__full_name", "customer__phone", "customer__email", "reference", "pickup_area", "device_model_text"]
    ordering_fields = ["created_at", "next_followup_at", "callback_date", "priority", "status"]
    ordering = ["-created_at"]

    def get_permissions(self):
        return [IsCRMAccess()]

    def get_queryset(self):
        qs = Lead.objects.select_related(
            "customer", "assigned_to", "device_category", "device_brand"
        ).prefetch_related("callback_schedules")

        # Archive filter: hide archived by default
        show_archived = self.request.query_params.get("archived") == "true"
        if show_archived:
            qs = qs.filter(is_archived=True)
        else:
            qs = qs.filter(is_archived=False)

        # Status filter
        status_param = self.request.query_params.get("status")
        if status_param and status_param != "all":
            if status_param == "rejected":
                qs = qs.filter(status__in=[LeadStatus.NOT_INTERESTED, LeadStatus.WRONG_NUMBER])
            elif status_param in ["not_interested", LeadStatus.NOT_INTERESTED]:
                qs = qs.filter(status=LeadStatus.NOT_INTERESTED)
            elif status_param in ["wrong_number", LeadStatus.WRONG_NUMBER]:
                qs = qs.filter(status=LeadStatus.WRONG_NUMBER)
            else:
                qs = qs.filter(status=status_param)

        # Source filter
        source_param = self.request.query_params.get("source")
        if source_param and source_param != "all":
            qs = qs.filter(source=source_param)

        # Callback filters
        callback_filter = self.request.query_params.get("callback_filter")
        today = timezone.now().date()
        if callback_filter == "due_today":
            qs = qs.filter(status=LeadStatus.CALLBACK_LATER, callback_date=today)
        elif callback_filter == "overdue":
            qs = qs.filter(status=LeadStatus.CALLBACK_LATER, callback_date__lt=today)
        elif callback_filter == "upcoming":
            qs = qs.filter(status=LeadStatus.CALLBACK_LATER, callback_date__gt=today)

        # Date range
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        return qs

    def create(self, request, *args, **kwargs):
        data = request.data
        customer_phone = (data.get("customer_phone") or data.get("phone", "")).strip()
        customer_name = (data.get("customer_name") or data.get("customer", "")).strip() or "Customer"
        customer_email = (data.get("customer_email") or data.get("email", "")).strip()
        customer_address = (data.get("customer_address") or data.get("address", "")).strip()

        # Match existing customer by BOTH phone and name (case-insensitive) to prevent renaming previous customers
        customer = None
        if customer_phone:
            customer = Customer.objects.filter(phone=customer_phone, full_name__iexact=customer_name).first()

        # If not found, create a new separate customer record for this person
        if not customer:
            customer = Customer.objects.create(
                phone=customer_phone or "9845012345",
                full_name=customer_name,
                email=customer_email,
                address_line1=customer_address,
                consent_timestamp=timezone.now(),
            )
        else:
            # Update only missing profile details non-destructively (never overwrite existing name)
            changed_fields = []
            if customer_email and not customer.email:
                customer.email = customer_email
                changed_fields.append("email")
            if customer_address and not customer.address_line1:
                customer.address_line1 = customer_address
                changed_fields.append("address_line1")
            if changed_fields:
                customer.save(update_fields=changed_fields)

        user_name = data.get("handled_by_name") or data.get("user_name")
        if not user_name and request.user.is_authenticated:
            user_name = request.user.full_name or request.user.email
        if not user_name:
            user_name = "Super Admin" if data.get("source") == "walk_in" else "Website / Online"

        lead = Lead.objects.create(
            customer=customer,
            customer_name=customer_name,
            customer_phone=customer_phone,
            customer_email=customer_email,
            device_model_text=data.get("device_model_text") or data.get("device", "Device"),
            reported_problem=data.get("reported_problem") or data.get("issue", "Repair Request"),
            pickup_area=data.get("pickup_area") or data.get("area", "Bangalore"),
            pickup_address=customer_address or data.get("pickup_address", ""),
            status=data.get("status", LeadStatus.NEW),
            priority=data.get("priority", "high"),
            source=data.get("source", LeadSource.WALK_IN),
            internal_notes=data.get("notes", ""),
            handled_by=request.user if request.user.is_authenticated else None,
            handled_by_name=user_name,
        )
        return Response(LeadListSerializer(lead).data, status=status.HTTP_201_CREATED)


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Full lead detail view with all related data, updating, and safe deletion."""
    queryset = Lead.objects.select_related(
        "customer", "assigned_to", "device_category", "device_brand", "device_model",
        "service_requested",
    ).prefetch_related("status_history", "communications", "followup_tasks", "callback_schedules")
    serializer_class = LeadDetailSerializer

    def get_permissions(self):
        return [IsCRMAccess()]

    def destroy(self, request, *args, **kwargs):
        """
        Safe deletion strategy:
        Prefer soft deletion/archival for leads with bookings, completed work, invoices, or financial records.
        """
        lead = self.get_object()
        has_repair = hasattr(lead, "repair_order") and lead.repair_order is not None
        has_invoices = lead.invoices.exists() if hasattr(lead, "invoices") else False

        permanent = request.query_params.get("permanent") == "true" and getattr(request.user, "is_admin", False)

        if has_repair or has_invoices or not permanent:
            # Soft delete / archive
            lead.is_archived = True
            lead.archived_at = timezone.now()
            lead.archived_by = request.user if request.user.is_authenticated else None
            reason = request.data.get("reason") if isinstance(request.data, dict) else ""
            lead.archive_reason = reason or ("Archived with linked booking/financial records" if has_repair else "Archived by staff")
            lead.save(update_fields=["is_archived", "archived_at", "archived_by", "archive_reason"])
            return Response(
                {
                    "message": f"Lead {lead.reference} safely archived.",
                    "archived": True,
                    "action": "archived",
                    "lead_id": str(lead.id),
                    "reference": lead.reference,
                },
                status=status.HTTP_200_OK
            )
        else:
            lead.delete()
            return Response(
                {"message": f"Lead {lead.reference} permanently deleted.", "archived": False, "action": "deleted"},
                status=status.HTTP_200_OK
            )


@api_view(["POST"])
@permission_classes([IsCRMAccess])
def lead_action_view(request, pk):
    """
    Enquiries Page — Four Main Mutually Exclusive Actions:
    1. Interested:
       - Record customer issue & requirements
       - Save lead status in DB
       - Automatically make customer visible in Bookings section (RepairOrder)
       - Allow setting product price, service charges, internal profit, technician
       - Prevent duplicate bookings when lead updated repeatedly!
    2. Not Interested:
       - Require reason (Price too high, Customer changed mind, Service not required, etc.)
       - Allow detailed staff note
       - Display in Not Interested section
    3. Wrong Number:
       - Record verification note/remarks
       - Display in Not Interested section labelled Wrong Number
    4. Call Back Later:
       - Require callback date and time
       - Save callback schedule in DB (maintains full history!)
       - Display in Call Back section
    """
    try:
        lead = Lead.objects.select_related("customer").get(pk=pk)
    except Lead.DoesNotExist:
        try:
            lead = Lead.objects.select_related("customer").get(reference=pk)
        except Lead.DoesNotExist:
            return Response({"error": "Lead not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = LeadActionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    val_data = serializer.validated_data
    action = val_data["action"]
    if action == "callback":
        action = "callback_later"

    notes = (
        val_data.get("notes")
        or val_data.get("rejection_notes")
        or val_data.get("work_notes")
        or val_data.get("callback_notes")
        or ""
    )

    old_status = lead.status

    # Handled by tracking
    user_name = request.data.get("handled_by_name") or request.data.get("user_name")
    if not user_name and request.user.is_authenticated:
        user_name = request.user.full_name or request.user.email
    if not user_name:
        user_name = "Super Admin"

    lead.handled_by_name = user_name
    if request.user.is_authenticated:
        lead.handled_by = request.user

    with transaction.atomic():
        if action == "interested":
            # ─── Option A: Interested ──────────────────────────────────────────
            lead.status = LeadStatus.INTERESTED
            if notes:
                lead.internal_notes = f"{lead.internal_notes}\n[Interested]: {notes}".strip()
            lead.save()

            # Record status history
            LeadStatusHistory.objects.create(
                lead=lead, from_status=old_status, to_status=LeadStatus.INTERESTED,
                performed_by=request.user if request.user.is_authenticated else None,
                notes=notes or "Customer marked Interested; Booking confirmed.",
            )

            # Prevent duplicate bookings: check existing RepairOrder
            booking = RepairOrder.objects.filter(lead=lead).first()

            part_name = request.data.get("part_name") or request.data.get("product_name") or ""
            vendor_name = request.data.get("vendor_name") or request.data.get("vendor") or ""
            vendor_cost = Decimal(str(request.data.get("vendor_cost") or val_data.get("product_price", Decimal("0.00"))))

            cust_total_in = request.data.get("total_customer_charge") or request.data.get("total_price") or request.data.get("customer_price")
            if cust_total_in is not None and str(cust_total_in).strip() != "":
                total_charge = Decimal(str(cust_total_in))
                part_price = total_charge
                serv_charge = Decimal("0.00")
                profit = max(Decimal("0.00"), total_charge - vendor_cost)
            else:
                part_price = val_data.get("product_price", Decimal("0.00"))
                serv_charge = val_data.get("service_charges", Decimal("0.00"))
                profit = val_data.get("internal_profit", serv_charge)
                total_charge = part_price + serv_charge

            # Resolve technician
            tech = None
            if val_data.get("technician_id"):
                tech = User.objects.filter(id=val_data["technician_id"]).first()
            elif val_data.get("technician_name"):
                tech = User.objects.filter(full_name__icontains=val_data["technician_name"]).first()

            serv_status = val_data.get("service_status") or RepairStatus.PENDING
            booking_date = val_data.get("booking_date") or timezone.now().date()
            confirmed_issue = val_data.get("confirmed_issue") or lead.reported_problem

            if booking:
                # Update existing booking — PREVENT DUPLICATES
                if part_name:
                    booking.part_name = part_name
                    booking.parts_used_notes = part_name
                if vendor_name:
                    booking.vendor_name = vendor_name
                booking.vendor_cost = vendor_cost
                booking.product_price = part_price
                booking.service_charges = serv_charge
                booking.total_customer_charge = total_charge
                booking.internal_profit = profit
                booking.actual_parts_cost = vendor_cost
                booking.confirmed_issue = confirmed_issue
                booking.booking_date = booking_date
                if tech:
                    booking.assigned_technician = tech
                if serv_status:
                    booking.status = serv_status
                booking.save()
            else:
                # Create brand new linked booking
                booking = RepairOrder.objects.create(
                    lead=lead,
                    customer=lead.customer,
                    device_model_text=lead.device_model_text or "Device",
                    intake_condition=lead.reported_problem,
                    confirmed_issue=confirmed_issue,
                    diagnosis=f"{lead.reported_problem} — {confirmed_issue}".strip(" —"),
                    part_name=part_name,
                    parts_used_notes=part_name,
                    vendor_name=vendor_name,
                    vendor_cost=vendor_cost,
                    product_price=part_price,
                    service_charges=serv_charge,
                    total_customer_charge=total_charge,
                    internal_profit=profit,
                    actual_parts_cost=vendor_cost,
                    actual_labor_cost=serv_charge,
                    internal_estimated_cost=total_charge,
                    assigned_technician=tech,
                    booking_date=booking_date,
                    status=serv_status,
                    priority=RepairPriority.NORMAL,
                )

        elif action == "not_interested":
            # ─── Option B: Not Interested ──────────────────────────────────────
            reason = val_data.get("reason") or val_data.get("rejection_reason") or "Price too high"
            lead.status = LeadStatus.NOT_INTERESTED
            lead.rejection_reason = reason
            lead.rejection_notes = notes
            if notes:
                lead.internal_notes = f"{lead.internal_notes}\n[Not Interested - {reason}]: {notes}".strip()
            lead.save()

            LeadStatusHistory.objects.create(
                lead=lead, from_status=old_status, to_status=LeadStatus.NOT_INTERESTED,
                performed_by=request.user if request.user.is_authenticated else None,
                notes=f"Reason: {reason}. {notes}",
            )

        elif action == "wrong_number":
            # ─── Option C: Wrong Number ────────────────────────────────────────
            lead.status = LeadStatus.WRONG_NUMBER
            lead.rejection_reason = "Wrong Number"
            lead.rejection_notes = notes or "Customer verification failed — Wrong number."
            if notes:
                lead.internal_notes = f"{lead.internal_notes}\n[Wrong Number]: {notes}".strip()
            lead.save()

            LeadStatusHistory.objects.create(
                lead=lead, from_status=old_status, to_status=LeadStatus.WRONG_NUMBER,
                performed_by=request.user if request.user.is_authenticated else None,
                notes=f"Wrong Number: {notes}",
            )

        elif action == "callback_later":
            # ─── Option D: Call Back Later ─────────────────────────────────────
            cb_date = val_data.get("callback_date") or timezone.now().date()
            cb_time = val_data.get("callback_time") or "05:00 PM"

            lead.status = LeadStatus.CALLBACK_LATER
            lead.callback_date = cb_date
            lead.callback_time = cb_time
            lead.callback_notes = notes
            if notes:
                lead.internal_notes = f"{lead.internal_notes}\n[Callback Scheduled on {cb_date} at {cb_time}]: {notes}".strip()

            # Set next_followup_at timestamp
            try:
                # Combine date with rough time for ordering
                lead.next_followup_at = timezone.now().replace(
                    year=cb_date.year, month=cb_date.month, day=cb_date.day
                )
            except Exception:
                pass

            lead.save()

            # Record schedule in CallbackSchedule (Append to history!)
            CallbackSchedule.objects.create(
                lead=lead,
                scheduled_date=cb_date,
                scheduled_time=cb_time,
                reason=val_data.get("reason", "Customer requested callback"),
                notes=notes,
                status="pending",
                created_by=request.user if request.user.is_authenticated else None,
            )

            LeadStatusHistory.objects.create(
                lead=lead, from_status=old_status, to_status=LeadStatus.CALLBACK_LATER,
                performed_by=request.user if request.user.is_authenticated else None,
                notes=f"Callback scheduled for {cb_date} at {cb_time}. {notes}",
            )

        elif action == "reopen":
            # Reopen to new or callback
            new_st = val_data.get("service_status") or LeadStatus.NEW
            lead.status = new_st
            lead.rejection_reason = ""
            lead.rejection_notes = ""
            lead.save()

            LeadStatusHistory.objects.create(
                lead=lead, from_status=old_status, to_status=new_st,
                performed_by=request.user if request.user.is_authenticated else None,
                notes=f"Lead reopened by staff. {notes}",
            )

    return Response(LeadDetailSerializer(lead).data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsCRMAccess])
def callback_reschedule_view(request, pk):
    """Reschedule an existing callback, keeping full history."""
    try:
        lead = Lead.objects.get(pk=pk)
    except Lead.DoesNotExist:
        lead = Lead.objects.get(reference=pk)

    data = request.data
    cb_date = data.get("callback_date")
    cb_time = data.get("callback_time", "05:00 PM")
    notes = data.get("notes", "")
    outcome = data.get("outcome", "Customer requested rescheduling")

    if not cb_date:
        return Response({"error": "Callback date is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Mark previous pending schedules as rescheduled
    lead.callback_schedules.filter(status="pending").update(
        status="rescheduled",
        call_outcome=outcome,
        contacted_at=timezone.now(),
    )

    # Create new schedule record
    new_sched = CallbackSchedule.objects.create(
        lead=lead,
        scheduled_date=cb_date,
        scheduled_time=cb_time,
        reason=outcome,
        notes=notes,
        status="pending",
        created_by=request.user if request.user.is_authenticated else None,
    )

    lead.status = LeadStatus.CALLBACK_LATER
    lead.callback_date = cb_date
    lead.callback_time = cb_time
    lead.callback_notes = notes
    lead.save()

    return Response(CallbackScheduleSerializer(new_sched).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsCRMAccess])
def restore_lead_view(request, pk):
    """Restore an archived lead."""
    try:
        lead = Lead.objects.get(pk=pk)
    except Lead.DoesNotExist:
        lead = Lead.objects.get(reference=pk)

    lead.is_archived = False
    lead.archive_reason = ""
    lead.archived_at = None
    lead.archived_by = None
    lead.save()
    return Response({"message": f"Lead {lead.reference} restored successfully.", "lead": LeadListSerializer(lead).data})


@api_view(["GET"])
@permission_classes([IsCRMAccess])
def crm_dashboard_stats(request):
    """
    Dashboard summary statistics calculated strictly from real database records.
    """
    today = timezone.now().date()
    now = timezone.now()

    from apps.payments.models import Invoice

    total_enquiries = Lead.objects.filter(is_archived=False).count()
    new_today = Lead.objects.filter(is_archived=False, created_at__date=today).count()
    new_enquiries = Lead.objects.filter(is_archived=False, status=LeadStatus.NEW).count()
    interested_count = Lead.objects.filter(is_archived=False, status=LeadStatus.INTERESTED).count()

    # Callbacks breakdown
    callbacks_due_today = Lead.objects.filter(
        is_archived=False, status=LeadStatus.CALLBACK_LATER, callback_date=today
    ).count()
    callbacks_overdue = Lead.objects.filter(
        is_archived=False, status=LeadStatus.CALLBACK_LATER, callback_date__lt=today
    ).count()
    callbacks_upcoming = Lead.objects.filter(
        is_archived=False, status=LeadStatus.CALLBACK_LATER, callback_date__gt=today
    ).count()
    callbacks_total = Lead.objects.filter(
        is_archived=False, status=LeadStatus.CALLBACK_LATER
    ).count()

    # Not interested & wrong number
    not_interested = Lead.objects.filter(is_archived=False, status=LeadStatus.NOT_INTERESTED).count()
    wrong_number = Lead.objects.filter(is_archived=False, status=LeadStatus.WRONG_NUMBER).count()

    # Bookings & Repairs
    bookings_active = RepairOrder.objects.filter(
        is_archived=False,
        status__in=[RepairStatus.PENDING, RepairStatus.SCHEDULED, RepairStatus.IN_PROGRESS, RepairStatus.REPAIR_IN_PROGRESS]
    ).count()
    completed_services = RepairOrder.objects.filter(
        is_archived=False,
        status__in=[RepairStatus.COMPLETED, RepairStatus.REPAIR_COMPLETED, RepairStatus.DELIVERED, RepairStatus.CLOSED]
    ).count()
    rework_count = RepairOrder.objects.filter(
        is_archived=False,
        status__in=[RepairStatus.REWORK, RepairStatus.REWORK_REQUIRED]
    ).count()

    # Invoices & Revenue
    invoices_count = Invoice.objects.count()
    total_revenue = Invoice.objects.filter(status="paid").aggregate(
        total=models.Sum("final_billed_amount")
    )["total"] or Decimal("0.00")
    pending_revenue = Invoice.objects.exclude(status="paid").aggregate(
        total=models.Sum("final_billed_amount")
    )["total"] or Decimal("0.00")

    stats = {
        "enquiries": {
            "total": total_enquiries,
            "new_today": new_today,
            "new_pending": new_enquiries,
            "interested": interested_count,
        },
        "callbacks": {
            "due_today": callbacks_due_today,
            "overdue": callbacks_overdue,
            "upcoming": callbacks_upcoming,
            "total": callbacks_total,
        },
        "rejected": {
            "not_interested": not_interested,
            "wrong_number": wrong_number,
            "total": not_interested + wrong_number,
        },
        "bookings": {
            "active": bookings_active,
            "completed": completed_services,
            "rework": rework_count,
            "total": RepairOrder.objects.filter(is_archived=False).count(),
        },
        "invoices": {
            "count": invoices_count,
            "total_revenue": float(total_revenue),
            "pending_revenue": float(pending_revenue),
        },
    }
    return Response(stats)


@api_view(["POST", "DELETE"])
@permission_classes([permissions.AllowAny])
def clear_all_leads(request):
    """Delete all leads from SQLite database."""
    count = Lead.objects.count()
    Lead.objects.all().delete()
    return Response({"message": f"Successfully deleted {count} leads from SQLite database.", "cleared": count})
