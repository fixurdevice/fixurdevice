"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MessageCircle,
  RotateCcw,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Wrench,
  PhoneCall,
  X,
  Info,
} from "lucide-react";

interface RejectedLead {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  device_model_text: string;
  reported_problem: string;
  status: string;
  status_display?: string;
  source: string;
  source_display?: string;
  handled_by_name?: string;
  rejection_reason?: string;
  rejection_notes?: string;
  created_at: string;
  updated_at: string;
}

export default function RejectedPage() {
  const [leads, setLeads] = useState<RejectedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | "not_interested" | "wrong_number">("all");
  const [reasonFilter, setReasonFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Reopen Modal State
  const [reopenLead, setReopenLead] = useState<RejectedLead | null>(null);
  const [reopenTarget, setReopenTarget] = useState<"new" | "interested" | "callback_later">("new");
  const [reopenNotes, setReopenNotes] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  const loadRejectedLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/leads/?status=rejected`);
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : data.results || [];
        setLeads(results);
      } else {
        showNotification("Failed to fetch rejected leads.", true);
      }
    } catch (err: any) {
      showNotification("Database connection error: " + err.message, true);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadRejectedLeads();
  }, [loadRejectedLeads]);

  // Reopen Lead Action
  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenLead) return;

    try {
      const res = await fetch(`${apiUrl}/api/v1/leads/${reopenLead.id}/action/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: reopenTarget === "new" ? "reopen" : reopenTarget,
          service_status: reopenTarget === "new" ? "new" : undefined,
          notes: reopenNotes || "Reopened from Not Interested section.",
          // Default booking values if reopened directly to interested
          confirmed_issue: reopenLead.reported_problem,
          service_charges: 1000,
        }),
      });

      if (res.ok) {
        showNotification(
          `Lead ${reopenLead.reference} successfully reopened to ${
            reopenTarget === "new" ? "New Enquiries" : reopenTarget === "interested" ? "Bookings" : "Call Back Later"
          }!`
        );
        setReopenLead(null);
        setReopenNotes("");
        loadRejectedLeads();
      } else {
        showNotification("Failed to reopen lead.", true);
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    // GLOBAL SEARCH OVERRIDE:
    // If searching, search across all rejected leads from any date or tab
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = l.customer_name?.toLowerCase().includes(q);
      const matchPhone = l.customer_phone?.includes(q);
      const matchRef = l.reference?.toLowerCase().includes(q);
      const matchDevice = l.device_model_text?.toLowerCase().includes(q);
      const matchProblem = (l.reported_problem || "").toLowerCase().includes(q);
      const matchReason = l.rejection_reason?.toLowerCase().includes(q);
      const matchNotes = (l.rejection_notes || "").toLowerCase().includes(q);
      const matchHandler = (l.handled_by_name || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchRef || matchDevice || matchProblem || matchReason || matchNotes || matchHandler;
    }

    if (statusTab === "not_interested" && l.status !== "not_interested") return false;
    if (statusTab === "wrong_number" && l.status !== "wrong_number") return false;
    if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
    if (reasonFilter !== "all") {
      if (!l.rejection_reason?.toLowerCase().includes(reasonFilter.toLowerCase())) return false;
    }
    if (dateFilter) {
      const lDate = (l.updated_at || l.created_at || "").slice(0, 10);
      if (lDate !== dateFilter) return false;
    }
    return true;
  });

  const notInterestedCount = leads.filter((l) => l.status === "not_interested").length;
  const wrongNumberCount = leads.filter((l) => l.status === "wrong_number").length;

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
            <XCircle size={26} color="#dc2626" /> Not Interested & Wrong Number Leads
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Leads rejected by customers or verified as wrong numbers. Preserved in the database with reasons, searchable, and reopenable anytime.
          </p>
        </div>

        <button
          onClick={() => loadRejectedLeads()}
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

      {/* KPI Cards / Filter Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.875rem", marginBottom: "1.25rem" }}>
        <div
          onClick={() => setStatusTab("all")}
          style={{
            background: statusTab === "all" ? "#f8fafc" : "#ffffff",
            border: `1.5px solid ${statusTab === "all" ? "#6366f1" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Total Inactive Leads</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>{leads.length}</div>
          <div style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: "0.25rem" }}>All reasons stored in DB</div>
        </div>

        <div
          onClick={() => setStatusTab("not_interested")}
          style={{
            background: statusTab === "not_interested" ? "#fee2e2" : "#ffffff",
            border: `1.5px solid ${statusTab === "not_interested" ? "#dc2626" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#991b1b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Not Interested</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#991b1b", marginTop: "0.25rem" }}>{notInterestedCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#b91c1c", marginTop: "0.25rem" }}>Customer declined repair</div>
        </div>

        <div
          onClick={() => setStatusTab("wrong_number")}
          style={{
            background: statusTab === "wrong_number" ? "#f1f5f9" : "#ffffff",
            border: `1.5px solid ${statusTab === "wrong_number" ? "#475569" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#475569", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Wrong Numbers</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#475569", marginTop: "0.25rem" }}>{wrongNumberCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Distinctly labelled & tracked</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{
        background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0",
        marginBottom: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center"
      }}>
        <div style={{ flex: "1 1 300px", position: "relative" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rejected leads by customer, phone, lead ID, reason..."
            style={{
              width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.25rem",
              borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1",
              fontSize: "0.8125rem", background: "white", color: "#1e293b", fontWeight: 600
            }}
          >
            <option value="all">All Rejection Reasons</option>
            <option value="Price too high">Price too high</option>
            <option value="Customer changed their mind">Customer changed their mind</option>
            <option value="Service not required">Service not required</option>
            <option value="Chose another service provider">Chose another service provider</option>
            <option value="Service unavailable">Service unavailable</option>
            <option value="Wrong Number">Wrong Number</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1",
              fontSize: "0.8125rem", background: "white", color: "#1e293b", fontWeight: 600
            }}
          >
            <option value="all">All Sources</option>
            <option value="google_ads">Google Ads</option>
            <option value="meta_ads">Meta Ads</option>
            <option value="website">Website</option>
            <option value="walk_in">Walk-in</option>
            <option value="phone">Phone Call</option>
            <option value="reference">Reference</option>
            <option value="other">Other</option>
          </select>

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
              title="Filter by rejection date"
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
                onClick={() => setDateFilter(new Date().toISOString().split("T")[0])}
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
      </div>

      {/* Global Search Banner */}
      {search.trim() && (
        <div style={{
          background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af",
          padding: "0.6rem 1rem", borderRadius: "8px", marginBottom: "1rem",
          fontSize: "0.8125rem", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <span>
            🔍 <strong>Global Search Active:</strong> Showing all results matching &ldquo;{search}&rdquo; across all inactive leads.
          </span>
          <button
            onClick={() => setSearch("")}
            style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", fontSize: "0.8125rem" }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Leads Table */}
      <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Lead ID</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Customer</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Device & Problem</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Status & Reason</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Handled By</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Staff Notes</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Source</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 0.5rem" }} />
                    Loading rejected leads...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    <CheckCircle2 size={32} style={{ margin: "0 auto 0.5rem", color: "#16a34a" }} />
                    <div style={{ fontWeight: 600, fontSize: "1rem", color: "#334155" }}>No rejected leads in this view</div>
                    <p style={{ margin: "0.25rem 0", fontSize: "0.8125rem" }}>
                      Leads marked Not Interested or Wrong Number will appear here with full reasons.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isWrong = lead.status === "wrong_number";
                  const dateStr = lead.created_at
                    ? new Date(lead.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })
                    : "Recently";

                  return (
                    <tr
                      key={lead.id}
                      style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Lead Reference */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontFamily: "monospace", fontWeight: 800, color: "#1e1b4b", fontSize: "0.84rem" }}>
                          {lead.reference}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>
                          📅 {dateStr}
                        </div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{lead.customer_name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "2px" }}>
                          <a
                            href={`tel:${lead.customer_phone}`}
                            style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.8125rem", fontWeight: 600 }}
                          >
                            <Phone size={11} style={{ display: "inline", verticalAlign: "middle" }} /> {lead.customer_phone}
                          </a>
                        </div>
                      </td>

                      {/* Device & Issue */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: "#334155" }}>
                          {lead.device_model_text || "Apple / Smart Device"}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "2px", maxWidth: "220px" }}>
                          {lead.reported_problem}
                        </div>
                      </td>

                      {/* Status & Distinct Reason */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <span style={{
                          display: "inline-block", fontSize: "0.75rem", padding: "0.2rem 0.55rem",
                          borderRadius: "12px", fontWeight: 700,
                          background: isWrong ? "#f1f5f9" : "#fee2e2",
                          color: isWrong ? "#475569" : "#991b1b",
                          border: `1px solid ${isWrong ? "#e2e8f0" : "#fecaca"}`
                        }}>
                          {isWrong ? "⊘ Wrong Number" : "✗ Not Interested"}
                        </span>
                        <div style={{ fontSize: "0.8125rem", color: "#0f172a", fontWeight: 600, marginTop: "4px" }}>
                          {lead.rejection_reason || (isWrong ? "Invalid Number" : "Price too high")}
                        </div>
                      </td>

                      {/* Handled By */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.3rem",
                          fontSize: "0.78rem", fontWeight: 700, color: "#1e293b",
                          background: "#f1f5f9", padding: "0.2rem 0.55rem", borderRadius: "6px",
                          border: "1px solid #e2e8f0"
                        }}>
                          👤 {lead.handled_by_name || "Super Admin"}
                        </span>
                      </td>

                      {/* Staff Notes */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ color: "#475569", fontSize: "0.8125rem", maxWidth: "260px" }}>
                          {lead.rejection_notes || "—"}
                        </div>
                      </td>

                      {/* Source */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <span style={{
                          display: "inline-block", fontSize: "0.75rem", padding: "0.2rem 0.5rem",
                          borderRadius: "4px", background: "#f8fafc", color: "#475569", fontWeight: 600,
                          border: "1px solid #e2e8f0"
                        }}>
                          {lead.source_display || lead.source}
                        </span>
                      </td>

                      {/* Action: Reopen */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top", textAlign: "right" }}>
                        <button
                          onClick={() => {
                            setReopenLead(lead);
                            setReopenTarget("new");
                            setReopenNotes("");
                          }}
                          style={{
                            padding: "0.35rem 0.75rem", fontSize: "0.75rem", fontWeight: 700,
                            background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0",
                            borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem"
                          }}
                        >
                          <RotateCcw size={12} /> Reopen Lead
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── REOPEN LEAD MODAL ────────────────────────────────────────────────────── */}
      {reopenLead && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "500px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#166534", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Reopen Lead #{reopenLead.reference}
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Customer: {reopenLead.customer_name} ({reopenLead.customer_phone})
                </p>
              </div>
              <button
                onClick={() => setReopenLead(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReopenSubmit} style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Select Target Pipeline Stage
                </label>
                <select
                  value={reopenTarget}
                  onChange={(e) => setReopenTarget(e.target.value as any)}
                  style={{ width: "100%", padding: "0.55rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", fontWeight: 600 }}
                >
                  <option value="new">Reopen as 1. New Enquiry</option>
                  <option value="interested">Directly convert to 2. Interested (Booking)</option>
                  <option value="callback_later">Schedule for 3. Call Back Later</option>
                </select>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Reopen Notes / Reason
                </label>
                <textarea
                  rows={3}
                  value={reopenNotes}
                  onChange={(e) => setReopenNotes(e.target.value)}
                  placeholder="e.g. Customer called back agreeing to the pricing; number verified..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setReopenLead(null)}
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
                  Confirm Reopen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
