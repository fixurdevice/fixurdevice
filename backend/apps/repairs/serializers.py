"""
Serializers for RepairOrder workshop & CRM bookings entity.
Provides explicit pricing breakdown, technician assignment, and work tracking.
"""
from rest_framework import serializers
from .models import RepairOrder, RepairStatus, RepairPriority


class RepairOrderSerializer(serializers.ModelSerializer):
    booking_id = serializers.CharField(source="order_number", read_only=True)
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    customer_phone = serializers.CharField(source="customer.phone", read_only=True)
    customer_email = serializers.CharField(source="customer.email", read_only=True)
    customer_address = serializers.SerializerMethodField()
    linked_lead_id = serializers.SerializerMethodField()
    linked_lead_reference = serializers.SerializerMethodField()
    assigned_technician_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    priority_display = serializers.CharField(source="get_priority_display", read_only=True)
    vendor_cost = serializers.SerializerMethodField()
    product_price = serializers.SerializerMethodField()
    service_charges = serializers.SerializerMethodField()
    total_customer_charge = serializers.SerializerMethodField()
    internal_profit = serializers.SerializerMethodField()
    has_invoice = serializers.SerializerMethodField()
    invoice_id = serializers.SerializerMethodField()
    invoice_number = serializers.SerializerMethodField()
    device = serializers.CharField(source="device_model_text", read_only=True)
    reported_issue = serializers.CharField(source="intake_condition", read_only=True)

    class Meta:
        model = RepairOrder
        fields = [
            "id", "order_number", "booking_id", "booking_date",
            "customer", "customer_name", "customer_phone", "customer_email", "customer_address",
            "lead", "linked_lead_id", "linked_lead_reference",
            "device", "device_model_text", "reported_issue", "intake_condition",
            "confirmed_issue", "work_performed", "parts_used_notes", "rework_reason",
            "assigned_technician", "assigned_technician_name",
            "status", "status_display", "priority", "priority_display",
            "part_name", "vendor_name", "vendor_cost",
            "product_price", "service_charges", "total_customer_charge",
            "internal_profit", "has_invoice", "invoice_id", "invoice_number",
            "internal_notes", "technician_notes", "is_archived",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "order_number", "booking_id", "created_at", "updated_at"]

    def get_customer_address(self, obj):
        if obj.customer and obj.customer.address_line1:
            return obj.customer.address_line1
        if obj.lead and obj.lead.pickup_address:
            return obj.lead.pickup_address
        return "Bangalore, Karnataka"

    def get_linked_lead_id(self, obj):
        return str(obj.lead.id) if obj.lead else None

    def get_linked_lead_reference(self, obj):
        return obj.lead.reference if obj.lead else ""

    def get_assigned_technician_name(self, obj):
        if obj.assigned_technician:
            return obj.assigned_technician.full_name or obj.assigned_technician.email
        return "Unassigned"

    def get_vendor_cost(self, obj):
        if obj.vendor_cost is not None and obj.vendor_cost > 0:
            return float(obj.vendor_cost)
        if obj.actual_parts_cost is not None and obj.actual_parts_cost > 0:
            return float(obj.actual_parts_cost)
        return float(obj.product_price or 0.0)

    def get_product_price(self, obj):
        if obj.product_price and obj.product_price > 0:
            return float(obj.product_price)
        if obj.actual_parts_cost:
            return float(obj.actual_parts_cost)
        return 0.0

    def get_service_charges(self, obj):
        if obj.service_charges and obj.service_charges > 0:
            return float(obj.service_charges)
        if obj.actual_labor_cost:
            return float(obj.actual_labor_cost)
        return 0.0

    def get_total_customer_charge(self, obj):
        if obj.total_customer_charge and obj.total_customer_charge > 0:
            return float(obj.total_customer_charge)
        prod = self.get_product_price(obj)
        serv = self.get_service_charges(obj)
        return float(prod + serv)

    def get_internal_profit(self, obj):
        if obj.internal_profit is not None and obj.internal_profit > 0:
            return float(obj.internal_profit)
        tot = self.get_total_customer_charge(obj)
        vcost = self.get_vendor_cost(obj)
        if tot > 0:
            return max(0.0, float(tot - vcost))
        # Default internal profit to service charges if not explicitly given
        return self.get_service_charges(obj)

    def get_has_invoice(self, obj):
        return hasattr(obj, "invoice") and obj.invoice is not None

    def get_invoice_id(self, obj):
        return str(obj.invoice.id) if hasattr(obj, "invoice") and obj.invoice else None

    def get_invoice_number(self, obj):
        return obj.invoice.invoice_number if hasattr(obj, "invoice") and obj.invoice else None
