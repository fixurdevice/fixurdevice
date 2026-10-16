"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getApiUrl, authFetch } from "../../../lib/api";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Package,
  Wrench,
  FileText,
  CreditCard,
  MessageSquare,
  Edit2,
  Plus,
  ChevronRight,
  Send,
  User,
  Smartphone,
  Calendar,
  Flag,
  Activity,
  Shield,
  ExternalLink,
  RefreshCw,
  XCircle,
  Check,
  Bookmark
} from "lucide-react";

interface LeadData {
  id: string;
  lead_reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  device_name: string;
  device_color?: string;
  reported_issue: string;
  source: string;
  status: string;
  rejection_reason?: string;
  rejection_notes?: string;
  callback_date?: string;
  callback_time?: string;
  callback_notes?: string;
  callback_history?: Array<{
    id: number;
    scheduled_date: string;
    scheduled_time: string;
    notes: string;
    status: string;
    created_at: string;
  }>;
  repair_order_id?: string;
  repair_order_number?: string;
  created_at: string;
  updated_at: string;
}

const API_BASE = getApiUrl();

const SOURCE_LABELS: Record<string, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  website: "Website Enquiry",
  walk_in: "Walk-in",
  phone_call: "Phone Call",
  reference: "Reference",
  other: "Other",
};

export default function LeadDetailPage() {
  const urlParams = useParams();
  const leadId = (urlParams?.id as string) || "";
  const [lead, setLead] = useState<LeadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states for 4 main actions
  const [activeModal, setActiveModal] = useState<"interested" | "not_interested" | "wrong_number" | "callback" | null>(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Option A: Interested inputs
  const [bookingIssue, setBookingIssue] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [serviceCharges, setServiceCharges] = useState(0);
  const [bookingNotes, setBookingNotes] = useState("");

  // Option B: Not Interested inputs
  const [rejectionReason, setRejectionReason] = useState("Price too high");
  const [rejectionNotes, setRejectionNotes] = useState("");

  // Option C: Wrong Number inputs
  const [wrongNumberNotes, setWrongNumberNotes] = useState("");

  // Option D: Call Back Later inputs
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("11:00");
  const [callbackNotes, setCallbackNotes] = useState("");

  const fetchLead = async () => {
    if (!leadId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE}/api/v1/leads/${leadId}/`);
      if (!res.ok) throw new Error("Could not find lead record");
      const data = await res.json();
      setLead(data);
      setBookingIssue(data.reported_issue || "");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load lead details from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (leadId) {
      fetchLead();
    }
  }, [leadId]);

  const submitAction = async (actionType: "interested" | "not_interested" | "wrong_number" | "callback") => {
    if (!lead) return;
    setSubmittingAction(true);

    try {
      let payload: any = { action: actionType };

      if (actionType === "interested") {
        payload = {
          ...payload,
          confirmed_issue: bookingIssue,
          product_price: productPrice,
          service_charges: serviceCharges,
          work_notes: bookingNotes,
        };
      } else if (actionType === "not_interested") {
        if (!rejectionNotes.trim() && rejectionReason === "Other") {
          alert("Please provide a description note when selecting 'Other'.");
          setSubmittingAction(false);
          return;
        }
        payload = {
          ...payload,
          rejection_reason: rejectionReason,
          rejection_notes: rejectionNotes,
        };
      } else if (actionType === "wrong_number") {
        payload = {
          ...payload,
          rejection_notes: wrongNumberNotes || "Customer phone number is invalid / wrong number",
        };
      } else if (actionType === "callback") {
        if (!callbackDate) {
          alert("Please select a callback date");
          setSubmittingAction(false);
          return;
        }
        payload = {
          ...payload,
          callback_date: callbackDate,
          callback_time: callbackTime,
          callback_notes: callbackNotes,
        };
      }

      const res = await authFetch(`${API_BASE}/api/v1/leads/${lead.id}/action/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to update lead status");
      }

      setActiveModal(null);
      await fetchLead();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
        <p style={{ color: "var(--gray-500)" }}>Loading lead details from database...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div style={{ padding: "2rem", background: "white", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", textAlign: "center" }}>
        <AlertCircle size={36} style={{ color: "#ef4444", margin: "0 auto 1rem" }} />
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--brand-navy)" }}>Lead Not Found</h2>
        <p style={{ color: "var(--gray-500)", marginTop: "0.25rem", marginBottom: "1.5rem" }}>
          {error || "The requested lead could not be located in the database."}
        </p>
        <Link href="/crm/leads" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back to Enquiries
        </Link>
      </div>
    );
  }

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "new":
        return <span className="badge badge-purple" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem", borderRadius: "999px" }}>New Enquiry</span>;
      case "interested":
        return <span className="badge badge-green" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem", borderRadius: "999px" }}>Interested (Booked)</span>;
      case "not_interested":
        return <span className="badge badge-red" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem", borderRadius: "999px" }}>Not Interested</span>;
      case "wrong_number":
        return <span className="badge badge-red" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem", borderRadius: "999px" }}>Wrong Number</span>;
      case "callback_later":
        return <span className="badge badge-yellow" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem", borderRadius: "999px" }}>Call Back Later</span>;
      default:
        return <span className="badge badge-gray" style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem", borderRadius: "999px" }}>{st}</span>;
    }
  };

  return (
    <div>
      {/* Top Bar Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/crm/leads"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "var(--border-radius)",
              border: "1px solid var(--border-color)",
              background: "white",
              color: "var(--gray-600)",
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.35rem", color: "var(--brand-navy)", margin: 0 }}>
                {lead.lead_reference || lead.id}
              </h1>
              {getStatusBadge(lead.status)}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--gray-500)", marginTop: "0.2rem" }}>
              Submitted: {new Date(lead.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} • Source: <strong>{SOURCE_LABELS[lead.source] || lead.source}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={fetchLead} className="btn btn-secondary btn-sm" title="Refresh from database">
            <RefreshCw size={13} /> Refresh
          </button>
          {lead.repair_order_id && (
            <Link href="/crm/repairs" className="btn btn-primary btn-sm">
              <Wrench size={13} /> View Booking #{lead.repair_order_number || lead.repair_order_id.slice(0, 8)}
            </Link>
          )}
        </div>
      </div>

      {/* 4 Main Actions Segmented Control Box */}
      <div
        style={{
          background: "linear-gradient(to right, #f8fafc, #f1f5f9)",
          border: "2px solid #e2e8f0",
          borderRadius: "var(--border-radius-xl)",
          padding: "1.25rem 1.5rem",
          marginBottom: "1.75rem",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--brand-navy)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Staff Action — Select Exactly One Status
            </span>
            <p style={{ fontSize: "0.78rem", color: "var(--gray-500)", margin: 0 }}>
              Updating status will prompt required details and persist changes immediately to the database.
            </p>
          </div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b" }}>
            Current Status: <strong style={{ color: "var(--brand-navy)" }}>{lead.status.replace("_", " ").toUpperCase()}</strong>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
          <button
            onClick={() => setActiveModal("interested")}
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "var(--border-radius-lg)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              border: lead.status === "interested" ? "2px solid #16a34a" : "1px solid #bbf7d0",
              background: lead.status === "interested" ? "#dcfce7" : "white",
              color: "#15803d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            <CheckCircle2 size={16} /> 1. Interested
          </button>

          <button
            onClick={() => setActiveModal("not_interested")}
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "var(--border-radius-lg)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              border: lead.status === "not_interested" ? "2px solid #dc2626" : "1px solid #fecaca",
              background: lead.status === "not_interested" ? "#fee2e2" : "white",
              color: "#b91c1c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            <XCircle size={16} /> 2. Not Interested
          </button>

          <button
            onClick={() => setActiveModal("wrong_number")}
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "var(--border-radius-lg)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              border: lead.status === "wrong_number" ? "2px solid #ea580c" : "1px solid #fed7aa",
              background: lead.status === "wrong_number" ? "#ffedd5" : "white",
              color: "#c2410c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            <AlertCircle size={16} /> 3. Wrong Number
          </button>

          <button
            onClick={() => setActiveModal("callback")}
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "var(--border-radius-lg)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              border: lead.status === "callback_later" ? "2px solid #d97706" : "1px solid #fef3c7",
              background: lead.status === "callback_later" ? "#fef3c7" : "white",
              color: "#b45309",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease",
            }}
          >
            <Clock size={16} /> 4. Call Back Later
          </button>
        </div>
      </div>

      {/* Main Grid: Customer & Device Details */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.8fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Customer Information Card */}
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--brand-navy)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <User size={16} style={{ color: "var(--brand-purple)" }} /> Customer Contact
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.88rem" }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase" }}>Full Name</div>
              <div style={{ fontWeight: 700, color: "var(--gray-900)", fontSize: "1rem", marginTop: "0.15rem" }}>{lead.customer_name}</div>
            </div>

            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase" }}>Phone Number</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.2rem" }}>
                <a href={`tel:${lead.customer_phone}`} style={{ fontWeight: 700, color: "var(--brand-purple)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                  <Phone size={14} /> {lead.customer_phone}
                </a>
                <a
                  href={`https://wa.me/91${lead.customer_phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: "0.75rem", background: "#dcfce7", color: "#15803d", padding: "0.2rem 0.5rem", borderRadius: "999px", textDecoration: "none", fontWeight: 700 }}
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {lead.customer_email && (
              <div>
                <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase" }}>Email Address</div>
                <div style={{ color: "var(--gray-700)", marginTop: "0.15rem" }}>{lead.customer_email}</div>
              </div>
            )}

            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase" }}>Customer Address</div>
              <div style={{ color: "var(--gray-700)", marginTop: "0.15rem", display: "flex", alignItems: "flex-start", gap: "0.35rem" }}>
                <MapPin size={14} style={{ color: "var(--gray-400)", flexShrink: 0, marginTop: 2 }} />
                <span>{lead.customer_address || "Bengaluru, Karnataka"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Device & Service Information Card */}
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--brand-navy)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Smartphone size={16} style={{ color: "var(--brand-purple)" }} /> Device &amp; Service Requirements
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem", fontSize: "0.88rem" }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase" }}>Device Model</div>
              <div style={{ fontWeight: 800, color: "var(--brand-navy)", fontSize: "1.05rem", marginTop: "0.15rem" }}>
                {lead.device_name || "Device unspecified"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase" }}>Device Color</div>
              <div style={{ color: "var(--gray-700)", marginTop: "0.15rem" }}>
                {lead.device_color || "Standard"}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", fontWeight: 700, textTransform: "uppercase" }}>Reported Issue</div>
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "var(--border-radius-md)", padding: "0.75rem 1rem", marginTop: "0.35rem", fontSize: "0.9rem", color: "var(--gray-800)", fontWeight: 600 }}>
              {lead.reported_issue || "No issue description provided"}
            </div>
          </div>

          {/* Conditional outcome details */}
          {lead.status === "not_interested" && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--border-radius-md)", padding: "0.75rem 1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#991b1b", textTransform: "uppercase" }}>Rejection Reason</div>
              <div style={{ fontWeight: 700, color: "#b91c1c", marginTop: "0.15rem" }}>{lead.rejection_reason || "Not specified"}</div>
              {lead.rejection_notes && (
                <div style={{ fontSize: "0.82rem", color: "#7f1d1d", marginTop: "0.25rem" }}>Notes: {lead.rejection_notes}</div>
              )}
            </div>
          )}

          {lead.status === "wrong_number" && (
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "var(--border-radius-md)", padding: "0.75rem 1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9a3412", textTransform: "uppercase" }}>Wrong Number Verification</div>
              <div style={{ fontSize: "0.82rem", color: "#c2410c", marginTop: "0.15rem" }}>{lead.rejection_notes || "Marked as invalid / wrong number"}</div>
            </div>
          )}

          {lead.status === "callback_later" && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "var(--border-radius-md)", padding: "0.75rem 1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#92400e", textTransform: "uppercase" }}>Scheduled Follow-up</div>
              <div style={{ fontWeight: 700, color: "#b45309", marginTop: "0.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={14} /> {lead.callback_date} at {lead.callback_time || "Morning"}
              </div>
              {lead.callback_notes && (
                <div style={{ fontSize: "0.82rem", color: "#78350f", marginTop: "0.25rem" }}>Notes: {lead.callback_notes}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Callback History Section (Requirement 4 & 9: Full history preserved) */}
      {lead.callback_history && lead.callback_history.length > 0 && (
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", marginBottom: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--brand-navy)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock size={16} style={{ color: "#d97706" }} /> Callback &amp; Follow-up History ({lead.callback_history.length})
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {lead.callback_history.map((cb, idx) => (
              <div
                key={cb.id || idx}
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--border-radius-lg)",
                  background: cb.status === "scheduled" ? "#fffbeb" : "#f8fafc",
                  border: cb.status === "scheduled" ? "1px solid #fde68a" : "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--brand-navy)" }}>
                      Scheduled: {cb.scheduled_date} at {cb.scheduled_time}
                    </span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        padding: "0.1rem 0.45rem",
                        borderRadius: "999px",
                        fontWeight: 700,
                        background: cb.status === "scheduled" ? "#d97706" : "#64748b",
                        color: "white",
                        textTransform: "uppercase"
                      }}
                    >
                      {cb.status}
                    </span>
                  </div>
                  {cb.notes && (
                    <div style={{ fontSize: "0.82rem", color: "var(--gray-600)", marginTop: "0.25rem" }}>
                      &ldquo;{cb.notes}&rdquo;
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                  Recorded on: {new Date(cb.created_at).toLocaleDateString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Option A Modal: Interested -> Create / Update Booking */}
      {activeModal === "interested" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: "var(--border-radius-2xl)", padding: "2rem", width: "100%", maxWidth: 520, boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem", color: "#15803d", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={20} /> Mark Lead as Interested &amp; Create Booking
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Moves customer directly into the Bookings workshop queue. Prevents duplicate booking creation.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); submitAction("interested"); }}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Confirmed Issue / Customer Requirements *</label>
                <textarea
                  className="form-input"
                  rows={2}
                  value={bookingIssue}
                  onChange={(e) => setBookingIssue(e.target.value)}
                  placeholder="e.g. Broken display and battery drain"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Product / Parts Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    value={productPrice}
                    onChange={(e) => setProductPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Service / Labour Charges (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="form-input"
                    value={serviceCharges}
                    onChange={(e) => setServiceCharges(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "0.75rem 1rem", borderRadius: "var(--border-radius-md)", marginBottom: "1rem", fontSize: "0.85rem", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--gray-600)" }}>Total Estimated Customer Charge:</span>
                <strong style={{ color: "var(--brand-navy)" }}>₹{(productPrice + serviceCharges).toLocaleString("en-IN")}</strong>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Internal Staff Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Customer wants original OEM display only"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-secondary btn-sm" disabled={submittingAction}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingAction}>
                  {submittingAction ? "Saving..." : "Confirm & Move to Bookings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Option B Modal: Not Interested */}
      {activeModal === "not_interested" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: "var(--border-radius-2xl)", padding: "2rem", width: "100%", maxWidth: 480, boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem", color: "#b91c1c", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <XCircle size={20} /> Mark Lead as Not Interested
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Saves the reason to the database and displays this lead in the Not Interested section.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); submitAction("not_interested"); }}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label">Reason for Customer Decision *</label>
                <select
                  className="form-input form-select"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                >
                  <option value="Price too high">Price too high</option>
                  <option value="Customer changed their mind">Customer changed their mind</option>
                  <option value="Service not required">Service not required</option>
                  <option value="Chose another service provider">Chose another service provider</option>
                  <option value="Service unavailable">Service unavailable</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Staff Remarks / Note {rejectionReason === "Other" && "*"}</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder={rejectionReason === "Other" ? "Please describe reason in detail (required)..." : "Additional customer feedback or context..."}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  required={rejectionReason === "Other"}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-secondary btn-sm" disabled={submittingAction}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger btn-sm" disabled={submittingAction}>
                  {submittingAction ? "Saving..." : "Confirm & Move to Not Interested"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Option C Modal: Wrong Number */}
      {activeModal === "wrong_number" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: "var(--border-radius-2xl)", padding: "2rem", width: "100%", maxWidth: 480, boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem", color: "#c2410c", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={20} /> Mark as Wrong Number
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Distinctly tagged in the Not Interested desk with full verification note preserved.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); submitAction("wrong_number"); }}>
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Verification Note / Remarks</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Called number 3 times, recipient stated they never enquired and do not own an iPhone"
                  value={wrongNumberNotes}
                  onChange={(e) => setWrongNumberNotes(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-secondary btn-sm" disabled={submittingAction}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger btn-sm" style={{ background: "#ea580c" }} disabled={submittingAction}>
                  {submittingAction ? "Saving..." : "Confirm Wrong Number"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Option D Modal: Call Back Later */}
      {activeModal === "callback" && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: "var(--border-radius-2xl)", padding: "2rem", width: "100%", maxWidth: 480, boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem", color: "#b45309", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={20} /> Schedule Call Back Later
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Schedules follow-up and adds to Call Back desk with reminder dates and follow-up timeline.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); submitAction("callback"); }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Callback Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={callbackDate}
                    onChange={(e) => setCallbackDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Customer Request / Follow-up Reason *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Customer is in a meeting; asked to call back at 4 PM to confirm home pickup"
                  value={callbackNotes}
                  onChange={(e) => setCallbackNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setActiveModal(null)} className="btn btn-secondary btn-sm" disabled={submittingAction}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" style={{ background: "#d97706", borderColor: "#d97706" }} disabled={submittingAction}>
                  {submittingAction ? "Saving..." : "Save Callback Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
