"""
Lead management models — the core CRM pipeline entity.
"""
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid


class LeadStatus(models.TextChoices):
    NEW = "new", "New Lead"
    CONTACT_PENDING = "contact_pending", "Contact Pending"
    CONTACTED = "contacted", "Contacted"
    QUALIFIED = "qualified", "Qualified"
    AREA_VERIFICATION = "area_verification", "Service Area Verification"
    PICKUP_SCHEDULING = "pickup_scheduling", "Pickup Scheduling"
    PICKUP_CONFIRMED = "pickup_confirmed", "Pickup Confirmed"
    PICKED_UP = "picked_up", "Picked Up"
    DEVICE_RECEIVED = "device_received", "Device Received"
    DIAGNOSIS_IN_PROGRESS = "diagnosis_in_progress", "Diagnosis in Progress"
    QUOTATION_PENDING = "quotation_pending", "Quotation Pending"
    QUOTATION_SENT = "quotation_sent", "Quotation Sent"
    AWAITING_APPROVAL = "awaiting_approval", "Awaiting Customer Approval"
    APPROVED = "approved", "Approved"
    REJECTED_BY_CUSTOMER = "rejected_by_customer", "Rejected by Customer"
    REPAIR_IN_PROGRESS = "repair_in_progress", "Repair in Progress"
    REPAIR_ON_HOLD = "repair_on_hold", "Repair on Hold"
    QUALITY_CHECK = "quality_check", "Quality Check"
    READY_FOR_DELIVERY = "ready_for_delivery", "Ready for Delivery"
    DELIVERY_SCHEDULED = "delivery_scheduled", "Delivery Scheduled"
    OUT_FOR_DELIVERY = "out_for_delivery", "Out for Delivery"
    DELIVERED = "delivered", "Delivered"
    PAYMENT_PENDING = "payment_pending", "Payment Pending"
    PAYMENT_COMPLETED = "payment_completed", "Payment Completed"
    COMPLETED = "completed", "Completed"
    FOLLOWUP_PENDING = "followup_pending", "Follow-up Pending"
    FEEDBACK_RECEIVED = "feedback_received", "Feedback Received"
    CLOSED_SUCCESSFUL = "closed_successful", "Closed - Successful"
    # 4 Main CRM Pipeline Actions
    INTERESTED = "interested", "Interested"
    NOT_INTERESTED = "not_interested", "Not Interested"
    WRONG_NUMBER = "wrong_number", "Wrong Number"
    CALLBACK_LATER = "callback_later", "Call Back Later"

    CLOSED_UNSUCCESSFUL = "closed_unsuccessful", "Closed - Unsuccessful"
    CANCELLED = "cancelled", "Cancelled"
    REWORK_REQUIRED = "rework_required", "Rework Required"


# Valid status transitions — enforced at model/API level
VALID_TRANSITIONS = {
    LeadStatus.NEW: [
        LeadStatus.INTERESTED, LeadStatus.NOT_INTERESTED, LeadStatus.WRONG_NUMBER, LeadStatus.CALLBACK_LATER,
        LeadStatus.CONTACT_PENDING, LeadStatus.CONTACTED, LeadStatus.CANCELLED
    ],
    LeadStatus.INTERESTED: [
        LeadStatus.NOT_INTERESTED, LeadStatus.WRONG_NUMBER, LeadStatus.CALLBACK_LATER,
        LeadStatus.REPAIR_IN_PROGRESS, LeadStatus.COMPLETED, LeadStatus.CANCELLED
    ],
    LeadStatus.NOT_INTERESTED: [
        LeadStatus.NEW, LeadStatus.INTERESTED, LeadStatus.WRONG_NUMBER, LeadStatus.CALLBACK_LATER
    ],
    LeadStatus.WRONG_NUMBER: [
        LeadStatus.NEW, LeadStatus.INTERESTED, LeadStatus.NOT_INTERESTED, LeadStatus.CALLBACK_LATER
    ],
    LeadStatus.CALLBACK_LATER: [
        LeadStatus.NEW, LeadStatus.INTERESTED, LeadStatus.NOT_INTERESTED, LeadStatus.WRONG_NUMBER, LeadStatus.CALLBACK_LATER
    ],
    LeadStatus.CONTACT_PENDING: [LeadStatus.CONTACTED, LeadStatus.CANCELLED, LeadStatus.INTERESTED, LeadStatus.NOT_INTERESTED, LeadStatus.CALLBACK_LATER],
    LeadStatus.CONTACTED: [LeadStatus.QUALIFIED, LeadStatus.AREA_VERIFICATION, LeadStatus.CANCELLED, LeadStatus.CLOSED_UNSUCCESSFUL, LeadStatus.INTERESTED, LeadStatus.NOT_INTERESTED, LeadStatus.WRONG_NUMBER, LeadStatus.CALLBACK_LATER],
    LeadStatus.QUALIFIED: [LeadStatus.AREA_VERIFICATION, LeadStatus.PICKUP_SCHEDULING, LeadStatus.CANCELLED, LeadStatus.INTERESTED],
    LeadStatus.AREA_VERIFICATION: [LeadStatus.PICKUP_SCHEDULING, LeadStatus.CANCELLED, LeadStatus.CLOSED_UNSUCCESSFUL],
    LeadStatus.PICKUP_SCHEDULING: [LeadStatus.PICKUP_CONFIRMED, LeadStatus.CANCELLED],
    LeadStatus.PICKUP_CONFIRMED: [LeadStatus.PICKED_UP, LeadStatus.PICKUP_SCHEDULING, LeadStatus.CANCELLED],
    LeadStatus.PICKED_UP: [LeadStatus.DEVICE_RECEIVED],
    LeadStatus.DEVICE_RECEIVED: [LeadStatus.DIAGNOSIS_IN_PROGRESS],
    LeadStatus.DIAGNOSIS_IN_PROGRESS: [LeadStatus.QUOTATION_PENDING],
    LeadStatus.QUOTATION_PENDING: [LeadStatus.QUOTATION_SENT],
    LeadStatus.QUOTATION_SENT: [LeadStatus.AWAITING_APPROVAL],
    LeadStatus.AWAITING_APPROVAL: [LeadStatus.APPROVED, LeadStatus.REJECTED_BY_CUSTOMER],
    LeadStatus.APPROVED: [LeadStatus.REPAIR_IN_PROGRESS],
    LeadStatus.REJECTED_BY_CUSTOMER: [LeadStatus.READY_FOR_DELIVERY, LeadStatus.CLOSED_UNSUCCESSFUL],
    LeadStatus.REPAIR_IN_PROGRESS: [LeadStatus.REPAIR_ON_HOLD, LeadStatus.QUALITY_CHECK, LeadStatus.COMPLETED],
    LeadStatus.REPAIR_ON_HOLD: [LeadStatus.REPAIR_IN_PROGRESS, LeadStatus.CANCELLED],
    LeadStatus.QUALITY_CHECK: [LeadStatus.READY_FOR_DELIVERY, LeadStatus.REWORK_REQUIRED],
    LeadStatus.READY_FOR_DELIVERY: [LeadStatus.DELIVERY_SCHEDULED],
    LeadStatus.DELIVERY_SCHEDULED: [LeadStatus.OUT_FOR_DELIVERY],
    LeadStatus.OUT_FOR_DELIVERY: [LeadStatus.DELIVERED, LeadStatus.DELIVERY_SCHEDULED],
    LeadStatus.DELIVERED: [LeadStatus.PAYMENT_PENDING, LeadStatus.PAYMENT_COMPLETED],
    LeadStatus.PAYMENT_PENDING: [LeadStatus.PAYMENT_COMPLETED],
    LeadStatus.PAYMENT_COMPLETED: [LeadStatus.COMPLETED],
    LeadStatus.COMPLETED: [LeadStatus.FOLLOWUP_PENDING, LeadStatus.FEEDBACK_RECEIVED, LeadStatus.CLOSED_SUCCESSFUL],
    LeadStatus.FOLLOWUP_PENDING: [LeadStatus.FEEDBACK_RECEIVED, LeadStatus.CLOSED_SUCCESSFUL],
    LeadStatus.FEEDBACK_RECEIVED: [LeadStatus.CLOSED_SUCCESSFUL],
    LeadStatus.REWORK_REQUIRED: [LeadStatus.REPAIR_IN_PROGRESS],
    LeadStatus.CLOSED_SUCCESSFUL: [LeadStatus.NEW, LeadStatus.INTERESTED],
    LeadStatus.CLOSED_UNSUCCESSFUL: [LeadStatus.NEW, LeadStatus.INTERESTED],
    LeadStatus.CANCELLED: [LeadStatus.NEW, LeadStatus.INTERESTED],
}


class LeadPriority(models.TextChoices):
    LOW = "low", "Low"
    NORMAL = "normal", "Normal"
    HIGH = "high", "High"
    URGENT = "urgent", "Urgent"


class LeadSource(models.TextChoices):
    GOOGLE_ADS = "google_ads", "Google Ads"
    META_ADS = "meta_ads", "Meta Ads"
    WEBSITE = "website", "Website"
    WALK_IN = "walk_in", "Walk-in"
    PHONE = "phone", "Phone Call"
    REFERENCE = "reference", "Reference"
    ORGANIC_SEARCH = "organic_search", "Organic Search"
    WHATSAPP = "whatsapp", "WhatsApp"
    REFERRAL = "referral", "Referral"
    GOOGLE_BUSINESS = "google_business", "Google Business Profile"
    OTHER = "other", "Other"


class Lead(models.Model):
    """
    Core CRM entity — a repair enquiry from a customer.
    Each lead tracks the full lifecycle from enquiry to completion.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=20, unique=True, db_index=True, editable=False)

    # Customer
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.PROTECT, related_name="leads"
    )
    customer_name = models.CharField(max_length=150, blank=True, db_index=True)
    customer_phone = models.CharField(max_length=20, blank=True, db_index=True)
    customer_email = models.EmailField(blank=True)

    # Device information
    device_category = models.ForeignKey(
        "services.DeviceCategory", on_delete=models.PROTECT, null=True, blank=True
    )
    device_brand = models.ForeignKey(
        "services.DeviceBrand", on_delete=models.PROTECT, null=True, blank=True
    )
    device_model = models.ForeignKey(
        "services.DeviceModel", on_delete=models.PROTECT, null=True, blank=True
    )
    device_model_text = models.CharField(
        max_length=150, blank=True, help_text="Free-text if model not in catalog"
    )
    service_requested = models.ForeignKey(
        "services.RepairService", on_delete=models.PROTECT, null=True, blank=True
    )
    service_requested_text = models.CharField(
        max_length=255, blank=True, help_text="Free-text if service not in catalog"
    )
    reported_problem = models.TextField()

    # Location
    pickup_area = models.CharField(max_length=100, blank=True, db_index=True)
    pickup_pincode = models.CharField(max_length=10, blank=True, db_index=True)
    pickup_address = models.TextField(blank=True)
    area_verified = models.BooleanField(default=False)

    # Preferred pickup
    preferred_pickup_date = models.DateField(null=True, blank=True)
    preferred_time_window = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ("morning", "Morning (9AM–12PM)"),
            ("afternoon", "Afternoon (12PM–4PM)"),
            ("evening", "Evening (4PM–8PM)"),
        ],
    )

    # Attribution
    source = models.CharField(max_length=30, choices=LeadSource.choices, default=LeadSource.WEBSITE)
    utm_source = models.CharField(max_length=100, blank=True)
    utm_medium = models.CharField(max_length=100, blank=True)
    utm_campaign = models.CharField(max_length=100, blank=True)
    utm_term = models.CharField(max_length=100, blank=True)
    utm_content = models.CharField(max_length=100, blank=True)
    gclid = models.CharField(max_length=200, blank=True, help_text="Google Ads click ID")
    referrer_url = models.URLField(max_length=500, blank=True)
    landing_page = models.URLField(max_length=500, blank=True)

    # CRM status
    status = models.CharField(
        max_length=30, choices=LeadStatus.choices, default=LeadStatus.NEW, db_index=True
    )
    priority = models.CharField(
        max_length=10, choices=LeadPriority.choices, default=LeadPriority.NORMAL
    )

    # Assignment
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_leads",
        limit_choices_to={"role__in": ["admin", "crm_executive"]},
    )

    # Handled By tracking (Staff member who handled/actioned the lead)
    handled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="handled_leads",
    )
    handled_by_name = models.CharField(
        max_length=150,
        blank=True,
        help_text="Name of staff / user who handled this lead (e.g. Super Admin or executive)"
    )

    # Follow-up
    next_followup_at = models.DateTimeField(null=True, blank=True, db_index=True)
    last_contacted_at = models.DateTimeField(null=True, blank=True)

    # Internal
    internal_notes = models.TextField(blank=True)
    is_spam = models.BooleanField(default=False)
    spam_reason = models.CharField(max_length=255, blank=True)

    # 4 Main Action metadata
    rejection_reason = models.CharField(max_length=255, blank=True)
    rejection_notes = models.TextField(blank=True)
    callback_date = models.DateField(null=True, blank=True, db_index=True)
    callback_time = models.CharField(max_length=50, blank=True)
    callback_notes = models.TextField(blank=True)

    # Soft deletion / Archival
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="archived_leads",
    )
    archive_reason = models.CharField(max_length=255, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "leads_lead"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["assigned_to", "status"]),
            models.Index(fields=["next_followup_at"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["pickup_pincode"]),
        ]

    def __str__(self):
        return f"[{self.reference}] {self.customer.full_name} — {self.get_status_display()}"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = self._generate_reference()
        super().save(*args, **kwargs)

    def _generate_reference(self):
        """Generate a unique human-readable lead reference."""
        from django.utils import timezone
        import random
        import string
        prefix = "FUD"
        date_part = timezone.now().strftime("%y%m%d")
        rand_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        return f"{prefix}-{date_part}-{rand_part}"

    def transition_to(self, new_status, performed_by=None, notes=""):
        """
        Validate and perform a status transition.
        Raises ValidationError if transition is not permitted.
        """
        allowed = VALID_TRANSITIONS.get(self.status, [])
        if new_status not in [s.value for s in allowed]:
            raise ValidationError(
                f"Cannot transition from '{self.get_status_display()}' "
                f"to '{LeadStatus(new_status).label}'. Invalid transition."
            )
        old_status = self.status
        self.status = new_status
        self.save(update_fields=["status", "updated_at"])

        # Record history
        LeadStatusHistory.objects.create(
            lead=self,
            from_status=old_status,
            to_status=new_status,
            performed_by=performed_by,
            notes=notes,
        )
        return self

    @property
    def is_overdue_followup(self):
        if self.next_followup_at:
            return timezone.now() > self.next_followup_at
        return False


class LeadStatusHistory(models.Model):
    """Append-only record of all lead status transitions."""

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="status_history")
    from_status = models.CharField(max_length=30, choices=LeadStatus.choices)
    to_status = models.CharField(max_length=30, choices=LeadStatus.choices)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "leads_status_history"
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.lead.reference}: {self.from_status} → {self.to_status}"


class CommunicationLog(models.Model):
    """Customer communication history — calls, WhatsApp, email."""

    class Channel(models.TextChoices):
        PHONE = "phone", "Phone Call"
        WHATSAPP = "whatsapp", "WhatsApp"
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"
        IN_PERSON = "in_person", "In Person"
        OTHER = "other", "Other"

    class Outcome(models.TextChoices):
        NO_ANSWER = "no_answer", "No Answer"
        CALLBACK_REQUESTED = "callback_requested", "Call Back Requested"
        INTERESTED = "interested", "Customer Interested"
        QUOTATION_REQUESTED = "quotation_requested", "Quotation Requested"
        NOT_INTERESTED = "not_interested", "Not Interested"
        WRONG_NUMBER = "wrong_number", "Wrong Number"
        AREA_UNAVAILABLE = "area_unavailable", "Service Area Unavailable"
        INFORMATION_GIVEN = "information_given", "Information Given"
        PICKUP_SCHEDULED = "pickup_scheduled", "Pickup Scheduled"
        OTHER = "other", "Other"

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="communications")
    channel = models.CharField(max_length=20, choices=Channel.choices)
    direction = models.CharField(
        max_length=10,
        choices=[("inbound", "Inbound"), ("outbound", "Outbound")],
        default="outbound",
    )
    outcome = models.CharField(max_length=30, choices=Outcome.choices, blank=True)
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "leads_communication_log"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.lead.reference} — {self.get_channel_display()} ({self.timestamp:%d %b %Y %H:%M})"


class FollowUpTask(models.Model):
    """Scheduled follow-up task linked to a lead."""

    class TaskStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"
        OVERDUE = "overdue", "Overdue"

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="followup_tasks")
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    due_at = models.DateTimeField(db_index=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=15, choices=TaskStatus.choices, default=TaskStatus.PENDING)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="completed_tasks",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "leads_followup_task"
        ordering = ["due_at"]

    @property
    def is_overdue(self):
        return self.status == self.TaskStatus.PENDING and timezone.now() > self.due_at


class CallbackSchedule(models.Model):
    """Tracks every callback appointment and full callback history for a lead."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="callback_schedules")
    scheduled_date = models.DateField(db_index=True)
    scheduled_time = models.CharField(max_length=50)
    reason = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        default="pending",
        choices=[
            ("pending", "Pending"),
            ("completed", "Completed"),
            ("rescheduled", "Rescheduled"),
            ("cancelled", "Cancelled"),
        ],
        db_index=True,
    )
    call_outcome = models.CharField(max_length=50, blank=True)
    outcome_notes = models.TextField(blank=True)
    contacted_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "leads_callback_schedule"
        ordering = ["-scheduled_date", "-scheduled_time"]

    def __str__(self):
        return f"{self.lead.reference} — Callback on {self.scheduled_date} at {self.scheduled_time} ({self.status})"

