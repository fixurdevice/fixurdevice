"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiUrl, authFetch } from "../../../lib/api";
import {
  ArrowLeft,
  User,
  Smartphone,
  Wrench,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Shield,
  Tag,
  DollarSign
} from "lucide-react";

export default function NewLeadPage() {
  const router = useRouter();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerArea, setCustomerArea] = useState("Jayanagar");
  const [leadSource, setLeadSource] = useState("walk_in");

  const [deviceCategory, setDeviceCategory] = useState("iPhone");
  const [deviceBrand, setDeviceBrand] = useState("Apple");
  const [deviceModel, setDeviceModel] = useState("");
  const [devicePasscode, setDevicePasscode] = useState("");
  const [serviceNeeded, setServiceNeeded] = useState("Screen Replacement");
  const [reportedProblem, setReportedProblem] = useState("");

  const [serviceType, setServiceType] = useState("walk_in_store");
  const [assignedTechnician, setAssignedTechnician] = useState("Arjun");
  const [partCost, setPartCost] = useState("");
  const [estimatedQuote, setEstimatedQuote] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [advancePaymentMethod, setAdvancePaymentMethod] = useState("UPI");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const calculateProjectedProfit = () => {
    const quote = parseFloat(estimatedQuote) || 0;
    const cost = parseFloat(partCost) || 0;
    return Math.max(0, quote - cost);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!customerName.trim()) {
      setError("Please enter the customer's full name.");
      return;
    }
    if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!deviceModel.trim()) {
      setError("Please specify the device model (e.g., iPhone 15 Pro, Samsung S24).");
      return;
    }
    if (!reportedProblem.trim()) {
      setError("Please describe the issue or problem reported by the customer.");
      return;
    }

    setSubmitting(true);

    try {
      const apiUrl = getApiUrl();
      const referenceId = `FUD-${new Date().getFullYear().toString().slice(-2)}${String(new Date().getMonth() + 1).padStart(2, "0")}${String(new Date().getDate()).padStart(2, "0")}-W${Math.floor(1000 + Math.random() * 9000)}`;
      let createdRef = referenceId;

      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim(),
        device_category: deviceCategory,
        device_brand: deviceBrand,
        device_model_text: deviceModel.trim(),
        service_requested_text: serviceNeeded,
        reported_problem: reportedProblem.trim(),
        pickup_area: customerArea.trim(),
        privacy_consent: true,
        source: leadSource,
      };

      try {
        const leadRes = await authFetch(`${apiUrl}/api/v1/leads/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: customerName.trim(),
            customer_phone: customerPhone.trim(),
            customer_email: customerEmail.trim(),
            device_model_text: deviceModel.trim(),
            reported_problem: `${serviceNeeded} - ${reportedProblem.trim()}`,
            pickup_area: customerArea.trim(),
            priority: "high",
            source: leadSource,
            status: serviceType === "walk_in_store" ? "qualified" : "new",
          }),
        });
        if (leadRes.ok) {
          const resData = await leadRes.json();
          if (resData.reference) createdRef = resData.reference;
        }

        // If walk-in or immediate repair, create repair order directly in SQLite
        if (serviceType === "walk_in_store") {
          const labor = Math.max(0, (parseFloat(estimatedQuote) || 0) - (parseFloat(partCost) || 0));
          await authFetch(`${apiUrl}/api/v1/repairs/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customer_name: customerName.trim(),
              customer_phone: customerPhone.trim(),
              device_name: deviceModel.trim(),
              reported_problem: `${serviceNeeded} - ${reportedProblem.trim()}`,
              part_changed: serviceNeeded,
              part_cost: parseFloat(partCost) || 0,
              labor_charge: labor,
              technician: assignedTechnician,
              status: "in_progress",
            }),
          });
        }
      } catch (apiErr) {
        console.warn("Backend submit error:", apiErr);
      }

      // Save to local cache for CRM immediate sync
      const quoteVal = parseFloat(estimatedQuote) || 0;
      const costVal = parseFloat(partCost) || 0;
      const profitVal = Math.max(0, quoteVal - costVal);
      const advanceVal = parseFloat(advanceAmount) || 0;

      const newLeadObj = {
        id: createdRef,
        customer: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim(),
        device: deviceModel.trim(),
        deviceCategory,
        deviceBrand,
        issue: reportedProblem.trim(),
        service: serviceNeeded,
        passcode: devicePasscode.trim(),
        area: customerArea.trim(),
        status: serviceType === "walk_in_store" ? "device_received" : "new",
        priority: "high",
        assigned: assignedTechnician,
        technician: assignedTechnician,
        source: leadSource,
        created: "Just now",
        partCost: costVal,
        quote: quoteVal,
        profit: profitVal,
        advancePaid: advanceVal,
        paymentMethod: advancePaymentMethod,
        paymentStatus: advanceVal >= quoteVal && quoteVal > 0 ? "paid" : advanceVal > 0 ? "partially_paid" : "pending",
        serviceType,
      };

      if (typeof window !== "undefined") {
        try {
          const existing = JSON.parse(localStorage.getItem("crm_recent_leads") || "[]");
          localStorage.setItem("crm_recent_leads", JSON.stringify([newLeadObj, ...existing]));

          // Also save to repairs state cache
          const existingRepairs = JSON.parse(localStorage.getItem("crm_custom_repairs") || "[]");
          const repairOrder = {
            id: `RO-${Math.floor(1000 + Math.random() * 9000)}`,
            lead: createdRef,
            customer: customerName.trim(),
            phone: customerPhone.trim(),
            device: deviceModel.trim(),
            service: serviceNeeded,
            issue: reportedProblem.trim(),
            technician: assignedTechnician,
            status: serviceType === "walk_in_store" ? "repair_in_progress" : "awaiting_device",
            priority: "high",
            received: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            partCost: costVal,
            totalCharged: quoteVal,
            profit: profitVal,
            paymentStatus: advanceVal >= quoteVal && quoteVal > 0 ? "paid" : advanceVal > 0 ? "partially_paid" : "pending",
            paymentMethod: advancePaymentMethod,
          };
          localStorage.setItem("crm_custom_repairs", JSON.stringify([repairOrder, ...existingRepairs]));
        } catch (e) {}
      }

      setSuccessRef(createdRef);
    } catch (err: any) {
      setError(err.message || "Failed to register lead. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (successRef) {
    return (
      <div style={{ maxWidth: 640, margin: "2rem auto", padding: "0 1rem" }}>
        <div
          style={{
            background: "white",
            borderRadius: "var(--border-radius-2xl)",
            padding: "3rem 2rem",
            textAlign: "center",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#dcfce7",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--brand-navy)", marginBottom: "0.5rem" }}>
            Walk-in Lead Registered!
          </h2>
          <p style={{ color: "var(--gray-500)", marginBottom: "1.75rem", fontSize: "0.95rem" }}>
            Customer <strong>{customerName}</strong> ({deviceModel}) has been added to the CRM and assigned to Technician <strong>{assignedTechnician}</strong>.
          </p>

          <div
            style={{
              background: "var(--brand-lavender)",
              borderRadius: "var(--border-radius-xl)",
              padding: "1.25rem",
              marginBottom: "2rem",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginBottom: "0.25rem" }}>
              Lead / Job Card Reference
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 800, color: "var(--brand-purple)" }}>
              {successRef}
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/crm/leads" className="btn btn-primary">
              View in Leads Table
            </Link>
            <Link href="/crm/repairs" className="btn btn-secondary">
              View in Repairs Queue
            </Link>
            <button
              onClick={() => {
                setSuccessRef(null);
                setCustomerName("");
                setCustomerPhone("");
                setDeviceModel("");
                setReportedProblem("");
                setPartCost("");
                setEstimatedQuote("");
                setAdvanceAmount("");
              }}
              className="btn btn-ghost"
              style={{ border: "1px solid var(--border-color)" }}
            >
              Register Another Customer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
        <Link
          href="/crm/leads"
          style={{
            width: 38,
            height: 38,
            borderRadius: "var(--border-radius-lg)",
            border: "1px solid var(--border-color)",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--gray-600)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--brand-navy)" }}>
            Register Walk-In Customer / Manual Lead
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginTop: "0.2rem" }}>
            Quickly intake a walk-in store customer, assign a technician, record spare part cost and customer quote.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "12px",
            padding: "0.875rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            color: "#991b1b",
            fontSize: "0.9rem",
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Customer Details */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--border-radius-xl)",
            padding: "1.75rem",
            border: "1px solid var(--border-color)",
            marginBottom: "1.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <User size={18} color="var(--brand-purple)" />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--brand-navy)", margin: 0 }}>
              1. Customer Information
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="cust-name">
                Full Name *
              </label>
              <input
                id="cust-name"
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Chandra"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cust-phone">
                Mobile Number *
              </label>
              <input
                id="cust-phone"
                type="tel"
                className="form-input"
                placeholder="10-digit phone number"
                maxLength={10}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="cust-email">
                Email Address (Optional)
              </label>
              <input
                id="cust-email"
                type="email"
                className="form-input"
                placeholder="customer@gmail.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cust-area">
                Area / Locality
              </label>
              <input
                id="cust-area"
                type="text"
                className="form-input"
                placeholder="e.g. Jayanagar 4th Block"
                value={customerArea}
                onChange={(e) => setCustomerArea(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lead-source">
                Lead Source
              </label>
              <select
                id="lead-source"
                className="form-input form-select"
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
              >
                <option value="walk_in">🏬 Walk-in Store Customer</option>
                <option value="phone_call">📞 Direct Phone Call</option>
                <option value="whatsapp">💬 WhatsApp Chat</option>
                <option value="referral">🤝 Word of Mouth / Referral</option>
                <option value="repeat_customer">⭐ Repeat Customer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Device & Repair Service */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--border-radius-xl)",
            padding: "1.75rem",
            border: "1px solid var(--border-color)",
            marginBottom: "1.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Smartphone size={18} color="var(--brand-purple)" />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--brand-navy)", margin: 0 }}>
              2. Device &amp; Specific Service Needed
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="device-cat">
                Device Type *
              </label>
              <select
                id="device-cat"
                className="form-input form-select"
                value={deviceCategory}
                onChange={(e) => setDeviceCategory(e.target.value)}
              >
                <option value="iPhone">iPhone</option>
                <option value="iPad">iPad</option>
                <option value="MacBook">MacBook</option>
                <option value="Apple Watch">Apple Watch</option>
                <option value="Android Phone">Android Smartphone</option>
                <option value="Laptop">Windows Laptop</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="device-brand">
                Brand *
              </label>
              <select
                id="device-brand"
                className="form-input form-select"
                value={deviceBrand}
                onChange={(e) => setDeviceBrand(e.target.value)}
              >
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="OnePlus">OnePlus</option>
                <option value="Google Pixel">Google Pixel</option>
                <option value="Xiaomi">Xiaomi / Redmi</option>
                <option value="Oppo">Oppo / Vivo</option>
                <option value="Dell / HP / Lenovo">Dell / HP / Lenovo</option>
                <option value="Other">Other Brand</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="device-model">
                Exact Model *
              </label>
              <input
                id="device-model"
                type="text"
                className="form-input"
                placeholder="e.g. iPhone 15 Pro, S24 Ultra"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="service-needed">
                Repair Service to Provide *
              </label>
              <select
                id="service-needed"
                className="form-input form-select"
                value={serviceNeeded}
                onChange={(e) => setServiceNeeded(e.target.value)}
              >
                <option value="Screen Replacement">Original Screen / OLED Replacement</option>
                <option value="Battery Replacement">High-Capacity Battery Replacement</option>
                <option value="Back Glass Laser Repair">Back Glass Replacement (Laser Tech)</option>
                <option value="Motherboard IC Repair">Motherboard / Logic Board IC Repair</option>
                <option value="Charging Port IC Repair">Charging Port / Flex Replacement</option>
                <option value="Camera Lens Repair">Rear / Front Camera Module Repair</option>
                <option value="Water Damage Treatment">Water / Liquid Damage Chemical Service</option>
                <option value="Speaker & Mic Repair">Earpiece / Speaker / Mic Repair</option>
                <option value="General Diagnosis">Complete Hardware Diagnosis &amp; Testing</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="device-passcode">
                Device Passcode / Pattern (for QC Testing)
              </label>
              <input
                id="device-passcode"
                type="text"
                className="form-input"
                placeholder="e.g. 123456 or 'Pattern shared'"
                value={devicePasscode}
                onChange={(e) => setDevicePasscode(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reported-problem">
              Reported Problem &amp; Physical Condition *
            </label>
            <textarea
              id="reported-problem"
              className="form-input"
              rows={3}
              placeholder="Detail the issue: e.g. Glass cracked from top right, touch not working in bottom half, no water exposure, minor scratch on bezel..."
              value={reportedProblem}
              onChange={(e) => setReportedProblem(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Section 3: Operations & Technician Assignment */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--border-radius-xl)",
            padding: "1.75rem",
            border: "1px solid var(--border-color)",
            marginBottom: "1.5rem",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Wrench size={18} color="var(--brand-purple)" />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--brand-navy)", margin: 0 }}>
              3. Technician Assignment &amp; Intake Mode
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="assigned-tech">
                Assign Working Technician *
              </label>
              <select
                id="assigned-tech"
                className="form-input form-select"
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
              >
                <option value="Arjun">Arjun (Apple Master Technician - Screens &amp; Motherboard)</option>
                <option value="Ramesh">Ramesh (Senior Tech - Hardware &amp; Micro-soldering)</option>
                <option value="Deepak">Deepak (Display Specialist &amp; Laser Glass)</option>
                <option value="Imran">Imran (Quick Turnaround &amp; Battery/Ports)</option>
                <option value="Anjali">Anjali (Customer Care / Diagnostics)</option>
              </select>
              <span style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginTop: "0.3rem", display: "block" }}>
                The assigned technician will be directly responsible for repairing and updating the status of this device.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="service-type">
                Intake / Delivery Method
              </label>
              <select
                id="service-type"
                className="form-input form-select"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                <option value="walk_in_store">🏬 In-Store Walk-in (Customer dropped device at shop)</option>
                <option value="doorstep_pickup">🛵 Doorstep Pickup Requested (Assign pickup runner)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Cost, Pricing & Profit Calculation */}
        <div
          style={{
            background: "linear-gradient(to right, #fdf4ff, #faf5ff)",
            borderRadius: "var(--border-radius-xl)",
            padding: "1.75rem",
            border: "1px solid rgba(108, 63, 255, 0.2)",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <DollarSign size={20} color="var(--brand-purple)" />
              <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--brand-navy)", margin: 0 }}>
                4. Pricing, Spare Part Cost &amp; Profit Tracking
              </h2>
            </div>
            <div
              style={{
                background: "white",
                padding: "0.4rem 1rem",
                borderRadius: "var(--border-radius-full)",
                border: "1px solid #e9d5ff",
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#7e22ce",
              }}
            >
              Estimated Profit: ₹{calculateProjectedProfit().toLocaleString("en-IN")}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="part-cost">
                Original Part Cost (₹ CP)
              </label>
              <input
                id="part-cost"
                type="number"
                className="form-input"
                placeholder="e.g. 2800"
                value={partCost}
                onChange={(e) => setPartCost(e.target.value)}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginTop: "0.25rem", display: "block" }}>
                Internal expense for spare part
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="est-quote">
                Total Customer Quote (₹ SP)
              </label>
              <input
                id="est-quote"
                type="number"
                className="form-input"
                placeholder="e.g. 5200"
                value={estimatedQuote}
                onChange={(e) => setEstimatedQuote(e.target.value)}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginTop: "0.25rem", display: "block" }}>
                Total amount charged to customer
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="adv-amt">
                Advance Collected (₹)
              </label>
              <input
                id="adv-amt"
                type="number"
                className="form-input"
                placeholder="e.g. 1000 or 0"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginTop: "0.25rem", display: "block" }}>
                Advance deposit received
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="pay-method">
                Payment Mode
              </label>
              <select
                id="pay-method"
                className="form-input form-select"
                value={advancePaymentMethod}
                onChange={(e) => setAdvancePaymentMethod(e.target.value)}
              >
                <option value="UPI">UPI (Google Pay / PhonePe)</option>
                <option value="Cash">Cash at Store</option>
                <option value="Card">Card POS Swipe</option>
                <option value="Pending">Payment on Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "flex-end" }}>
          <Link href="/crm/leads" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                Registering Lead...
              </>
            ) : (
              <>
                <Plus size={18} />
                Register Walk-in Customer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
