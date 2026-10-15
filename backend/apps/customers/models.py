"""
Customer model — represents the end-customer (device owner).
Separate from CRM staff User model.
"""
from django.db import models
import uuid


class Customer(models.Model):
    """End-customer who submitted a repair enquiry."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=150, db_index=True)
    phone = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(blank=True, db_index=True)
    alternate_phone = models.CharField(max_length=20, blank=True)

    # Bangalore address info
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    area = models.CharField(max_length=100, blank=True, db_index=True)
    pincode = models.CharField(max_length=10, blank=True, db_index=True)
    city = models.CharField(max_length=50, default="Bangalore")
    state = models.CharField(max_length=50, default="Karnataka")

    preferred_contact_method = models.CharField(
        max_length=20,
        choices=[
            ("phone", "Phone Call"),
            ("whatsapp", "WhatsApp"),
            ("email", "Email"),
            ("sms", "SMS"),
        ],
        default="phone",
    )

    # Consent and privacy
    privacy_consent = models.BooleanField(default=False)
    marketing_consent = models.BooleanField(default=False)
    consent_timestamp = models.DateTimeField(null=True, blank=True)

    # Internal notes
    internal_notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "customers_customer"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["phone"]),
            models.Index(fields=["email"]),
            models.Index(fields=["pincode"]),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.phone})"

    @property
    def display_phone(self):
        """Formatted phone for click-to-call."""
        phone = self.phone.replace(" ", "").replace("-", "")
        if not phone.startswith("+"):
            phone = "+91" + phone.lstrip("0")
        return phone

    @property
    def whatsapp_url(self):
        phone = self.display_phone.replace("+", "")
        return f"https://wa.me/{phone}"
