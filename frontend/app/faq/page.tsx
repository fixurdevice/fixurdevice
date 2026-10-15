import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { MessageSquare, ChevronRight, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — FixUrDevice Bangalore",
  description:
    "Find answers to common questions about FixUrDevice's repair process, service areas, pricing, data safety, and pickup and delivery in Bangalore.",
};

const faqCategories = [
  {
    category: "Pricing & Quotations",
    faqs: [
      {
        q: "Do you show repair prices on your website?",
        a: "No, we do not display repair prices on our website. Every device and issue is unique — the cost depends on the specific problem, the parts required, and the work involved. We provide a detailed quotation after assessing your device, and you decide whether to proceed.",
      },
      {
        q: "Is there a charge for the diagnosis?",
        a: "We will communicate any applicable diagnostic charge before any assessment work begins. If you proceed with a repair on approval, the diagnostic cost is typically included in the repair. We are transparent about costs before we proceed.",
      },
      {
        q: "Can I get a rough estimate before sending my device?",
        a: "We cannot provide accurate price estimates without assessing the specific device and issue. Submitting an enquiry is the best way to get a proper diagnosis and quotation.",
      },
      {
        q: "What if the cost changes after the repair has started?",
        a: "If the repair scope or cost changes from the original quotation, we will create a revised quotation and contact you for approval before continuing. We do not proceed with additional chargeable work without your authorisation.",
      },
    ],
  },
  {
    category: "Pickup & Delivery",
    faqs: [
      {
        q: "How does pickup and delivery work?",
        a: "After you submit a repair enquiry and we confirm service availability in your area, we schedule a convenient pickup time. Our executive collects the device from your location. After the repair is complete, we deliver it back to you.",
      },
      {
        q: "Which areas in Bangalore do you cover?",
        a: "We cover many areas across Bangalore including Koramangala, Indiranagar, HSR Layout, Whitefield, BTM Layout, Jayanagar, Marathahalli, Electronic City, and more. Coverage for your specific location will be confirmed when you submit an enquiry.",
      },
      {
        q: "Is there a charge for pickup and delivery?",
        a: "Any applicable pickup or delivery charge will be communicated when we confirm your booking. This will be included in your quotation.",
      },
      {
        q: "What if I miss the pickup?",
        a: "If you are unavailable at the scheduled time, please contact us in advance and we will reschedule. Failed pickups may result in rescheduling to an available slot.",
      },
    ],
  },
  {
    category: "Repair Process",
    faqs: [
      {
        q: "How long does a repair take?",
        a: "Turnaround time varies by the repair type and parts availability. Most common repairs are completed within 1–3 working days after the device is received. We provide an estimated timeframe in your quotation.",
      },
      {
        q: "What if I don't approve the quotation?",
        a: "If you choose not to proceed, your device will be returned to you. Any diagnostic charge (if applicable) will have been communicated beforehand.",
      },
      {
        q: "Do you perform quality checks?",
        a: "Yes. Every repair goes through quality checks before the device is returned. If a repair does not pass quality checks, we rework it. We do not return a device that hasn't passed quality verification.",
      },
      {
        q: "What if the issue recurs after repair?",
        a: "If you experience a problem related to the repair, please contact us. We take repair quality seriously and will assess the situation. Rework cases are handled on a case-by-case basis according to our policies.",
      },
    ],
  },
  {
    category: "Data & Device Safety",
    faqs: [
      {
        q: "Is my data safe during repair?",
        a: "We strongly recommend backing up your device before handing it over. Our technicians focus on the hardware repair and do not access your personal data. We handle all devices with professional care.",
      },
      {
        q: "Do you need my password or PIN?",
        a: "No. We do not request your device unlock codes, passwords, banking PINs, or any other sensitive credentials. If a technician needs to verify hardware functionality, we will discuss this with you specifically.",
      },
      {
        q: "How do you handle my device while it's with you?",
        a: "Your device is handled with care and tracked throughout the repair process. It is stored securely at our repair centre during the assessment and repair stages.",
      },
    ],
  },
  {
    category: "Devices We Repair",
    faqs: [
      {
        q: "Which devices do you repair?",
        a: "We repair iPhones (iPhone 8 and newer), a wide range of Android phones (Samsung, OnePlus, Xiaomi, Realme, Vivo, OPPO, Motorola), iPads, select Android tablets, and select laptops including MacBooks. Submit an enquiry if you're unsure about your specific model.",
      },
      {
        q: "Do you repair very old models?",
        a: "Parts availability can be a challenge for older devices. Submit an enquiry with your device model and we'll confirm whether we can assist.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: "var(--gradient-hero)", padding: "4rem 0 3rem", textAlign: "center" }}>
          <div className="container">
            <div className="section-label" style={{ justifyContent: "center" }}>
              <MessageSquare size={12} />
              Support
            </div>
            <h1 className="display-1" style={{ marginBottom: "1rem" }}>
              Frequently Asked Questions
            </h1>
            <p style={{ color: "var(--gray-500)", fontSize: "1.0625rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
              Answers to common questions about our repair service, process, and policies.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: 840 }}>
            {faqCategories.map((cat) => (
              <div key={cat.category} style={{ marginBottom: "3rem" }}>
                <h2
                  style={{
                    fontWeight: 800,
                    fontSize: "1.125rem",
                    color: "var(--brand-purple)",
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 24,
                      background: "var(--gradient-purple)",
                      borderRadius: 3,
                    }}
                  />
                  {cat.category}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {cat.faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="faq-item"
                      style={{ background: "white" }}
                    >
                      <summary
                        style={{
                          padding: "1.125rem 1.5rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          listStyle: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          color: "var(--brand-navy)",
                          fontSize: "0.9375rem",
                        }}
                      >
                        {faq.q}
                        <ChevronRight size={16} color="var(--brand-purple)" style={{ flexShrink: 0 }} />
                      </summary>
                      <div
                        style={{
                          padding: "0 1.5rem 1.125rem",
                          color: "var(--gray-600)",
                          lineHeight: 1.7,
                          fontSize: "0.9375rem",
                          borderTop: "1px solid var(--gray-100)",
                          paddingTop: "0.875rem",
                        }}
                      >
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}

            {/* Still have questions */}
            <div
              style={{
                background: "var(--brand-lavender)",
                borderRadius: "var(--border-radius-2xl)",
                padding: "2.5rem",
                textAlign: "center",
                border: "1px solid rgba(108,63,255,0.15)",
              }}
            >
              <h2 style={{ fontWeight: 700, fontSize: "1.375rem", marginBottom: "0.75rem" }}>
                Still Have Questions?
              </h2>
              <p style={{ color: "var(--gray-500)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                Our team is here to help. Reach out and we&apos;ll answer your specific question.
              </p>
              <div style={{ display: "flex", gap: "0.875rem", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/contact" className="btn btn-secondary">
                  Contact Us
                </Link>
                <Link href="/book-repair" className="btn btn-primary">
                  Request a Repair <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
