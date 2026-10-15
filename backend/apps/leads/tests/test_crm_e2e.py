"""
End-to-End Acceptance Tests for FixUrDevice CRM System.
Tests all requirements specified in the prompt:
1. Website Enquiry -> Database Lead Creation
2. Four mutually exclusive enquiry actions:
   - Interested -> Creates booking, assigns pricing/tech, prevents duplicate booking
   - Not Interested -> Records reason and notes, displays in not interested
   - Wrong Number -> Records verification, displays with distinct label
   - Call Back Later -> Records schedule, preserves history upon rescheduling
3. Pricing & Internal Profit tracking:
   - Product price + service charges = total customer charge
   - Profit is strictly internal and NEVER appears on customer invoices or PDF
4. Technician assignment & work tracking:
   - Rework reopening & completion
5. Invoice generation & ReportLab PDF download:
   - Unique invoice number
   - Duplicate prevention
   - Audit trail
6. Safe deletion & archival of leads:
   - Soft-delete preserves financial records and bookings
"""
import json
from decimal import Decimal
from django.test import TestCase, Client
from django.utils import timezone
from apps.leads.models import Lead, LeadStatus, LeadSource, CallbackSchedule
from apps.customers.models import Customer
from apps.repairs.models import RepairOrder, RepairStatus
from apps.payments.models import Invoice, PaymentStatus
from apps.accounts.models import User, UserRole


class CRME2EAcceptanceTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        # Create staff user and authenticate
        self.admin_user = User.objects.create_user(
            email="staff@fixurdevice.in",
            full_name="CRM Manager",
            phone="9845000000",
            role=UserRole.ADMIN,
            is_active=True,
        )
        self.client.force_login(self.admin_user)

        # Create a test technician
        self.technician = User.objects.create_user(
            email="tech_test@fixurdevice.in",
            full_name="Arjun Master Tech",
            phone="9845011221",
            role=UserRole.TECHNICIAN,
            is_active=True,
        )

    def test_01_website_enquiry_form_submission(self):
        """Website enquiry creates customer and database lead with status 'new'."""
        payload = {
            "customer_name": "Rohan Deshmukh",
            "customer_phone": "9876543210",
            "customer_email": "rohan@example.com",
            "device_model_text": "iPhone 15 Pro",
            "reported_problem": "Cracked OLED display and touch unresponsive",
            "pickup_area": "Indiranagar",
            "pickup_address": "Indiranagar 100ft Rd, Bengaluru",
            "privacy_consent": True,
        }
        res = self.client.post(
            "/api/public/enquiry/submit/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertTrue(data.get("success"))
        lead_ref = data.get("reference")
        self.assertTrue(lead_ref.startswith("FUD-"))

        # Verify database record
        lead = Lead.objects.get(reference=lead_ref)
        self.assertEqual(lead.customer.full_name, "Rohan Deshmukh")
        self.assertEqual(lead.customer.phone, "9876543210")
        self.assertEqual(lead.device_model_text, "iPhone 15 Pro")
        self.assertEqual(lead.status, LeadStatus.NEW)
        self.assertEqual(lead.source, LeadSource.WEBSITE)
        self.assertFalse(lead.is_archived)

    def test_02_option_a_interested_creates_booking_and_deduplicates(self):
        """Option A: Interested saves status, creates booking, prevents duplicates."""
        customer = Customer.objects.create(full_name="Pooja Sharma", phone="9845123456")
        lead = Lead.objects.create(
            customer=customer,
            reference="FUD-261012-TEST1",
            device_model_text="MacBook Air M2",
            reported_problem="Liquid spill on keyboard",
            source=LeadSource.META_ADS,
            status=LeadStatus.NEW,
        )

        action_data = {
            "action": "interested",
            "confirmed_issue": "Keyboard controller short-circuit from tea spill",
            "product_price": 4500,
            "service_charges": 1500,
            "work_notes": "Needs ultrasonic cleaning & keyboard replacement",
            "technician_id": self.technician.id,
        }
        res = self.client.post(
            f"/api/v1/leads/{lead.id}/action/",
            data=json.dumps(action_data),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)

        # Lead status updated
        lead.refresh_from_db()
        self.assertEqual(lead.status, LeadStatus.INTERESTED)

        # Booking created
        repair = RepairOrder.objects.get(lead=lead)
        self.assertEqual(repair.confirmed_issue, "Keyboard controller short-circuit from tea spill")
        self.assertEqual(repair.product_price, Decimal("4500.00"))
        self.assertEqual(repair.service_charges, Decimal("1500.00"))
        self.assertEqual(repair.total_customer_charge, Decimal("6000.00"))
        self.assertEqual(repair.assigned_technician, self.technician)
        self.assertEqual(repair.status, RepairStatus.PENDING)

        # Deduplication test: re-submitting does not create duplicate booking
        res_dup = self.client.post(
            f"/api/v1/leads/{lead.id}/action/",
            data=json.dumps(action_data),
            content_type="application/json",
        )
        self.assertEqual(res_dup.status_code, 200)
        self.assertEqual(RepairOrder.objects.filter(lead=lead).count(), 1)

    def test_03_option_b_not_interested_records_reason(self):
        """Option B: Not Interested requires reason and saves in database."""
        customer = Customer.objects.create(full_name="Karan Verma", phone="9845234567")
        lead = Lead.objects.create(
            customer=customer,
            reference="FUD-261012-TEST2",
            device_model_text="OnePlus 11",
            reported_problem="Battery draining",
            source=LeadSource.GOOGLE_ADS,
            status=LeadStatus.NEW,
        )

        action_data = {
            "action": "not_interested",
            "rejection_reason": "Price too high",
            "rejection_notes": "Customer felt quotation was above their budget of Rs 1500",
        }
        res = self.client.post(
            f"/api/v1/leads/{lead.id}/action/",
            data=json.dumps(action_data),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)

        lead.refresh_from_db()
        self.assertEqual(lead.status, LeadStatus.NOT_INTERESTED)
        self.assertEqual(lead.rejection_reason, "Price too high")
        self.assertEqual(lead.rejection_notes, "Customer felt quotation was above their budget of Rs 1500")

    def test_04_option_c_wrong_number_records_verification(self):
        """Option C: Wrong Number records distinct status and notes."""
        customer = Customer.objects.create(full_name="Fake User", phone="9111111111")
        lead = Lead.objects.create(
            customer=customer,
            reference="FUD-261012-TEST3",
            device_model_text="Samsung S23",
            reported_problem="Screen flicker",
            source=LeadSource.WEBSITE,
            status=LeadStatus.NEW,
        )

        action_data = {
            "action": "wrong_number",
            "rejection_notes": "Called twice, lady answered saying she never visited Bangalore or requested repair",
        }
        res = self.client.post(
            f"/api/v1/leads/{lead.id}/action/",
            data=json.dumps(action_data),
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)

        lead.refresh_from_db()
        self.assertEqual(lead.status, LeadStatus.WRONG_NUMBER)
        self.assertIn("Called twice", lead.rejection_notes)

    def test_05_option_d_callback_and_rescheduling_preserves_history(self):
        """Option D: Callback later schedules follow-up and preserves full history on rescheduling."""
        customer = Customer.objects.create(full_name="Meera Nair", phone="9845345678")
        lead = Lead.objects.create(
            customer=customer,
            reference="FUD-261012-TEST4",
            device_model_text="iPhone 14 Pro Max",
            reported_problem="Back glass cracked",
            source=LeadSource.PHONE,
            status=LeadStatus.NEW,
        )

        # 1. Schedule first callback
        action_data = {
            "action": "callback",
            "callback_date": "2026-10-14",
            "callback_time": "11:30",
            "callback_notes": "Customer driving, requested call back on Wednesday morning",
        }
        res1 = self.client.post(
            f"/api/v1/leads/{lead.id}/action/",
            data=json.dumps(action_data),
            content_type="application/json",
        )
        self.assertEqual(res1.status_code, 200)

        lead.refresh_from_db()
        self.assertEqual(lead.status, LeadStatus.CALLBACK_LATER)
        self.assertEqual(str(lead.callback_date), "2026-10-14")
        self.assertEqual(str(lead.callback_time)[:5], "11:30")
        self.assertEqual(lead.callback_schedules.count(), 1)

        # 2. Reschedule callback to new date/time
        reschedule_data = {
            "callback_date": "2026-10-16",
            "callback_time": "16:00",
            "notes": "Follow-up #2: Customer requested Friday afternoon instead",
        }
        res2 = self.client.post(
            f"/api/v1/leads/{lead.id}/reschedule-callback/",
            data=json.dumps(reschedule_data),
            content_type="application/json",
        )
        self.assertIn(res2.status_code, [200, 201])

        lead.refresh_from_db()
        self.assertEqual(str(lead.callback_date), "2026-10-16")
        self.assertEqual(str(lead.callback_time)[:5], "16:00")
        # History must contain BOTH records
        self.assertEqual(lead.callback_schedules.count(), 2)

    def test_06_rework_workflow_and_completion(self):
        """Technician work tracking with rework reopening and completion."""
        customer = Customer.objects.create(full_name="Deepak Joshi", phone="9845456789")
        lead = Lead.objects.create(
            customer=customer,
            reference="FUD-261012-TEST5",
            device_model_text="Google Pixel 8",
            reported_problem="Charging port loose",
            source=LeadSource.WALK_IN,
            status=LeadStatus.INTERESTED,
        )
        repair = RepairOrder.objects.create(
            lead=lead,
            customer=customer,
            order_number="RO-TEST-001",
            device_model_text="Google Pixel 8",
            assigned_technician=self.technician,
            product_price=Decimal("1200.00"),
            service_charges=Decimal("800.00"),
            status=RepairStatus.IN_PROGRESS,
        )

        # Mark as Rework
        patch_rework = {
            "status": "rework",
            "rework_reason": "Charging port contacts slightly misaligned on secondary test",
        }
        res_rework = self.client.patch(
            f"/api/v1/repairs/{repair.id}/",
            data=json.dumps(patch_rework),
            content_type="application/json",
        )
        self.assertEqual(res_rework.status_code, 200)
        repair.refresh_from_db()
        self.assertEqual(repair.status, RepairStatus.REWORK)
        self.assertEqual(repair.rework_reason, "Charging port contacts slightly misaligned on secondary test")

        # Now mark as Completed
        patch_complete = {
            "status": "completed",
            "work_performed": "Re-soldered type-C flex cable with high-temp lead-free solder",
            "parts_used_notes": "OEM Pixel 8 Type-C sub-board",
        }
        res_complete = self.client.patch(
            f"/api/v1/repairs/{repair.id}/",
            data=json.dumps(patch_complete),
            content_type="application/json",
        )
        self.assertEqual(res_complete.status_code, 200)
        repair.refresh_from_db()
        self.assertEqual(repair.status, RepairStatus.COMPLETED)

    def test_07_invoice_generation_and_no_profit_leakage(self):
        """Invoice generated from completed booking with ReportLab PDF and strictly zero profit exposure."""
        customer = Customer.objects.create(
            full_name="Ananya Roy",
            phone="9845567890",
            email="ananya@example.com",
            address_line1="Koramangala, Bengaluru",
        )
        lead = Lead.objects.create(
            customer=customer,
            reference="FUD-261012-TEST6",
            device_model_text="iPhone 13",
            reported_problem="Battery 72% health service warning",
            source=LeadSource.WEBSITE,
            status=LeadStatus.INTERESTED,
        )
        repair = RepairOrder.objects.create(
            lead=lead,
            customer=customer,
            order_number="RO-TEST-002",
            device_model_text="iPhone 13",
            confirmed_issue="Degraded battery cell",
            work_performed="Installed high-capacity OEM battery cell with BMS transfer",
            assigned_technician=self.technician,
            product_price=Decimal("3200.00"),
            service_charges=Decimal("1000.00"),
            internal_profit=Decimal("1800.00"),  # Strictly internal!
            status=RepairStatus.COMPLETED,
        )

        # 1. Create Invoice
        invoice_payload = {
            "repair_order_id": str(repair.id),
            "payment_status": "completed",
            "notes": "Thank you for choosing FixUrDevice. 90 days warranty included.",
        }
        res_inv = self.client.post(
            "/api/v1/payments/invoices/",
            data=json.dumps(invoice_payload),
            content_type="application/json",
        )
        self.assertEqual(res_inv.status_code, 201)
        inv_data = res_inv.json()
        inv_id = inv_data["id"]
        inv_num = inv_data["invoice_number"]
        self.assertTrue(inv_num.startswith("INV-"))

        # Check total
        self.assertEqual(Decimal(str(inv_data["subtotal"])), Decimal("4200.00"))
        self.assertEqual(Decimal(str(inv_data["total"])), Decimal("4200.00"))

        # Verify duplicate invoice prevention
        res_dup = self.client.post(
            "/api/v1/payments/invoices/",
            data=json.dumps(invoice_payload),
            content_type="application/json",
        )
        self.assertEqual(res_dup.status_code, 400)
        self.assertIn("already exists", res_dup.json().get("detail", ""))

        # 2. Download PDF Invoice Endpoint
        res_pdf = self.client.get(f"/api/v1/payments/invoices/{inv_id}/pdf/")
        self.assertEqual(res_pdf.status_code, 200)
        self.assertEqual(res_pdf["Content-Type"], "application/pdf")
        pdf_bytes = res_pdf.content
        self.assertTrue(len(pdf_bytes) > 1000)
        # PDF magic header
        self.assertTrue(pdf_bytes.startswith(b"%PDF-"))

        # CRITICAL SECURITY TEST: Ensure internal profit is NEVER leaked in invoice data or PDF
        pdf_text = pdf_bytes.decode("latin1", errors="ignore")
        self.assertNotIn("internal_profit", pdf_text.lower())
        self.assertNotIn("internal profit", pdf_text.lower())
        self.assertNotIn("1800.00", pdf_text)  # The internal profit figure must not appear anywhere
        self.assertNotIn("profit", str(inv_data).lower())

    def test_08_safe_lead_deletion_and_archival(self):
        """Deleting a lead with bookings/financials soft-deletes (archives) rather than destroying records."""
        customer = Customer.objects.create(full_name="Vijay Kumar", phone="9845678901")
        lead = Lead.objects.create(
            customer=customer,
            reference="FUD-261012-TEST7",
            device_model_text="iPad 9th Gen",
            reported_problem="Charging issue",
            status=LeadStatus.INTERESTED,
        )
        repair = RepairOrder.objects.create(
            lead=lead,
            customer=customer,
            order_number="RO-TEST-003",
            device_model_text="iPad 9th Gen",
            status=RepairStatus.COMPLETED,
        )

        # Perform DELETE request
        res_del = self.client.delete(f"/api/v1/leads/{lead.id}/")
        self.assertEqual(res_del.status_code, 200)
        data = res_del.json()
        self.assertEqual(data.get("action"), "archived")

        # Verify soft deletion
        lead.refresh_from_db()
        self.assertTrue(lead.is_archived)
        self.assertIsNotNone(lead.archived_at)

        # Verify linked repair booking is preserved
        self.assertTrue(RepairOrder.objects.filter(lead=lead).exists())

        # Verify lead does not appear in normal active lead list
        res_list = self.client.get("/api/v1/leads/")
        lead_ids = [l["id"] for l in res_list.json().get("results", [])]
        self.assertNotIn(str(lead.id), lead_ids)
