"""
Pickup and Delivery management models.
"""
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid


class PickupStatus(models.TextChoices):
    PENDING_ASSIGNMENT = "pending_assignment", "Pending Assignment"
    AWAITING_AREA_CONFIRMATION = "awaiting_area_confirmation", "Awaiting Area Confirmation"
    SCHEDULED = "scheduled", "Scheduled"
    CONFIRMED = "confirmed", "Confirmed"
    ASSIGNED = "assigned", "Assigned to Executive"
    ON_THE_WAY = "on_the_way", "On the Way"
    ARRIVED = "arrived", "Arrived"
    DEVICE_COLLECTED = "device_collected", "Device Collected"
    FAILED_ATTEMPT = "failed_attempt", "Failed Attempt"
    RESCHEDULED = "rescheduled", "Rescheduled"
    CANCELLED = "cancelled", "Cancelled"


PICKUP_VALID_TRANSITIONS = {
    PickupStatus.PENDING_ASSIGNMENT: [PickupStatus.AWAITING_AREA_CONFIRMATION, PickupStatus.SCHEDULED, PickupStatus.CANCELLED],
    PickupStatus.AWAITING_AREA_CONFIRMATION: [PickupStatus.SCHEDULED, PickupStatus.CANCELLED],
    PickupStatus.SCHEDULED: [PickupStatus.CONFIRMED, PickupStatus.RESCHEDULED, PickupStatus.CANCELLED],
    PickupStatus.CONFIRMED: [PickupStatus.ASSIGNED, PickupStatus.RESCHEDULED, PickupStatus.CANCELLED],
    PickupStatus.ASSIGNED: [PickupStatus.ON_THE_WAY, PickupStatus.RESCHEDULED, PickupStatus.CANCELLED],
    PickupStatus.ON_THE_WAY: [PickupStatus.ARRIVED, PickupStatus.FAILED_ATTEMPT],
    PickupStatus.ARRIVED: [PickupStatus.DEVICE_COLLECTED, PickupStatus.FAILED_ATTEMPT],
    PickupStatus.DEVICE_COLLECTED: [],
    PickupStatus.FAILED_ATTEMPT: [PickupStatus.RESCHEDULED, PickupStatus.CANCELLED],
    PickupStatus.RESCHEDULED: [PickupStatus.CONFIRMED, PickupStatus.CANCELLED],
    PickupStatus.CANCELLED: [],
}


class PickupJob(models.Model):
    """Pickup job — device collection from customer."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_number = models.CharField(max_length=20, unique=True, editable=False)
    lead = models.OneToOneField(
        "leads.Lead", on_delete=models.PROTECT, related_name="pickup_job"
    )

    # Customer details (denormalized for executive access without full customer record)
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=20)

    # Pickup location
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True)
    area = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    city = models.CharField(max_length=50, default="Bangalore")
    landmark = models.CharField(max_length=255, blank=True)

    # Assignment
    assigned_executive = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pickup_jobs",
        limit_choices_to={"role": "pickup_executive"},
    )

    # Scheduling
    scheduled_date = models.DateField(null=True, blank=True)
    scheduled_time_window = models.CharField(
        max_length=50,
        blank=True,
        choices=[
            ("morning", "Morning (9AM–12PM)"),
            ("afternoon", "Afternoon (12PM–4PM)"),
            ("evening", "Evening (4PM–8PM)"),
        ],
    )
    confirmed_at = models.DateTimeField(null=True, blank=True)

    # Execution
    actual_pickup_at = models.DateTimeField(null=True, blank=True)
    attempt_count = models.PositiveSmallIntegerField(default=0)
    failure_reason = models.TextField(blank=True)

    # Device condition at collection
    condition_at_collection = models.TextField(blank=True)
    accessories_collected = models.TextField(blank=True, help_text="List of accessories collected with device")
    has_photos = models.BooleanField(default=False)

    # Notes
    handover_notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    status = models.CharField(
        max_length=30, choices=PickupStatus.choices, default=PickupStatus.PENDING_ASSIGNMENT
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pickups_job"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["scheduled_date"]),
            models.Index(fields=["assigned_executive", "status"]),
        ]

    def __str__(self):
        return f"[{self.job_number}] {self.customer_name} — {self.get_status_display()}"

    def save(self, *args, **kwargs):
        if not self.job_number:
            self.job_number = self._generate_job_number()
        super().save(*args, **kwargs)

    def _generate_job_number(self):
        from django.utils import timezone
        import random
        prefix = "PKP"
        date_part = timezone.now().strftime("%y%m%d")
        rand_part = str(random.randint(100, 999))
        return f"{prefix}-{date_part}-{rand_part}"

    def transition_to(self, new_status, performed_by=None, notes=""):
        allowed = PICKUP_VALID_TRANSITIONS.get(self.status, [])
        if new_status not in [s.value for s in allowed]:
            raise ValidationError(
                f"Cannot transition pickup from '{self.get_status_display()}' "
                f"to '{PickupStatus(new_status).label}'."
            )
        old_status = self.status
        self.status = new_status
        if new_status == PickupStatus.DEVICE_COLLECTED:
            self.actual_pickup_at = timezone.now()
        self.save(update_fields=["status", "actual_pickup_at", "updated_at"])
        PickupStatusHistory.objects.create(
            job=self, from_status=old_status, to_status=new_status,
            performed_by=performed_by, notes=notes,
        )


class PickupStatusHistory(models.Model):
    """Append-only pickup status history."""

    job = models.ForeignKey(PickupJob, on_delete=models.CASCADE, related_name="status_history")
    from_status = models.CharField(max_length=30)
    to_status = models.CharField(max_length=30)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "pickups_status_history"
        ordering = ["timestamp"]


class PickupPhoto(models.Model):
    """Photos taken at device collection."""

    job = models.ForeignKey(PickupJob, on_delete=models.CASCADE, related_name="photos")
    photo = models.ImageField(upload_to="pickups/photos/%Y/%m/")
    caption = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "pickups_photo"


# ─── Delivery ─────────────────────────────────────────────────────────────────

class DeliveryStatus(models.TextChoices):
    PENDING = "pending", "Delivery Pending"
    SCHEDULED = "scheduled", "Scheduled"
    ASSIGNED = "assigned", "Assigned"
    OUT_FOR_DELIVERY = "out_for_delivery", "Out for Delivery"
    DELIVERED = "delivered", "Delivered"
    FAILED_ATTEMPT = "failed_attempt", "Failed Attempt"
    RESCHEDULED = "rescheduled", "Rescheduled"
    RETURNED_TO_SERVICE_CENTER = "returned", "Returned to Service Center"


DELIVERY_VALID_TRANSITIONS = {
    DeliveryStatus.PENDING: [DeliveryStatus.SCHEDULED, DeliveryStatus.RETURNED_TO_SERVICE_CENTER],
    DeliveryStatus.SCHEDULED: [DeliveryStatus.ASSIGNED, DeliveryStatus.RESCHEDULED],
    DeliveryStatus.ASSIGNED: [DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.RESCHEDULED],
    DeliveryStatus.OUT_FOR_DELIVERY: [DeliveryStatus.DELIVERED, DeliveryStatus.FAILED_ATTEMPT],
    DeliveryStatus.FAILED_ATTEMPT: [DeliveryStatus.RESCHEDULED, DeliveryStatus.RETURNED_TO_SERVICE_CENTER],
    DeliveryStatus.RESCHEDULED: [DeliveryStatus.ASSIGNED],
    DeliveryStatus.DELIVERED: [],
    DeliveryStatus.RETURNED_TO_SERVICE_CENTER: [],
}


class DeliveryJob(models.Model):
    """Delivery job — returning repaired device to customer."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    job_number = models.CharField(max_length=20, unique=True, editable=False)
    lead = models.OneToOneField(
        "leads.Lead", on_delete=models.PROTECT, related_name="delivery_job"
    )
    repair_order = models.OneToOneField(
        "repairs.RepairOrder", on_delete=models.PROTECT, related_name="delivery_job"
    )

    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=20)

    delivery_address_line1 = models.CharField(max_length=255)
    delivery_address_line2 = models.CharField(max_length=255, blank=True)
    area = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    landmark = models.CharField(max_length=255, blank=True)

    assigned_executive = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="delivery_jobs",
        limit_choices_to={"role": "pickup_executive"},
    )

    scheduled_date = models.DateField(null=True, blank=True)
    scheduled_time_window = models.CharField(max_length=50, blank=True)
    actual_delivery_at = models.DateTimeField(null=True, blank=True)

    attempt_count = models.PositiveSmallIntegerField(default=0)
    failure_reason = models.TextField(blank=True)
    delivery_notes = models.TextField(blank=True)
    internal_notes = models.TextField(blank=True)

    status = models.CharField(
        max_length=30, choices=DeliveryStatus.choices, default=DeliveryStatus.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pickups_delivery_job"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.job_number:
            from django.utils import timezone
            import random
            self.job_number = f"DLV-{timezone.now().strftime('%y%m%d')}-{random.randint(100,999)}"
        super().save(*args, **kwargs)

    def transition_to(self, new_status, performed_by=None, notes=""):
        allowed = DELIVERY_VALID_TRANSITIONS.get(self.status, [])
        if new_status not in [s.value for s in allowed]:
            raise ValidationError(
                f"Cannot transition delivery from '{self.get_status_display()}' "
                f"to '{DeliveryStatus(new_status).label}'."
            )
        old_status = self.status
        self.status = new_status
        if new_status == DeliveryStatus.DELIVERED:
            self.actual_delivery_at = timezone.now()
        self.save(update_fields=["status", "actual_delivery_at", "updated_at"])
        DeliveryStatusHistory.objects.create(
            job=self, from_status=old_status, to_status=new_status,
            performed_by=performed_by, notes=notes,
        )


class DeliveryStatusHistory(models.Model):
    """Append-only delivery status history."""

    job = models.ForeignKey(DeliveryJob, on_delete=models.CASCADE, related_name="status_history")
    from_status = models.CharField(max_length=30)
    to_status = models.CharField(max_length=30)
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "pickups_delivery_status_history"
        ordering = ["timestamp"]
