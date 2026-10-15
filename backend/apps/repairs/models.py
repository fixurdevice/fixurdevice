"""
Repair order models — workshop management.
"""
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import uuid


class RepairStatus(models.TextChoices):
    # Core CRM Service Statuses
    PENDING = "pending", "Pending"
    SCHEDULED = "scheduled", "Scheduled"
    IN_PROGRESS = "in_progress", "In Progress"
    COMPLETED = "completed", "Completed"
    REWORK = "rework", "Rework"

    # Additional workshop statuses
    AWAITING_DEVICE = "awaiting_device", "Awaiting Device Receipt"
    RECEIVED = "received", "Received"
    INSPECTION_PENDING = "inspection_pending", "Inspection Pending"
    DIAGNOSIS_IN_PROGRESS = "diagnosis_in_progress", "Diagnosis in Progress"
    DIAGNOSIS_COMPLETED = "diagnosis_completed", "Diagnosis Completed"
    QUOTATION_PENDING = "quotation_pending", "Quotation Pending"
    AWAITING_APPROVAL = "awaiting_approval", "Awaiting Approval"
    APPROVED = "approved", "Approved for Repair"
    REPAIR_IN_PROGRESS = "repair_in_progress", "Repair In Progress"
    WAITING_FOR_PARTS = "waiting_for_parts", "Waiting for Parts"
    ON_HOLD = "on_hold", "On Hold"
    REPAIR_COMPLETED = "repair_completed", "Repair Completed"
    QC_PENDING = "qc_pending", "Quality Check Pending"
    QC_PASSED = "qc_passed", "Quality Check Passed"
    QC_FAILED = "qc_failed", "Quality Check Failed"
    REWORK_REQUIRED = "rework_required", "Rework Required"
    READY_FOR_DELIVERY = "ready_for_delivery", "Ready for Delivery"
    DELIVERED = "delivered", "Delivered"
    CLOSED = "closed", "Closed"


REPAIR_VALID_TRANSITIONS = {
    RepairStatus.PENDING: [RepairStatus.SCHEDULED, RepairStatus.IN_PROGRESS, RepairStatus.REPAIR_IN_PROGRESS, RepairStatus.CLOSED],
    RepairStatus.SCHEDULED: [RepairStatus.IN_PROGRESS, RepairStatus.REPAIR_IN_PROGRESS, RepairStatus.PENDING],
    RepairStatus.IN_PROGRESS: [RepairStatus.COMPLETED, RepairStatus.REWORK, RepairStatus.REPAIR_COMPLETED, RepairStatus.ON_HOLD],
    RepairStatus.COMPLETED: [RepairStatus.REWORK, RepairStatus.CLOSED, RepairStatus.IN_PROGRESS],
    RepairStatus.REWORK: [RepairStatus.IN_PROGRESS, RepairStatus.COMPLETED],
    RepairStatus.AWAITING_DEVICE: [RepairStatus.RECEIVED, RepairStatus.IN_PROGRESS, RepairStatus.PENDING],
    RepairStatus.RECEIVED: [RepairStatus.INSPECTION_PENDING, RepairStatus.IN_PROGRESS],
    RepairStatus.INSPECTION_PENDING: [RepairStatus.DIAGNOSIS_IN_PROGRESS, RepairStatus.IN_PROGRESS],
    RepairStatus.DIAGNOSIS_IN_PROGRESS: [RepairStatus.DIAGNOSIS_COMPLETED, RepairStatus.IN_PROGRESS],
    RepairStatus.DIAGNOSIS_COMPLETED: [RepairStatus.QUOTATION_PENDING, RepairStatus.IN_PROGRESS],
    RepairStatus.QUOTATION_PENDING: [RepairStatus.AWAITING_APPROVAL, RepairStatus.IN_PROGRESS],
    RepairStatus.AWAITING_APPROVAL: [RepairStatus.APPROVED, RepairStatus.READY_FOR_DELIVERY, RepairStatus.IN_PROGRESS],
    RepairStatus.APPROVED: [RepairStatus.REPAIR_IN_PROGRESS, RepairStatus.IN_PROGRESS],
    RepairStatus.REPAIR_IN_PROGRESS: [RepairStatus.WAITING_FOR_PARTS, RepairStatus.ON_HOLD, RepairStatus.REPAIR_COMPLETED, RepairStatus.COMPLETED, RepairStatus.REWORK],
    RepairStatus.WAITING_FOR_PARTS: [RepairStatus.REPAIR_IN_PROGRESS, RepairStatus.ON_HOLD, RepairStatus.IN_PROGRESS],
    RepairStatus.ON_HOLD: [RepairStatus.REPAIR_IN_PROGRESS, RepairStatus.IN_PROGRESS, RepairStatus.CLOSED],
    RepairStatus.REPAIR_COMPLETED: [RepairStatus.QC_PENDING, RepairStatus.COMPLETED],
    RepairStatus.QC_PENDING: [RepairStatus.QC_PASSED, RepairStatus.QC_FAILED, RepairStatus.COMPLETED],
    RepairStatus.QC_PASSED: [RepairStatus.READY_FOR_DELIVERY, RepairStatus.COMPLETED],
    RepairStatus.QC_FAILED: [RepairStatus.REWORK_REQUIRED, RepairStatus.REWORK],
    RepairStatus.REWORK_REQUIRED: [RepairStatus.REPAIR_IN_PROGRESS, RepairStatus.IN_PROGRESS],
    RepairStatus.READY_FOR_DELIVERY: [RepairStatus.DELIVERED, RepairStatus.COMPLETED],
    RepairStatus.DELIVERED: [RepairStatus.CLOSED, RepairStatus.COMPLETED],
    RepairStatus.CLOSED: [RepairStatus.REWORK],
}


class RepairPriority(models.TextChoices):
    LOW = "low", "Low"
    NORMAL = "normal", "Normal"
    HIGH = "high", "High"
    URGENT = "urgent", "Urgent"
    SAME_DAY = "same_day", "Same Day"


class RepairOrder(models.Model):
    """
    Repair order — the workshop entity.
    Created when a device is received. Linked to a Lead.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=20, unique=True, editable=False)

    lead = models.OneToOneField(
        "leads.Lead", on_delete=models.PROTECT, related_name="repair_order"
    )
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.PROTECT, related_name="repair_orders"
    )

    # Device details
    device_category = models.ForeignKey(
        "services.DeviceCategory", on_delete=models.PROTECT, null=True, blank=True
    )
    device_brand = models.ForeignKey(
        "services.DeviceBrand", on_delete=models.PROTECT, null=True, blank=True
    )
    device_model = models.ForeignKey(
        "services.DeviceModel", on_delete=models.PROTECT, null=True, blank=True
    )
    device_model_text = models.CharField(max_length=150, blank=True)
    device_color = models.CharField(max_length=50, blank=True)
    # IMEI/Serial stored only when operationally required, access-restricted
    device_imei_encrypted = models.CharField(max_length=500, blank=True, help_text="Encrypted IMEI/Serial if required")

    # Intake
    intake_condition = models.TextField(help_text="Device condition when received")
    intake_accessories = models.TextField(blank=True)
    received_at = models.DateTimeField(null=True, blank=True)
    received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="received_repairs",
    )

    # Assignment
    assigned_technician = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_repairs",
        limit_choices_to={"role": "technician"},
    )
    priority = models.CharField(max_length=15, choices=RepairPriority.choices, default=RepairPriority.NORMAL)

    # Status
    status = models.CharField(
        max_length=30, choices=RepairStatus.choices, default=RepairStatus.AWAITING_DEVICE
    )

    # Booking Date
    booking_date = models.DateField(default=timezone.now)

    # Diagnosis & Confirmed Issue
    diagnosis = models.TextField(blank=True)
    confirmed_issue = models.TextField(blank=True, help_text="Confirmed issue after technician inspection")
    diagnosis_completed_at = models.DateTimeField(null=True, blank=True)

    # Work & Parts Tracking
    work_performed = models.TextField(blank=True, help_text="Work done by technician")
    parts_used_notes = models.TextField(blank=True, help_text="Parts/products used during repair")
    rework_reason = models.TextField(blank=True, help_text="Reason if rework is required")

    # Pricing, Vendor & Internal Profit Tracking
    part_name = models.CharField(max_length=200, blank=True, help_text="Product / Part name purchased from vendor")
    vendor_name = models.CharField(max_length=200, blank=True, help_text="Product distributor / vendor name")
    vendor_cost = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00"),
        help_text="Vendor/Distributor purchase cost (internal)"
    )
    product_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    service_charges = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total_customer_charge = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    internal_profit = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00"),
        help_text="Strictly internal profit — never display on customer invoices or customer-facing pages"
    )

    # Internal cost — access-restricted to admin and finance only
    internal_estimated_cost = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Internal estimate — never expose to customers or non-finance staff"
    )
    actual_parts_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    actual_labor_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # Archival
    is_archived = models.BooleanField(default=False)

    # Completion
    repair_completed_at = models.DateTimeField(null=True, blank=True)
    qc_passed_at = models.DateTimeField(null=True, blank=True)
    qc_performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="qc_repairs",
    )
    qc_notes = models.TextField(blank=True)

    # Notes
    technician_notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "repairs_order"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["assigned_technician", "status"]),
            models.Index(fields=["order_number"]),
        ]

    def __str__(self):
        return f"[{self.order_number}] {self.get_status_display()}"

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = self._generate_order_number()
        # Automatically compute total customer charge from product price + service charge
        if self.product_price is not None and self.service_charges is not None:
            self.total_customer_charge = self.product_price + self.service_charges
        super().save(*args, **kwargs)

    def _generate_order_number(self):
        import random
        prefix = "RO"
        date_part = timezone.now().strftime("%y%m%d")
        rand_part = str(random.randint(1000, 9999))
        return f"{prefix}-{date_part}-{rand_part}"

    def transition_to(self, new_status, performed_by=None, notes=""):
        allowed = REPAIR_VALID_TRANSITIONS.get(self.status, [])
        if new_status not in [s.value for s in allowed]:
            raise ValidationError(
                f"Cannot transition repair from '{self.get_status_display()}' "
                f"to '{RepairStatus(new_status).label}'."
            )
        old_status = self.status
        self.status = new_status

        # Record timestamps for key transitions
        now = timezone.now()
        if new_status == RepairStatus.RECEIVED:
            self.received_at = now
        elif new_status == RepairStatus.DIAGNOSIS_COMPLETED:
            self.diagnosis_completed_at = now
        elif new_status == RepairStatus.REPAIR_COMPLETED:
            self.repair_completed_at = now
        elif new_status == RepairStatus.QC_PASSED:
            self.qc_passed_at = now
            self.qc_performed_by = performed_by

        self.save()
        RepairStatusHistory.objects.create(
            repair_order=self, from_status=old_status, to_status=new_status,
            performed_by=performed_by, notes=notes,
        )


class RepairStatusHistory(models.Model):
    """Append-only repair status history."""

    repair_order = models.ForeignKey(RepairOrder, on_delete=models.CASCADE, related_name="status_history")
    from_status = models.CharField(max_length=30)
    to_status = models.CharField(max_length=30)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "repairs_status_history"
        ordering = ["timestamp"]


class RepairWorkLog(models.Model):
    """Log of repair actions performed by technician."""

    repair_order = models.ForeignKey(RepairOrder, on_delete=models.CASCADE, related_name="work_log")
    technician = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    description = models.TextField()
    time_spent_minutes = models.PositiveIntegerField(null=True, blank=True)
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "repairs_work_log"
        ordering = ["logged_at"]


class ReworkCase(models.Model):
    """Rework case — when a repair fails QC or customer reports recurring problem."""

    class ReworkReason(models.TextChoices):
        ORIGINAL_ISSUE_PERSISTS = "original_persists", "Original Issue Persists"
        NEW_ISSUE_DISCOVERED = "new_issue", "New Issue Discovered"
        PART_FAILURE = "part_failure", "Part Failure"
        QC_FAILURE = "qc_failure", "Quality Check Failure"
        CUSTOMER_CONCERN = "customer_concern", "Customer-Reported Concern"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    repair_order = models.ForeignKey(RepairOrder, on_delete=models.PROTECT, related_name="rework_cases")
    reason = models.CharField(max_length=30, choices=ReworkReason.choices)
    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="reported_reworks",
    )
    description = models.TextField()
    assigned_technician = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="rework_cases",
        limit_choices_to={"role": "technician"},
    )

    # Timeline
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Outcome
    outcome_notes = models.TextField(blank=True)
    qc_passed = models.BooleanField(null=True)
    qc_notes = models.TextField(blank=True)

    # Cost (internal only)
    additional_parts_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    additional_labor_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    customer_notified = models.BooleanField(default=False)
    customer_communication_notes = models.TextField(blank=True)

    class Meta:
        db_table = "repairs_rework_case"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Rework for {self.repair_order.order_number} — {self.get_reason_display()}"
