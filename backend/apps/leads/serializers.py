"""
Lead serializers for CRM, 4-action pipeline, and public enquiry submission.
"""
from rest_framework import serializers
from django.utils import timezone
from .models import (
    Lead, LeadStatus, LeadStatusHistory, CommunicationLog, FollowUpTask,
    CallbackSchedule, VALID_TRANSITIONS, LeadSource
)
from apps.customers.serializers import CustomerSerializer
from apps.accounts.serializers import UserBriefSerializer


class CallbackScheduleSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = CallbackSchedule
        fields = [
            "id", "lead", "scheduled_date", "scheduled_time", "reason",
            "notes", "status", "status_display", "call_outcome", "outcome_notes",
            "contacted_at", "created_by", "created_by_name", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LeadStatusHistorySerializer(serializers.ModelSerializer):
    performed_by = UserBriefSerializer(read_only=True)
    from_status_display = serializers.CharField(source="get_from_status_display", read_only=True)
    to_status_display = serializers.CharField(source="get_to_status_display", read_only=True)

    class Meta:
        model = LeadStatusHistory
        fields = [
            "id", "from_status", "from_status_display", "to_status", "to_status_display",
            "performed_by", "notes", "timestamp",
        ]


class CommunicationLogSerializer(serializers.ModelSerializer):
    performed_by = UserBriefSerializer(read_only=True)
    channel_display = serializers.CharField(source="get_channel_display", read_only=True)
    outcome_display = serializers.CharField(source="get_outcome_display", read_only=True)

    class Meta:
        model = CommunicationLog
        fields = [
            "id", "channel", "channel_display", "direction", "outcome",
            "outcome_display", "notes", "performed_by", "timestamp",
        ]
        read_only_fields = ["id", "timestamp"]


class FollowUpTaskSerializer(serializers.ModelSerializer):
    assigned_to = UserBriefSerializer(read_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = FollowUpTask
        fields = [
            "id", "due_at", "notes", "status", "assigned_to", "assigned_to_id",
            "completed_at", "is_overdue", "created_at",
        ]


class LeadListSerializer(serializers.ModelSerializer):
    """Compact serializer for lead lists and pipeline views."""
    customer_name = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    customer_address = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    source_display = serializers.CharField(source="get_source_display", read_only=True)
    priority_display = serializers.CharField(source="get_priority_display", read_only=True)
    handled_by_name = serializers.SerializerMethodField()
    is_overdue_followup = serializers.BooleanField(read_only=True)
    booking_id = serializers.SerializerMethodField()
    booking_status = serializers.SerializerMethodField()
    has_booking = serializers.SerializerMethodField()
    callback_schedules = CallbackScheduleSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id", "reference", "customer_name", "customer_phone", "customer_email", "customer_address",
            "device_model_text", "service_requested_text", "reported_problem",
            "pickup_area", "pickup_pincode", "pickup_address",
            "status", "status_display", "priority", "priority_display",
            "source", "source_display", "assigned_to", "assigned_to_name",
            "handled_by_name",
            "next_followup_at", "is_overdue_followup",
            "rejection_reason", "rejection_notes",
            "callback_date", "callback_time", "callback_notes",
            "booking_id", "booking_status", "has_booking",
            "callback_schedules",
            "is_archived", "archived_at", "archive_reason",
            "internal_notes", "created_at", "updated_at",
        ]

    def get_customer_name(self, obj):
        return obj.customer_name or (obj.customer.full_name if obj.customer else "Customer")

    def get_customer_phone(self, obj):
        return obj.customer_phone or (obj.customer.phone if obj.customer else "")

    def get_customer_email(self, obj):
        return obj.customer_email or (obj.customer.email if obj.customer else "")

    def get_handled_by_name(self, obj):
        if obj.handled_by_name:
            return obj.handled_by_name
        if obj.handled_by:
            return obj.handled_by.full_name or obj.handled_by.email
        if obj.assigned_to:
            return obj.assigned_to.full_name or obj.assigned_to.email
        return "Super Admin"

    def get_customer_address(self, obj):
        if obj.customer:
            addr = obj.customer.address_line1 or ""
            if obj.customer.area:
                addr = f"{addr}, {obj.customer.area}" if addr else obj.customer.area
            if addr:
                return addr
        return obj.pickup_address or obj.pickup_area or ""

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.full_name or obj.assigned_to.email
        return "Unassigned"

    def get_booking_id(self, obj):
        return obj.repair_order.order_number if hasattr(obj, "repair_order") else None

    def get_booking_status(self, obj):
        return obj.repair_order.status if hasattr(obj, "repair_order") else None

    def get_has_booking(self, obj):
        return hasattr(obj, "repair_order") and obj.repair_order is not None


class LeadDetailSerializer(serializers.ModelSerializer):
    """Full lead detail including all related data."""
    customer = CustomerSerializer(read_only=True)
    assigned_to = UserBriefSerializer(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    source_display = serializers.CharField(source="get_source_display", read_only=True)
    priority_display = serializers.CharField(source="get_priority_display", read_only=True)
    status_history = LeadStatusHistorySerializer(many=True, read_only=True)
    communications = CommunicationLogSerializer(many=True, read_only=True)
    followup_tasks = FollowUpTaskSerializer(many=True, read_only=True)
    callback_schedules = CallbackScheduleSerializer(many=True, read_only=True)
    allowed_next_statuses = serializers.SerializerMethodField()
    booking_id = serializers.SerializerMethodField()
    booking_status = serializers.SerializerMethodField()
    handled_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            "id", "reference", "customer", "assigned_to",
            "device_category", "device_brand", "device_model", "device_model_text",
            "service_requested", "service_requested_text", "reported_problem",
            "pickup_area", "pickup_pincode", "pickup_address", "area_verified",
            "preferred_pickup_date", "preferred_time_window",
            "source", "source_display", "utm_source", "utm_medium", "utm_campaign", "gclid",
            "status", "status_display", "priority", "priority_display",
            "handled_by_name",
            "rejection_reason", "rejection_notes",
            "callback_date", "callback_time", "callback_notes",
            "next_followup_at", "last_contacted_at", "internal_notes",
            "is_archived", "archived_at", "archive_reason",
            "booking_id", "booking_status",
            "created_at", "updated_at",
            "status_history", "communications", "followup_tasks", "callback_schedules",
            "allowed_next_statuses",
        ]
        read_only_fields = ["id", "reference", "created_at", "updated_at", "gclid"]

    def get_allowed_next_statuses(self, obj):
        allowed = VALID_TRANSITIONS.get(obj.status, [])
        return [{"value": s.value, "label": s.label} for s in allowed]

    def get_booking_id(self, obj):
        return obj.repair_order.order_number if hasattr(obj, "repair_order") else None

    def get_booking_status(self, obj):
        return obj.repair_order.status if hasattr(obj, "repair_order") else None

    def get_handled_by_name(self, obj):
        if obj.handled_by_name:
            return obj.handled_by_name
        if obj.handled_by:
            return obj.handled_by.full_name or obj.handled_by.email
        if obj.assigned_to:
            return obj.assigned_to.full_name or obj.assigned_to.email
        return "Super Admin"


class LeadActionSerializer(serializers.Serializer):
    """
    Unified serializer for the Four Main Actions:
    1. Interested
    2. Not Interested
    3. Wrong Number
    4. Call Back Later
    """
    action = serializers.ChoiceField(
        choices=["interested", "not_interested", "wrong_number", "callback_later", "callback", "reopen"]
    )

    # Option A: Interested
    part_name = serializers.CharField(required=False, allow_blank=True, default="")
    vendor_name = serializers.CharField(required=False, allow_blank=True, default="")
    vendor_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    total_customer_charge = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    confirmed_issue = serializers.CharField(required=False, allow_blank=True, default="")
    product_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    service_charges = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    internal_profit = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0)
    technician_id = serializers.IntegerField(required=False, allow_null=True)
    technician_name = serializers.CharField(required=False, allow_blank=True, default="")
    service_status = serializers.CharField(required=False, allow_blank=True, default="pending")
    booking_date = serializers.DateField(required=False, allow_null=True)
    work_notes = serializers.CharField(required=False, allow_blank=True, default="")
    handled_by_name = serializers.CharField(required=False, allow_blank=True, default="")

    # Option B: Not Interested
    reason = serializers.CharField(required=False, allow_blank=True, default="")
    rejection_reason = serializers.CharField(required=False, allow_blank=True, default="")
    rejection_notes = serializers.CharField(required=False, allow_blank=True, default="")

    # Option C: Wrong Number
    # (uses notes/rejection_notes)

    # Option D: Call Back Later
    callback_date = serializers.DateField(required=False, allow_null=True)
    callback_time = serializers.CharField(required=False, allow_blank=True, default="")
    callback_notes = serializers.CharField(required=False, allow_blank=True, default="")

    # Shared notes
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class LeadTransitionSerializer(serializers.Serializer):
    """For performing a lead status transition."""
    new_status = serializers.ChoiceField(choices=LeadStatus.choices)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


# ─── Public Enquiry Form ──────────────────────────────────────────────────────

class PublicEnquirySerializer(serializers.Serializer):
    """
    Public-facing repair enquiry form serializer.
    Does NOT accept or return any pricing, internal cost, or CRM data.
    """
    customer_name = serializers.CharField(max_length=150)
    customer_phone = serializers.CharField(max_length=20)
    customer_email = serializers.EmailField(required=False, allow_blank=True, default="")

    device_category_id = serializers.IntegerField(required=False, allow_null=True)
    device_brand_id = serializers.IntegerField(required=False, allow_null=True)
    device_model_id = serializers.IntegerField(required=False, allow_null=True)
    device_model_text = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")

    service_requested_id = serializers.IntegerField(required=False, allow_null=True)
    service_requested_text = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    reported_problem = serializers.CharField()

    pickup_area = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    pickup_pincode = serializers.CharField(max_length=10, required=False, allow_blank=True, default="")
    preferred_pickup_date = serializers.DateField(required=False, allow_null=True)
    preferred_time_window = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")

    # Attribution
    utm_source = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    utm_medium = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    utm_campaign = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    utm_term = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    utm_content = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    gclid = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    referrer_url = serializers.URLField(max_length=500, required=False, allow_blank=True, default="")
    landing_page = serializers.URLField(max_length=500, required=False, allow_blank=True, default="")

    # Consent
    privacy_consent = serializers.BooleanField()
    preferred_contact_method = serializers.CharField(max_length=20, required=False, default="phone")

    def validate_customer_phone(self, value):
        import re
        cleaned = re.sub(r"[\s\-\+\(\)]", "", value)
        if cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = cleaned[2:]
        elif cleaned.startswith("0") and len(cleaned) == 11:
            cleaned = cleaned[1:]
        if not re.match(r"^[6-9]\d{9}$", cleaned):
            raise serializers.ValidationError("Please enter a valid 10-digit Indian mobile number.")
        return cleaned

    def validate_privacy_consent(self, value):
        if not value:
            raise serializers.ValidationError("You must agree to the privacy policy to submit.")
        return value
