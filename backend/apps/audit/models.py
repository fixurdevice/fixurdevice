"""
Audit trail models — immutable record of important CRM changes.
"""
from django.db import models
from django.conf import settings
import uuid


class AuditEvent(models.Model):
    """
    Append-only audit event. Never modified or deleted by application logic.
    """

    class EventCategory(models.TextChoices):
        LEAD = "lead", "Lead"
        CUSTOMER = "customer", "Customer"
        PICKUP = "pickup", "Pickup"
        REPAIR = "repair", "Repair"
        QUOTATION = "quotation", "Quotation"
        PAYMENT = "payment", "Payment"
        DELIVERY = "delivery", "Delivery"
        FEEDBACK = "feedback", "Feedback"
        USER = "user", "User / Auth"
        SETTINGS = "settings", "Settings"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_category = models.CharField(max_length=20, choices=EventCategory.choices)
    event_type = models.CharField(max_length=100, db_index=True)

    # Actor
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_events",
    )
    performer_name = models.CharField(max_length=150, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    # Subject — generic references
    object_type = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=100, blank=True, db_index=True)
    object_repr = models.CharField(max_length=255, blank=True)

    # Changes
    description = models.TextField()
    changes = models.JSONField(default=dict, help_text="Field-level changes as {field: [old, new]}")

    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        db_table = "audit_event"
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["event_category", "timestamp"]),
            models.Index(fields=["object_type", "object_id"]),
            models.Index(fields=["performed_by", "timestamp"]),
        ]

    def __str__(self):
        return f"[{self.timestamp:%d %b %Y %H:%M}] {self.event_type} by {self.performer_name or 'System'}"
