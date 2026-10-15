"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Printer,
  Download,
  Eye,
  CheckCircle2,
  Phone,
  Calendar,
  Wrench,
  Shield,
  RefreshCw,
  Plus,
  X,
  MessageCircle,
  Mail,
  DollarSign,
  AlertCircle,
  Info,
} from "lucide-react";

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  repair_order: string;
  repair_order_number: string;
  lead?: string;
  lead_reference?: string;
  customer: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  device: string;
  issue: string;
  service: string;
  technician: string;
  product_price: number;
  service_charges: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  final_billed_amount: number;
  amount_paid: number;
  outstanding_balance?: number;
  status: string;
  issued_at: string;
  warranty: string;
  pdf_url: string;
}

interface CompletedBooking {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  device_model_text: string;
  confirmed_issue?: string;
  work_performed?: string;
  assigned_technician_name?: string;
  product_price: number;
  service_charges: number;
  total_customer_charge: number;
  has_invoice: boolean;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [completedBookings, setCompletedBookings] = useState<CompletedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Create Invoice Modal State
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [newInvoiceTaxRate, setNewInvoiceTaxRate] = useState<number>(0);
  const [newInvoiceStatus, setNewInvoiceStatus] = useState("paid");
  const [newInvoiceWarranty, setNewInvoiceWarranty] = useState("90 Days Service & Replacement Warranty");

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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, bookRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/payments/invoices/`),
        fetch(`${apiUrl}/api/v1/repairs/?status=completed`),
      ]);

      if (invRes.ok) {
        const invData = await invRes.json();
        setInvoices(Array.isArray(invData) ? invData : invData.results || []);
      }

      if (bookRes.ok) {
        const bookData = await bookRes.json();
        const results = Array.isArray(bookData) ? bookData : bookData.results || [];
        setCompletedBookings(results);
      }
    } catch (err: any) {
      showNotification("Error connecting to invoices backend: " + err.message, true);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create Invoice Submission
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      showNotification("Please select a completed booking to invoice.", true);
      return;
    }

    const booking = completedBookings.find((b) => b.id === selectedBookingId);
    if (!booking) return;

    try {
      const res = await fetch(`${apiUrl}/api/v1/payments/invoices/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repair_order_id: booking.id,
          product_price: booking.product_price,
          service_charges: booking.service_charges,
          tax_rate: newInvoiceTaxRate,
          status: newInvoiceStatus,
          warranty: newInvoiceWarranty,
          customer_name: booking.customer_name,
          customer_phone: booking.customer_phone,
          customer_email: booking.customer_email,
          customer_address: booking.customer_address,
          device: booking.device_model_text,
          service: booking.confirmed_issue || booking.work_performed,
          technician: booking.assigned_technician_name,
        }),
      });

      if (res.ok) {
        const newInv = await res.json();
        showNotification(`Invoice ${newInv.invoice_number} created successfully!`);
        setShowCreateModal(false);
        setSelectedBookingId("");
        loadData();
      } else {
        const err = await res.json();
        showNotification(err.error || "Failed to create invoice.", true);
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    // GLOBAL SEARCH OVERRIDE:
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = inv.invoice_number?.toLowerCase().includes(q);
      const matchOrder = inv.repair_order_number?.toLowerCase().includes(q);
      const matchLead = inv.lead_reference?.toLowerCase().includes(q);
      const matchName = inv.customer_name?.toLowerCase().includes(q);
      const matchPhone = inv.customer_phone?.includes(q);
      const matchDevice = inv.device?.toLowerCase().includes(q);
      const matchService = (inv.service || "").toLowerCase().includes(q);
      const matchTech = (inv.technician || "").toLowerCase().includes(q);
      return matchNum || matchOrder || matchLead || matchName || matchPhone || matchDevice || matchService || matchTech;
    }

    if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (dateFilter) {
      const invDate = (inv.issued_at || "").slice(0, 10);
      if (invDate !== dateFilter) return false;
    }
    return true;
  });

  // Revenue totals
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((acc, curr) => acc + Number(curr.final_billed_amount || 0), 0);
  const pendingRevenue = invoices.filter((i) => i.status !== "paid").reduce((acc, curr) => acc + Number(curr.final_billed_amount || 0), 0);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Notifications */}
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
            <FileText size={26} color="#166534" /> Customer Invoices & Billing
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Official customer-facing tax invoices generated from completed database service bookings. Downloadable PDF & print ready.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={() => loadData()}
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 0.85rem",
              background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px",
              cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, color: "#334155"
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 1rem",
              background: "#166534", color: "white", border: "none", borderRadius: "6px",
              cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700
            }}
          >
            <Plus size={16} />
            + New Invoice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.875rem", marginBottom: "1.25rem" }}>
        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem" }}>
          <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Generated Invoices</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>{invoices.length}</div>
          <div style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: "0.25rem" }}>Stored in SQLite DB</div>
        </div>

        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem" }}>
          <div style={{ color: "#166534", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Paid Revenue Collected</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#166534", marginTop: "0.25rem" }}>₹{totalRevenue.toLocaleString()}</div>
          <div style={{ fontSize: "0.75rem", color: "#15803d", marginTop: "0.25rem" }}>All cleared transactions</div>
        </div>

        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem" }}>
          <div style={{ color: "#92400e", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Pending Invoice Balance</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#92400e", marginTop: "0.25rem" }}>₹{pendingRevenue.toLocaleString()}</div>
          <div style={{ fontSize: "0.75rem", color: "#b45309", marginTop: "0.25rem" }}>Awaiting collection</div>
        </div>

        <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem" }}>
          <div style={{ color: "#0369a1", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Eligible Completed Jobs</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0369a1", marginTop: "0.25rem" }}>
            {completedBookings.filter((b) => !b.has_invoice).length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#0284c7", marginTop: "0.25rem" }}>Awaiting invoice creation</div>
        </div>
      </div>

      {/* Search & Date Filter Bar */}
      <div style={{
        background: "white", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0",
        marginBottom: "1.25rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap"
      }}>
        <div style={{ flex: "1 1 300px", position: "relative" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices by invoice number, order ID, lead ID, customer, device..."
            style={{
              width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.25rem",
              borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1",
              fontSize: "0.8125rem", background: "white", color: "#1e293b", fontWeight: 600
            }}
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
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
              title="Filter by Invoice Date"
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
            🔍 <strong>Global Search Active:</strong> Showing all results matching &ldquo;{search}&rdquo; across all invoices from all dates.
          </span>
          <button
            onClick={() => setSearch("")}
            style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", fontSize: "0.8125rem" }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Invoices Table */}
      <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Invoice # / Date</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Customer</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Job & Lead ID</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Device & Work Done</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Final Amount</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Payment</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569", textAlign: "right" }}>PDF & Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 0.5rem" }} />
                    Loading database invoices...
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    <FileText size={32} style={{ margin: "0 auto 0.5rem", color: "#94a3b8" }} />
                    <div style={{ fontWeight: 600, fontSize: "1rem", color: "#334155" }}>No invoices found</div>
                    <p style={{ margin: "0.25rem 0 1rem", fontSize: "0.8125rem" }}>
                      Generate an invoice for any completed repair order to view and download here.
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      style={{
                        padding: "0.5rem 1rem", background: "#166534", color: "white", border: "none",
                        borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.8125rem"
                      }}
                    >
                      + Generate New Invoice
                    </button>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.status === "paid";
                  const dateStr = inv.issued_at
                    ? new Date(inv.issued_at).toLocaleDateString("en-IN", { dateStyle: "medium" })
                    : "Today";

                  return (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Invoice Number & Date */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontFamily: "monospace", fontWeight: 800, color: "#166534", fontSize: "0.875rem" }}>
                          {inv.invoice_number}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>
                          📅 {dateStr}
                        </div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{inv.customer_name}</div>
                        <div style={{ color: "#2563eb", fontSize: "0.8125rem", fontWeight: 600, marginTop: "2px" }}>
                          {inv.customer_phone}
                        </div>
                      </td>

                      {/* Job & Lead ID */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e293b", fontSize: "0.8125rem" }}>
                          {inv.repair_order_number || "RO-N/A"}
                        </div>
                        {inv.lead_reference && (
                          <div style={{ color: "#6366f1", fontSize: "0.75rem", marginTop: "2px", fontWeight: 600 }}>
                            Lead: {inv.lead_reference}
                          </div>
                        )}
                      </td>

                      {/* Device & Service */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: "#334155" }}>
                          {inv.device || "Apple / Smart Device"}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "2px", maxWidth: "220px" }}>
                          {inv.service || "Diagnostic & Repair Service"}
                        </div>
                      </td>

                      {/* Final Amount */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>
                          ₹{Number(inv.final_billed_amount || 0).toLocaleString()}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "2px" }}>
                          Part: ₹{inv.product_price} | Service: ₹{inv.service_charges}
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <span style={{
                          display: "inline-block", fontSize: "0.75rem", padding: "0.2rem 0.6rem",
                          borderRadius: "12px", fontWeight: 700,
                          background: isPaid ? "#dcfce7" : "#fef3c7",
                          color: isPaid ? "#166534" : "#92400e",
                          border: `1px solid ${isPaid ? "#bbf7d0" : "#fde68a"}`
                        }}>
                          {isPaid ? "PAID ✓" : "PENDING"}
                        </span>
                      </td>

                      {/* PDF & View Actions */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            style={{
                              padding: "0.35rem 0.65rem", fontSize: "0.75rem", fontWeight: 700,
                              background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1",
                              borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem"
                            }}
                          >
                            <Eye size={12} /> View
                          </button>
                          <a
                            href={`${apiUrl}/api/v1/payments/invoices/${inv.id}/pdf/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: "0.35rem 0.65rem", fontSize: "0.75rem", fontWeight: 700,
                              background: "#166534", color: "white", borderRadius: "6px",
                              textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem"
                            }}
                          >
                            <Download size={12} /> PDF
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── PRINTABLE INVOICE PREVIEW MODAL ────────────────────────────────────── */}
      {selectedInvoice && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.65)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "800px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden", maxHeight: "95vh", display: "flex", flexDirection: "column"
          }}>
            {/* Modal Header Actions */}
            <div style={{
              background: "#1e1b4b", color: "white", padding: "1rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={20} />
                <span style={{ fontWeight: 700 }}>Tax Invoice #{selectedInvoice.invoice_number}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <a
                  href={`${apiUrl}/api/v1/payments/invoices/${selectedInvoice.id}/pdf/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem",
                    background: "#166534", color: "white", borderRadius: "6px", textDecoration: "none", fontSize: "0.8125rem", fontWeight: 700
                  }}
                >
                  <Download size={14} /> Download PDF
                </a>
                <button
                  onClick={() => window.print()}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.75rem",
                    background: "#334155", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700
                  }}
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Invoice Printable Sheet */}
            <div style={{ padding: "2rem", overflowY: "auto", background: "#ffffff", color: "#0f172a" }}>
              {/* Header: Company Details & Tax Invoice Title */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #6366f1", paddingBottom: "1.25rem", marginBottom: "1.25rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#1e1b4b", margin: 0 }}>
                    FixUrDevice
                  </h2>
                  <div style={{ fontSize: "0.8125rem", color: "#475569", lineHeight: 1.5, marginTop: "0.25rem" }}>
                    FixUrDevice Apple & Smart Device Service<br />
                    #159, 1st Floor, 32nd E Cross Rd, Opp. Sanjay Gandhi Hospital<br />
                    4th T Block East, Tilak Nagar, Jayanagar, Bengaluru - 560041<br />
                    Phone: +91 93435 84460 | Web: www.fixurdevice.in
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e1b4b" }}>TAX INVOICE</div>
                  <div style={{ fontSize: "0.85rem", color: "#334155", marginTop: "0.25rem" }}>
                    <strong>Invoice #:</strong> {selectedInvoice.invoice_number}<br />
                    <strong>Date:</strong> {selectedInvoice.issued_at ? new Date(selectedInvoice.issued_at).toLocaleDateString("en-IN") : "Today"}<br />
                    <strong>Booking ID:</strong> {selectedInvoice.repair_order_number || "N/A"}<br />
                    <strong>Status:</strong> <span style={{ color: selectedInvoice.status === "paid" ? "#166534" : "#92400e", fontWeight: 800 }}>{selectedInvoice.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Billed To & Service Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    Billed To (Customer Details)
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>
                    {selectedInvoice.customer_name}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#334155", marginTop: "0.25rem" }}>
                    Phone: {selectedInvoice.customer_phone}<br />
                    Email: {selectedInvoice.customer_email || "N/A"}<br />
                    Address: {selectedInvoice.customer_address || "Bangalore, Karnataka"}
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                    Service & Device Particulars
                  </div>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "#0f172a" }}>
                    {selectedInvoice.device}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#334155", marginTop: "0.25rem" }}>
                    Reported Issue: {selectedInvoice.issue || "General Issue"}<br />
                    Service Done: {selectedInvoice.service || "Diagnostic & Repair Service"}<br />
                    Certified Technician: {selectedInvoice.technician}
                  </div>
                </div>
              </div>

              {/* Line Items Table (Strictly NO internal profit or cost!) */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "1.25rem", border: "1px solid #e2e8f0" }}>
                <thead>
                  <tr style={{ background: "#1e1b4b", color: "white", textAlign: "left", fontSize: "0.8125rem" }}>
                    <th style={{ padding: "0.65rem 0.85rem" }}>Item / Description</th>
                    <th style={{ padding: "0.65rem 0.85rem" }}>Category</th>
                    <th style={{ padding: "0.65rem 0.85rem", textAlign: "right" }}>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: "0.875rem" }}>
                  {selectedInvoice.product_price > 0 && (
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.75rem 0.85rem" }}>
                        <strong>Replacement Hardware / Component</strong>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Device: {selectedInvoice.device}</div>
                      </td>
                      <td style={{ padding: "0.75rem 0.85rem", color: "#475569" }}>Product / Part</td>
                      <td style={{ padding: "0.75rem 0.85rem", textAlign: "right", fontWeight: 700 }}>
                        ₹{selectedInvoice.product_price.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.75rem 0.85rem" }}>
                      <strong>{selectedInvoice.service || "Professional Repair & Diagnostic Labor"}</strong>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Quality Check passed</div>
                    </td>
                    <td style={{ padding: "0.75rem 0.85rem", color: "#475569" }}>Service Charge</td>
                    <td style={{ padding: "0.75rem 0.85rem", textAlign: "right", fontWeight: 700 }}>
                      ₹{selectedInvoice.service_charges.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
                <div style={{ width: "320px", fontSize: "0.875rem", lineHeight: 1.8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Subtotal:</span>
                    <strong>₹{(selectedInvoice.product_price + selectedInvoice.service_charges).toLocaleString()}</strong>
                  </div>
                  {selectedInvoice.tax_amount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>GST / Taxes ({selectedInvoice.tax_rate}%):</span>
                      <strong>₹{selectedInvoice.tax_amount.toLocaleString()}</strong>
                    </div>
                  )}
                  <div style={{
                    display: "flex", justifyContent: "space-between", borderTop: "2px solid #1e1b4b",
                    paddingTop: "0.35rem", marginTop: "0.35rem", fontSize: "1.1rem", fontWeight: 900, color: "#1e1b4b"
                  }}>
                    <span>Total Amount:</span>
                    <span>₹{Number(selectedInvoice.final_billed_amount).toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#166534" }}>
                    <span>Amount Paid:</span>
                    <strong>₹{Number(selectedInvoice.amount_paid).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.78rem", color: "#64748b", lineHeight: 1.6 }}>
                <strong style={{ color: "#334155", display: "block", marginBottom: "0.25rem" }}>Terms & Warranty Policy:</strong>
                1. Warranty: {selectedInvoice.warranty || "90 Days Service Warranty on replaced components."}<br />
                2. Warranty strictly excludes accidental physical damage, liquid ingress, or unauthorized third-party opening.<br />
                3. All parts tested and certified under workshop QA benchmarks prior to release.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CREATE INVOICE MODAL ────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "560px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#166534", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Generate New Invoice
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Select an eligible completed repair booking from the database.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Select Completed Workshop Booking <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  style={{ width: "100%", padding: "0.55rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
                  required
                >
                  <option value="">-- Choose a Completed Job --</option>
                  {completedBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.order_number} — {b.customer_name} ({b.device_model_text}) — ₹{b.total_customer_charge}
                    </option>
                  ))}
                </select>
                {completedBookings.length === 0 && (
                  <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.35rem 0 0" }}>
                    No completed jobs available. Complete a booking first from the Bookings page.
                  </p>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Payment Status
                  </label>
                  <select
                    value={newInvoiceStatus}
                    onChange={(e) => setNewInvoiceStatus(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
                  >
                    <option value="paid">Paid (Full Payment Received)</option>
                    <option value="pending">Pending Payment</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    GST / Taxes (%)
                  </label>
                  <select
                    value={newInvoiceTaxRate}
                    onChange={(e) => setNewInvoiceTaxRate(Number(e.target.value))}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
                  >
                    <option value={0}>0% (None / Inclusive)</option>
                    <option value={18}>18% GST</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Warranty / Invoice Notes
                </label>
                <input
                  type="text"
                  value={newInvoiceWarranty}
                  onChange={(e) => setNewInvoiceWarranty(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: "0.6rem 1.25rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedBookingId}
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "6px", border: "none",
                    background: selectedBookingId ? "#166534" : "#94a3b8", color: "white",
                    cursor: selectedBookingId ? "pointer" : "not-allowed", fontWeight: 700
                  }}
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
