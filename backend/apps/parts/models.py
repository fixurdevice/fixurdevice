"""
Parts and expense tracking models.
"""
from django.db import models
from django.conf import settings
from decimal import Decimal
import uuid


class Vendor(models.Model):
    """Product distributor / vendor from whom parts/products are purchased."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    contact_person = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "parts_vendor"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Part(models.Model):
    """Part catalog — available spare parts."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    vendor = models.ForeignKey(
        Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name="parts"
    )
    name = models.CharField(max_length=200)
    part_number = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    compatible_categories = models.ManyToManyField(
        "services.DeviceCategory", blank=True, related_name="parts"
    )
    compatible_models = models.ManyToManyField(
        "services.DeviceModel", blank=True, related_name="parts"
    )
    supplier = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "parts_part"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.part_number or 'No PN'})"


class PartUsage(models.Model):
    """
    Record of parts used in a specific repair order.
    Costs here are INTERNAL — access-restricted to admin and finance.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    repair_order = models.ForeignKey(
        "repairs.RepairOrder", on_delete=models.PROTECT, related_name="parts_used"
    )
    part = models.ForeignKey(Part, on_delete=models.PROTECT, null=True, blank=True)
    part_name = models.CharField(max_length=200, help_text="Free-text if part not in catalog")
    part_identifier = models.CharField(max_length=100, blank=True)
    quantity = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal("1.00"))
    supplier = models.CharField(max_length=200, blank=True)

    # Internal purchase cost — NEVER expose to customer-facing APIs
    purchase_cost = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Internal cost — finance and admin only"
    )

    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    recorded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        db_table = "parts_usage"
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.part_name or self.part} × {self.quantity} for {self.repair_order.order_number}"
