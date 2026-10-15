"""
Payment models — financial tracking.
Uses Decimal arithmetic exclusively. Never float.
"""
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from decimal import Decimal
import uuid


class PaymentStatus(models.TextChoices):
    NOT_DUE = "not_due", "Not Due"
    PENDING = "pending", "Pending"
    PARTIALLY_PAID = "partially_paid", "Partially Paid"
    PAID = "paid", "Paid"
    REFUND_PENDING = "refund_pending", "Refund Pending"
    PARTIALLY_REFUNDED = "partially_refunded", "Partially Refunded"
    REFUNDED = "refunded", "Refunded"
    FAILED = "failed", "Failed"


class PaymentMethod(models.TextChoices):
    CASH = "cash", "Cash"
    UPI = "upi", "UPI"
    NEFT = "neft", "NEFT / Bank Transfer"
    CARD = "card", "Debit/Credit Card"
    CHEQUE = "cheque", "Cheque"
    OTHER = "other", "Other"


class Invoice(models.Model):
    """Invoice linked to an approved quotation and repair order."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(max_length=25, unique=True, editable=False)
    repair_order = models.OneToOneField(
        "repairs.RepairOrder", on_delete=models.PROTECT, related_name="invoice"
    )
    quotation = models.ForeignKey(
        "quotations.Quotation", on_delete=models.SET_NULL, related_name="invoices",
        null=True, blank=True,
    )
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.PROTECT, related_name="invoices"
    )
    lead = models.ForeignKey(
        "leads.Lead", on_delete=models.SET_NULL, related_name="invoices",
        null=True, blank=True,
    )

    # Line item amounts (No profit fields here — strictly customer facing breakdown)
    product_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    service_charges = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))

    # Service & Device context
    device_details = models.CharField(max_length=255, blank=True)
    reported_issue = models.TextField(blank=True)
    confirmed_issue = models.TextField(blank=True)
    work_performed = models.TextField(blank=True)
    technician_name = models.CharField(max_length=150, blank=True)
    terms_conditions = models.TextField(blank=True)

    # Document & Revision tracking
    pdf_file = models.FileField(upload_to="invoices/pdfs/", null=True, blank=True)
    is_revised = models.BooleanField(default=False)
    revision_number = models.PositiveIntegerField(default=1)

    # Amounts — all Decimal
    approved_quotation_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    final_billed_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    outstanding_balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))

    status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PAID
    )

    issued_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)

    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )

    class Meta:
        db_table = "payments_invoice"
        ordering = ["-issued_at"]

    def __str__(self):
        return f"{self.invoice_number} — ₹{self.final_billed_amount}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            from django.utils import timezone
            import random
            date_part = timezone.now().strftime("%y%m%d")
            self.invoice_number = f"INV-{date_part}-{random.randint(1000,9999)}"
        self.outstanding_balance = self.final_billed_amount - self.amount_paid
        super().save(*args, **kwargs)

    def update_payment_status(self):
        """Recalculate payment status from recorded transactions."""
        paid = self.payment_transactions.filter(
            is_refund=False, is_confirmed=True
        ).aggregate(
            total=models.Sum("amount")
        )["total"] or Decimal("0.00")

        refunded = self.payment_transactions.filter(
            is_refund=True, is_confirmed=True
        ).aggregate(
            total=models.Sum("amount")
        )["total"] or Decimal("0.00")

        self.amount_paid = paid - refunded
        self.outstanding_balance = self.final_billed_amount - self.amount_paid

        if self.amount_paid <= 0:
            self.status = PaymentStatus.PENDING
        elif self.amount_paid >= self.final_billed_amount:
            self.status = PaymentStatus.PAID
        else:
            self.status = PaymentStatus.PARTIALLY_PAID

        self.save(update_fields=["amount_paid", "outstanding_balance", "status"])


class PaymentTransaction(models.Model):
    """
    Individual payment or refund transaction.
    Never stores card numbers, CVV, or banking passwords.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name="payment_transactions")

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    transaction_reference = models.CharField(max_length=200, blank=True)
    is_refund = models.BooleanField(default=False)
    is_confirmed = models.BooleanField(
        default=False,
        help_text="True only after server-side verification. Not simply because customer clicked pay."
    )
    payment_timestamp = models.DateTimeField(null=True, blank=True)
    confirmation_notes = models.TextField(blank=True)

    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payments_transaction"
        ordering = ["-created_at"]

    def __str__(self):
        prefix = "Refund" if self.is_refund else "Payment"
        return f"{prefix} ₹{self.amount} via {self.get_method_display()}"
