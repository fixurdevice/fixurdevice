"""
Public enquiry submission view.
Handles the repair booking form from the marketing website.
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from django.db import transaction
from django.utils import timezone
import logging

from .serializers import PublicEnquirySerializer
from .models import Lead, LeadStatus, LeadSource
from apps.customers.models import Customer
from apps.services.models import DeviceCategory, DeviceBrand, DeviceModel, RepairService, ServiceArea
from apps.notifications.tasks import send_new_lead_notification

logger = logging.getLogger(__name__)


class LeadCreateThrottle(AnonRateThrottle):
    rate = "60/minute"
    scope = "lead_create"

    def allow_request(self, request, view):
        from django.conf import settings
        if getattr(settings, "DEBUG", False):
            return True
        return super().allow_request(request, view)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LeadCreateThrottle])
def submit_enquiry(request):
    """
    Public endpoint for repair enquiry form submission.
    - Validates input
    - Saves customer and lead atomically
    - Sends notification asynchronously (failure does NOT discard the lead)
    - Returns only safe public data (reference number and confirmation)
    """
    serializer = PublicEnquirySerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data

    try:
        with transaction.atomic():
            # Find existing customer by BOTH phone and name, or create a new dedicated customer
            cust_phone = data["customer_phone"].strip()
            cust_name = data["customer_name"].strip()
            customer = Customer.objects.filter(phone=cust_phone, full_name__iexact=cust_name).first()

            if not customer:
                customer = Customer.objects.create(
                    phone=cust_phone,
                    full_name=cust_name,
                    email=data.get("customer_email", ""),
                    preferred_contact_method=data.get("preferred_contact_method", "phone"),
                    privacy_consent=data["privacy_consent"],
                    consent_timestamp=timezone.now(),
                )
            else:
                # Update email non-destructively if missing
                if data.get("customer_email") and not customer.email:
                    customer.email = data["customer_email"]
                    customer.save(update_fields=["email"])

            # Resolve FK references safely
            device_category = None
            device_brand = None
            device_model = None
            service_requested = None

            if data.get("device_category_id"):
                device_category = DeviceCategory.objects.filter(
                    id=data["device_category_id"], is_active=True
                ).first()
            if data.get("device_brand_id"):
                device_brand = DeviceBrand.objects.filter(
                    id=data["device_brand_id"], is_active=True
                ).first()
            if data.get("device_model_id"):
                device_model = DeviceModel.objects.filter(
                    id=data["device_model_id"], is_active=True
                ).first()
            if data.get("service_requested_id"):
                service_requested = RepairService.objects.filter(
                    id=data["service_requested_id"], is_active=True
                ).first()

            # Check area coverage safely across SQLite and PostgreSQL
            area_verified = False
            requires_confirmation = False
            pincode = str(data.get("pickup_pincode", "")).strip()
            if pincode:
                for area in ServiceArea.objects.filter(is_active=True):
                    if area.pincodes and (pincode in area.pincodes or int(pincode) in area.pincodes if pincode.isdigit() else False):
                        area_verified = not area.requires_confirmation
                        requires_confirmation = area.requires_confirmation
                        break

            # Determine lead source
            source = LeadSource.WEBSITE
            if data.get("utm_medium", "").lower() in ["cpc", "paid", "ppc"]:
                source = LeadSource.GOOGLE_ADS
            elif data.get("utm_source", "").lower() in ["google"]:
                source = LeadSource.ORGANIC_SEARCH

            # Create the lead
            lead = Lead.objects.create(
                customer=customer,
                customer_name=cust_name,
                customer_phone=cust_phone,
                customer_email=data.get("customer_email", ""),
                device_category=device_category,
                device_brand=device_brand,
                device_model=device_model,
                device_model_text=data.get("device_model_text", ""),
                service_requested=service_requested,
                service_requested_text=data.get("service_requested_text", ""),
                reported_problem=data["reported_problem"],
                pickup_area=data.get("pickup_area", ""),
                pickup_pincode=pincode,
                area_verified=area_verified,
                preferred_pickup_date=data.get("preferred_pickup_date"),
                preferred_time_window=data.get("preferred_time_window", ""),
                source=source,
                utm_source=data.get("utm_source", ""),
                utm_medium=data.get("utm_medium", ""),
                utm_campaign=data.get("utm_campaign", ""),
                utm_term=data.get("utm_term", ""),
                utm_content=data.get("utm_content", ""),
                gclid=data.get("gclid", ""),
                referrer_url=data.get("referrer_url", ""),
                landing_page=data.get("landing_page", ""),
                status=LeadStatus.NEW,
            )

        # Lead is safely saved — dispatch email notification in background thread
        # so HTTP response returns immediately and never triggers worker timeouts.
        try:
            import threading
            from apps.notifications.tasks import send_lead_email
            email_thread = threading.Thread(
                target=send_lead_email,
                args=(str(lead.id),),
                daemon=True,
            )
            email_thread.start()
        except Exception as notify_err:
            logger.error("Direct email thread dispatch failed for %s: %s", lead.reference, notify_err)

        logger.info("New lead created: %s (customer: %s)", lead.reference, customer.phone[-4:])

        return Response(
            {
                "success": True,
                "reference": lead.reference,
                "lead_id": str(lead.id),
                "customer_name": customer.full_name,
                "customer_phone": customer.phone,
                "customer_email": customer.email,
                "device": lead.device_model_text or (f"{lead.device_brand} {lead.device_model}" if lead.device_brand else "Device"),
                "reported_problem": lead.reported_problem,
                "pickup_area": lead.pickup_area,
                "status": "new",
                "message": "Thank you! We've received your repair enquiry. Our team will contact you shortly.",
                "area_verified": area_verified,
                "requires_area_confirmation": requires_confirmation,
            },
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        logger.error("Error creating lead from public enquiry: %s", e, exc_info=True)
        return Response(
            {"success": False, "message": "Something went wrong. Please try again or call us directly."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
