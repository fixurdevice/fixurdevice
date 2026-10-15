"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import levloxLogo from "@/app/levlox_logo.png";
import { Menu, X, ChevronDown, Phone } from "lucide-react";

const navLinks = [
  {
    label: "Repair Services",
    href: "/services",
    dropdown: [
      { label: "iPhone Repair", href: "/services/iphone-screen-replacement" },
      { label: "Screen Replacement", href: "/services/screen-replacement" },
      { label: "Battery Replacement", href: "/services/battery-replacement" },
      { label: "Water Damage Repair", href: "/services/water-damage-repair" },
      { label: "All Services", href: "/services" },
    ],
  },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Service Areas", href: "/service-areas/bangalore" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <div className="container">
          <span>
            🔧 Device repair with pickup &amp; delivery across Bangalore —{" "}
            <Link
              href="/book-repair"
              style={{ color: "#a78bfa", fontWeight: 600 }}
            >
              Request a Repair →
            </Link>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <header
        className="nav"
        style={{
          boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
        }}
      >
        <div className="nav-inner">
          {/* Logo */}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}
          >
            <Image
              src={levloxLogo}
              alt="FixUrDevice Logo"
              width={46}
              height={46}
              priority
              style={{
                width: "46px",
                height: "46px",
                objectFit: "contain",
              }}
            />
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.125rem", color: "var(--brand-navy)", lineHeight: 1 }}>
                FixUrDevice
              </div>
              <div style={{ fontSize: "0.65rem", color: "var(--brand-purple)", fontWeight: 600, letterSpacing: "0.05em" }}>
                BANGALORE
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-desktop">
            {navLinks.map((link) => (
              <div
                key={link.href}
                style={{ position: "relative" }}
                onMouseEnter={() => link.dropdown && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {link.dropdown ? (
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.5rem 0.875rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      color: "var(--brand-navy)",
                      borderRadius: "var(--border-radius)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--brand-lavender)";
                      (e.currentTarget as HTMLElement).style.color = "var(--brand-purple)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "none";
                      (e.currentTarget as HTMLElement).style.color = "var(--brand-navy)";
                    }}
                  >
                    {link.label}
                    <ChevronDown size={14} />
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    style={{
                      display: "block",
                      padding: "0.5rem 0.875rem",
                      fontWeight: 500,
                      fontSize: "0.9rem",
                      color: "var(--brand-navy)",
                      textDecoration: "none",
                      borderRadius: "var(--border-radius)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--brand-lavender)";
                      (e.currentTarget as HTMLElement).style.color = "var(--brand-purple)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "none";
                      (e.currentTarget as HTMLElement).style.color = "var(--brand-navy)";
                    }}
                  >
                    {link.label}
                  </Link>
                )}

                {/* Dropdown */}
                {link.dropdown && activeDropdown === link.label && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      background: "white",
                      borderRadius: "var(--border-radius-lg)",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                      border: "1px solid var(--border-color)",
                      padding: "0.5rem",
                      minWidth: "220px",
                      zIndex: 200,
                      animation: "fadeIn 0.15s ease",
                    }}
                  >
                    {link.dropdown.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: "block",
                          padding: "0.6rem 0.875rem",
                          color: "var(--brand-navy)",
                          textDecoration: "none",
                          fontSize: "0.875rem",
                          borderRadius: "var(--border-radius-sm)",
                          transition: "all 0.2s",
                          fontWeight: 500,
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "var(--brand-lavender)";
                          (e.currentTarget as HTMLElement).style.color = "var(--brand-purple)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "none";
                          (e.currentTarget as HTMLElement).style.color = "var(--brand-navy)";
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <a
              href="tel:9343584460"
              id="header-click-to-call"
              className="nav-call-btn"
            >
              <Phone size={14} />
              93435 84460
            </a>
            <Link href="/book-repair" id="header-book-repair-cta" className="btn btn-primary btn-sm nav-book-btn">
              Request a Repair
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="nav-mobile-toggle"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div
            className="mobile-nav-drawer"
            style={{
              background: "white",
              borderTop: "1px solid var(--border-color)",
              padding: "1.25rem 1.5rem 2rem",
              boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            {/* Quick Contact Bar for Mobile */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "1.25rem",
                paddingBottom: "1.25rem",
                borderBottom: "1px solid var(--gray-100)",
              }}
            >
              <a
                href="tel:9343584460"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  background: "var(--brand-lavender)",
                  color: "var(--brand-purple-dark)",
                  borderRadius: "var(--border-radius)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                <Phone size={16} />
                Call 93435 84460
              </a>
              <a
                href="https://wa.me/919343584460?text=Hi%20FixUrDevice%2C%20I%20need%20a%20repair%20quote"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.75rem",
                  background: "#dcfce7",
                  color: "#15803d",
                  borderRadius: "var(--border-radius)",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
              >
                💬 WhatsApp
              </a>
            </div>

            {/* Mobile Navigation Links */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {navLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.85rem 0",
                      fontWeight: 600,
                      fontSize: "1rem",
                      color: "var(--brand-navy)",
                      textDecoration: "none",
                      borderBottom: "1px solid var(--gray-100)",
                    }}
                  >
                    <span>{link.label}</span>
                    <ChevronDown size={16} style={{ transform: link.dropdown ? "none" : "rotate(-90deg)", color: "var(--gray-400)" }} />
                  </Link>
                  {link.dropdown && (
                    <div
                      style={{
                        padding: "0.5rem 0 0.5rem 1rem",
                        background: "var(--gray-50)",
                        borderRadius: "var(--border-radius)",
                        margin: "0.5rem 0",
                      }}
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          style={{
                            display: "block",
                            padding: "0.5rem 0.75rem",
                            fontSize: "0.875rem",
                            color: "var(--gray-600)",
                            fontWeight: 500,
                            textDecoration: "none",
                          }}
                        >
                          → {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <Link
                href="/book-repair"
                onClick={() => setMobileOpen(false)}
                className="btn btn-primary"
                style={{
                  textAlign: "center",
                  justifyContent: "center",
                  padding: "0.875rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                }}
              >
                Request a Repair (Doorstep Pickup)
              </Link>
              <div
                style={{
                  textAlign: "center",
                  fontSize: "0.75rem",
                  color: "var(--gray-400)",
                  marginTop: "0.5rem",
                }}
              >
                📍 Jayanagar 4th Block, Bangalore • Mon-Sat 9AM-8PM
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
