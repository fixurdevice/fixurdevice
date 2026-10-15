"""
Customer feedback models.
"""
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Feedback(models.Model):
    """Customer feedback after repair completion."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    repair_order = models.OneToOneField(
        "repairs.RepairOrder", on_delete=models.PROTECT, related_name="feedback"
    )
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.PROTECT, related_name="feedback"
    )

    # Request
    request_sent_at = models.DateTimeField(null=True, blank=True)
    request_sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="feedback_requests_sent",
    )

    # Response
    responded_at = models.DateTimeField(null=True, blank=True)
    rating = models.PositiveSmallIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    written_feedback = models.TextField(blank=True)

    # Privacy
    consent_to_publish = models.BooleanField(
        default=False,
        help_text="Customer has explicitly consented to their feedback being published publicly",
    )

    # Internal
    internal_notes = models.TextField(blank=True)
    is_complaint = models.BooleanField(default=False)
    complaint_resolved = models.BooleanField(default=False)
    complaint_resolution_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "feedback_feedback"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Feedback for {self.repair_order.order_number} — Rating: {self.rating or 'Pending'}"

    @property
    def is_pending(self):
        return self.responded_at is None
