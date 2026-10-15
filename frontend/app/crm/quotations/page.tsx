"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Filter, Download, Eye,
  ChevronLeft, ChevronRight, AlertCircle, FileText,
  Clock, CheckCircle2, XCircle,
} from "lucide-react";

const statusColors: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: "#f1f5f9", color: "#475569", label: "Draft" },
  sent: { bg: "#dbeafe", color: "#1e40af", label: "Sent to Customer" },
  awaiting_approval: { bg: "#ffedd5", color: "#9a3412", label: "Awaiting Approval" },
  approved: { bg: "#d1fae5", color: "#065f46", label: "Approved" },
  rejected: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
  expired: { bg: "#f1f5f9", color: "#64748b", label: "Expired" },
  superseded: { bg: "#f1f5f9", color: "#94a3b8", label: "Superseded" },
};

const quotations = [
  {
    id: "QT-0094",
    version: 1,
    repair: "RO-0094",
    lead: "FUD-261010-A1B2",
    customer: "Rahul Sharma",
    device: "iPhone 15 Pro",
    status: "awaiting_approval",
    sent: "10 Oct 2026",
    expires: "17 Oct 2026",
    lineItems: 2,
    createdBy: "Anjali",
  },
  {
    id: "QT-0087",
    version: 2,
    repair: "RO-0087",
    lead: "FUD-261009-I9J0",
    customer: "Suresh Babu",
    device: "iPhone 13 mini",
    status: "approved",
    sent: "09 Oct 2026",
    expires: "16 Oct 2026",
    lineItems: 1,
    createdBy: "Ramesh",
  },
  {
    id: "QT-0082",
    version: 1,
    repair: "RO-0082",
    lead: "FUD-261008-M3N4",
    customer: "Vikram Sethi",
    device: "iPad Pro 12.9",
    status: "approved",
    sent: "08 Oct 2026",
    expires: "15 Oct 2026",
    lineItems: 1,
    createdBy: "Anjali",
  },
  {
    id: "QT-0079",
    version: 1,
    repair: "RO-0079",
    lead: "FUD-261008-O5P6",
    customer: "Nandita Roy",
    device: "Samsung Galaxy A54",
    status: "approved",
    sent: "07 Oct 2026",
    expires: "14 Oct 2026",
    lineItems: 1,
    createdBy: "Ramesh",
  },
  {
    id: "QT-0091",
    version: 1,
    repair: "RO-0091",
    lead: "FUD-261010-G7H8",
    customer: "Meera Reddy",
    device: "OnePlus 12",
    status: "draft",
    sent: "—",
    expires: "—",
    lineItems: 0,
    createdBy: "Deepak",
  },
];

export default function QuotationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = quotations.filter((q) => {
    const matchSearch = !search ||
      q.customer.toLowerCase().includes(search.toLowerCase()) ||
      q.id.toLowerCase().includes(search.toLowerCase()) ||
      q.device.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--brand-navy)" }}>
            Quotations
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Internal repair quotations — never exposed publicly
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-ghost btn-sm" style={{ border: "1px solid var(--border-color)" }}>
            <Download size={14} /> Export
          </button>
          <Link href="/crm/quotations/new" className="btn btn-primary btn-sm">
            <Plus size={14} /> New Quotation
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.875rem", marginBottom: "1.5rem" }} className="quot-stats">
        {[
          { label: "Awaiting Approval", count: 1, icon: Clock, color: "#f97316", bg: "#ffedd5" },
          { label: "Approved", count: 3, icon: CheckCircle2, color: "#10b981", bg: "#d1fae5" },
          { label: "Rejected", count: 0, icon: XCircle, color: "#ef4444", bg: "#fee2e2" },
          { label: "Draft", count: 1, icon: FileText, color: "#6c3fff", bg: "#ede9fe" },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: "var(--border-radius-lg)", border: "1px solid var(--border-color)", padding: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--border-radius)", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={16} color={s.color} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.375rem", lineHeight: 1 }}>{s.count}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--gray-400)", fontWeight: 500 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: "white", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input type="text" placeholder="Search quotations..." className="form-input" style={{ paddingLeft: "2.25rem" }} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-input form-select" style={{ width: "auto", minWidth: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.entries(statusColors).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Important notice */}
      <div style={{ background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: "var(--border-radius-lg)", padding: "0.75rem 1rem", marginBottom: "1.25rem", display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.8125rem", color: "#1e40af" }}>
        <AlertCircle size={14} />
        <strong>Internal Only:</strong>&nbsp;Quotation amounts are never exposed to the public website or public APIs. Only authorised staff can view this data.
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
        <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Quote ID</th>
                <th>Ver.</th>
                <th>Customer & Device</th>
                <th>Repair Order</th>
                <th>Status</th>
                <th>Date Sent</th>
                <th>Expires</th>
                <th>Line Items</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const sc = statusColors[q.status] || { bg: "#f1f5f9", color: "#475569", label: q.status };
                return (
                  <tr key={q.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.8125rem", color: "var(--brand-purple)" }}>{q.id}</span>
                    </td>
                    <td>
                      <span style={{ background: "var(--gray-100)", borderRadius: "var(--border-radius-full)", padding: "0.125rem 0.5rem", fontSize: "0.75rem", fontWeight: 600 }}>v{q.version}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{q.customer}</div>
                      <div style={{ color: "var(--gray-400)", fontSize: "0.75rem" }}>{q.device}</div>
                    </td>
                    <td>
                      <Link href={`/crm/repairs/${q.repair}`} style={{ fontSize: "0.75rem", color: "var(--brand-purple)", textDecoration: "none", fontFamily: "monospace" }}>{q.repair}</Link>
                    </td>
                    <td>
                      <span style={{ display: "inline-block", padding: "0.2rem 0.625rem", borderRadius: "var(--border-radius-full)", background: sc.bg, color: sc.color, fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>{q.sent}</td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>{q.expires}</td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--gray-600)" }}>{q.lineItems} items</td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--gray-600)" }}>{q.createdBy}</td>
                    <td>
                      <Link href={`/crm/quotations/${q.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "var(--border-radius)", border: "1px solid var(--border-color)", color: "var(--gray-600)", textDecoration: "none" }}>
                        <Eye size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>Showing {filtered.length} of {quotations.length} quotations</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-ghost btn-sm" style={{ border: "1px solid var(--border-color)", padding: "0.375rem 0.625rem" }}><ChevronLeft size={16} /></button>
            <button className="btn btn-primary btn-sm" style={{ padding: "0.375rem 0.75rem", fontSize: "0.8125rem" }}>1</button>
            <button className="btn btn-ghost btn-sm" style={{ border: "1px solid var(--border-color)", padding: "0.375rem 0.625rem" }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) { .quot-stats { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .quot-stats { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </div>
  );
}
