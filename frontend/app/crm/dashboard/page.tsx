"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Wrench,
  PhoneCall,
  XCircle,
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Smartphone,
  Phone,
  Calendar,
  Activity,
  Plus,
} from "lucide-react";

interface DashboardStats {
  enquiries: {
    total: number;
    new_today: number;
    new_pending: number;
    interested: number;
  };
  callbacks: {
    due_today: number;
    overdue: number;
    upcoming: number;
    total: number;
  };
  rejected: {
    not_interested: number;
    wrong_number: number;
    total: number;
  };
  bookings: {
    active: number;
    completed: number;
    rework: number;
    total: number;
  };
  invoices: {
    count: number;
    total_revenue: number;
    pending_revenue: number;
  };
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [dueCallbacks, setDueCallbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, leadsRes, repairsRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/leads/stats/`),
        fetch(`${apiUrl}/api/v1/leads/?status=new`),
        fetch(`${apiUrl}/api/v1/repairs/?status=in_progress`),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setRecentLeads(Array.isArray(leadsData) ? leadsData.slice(0, 5) : (leadsData.results || []).slice(0, 5));
      }
      if (repairsRes.ok) {
        const repairsData = await repairsRes.json();
        setActiveBookings(Array.isArray(repairsData) ? repairsData.slice(0, 5) : (repairsData.results || []).slice(0, 5));
      }

      // Fetch due callbacks
      const cbRes = await fetch(`${apiUrl}/api/v1/leads/?status=callback_later`);
      if (cbRes.ok) {
        const cbData = await cbRes.json();
        setDueCallbacks(Array.isArray(cbData) ? cbData.slice(0, 5) : (cbData.results || []).slice(0, 5));
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            FixUrDevice Operations Dashboard
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Real-time pipeline overview driven directly by the database: Enquiries, Bookings, Callbacks, and Revenue.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => loadDashboardData()}
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 0.85rem",
              background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px",
              cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, color: "#334155"
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Real Data
          </button>
          <Link
            href="/crm/leads"
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 1rem",
              background: "#4f46e5", color: "white", textDecoration: "none", borderRadius: "6px",
              fontSize: "0.8125rem", fontWeight: 700
            }}
          >
            Open Enquiries Pipeline →
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
        {/* Card 1: Enquiries */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Enquiries</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
                {stats?.enquiries.total ?? 0}
              </div>
            </div>
            <div style={{ background: "#ede9fe", color: "#5b21b6", padding: "0.5rem", borderRadius: "8px" }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", fontSize: "0.75rem" }}>
            <span style={{ color: "#5b21b6", fontWeight: 700 }}>{stats?.enquiries.new_today ?? 0} New Today</span>
            <Link href="/crm/leads" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>Review Leads →</Link>
          </div>
        </div>

        {/* Card 2: Active Bookings */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Active Bookings</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
                {stats?.bookings.active ?? 0}
              </div>
            </div>
            <div style={{ background: "#e0f2fe", color: "#0369a1", padding: "0.5rem", borderRadius: "8px" }}>
              <Wrench size={20} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", fontSize: "0.75rem" }}>
            <span style={{ color: "#0369a1", fontWeight: 700 }}>{stats?.bookings.completed ?? 0} Completed</span>
            <Link href="/crm/repairs" style={{ color: "#0284c7", textDecoration: "none", fontWeight: 600 }}>View Workshop →</Link>
          </div>
        </div>

        {/* Card 3: Callbacks */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Pending Callbacks</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>
                {stats?.callbacks.total ?? 0}
              </div>
            </div>
            <div style={{ background: "#fef3c7", color: "#92400e", padding: "0.5rem", borderRadius: "8px" }}>
              <PhoneCall size={20} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", fontSize: "0.75rem" }}>
            <span style={{ color: (stats?.callbacks.overdue ?? 0) > 0 ? "#b91c1c" : "#92400e", fontWeight: 700 }}>
              {stats?.callbacks.due_today ?? 0} Due Today / {stats?.callbacks.overdue ?? 0} Overdue
            </span>
            <Link href="/crm/callbacks" style={{ color: "#d97706", textDecoration: "none", fontWeight: 600 }}>Follow Up →</Link>
          </div>
        </div>

        {/* Card 4: Invoices & Revenue */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Total Paid Revenue</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#166534", marginTop: "0.25rem" }}>
                ₹{(stats?.invoices.total_revenue ?? 0).toLocaleString()}
              </div>
            </div>
            <div style={{ background: "#dcfce7", color: "#166534", padding: "0.5rem", borderRadius: "8px" }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", fontSize: "0.75rem" }}>
            <span style={{ color: "#64748b" }}>{stats?.invoices.count ?? 0} Invoices Generated</span>
            <Link href="/crm/invoices" style={{ color: "#166534", textDecoration: "none", fontWeight: 600 }}>View Invoices →</Link>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Enquiries & Active Workshop Bookings */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "1.25rem", marginBottom: "1.75rem" }}>
        {/* Recent Enquiries Awaiting Review */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Users size={18} color="#4f46e5" /> New Enquiries Awaiting 4-Action Review
            </h2>
            <Link href="/crm/leads" style={{ fontSize: "0.8125rem", color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>
              View All →
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
              No new unreviewed enquiries right now.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {recentLeads.map((l) => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>{l.customer_name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {l.reference} • {l.device_model_text || "Device"} • {l.reported_problem}
                    </div>
                  </div>
                  <Link
                    href="/crm/leads"
                    style={{
                      fontSize: "0.75rem", fontWeight: 700, padding: "0.35rem 0.65rem",
                      background: "#ede9fe", color: "#5b21b6", borderRadius: "6px", textDecoration: "none"
                    }}
                  >
                    Action →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Workshop Bookings */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Wrench size={18} color="#0284c7" /> Active Workshop Repairs (In Progress)
            </h2>
            <Link href="/crm/repairs" style={{ fontSize: "0.8125rem", color: "#0284c7", fontWeight: 600, textDecoration: "none" }}>
              View All →
            </Link>
          </div>

          {activeBookings.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
              No repairs currently in progress.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {activeBookings.map((b) => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.875rem" }}>{b.customer_name} ({b.order_number})</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {b.device_model_text} • Tech: {b.assigned_technician_name} • ₹{b.total_customer_charge}
                    </div>
                  </div>
                  <Link
                    href="/crm/repairs"
                    style={{
                      fontSize: "0.75rem", fontWeight: 700, padding: "0.35rem 0.65rem",
                      background: "#e0f2fe", color: "#0369a1", borderRadius: "6px", textDecoration: "none"
                    }}
                  >
                    Manage →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Due Callbacks List */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PhoneCall size={18} color="#d97706" /> Scheduled Callbacks Requiring Attention
          </h2>
          <Link href="/crm/callbacks" style={{ fontSize: "0.8125rem", color: "#d97706", fontWeight: 600, textDecoration: "none" }}>
            View Follow-Up Desk →
          </Link>
        </div>

        {dueCallbacks.length === 0 ? (
          <div style={{ padding: "1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
            No pending callbacks scheduled right now.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
            {dueCallbacks.map((cb) => (
              <div key={cb.id} style={{ padding: "0.85rem", background: "#fefce8", border: "1px solid #fef08a", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: "0.875rem", color: "#713f12" }}>{cb.customer_name}</strong>
                  <span style={{ fontSize: "0.75rem", color: "#854d0e", fontWeight: 700 }}>⏰ {cb.callback_date}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#a16207", marginTop: "2px" }}>
                  {cb.customer_phone} • {cb.device_model_text}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#713f12", marginTop: "4px" }}>
                  {cb.callback_notes || "Customer requested callback"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
