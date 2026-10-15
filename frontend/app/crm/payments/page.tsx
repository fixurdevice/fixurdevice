"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus, Search, Download, Eye, CreditCard,
  DollarSign, CheckCircle2, Clock, AlertCircle,
  Smartphone, User, RefreshCw
} from "lucide-react";

interface PaymentEntry {
  id: string;
  repairId: string;
  customer: string;
  device: string;
  totalBilled: number;
  amountReceived: number;
  balanceDue: number;
  status: "paid" | "partially_paid" | "pending";
  method: string;
  date: string;
  ref: string;
}

const defaultPayments: PaymentEntry[] = [
  {
    id: "PAY-0087",
    repairId: "RO-0087",
    customer: "Vikram Malhotra",
    device: "iPad Pro 11-inch",
    totalBilled: 8200,
    amountReceived: 8200,
    balanceDue: 0,
    status: "paid",
    method: "UPI (Google Pay)",
    date: "11 Oct 2026",
    ref: "UPI/3294829104",
  },
  {
    id: "PAY-0089",
    repairId: "RO-0089",
    customer: "Suresh Kumar",
    device: "iPhone 15 Pro",
    totalBilled: 6500,
    amountReceived: 2000,
    balanceDue: 4500,
    status: "partially_paid",
    method: "UPI (PhonePe)",
    date: "11 Oct 2026",
    ref: "UPI/9981249910",
  },
  {
    id: "PAY-0082",
    repairId: "RO-0082",
    customer: "Vikram Sethi",
    device: "iPad Pro 12.9",
    totalBilled: 5800,
    amountReceived: 5800,
    balanceDue: 0,
    status: "paid",
    method: "Card Swipe (HDFC POS)",
    date: "10 Oct 2026",
    ref: "POS-98124",
  },
  {
    id: "PAY-0091",
    repairId: "RO-0091",
    customer: "Meera Reddy",
    device: "OnePlus 12",
    totalBilled: 3800,
    amountReceived: 0,
    balanceDue: 3800,
    status: "pending",
    method: "Pay on Delivery",
    date: "10 Oct 2026",
    ref: "PENDING-COD",
  },
  {
    id: "PAY-0093",
    repairId: "RO-0093",
    customer: "Priya Nair",
    device: "Samsung Galaxy S24",
    totalBilled: 2800,
    amountReceived: 2800,
    balanceDue: 0,
    status: "paid",
    method: "Cash at Store Counter",
    date: "10 Oct 2026",
    ref: "CASH-REC-102",
  },
];

const statusColors = {
  pending: { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  partially_paid: { bg: "#dbeafe", color: "#1e40af", label: "Partially Paid" },
  paid: { bg: "#d1fae5", color: "#065f46", label: "Paid in Full ✓" },
};

export default function PaymentsPage() {
  const [paymentsList, setPaymentsList] = useState<PaymentEntry[]>(defaultPayments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // New payment form modal state
  const [custName, setCustName] = useState("");
  const [devModel, setDevModel] = useState("");
  const [billedAmt, setBilledAmt] = useState("");
  const [recAmt, setRecAmt] = useState("");
  const [payMethod, setPayMethod] = useState("UPI (Google Pay)");
  const [payRef, setPayRef] = useState("");

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const billed = parseFloat(billedAmt) || 0;
    const received = parseFloat(recAmt) || 0;
    const balance = Math.max(0, billed - received);

    const newPay: PaymentEntry = {
      id: `PAY-00${paymentsList.length + 90}`,
      repairId: `RO-00${paymentsList.length + 90}`,
      customer: custName.trim(),
      device: devModel.trim(),
      totalBilled: billed,
      amountReceived: received,
      balanceDue: balance,
      status: balance === 0 ? "paid" : received > 0 ? "partially_paid" : "pending",
      method: payMethod,
      date: "Today",
      ref: payRef || `TXN-${Date.now().toString().slice(-6)}`,
    };

    setPaymentsList([newPay, ...paymentsList]);
    setShowModal(false);
    setCustName("");
    setDevModel("");
    setBilledAmt("");
    setRecAmt("");
    setPayRef("");
  };

  const filtered = paymentsList.filter((p) => {
    const matchSearch =
      !search ||
      p.customer.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.method.toLowerCase().includes(search.toLowerCase()) ||
      p.device.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCollected = paymentsList.reduce((acc, p) => acc + p.amountReceived, 0);
  const totalPending = paymentsList.reduce((acc, p) => acc + p.balanceDue, 0);

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--brand-navy)" }}>
            Payments &amp; Billing
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Track total amount received, payment method (UPI, Cash, Card), advance deposits, and pending balances.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/crm/reports" className="btn btn-secondary btn-sm">
            <DollarSign size={14} /> Profit Analytics
          </Link>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            <Plus size={14} /> Record Payment
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "1.5rem" }}>
        <div style={{ background: "white", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "14px", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#16a34a", lineHeight: 1 }}>
              ₹{totalCollected.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
              Total Payment Received (UPI, Cash, Card)
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "14px", background: "#fef3c7", color: "#b45309", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#b45309", lineHeight: 1 }}>
              ₹{totalPending.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
              Pending Balance on Delivery (COD)
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "14px", background: "#ede9fe", color: "#6c3fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--brand-navy)", lineHeight: 1 }}>
              {paymentsList.length} Jobs
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
              Total Billed Repair Orders
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: "1rem",
          }}
        >
          <div style={{ background: "white", borderRadius: "var(--border-radius-2xl)", padding: "2rem", width: "100%", maxWidth: 480, boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--brand-navy)", marginBottom: "0.25rem" }}>
              Record Payment Receipt
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Add a payment receipt with exact payment place/method and reference ID.
            </p>

            <form onSubmit={handleRecordPayment}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="pay-cust">Customer Name *</label>
                <input id="pay-cust" type="text" className="form-input" placeholder="e.g. Rahul Sharma" value={custName} onChange={(e) => setCustName(e.target.value)} required />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="pay-dev">Device Model *</label>
                <input id="pay-dev" type="text" className="form-input" placeholder="e.g. iPhone 15 Pro" value={devModel} onChange={(e) => setDevModel(e.target.value)} required />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="pay-total">Total Billed (₹) *</label>
                  <input id="pay-total" type="number" className="form-input" placeholder="e.g. 6500" value={billedAmt} onChange={(e) => setBilledAmt(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pay-rec">Amount Received (₹) *</label>
                  <input id="pay-rec" type="number" className="form-input" placeholder="e.g. 6500" value={recAmt} onChange={(e) => setRecAmt(e.target.value)} required />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="pay-meth">Payment Place / Method *</label>
                <select id="pay-meth" className="form-input form-select" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                  <option value="UPI (Google Pay)">UPI (Google Pay)</option>
                  <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                  <option value="UPI (Paytm)">UPI (Paytm / QR Scan)</option>
                  <option value="Cash at Store Counter">Cash at Store Counter</option>
                  <option value="Card Swipe (HDFC POS)">Credit/Debit Card (POS Swipe)</option>
                  <option value="Net Banking">Net Banking / IMPS</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor="pay-txnid">Transaction / UTR Reference ID</label>
                <input id="pay-txnid" type="text" className="form-input" placeholder="e.g. UPI/3289190141" value={payRef} onChange={(e) => setPayRef(e.target.value)} />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ background: "white", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "2.25rem" }}
            placeholder="Search customer, payment ID, method..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="form-input form-select" style={{ width: "auto" }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Payment Statuses</option>
          <option value="paid">Paid in Full</option>
          <option value="partially_paid">Partially Paid (Advance)</option>
          <option value="pending">Pending on Delivery</option>
        </select>
      </div>

      {/* Payments Table */}
      <div style={{ background: "white", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        <div className="table-wrapper" style={{ border: "none" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Customer &amp; Device</th>
                <th>Total Billed</th>
                <th>Amount Received</th>
                <th>Balance Due</th>
                <th>Payment Mode / Place</th>
                <th>Transaction Ref</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((pay) => {
                const badge = statusColors[pay.status] || { bg: "#f1f5f9", color: "#475569", label: pay.status };
                return (
                  <tr key={pay.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.8125rem", color: "var(--brand-purple)" }}>
                        {pay.id}
                      </span>
                      <div style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>{pay.repairId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--brand-navy)" }}>{pay.customer}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{pay.device}</div>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--brand-navy)" }}>
                      ₹{pay.totalBilled.toLocaleString("en-IN")}
                    </td>
                    <td style={{ fontWeight: 800, fontSize: "0.95rem", color: "#16a34a" }}>
                      ₹{pay.amountReceived.toLocaleString("en-IN")}
                    </td>
                    <td>
                      {pay.balanceDue > 0 ? (
                        <span style={{ fontWeight: 800, color: "#b91c1c", fontSize: "0.875rem" }}>
                          ₹{pay.balanceDue.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.8rem" }}>
                          ₹0 (Settled)
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.25rem 0.65rem",
                          borderRadius: "var(--border-radius-full)",
                          background: "#f1f5f9",
                          color: "#334155",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                        }}
                      >
                        <CreditCard size={12} />
                        {pay.method}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--gray-500)" }}>
                        {pay.ref}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.625rem",
                          borderRadius: "var(--border-radius-full)",
                          background: badge.bg,
                          color: badge.color,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                      {pay.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
