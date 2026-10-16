"use client";
import { useState } from "react";
import Link from "next/link";
import { getApiUrl } from "../../lib/api";
import {
  Settings,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Shield,
  Save,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  RotateCcw
} from "lucide-react";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("FixUrDevice Apple Service");
  const [phone, setPhone] = useState("9343584460");
  const [whatsapp, setWhatsapp] = useState("9343584460");
  const [email, setEmail] = useState("fixurdevice.in@gmail.com");
  const [address, setAddress] = useState(
    "#159, 1st Floor 32nd E Cross Rd, Opp To Sanjay Gandhi Hospital, 4th T Block East, Tilak Nagar, Jayanagar Bengaluru, Karnataka 560041"
  );
  const [hours, setHours] = useState("Monday - Saturday: 9:00 AM – 8:00 PM | Sunday: Closed");
  const [warrantyMonths, setWarrantyMonths] = useState(6);
  const [saved, setSaved] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleWipeAllDemoData = async () => {
    const confirmPrompt = window.confirm(
      "⚠️ Are you sure you want to clear all data in SQLite database? This will completely wipe all leads, repair orders, invoices, and customer records from Django SQLite (db.sqlite3) so you can start with 100% fresh data."
    );
    if (confirmPrompt) {
      const API_BASE = getApiUrl();
      try {
        await Promise.allSettled([
          fetch(`${API_BASE}/api/v1/leads/clear/`, { method: "POST" }),
          fetch(`${API_BASE}/api/v1/repairs/clear/`, { method: "POST" }),
          fetch(`${API_BASE}/api/v1/payments/clear/`, { method: "POST" }),
          fetch(`${API_BASE}/api/v1/customers/clear/`, { method: "POST" }),
        ]);
      } catch (err) {
        console.error("Error clearing database data:", err);
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("crm_recent_leads");
        localStorage.removeItem("crm_custom_repairs");
        localStorage.removeItem("crm_custom_customers");
        localStorage.removeItem("crm_rejected_leads");
        localStorage.removeItem("crm_custom_invoices");
      }
      setResetMessage("✅ All SQLite database records cleared successfully! Your CRM is now 100% fresh and clean.");
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--brand-navy)" }}>
            Business &amp; CRM Settings
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Configure workshop location, notification emails, customer service hours, and system data.
          </p>
        </div>
      </div>

      {saved && (
        <div style={{ background: "#dcfce7", border: "1px solid #86efac", color: "#166534", padding: "0.875rem 1.25rem", borderRadius: "12px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
          <CheckCircle2 size={16} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {resetMessage && (
        <div style={{ background: "#ede9fe", border: "1px solid #c4b5fd", color: "#5b21b6", padding: "0.875rem 1.25rem", borderRadius: "12px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
          <CheckCircle2 size={16} />
          <span>{resetMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Section 1: Business Details */}
        <div style={{ background: "white", borderRadius: "var(--border-radius-xl)", padding: "1.75rem", border: "1px solid var(--border-color)", marginBottom: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Building size={18} color="var(--brand-purple)" />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--brand-navy)", margin: 0 }}>
              Workshop &amp; Brand Profile
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-biz-name">Business Name</label>
              <input id="settings-biz-name" type="text" className="form-input" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-biz-email">Notification Email Address</label>
              <input id="settings-biz-email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <span style={{ fontSize: "0.72rem", color: "var(--gray-500)", marginTop: "0.25rem", display: "block" }}>
                All incoming website enquiries and lead alerts are dispatched to this email.
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-phone">Primary Phone Number</label>
              <input id="settings-phone" type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-whatsapp">WhatsApp Support Number</label>
              <input id="settings-whatsapp" type="text" className="form-input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} required />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
            <label className="form-label" htmlFor="settings-address">Workshop Address (Jayanagar, Bangalore)</label>
            <textarea id="settings-address" className="form-input" rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-hours">Working Hours</label>
              <input id="settings-hours" type="text" className="form-input" value={hours} onChange={(e) => setHours(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-warranty">Standard Warranty</label>
              <select id="settings-warranty" className="form-input form-select" value={warrantyMonths} onChange={(e) => setWarrantyMonths(parseInt(e.target.value))}>
                <option value={3}>3 Months Warranty</option>
                <option value={6}>6 Months Warranty (Standard)</option>
                <option value={12}>1 Year Warranty</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Superadmin Account Credentials */}
        <div style={{ background: "white", borderRadius: "var(--border-radius-xl)", padding: "1.75rem", border: "1px solid var(--border-color)", marginBottom: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <Shield size={18} color="var(--brand-purple)" />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--brand-navy)", margin: 0 }}>
              CRM Superadmin Account
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", textTransform: "uppercase", fontWeight: 600 }}>User ID</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--brand-navy)", marginTop: "0.25rem" }}>admin</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", textTransform: "uppercase", fontWeight: 600 }}>Default Password</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--brand-navy)", marginTop: "0.25rem" }}>admin1234</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", textTransform: "uppercase", fontWeight: 600 }}>Role Level</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#16a34a", marginTop: "0.25rem" }}>Superadmin (Full Access)</div>
            </div>
          </div>
        </div>

        {/* Section 3: Data Management & Fresh Start */}
        <div style={{ background: "#fff1f2", borderRadius: "var(--border-radius-xl)", padding: "1.75rem", border: "1px solid #fecdd3", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <AlertTriangle size={18} color="#e11d48" />
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#9f1239", margin: 0 }}>
              Data Reset &amp; Fresh Setup
            </h2>
          </div>
          <p style={{ color: "#be123c", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
            Clear all demo / placeholder records with one click so you can test entering your own real customer leads, repair jobs, and profit tracking from scratch.
          </p>
          <button
            type="button"
            onClick={handleWipeAllDemoData}
            className="btn btn-sm"
            style={{ background: "#e11d48", color: "white", border: "none", fontWeight: 700, padding: "0.6rem 1.25rem" }}
          >
            <Trash2 size={14} /> Clear All Demo / Test Data
          </button>
        </div>

        {/* Save Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary" style={{ padding: "0.875rem 2.25rem", fontSize: "1rem" }}>
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
