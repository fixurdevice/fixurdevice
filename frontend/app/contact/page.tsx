import Header from "../components/Header";
import Footer from "../components/Footer";
import QuickEnquiryForm from "../components/QuickEnquiryForm";
import Link from "next/link";
import { ArrowRight, MessageCircle, MapPin, Phone, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact FixUrDevice — Bangalore Device Repair Enquiries",
  description:
    "Contact FixUrDevice for device repair enquiries in Bangalore. Submit a repair request or reach out to our team. Pickup and delivery available.",
};

const contactOptions = [
  {
    id: "contact-call",
    icon: Phone,
    label: "Call Us",
    value: "9343584460",
    note: "Mon–Sat, 9:00 AM – 8:00 PM",
    href: "tel:9343584460",
    color: "#6c3fff",
  },
  {
    id: "contact-whatsapp",
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat on WhatsApp",
    note: "Quick responses",
    href: "https://wa.me/919343584460",
    color: "#25d366",
  },
  {
    id: "contact-email",
    icon: Mail,
    label: "Email",
    value: "fixurdevice.in@gmail.com",
    note: "We respond promptly",
    href: "mailto:fixurdevice.in@gmail.com",
    color: "#3b82f6",
  },
  {
    id: "contact-maps",
    icon: MapPin,
    label: "Workshop Location",
    value: "Jayanagar, Bengaluru",
    note: "#159, 1st Floor 32nd E Cross Rd, Tilak Nagar (View on Maps →)",
    href: "https://www.google.com/maps/place/Fixblr/@12.9276467,77.5911674,17z",
    color: "#ec4899",
  },
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section style={{ background: "var(--gradient-hero)", padding: "4rem 0 3rem", textAlign: "center" }}>
          <div className="container">
            <div className="section-label" style={{ justifyContent: "center" }}>
              <MessageCircle size={12} />
              Get In Touch
            </div>
            <h1 className="display-1" style={{ marginBottom: "1rem" }}>
              Contact Us
            </h1>
            <p style={{ color: "var(--gray-500)", fontSize: "1.0625rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
              Have a question about your device or our service? We&apos;re here to help.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}
              className="contact-grid"
            >
              {/* Contact options */}
              <div>
                <h2 style={{ fontWeight: 700, fontSize: "1.375rem", marginBottom: "2rem" }}>
                  How to Reach Us
                </h2>

                {contactOptions.map(({ id, icon: Icon, label, value, note, href, color }) => (
                  <a
                    key={id}
                    id={id}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    style={{
                      display: "flex",
                      gap: "1.25rem",
                      alignItems: "center",
                      padding: "1.25rem",
                      borderRadius: "var(--border-radius-xl)",
                      border: "1px solid var(--border-color)",
                      background: "white",
                      textDecoration: "none",
                      marginBottom: "1rem",
                      boxShadow: "var(--shadow-sm)",
                    }}
                    className="contact-option"
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "var(--border-radius-lg)",
                        background: color + "20",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-400)", fontWeight: 500, marginBottom: "0.125rem" }}>
                        {label}
                      </div>
                      <div style={{ fontWeight: 700, color: "var(--brand-navy)", fontSize: "1rem" }}>
                        {value}
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>{note}</div>
                    </div>
                    <ArrowRight size={18} style={{ marginLeft: "auto", color: "var(--gray-400)", flexShrink: 0 }} />
                  </a>
                ))}

                {/* Service area note */}
                <div
                  style={{
                    background: "var(--brand-lavender)",
                    borderRadius: "var(--border-radius-xl)",
                    padding: "1.25rem",
                    border: "1px solid rgba(108,63,255,0.15)",
                    marginTop: "1.5rem",
                  }}
                >
                  <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }}>
                    <MapPin size={18} color="var(--brand-purple)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: "0.375rem" }}>Service Area</div>
                      <p style={{ color: "var(--gray-600)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                        We serve Bangalore, Karnataka. Pickup and delivery available across eligible areas.
                        Coverage for your specific location will be confirmed when you submit an enquiry.
                      </p>
                      <Link
                        href="/service-areas/bangalore"
                        style={{
                          color: "var(--brand-purple)",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        Check your area <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick enquiry card */}
              <QuickEnquiryForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
