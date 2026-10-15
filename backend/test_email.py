"""
Quick diagnostic script to test email delivery.
Run with: python test_email.py
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print("=" * 60)
print(" FixUrDevice Email Diagnostic Tool")
print("=" * 60)
print(f"EMAIL_BACKEND:       {settings.EMAIL_BACKEND}")
print(f"EMAIL_HOST:          {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
print(f"EMAIL_HOST_USER:     {settings.EMAIL_HOST_USER or '(not set)'}")
print(f"EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else '(not set)'}")
print(f"BUSINESS_EMAIL:      {settings.BUSINESS_EMAIL}")
print("=" * 60)

recipient = settings.BUSINESS_EMAIL

try:
    print(f"Attempting to send test email to: {recipient} ...")
    send_mail(
        subject="[Test Email] FixUrDevice CRM Notification Check",
        message="This is a test notification from your FixUrDevice website & CRM system. If you received this, your email configuration is working 100% perfectly!",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient],
        fail_silently=False,
    )
    print("SUCCESS: Test email was dispatched successfully!")
    if "console" in settings.EMAIL_BACKEND:
        print("\nNOTE: EMAIL_BACKEND is set to 'console'. The email was printed to your terminal.")
        print("To send real emails to your Gmail inbox, add your 16-character Google App Password to backend/.env")
    else:
        print(f"\nREAL EMAIL SENT: Check the inbox of {recipient}!")
except Exception as e:
    print(f"ERROR: Email delivery failed: {e}")
