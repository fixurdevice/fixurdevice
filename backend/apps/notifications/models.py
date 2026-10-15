"""
Notification log models — email and communication attempt tracking.
"""
from django.db import models
from django.conf import settings
import uuid


class NotificationLog(models.Model):
    """Record of every notification attempt — for retry and audit."""

    class NotificationType(models.TextChoices):
        NEW_LEAD = "new_lead", "New Lead Received"
        LEAD_ASSIGNED = "lead_assigned", "Lead Assigned"
        PICKUP_SCHEDULED = "pickup_scheduled", "Pickup Scheduled"
        PICKUP_RESCHEDULED = "pickup_rescheduled", "Pickup Rescheduled"
        DEVICE_RECEIVED = "device_received", "Device Received"
        DIAGNOSIS_COMPLETED = "diagnosis_completed", "Diagnosis Completed"
        QUOTATION_SENT = "quotation_sent", "Quotation Sent"
        QUOTATION_REVISED = "quotation_revised", "Quotation Revised"
        APPROVAL_RECEIVED = "approval_received", "Customer Approval Received"
        REPAIR_STATUS_UPDATE = "repair_status", "Repair Status Update"
        REPAIR_COMPLETED = "repair_completed", "Repair Completed"
        DELIVERY_SCHEDULED = "delivery_scheduled", "Delivery Scheduled"
        DELIVERY_COMPLETED = "delivery_completed", "Delivery Completed"
        FEEDBACK_REQUEST = "feedback_request", "Feedback Requested"
        FOLLOWUP_OVERDUE = "followup_overdue", "Follow-up Overdue"

    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"
        WHATSAPP = "whatsapp", "WhatsApp"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"
        RETRYING = "retrying", "Retrying"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    channel = models.CharField(max_length=20, choices=Channel.choices, default=Channel.EMAIL)

    # Recipient — do NOT store PII in logs beyond what is needed for retry
    recipient_email = models.EmailField(blank=True)
    recipient_phone = models.CharField(max_length=20, blank=True)
    is_customer = models.BooleanField(default=True)

    # Linked record (generic)
    lead_id = models.UUIDField(null=True, blank=True, db_index=True)
    repair_order_id = models.UUIDField(null=True, blank=True)

    # Delivery
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    attempt_count = models.PositiveSmallIntegerField(default=0)
    last_attempt_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(blank=True)

    # Task reference (Celery)
    celery_task_id = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications_log"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "attempt_count"]),
            models.Index(fields=["lead_id"]),
        ]

    def __str__(self):
        return f"{self.get_notification_type_display()} → {self.recipient_email or self.recipient_phone} [{self.status}]"
