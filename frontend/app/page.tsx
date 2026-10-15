import Header from "./components/Header";
import Footer from "./components/Footer";
import Link from "next/link";
import Image from "next/image";
import heroGraphic from "./hero.png";
import {
  Smartphone,
  Battery,
  Monitor,
  Droplets,
  Plug,
  Camera,
  Truck,
  Shield,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  MapPin,
  MessageSquare,
  ThumbsUp,
  Wrench,
  Package,
  PhoneCall,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FixUrDevice — Device Repair with Pickup & Delivery in Bangalore",
  description:
    "FixUrDevice offers professional iPhone, smartphone, tablet, and laptop repair in Bangalore with convenient pickup and delivery. Request a repair assessment today. No upfront charges.",
};

const services = [
  {
    image: "/images/services/screen-replacement.jpg",
    title: "Screen Replacement",
    description:
      "Cracked, bleeding, or unresponsive screen? We install premium OEM-grade display panels for iPhones, Android phones, and tablets.",
    slug: "screen-replacement",
    badge: "Most Popular",
  },
  {
    image: "/images/services/battery-replacement.jpg",
    title: "Battery Replacement",
    description:
      "Battery draining fast, swollen, or shutting down? We test and replace batteries with certified high-capacity cells.",
    slug: "battery-replacement",
  },
  {
    image: "/images/services/water-damage-repair.jpg",
    title: "Water Damage Repair",
    description:
      "Ultrasonic cleaning and chip-level logic board diagnostics to recover liquid-damaged phones and restore functionality.",
    slug: "water-damage-repair",
  },
  {
    image: "/images/services/charging-port-repair.jpg",
    title: "Charging Port Repair",
    description:
      "Loose cable, slow charging, or unrecognised connector? Precision cleaning, repair, or full port flex replacement.",
    slug: "charging-port-repair",
  },
  {
    image: "/images/services/iphone-repair.jpg",
    title: "iPhone Repair",
    description:
      "Specialised Apple iPhone service covering displays, batteries, cameras, Face ID sensors, and micro-soldering.",
    slug: "iphone-screen-replacement",
    badge: "iPhone Specialist",
  },
  {
    image: "/images/services/camera-repair.jpg",
    title: "Camera Repair",
    description:
      "Blurry focus, cracked sapphire lens, or jittering optical stabilizer? Genuine front and rear camera replacement.",
    slug: "camera-repair",
  },
  {
    image: "/images/services/speaker-repair.jpg",
    title: "Speaker & Audio Repair",
    description:
      "Low sound, muffled earpiece, or microphone distortion? Ultrasonic dust cleaning and precision module replacement.",
    slug: "speaker-microphone-repair",
  },
  {
    image: "/images/services/biometric-repair.jpg",
    title: "Face ID & Motherboard Repair",
    description:
      "Face ID dot projector errors, logic board short circuits, and micro-soldering component restoration by certified engineers.",
    slug: "biometric-repair",
    badge: "Lab Specialist",
  },
];

const benefits = [
  {
    icon: Truck,
    title: "Pickup & Delivery",
    description: "We collect your device and return it after repair.",
  },
  {
    icon: MessageSquare,
    title: "Clear Updates",
    description: "Stay informed at every stage of your repair.",
  },
  {
    icon: Shield,
    title: "Quality Parts",
    description: "We use quality components suited to your device.",
  },
  {
    icon: Clock,
    title: "Efficient Turnaround",
    description: "We aim for prompt diagnosis and repair.",
  },
];

const processSteps = [
  {
    step: 1,
    title: "Submit a Repair Enquiry",
    description:
      "Tell us about your device and the issue through our simple online form. No upfront payment needed.",
  },
  {
    step: 2,
    title: "Confirm Location & Pickup",
    description:
      "We confirm service availability in your area and schedule a convenient pickup time.",
  },
  {
    step: 3,
    title: "Device Collected",
    description:
      "Our executive collects your device at the agreed time. You receive a confirmation.",
  },
  {
    step: 4,
    title: "Diagnosis & Quotation",
    description:
      "Our technicians diagnose the issue and send you a detailed quotation. No repair without your approval.",
  },
  {
    step: 5,
    title: "Repair & Quality Check",
    description:
      "Upon your approval, we carry out the repair and perform thorough quality checks before delivery.",
  },
  {
    step: 6,
    title: "Delivery & Completion",
    description:
      "Your repaired device is delivered back to you. Payment is collected on satisfactory completion.",
  },
];

const faqs = [
  {
    q: "Do you show prices on your website?",
    a: "We do not display service prices on our website. Each device and issue is unique — repair costs depend on the specific problem, parts required, and the work involved. We provide a clear quotation after diagnosing your device, and you decide whether to proceed.",
  },
  {
    q: "Which areas in Bangalore do you cover for pickup?",
    a: "We serve multiple areas across Bangalore. Coverage for your specific location will be confirmed when you submit an enquiry. We are continuously expanding our pickup coverage.",
  },
  {
    q: "What happens if I don't approve the quotation?",
    a: "If you choose not to proceed with the repair after receiving the quotation, we return your device. There may be a diagnostic charge depending on the circumstances — this will be communicated to you before any work begins.",
  },
  {
    q: "How long does a typical repair take?",
    a: "Turnaround time varies by the type of repair and parts availability. We provide an estimated completion timeframe with your quotation. We keep you updated throughout the process.",
  },
  {
    q: "Do you repair all phone brands?",
    a: "We service a wide range of devices including iPhones, Samsung, OnePlus, Xiaomi, and more. If you're unsure whether we can help with your device, submit an enquiry and we'll let you know.",
  },
  {
    q: "Is my data safe during repair?",
    a: "We recommend backing up your device before handing it over. Our technicians focus on the hardware — we do not access your personal data. We handle all devices with care and professionalism.",
  },
];

const whyUs = [
  {
    icon: ThumbsUp,
    title: "Honest Assessments",
    description:
      "We diagnose first and quote transparently. You only pay if you approve the repair.",
  },
  {
    icon: Wrench,
    title: "Trained Technicians",
    description:
      "Our repair team works specifically on mobile devices and consumer electronics.",
  },
  {
    icon: Package,
    title: "Convenient Process",
    description:
      "No need to visit a service centre. We handle pickup and delivery at your preferred time.",
  },
  {
    icon: PhoneCall,
    title: "Responsive Support",
    description:
      "Our team keeps you updated and responds to queries throughout the repair process.",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* HERO SECTION */}
        <section
          className="hero"
          style={{ padding: "5rem 0 6rem", position: "relative" }}
          aria-label="Hero section"
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "3rem",
                alignItems: "center",
              }}
              className="hero-grid"
            >
              {/* Text */}
              <div>
                <div className="section-label animate-fade-in-up">
                  <MapPin size={12} />
                  Serving Bangalore, Karnataka
                </div>
                <h1
                  className="display-1 animate-fade-in-up animate-delay-100"
                  style={{ color: "var(--brand-navy)", marginBottom: "1.25rem" }}
                >
                  Device Repair,{" "}
                  <span className="text-gradient">Made Convenient.</span>
                </h1>
                <p
                  className="animate-fade-in-up animate-delay-200"
                  style={{
                    fontSize: "1.125rem",
                    color: "var(--gray-600)",
                    lineHeight: 1.7,
                    marginBottom: "2rem",
                    maxWidth: "480px",
                  }}
                >
                  Professional repair support with pickup and delivery across eligible areas of Bangalore. Submit an enquiry — we&apos;ll assess your device and quote before we begin.
                </p>
                <div
                  className="animate-fade-in-up animate-delay-300"
                  style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
                >
                  <Link
                    href="/book-repair"
                    id="hero-request-repair-cta"
                    className="btn btn-primary btn-lg"
                  >
                    Request a Repair
                    <ArrowRight size={18} />
                  </Link>
                  <Link href="/services" className="btn btn-secondary btn-lg">
                    Explore Services
                  </Link>
                </div>

                {/* Trust indicators */}
                <div
                  className="animate-fade-in-up animate-delay-400"
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    marginTop: "2.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { label: "Pickup & Delivery" },
                    { label: "Quote Before Repair" },
                    { label: "Quality Parts" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "var(--gray-600)",
                      }}
                    >
                      <CheckCircle2 size={16} color="var(--brand-purple)" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Visual - Floating directly without container */}
              <div
                className="animate-fade-in-up animate-delay-200"
                style={{
                  position: "relative",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  src={heroGraphic}
                  alt="FixUrDevice — Expert Device Repair with Quote Before Repair and Pickup & Delivery in Bangalore"
                  priority
                  sizes="(max-width: 768px) 100vw, 580px"
                  style={{
                    width: "100%",
                    maxWidth: 580,
                    height: "auto",
                    display: "block",
                    filter: "drop-shadow(0 20px 40px rgba(108, 63, 255, 0.18))",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS BAR */}
        <section
          style={{
            background: "white",
            borderBottom: "1px solid var(--border-color)",
            padding: "2.5rem 0",
          }}
        >
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "2rem",
              }}
              className="benefits-grid"
            >
              {benefits.map((b) => (
                <div
                  key={b.title}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, rgba(108, 63, 255, 0.12) 0%, rgba(79, 70, 229, 0.04) 100%)",
                      border: "1.5px solid rgba(108, 63, 255, 0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(108, 63, 255, 0.08)",
                    }}
                  >
                    <b.icon size={22} color="var(--brand-purple)" strokeWidth={1.9} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "0.9375rem" }}>
                      {b.title}
                    </div>
                    <div style={{ color: "var(--gray-500)", fontSize: "0.8125rem", lineHeight: 1.5 }}>
                      {b.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="section" style={{ background: "var(--gray-50)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="section-label">
                <Wrench size={12} />
                What We Fix
              </div>
              <h2 className="display-2" style={{ marginBottom: "1rem" }}>
                Repair Services We Offer
              </h2>
              <p
                style={{
                  color: "var(--gray-500)",
                  fontSize: "1.0625rem",
                  maxWidth: "560px",
                  margin: "0 auto",
                  lineHeight: 1.7,
                }}
              >
                We specialise in device repairs for iPhones and a wide range of smartphones. Each repair begins with a diagnosis and clear quotation.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1.5rem",
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
                  {/* Service Photo */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "195px",
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
                        background: "linear-gradient(to top, rgba(15,23,42,0.4) 0%, transparent 60%)",
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

                  {/* Service Content */}
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "0.5rem", color: "var(--brand-navy)" }}>
                      {service.title}
                    </h3>
                    <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.25rem", flex: 1 }}>
                      {service.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
                        Learn more <ChevronRight size={14} />
                      </Link>
                    </div>
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

            <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
              <Link href="/services" className="btn btn-secondary">
                View All Services <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section">
          <div className="container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "4rem",
                alignItems: "start",
              }}
              className="process-grid"
            >
              <div style={{ position: "sticky", top: "7rem" }}>
                <div className="section-label">
                  <Clock size={12} />
                  The Process
                </div>
                <h2 className="display-2" style={{ marginBottom: "1rem" }}>
                  How It Works
                </h2>
                <p style={{ color: "var(--gray-500)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                  A simple, transparent process from enquiry to delivery. You&apos;re in control at every step.
                </p>
                <Link href="/how-it-works" className="btn btn-secondary">
                  Full Process Details <ChevronRight size={16} />
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {processSteps.map((step, i) => (
                  <div
                    key={step.step}
                    style={{
                      display: "flex",
                      gap: "1.25rem",
                      alignItems: "flex-start",
                      padding: "1.25rem",
                      borderRadius: "var(--border-radius-xl)",
                      border: "1px solid var(--border-color)",
                      background: "white",
                      transition: "all 0.2s",
                    }}
                  >
                    <div className="process-step-number">{step.step}</div>
                    <div>
                      <h3 style={{ fontWeight: 700, marginBottom: "0.375rem" }}>
                        {step.title}
                      </h3>
                      <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section className="section" style={{ background: "var(--brand-navy)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div
                className="section-label"
                style={{ background: "rgba(108,63,255,0.2)", color: "#a78bfa" }}
              >
                <Star size={12} />
                Why FixUrDevice
              </div>
              <h2 className="display-2" style={{ color: "white", marginBottom: "1rem" }}>
                Why Choose Us
              </h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1.0625rem", maxWidth: "500px", margin: "0 auto" }}>
                We focus on transparency, quality, and convenience — so you get your device back in good hands.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1.5rem",
              }}
              className="why-grid"
            >
              {whyUs.map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "var(--border-radius-xl)",
                    padding: "1.75rem 1.5rem",
                    transition: "all 0.3s",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "16px",
                      background: "linear-gradient(135deg, #6c3fff 0%, #4f46e5 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.25rem",
                      boxShadow: "0 8px 24px rgba(108, 63, 255, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <item.icon size={24} color="white" strokeWidth={1.9} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: "white", marginBottom: "0.5rem" }}>
                    {item.title}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICE AREA */}
        <section className="section">
          <div className="container">
            <div
              style={{
                background: "var(--gradient-hero)",
                borderRadius: "var(--border-radius-2xl)",
                padding: "3rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                alignItems: "center",
                border: "1px solid rgba(108,63,255,0.15)",
              }}
              className="area-grid"
            >
              <div>
                <div className="section-label">
                  <MapPin size={12} />
                  Service Coverage
                </div>
                <h2 className="heading-1" style={{ marginBottom: "1rem" }}>
                  We Serve Bangalore
                </h2>
                <p style={{ color: "var(--gray-500)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                  We provide pickup and delivery across eligible areas of Bangalore, Karnataka. Coverage for your specific location will be confirmed when you submit your enquiry.
                </p>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <Link href="/service-areas/bangalore" className="btn btn-primary">
                    Check Your Area <ArrowRight size={16} />
                  </Link>
                  <Link href="/book-repair" className="btn btn-secondary">
                    Submit Enquiry
                  </Link>
                </div>
              </div>
              <div
                style={{
                  background: "white",
                  borderRadius: "var(--border-radius-xl)",
                  padding: "1.5rem",
                  boxShadow: "var(--shadow-card)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "1.25rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "var(--brand-lavender)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MapPin size={18} color="var(--brand-purple)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Bangalore Coverage</div>
                    <div style={{ color: "var(--gray-500)", fontSize: "0.8125rem" }}>
                      Pickup &amp; Delivery Service
                    </div>
                  </div>
                </div>
                {[
                  "Koramangala",
                  "Indiranagar",
                  "HSR Layout",
                  "Whitefield",
                  "Jayanagar",
                  "Marathahalli",
                ].map((area) => (
                  <div
                    key={area}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.375rem 0",
                      color: "var(--gray-600)",
                      fontSize: "0.875rem",
                    }}
                  >
                    <CheckCircle2 size={14} color="var(--success)" />
                    {area}
                  </div>
                ))}
                <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)", color: "var(--gray-400)", fontSize: "0.8125rem" }}>
                  + many more areas. Submit an enquiry to confirm.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="section" style={{ background: "var(--gray-50)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="section-label">
                <MessageSquare size={12} />
                FAQs
              </div>
              <h2 className="display-2" style={{ marginBottom: "1rem" }}>
                Frequently Asked Questions
              </h2>
            </div>
            <div
              style={{
                maxWidth: "760px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="faq-item"
                  style={{ background: "white" }}
                >
                  <summary
                    style={{
                      padding: "1.25rem 1.5rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      listStyle: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      color: "var(--brand-navy)",
                    }}
                  >
                    {faq.q}
                    <ChevronRight
                      size={18}
                      style={{ flexShrink: 0, color: "var(--brand-purple)" }}
                    />
                  </summary>
                  <div
                    style={{
                      padding: "0 1.5rem 1.25rem",
                      color: "var(--gray-600)",
                      fontSize: "0.9375rem",
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <Link href="/faq" className="btn btn-secondary">
                View All FAQs <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          className="section"
          style={{
            background: "var(--gradient-brand)",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50%",
              right: "5%",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              pointerEvents: "none",
            }}
          />
          <div className="container" style={{ position: "relative", textAlign: "center" }}>
            <div
              className="section-label"
              style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
            >
              Get Started Today
            </div>
            <h2
              className="display-2"
              style={{ color: "white", marginBottom: "1.25rem" }}
            >
              Ready to Fix Your Device?
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "1.125rem",
                maxWidth: "520px",
                margin: "0 auto 2rem",
                lineHeight: 1.7,
              }}
            >
              Submit an enquiry and we&apos;ll get back to you. No upfront payment. No surprises — just a clear diagnosis and quotation.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/book-repair"
                id="footer-cta-book-repair"
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
                  transition: "all 0.2s",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              >
                Request a Repair <ArrowRight size={18} />
              </Link>
              <Link
                href="/contact"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "1rem 2.25rem",
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  borderRadius: "var(--border-radius-full)",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  transition: "all 0.2s",
                }}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
