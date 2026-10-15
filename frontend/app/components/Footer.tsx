"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, Clock, ExternalLink } from "lucide-react";

const InstagramIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const footerLinks = {
  services: [
    { label: "iPhone Repair", href: "/services/iphone-screen-replacement" },
    { label: "Screen Replacement", href: "/services/screen-replacement" },
    { label: "Battery Replacement", href: "/services/battery-replacement" },
    { label: "Water Damage Repair", href: "/services/water-damage-repair" },
    { label: "Charging Port Repair", href: "/services/charging-port-repair" },
    { label: "All Services", href: "/services" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Service Areas", href: "/service-areas/bangalore" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
    { label: "Book a Repair", href: "/book-repair" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

const socials = [
  { Icon: InstagramIcon, href: "#", label: "Instagram" },
  { Icon: FacebookIcon, href: "#", label: "Facebook" },
  { Icon: XIcon, href: "#", label: "X (Twitter)" },
];

export default function Footer() {
  return (
    <footer className="footer" style={{ background: "var(--brand-navy)", color: "white", padding: "4rem 0 2rem" }}>
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 1fr 1fr 1.5fr",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <Link
              href="/"
              style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem", textDecoration: "none" }}
            >
              <Image
                src="/levlox_logo.png"
                alt="FixUrDevice Logo"
                width={46}
                height={46}
                style={{ objectFit: "contain", width: "46px", height: "46px" }}
              />
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "white", lineHeight: 1 }}>
                  FixUrDevice
                </div>
                <div style={{ fontSize: "0.7rem", color: "#a78bfa", fontWeight: 600, letterSpacing: "0.08em", marginTop: "3px" }}>
                  BANGALORE
                </div>
              </div>
            </Link>

            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.5rem", maxWidth: "300px" }}>
              Professional device repair with convenient pickup and delivery across Bangalore. Transparent assessment and quotation before any repair.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="footer-social-btn"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 style={{ color: "white", fontWeight: 700, marginBottom: "1.25rem", fontSize: "0.9375rem" }}>
              Repair Services
            </h3>
            {footerLinks.services.map((link) => (
              <Link key={link.href} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Quick Links / Company */}
          <div>
            <h3 style={{ color: "white", fontWeight: 700, marginBottom: "1.25rem", fontSize: "0.9375rem" }}>
              Quick Links
            </h3>
            {footerLinks.company.map((link) => (
              <Link key={link.href} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact Details & Workshop */}
          <div>
            <h3 style={{ color: "white", fontWeight: 700, marginBottom: "1.25rem", fontSize: "0.9375rem" }}>
              Contact & Workshop
            </h3>

            {/* Address */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
              <MapPin size={18} color="#a78bfa" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.84rem", lineHeight: 1.5, margin: 0 }}>
                  <strong style={{ color: "white", display: "block" }}>FixurDevice Apple Service</strong>
                  #159, 1st Floor 32nd E Cross Rd, Opp To Sanjay Gandhi Hospital, 4th T Block East, Tilak Nagar, Jayanagar, Bengaluru, Karnataka 560041, India
                </p>
                <a
                  href="https://www.google.com/maps/place/Fixblr/@12.9276467,77.5911674,17z"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    color: "#c4b5fd",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    textDecoration: "none",
                    marginTop: "0.35rem",
                  }}
                >
                  View on Google Maps →
                </a>
              </div>
            </div>

            {/* Phone */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <Phone size={16} color="#a78bfa" style={{ flexShrink: 0 }} />
              <a
                href="tel:9343584460"
                style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.84rem", textDecoration: "none", fontWeight: 600 }}
              >
                9343584460
              </a>
            </div>

            {/* Email */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <Mail size={16} color="#a78bfa" style={{ flexShrink: 0 }} />
              <a
                href="mailto:fixurdevice.in@gmail.com"
                style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.84rem", textDecoration: "none" }}
              >
                fixurdevice.in@gmail.com
              </a>
            </div>

            {/* Business Hours */}
            <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <Clock size={16} color="#a78bfa" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
                <span style={{ color: "white", fontWeight: 600 }}>Business Hours:</span>
                <div>Monday - Friday: 9:00 AM – 8:00 PM</div>
                <div>Saturday: 9:00 AM – 8:00 PM</div>
                <div style={{ color: "#f87171" }}>Sunday: Closed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", margin: 0 }}>
            © 2026 FixUrDevice. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8125rem", textDecoration: "none" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
