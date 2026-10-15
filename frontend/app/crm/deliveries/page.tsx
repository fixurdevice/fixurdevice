"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Truck,
  CheckCircle2,
  Clock,
  Phone,
  CreditCard,
  Shield,
  MapPin,
  Search,
  Filter,
  DollarSign,
  Smartphone,
  User,
  ArrowRight
} from "lucide-react";

interface DeliveryOrder {
  id: string;
  repairId: string;
  customer: string;
  phone: string;
  device: string;
  serviceCompleted: string;
  technician: string;
  deliveryMethod: "doorstep_delivery" | "store_handover";
  address: string;
  rider: string;
  balanceDue: number;
  paymentMode: string;
  qcVerified: boolean;
  status: "ready" | "out_for_delivery" | "delivered";
}

const defaultDeliveries: DeliveryOrder[] = [
  {
    id: "DEL-301",
    repairId: "RO-0082",
    customer: "Vikram Sethi",
    phone: "9876543216",
    device: "iPad Pro 12.9",
    serviceCompleted: "Display Controller IC Repaired + Full QC Passed",
    technician: "Ramesh",
    deliveryMethod: "doorstep_delivery",
    address: "Banashankari 3rd Stage, Bangalore - 560085",
    rider: "Rajan (Rider #1)",
    balanceDue: 2800,
    paymentMode: "UPI on Delivery",
    qcVerified: true,
    status: "out_for_delivery",
  },
  {
    id: "DEL-302",
    repairId: "RO-0087",
    customer: "Vikram Malhotra",
    phone: "9876500001",
    device: "iPad Pro 11-inch",
    serviceCompleted: "Original OLED Screen Replaced + TrueTone Transferred",
    technician: "Arjun",
    deliveryMethod: "store_handover",
    address: "FixUrDevice Workshop (#159 Jayanagar Store Counter)",
    rider: "In-Store Counter",
    balanceDue: 0,
    paymentMode: "Fully Paid (Advance)",
    qcVerified: true,
    status: "ready",
  },
  {
    id: "DEL-303",
    repairId: "RO-0093",
    customer: "Priya Nair",
    phone: "9876543211",
    device: "Samsung Galaxy S24",
    serviceCompleted: "High-Capacity Battery Replacement (100% Health)",
    technician: "Imran",
    deliveryMethod: "doorstep_delivery",
    address: "Indiranagar 12th Main, Bangalore - 560038",
    rider: "Karthik (Rider #2)",
    balanceDue: 1800,
    paymentMode: "Cash / UPI",
    qcVerified: true,
    status: "delivered",
  },
];

const deliveryStatusStyles = {
  ready: { bg: "#fef3c7", color: "#92400e", label: "Ready for Delivery / Handover" },
  out_for_delivery: { bg: "#e0f2fe", color: "#0369a1", label: "Out for Delivery" },
  delivered: { bg: "#dcfce7", color: "#15803d", label: "Delivered & Payment Settled ✓" },
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(defaultDeliveries);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const updateDeliveryStatus = (id: string, newStatus: DeliveryOrder["status"]) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  const filtered = deliveries.filter((d) => {
    const matchSearch =
      !search ||
      d.customer.toLowerCase().includes(search.toLowerCase()) ||
      d.device.toLowerCase().includes(search.toLowerCase()) ||
      d.address.toLowerCase().includes(search.toLowerCase());
    const matchMethod = methodFilter === "all" || d.deliveryMethod === methodFilter;
    return matchSearch && matchMethod;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--brand-navy)" }}>
            Deliveries &amp; Customer Handover
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Manage repaired phone dispatch, doorstep riders, balance collection, and in-store collections.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/crm/repairs" className="btn btn-secondary btn-sm">
            View Repairs In Progress
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.25rem", marginBottom: "1.75rem" }}>
        <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "14px", background: "#ede9fe", color: "#6c3fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--brand-navy)", lineHeight: 1 }}>
              {deliveries.filter((d) => d.status === "ready").length}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
              QC Passed &amp; Ready for Handover
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "14px", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--brand-navy)", lineHeight: 1 }}>
              {deliveries.filter((d) => d.status === "out_for_delivery").length}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
              Out for Doorstep Delivery
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "1.5rem", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 48, height: 48, borderRadius: "14px", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#16a34a", lineHeight: 1 }}>
              ₹{deliveries.reduce((acc, d) => (d.status === "delivered" ? acc + d.balanceDue : acc), 0).toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
              COD / Payment Collected Today
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div
        style={{
          background: "white",
          borderRadius: "var(--border-radius-xl)",
          padding: "1rem 1.25rem",
          border: "1px solid var(--border-color)",
          marginBottom: "1.25rem",
          display: "flex",
          gap: "1rem",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", minWidth: 260, flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "2.25rem" }}
            placeholder="Search by customer, phone, device, address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-input form-select"
          style={{ width: "auto" }}
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
        >
          <option value="all">All Delivery Modes</option>
          <option value="doorstep_delivery">🛵 Doorstep Delivery</option>
          <option value="store_handover">🏬 In-Store Walk-in Collection</option>
        </select>
      </div>

      {/* Deliveries Table */}
      <div
        style={{
          background: "white",
          borderRadius: "var(--border-radius-xl)",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="table-wrapper" style={{ border: "none" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Customer Info</th>
                <th>Device &amp; Completed Service</th>
                <th>Delivery Mode &amp; Address</th>
                <th>Assigned Rider</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((del) => {
                const badge = deliveryStatusStyles[del.status];
                return (
                  <tr key={del.id}>
                    <td>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.78rem", color: "var(--brand-purple)" }}>
                        {del.id}
                      </span>
                      <div style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>{del.repairId}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--brand-navy)" }}>{del.customer}</div>
                      <a href={`tel:${del.phone}`} style={{ fontSize: "0.75rem", color: "var(--brand-purple)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                        <Phone size={10} /> {del.phone}
                      </a>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: "0.8125rem" }}>{del.device}</div>
                      <div style={{ color: "#16a34a", fontSize: "0.75rem", fontWeight: 600 }}>
                        ✓ {del.serviceCompleted}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>Repaired by Tech: {del.technician}</div>
                    </td>
                    <td>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: 600, fontSize: "0.78rem", color: del.deliveryMethod === "doorstep_delivery" ? "#0284c7" : "#7c3aed" }}>
                        {del.deliveryMethod === "doorstep_delivery" ? "🛵 Doorstep Delivery" : "🏬 Store Handover"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-600)", marginTop: "0.15rem" }}>
                        {del.address}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--brand-navy)" }}>
                        {del.rider}
                      </span>
                    </td>
                    <td>
                      {del.balanceDue > 0 ? (
                        <div>
                          <div style={{ fontWeight: 800, color: "#b91c1c", fontSize: "0.875rem" }}>
                            ₹{del.balanceDue.toLocaleString("en-IN")}
                          </div>
                          <span style={{ fontSize: "0.7rem", color: "var(--gray-500)" }}>{del.paymentMode}</span>
                        </div>
                      ) : (
                        <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.78rem" }}>
                          Full Paid ✓
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.65rem",
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
                    <td>
                      {del.status === "ready" && (
                        <button
                          onClick={() => updateDeliveryStatus(del.id, "out_for_delivery")}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem" }}
                        >
                          Dispatch Rider &rarr;
                        </button>
                      )}
                      {del.status === "out_for_delivery" && (
                        <button
                          onClick={() => updateDeliveryStatus(del.id, "delivered")}
                          className="btn btn-sm"
                          style={{ fontSize: "0.72rem", padding: "0.25rem 0.6rem", background: "#16a34a", color: "white", border: "none" }}
                        >
                          Confirm Handover &amp; Collect
                        </button>
                      )}
                      {del.status === "delivered" && (
                        <span style={{ color: "#16a34a", fontSize: "0.75rem", fontWeight: 700 }}>
                          Handover Complete ✓
                        </span>
                      )}
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
