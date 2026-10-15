import Header from "../components/Header";
import Footer from "../components/Footer";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Star,
  CheckCircle2,
  Wrench,
  Shield,
  Clock,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Device Repair Services — iPhone, Screen, Battery & More in Bangalore",
  description:
    "Explore FixUrDevice's repair services for iPhones, Android phones, tablets, and laptops in Bangalore. Screen replacement, battery, water damage, charging port, camera repair and more. No upfront payment — clear quotation first.",
};

const services = [
  {
    image: "/images/services/screen-replacement.jpg",
    title: "Screen Replacement",
    slug: "screen-replacement",
    description:
      "Cracked, shattered, or unresponsive screens replaced for iPhones, Android phones, and tablets with premium OEM-grade display units.",
    features: ["iPhone OLED/Retina", "Samsung AMOLED", "OnePlus & Pixel", "Touch Quality Tested"],
    badge: "Most Requested",
  },
  {
    image: "/images/services/battery-replacement.jpg",
    title: "Battery Replacement",
    slug: "battery-replacement",
    description:
      "Poor battery backup, sudden shutdown, heating, or swollen battery? We install certified high-capacity battery units with warranty.",
    features: ["Health Diagnostics", "iPhone Health 100%", "High Capacity Cells", "Thermal Adhesive"],
  },
  {
    image: "/images/services/water-damage-repair.jpg",
    title: "Water Damage Repair",
    slug: "water-damage-repair",
    description:
      "Liquid damage diagnosis, ultrasonic chemical board wash, and micro-soldering inspection to prevent irreversible corrosion.",
    features: ["Ultrasonic Wash", "Short Circuit Detection", "Corrosion Removal", "Chip-Level Diagnostics"],
    badge: "Specialist Lab",
  },
  {
    image: "/images/services/charging-port-repair.jpg",
    title: "Charging Port Repair",
    slug: "charging-port-repair",
    description:
      "Damaged, loose, or non-functional charging ports repaired or replaced. Works with Lightning, USB-C, and fast charging docks.",
    features: ["USB-C & Lightning", "Micro-Soldering", "Fast Charge Restored", "Microphone Flex Check"],
  },
  {
    image: "/images/services/iphone-repair.jpg",
    title: "iPhone Repair",
    slug: "iphone-screen-replacement",
    description:
      "Specialised Apple iPhone hardware service covering screen, battery, camera, Face ID TrueDepth module, and motherboard logic repairs.",
    features: ["All iPhone Models", "Original Grade Parts", "Face ID Preservation", "True Tone Transfer"],
    badge: "iPhone Specialist",
  },
  {
    image: "/images/services/camera-repair.jpg",
    title: "Camera Repair",
    slug: "camera-repair",
    description:
      "Blurry focus, scratched sapphire lens, black viewfinder, or jittering optical image stabilization repaired with genuine modules.",
    features: ["Ultra-Wide & Telephoto", "Sapphire Glass Lens", "OIS Calibration", "Front TrueDepth Camera"],
  },
  {
    image: "/images/services/speaker-repair.jpg",
    title: "Speaker & Audio Repair",
    slug: "speaker-microphone-repair",
    description:
      "Low sound, distorted volume, crackling audio, or caller can't hear you? Ultrasonic dust mesh cleaning and audio module replacement.",
    features: ["Stereo Earpiece", "Loudspeaker Module", "Dual Microphones", "Audio IC Chip"],
  },
  {
    image: "/images/services/biometric-repair.jpg",
    title: "Face ID & Logic Board",
    slug: "biometric-repair",
    description:
      "Face ID 'Move iPhone Higher/Lower' errors, Touch ID flex damage, and advanced motherboard micro-soldering by certified engineers.",
    features: ["Face ID Programmer", "Dot Projector Repair", "Flood Illuminator", "Power IC Restoration"],
  },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section
          style={{
            background: "var(--gradient-hero)",
            padding: "4.5rem 0 3.5rem",
            textAlign: "center",
          }}
        >
          <div className="container">
            <div className="section-label" style={{ justifyContent: "center" }}>
              <Wrench size={12} />
              Professional Repair Services
            </div>
            <h1 className="display-1" style={{ marginBottom: "1rem" }}>
              Expert Device Repair in{" "}
              <span className="text-gradient">Bangalore</span>
            </h1>
            <p
              style={{
                color: "var(--gray-600)",
                fontSize: "1.0625rem",
                maxWidth: "580px",
                margin: "0 auto 2rem",
                lineHeight: 1.7,
              }}
            >
              Professional device repair with transparent quotations. Select your issue and request an assessment — we handle everything with convenient pickup and delivery across Bangalore.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/book-repair" className="btn btn-primary btn-lg">
                Request a Repair <ArrowRight size={18} />
              </Link>
              <a href="tel:9343584460" className="btn btn-secondary btn-lg">
                Call: 93435 84460
              </a>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="section">
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1.75rem",
              }}
              className="services-grid"
            >
              {services.map((service) => (
                <div
                  key={service.slug}
                  className="service-card hover-lift"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "var(--border-radius-xl)",
                    border: "1px solid var(--border-color)",
                    background: "white",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-sm)",
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* Photo Header */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "210px",
                      overflow: "hidden",
                      background: "#0f172a",
                    }}
                  >
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(15,23,42,0.45) 0%, transparent 60%)",
                      }}
                    />
                    {service.badge && (
                      <div
                        className="badge badge-purple"
                        style={{
                          position: "absolute",
                          top: "0.85rem",
                          right: "0.85rem",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
                          zIndex: 2,
                        }}
                      >
                        <Star size={10} />
                        {service.badge}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h2
                      style={{
                        fontWeight: 700,
                        fontSize: "1.15rem",
                        marginBottom: "0.5rem",
                        color: "var(--brand-navy)",
                      }}
                    >
                      {service.title}
                    </h2>
                    <p
                      style={{
                        color: "var(--gray-500)",
                        fontSize: "0.875rem",
                        lineHeight: 1.6,
                        marginBottom: "1.25rem",
                        flex: 1,
                      }}
                    >
                      {service.description}
                    </p>

                    {/* Features tags */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.375rem",
                        marginBottom: "1.25rem",
                      }}
                    >
                      {service.features.map((f) => (
                        <span
                          key={f}
                          style={{
                            padding: "0.25rem 0.625rem",
                            background: "var(--gray-100)",
                            borderRadius: "var(--border-radius-full)",
                            fontSize: "0.75rem",
                            color: "var(--gray-700)",
                            fontWeight: 500,
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/services/${service.slug}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--brand-purple)",
                        textDecoration: "none",
                      }}
                    >
                      View service details <ChevronRight size={14} />
                    </Link>
                  </div>

                  {/* Bottom Action */}
                  <div
                    style={{
                      padding: "1rem 1.5rem",
                      borderTop: "1px solid var(--border-color)",
                      background: "var(--gray-50)",
                    }}
                  >
                    <Link
                      href="/book-repair"
                      className="btn btn-primary btn-sm"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      Request This Repair
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Diagnostic Notice Banner */}
        <section
          style={{
            background: "var(--brand-lavender)",
            borderTop: "1px solid rgba(108,63,255,0.15)",
            borderBottom: "1px solid rgba(108,63,255,0.15)",
            padding: "3rem 0",
          }}
        >
          <div className="container" style={{ textAlign: "center", maxWidth: "680px" }}>
            <h2 style={{ fontWeight: 700, marginBottom: "0.75rem" }}>
              Transparent Quotations — No Fixed Prices Displayed
            </h2>
            <p style={{ color: "var(--gray-600)", lineHeight: 1.7, fontSize: "0.9375rem", marginBottom: "1.5rem" }}>
              Every repair is unique. We do not list standard pricing because costs depend on device model, specific damage, and required parts. We diagnose your device first and provide a detailed quotation for your approval.
            </p>
            <Link href="/book-repair" className="btn btn-primary">
              Book Diagnosis &amp; Quotation
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
