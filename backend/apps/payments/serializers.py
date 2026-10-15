"""
Serializers for payments and invoices.
Adheres strictly to financial isolation: Never exposes internal costs or profits.
"""
from decimal import Decimal
from rest_framework import serializers
from .models import Invoice, PaymentStatus


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone", read_only=True)
    customer_email = serializers.CharField(source="customer.email", read_only=True)
    customer_address = serializers.CharField(source="customer.address", read_only=True)
    repair_order_number = serializers.CharField(source="repair_order.order_number", read_only=True)
    lead_reference = serializers.SerializerMethodField()
    device = serializers.SerializerMethodField()
    issue = serializers.SerializerMethodField()
    service = serializers.SerializerMethodField()
    technician = serializers.SerializerMethodField()
    product_price = serializers.SerializerMethodField()
    total_amount = serializers.DecimalField(source="final_billed_amount", max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.DecimalField(source="final_billed_amount", max_digits=10, decimal_places=2, read_only=True)
    total = serializers.DecimalField(source="final_billed_amount", max_digits=10, decimal_places=2, read_only=True)
    warranty = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            "id", "invoice_number", "repair_order", "repair_order_number", "lead", "lead_reference",
            "customer", "customer_name", "customer_phone", "customer_email", "customer_address",
            "device", "issue", "service", "technician",
            "product_price", "service_charges", "tax_rate", "tax_amount",
            "total_amount", "subtotal", "total", "final_billed_amount", "amount_paid", "outstanding_balance",
            "status", "issued_at", "warranty", "terms_conditions", "notes", "pdf_url",
            "is_revised", "revision_number"
        ]
        read_only_fields = ["id", "invoice_number", "issued_at", "pdf_url"]

    def get_lead_reference(self, obj):
        if obj.lead:
            return obj.lead.reference
        if obj.repair_order and obj.repair_order.lead:
            return obj.repair_order.lead.reference
        return ""

    def get_device(self, obj):
        if obj.device_details:
            return obj.device_details
        if obj.repair_order:
            return obj.repair_order.device_model_text or (
                f"{obj.repair_order.device_brand} {obj.repair_order.device_model}".strip() if obj.repair_order.device_brand else "Device"
            )
        return "Device"

    def get_issue(self, obj):
        if obj.reported_issue:
            return obj.reported_issue
        if obj.repair_order:
            return obj.repair_order.intake_condition or "General Issue"
        return "General Issue"

    def get_service(self, obj):
        if obj.confirmed_issue or obj.work_performed:
            return obj.confirmed_issue or obj.work_performed
        if obj.repair_order:
            return obj.repair_order.confirmed_issue or obj.repair_order.work_performed or obj.repair_order.diagnosis
        return "Repair & Diagnostic Service"

    def get_technician(self, obj):
        if obj.technician_name:
            return obj.technician_name
        if obj.repair_order and obj.repair_order.assigned_technician:
            return obj.repair_order.assigned_technician.full_name or obj.repair_order.assigned_technician.email
        return "Certified Technician"

    def get_product_price(self, obj):
        if obj.product_price and obj.product_price > 0:
            return float(obj.product_price)
        if obj.repair_order and obj.repair_order.product_price:
            return float(obj.repair_order.product_price)
        if obj.repair_order and obj.repair_order.actual_parts_cost:
            return float(obj.repair_order.actual_parts_cost)
        return 0.0

    def get_service_charges(self, obj):
        if obj.service_charges and obj.service_charges > 0:
            return float(obj.service_charges)
        if obj.repair_order and obj.repair_order.service_charges:
            return float(obj.repair_order.service_charges)
        if obj.repair_order and obj.repair_order.actual_labor_cost:
            return float(obj.repair_order.actual_labor_cost)
        prod = self.get_product_price(obj)
        return max(0.0, float((obj.final_billed_amount or 0) - Decimal(str(prod))))

    def get_warranty(self, obj):
        return obj.notes or "90 Days Service & Replacement Warranty"

    def get_pdf_url(self, obj):
        return f"/api/v1/payments/invoices/{obj.id}/pdf/"
