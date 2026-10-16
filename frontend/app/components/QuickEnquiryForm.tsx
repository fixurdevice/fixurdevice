"use client";
import { useState } from "react";
import Link from "next/link";
import { getApiUrl } from "../lib/api";
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function QuickEnquiryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!message.trim()) {
      setError("Please describe the issue or service needed.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = getApiUrl();
      const payload = {
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        customer_email: email.trim(),
        phone: phone.trim(),
        email: email.trim(),
        reported_problem: message.trim(),
        service_requested_text: message.trim(),
        privacy_consent: true,
        consent: true,
        pickup_area: "Bangalore",
        source: "website_contact",
      };

      const res = await fetch(`${apiUrl}/api/public/enquiry/submit/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || data.errors?.reported_problem?.[0] || "Failed to submit enquiry.");
      }

      const ref = data.reference || `FUD-${Date.now().toString().slice(-6)}`;
      setSuccessRef(ref);

      // Save into crm_recent_leads localStorage so it reflects immediately in CRM
      if (typeof window !== "undefined") {
        try {
          const newLead = {
            id: ref,
            customer: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            device: "General Enquiry",
            issue: message.trim(),
            area: "Bangalore",
            status: "new",
            priority: "high",
            assigned: "Unassigned",
            created: "Just now",
            source: "website_contact",
          };
          const existing = JSON.parse(localStorage.getItem("crm_recent_leads") || "[]");
          localStorage.setItem("crm_recent_leads", JSON.stringify([newLead, ...existing]));
        } catch (storageErr) {
          console.error("Local leads cache update failed", storageErr);
        }
      }

      // Reset form
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please call us directly at 9343584460.");
    } finally {
      setLoading(false);
    }
  };

  if (successRef) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: "var(--border-radius-2xl)",
          border: "1px solid var(--border-color)",
          padding: "2.25rem 2rem",
          boxShadow: "var(--shadow-card)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}
        >
          <CheckCircle2 size={30} color="#16a34a" />
        </div>
        <h3 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--brand-navy)", marginBottom: "0.5rem" }}>
          Enquiry Received!
        </h3>
        <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginBottom: "1.25rem", lineHeight: 1.6 }}>
          We've logged your request in our CRM and sent a notification to our team. We'll call you shortly!
        </p>
        <div
          style={{
            background: "var(--brand-lavender)",
            borderRadius: "var(--border-radius-lg)",
            padding: "0.75rem 1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginBottom: "0.2rem" }}>
            Lead Reference Number
          </div>
          <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.25rem", color: "var(--brand-purple)" }}>
            {successRef}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSuccessRef(null)}
          className="btn btn-secondary btn-sm"
          style={{ width: "100%", justifyContent: "center" }}
        >
          Send Another Enquiry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: "var(--border-radius-2xl)",
        border: "1px solid var(--border-color)",
        padding: "2rem",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <h2 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "0.35rem", color: "var(--brand-navy)" }}>
        Quick Repair Enquiry
      </h2>
      <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
        Send us a quick message. It instantly logs as a Lead in our CRM and alerts our support team.
      </p>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fca5a5",
            borderRadius: "10px",
            padding: "0.75rem 1rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#991b1b",
            fontSize: "0.85rem",
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label className="form-label" htmlFor="contact-name">Your Name *</label>
          <input
            id="contact-name"
            type="text"
            className="form-input"
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label className="form-label" htmlFor="contact-phone">Phone Number *</label>
          <input
            id="contact-phone"
            type="tel"
            className="form-input"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={10}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label className="form-label" htmlFor="contact-email">
            Email <span style={{ color: "var(--gray-400)" }}>(optional)</span>
          </label>
          <input
            id="contact-email"
            type="email"
            className="form-input"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
          <label className="form-label" htmlFor="contact-message">Device &amp; Issue Details *</label>
          <textarea
            id="contact-message"
            className="form-input"
            rows={3}
            placeholder="e.g. iPhone 14 Pro screen is cracked and touch is not responding..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ resize: "vertical" }}
            required
          />
        </div>

        <button
          type="submit"
          id="contact-submit-btn"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", marginBottom: "0.75rem", padding: "0.85rem" }}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Submitting Enquiry...
            </>
          ) : (
            <>
              Send Quick Enquiry <ArrowRight size={16} />
            </>
          )}
        </button>

        <Link
          href="/book-repair"
          className="btn btn-ghost"
          style={{ width: "100%", justifyContent: "center", fontSize: "0.85rem", color: "var(--brand-purple)" }}
        >
          Or use Full Doorstep Booking Form &rarr;
        </Link>
      </form>
    </div>
  );
}
