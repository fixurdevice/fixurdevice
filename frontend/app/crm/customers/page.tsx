"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { getApiUrl } from "../../lib/api";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Plus,
  Smartphone,
  Calendar,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  MessageCircle,
  FileText,
  Wrench,
  Clock,
  History,
  X,
  ArrowRight,
  ExternalLink,
  PhoneCall,
  XCircle,
  Check,
  AlertCircle,
  Tag,
  CreditCard,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from "lucide-react";

interface CustomerRecord {
  id: string;
  raw_id?: string;
  name: string;
  phone: string;
  normalized_phone: string;
  email: string;
  area: string;
  address?: string;
  pincode?: string;
  city?: string;
  totalDevices: number;
  totalSpent: number;
  lastVisit: string;
  created_at?: string;
  internal_notes?: string;
  workOrders: string[];
  leadReferences: string[];
  statusSummary: {
    interested: number;
    not_interested: number;
    callback_later: number;
    wrong_number: number;
    other: number;
  };
}

interface CallbackScheduleDetail {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  reason?: string;
  notes?: string;
  status: string;
  status_display?: string;
  call_outcome?: string;
  outcome_notes?: string;
  created_at: string;
}

interface LeadHistoryItem {
  id: string;
  reference: string;
  customer_name?: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  pickup_area?: string;
  pickup_pincode?: string;
  pickup_address?: string;
  device_model_text: string;
  service_requested_text?: string;
  reported_problem: string;
  status: string;
  status_display?: string;
  priority?: string;
  source: string;
  source_display?: string;
  handled_by_name?: string;
  rejection_reason?: string;
  rejection_notes?: string;
  callback_date?: string;
  callback_time?: string;
  callback_notes?: string;
  callback_schedules?: CallbackScheduleDetail[];
  booking_id?: string;
  booking_status?: string;
  internal_notes?: string;
  created_at: string;
  updated_at?: string;
}

interface BookingHistoryItem {
  id: string;
  order_number: string;
  booking_id: string;
  booking_date: string;
  customer_name?: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  linked_lead_id?: string;
  linked_lead_reference?: string;
  device: string;
  device_model_text: string;
  reported_issue?: string;
  intake_condition?: string;
  confirmed_issue?: string;
  work_performed?: string;
  parts_used_notes?: string;
  part_name?: string;
  vendor_name?: string;
  vendor_cost: number;
  product_price: number;
  service_charges: number;
  total_customer_charge: number;
  internal_profit: number;
  assigned_technician_name?: string;
  status: string;
  status_display?: string;
  priority?: string;
  priority_display?: string;
  rework_reason?: string;
  has_invoice: boolean;
  invoice_number?: string;
  invoice_id?: string;
  internal_notes?: string;
  technician_notes?: string;
  created_at: string;
  updated_at?: string;
}

const API_BASE = getApiUrl();

// Helper: Normalize 10-digit phone number for matching
const normalizePhone = (p: string) => {
  if (!p) return "";
  const digits = p.replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [allLeads, setAllLeads] = useState<LeadHistoryItem[]>([]);
  const [allBookings, setAllBookings] = useState<BookingHistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"all" | "leads" | "bookings">("all");
  const [loading, setLoading] = useState(true);

  // New Customer Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("Bangalore");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes, leadsRes, repairsRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/customers/`),
        fetch(`${API_BASE}/api/v1/leads/`),
        fetch(`${API_BASE}/api/v1/repairs/`),
      ]);

      let leadsList: LeadHistoryItem[] = [];
      if (leadsRes.ok) {
        const lData = await leadsRes.json();
        leadsList = Array.isArray(lData) ? lData : lData.results || [];
        setAllLeads(leadsList);
      }

      let bookingsList: BookingHistoryItem[] = [];
      if (repairsRes.ok) {
        const rData = await repairsRes.json();
        bookingsList = Array.isArray(rData) ? rData : rData.results || [];
        setAllBookings(bookingsList);
      }

      let apiCustomers: any[] = [];
      if (custRes.ok) {
        const cData = await custRes.json();
        apiCustomers = Array.isArray(cData) ? cData : cData.results || [];
      }

      // Aggregate all unique customers from Customers table + Leads + Bookings
      const customerMap = new Map<string, CustomerRecord>();

      // 1. Ingest registered customers
      apiCustomers.forEach((c: any) => {
        const norm = normalizePhone(c.phone);
        if (!norm) return;

        customerMap.set(norm, {
          id: (c.id || "").toString().slice(0, 8).toUpperCase(),
          raw_id: c.id,
          name: c.full_name || "Customer",
          phone: c.phone || norm,
          normalized_phone: norm,
          email: c.email || "—",
          area: c.area || "Bangalore",
          address: c.address_line1 || "",
          pincode: c.pincode || "",
          city: c.city || "Bangalore",
          totalDevices: c.total_devices || 0,
          totalSpent: Number(c.total_spent) || 0,
          lastVisit: c.created_at
            ? new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
            : "Recently",
          created_at: c.created_at,
          internal_notes: c.internal_notes || "",
          workOrders: [],
          leadReferences: [],
          statusSummary: { interested: 0, not_interested: 0, callback_later: 0, wrong_number: 0, other: 0 },
        });
      });

      // 2. Ingest leads (capturing all interaction history)
      leadsList.forEach((l) => {
        const norm = normalizePhone(l.customer_phone);
        if (!norm) return;

        if (!customerMap.has(norm)) {
          customerMap.set(norm, {
            id: `CUST-${norm.slice(-4)}`,
            name: l.customer_name || "Customer",
            phone: l.customer_phone,
            normalized_phone: norm,
            email: l.customer_email || "—",
            area: l.pickup_area || "Bangalore",
            address: l.customer_address || l.pickup_address || "",
            pincode: l.pickup_pincode || "",
            city: "Bangalore",
            totalDevices: 0,
            totalSpent: 0,
            lastVisit: l.created_at
              ? new Date(l.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "Recently",
            created_at: l.created_at,
            internal_notes: "",
            workOrders: [],
            leadReferences: [],
            statusSummary: { interested: 0, not_interested: 0, callback_later: 0, wrong_number: 0, other: 0 },
          });
        }

        const existing = customerMap.get(norm)!;
        if (l.reference && !existing.leadReferences.includes(l.reference)) {
          existing.leadReferences.push(l.reference);
        }
        if (l.customer_name && existing.name === "Customer") {
          existing.name = l.customer_name;
        }
        if ((l.customer_address || l.pickup_address) && !existing.address) {
          existing.address = l.customer_address || l.pickup_address;
        }
        if (l.pickup_area && (!existing.area || existing.area === "Bangalore")) {
          existing.area = l.pickup_area;
        }

        // Tally lead statuses
        const st = (l.status || "").toLowerCase();
        if (st === "interested") existing.statusSummary.interested++;
        else if (st === "not_interested") existing.statusSummary.not_interested++;
        else if (st === "callback_later") existing.statusSummary.callback_later++;
        else if (st === "wrong_number") existing.statusSummary.wrong_number++;
        else existing.statusSummary.other++;
      });

      // 3. Ingest Bookings & calculate total spend
      bookingsList.forEach((b) => {
        const norm = normalizePhone(b.customer_phone);
        if (!norm) return;

        if (!customerMap.has(norm)) {
          customerMap.set(norm, {
            id: `CUST-${norm.slice(-4)}`,
            name: b.customer_name || "Customer",
            phone: b.customer_phone,
            normalized_phone: norm,
            email: b.customer_email || "—",
            area: "Bangalore",
            address: b.customer_address || "",
            totalDevices: 0,
            totalSpent: 0,
            lastVisit: b.booking_date || (b.created_at || "").slice(0, 10),
            created_at: b.created_at,
            internal_notes: "",
            workOrders: [],
            leadReferences: [],
            statusSummary: { interested: 0, not_interested: 0, callback_later: 0, wrong_number: 0, other: 0 },
          });
        }

        const existing = customerMap.get(norm)!;
        const orderNum = b.order_number || b.booking_id;
        if (orderNum && !existing.workOrders.includes(orderNum)) {
          existing.workOrders.push(orderNum);
        }
        if (b.customer_name && existing.name === "Customer") {
          existing.name = b.customer_name;
        }
        existing.totalSpent += Number(b.total_customer_charge || 0);
        existing.totalDevices = Math.max(existing.totalDevices, existing.workOrders.length);
      });

      // Sort by creation / visit date
      const list = Array.from(customerMap.values()).sort((a, b) => {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

      setCustomers(list);
    } catch (e) {
      console.error("Failed to fetch customer directory data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/customers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address_line1: address.trim(),
          area: area.trim() || "Bangalore",
        }),
      });

      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Error creating customer:", err);
    }

    setShowAddModal(false);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setArea("Bangalore");
  };

  // Search filter across all attributes
  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase().trim();

    return customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.normalized_phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.area.toLowerCase().includes(q) ||
        (c.address || "").toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.workOrders.some((wo) => wo.toLowerCase().includes(q)) ||
        c.leadReferences.some((ref) => ref.toLowerCase().includes(q))
      );
    });
  }, [customers, search]);

  // Selected customer's specific history
  const selectedCustomerLeads = useMemo(() => {
    if (!selectedCustomer) return [];
    return allLeads.filter(
      (l) => normalizePhone(l.customer_phone) === selectedCustomer.normalized_phone
    );
  }, [selectedCustomer, allLeads]);

  const selectedCustomerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    return allBookings.filter(
      (b) => normalizePhone(b.customer_phone) === selectedCustomer.normalized_phone
    );
  }, [selectedCustomer, allBookings]);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1650px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.2rem 0.55rem",
                borderRadius: "9999px",
                background: "#ede9fe",
                color: "#6b21a8",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "1px solid #ddd6fe",
              }}
            >
              <Users size={12} /> Customer 360 &amp; Complete Service Dossier
            </span>
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#0f172a",
              margin: "0.25rem 0 0",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Customers Directory &amp; Full Service History
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Exhaustive historical record of every customer enquiry (Interested, Not Interested, Call Back, Wrong Number), all workshop bookings, spare parts, technicians, and lifetime billing.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={() => loadData()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.5rem 0.85rem",
              background: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.5rem 0.95rem",
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.8125rem",
              fontWeight: 700,
            }}
          >
            <Plus size={14} /> Add Customer Profile
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "1.25rem",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              background: "#ede9fe",
              color: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
              {customers.length}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
              Total Customers in Database
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "1.25rem",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              background: "#dcfce7",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Wrench size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#166534", lineHeight: 1 }}>
              {allBookings.length}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
              Total Workshop Bookings
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "1.25rem",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              background: "#e0f2fe",
              color: "#0284c7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0284c7", lineHeight: 1 }}>
              {allLeads.length}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
              Pipeline Enquiries Handled
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "1.25rem",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "10px",
              background: "#fef3c7",
              color: "#b45309",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
              ₹{customers.reduce((acc, c) => acc + c.totalSpent, 0).toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
              Customer Lifetime Spend
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          padding: "1rem",
          border: "1px solid #e2e8f0",
          marginBottom: "1.25rem",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ position: "relative" }}>
          <Search
            size={16}
            color="#94a3b8"
            style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search by customer name, phone number, work order # (RO-...), lead ID (FUD-...), address, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.75rem 0.6rem 2.25rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "0.875rem",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div
        style={{
          background: "white",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Customer Profile</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Phone &amp; WhatsApp</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Bangalore Address</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Work Orders</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Lead History &amp; Pipeline</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Total Spend</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569", textAlign: "right" }}>
                  Every Detail of History
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    <RefreshCw className="animate-spin" size={22} style={{ margin: "0 auto 0.5rem" }} />
                    Loading complete customer directory...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    <Users size={36} color="#94a3b8" style={{ margin: "0 auto 0.5rem" }} />
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>No customer records found</div>
                    <p style={{ margin: "0.25rem 0", fontSize: "0.85rem", color: "#64748b" }}>
                      Customers are automatically recorded whenever an enquiry or booking is created.
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.normalized_phone || c.id}
                    style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.1s" }}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setActiveModalTab("all");
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    {/* Customer Profile */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.95rem" }}>{c.name}</div>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: "#6366f1",
                          fontSize: "0.72rem",
                          background: "#ede9fe",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          display: "inline-block",
                          marginTop: "2px",
                        }}
                      >
                        {c.id}
                      </span>
                      {c.email && c.email !== "—" && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>{c.email}</div>
                      )}
                    </td>

                    {/* Phone & WhatsApp */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <a
                          href={`tel:${c.phone}`}
                          style={{
                            color: "#2563eb",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          <Phone size={12} /> {c.phone}
                        </a>
                        <a
                          href={`https://wa.me/91${c.normalized_phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#166534" }}
                          title="Chat on WhatsApp"
                        >
                          <MessageCircle size={15} />
                        </a>
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "2px" }}>
                        Registered: {c.lastVisit}
                      </div>
                    </td>

                    {/* Address / Area */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.25rem", color: "#334155" }}>
                        <MapPin size={13} color="#6366f1" style={{ flexShrink: 0, marginTop: "2px" }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.8125rem", color: "#0f172a" }}>{c.area}</div>
                          {c.address && (
                            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "1px", maxWidth: "230px", lineHeight: "1.25" }}>
                              {c.address}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Work Orders */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                      {c.workOrders.length === 0 ? (
                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>No bookings yet</span>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          {c.workOrders.map((wo) => (
                            <span
                              key={wo}
                              style={{
                                fontFamily: "monospace",
                                fontWeight: 800,
                                fontSize: "0.75rem",
                                color: "#166534",
                                background: "#dcfce7",
                                border: "1px solid #bbf7d0",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                display: "inline-block",
                                width: "fit-content",
                              }}
                            >
                              {wo}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Lead History & Pipeline Badges */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {c.statusSummary.interested > 0 && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: "#ecfdf5",
                              color: "#065f46",
                              border: "1px solid #a7f3d0",
                              padding: "1px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            Interested ({c.statusSummary.interested})
                          </span>
                        )}
                        {c.statusSummary.callback_later > 0 && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: "#fffbeb",
                              color: "#92400e",
                              border: "1px solid #fde68a",
                              padding: "1px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            Call Back ({c.statusSummary.callback_later})
                          </span>
                        )}
                        {c.statusSummary.not_interested > 0 && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: "#fee2e2",
                              color: "#991b1b",
                              border: "1px solid #fecaca",
                              padding: "1px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            Not Interested ({c.statusSummary.not_interested})
                          </span>
                        )}
                        {c.statusSummary.wrong_number > 0 && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              background: "#f1f5f9",
                              color: "#475569",
                              border: "1px solid #cbd5e1",
                              padding: "1px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            Wrong No. ({c.statusSummary.wrong_number})
                          </span>
                        )}
                        {c.leadReferences.length === 0 && c.workOrders.length === 0 && (
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>New Customer</span>
                        )}
                      </div>
                    </td>

                    {/* Lifetime Spend */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                      <div style={{ fontWeight: 800, color: "#166534", fontSize: "0.95rem" }}>
                        ₹{c.totalSpent.toLocaleString("en-IN")}
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ padding: "0.85rem 1rem", verticalAlign: "top", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setSelectedCustomer(c);
                          setActiveModalTab("all");
                        }}
                        style={{
                          padding: "0.45rem 0.85rem",
                          background: "#4f46e5",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
                        }}
                      >
                        <History size={13} /> Full History Dossier &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXHAUSTIVE CUSTOMER 360 FULL HISTORY MODAL */}
      {selectedCustomer && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCustomer(null);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: 1040,
              maxHeight: "94vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.75rem",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    {selectedCustomer.name}
                  </h2>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.78rem",
                      background: "#ede9fe",
                      color: "#6366f1",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: 800,
                    }}
                  >
                    ID: {selectedCustomer.id}
                  </span>
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "4px" }}>
                  Primary Phone: <strong>{selectedCustomer.phone}</strong> &bull; Email:{" "}
                  <strong>{selectedCustomer.email}</strong> &bull; Locality:{" "}
                  <strong>{selectedCustomer.area}</strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  style={{
                    padding: "0.4rem 0.75rem",
                    background: "#eff6ff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Phone size={13} /> Call Customer
                </a>
                <a
                  href={`https://wa.me/91${selectedCustomer.normalized_phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0.4rem 0.75rem",
                    background: "#ecfdf5",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <MessageCircle size={13} /> WhatsApp
                </a>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    padding: "0.35rem",
                    fontSize: "1.35rem",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                padding: "0.75rem 1.75rem",
                background: "#f1f5f9",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <button
                onClick={() => setActiveModalTab("all")}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: activeModalTab === "all" ? "#0f172a" : "white",
                  color: activeModalTab === "all" ? "white" : "#475569",
                }}
              >
                Comprehensive Overview
              </button>
              <button
                onClick={() => setActiveModalTab("bookings")}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: activeModalTab === "bookings" ? "#166534" : "white",
                  color: activeModalTab === "bookings" ? "white" : "#166534",
                }}
              >
                Workshop Bookings ({selectedCustomerBookings.length})
              </button>
              <button
                onClick={() => setActiveModalTab("leads")}
                style={{
                  padding: "0.4rem 0.85rem",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  background: activeModalTab === "leads" ? "#4f46e5" : "white",
                  color: activeModalTab === "leads" ? "white" : "#4f46e5",
                }}
              >
                Pipeline Enquiries &amp; Callbacks ({selectedCustomerLeads.length})
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.75rem", overflowY: "auto", flex: 1 }}>
              {/* Customer Profile & Address Card */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  padding: "1.25rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      Full Customer Address
                    </div>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem", marginTop: "2px" }}>
                      {selectedCustomer.address || "No street address recorded"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      Area: {selectedCustomer.area} {selectedCustomer.pincode && `— PIN: ${selectedCustomer.pincode}`}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      Lifetime Spend
                    </div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#166534", marginTop: "2px" }}>
                      ₹{selectedCustomer.totalSpent.toLocaleString("en-IN")}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      From {selectedCustomerBookings.length} repair job orders
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      Enquiry History Breakdown
                    </div>
                    <div style={{ display: "flex", gap: "0.3rem", marginTop: "4px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.72rem", background: "#ecfdf5", color: "#065f46", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                        {selectedCustomer.statusSummary.interested} Interested
                      </span>
                      <span style={{ fontSize: "0.72rem", background: "#fffbeb", color: "#92400e", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                        {selectedCustomer.statusSummary.callback_later} Call Back
                      </span>
                      <span style={{ fontSize: "0.72rem", background: "#fee2e2", color: "#991b1b", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                        {selectedCustomer.statusSummary.not_interested} Not Interested
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: ALL WORKSHOP BOOKINGS & REPAIRS (Detailed Dossier) */}
              {(activeModalTab === "all" || activeModalTab === "bookings") && (
                <div style={{ marginBottom: "2rem" }}>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      marginBottom: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Wrench size={18} color="#166534" />
                    Workshop Repair Orders &amp; Billing History ({selectedCustomerBookings.length})
                  </div>

                  {selectedCustomerBookings.length === 0 ? (
                    <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "10px", fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
                      No workshop repair orders recorded for this customer yet.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {selectedCustomerBookings.map((b) => (
                        <div
                          key={b.id}
                          style={{
                            background: "white",
                            border: "1px solid #cbd5e1",
                            borderRadius: "12px",
                            padding: "1.25rem",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ fontFamily: "monospace", fontWeight: 900, color: "#1e1b4b", fontSize: "1.05rem" }}>
                                  {b.order_number}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "2px 8px",
                                    borderRadius: "9999px",
                                    background: b.status === "completed" ? "#dcfce7" : b.status === "rework" ? "#fee2e2" : "#fef3c7",
                                    color: b.status === "completed" ? "#166534" : b.status === "rework" ? "#991b1b" : "#92400e",
                                    fontWeight: 800,
                                  }}
                                >
                                  {b.status_display || b.status}
                                </span>
                                {b.has_invoice && (
                                  <span style={{ fontSize: "0.72rem", background: "#eff6ff", color: "#1d4ed8", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                    Invoice: {b.invoice_number}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
                                Booking Date: <strong>{b.booking_date}</strong> &bull; Linked Lead:{" "}
                                <strong>{b.linked_lead_reference || "Direct"}</strong>
                              </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#166534" }}>
                                ₹{Number(b.total_customer_charge).toLocaleString("en-IN")}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                Profit: <strong>+₹{Number(b.internal_profit || 0).toLocaleString("en-IN")}</strong>
                              </div>
                            </div>
                          </div>

                          {/* Technical & Work Detail Grid */}
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                              gap: "0.75rem",
                              background: "#f8fafc",
                              borderRadius: "8px",
                              padding: "0.85rem",
                              fontSize: "0.8125rem",
                            }}
                          >
                            <div>
                              <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                                Device Model:
                              </span>
                              <strong style={{ color: "#0f172a" }}>{b.device || b.device_model_text}</strong>
                            </div>

                            <div>
                              <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                                Reported Intake Issue:
                              </span>
                              <span style={{ color: "#334155" }}>{b.reported_issue || b.intake_condition || "—"}</span>
                            </div>

                            <div>
                              <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                                Confirmed Issue / Diagnosis:
                              </span>
                              <span style={{ color: "#334155", fontWeight: 600 }}>{b.confirmed_issue || "—"}</span>
                            </div>

                            <div>
                              <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                                Work Done by Technician:
                              </span>
                              <span style={{ color: "#166534", fontWeight: 700 }}>{b.work_performed || "Completed"}</span>
                            </div>

                            <div>
                              <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                                Spare Part Used:
                              </span>
                              <span style={{ color: "#0f172a", fontWeight: 600 }}>{b.part_name || b.parts_used_notes || "—"}</span>
                            </div>

                            <div>
                              <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                                Distributor / Vendor (CP):
                              </span>
                              <span style={{ color: "#991b1b", fontWeight: 700 }}>
                                {b.vendor_name || "Direct Stock"} (₹{Number(b.vendor_cost || 0).toLocaleString("en-IN")})
                              </span>
                            </div>

                            <div>
                              <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                                Assigned Technician:
                              </span>
                              <span style={{ color: "#4f46e5", fontWeight: 800 }}>
                                {b.assigned_technician_name || "Unassigned"}
                              </span>
                            </div>

                            {b.rework_reason && (
                              <div style={{ gridColumn: "1 / -1", background: "#fee2e2", padding: "0.4rem 0.6rem", borderRadius: "6px" }}>
                                <span style={{ color: "#991b1b", fontSize: "0.75rem", fontWeight: 800 }}>
                                  ⚠️ Rework / Return Reported Reason:
                                </span>{" "}
                                <span style={{ color: "#7f1d1d", fontSize: "0.78rem", fontWeight: 600 }}>
                                  &ldquo;{b.rework_reason}&rdquo;
                                </span>
                              </div>
                            )}

                            {b.internal_notes && (
                              <div style={{ gridColumn: "1 / -1", fontSize: "0.75rem", color: "#64748b" }}>
                                <strong>Internal Notes:</strong> {b.internal_notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: ALL PIPELINE ENQUIRIES & CALL BACKS (Every Detail!) */}
              {(activeModalTab === "all" || activeModalTab === "leads") && (
                <div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "#0f172a",
                      marginBottom: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FileText size={18} color="#4f46e5" />
                    Enquiries, Pipeline &amp; Callback History ({selectedCustomerLeads.length})
                  </div>

                  {selectedCustomerLeads.length === 0 ? (
                    <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "10px", fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
                      No enquiries or pipeline leads recorded for this customer.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {selectedCustomerLeads.map((l) => {
                        const isNotInterested = l.status === "not_interested";
                        const isCallback = l.status === "callback_later";
                        const isInterested = l.status === "interested";

                        return (
                          <div
                            key={l.id}
                            style={{
                              background: "white",
                              border: "1px solid #cbd5e1",
                              borderRadius: "12px",
                              padding: "1.25rem",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5", fontSize: "1rem" }}>
                                    {l.reference}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "0.75rem",
                                      padding: "2px 8px",
                                      borderRadius: "9999px",
                                      fontWeight: 800,
                                      background: isInterested
                                        ? "#ecfdf5"
                                        : isCallback
                                        ? "#fffbeb"
                                        : isNotInterested
                                        ? "#fee2e2"
                                        : "#f1f5f9",
                                      color: isInterested
                                        ? "#065f46"
                                        : isCallback
                                        ? "#92400e"
                                        : isNotInterested
                                        ? "#991b1b"
                                        : "#475569",
                                      border: isInterested
                                        ? "1px solid #a7f3d0"
                                        : isCallback
                                        ? "1px solid #fde68a"
                                        : isNotInterested
                                        ? "1px solid #fecaca"
                                        : "1px solid #cbd5e1",
                                    }}
                                  >
                                    {l.status_display || l.status}
                                  </span>
                                  <span style={{ fontSize: "0.72rem", background: "#ede9fe", color: "#6b21a8", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                    Channel: {l.source_display || l.source}
                                  </span>
                                </div>
                                <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
                                  Submitted On: <strong>{new Date(l.created_at).toLocaleString("en-IN")}</strong> &bull; Handled By:{" "}
                                  <strong>{l.handled_by_name || "Super Admin"}</strong>
                                </div>
                              </div>

                              {l.booking_id && (
                                <Link
                                  href={`/crm/repairs?search=${l.booking_id}`}
                                  style={{
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    color: "#166534",
                                    background: "#dcfce7",
                                    border: "1px solid #bbf7d0",
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    textDecoration: "none",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "3px",
                                  }}
                                >
                                  Converted Booking: {l.booking_id} &rarr;
                                </Link>
                              )}
                            </div>

                            {/* Enquiry Details Grid */}
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "0.75rem",
                                background: "#f8fafc",
                                borderRadius: "8px",
                                padding: "0.85rem",
                                fontSize: "0.8125rem",
                              }}
                            >
                              <div>
                                <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                                  Device:
                                </span>
                                <strong style={{ color: "#0f172a" }}>{l.device_model_text || "—"}</strong>
                              </div>

                              <div>
                                <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                                  Customer Reported Problem:
                                </span>
                                <span style={{ color: "#334155" }}>{l.reported_problem}</span>
                              </div>

                              <div>
                                <span style={{ color: "#64748b", display: "block", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                                  Pickup / Doorstep Location:
                                </span>
                                <span style={{ color: "#334155" }}>
                                  {l.pickup_area || "Bangalore"} {l.pickup_pincode && `(${l.pickup_pincode})`}
                                </span>
                              </div>

                              {/* NOT INTERESTED DETAILS */}
                              {isNotInterested && (
                                <div style={{ gridColumn: "1 / -1", background: "#fee2e2", padding: "0.5rem 0.75rem", borderRadius: "6px" }}>
                                  <span style={{ color: "#991b1b", fontSize: "0.75rem", fontWeight: 800 }}>
                                    ❌ Rejection Reason Recorded:
                                  </span>{" "}
                                  <strong style={{ color: "#7f1d1d" }}>
                                    &ldquo;{l.rejection_reason || "Price too high / Not interested"}&rdquo;
                                  </strong>
                                  {l.rejection_notes && (
                                    <div style={{ color: "#991b1b", fontSize: "0.75rem", marginTop: "2px" }}>
                                      Notes: {l.rejection_notes}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* CALL BACK LATER DETAILS */}
                              {isCallback && (
                                <div style={{ gridColumn: "1 / -1", background: "#fffbeb", padding: "0.5rem 0.75rem", borderRadius: "6px", border: "1px solid #fde68a" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                      <span style={{ color: "#92400e", fontSize: "0.75rem", fontWeight: 800 }}>
                                        📞 Scheduled Follow-up Callback:
                                      </span>{" "}
                                      <strong style={{ color: "#78350f" }}>
                                        📅 {l.callback_date || "Today"} {l.callback_time && `at ⏰ ${l.callback_time}`}
                                      </strong>
                                    </div>
                                  </div>
                                  {l.callback_notes && (
                                    <div style={{ color: "#78350f", fontSize: "0.78rem", marginTop: "3px", fontStyle: "italic" }}>
                                      &ldquo;{l.callback_notes}&rdquo;
                                    </div>
                                  )}

                                  {/* Reschedule history log if any */}
                                  {l.callback_schedules && l.callback_schedules.length > 0 && (
                                    <div style={{ marginTop: "0.5rem", borderTop: "1px dashed #fde68a", paddingTop: "0.4rem" }}>
                                      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#92400e", textTransform: "uppercase" }}>
                                        Callback Attempts &amp; Reschedule Log ({l.callback_schedules.length}):
                                      </div>
                                      <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", marginTop: "0.2rem" }}>
                                        {l.callback_schedules.map((cs) => (
                                          <div key={cs.id} style={{ fontSize: "0.72rem", color: "#78350f" }}>
                                            &bull; {cs.scheduled_date} at {cs.scheduled_time} — Status:{" "}
                                            <strong>{cs.status_display || cs.status}</strong>{" "}
                                            {cs.notes && `(${cs.notes})`}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {l.internal_notes && (
                                <div style={{ gridColumn: "1 / -1", fontSize: "0.75rem", color: "#64748b" }}>
                                  <strong>Enquiry Notes:</strong> {l.internal_notes}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "1rem 1.75rem",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
              }}
            >
              <div style={{ fontSize: "0.8125rem", color: "#64748b" }}>
                Viewing dossier for customer: <strong>{selectedCustomer.name}</strong> ({selectedCustomer.phone})
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                style={{
                  padding: "0.5rem 1.5rem",
                  background: "#0f172a",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                }}
              >
                Close Customer Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div style={{ background: "white", borderRadius: "12px", padding: "1.75rem", width: "100%", maxWidth: 460 }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
              Add Customer Profile
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.8125rem", marginBottom: "1.25rem" }}>
              Creates a customer record in the database for future service tracking.
            </p>
            <form onSubmit={handleAddCustomer}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Full Bangalore Address
                </label>
                <textarea
                  placeholder="Flat #, Building, Street, Landmark"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Area / Locality
                </label>
                <input
                  type="text"
                  placeholder="e.g. Indiranagar, Koramangala"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
