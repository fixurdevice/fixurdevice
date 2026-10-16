"""
Notifications tasks and direct email dispatch.
Sends emails to business owner (fixurdevice.in@gmail.com) and customers.
"""
from celery import shared_task
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


def send_lead_email(lead_id: str) -> bool:
    """
    Direct synchronous email dispatch function for a newly created lead.
    Sends rich HTML + plain-text notification to the business team (fixurdevice.in@gmail.com).
    """
    from apps.leads.models import Lead
    from apps.notifications.models import NotificationLog

    try:
        lead = Lead.objects.select_related("customer").get(id=lead_id)
    except Lead.DoesNotExist:
        logger.error("Lead %s not found for email dispatch", lead_id)
        return False

    recipient = getattr(settings, "BUSINESS_EMAIL", "fixurdevice.in@gmail.com")
    subject = f"[New Lead #{lead.reference}] {lead.customer.full_name} - {lead.device_model_text or 'Device Repair'} ({lead.pickup_area or 'Bangalore'})"
    text_content = _build_lead_notification_body(lead)
    html_content = _build_lead_notification_html(lead)

    # Create audit log record
    log = NotificationLog.objects.create(
        notification_type=NotificationLog.NotificationType.NEW_LEAD,
        channel=NotificationLog.Channel.EMAIL,
        recipient_email=recipient,
        is_customer=False,
        lead_id=lead.id,
    )

    try:
        # If using SMTP backend, ensure credentials are present
        backend_str = getattr(settings, "EMAIL_BACKEND", "")
        if "smtp" in backend_str.lower():
            host_user = getattr(settings, "EMAIL_HOST_USER", "")
            host_pass = getattr(settings, "EMAIL_HOST_PASSWORD", "")
            if not host_user or not host_pass:
                log.status = NotificationLog.Status.FAILED
                log.failure_reason = "SMTP credentials (EMAIL_HOST_USER / EMAIL_HOST_PASSWORD) not configured."
                log.save(update_fields=["status", "failure_reason"])
                logger.warning("SMTP credentials not configured. Skipping email dispatch for %s", lead.reference)
                return False

        from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "fixurdevice.in@gmail.com")
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[recipient],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)

        log.status = NotificationLog.Status.SENT
        log.sent_at = timezone.now()
        log.save(update_fields=["status", "sent_at"])
        logger.info("Direct lead notification sent successfully for %s to %s", lead.reference, recipient)
        return True
    except Exception as exc:
        log.status = NotificationLog.Status.FAILED
        log.failure_reason = str(exc)[:500]
        log.last_attempt_at = timezone.now()
        log.save(update_fields=["status", "failure_reason", "last_attempt_at"])
        logger.error("Direct lead email failed for %s: %s", lead.reference, exc)
        return False


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_new_lead_notification(self, lead_id: str):
    """
    Celery task wrapper that delegates to send_lead_email.
    """
    success = send_lead_email(lead_id)
    if not success and hasattr(self, "retry"):
        raise self.retry()


def _build_lead_notification_body(lead) -> str:
    """Build internal plain-text email body for new lead notification (ASCII-safe)."""
    customer = lead.customer
    lines = [
        "==================================================",
        "   FIXURDEVICE -- NEW REPAIR ENQUIRY RECEIVED",
        "==================================================",
        f"Lead Reference: {lead.reference}",
        f"Timestamp:      {lead.created_at.strftime('%Y-%m-%d %H:%M:%S') if lead.created_at else 'Just now'}",
        "",
        "CUSTOMER DETAILS:",
        f"- Name:    {customer.full_name}",
        f"- Phone:   {customer.phone}",
        f"- Email:   {customer.email or '(not provided)'}",
        f"- Contact: {customer.get_preferred_contact_method_display()}",
        "",
        "DEVICE & REPAIR DETAILS:",
        f"- Category: {lead.device_category or '(not specified)'}",
        f"- Brand:    {lead.device_brand or '(not specified)'}",
        f"- Model:    {lead.device_model or lead.device_model_text or '(not specified)'}",
        f"- Service:  {lead.service_requested or lead.service_requested_text or '(not specified)'}",
        f"- Problem:  {lead.reported_problem}",
        "",
        "PICKUP & LOCATION:",
        f"- Area:     {lead.pickup_area or '(not specified)'}",
        f"- Pincode:  {lead.pickup_pincode or '(not specified)'}",
        f"- Time Window: {lead.preferred_time_window or '(flexible)'}",
        "",
        "ATTRIBUTION:",
        f"- Source:   {lead.get_source_display()}",
        f"- Campaign: {lead.utm_campaign or 'None'}",
        "",
        "Access CRM Portal to manage this enquiry: http://localhost:3000/crm/leads",
        "==================================================",
    ]
    return "\n".join(lines)


def _build_lead_notification_html(lead) -> str:
    """Build rich HTML email for business inbox with safe HTML entities."""
    customer = lead.customer
    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Lead {lead.reference}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6c3fff 0%, #4f46e5 100%); padding: 28px 24px; color: white; text-align: center;">
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">&#128295; FixUrDevice CRM</h1>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">New Doorstep Repair Enquiry Received</p>
      <div style="display: inline-block; margin-top: 12px; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 999px; font-weight: 700; font-size: 13px;">
        Ref #{lead.reference}
      </div>
    </div>

    <!-- Body -->
    <div style="padding: 24px;">

      <!-- Customer Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 12px; font-size: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">
          &#128100; Customer Information
        </h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 120px;">Full Name:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">{customer.full_name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Phone Number:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #6c3fff;">
              <a href="tel:{customer.phone}" style="color: #6c3fff; text-decoration: none;">&#128222; {customer.phone}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Email Address:</td>
            <td style="padding: 6px 0; color: #0f172a;">{customer.email or 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Preferred Contact:</td>
            <td style="padding: 6px 0; color: #0f172a; text-transform: capitalize;">{customer.get_preferred_contact_method_display()}</td>
          </tr>
        </table>
      </div>

      <!-- Device & Issue Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 12px; font-size: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">
          &#128241; Device &amp; Problem Reported
        </h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 120px;">Device / Model:</td>
            <td style="padding: 6px 0; font-weight: 700; color: #0f172a;">{lead.device_brand or ''} {lead.device_model or lead.device_model_text or 'General Device'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Service Needed:</td>
            <td style="padding: 6px 0; color: #0f172a;">{lead.service_requested or lead.service_requested_text or 'Repair Assessment'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; vertical-align: top;">Reported Problem:</td>
            <td style="padding: 6px 0; color: #b91c1c; font-weight: 600;">{lead.reported_problem}</td>
          </tr>
        </table>
      </div>

      <!-- Location Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px; font-size: 15px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">
          &#128205; Pickup Details (Bangalore)
        </h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 120px;">Area / Address:</td>
            <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">{lead.pickup_area or 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Pincode:</td>
            <td style="padding: 6px 0; color: #0f172a;">{lead.pickup_pincode or 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Time Window:</td>
            <td style="padding: 6px 0; color: #0f172a; text-transform: capitalize;">{lead.preferred_time_window or 'Flexible'}</td>
          </tr>
        </table>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 28px 0 16px;">
        <a href="http://localhost:3000/crm/leads" style="display: inline-block; background: #6c3fff; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 999px; box-shadow: 0 4px 15px rgba(108,63,255,0.4);">
          Open Lead in FixUrDevice CRM &rarr;
        </a>
      </div>

      <p style="text-align: center; font-size: 12px; color: #94a3b8; margin: 16px 0 0;">
        FixUrDevice Apple &amp; Multi-Brand Repair Service &bull; Jayanagar, Bangalore &bull; 9343584460
      </p>

    </div>
  </div>
</body>
</html>"""
