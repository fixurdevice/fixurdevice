"""
Quotation models — customer-facing quotation with versioning and approval tracking.
Internal costs are strictly separated from customer quotation amounts.
"""
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from decimal import Decimal
import uuid


class QuotationStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    SENT = "sent", "Sent to Customer"
    AWAITING_APPROVAL = "awaiting_approval", "Awaiting Customer Approval"
    APPROVED = "approved", "Approved by Customer"
    REJECTED = "rejected", "Rejected by Customer"
    EXPIRED = "expired", "Expired"
    SUPERSEDED = "superseded", "Superseded by Revision"
    CANCELLED = "cancelled", "Cancelled"


class Quotation(models.Model):
    """
    Customer-facing quotation.
    Version-controlled — a new version is created when scope/amount changes.
    Internal costs are NEVER stored here (use RepairOrder fields for that).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quotation_number = models.CharField(max_length=25, unique=True, editable=False)
    version = models.PositiveSmallIntegerField(default=1)

    repair_order = models.ForeignKey(
        "repairs.RepairOrder", on_delete=models.PROTECT, related_name="quotations"
    )
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.PROTECT, related_name="quotations"
    )

    status = models.CharField(
        max_length=20, choices=QuotationStatus.choices, default=QuotationStatus.DRAFT
    )

    # Quotation details — customer-visible
    notes_to_customer = models.TextField(blank=True)
    terms = models.TextField(blank=True)
    valid_until = models.DateField(null=True, blank=True)
    expected_turnaround_days = models.PositiveSmallIntegerField(null=True, blank=True)

    # Totals — computed from line items but stored for integrity
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))

    # Workflow
    prepared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="prepared_quotations",
    )
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="sent_quotations",
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    sent_to_phone = models.CharField(max_length=20, blank=True)
    sent_to_email = models.EmailField(blank=True)

    # Approval
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by_name = models.CharField(max_length=150, blank=True, help_text="Customer name who approved")
    rejection_reason = models.TextField(blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)

    # Superseded by a newer version
    superseded_by = models.OneToOneField(
        "self", on_delete=models.SET_NULL, null=True, blank=True, related_name="supersedes"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "quotations_quotation"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["repair_order", "version"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.quotation_number} v{self.version} — {self.get_status_display()}"

    def save(self, *args, **kwargs):
        if not self.quotation_number:
            from django.utils import timezone
            import random
            date_part = timezone.now().strftime("%y%m%d")
            self.quotation_number = f"QT-{date_part}-{random.randint(1000,9999)}"
        super().save(*args, **kwargs)

    def compute_totals(self):
        """Recalculate totals from line items."""
        items = self.line_items.all()
        self.subtotal = sum(item.line_total for item in items)
        self.tax_amount = Decimal("0.00")  # Add GST logic if required
        self.total_amount = self.subtotal + self.tax_amount
        self.save(update_fields=["subtotal", "tax_amount", "total_amount", "updated_at"])

    def mark_sent(self, sent_by, phone="", email=""):
        """Mark this quotation as sent — only allowed from DRAFT state."""
        if self.status != QuotationStatus.DRAFT:
            raise ValidationError("Only draft quotations can be sent.")
        from django.utils import timezone
        self.status = QuotationStatus.SENT
        self.sent_by = sent_by
        self.sent_at = timezone.now()
        self.sent_to_phone = phone
        self.sent_to_email = email
        self.save()

    def record_approval(self, approved_by_name=""):
        """Record customer approval."""
        if self.status not in [QuotationStatus.SENT, QuotationStatus.AWAITING_APPROVAL]:
            raise ValidationError("Only sent quotations can be approved.")
        from django.utils import timezone
        self.status = QuotationStatus.APPROVED
        self.approved_at = timezone.now()
        self.approved_by_name = approved_by_name
        self.save()

    def record_rejection(self, reason=""):
        """Record customer rejection."""
        if self.status not in [QuotationStatus.SENT, QuotationStatus.AWAITING_APPROVAL]:
            raise ValidationError("Only sent quotations can be rejected.")
        from django.utils import timezone
        self.status = QuotationStatus.REJECTED
        self.rejected_at = timezone.now()
        self.rejection_reason = reason
        self.save()

    def create_revision(self, prepared_by):
        """Create a new version of this quotation. Marks this one as superseded."""
        if self.status not in [QuotationStatus.APPROVED, QuotationStatus.REJECTED, QuotationStatus.SENT]:
            raise ValidationError("Revisions can only be made from sent/approved/rejected quotations.")
        new_quotation = Quotation.objects.create(
            repair_order=self.repair_order,
            customer=self.customer,
            version=self.version + 1,
            prepared_by=prepared_by,
            notes_to_customer=self.notes_to_customer,
            terms=self.terms,
        )
        self.status = QuotationStatus.SUPERSEDED
        self.superseded_by = new_quotation
        self.save(update_fields=["status", "superseded_by"])
        return new_quotation


class QuotationLineItem(models.Model):
    """Line item in a customer quotation."""

    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE, related_name="line_items")
    description = models.CharField(max_length=255)
    quantity = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("1.00"))
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)
    item_type = models.CharField(
        max_length=20,
        choices=[("part", "Part"), ("labour", "Labour"), ("other", "Other")],
        default="part",
    )
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "quotations_line_item"
        ordering = ["display_order"]

    def save(self, *args, **kwargs):
        self.line_total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.description} × {self.quantity} = ₹{self.line_total}"
