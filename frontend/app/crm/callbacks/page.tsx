"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApiUrl, authFetch } from "../../lib/api";
import {
  PhoneCall,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  User,
  Smartphone,
  ChevronDown,
  X,
  Plus,
  ArrowRight,
  History,
  FileText,
  Wrench,
  XCircle,
} from "lucide-react";

interface CallbackScheduleItem {
  id: string;
  lead: string;
  scheduled_date: string;
  scheduled_time: string;
  reason?: string;
  notes?: string;
  status: string;
  status_display?: string;
  call_outcome?: string;
  outcome_notes?: string;
  contacted_at?: string;
  created_at: string;
}

interface LeadItem {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  device_model_text: string;
  reported_problem: string;
  source: string;
  source_display?: string;
  handled_by_name?: string;
  status: string;
  status_display?: string;
  callback_date?: string;
  callback_time?: string;
  callback_notes?: string;
  rejection_reason?: string;
  callback_schedules?: CallbackScheduleItem[];
  created_at: string;
  updated_at: string;
}

export default function CallbacksPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"due_today" | "overdue" | "upcoming" | "all">("due_today");
  const [dateFilter, setDateFilter] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal State
  const [rescheduleLead, setRescheduleLead] = useState<LeadItem | null>(null);
  const [newCbDate, setNewCbDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newCbTime, setNewCbTime] = useState("05:00 PM");
  const [rescheduleReason, setRescheduleReason] = useState("Customer requested new time");
  const [rescheduleNotes, setRescheduleNotes] = useState("");

  // Convert to Interested Modal State
  const [convertLead, setConvertLead] = useState<LeadItem | null>(null);
  const [bookingConfirmedIssue, setBookingConfirmedIssue] = useState("");
  const [bookingPartPrice, setBookingPartPrice] = useState<number>(0);
  const [bookingServiceCharge, setBookingServiceCharge] = useState<number>(1200);

  // Mark Not Interested Modal State
  const [rejectLead, setRejectLead] = useState<LeadItem | null>(null);
  const [rejectReason, setRejectReason] = useState("Price too high");
  const [rejectNotes, setRejectNotes] = useState("");

  const apiUrl = getApiUrl();

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  const loadCallbacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${apiUrl}/api/v1/leads/?status=callback_later`);
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : data.results || [];
        setLeads(results);
      } else {
        showNotification("Failed to fetch callback leads.", true);
      }
    } catch (err: any) {
      showNotification("Database connection error: " + err.message, true);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadCallbacks();
  }, [loadCallbacks]);

  // Handle Reschedule Callback
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleLead) return;

    try {
      const res = await authFetch(`${apiUrl}/api/v1/leads/${rescheduleLead.id}/reschedule-callback/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callback_date: newCbDate,
          callback_time: newCbTime,
          outcome: rescheduleReason,
          notes: rescheduleNotes,
        }),
      });

      if (res.ok) {
        showNotification(`Callback for ${rescheduleLead.reference} rescheduled to ${newCbDate} at ${newCbTime}.`);
        setRescheduleLead(null);
        setRescheduleNotes("");
        loadCallbacks();
      } else {
        showNotification("Failed to reschedule callback.", true);
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    }
  };

  // Convert Callback Lead to Interested / Booking
  const handleConvertToBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertLead) return;

    try {
      const res = await authFetch(`${apiUrl}/api/v1/leads/${convertLead.id}/action/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interested",
          confirmed_issue: bookingConfirmedIssue || convertLead.reported_problem,
          product_price: Number(bookingPartPrice) || 0,
          service_charges: Number(bookingServiceCharge) || 0,
          internal_profit: Number(bookingServiceCharge) || 0,
          notes: "Customer confirmed Interested after callback follow-up.",
        }),
      });

      if (res.ok) {
        showNotification(`Lead ${convertLead.reference} moved to Bookings successfully!`);
        setConvertLead(null);
        loadCallbacks();
      } else {
        showNotification("Failed to convert lead.", true);
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    }
  };

  // Mark Not Interested
  const handleMarkNotInterested = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectLead) return;

    try {
      const res = await authFetch(`${apiUrl}/api/v1/leads/${rejectLead.id}/action/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "not_interested",
          reason: rejectReason,
          notes: rejectNotes,
        }),
      });

      if (res.ok) {
        showNotification(`Lead ${rejectLead.reference} moved to Not Interested.`);
        setRejectLead(null);
        setRejectNotes("");
        loadCallbacks();
      } else {
        showNotification("Failed to update status.", true);
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    }
  };

  // Mark Wrong Number
  const handleMarkWrongNumber = async (leadId: string, leadRef: string) => {
    try {
      const res = await authFetch(`${apiUrl}/api/v1/leads/${leadId}/action/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "wrong_number",
          notes: "Customer answered callback stating wrong number / not requested.",
        }),
      });

      if (res.ok) {
        showNotification(`Lead ${leadRef} marked as Wrong Number.`);
        loadCallbacks();
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    }
  };

  // Date classifications
  const todayStr = new Date().toISOString().split("T")[0];

  const dueTodayLeads = leads.filter((l) => l.callback_date === todayStr);
  const overdueLeads = leads.filter((l) => l.callback_date && l.callback_date < todayStr);
  const upcomingLeads = leads.filter((l) => l.callback_date && l.callback_date > todayStr);

  // GLOBAL SEARCH OVERRIDE:
  // If user is searching, search across all callback leads regardless of tab or date
  const displayedLeads = search.trim()
    ? leads.filter((l) => {
        const q = search.toLowerCase();
        const matchName = l.customer_name?.toLowerCase().includes(q);
        const matchPhone = l.customer_phone?.includes(q);
        const matchRef = l.reference?.toLowerCase().includes(q);
        const matchDevice = l.device_model_text?.toLowerCase().includes(q);
        const matchProblem = (l.reported_problem || "").toLowerCase().includes(q);
        const matchNotes = (l.callback_notes || "").toLowerCase().includes(q);
        const matchHandler = (l.handled_by_name || "").toLowerCase().includes(q);
        return matchName || matchPhone || matchRef || matchDevice || matchProblem || matchNotes || matchHandler;
      })
    : (
        dateFilter
          ? leads.filter((l) => (l.callback_date || l.created_at || "").slice(0, 10) === dateFilter)
          : activeTab === "due_today"
          ? dueTodayLeads
          : activeTab === "overdue"
          ? overdueLeads
          : activeTab === "upcoming"
          ? upcomingLeads
          : leads
      );

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Toast notifications */}
      {successMsg && (
        <div style={{
          backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46",
          padding: "0.75rem 1.25rem", borderRadius: "8px", marginBottom: "1rem",
          display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500
        }}>
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{
          backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b",
          padding: "0.75rem 1.25rem", borderRadius: "8px", marginBottom: "1rem",
          display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500
        }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PhoneCall size={26} color="#d97706" /> Call Back Later — Follow-Up Desk
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Dedicated follow-up interface: Record outcomes, reschedule with full history, and convert to bookings seamlessly.
          </p>
        </div>

        <button
          onClick={() => loadCallbacks()}
          style={{
            display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 0.85rem",
            background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px",
            cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, color: "#334155"
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* KPI Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.875rem", marginBottom: "1.25rem" }}>
        <div
          onClick={() => setActiveTab("due_today")}
          style={{
            background: activeTab === "due_today" ? "#fef3c7" : "#ffffff",
            border: `1.5px solid ${activeTab === "due_today" ? "#d97706" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#92400e", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Due Today</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#92400e", marginTop: "0.25rem" }}>{dueTodayLeads.length}</div>
          <div style={{ fontSize: "0.75rem", color: "#b45309", marginTop: "0.25rem" }}>Must contact today</div>
        </div>

        <div
          onClick={() => setActiveTab("overdue")}
          style={{
            background: activeTab === "overdue" ? "#fee2e2" : "#ffffff",
            border: `1.5px solid ${activeTab === "overdue" ? "#dc2626" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#991b1b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Overdue Callbacks</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#991b1b", marginTop: "0.25rem" }}>{overdueLeads.length}</div>
          <div style={{ fontSize: "0.75rem", color: "#b91c1c", marginTop: "0.25rem" }}>Scheduled date passed</div>
        </div>

        <div
          onClick={() => setActiveTab("upcoming")}
          style={{
            background: activeTab === "upcoming" ? "#e0f2fe" : "#ffffff",
            border: `1.5px solid ${activeTab === "upcoming" ? "#0284c7" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#0369a1", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Upcoming</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0369a1", marginTop: "0.25rem" }}>{upcomingLeads.length}</div>
          <div style={{ fontSize: "0.75rem", color: "#0284c7", marginTop: "0.25rem" }}>Future scheduled dates</div>
        </div>

        <div
          onClick={() => setActiveTab("all")}
          style={{
            background: activeTab === "all" ? "#f8fafc" : "#ffffff",
            border: `1.5px solid ${activeTab === "all" ? "#6366f1" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>All Callbacks</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>{leads.length}</div>
          <div style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: "0.25rem" }}>Total active callback pipeline</div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0",
        marginBottom: "1.25rem", display: "flex", gap: "1rem", alignItems: "center"
      }}>
        <div style={{ flex: "1 1 300px", position: "relative" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search callback leads by customer name, phone, lead ID, device..."
            style={{
              width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.25rem",
              borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none"
            }}
          />
        </div>

        {/* Date Filter */}
        <div style={{
          display: "flex", alignItems: "center", gap: "0.35rem",
          background: dateFilter ? "#eff6ff" : "white", padding: "0.3rem 0.65rem",
          borderRadius: "6px", border: dateFilter ? "1.5px solid #3b82f6" : "1px solid #cbd5e1"
        }}>
          <Calendar size={14} color={dateFilter ? "#2563eb" : "#64748b"} />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            title="Filter by Scheduled Callback Date"
            style={{
              border: "none", background: "transparent", fontSize: "0.8125rem", color: "#1e293b",
              fontWeight: 600, outline: "none", cursor: "pointer"
            }}
          />
          {dateFilter ? (
            <button
              type="button"
              onClick={() => setDateFilter("")}
              title="Clear date filter"
              style={{
                background: "none", border: "none", color: "#ef4444", cursor: "pointer",
                fontSize: "0.75rem", fontWeight: 800, padding: "0 2px"
              }}
            >
              ✕
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDateFilter(todayStr)}
              style={{
                background: "#f1f5f9", border: "none", color: "#475569", borderRadius: "4px",
                fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.4rem", cursor: "pointer"
              }}
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Global Search Banner */}
      {search.trim() && (
        <div style={{
          background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af",
          padding: "0.6rem 1rem", borderRadius: "8px", marginBottom: "1rem",
          fontSize: "0.8125rem", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <span>
            🔍 <strong>Global Search Active:</strong> Showing all results matching &ldquo;{search}&rdquo; across all callback records.
          </span>
          <button
            onClick={() => setSearch("")}
            style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", fontSize: "0.8125rem" }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Callbacks Grid / Cards */}
      {loading ? (
        <div style={{ background: "white", padding: "3rem", borderRadius: "10px", textAlign: "center", color: "#64748b" }}>
          <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 0.5rem" }} />
          Loading callbacks from database...
        </div>
      ) : displayedLeads.length === 0 ? (
        <div style={{ background: "white", padding: "3rem", borderRadius: "10px", textAlign: "center", color: "#64748b", border: "1px solid #e2e8f0" }}>
          <CheckCircle2 size={36} color="#16a34a" style={{ margin: "0 auto 0.5rem" }} />
          <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1e293b" }}>No callbacks found in this tab!</div>
          <p style={{ margin: "0.25rem 0", fontSize: "0.85rem" }}>
            Great job! No pending callbacks matching the selected filter.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))", gap: "1rem" }}>
          {displayedLeads.map((lead) => {
            const isDueToday = lead.callback_date === todayStr;
            const isOverdue = lead.callback_date && lead.callback_date < todayStr;
            const schedules = lead.callback_schedules || [];

            return (
              <div
                key={lead.id}
                style={{
                  background: "white", borderRadius: "10px", border: `1.5px solid ${isOverdue ? "#fca5a5" : isDueToday ? "#fcd34d" : "#e2e8f0"}`,
                  padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <div>
                  {/* Top Bar: Lead Reference + Urgency Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#1e1b4b", fontSize: "0.9rem" }}>
                        {lead.reference}
                      </span>
                      <span style={{
                        marginLeft: "0.5rem", fontSize: "0.72rem", padding: "2px 6px", borderRadius: "4px",
                        background: "#f1f5f9", color: "#475569", fontWeight: 600
                      }}>
                        {lead.source_display || lead.source}
                      </span>
                      <span style={{
                        marginLeft: "0.5rem", fontSize: "0.72rem", padding: "2px 6px", borderRadius: "4px",
                        background: "#f8fafc", color: "#1e293b", fontWeight: 700, border: "1px solid #e2e8f0"
                      }}>
                        👤 Handled by: {lead.handled_by_name || "Super Admin"}
                      </span>
                    </div>

                    <span style={{
                      fontSize: "0.75rem", padding: "0.25rem 0.6rem", borderRadius: "12px", fontWeight: 700,
                      background: isOverdue ? "#fee2e2" : isDueToday ? "#fef3c7" : "#e0f2fe",
                      color: isOverdue ? "#991b1b" : isDueToday ? "#92400e" : "#0369a1",
                    }}>
                      {isOverdue ? "⚠️ Overdue" : isDueToday ? "⏰ Due Today" : "📅 Upcoming"}
                    </span>
                  </div>

                  {/* Customer Info & Direct Call Buttons */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#0f172a" }}>
                        {lead.customer_name}
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "2px" }}>
                        {lead.device_model_text || "Apple Device"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <a
                        href={`tel:${lead.customer_phone}`}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem",
                          background: "#eff6ff", color: "#1d4ed8", borderRadius: "6px", textDecoration: "none",
                          fontSize: "0.8125rem", fontWeight: 700, border: "1px solid #bfdbfe"
                        }}
                      >
                        <Phone size={13} /> {lead.customer_phone}
                      </a>
                      <a
                        href={`https://wa.me/91${lead.customer_phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px",
                          background: "#ecfdf5", color: "#16a34a", borderRadius: "6px", border: "1px solid #bbf7d0"
                        }}
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </a>
                    </div>
                  </div>

                  {/* Scheduled Callback Time Box */}
                  <div style={{
                    background: "#fefce8", border: "1px solid #fef08a", padding: "0.65rem 0.85rem",
                    borderRadius: "6px", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem"
                  }}>
                    <Clock size={16} color="#854d0e" />
                    <div style={{ fontSize: "0.8125rem", color: "#713f12" }}>
                      Scheduled for: <strong>{lead.callback_date} at {lead.callback_time || "05:00 PM"}</strong>
                    </div>
                  </div>

                  {/* Notes / Reason */}
                  {lead.callback_notes && (
                    <div style={{ fontSize: "0.8125rem", color: "#334155", background: "#f8fafc", padding: "0.6rem 0.75rem", borderRadius: "6px", marginBottom: "0.75rem" }}>
                      <strong style={{ color: "#475569" }}>Follow-up Note:</strong> {lead.callback_notes}
                    </div>
                  )}

                  {/* Callback History Timeline */}
                  {schedules.length > 0 && (
                    <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.65rem", marginBottom: "0.75rem" }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "0.35rem" }}>
                        <History size={12} /> Previous Callback History ({schedules.length} attempts)
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {schedules.slice(0, 3).map((sch, i) => (
                          <div key={sch.id || i} style={{ fontSize: "0.72rem", color: "#475569", display: "flex", justifyContent: "space-between" }}>
                            <span>📅 {sch.scheduled_date} {sch.scheduled_time}</span>
                            <span style={{ fontWeight: 600, color: sch.status === "pending" ? "#d97706" : "#64748b" }}>
                              {sch.call_outcome || sch.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Outcome Actions */}
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.85rem", marginTop: "0.5rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.5rem" }}>
                    Select Contact Result:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    {/* Outcome 1: Customer Interested -> Move to Bookings */}
                    <button
                      onClick={() => {
                        setConvertLead(lead);
                        setBookingConfirmedIssue(lead.reported_problem);
                        setBookingPartPrice(0);
                        setBookingServiceCharge(1200);
                      }}
                      style={{
                        padding: "0.45rem", fontSize: "0.78rem", fontWeight: 700, borderRadius: "6px",
                        background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem"
                      }}
                    >
                      <Wrench size={12} /> Convert to Booking
                    </button>

                    {/* Outcome 2: Reschedule Callback */}
                    <button
                      onClick={() => {
                        setRescheduleLead(lead);
                        setNewCbDate(new Date().toISOString().split("T")[0]);
                        setNewCbTime("05:00 PM");
                        setRescheduleReason("Customer requested to call later");
                        setRescheduleNotes("");
                      }}
                      style={{
                        padding: "0.45rem", fontSize: "0.78rem", fontWeight: 700, borderRadius: "6px",
                        background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem"
                      }}
                    >
                      <RotateCcw size={12} /> Reschedule Callback
                    </button>

                    {/* Outcome 3: Not Interested */}
                    <button
                      onClick={() => {
                        setRejectLead(lead);
                        setRejectReason("Price too high");
                        setRejectNotes("");
                      }}
                      style={{
                        padding: "0.45rem", fontSize: "0.78rem", fontWeight: 700, borderRadius: "6px",
                        background: "#fff1f2", color: "#be123c", border: "1px solid #fecdd3", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem"
                      }}
                    >
                      <XCircle size={12} /> Not Interested
                    </button>

                    {/* Outcome 4: Wrong Number */}
                    <button
                      onClick={() => handleMarkWrongNumber(lead.id, lead.reference)}
                      style={{
                        padding: "0.45rem", fontSize: "0.78rem", fontWeight: 700, borderRadius: "6px",
                        background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", cursor: "pointer"
                      }}
                    >
                      ⊘ Wrong Number
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── RESCHEDULE MODAL ────────────────────────────────────────────────────── */}
      {rescheduleLead && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "500px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#d97706", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Reschedule Callback Follow-up
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Lead: {rescheduleLead.reference} — {rescheduleLead.customer_name}
                </p>
              </div>
              <button
                onClick={() => setRescheduleLead(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    New Callback Date <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={newCbDate}
                    onChange={(e) => setNewCbDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    New Callback Time <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={newCbTime}
                    onChange={(e) => setNewCbTime(e.target.value)}
                    placeholder="e.g. 05:30 PM"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Call Result / Outcome Reason
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. In meeting, requested evening call..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Follow-up Notes
                </label>
                <textarea
                  rows={2}
                  value={rescheduleNotes}
                  onChange={(e) => setRescheduleNotes(e.target.value)}
                  placeholder="Record customer's exact discussion..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setRescheduleLead(null)}
                  style={{ padding: "0.6rem 1.25rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "6px", border: "none",
                    background: "#d97706", color: "white", cursor: "pointer", fontWeight: 700
                  }}
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── CONVERT TO BOOKING MODAL ────────────────────────────────────────────── */}
      {convertLead && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "520px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#166534", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Customer Interested → Move to Bookings
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Lead: {convertLead.reference} — {convertLead.customer_name}
                </p>
              </div>
              <button
                onClick={() => setConvertLead(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConvertToBooking} style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Confirmed Issue / Service Requirements
                </label>
                <input
                  type="text"
                  value={bookingConfirmedIssue}
                  onChange={(e) => setBookingConfirmedIssue(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Part / Product Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bookingPartPrice}
                    onChange={(e) => setBookingPartPrice(Number(e.target.value))}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Service Charges (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={bookingServiceCharge}
                    onChange={(e) => setBookingServiceCharge(Number(e.target.value))}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setConvertLead(null)}
                  style={{ padding: "0.6rem 1.25rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "6px", border: "none",
                    background: "#166534", color: "white", cursor: "pointer", fontWeight: 700
                  }}
                >
                  Confirm & Move to Bookings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── NOT INTERESTED MODAL ─────────────────────────────────────────────────── */}
      {rejectLead && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "500px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#991b1b", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Mark Not Interested
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Lead: {rejectLead.reference} — {rejectLead.customer_name}
                </p>
              </div>
              <button
                onClick={() => setRejectLead(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleMarkNotInterested} style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Reason <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
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

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Staff Notes
                </label>
                <textarea
                  rows={3}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setRejectLead(null)}
                  style={{ padding: "0.6rem 1.25rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "6px", border: "none",
                    background: "#991b1b", color: "white", cursor: "pointer", fontWeight: 700
                  }}
                >
                  Save to Not Interested
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
