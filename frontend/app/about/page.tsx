import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import { ArrowRight, Target, Users, Wrench, MapPin, Phone, Shield, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About FixUrDevice — Professional Device Repair in Bangalore",
  description:
    "Learn about FixUrDevice — a professional device repair service in Bangalore offering pickup and delivery. Our approach: honest assessment, clear quotation, quality repair.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section style={{ background: "var(--gradient-hero)", padding: "4rem 0 3rem" }}>
          <div className="container">
            <div style={{ maxWidth: 680 }}>
              <div className="section-label">
                <Users size={12} />
                About Us
              </div>
              <h1 className="display-1" style={{ marginBottom: "1.25rem" }}>
                About FixUrDevice
              </h1>
              <p style={{ color: "var(--gray-500)", fontSize: "1.125rem", lineHeight: 1.8, marginBottom: "2rem" }}>
                FixUrDevice is a professional device repair service based in Bangalore, Karnataka. We provide repair support for iPhones, Android phones, tablets, and laptops — with the convenience of pickup and delivery.
              </p>
              <Link href="/book-repair" className="btn btn-primary btn-lg">
                Request a Repair <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Our approach */}
        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="about-grid">
              <div>
                <div className="section-label">
                  <Target size={12} />
                  Our Approach
                </div>
                <h2 className="display-2" style={{ marginBottom: "1.25rem" }}>
                  Repair Done Right
                </h2>
                <p style={{ color: "var(--gray-500)", lineHeight: 1.8, marginBottom: "1.25rem" }}>
                  Our approach to device repair is built on transparency. Before any chargeable work begins, we assess your device, diagnose the problem, and provide you with a clear quotation. You decide whether to proceed.
                </p>
                <p style={{ color: "var(--gray-500)", lineHeight: 1.8, marginBottom: "2rem" }}>
                  We believe a repair service should be straightforward. No invented prices. No surprise charges. No repair without your knowledge and approval.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    "We diagnose before we quote",
                    "You approve before we repair",
                    "We quality-check before we return",
                    "We don't display prices online — every device is assessed individually",
                  ].map((point) => (
                    <div key={point} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                      <CheckCircle2 size={18} color="var(--brand-purple)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: "var(--gray-700)", fontSize: "0.9375rem", lineHeight: 1.5 }}>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div
                  style={{
                    background: "var(--brand-navy)",
                    borderRadius: "var(--border-radius-2xl)",
                    padding: "2.5rem",
                    color: "white",
                  }}
                >
                  <h3 style={{ fontWeight: 700, fontSize: "1.375rem", marginBottom: "2rem" }}>
                    What We Stand For
                  </h3>
                  {[
                    {
                      icon: Shield,
                      title: "Transparency",
                      desc: "Clear quotations, no hidden charges, honest assessment of what we can and can't fix.",
                    },
                    {
                      icon: Wrench,
                      title: "Quality",
                      desc: "Quality parts, trained technicians, and quality checks before your device is returned.",
                    },
                    {
                      icon: Users,
                      title: "Customer First",
                      desc: "Your approval is required before chargeable work begins. You&apos;re always in control.",
                    },
                    {
                      icon: MapPin,
                      title: "Convenience",
                      desc: "Pickup and delivery across Bangalore so you don't have to visit a service centre.",
                    },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "var(--border-radius)", background: "rgba(108,63,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={20} color="#a78bfa" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: "0.25rem" }}>{title}</div>
                        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.6 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service area */}
        <section style={{ background: "var(--gray-50)", padding: "3rem 0" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="section-label" style={{ justifyContent: "center" }}>
              <MapPin size={12} />
              Service Area
            </div>
            <h2 style={{ fontWeight: 700, fontSize: "1.75rem", marginBottom: "1rem" }}>
              Serving Bangalore, Karnataka
            </h2>
            <p style={{ color: "var(--gray-500)", maxWidth: 560, margin: "0 auto 2rem", lineHeight: 1.7 }}>
              We provide pickup and delivery across eligible areas of Bangalore. Coverage for your specific location will be confirmed when you submit an enquiry.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/service-areas/bangalore" className="btn btn-primary">
                Check Your Area <ArrowRight size={16} />
              </Link>
              <Link href="/book-repair" className="btn btn-secondary">
                Request a Repair
              </Link>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section style={{ padding: "3rem 0" }}>
          <div className="container">
            <div
              style={{
                background: "var(--gradient-brand)",
                borderRadius: "var(--border-radius-2xl)",
                padding: "3rem",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "2rem",
                alignItems: "center",
                color: "white",
              }}
              className="contact-banner"
            >
              <div>
                <h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "0.625rem" }}>
                  Have a Question?
                </h2>
                <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                  Reach out to our team and we&apos;ll get back to you with the information you need.
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.875rem", flexShrink: 0, flexWrap: "wrap" }}>
                <Link href="/contact" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1.5rem", background: "rgba(255,255,255,0.15)", color: "white", borderRadius: "var(--border-radius-full)", fontWeight: 600, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                  <Phone size={16} />
                  Contact Us
                </Link>
                <Link href="/book-repair" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.875rem 1.5rem", background: "white", color: "var(--brand-purple)", borderRadius: "var(--border-radius-full)", fontWeight: 700, textDecoration: "none" }}>
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
