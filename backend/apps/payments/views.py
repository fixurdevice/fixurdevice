"""
Views for payments and invoices.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import HttpResponse, Http404
from django.conf import settings
from decimal import Decimal
import logging

from .models import Invoice, PaymentStatus
from .serializers import InvoiceSerializer
from .invoice_pdf import generate_invoice_pdf
from apps.repairs.models import RepairOrder
from apps.customers.models import Customer
from apps.accounts.models import UserRole

logger = logging.getLogger(__name__)


class IsCRMAccess(permissions.BasePermission):
    def has_permission(self, request, view):
        if settings.DEBUG:
            return True
        return (
            request.user.is_authenticated
            and request.user.role in [UserRole.ADMIN, UserRole.CRM_EXECUTIVE, UserRole.MANAGER]
        )


class InvoiceListView(generics.ListCreateAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsCRMAccess]

    def get_queryset(self):
        return Invoice.objects.select_related(
            "customer", "repair_order", "repair_order__assigned_technician", "lead"
        ).order_by("-issued_at")

    def create(self, request, *args, **kwargs):
        data = request.data
        repair_id = data.get("repairId") or data.get("repair_order") or data.get("repair_order_id")
        repair = None
        if repair_id:
            repair = RepairOrder.objects.filter(order_number=repair_id).first()
            if not repair:
                try:
                    repair = RepairOrder.objects.filter(id=repair_id).first()
                except Exception:
                    repair = None

        cust_phone = data.get("phone") or (repair.customer.phone if repair else "9845012345")
        cust_name = data.get("customer") or data.get("customer_name") or (repair.customer.full_name if repair else "Customer")
        cust_email = data.get("email") or data.get("customer_email") or (repair.customer.email if repair else "")
        cust_address = data.get("address") or data.get("customer_address") or ""

        customer = None
        if cust_phone:
            customer = Customer.objects.filter(phone=cust_phone, full_name__iexact=cust_name).first()
        if not customer:
            customer = Customer.objects.create(
                phone=cust_phone or "9845012345",
                full_name=cust_name,
                email=cust_email,
            )
        else:
            if cust_email and not customer.email:
                customer.email = cust_email
                customer.save(update_fields=["email"])

        # Parse amounts
        prod_price = Decimal(str(data.get("product_price") or data.get("partCost") or data.get("part_cost", 0)))
        serv_charge = Decimal(str(data.get("service_charges") or data.get("serviceCharge") or data.get("service_charge", 0)))

        # Automatically inherit from linked repair order if not explicitly specified
        if prod_price == Decimal("0.00") and repair and repair.product_price:
            prod_price = repair.product_price
        if serv_charge == Decimal("0.00") and repair and repair.service_charges:
            serv_charge = repair.service_charges

        tax_rate = Decimal(str(data.get("tax_rate", 0)))
        subtotal = prod_price + serv_charge

        if subtotal == 0 and (data.get("totalAmount") or data.get("final_billed_amount")):
            subtotal = Decimal(str(data.get("totalAmount") or data.get("final_billed_amount", 0)))
            serv_charge = subtotal

        tax_amount = (subtotal * tax_rate / Decimal("100")) if tax_rate > 0 else Decimal("0.00")
        total_amount = subtotal + tax_amount

        # Check existing invoice for this repair order (prevent accidental duplicate unless revision requested)
        allow_revision = data.get("allow_revision", False)
        if repair and hasattr(repair, "invoice") and repair.invoice is not None and not allow_revision:
            return Response(
                {
                    "detail": f"An invoice ({repair.invoice.invoice_number}) already exists for this repair order.",
                    "invoice_number": repair.invoice.invoice_number,
                    "invoice_id": str(repair.invoice.id),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Device and issue details
        device_details = data.get("device") or (repair.device_model_text if repair else "Device")
        reported_issue = data.get("issue") or (repair.intake_condition if repair else "")
        confirmed_issue = data.get("service") or data.get("confirmed_issue") or (repair.confirmed_issue or repair.diagnosis if repair else "")
        work_performed = data.get("work_performed") or (repair.work_performed if repair else "")
        technician_name = data.get("technician") or (
            repair.assigned_technician.full_name if (repair and repair.assigned_technician) else ""
        )
        pay_status = data.get("status") or PaymentStatus.PAID

        invoice = Invoice.objects.create(
            repair_order=repair,
            lead=repair.lead if (repair and repair.lead) else None,
            customer=customer,
            product_price=prod_price,
            service_charges=serv_charge,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            approved_quotation_amount=total_amount,
            final_billed_amount=total_amount,
            amount_paid=total_amount if pay_status == PaymentStatus.PAID else Decimal("0.00"),
            status=pay_status,
            device_details=device_details,
            reported_issue=reported_issue,
            confirmed_issue=confirmed_issue,
            work_performed=work_performed,
            technician_name=technician_name,
            notes=data.get("warranty", "90 Days Service & Replacement Warranty"),
            created_by=request.user if request.user.is_authenticated else None,
        )
        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Invoice.objects.select_related("customer", "repair_order", "lead")
    serializer_class = InvoiceSerializer
    permission_classes = [IsCRMAccess]


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def download_invoice_pdf_view(request, pk):
    """Generate and download or view the PDF invoice."""
    try:
        invoice = Invoice.objects.select_related(
            "customer", "repair_order", "repair_order__assigned_technician", "lead"
        ).get(pk=pk)
    except Invoice.DoesNotExist:
        try:
            invoice = Invoice.objects.get(invoice_number=pk)
        except Invoice.DoesNotExist:
            raise Http404("Invoice not found")

    try:
        pdf_bytes = generate_invoice_pdf(invoice)
        filename = f"Invoice-{invoice.invoice_number}.pdf"
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        # Support inline preview via ?preview=1 or attachment download
        disposition = "inline" if request.query_params.get("preview") == "1" else "attachment"
        response["Content-Disposition"] = f'{disposition}; filename="{filename}"'
        response["Content-Length"] = len(pdf_bytes)
        return response
    except Exception as e:
        logger.error("Error generating invoice PDF: %s", e, exc_info=True)
        return Response({"error": f"Failed to generate invoice PDF: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST", "DELETE"])
@permission_classes([permissions.AllowAny])
def clear_all_invoices(request):
    """Delete all invoices from SQLite database."""
    count = Invoice.objects.count()
    Invoice.objects.all().delete()
    return Response({"message": f"Successfully deleted {count} invoices from SQLite database.", "cleared": count})
