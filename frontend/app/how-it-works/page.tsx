import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Phone,
  Package,
  Wrench,
  Star,
  Truck,
  Clock,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Device Repair Works — Pickup, Diagnosis & Delivery | FixUrDevice",
  description:
    "Learn how FixUrDevice's repair process works in Bangalore. Submit an enquiry, get a diagnosis and quotation, approve the repair, and receive your device via pickup and delivery.",
};

const steps = [
  {
    step: 1,
    icon: FileText,
    title: "Submit a Repair Enquiry",
    description:
      "Start by filling in our repair request form with your device details and the issue you're facing. No upfront payment required at this stage.",
    details: [
      "Quick online form — takes under 2 minutes",
      "Tell us your device type, brand, model, and issue",
      "Share your preferred pickup area and time",
      "You'll receive a reference number immediately",
    ],
    cta: { label: "Request a Repair", href: "/book-repair" },
  },
  {
    step: 2,
    icon: Phone,
    title: "We Contact You & Confirm Coverage",
    description:
      "Our team reviews your enquiry and contacts you to confirm the details and verify that pickup and delivery is available for your area.",
    details: [
      "We call or message you within a few hours",
      "We confirm your Bangalore area is serviceable",
      "We clarify any questions about your device",
      "We schedule a convenient pickup time",
    ],
    cta: null,
  },
  {
    step: 3,
    icon: Package,
    title: "Device Collected from You",
    description:
      "Our pickup executive arrives at your location at the scheduled time. Your device is collected safely and taken to our repair centre.",
    details: [
      "Our executive arrives at the agreed time",
      "A handover record is created",
      "Your device is transported securely",
      "You're notified when the device is received",
    ],
    cta: null,
  },
  {
    step: 4,
    icon: Wrench,
    title: "Diagnosis & Quotation",
    description:
      "Our technicians inspect your device thoroughly, diagnose the issue, and prepare a detailed quotation. We send this to you before any repair work begins.",
    details: [
      "Trained technician inspects your device",
      "Full diagnosis of the issue",
      "Quotation with parts and work required",
      "No chargeable repair begins without your approval",
    ],
    cta: null,
  },
  {
    step: 5,
    icon: CheckCircle2,
    title: "You Approve (or Decline)",
    description:
      "Once you receive the quotation, you decide whether to proceed. Approval is required before any chargeable work begins. You can decline without a repair charge.",
    details: [
      "Review your quotation in full",
      "Approve the repair to proceed",
      "Decline if you prefer not to proceed",
      "Revised quotation if scope changes",
    ],
    cta: null,
  },
  {
    step: 6,
    icon: Star,
    title: "Repair & Quality Check",
    description:
      "Your approved repair is carried out by our technicians. Before your device is returned, it goes through quality checks to confirm the repair is complete.",
    details: [
      "Repair carried out by trained technicians",
      "Quality check before dispatch",
      "Failed QC triggers a rework — not returned until passing",
      "You're notified when ready for delivery",
    ],
    cta: null,
  },
  {
    step: 7,
    icon: Truck,
    title: "Device Delivered Back to You",
    description:
      "Your repaired device is delivered back to your location. Payment is collected at this stage according to the agreed terms.",
    details: [
      "Delivery to your location",
      "Payment collected on delivery",
      "Multiple payment methods accepted",
      "We request your feedback after completion",
    ],
    cta: null,
  },
];

const faqs = [
  {
    q: "Do I need to pay anything upfront?",
    a: "No. There is no upfront payment. You only pay after your repair is completed and your device is returned to you — and only if you approved the quotation.",
  },
  {
    q: "What if I don't want to proceed after seeing the quotation?",
    a: "You can decline. If you decline without any chargeable work having been done, the device will be returned to you. Any diagnostic charge, if applicable, will be communicated before work begins.",
  },
  {
    q: "How long does the full process take?",
    a: "It depends on the repair type, parts availability, and how quickly you respond to the quotation. Many repairs are completed within 1–3 working days after the device is received. We keep you updated throughout.",
  },
  {
    q: "Can I track my repair status?",
    a: "Yes. Once your lead is in our system, our team will keep you updated at key stages. You can also use your reference number to enquire about your repair status.",
  },
  {
    q: "What happens if the repair fails quality checks?",
    a: "If a repair does not pass our quality check, we rework it before returning the device. We do not return a device that hasn't passed quality checks.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section style={{ background: "var(--gradient-hero)", padding: "4rem 0 3rem", textAlign: "center" }}>
          <div className="container">
            <div className="section-label" style={{ justifyContent: "center" }}>
              <Clock size={12} />
              The Process
            </div>
            <h1 className="display-1" style={{ marginBottom: "1rem" }}>
              How It Works
            </h1>
            <p style={{ color: "var(--gray-500)", fontSize: "1.0625rem", maxWidth: 560, margin: "0 auto 2rem", lineHeight: 1.7 }}>
              A transparent, step-by-step repair journey — from your initial enquiry to receiving your repaired device.
            </p>
            <Link href="/book-repair" className="btn btn-primary btn-lg">
              Start a Repair Enquiry <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Steps */}
        <section className="section">
          <div className="container" style={{ maxWidth: 860 }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "1.5rem",
                  top: "2.5rem",
                  bottom: "2.5rem",
                  width: 2,
                  background: "linear-gradient(to bottom, var(--brand-purple), var(--brand-indigo))",
                  opacity: 0.2,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {steps.map((step) => (
                  <div
                    key={step.step}
                    style={{ display: "flex", gap: "2rem", alignItems: "flex-start", position: "relative" }}
                  >
                    {/* Step number circle */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6c3fff 0%, #4f46e5 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "white",
                        fontWeight: 800,
                        fontSize: "1.125rem",
                        boxShadow: "0 4px 16px rgba(108,63,255,0.3)",
                        zIndex: 1,
                        position: "relative",
                      }}
                    >
                      {step.step}
                    </div>

                    {/* Content card */}
                    <div
                      style={{
                        flex: 1,
                        background: "white",
                        borderRadius: "var(--border-radius-xl)",
                        border: "1px solid var(--border-color)",
                        padding: "1.75rem",
                        boxShadow: "var(--shadow-sm)",
                        transition: "all 0.3s ease",
                      }}
                      className="how-step"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "0.75rem" }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "var(--border-radius)",
                            background: "var(--brand-lavender)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <step.icon size={20} color="var(--brand-purple)" />
                        </div>
                        <h2 style={{ fontWeight: 700, fontSize: "1.125rem", color: "var(--brand-navy)" }}>
                          {step.title}
                        </h2>
                      </div>

                      <p style={{ color: "var(--gray-500)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                        {step.description}
                      </p>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        {step.details.map((detail) => (
                          <div
                            key={detail}
                            style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--gray-600)" }}
                          >
                            <CheckCircle2 size={13} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                            {detail}
                          </div>
                        ))}
                      </div>

                      {step.cta && (
                        <div style={{ marginTop: "1.25rem" }}>
                          <Link href={step.cta.href} className="btn btn-primary btn-sm">
                            {step.cta.label} <ArrowRight size={14} />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" style={{ background: "var(--gray-50)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <div className="section-label" style={{ justifyContent: "center" }}>
                <MessageSquare size={12} />
                Common Questions
              </div>
              <h2 className="display-2">Process FAQs</h2>
            </div>
            <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {faqs.map((faq, i) => (
                <details key={i} className="faq-item" style={{ background: "white" }}>
                  <summary
                    style={{
                      padding: "1.125rem 1.5rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      listStyle: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {faq.q}
                    <ChevronRight size={16} color="var(--brand-purple)" style={{ flexShrink: 0 }} />
                  </summary>
                  <div style={{ padding: "0 1.5rem 1.125rem", color: "var(--gray-600)", lineHeight: 1.7, fontSize: "0.9375rem" }}>
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "var(--gradient-brand)", padding: "4rem 0", textAlign: "center" }}>
          <div className="container">
            <h2 className="display-2" style={{ color: "white", marginBottom: "1.25rem" }}>
              Ready to Get Started?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.0625rem", maxWidth: 460, margin: "0 auto 2rem", lineHeight: 1.7 }}>
              Submit your repair enquiry — no upfront payment, no surprises, just a clear quotation.
            </p>
            <Link
              href="/book-repair"
              id="how-it-works-cta"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "1rem 2.25rem",
                background: "white",
                color: "var(--brand-purple)",
                borderRadius: "var(--border-radius-full)",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              }}
            >
              Request a Repair <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
