import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { MapPin, CheckCircle2, ArrowRight, Clock, Truck, AlertCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Device Repair Service Areas in Bangalore — FixUrDevice",
  description:
    "FixUrDevice provides device repair with pickup and delivery across Bangalore, Karnataka. Check if we serve your area — Koramangala, Indiranagar, HSR Layout, Whitefield, and more.",
};

const areas = [
  { name: "Koramangala", pincode: "560034–560095", status: "active" },
  { name: "Indiranagar", pincode: "560038", status: "active" },
  { name: "HSR Layout", pincode: "560102", status: "active" },
  { name: "Jayanagar", pincode: "560041", status: "active" },
  { name: "JP Nagar", pincode: "560078", status: "active" },
  { name: "BTM Layout", pincode: "560076", status: "active" },
  { name: "Banashankari", pincode: "560070", status: "active" },
  { name: "Whitefield", pincode: "560066", status: "active" },
  { name: "Marathahalli", pincode: "560037", status: "active" },
  { name: "Electronic City", pincode: "560100", status: "active" },
  { name: "Sarjapur Road", pincode: "560035", status: "active" },
  { name: "Bellandur", pincode: "560103", status: "active" },
  { name: "Hebbal", pincode: "560024", status: "confirm" },
  { name: "Yelahanka", pincode: "560064", status: "confirm" },
  { name: "Rajajinagar", pincode: "560010", status: "confirm" },
  { name: "Malleswaram", pincode: "560003", status: "confirm" },
  { name: "Basavanagudi", pincode: "560004", status: "confirm" },
  { name: "Bannerghatta Road", pincode: "560083", status: "confirm" },
];

export default function BangaloreServiceAreaPage() {
  const activeAreas = areas.filter((a) => a.status === "active");
  const confirmAreas = areas.filter((a) => a.status === "confirm");

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section
          style={{ background: "var(--gradient-hero)", padding: "4rem 0 3rem" }}
        >
          <div className="container">
            <div style={{ maxWidth: 680 }}>
              <div className="section-label">
                <MapPin size={12} />
                Bangalore Coverage
              </div>
              <h1 className="display-1" style={{ marginBottom: "1.25rem" }}>
                Device Repair in Bangalore with Pickup &amp; Delivery
              </h1>
              <p style={{ color: "var(--gray-500)", fontSize: "1.0625rem", lineHeight: 1.7, marginBottom: "2rem" }}>
                FixUrDevice provides pickup and delivery for device repairs across Bangalore, Karnataka. Submit an enquiry and we&apos;ll confirm coverage for your specific location.
              </p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/book-repair" className="btn btn-primary btn-lg">
                  Request a Repair <ArrowRight size={18} />
                </Link>
                <Link href="/contact" className="btn btn-secondary btn-lg">
                  Ask About Your Area
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How pickup works */}
        <section style={{ padding: "3rem 0", background: "white", borderBottom: "1px solid var(--border-color)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }} className="pickup-benefits">
              {[
                { icon: Truck, title: "We Come to You", desc: "Our executive collects your device from your home or office at the scheduled time." },
                { icon: Clock, title: "Flexible Scheduling", desc: "Choose morning, afternoon, or evening pickup windows that suit you." },
                { icon: CheckCircle2, title: "Area Confirmation", desc: "We confirm pickup availability for your specific location before scheduling." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "var(--border-radius-lg)", background: "var(--brand-lavender)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={22} color="var(--brand-purple)" />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: "0.375rem" }}>{title}</h3>
                    <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Areas */}
        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }} className="areas-grid">
              {/* Active areas */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--success)" }} />
                  <h2 style={{ fontWeight: 700, fontSize: "1.25rem" }}>Served Areas</h2>
                  <span className="badge badge-success">{activeAreas.length} areas</span>
                </div>
                <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                  Pickup and delivery is available in these Bangalore areas. Submit an enquiry to schedule.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                  {activeAreas.map((area) => (
                    <div
                      key={area.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        padding: "0.75rem 1rem",
                        background: "white",
                        borderRadius: "var(--border-radius-lg)",
                        border: "1px solid var(--border-color)",
                        transition: "all 0.2s",
                      }}
                    >
                      <CheckCircle2 size={14} color="var(--success)" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{area.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>{area.pincode}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation required */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--warning)" }} />
                  <h2 style={{ fontWeight: 700, fontSize: "1.25rem" }}>Confirmation Required</h2>
                  <span className="badge badge-warning">{confirmAreas.length} areas</span>
                </div>
                <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                  Coverage in these areas requires confirmation before scheduling. Submit an enquiry and we&apos;ll verify availability for your location.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
                  {confirmAreas.map((area) => (
                    <div
                      key={area.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        padding: "0.75rem 1rem",
                        background: "white",
                        borderRadius: "var(--border-radius-lg)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <AlertCircle size={14} color="var(--warning)" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{area.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>{area.pincode}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Not listed */}
                <div
                  style={{
                    marginTop: "1.5rem",
                    padding: "1.25rem",
                    background: "var(--gray-50)",
                    borderRadius: "var(--border-radius-xl)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <h3 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.9375rem" }}>
                    Your area not listed?
                  </h3>
                  <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                    Submit an enquiry with your location and we&apos;ll check if we can serve you. We&apos;re continuously expanding our coverage.
                  </p>
                  <Link href="/book-repair" className="btn btn-primary btn-sm">
                    Submit Enquiry <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content */}
        <section style={{ background: "var(--gray-50)", padding: "3rem 0" }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <h2 style={{ fontWeight: 700, fontSize: "1.375rem", marginBottom: "1.25rem" }}>
              Device Repair with Pickup &amp; Delivery in Bangalore
            </h2>
            <div style={{ color: "var(--gray-600)", lineHeight: 1.8, fontSize: "0.9375rem" }}>
              <p style={{ marginBottom: "1rem" }}>
                FixUrDevice provides professional device repair services across Bangalore, Karnataka. Whether you need iPhone screen replacement, battery replacement, water damage repair, or charging port repair, we cover a wide range of device issues with the convenience of pickup and delivery.
              </p>
              <p style={{ marginBottom: "1rem" }}>
                Rather than visiting a service centre, you can submit a repair enquiry online and our team will arrange to collect your device from your home or office in Bangalore. After assessing your device, we send you a clear quotation — you only pay if you approve the repair.
              </p>
              <p>
                Our pickup service is available across major Bangalore areas including Koramangala, Indiranagar, HSR Layout, Whitefield, Jayanagar, BTM Layout, Marathahalli, Electronic City, and many more. Coverage is continuously expanding. If your area is not listed, submit an enquiry to check availability.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
