"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  CreditCard,
  Wrench,
  Smartphone,
  BarChart3,
  RefreshCw,
  Search,
  RotateCcw,
  AlertTriangle,
  User,
  Phone,
  FileSpreadsheet,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  ArrowDownRight,
  Building2
} from "lucide-react";

interface RepairBooking {
  id: string;
  order_number: string;
  booking_id: string;
  booking_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  device: string;
  device_model_text?: string;
  reported_issue: string;
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
  rework_reason?: string;
  has_invoice?: boolean;
  invoice_number?: string;
  created_at: string;
}

interface InvoiceRecord {
  id: string;
  invoice_number: string;
  repair_order_number?: string;
  lead_reference?: string;
  customer_name: string;
  customer_phone: string;
  device: string;
  service?: string;
  technician?: string;
  total: number;
  status: string;
  issued_at: string;
}

interface LeadRecord {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  device_model_text: string;
  reported_problem: string;
  source: string;
  source_display?: string;
  status: string;
  status_display?: string;
  handled_by_name?: string;
  booking_id?: string;
  created_at: string;
}

interface TechnicianStats {
  name: string;
  totalJobs: number;
  completedJobs: number;
  ongoingJobs: number;
  reworkJobs: number;
  reworkRate: number;
  revenue: number;
  profit: number;
}

export default function ReportsAndAnalyticsPage() {
  const [repairs, setRepairs] = useState<RepairBooking[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Date Filtering Controls
  // Presets: "today" | "yesterday" | "last7days" | "month" | "all" | "custom"
  const [datePreset, setDatePreset] = useState<"today" | "yesterday" | "last7days" | "month" | "all" | "custom">("all");
  const [singleDate, setSingleDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Active view tab in the detailed ledger
  const [activeLedgerTab, setActiveLedgerTab] = useState<"profit" | "completed" | "reworks" | "invoices" | "leads">("profit");

  // Export Modal / Dropdown state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<"master" | "repairs" | "invoices" | "reworks" | "leads">("master");
  const [exportScope, setExportScope] = useState<"current_filter" | "today" | "all">("current_filter");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Fetch live data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [repairsRes, invoicesRes, leadsRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/repairs/`),
        fetch(`${apiUrl}/api/v1/payments/invoices/`),
        fetch(`${apiUrl}/api/v1/leads/`),
      ]);

      let repairsData: RepairBooking[] = [];
      let invoicesData: InvoiceRecord[] = [];
      let leadsData: LeadRecord[] = [];

      if (repairsRes.ok) {
        const json = await repairsRes.json();
        repairsData = json.results || json || [];
      }
      if (invoicesRes.ok) {
        const json = await invoicesRes.json();
        invoicesData = (json.results || json || []).map((inv: any) => ({
          ...inv,
          total: parseFloat(inv.total || inv.total_amount || inv.final_billed_amount || 0),
        }));
      }
      if (leadsRes.ok) {
        const json = await leadsRes.json();
        leadsData = json.results || json || [];
      }

      setRepairs(repairsData);
      setInvoices(invoicesData);
      setLeads(leadsData);
    } catch (e) {
      console.error("Failed to fetch reports data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Robust local calendar date extractor (avoids UTC timezone shifts)
  const extractDateOnly = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";
    const str = String(dateStr).trim();
    // Matches YYYY-MM-DD at the start of standard ISO/backend dates
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    try {
      const d = new Date(str);
      if (isNaN(d.getTime())) return "";
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    } catch {
      return "";
    }
  };

  const getLocalDateString = (offsetDays: number = 0): string => {
    const d = new Date();
    if (offsetDays !== 0) {
      d.setDate(d.getDate() + offsetDays);
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Determine today, yesterday, and 7 days ago in exact local calendar dates
  const todayISO = useMemo(() => getLocalDateString(0), []);
  const yesterdayISO = useMemo(() => getLocalDateString(-1), []);
  const sevenDaysAgoISO = useMemo(() => getLocalDateString(-7), []);
  const currentMonthPrefix = useMemo(() => todayISO.slice(0, 7), [todayISO]);

  // Backward-compatible alias for table rendering and exports
  const toISODate = extractDateOnly;

  // Filter function by active date filter
  const isDateInRange = (dateStr: string) => {
    if (!dateStr) return true;
    const itemDate = extractDateOnly(dateStr);
    if (!itemDate) return true;

    if (singleDate) {
      return itemDate === singleDate;
    }

    if (datePreset === "today") {
      return itemDate === todayISO;
    }
    if (datePreset === "yesterday") {
      return itemDate === yesterdayISO;
    }
    if (datePreset === "last7days") {
      return itemDate >= sevenDaysAgoISO && itemDate <= todayISO;
    }
    if (datePreset === "month") {
      return itemDate.startsWith(currentMonthPrefix);
    }
    if (datePreset === "custom") {
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      }
      if (startDate) {
        return itemDate >= startDate;
      }
      if (endDate) {
        return itemDate <= endDate;
      }
    }
    return true; // "all"
  };

  // Filtered Datasets based on Date Filter
  const filteredRepairs = useMemo(() => {
    return repairs.filter((r) => {
      const matchDate = isDateInRange(r.booking_date || r.created_at);
      if (!matchDate) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        r.order_number?.toLowerCase().includes(q) ||
        r.customer_name?.toLowerCase().includes(q) ||
        r.customer_phone?.toLowerCase().includes(q) ||
        r.device?.toLowerCase().includes(q) ||
        r.reported_issue?.toLowerCase().includes(q) ||
        r.assigned_technician_name?.toLowerCase().includes(q) ||
        r.vendor_name?.toLowerCase().includes(q) ||
        r.part_name?.toLowerCase().includes(q) ||
        r.rework_reason?.toLowerCase().includes(q)
      );
    });
  }, [repairs, datePreset, singleDate, startDate, endDate, search, todayISO, yesterdayISO, sevenDaysAgoISO, currentMonthPrefix]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchDate = isDateInRange(inv.issued_at);
      if (!matchDate) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        inv.invoice_number?.toLowerCase().includes(q) ||
        inv.customer_name?.toLowerCase().includes(q) ||
        inv.customer_phone?.toLowerCase().includes(q) ||
        inv.repair_order_number?.toLowerCase().includes(q) ||
        inv.device?.toLowerCase().includes(q)
      );
    });
  }, [invoices, datePreset, singleDate, startDate, endDate, search, todayISO, yesterdayISO, sevenDaysAgoISO, currentMonthPrefix]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchDate = isDateInRange(l.created_at);
      if (!matchDate) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        l.reference?.toLowerCase().includes(q) ||
        l.customer_name?.toLowerCase().includes(q) ||
        l.customer_phone?.toLowerCase().includes(q) ||
        l.reported_problem?.toLowerCase().includes(q) ||
        l.device_model_text?.toLowerCase().includes(q) ||
        l.source?.toLowerCase().includes(q)
      );
    });
  }, [leads, datePreset, singleDate, startDate, endDate, search, todayISO, yesterdayISO, sevenDaysAgoISO, currentMonthPrefix]);

  // Aggregate Key Performance Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalPartCost = 0;
    let totalProfit = 0;
    let completedCount = 0;
    let reworkCount = 0;
    let ongoingCount = 0;

    filteredRepairs.forEach((r) => {
      const rev = Number(r.total_customer_charge || 0);
      const cost = Number(r.vendor_cost || 0);
      const p = Number(r.internal_profit || Math.max(0, rev - cost));

      totalRevenue += rev;
      totalPartCost += cost;
      totalProfit += p;

      const st = (r.status || "").toLowerCase();
      if (st === "completed" || st === "repair_completed") {
        completedCount++;
      } else if (st === "rework" || st === "rework_required" || r.rework_reason) {
        reworkCount++;
      } else {
        ongoingCount++;
      }
    });

    const totalJobs = filteredRepairs.length;
    const reworkRate = totalJobs > 0 ? ((reworkCount / totalJobs) * 100).toFixed(1) : "0.0";
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";
    const conversionRate = filteredLeads.length > 0 ? (((filteredRepairs.length) / filteredLeads.length) * 100).toFixed(1) : "0.0";

    return {
      totalRevenue,
      totalPartCost,
      totalProfit,
      totalJobs,
      completedCount,
      reworkCount,
      ongoingCount,
      reworkRate,
      profitMargin,
      totalLeads: filteredLeads.length,
      conversionRate,
    };
  }, [filteredRepairs, filteredLeads]);

  // Technician Productivity & Quality Matrix
  const technicianStats = useMemo(() => {
    const statsMap: Record<string, TechnicianStats> = {};

    filteredRepairs.forEach((r) => {
      const tech = r.assigned_technician_name || "Unassigned";
      if (!statsMap[tech]) {
        statsMap[tech] = {
          name: tech,
          totalJobs: 0,
          completedJobs: 0,
          ongoingJobs: 0,
          reworkJobs: 0,
          reworkRate: 0,
          revenue: 0,
          profit: 0,
        };
      }

      statsMap[tech].totalJobs++;
      const rev = Number(r.total_customer_charge || 0);
      const profit = Number(r.internal_profit || 0);
      statsMap[tech].revenue += rev;
      statsMap[tech].profit += profit;

      const st = (r.status || "").toLowerCase();
      if (st === "completed" || st === "repair_completed") {
        statsMap[tech].completedJobs++;
      } else if (st === "rework" || st === "rework_required" || r.rework_reason) {
        statsMap[tech].reworkJobs++;
      } else {
        statsMap[tech].ongoingJobs++;
      }
    });

    return Object.values(statsMap).map((t) => ({
      ...t,
      reworkRate: t.totalJobs > 0 ? Math.round((t.reworkJobs / t.totalJobs) * 100) : 0,
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredRepairs]);

  // Returns / Reworks Breakdown Cases
  const reworkCases = useMemo(() => {
    return filteredRepairs.filter(
      (r) => (r.status || "").toLowerCase().includes("rework") || !!r.rework_reason
    );
  }, [filteredRepairs]);

  // Excel / CSV Export Generator Function (UTF-8 BOM with proper escaping)
  const downloadExcelReport = (
    reportCategory: "master" | "repairs" | "invoices" | "reworks" | "leads",
    scope: "current_filter" | "today" | "all"
  ) => {
    let datasetRepairs = repairs;
    let datasetInvoices = invoices;
    let datasetLeads = leads;

    if (scope === "today") {
      datasetRepairs = repairs.filter((r) => toISODate(r.booking_date || r.created_at) === todayISO);
      datasetInvoices = invoices.filter((i) => toISODate(i.issued_at) === todayISO);
      datasetLeads = leads.filter((l) => toISODate(l.created_at) === todayISO);
    } else if (scope === "current_filter") {
      datasetRepairs = filteredRepairs;
      datasetInvoices = filteredInvoices;
      datasetLeads = filteredLeads;
    }

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    let csvContent = "";
    const dateLabel = scope === "today" ? `Daily_${todayISO}` : singleDate ? `Date_${singleDate}` : `${datePreset}_${todayISO}`;
    let filename = `FixUrDevice_${reportCategory}_Report_${dateLabel}.csv`;

    if (reportCategory === "repairs") {
      const headers = [
        "Order Number",
        "Booking Date",
        "Customer Name",
        "Customer Phone",
        "Customer Email",
        "Device",
        "Reported Issue",
        "Confirmed Issue",
        "Work Performed",
        "Parts / Spares Used",
        "Assigned Technician",
        "Status",
        "Vendor Name",
        "Vendor Cost (CP ₹)",
        "Customer Total (SP ₹)",
        "Net Profit (₹)",
        "Invoice Number",
        "Rework Reason",
        "Created At"
      ];
      const rows = datasetRepairs.map((r) => [
        escapeCsv(r.order_number),
        escapeCsv(toISODate(r.booking_date || r.created_at)),
        escapeCsv(r.customer_name),
        escapeCsv(r.customer_phone),
        escapeCsv(r.customer_email || ""),
        escapeCsv(r.device || r.device_model_text || ""),
        escapeCsv(r.reported_issue || ""),
        escapeCsv(r.confirmed_issue || ""),
        escapeCsv(r.work_performed || ""),
        escapeCsv(r.parts_used_notes || r.part_name || ""),
        escapeCsv(r.assigned_technician_name || "Unassigned"),
        escapeCsv(r.status_display || r.status),
        escapeCsv(r.vendor_name || ""),
        r.vendor_cost || 0,
        r.total_customer_charge || 0,
        r.internal_profit || 0,
        escapeCsv(r.invoice_number || ""),
        escapeCsv(r.rework_reason || ""),
        escapeCsv(r.created_at || "")
      ].join(","));
      csvContent = [headers.join(","), ...rows].join("\r\n");
    } else if (reportCategory === "invoices") {
      const headers = [
        "Invoice Number",
        "Issued Date",
        "Booking Order Number",
        "Lead Reference",
        "Customer Name",
        "Customer Phone",
        "Device",
        "Service Description",
        "Working Technician",
        "Total Billed (₹)",
        "Status"
      ];
      const rows = datasetInvoices.map((inv) => [
        escapeCsv(inv.invoice_number),
        escapeCsv(toISODate(inv.issued_at)),
        escapeCsv(inv.repair_order_number || ""),
        escapeCsv(inv.lead_reference || ""),
        escapeCsv(inv.customer_name),
        escapeCsv(inv.customer_phone),
        escapeCsv(inv.device || ""),
        escapeCsv(inv.service || ""),
        escapeCsv(inv.technician || ""),
        inv.total || 0,
        escapeCsv(inv.status)
      ].join(","));
      csvContent = [headers.join(","), ...rows].join("\r\n");
    } else if (reportCategory === "reworks") {
      const headers = [
        "Order Number",
        "Reported Date",
        "Customer Name",
        "Customer Phone",
        "Device",
        "Assigned Technician",
        "Rework Reason / Return Diagnosis",
        "Parts Used",
        "Total Customer Charge (₹)",
        "Current Status"
      ];
      const reworksOnly = datasetRepairs.filter(
        (r) => (r.status || "").toLowerCase().includes("rework") || !!r.rework_reason
      );
      const rows = reworksOnly.map((r) => [
        escapeCsv(r.order_number),
        escapeCsv(toISODate(r.booking_date || r.created_at)),
        escapeCsv(r.customer_name),
        escapeCsv(r.customer_phone),
        escapeCsv(r.device || r.device_model_text || ""),
        escapeCsv(r.assigned_technician_name || "Unassigned"),
        escapeCsv(r.rework_reason || "Warranty / Repeat Return"),
        escapeCsv(r.parts_used_notes || r.part_name || ""),
        r.total_customer_charge || 0,
        escapeCsv(r.status_display || r.status)
      ].join(","));
      csvContent = [headers.join(","), ...rows].join("\r\n");
    } else if (reportCategory === "leads") {
      const headers = [
        "Lead Reference",
        "Created Date",
        "Customer Name",
        "Customer Phone",
        "Source (Channel)",
        "Device Model",
        "Reported Problem",
        "Status",
        "Handled By",
        "Booking Order Number"
      ];
      const rows = datasetLeads.map((l) => [
        escapeCsv(l.reference),
        escapeCsv(toISODate(l.created_at)),
        escapeCsv(l.customer_name),
        escapeCsv(l.customer_phone),
        escapeCsv(l.source_display || l.source),
        escapeCsv(l.device_model_text || ""),
        escapeCsv(l.reported_problem || ""),
        escapeCsv(l.status_display || l.status),
        escapeCsv(l.handled_by_name || "Super Admin"),
        escapeCsv(l.booking_id || "")
      ].join(","));
      csvContent = [headers.join(","), ...rows].join("\r\n");
    } else {
      // Master Business Comprehensive Report
      const summaryRows = [
        ["FixUrDevice Master Business & Financial Analytics Report"],
        [`Generated On: ${new Date().toLocaleString("en-IN")}`],
        [`Report Scope: ${scope === "today" ? "Daily (Today)" : singleDate ? `Date: ${singleDate}` : datePreset}`],
        [""],
        ["--- BUSINESS KPI SUMMARY ---"],
        ["Metric", "Value"],
        ["Total Billed Revenue", `₹${metrics.totalRevenue.toLocaleString("en-IN")}`],
        ["Total Spare Parts Cost (Vendor Expense)", `₹${metrics.totalPartCost.toLocaleString("en-IN")}`],
        ["Net Gross Profit", `₹${metrics.totalProfit.toLocaleString("en-IN")}`],
        ["Gross Profit Margin", `${metrics.profitMargin}%`],
        ["Total Repair Bookings", metrics.totalJobs],
        ["Completed Jobs", metrics.completedCount],
        ["Active / Ongoing Jobs", metrics.ongoingCount],
        ["Returns & Reworks Count", metrics.reworkCount],
        ["Return / Rework Rate", `${metrics.reworkRate}%`],
        ["Total Leads / Enquiries", metrics.totalLeads],
        ["Lead to Booking Conversion Rate", `${metrics.conversionRate}%`],
        [""],
        ["--- WORKSHOP REPAIRS & FINANCIAL LEDGER ---"],
        [
          "Order Number",
          "Booking Date",
          "Customer Name",
          "Customer Phone",
          "Device",
          "Issue",
          "Technician",
          "Status",
          "Vendor Name",
          "Vendor Cost (CP ₹)",
          "Customer Charge (SP ₹)",
          "Net Profit (₹)",
          "Invoice #",
          "Rework Reason"
        ].join(",")
      ];

      const repairRows = datasetRepairs.map((r) => [
        escapeCsv(r.order_number),
        escapeCsv(toISODate(r.booking_date || r.created_at)),
        escapeCsv(r.customer_name),
        escapeCsv(r.customer_phone),
        escapeCsv(r.device || r.device_model_text || ""),
        escapeCsv(r.reported_issue || ""),
        escapeCsv(r.assigned_technician_name || "Unassigned"),
        escapeCsv(r.status_display || r.status),
        escapeCsv(r.vendor_name || ""),
        r.vendor_cost || 0,
        r.total_customer_charge || 0,
        r.internal_profit || 0,
        escapeCsv(r.invoice_number || ""),
        escapeCsv(r.rework_reason || "")
      ].join(","));

      csvContent = [...summaryRows.map((r) => Array.isArray(r) ? r.join(",") : r), ...repairRows].join("\r\n");
    }

    // Add UTF-8 Byte Order Mark (BOM) so Excel automatically reads UTF-8 and special characters
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Top Header */}
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
                background: "#f0fdf4",
                color: "#166534",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "1px solid #bbf7d0",
              }}
            >
              <BarChart3 size={12} /> Live Reporting &amp; Excel Export
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.75rem",
              color: "var(--brand-navy)",
              marginTop: "0.25rem",
            }}
          >
            Reports &amp; Analytics Dashboard
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginTop: "0.15rem" }}>
            Comprehensive performance analytics, returns &amp; rework monitoring, and custom date Excel reports.
          </p>
        </div>

        {/* Action Buttons: Quick Daily Export & Custom Range Export */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => downloadExcelReport("master", "today")}
            className="btn btn-sm"
            style={{
              background: "#059669",
              color: "white",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              boxShadow: "0 2px 8px rgba(5, 150, 105, 0.25)",
              border: "none",
            }}
            title="Export Today's Entire Business Report directly to Excel"
          >
            <Download size={14} /> Download Daily Report (Today)
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="btn btn-sm btn-primary"
            style={{
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <FileSpreadsheet size={15} /> Export to Excel Options...
          </button>

          <button
            onClick={fetchData}
            className="btn btn-sm btn-ghost"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            title="Refresh Data"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* FILTER CONTROL BAR: Quick Presets + Single Date + Custom Date Range */}
      <div
        style={{
          background: "white",
          borderRadius: "var(--border-radius-xl)",
          padding: "1rem 1.25rem",
          border: "1px solid var(--border-color)",
          marginBottom: "1.5rem",
          boxShadow: "var(--shadow-sm)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* Date Filter Presets */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--gray-600)", marginRight: "0.25rem" }}>
            <Calendar size={14} style={{ display: "inline", marginRight: "0.25rem" }} />
            Filter Period:
          </span>

          <button
            onClick={() => {
              setDatePreset("all");
              setSingleDate("");
              setStartDate("");
              setEndDate("");
            }}
            className={`btn btn-xs ${datePreset === "all" && !singleDate ? "btn-primary" : "btn-ghost"}`}
            style={{ borderRadius: "9999px" }}
          >
            All Time
          </button>

          <button
            onClick={() => {
              setDatePreset("today");
              setSingleDate("");
              setStartDate("");
              setEndDate("");
            }}
            className={`btn btn-xs ${datePreset === "today" ? "btn-primary" : "btn-ghost"}`}
            style={{ borderRadius: "9999px" }}
          >
            Today ({todayISO})
          </button>

          <button
            onClick={() => {
              setDatePreset("yesterday");
              setSingleDate("");
              setStartDate("");
              setEndDate("");
            }}
            className={`btn btn-xs ${datePreset === "yesterday" ? "btn-primary" : "btn-ghost"}`}
            style={{ borderRadius: "9999px" }}
          >
            Yesterday
          </button>

          <button
            onClick={() => {
              setDatePreset("last7days");
              setSingleDate("");
              setStartDate("");
              setEndDate("");
            }}
            className={`btn btn-xs ${datePreset === "last7days" ? "btn-primary" : "btn-ghost"}`}
            style={{ borderRadius: "9999px" }}
          >
            Last 7 Days
          </button>

          <button
            onClick={() => {
              setDatePreset("month");
              setSingleDate("");
              setStartDate("");
              setEndDate("");
            }}
            className={`btn btn-xs ${datePreset === "month" ? "btn-primary" : "btn-ghost"}`}
            style={{ borderRadius: "9999px" }}
          >
            This Month
          </button>

          {/* Specific Single Date Picker */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", marginLeft: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--gray-500)", fontWeight: 600 }}>Specific Date:</span>
            <input
              type="date"
              className="form-input"
              style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem", width: 130 }}
              value={singleDate}
              onChange={(e) => {
                setSingleDate(e.target.value);
                if (e.target.value) {
                  setDatePreset("custom");
                  setStartDate("");
                  setEndDate("");
                }
              }}
            />
            {singleDate && (
              <button
                onClick={() => setSingleDate("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)", fontSize: "0.8rem" }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Custom Range Picker & Global Search */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Custom From / To */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--gray-500)", fontWeight: 600 }}>From:</span>
            <input
              type="date"
              className="form-input"
              style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem", width: 125 }}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDatePreset("custom");
                setSingleDate("");
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--gray-500)", fontWeight: 600 }}>To:</span>
            <input
              type="date"
              className="form-input"
              style={{ padding: "0.2rem 0.5rem", fontSize: "0.75rem", width: 125 }}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDatePreset("custom");
                setSingleDate("");
              }}
            />
          </div>

          {/* Search Input */}
          <div style={{ position: "relative", minWidth: 220 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "0.65rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--gray-400)",
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "2rem", paddingRight: "1rem", fontSize: "0.8125rem", height: 32 }}
              placeholder="Search in analytics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Active Filter Notice */}
      {(singleDate || startDate || endDate || datePreset !== "all" || search) && (
        <div
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            padding: "0.6rem 1rem",
            marginBottom: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.8125rem",
            color: "#1e40af",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter size={14} />
            <span>
              Showing Analytics for:{" "}
              <strong>
                {singleDate
                  ? `Specific Day: ${singleDate}`
                  : startDate && endDate
                  ? `Range: ${startDate} to ${endDate}`
                  : startDate
                  ? `From: ${startDate}`
                  : endDate
                  ? `Up to: ${endDate}`
                  : datePreset === "today"
                  ? "Today"
                  : datePreset === "yesterday"
                  ? "Yesterday"
                  : datePreset === "last7days"
                  ? "Last 7 Days"
                  : datePreset === "month"
                  ? "This Month"
                  : "All Time"}
              </strong>
              {search && <span> (Matching: &quot;{search}&quot;)</span>}
            </span>
          </div>

          <button
            onClick={() => {
              setDatePreset("all");
              setSingleDate("");
              setStartDate("");
              setEndDate("");
              setSearch("");
            }}
            style={{
              background: "white",
              border: "1px solid #93c5fd",
              padding: "0.2rem 0.6rem",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.75rem",
              color: "#1d4ed8",
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* TOP EXECUTIVE KPI METRICS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "1.25rem",
          marginBottom: "1.75rem",
        }}
      >
        {/* Total Billed Revenue */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderRadius: "var(--border-radius-xl)",
            padding: "1.25rem 1.5rem",
            color: "white",
            boxShadow: "0 10px 20px rgba(15, 23, 42, 0.15)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.8 }}>
              Total Revenue Billed
            </span>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "6px", padding: "0.25rem 0.4rem" }}>
              <DollarSign size={14} />
            </div>
          </div>
          <div style={{ fontSize: "1.875rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
            ₹{metrics.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.75, marginTop: "0.35rem" }}>
            From {metrics.totalJobs} service bookings
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div
          style={{
            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            borderRadius: "var(--border-radius-xl)",
            padding: "1.25rem 1.5rem",
            color: "white",
            boxShadow: "0 10px 20px rgba(16, 185, 129, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", opacity: 0.85 }}>
              Net Gross Profit
            </span>
            <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: "9999px", padding: "0.2rem 0.5rem", fontSize: "0.75rem", fontWeight: 800 }}>
              {metrics.profitMargin}% Margin
            </span>
          </div>
          <div style={{ fontSize: "1.875rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
            ₹{metrics.totalProfit.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: "0.35rem" }}>
            Parts Cost: ₹{metrics.totalPartCost.toLocaleString("en-IN")}
          </div>
        </div>

        {/* Total Bookings & Completed */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--border-radius-xl)",
            padding: "1.25rem 1.5rem",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gray-500)" }}>
              Workshop Jobs
            </span>
            <span style={{ background: "#dcfce7", color: "#166534", borderRadius: "9999px", padding: "0.2rem 0.5rem", fontSize: "0.75rem", fontWeight: 800 }}>
              {metrics.completedCount} Done
            </span>
          </div>
          <div style={{ fontSize: "1.875rem", fontWeight: 900, color: "var(--brand-navy)" }}>
            {metrics.totalJobs}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginTop: "0.35rem" }}>
            Ongoing: <strong>{metrics.ongoingCount}</strong> | Reworks: <strong>{metrics.reworkCount}</strong>
          </div>
        </div>

        {/* RETURNS & REWORKS KPI (Crucial Requirement: "retures") */}
        <div
          style={{
            background: metrics.reworkCount > 0 ? "linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)" : "white",
            borderRadius: "var(--border-radius-xl)",
            padding: "1.25rem 1.5rem",
            border: metrics.reworkCount > 0 ? "1px solid #fecdd3" : "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9f1239" }}>
              Returns &amp; Reworks
            </span>
            <span
              style={{
                background: metrics.reworkCount > 0 ? "#e11d48" : "#94a3b8",
                color: "white",
                borderRadius: "9999px",
                padding: "0.2rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: 800,
              }}
            >
              {metrics.reworkRate}% Rate
            </span>
          </div>
          <div style={{ fontSize: "1.875rem", fontWeight: 900, color: "#be123c" }}>
            {metrics.reworkCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#9f1239", marginTop: "0.35rem" }}>
            {metrics.reworkCount === 0 ? "Zero customer returns recorded" : "Requires technician quality review"}
          </div>
        </div>

        {/* Enquiries & Conversion */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--border-radius-xl)",
            padding: "1.25rem 1.5rem",
            border: "1px solid var(--border-color)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--gray-500)" }}>
              Leads / Enquiries
            </span>
            <span style={{ background: "#ede9fe", color: "#6b21a8", borderRadius: "9999px", padding: "0.2rem 0.5rem", fontSize: "0.75rem", fontWeight: 800 }}>
              {metrics.conversionRate}% Converted
            </span>
          </div>
          <div style={{ fontSize: "1.875rem", fontWeight: 900, color: "var(--brand-purple)" }}>
            {metrics.totalLeads}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginTop: "0.35rem" }}>
            From website &amp; walk-in customer leads
          </div>
        </div>
      </div>

      {/* DEDICATED RETURNS & REWORKS ("retures") ANALYTICS SECTION */}
      <div
        style={{
          background: "white",
          borderRadius: "var(--border-radius-xl)",
          border: "1px solid var(--border-color)",
          padding: "1.5rem",
          marginBottom: "1.75rem",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  background: "#fee2e2",
                  color: "#991b1b",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                <RotateCcw size={12} /> Quality Control
              </span>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--brand-navy)", margin: 0 }}>
                Returns &amp; Rework Quality Analytics
              </h2>
            </div>
            <p style={{ color: "var(--gray-500)", fontSize: "0.8125rem", marginTop: "0.2rem" }}>
              Tracks all repeat repairs, customer warranty complaints, and technician rework diagnostics.
            </p>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => downloadExcelReport("reworks", "current_filter")}
              className="btn btn-sm"
              style={{
                background: "#991b1b",
                color: "white",
                border: "none",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              <Download size={13} /> Export Returns Excel
            </button>
          </div>
        </div>

        {reworkCases.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              background: "#f0fdf4",
              borderRadius: "12px",
              border: "1px solid #bbf7d0",
              color: "#166534",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 0.5rem auto",
              }}
            >
              <CheckCircle2 size={18} color="#166534" />
            </div>
            <div style={{ fontWeight: 800, fontSize: "1rem" }}>Zero Returns or Reworks in Selected Period</div>
            <div style={{ fontSize: "0.8125rem", color: "#15803d", marginTop: "0.25rem" }}>
              100% first-time repair success rate. No warranty return cases found.
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1rem" }}>
            {reworkCases.map((rc) => (
              <div
                key={rc.id}
                style={{
                  background: "#fff1f2",
                  border: "1px solid #fecdd3",
                  borderRadius: "12px",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#991b1b", fontSize: "0.875rem" }}>
                      {rc.order_number}
                    </span>
                    <span
                      style={{
                        background: "#ffe4e6",
                        color: "#be123c",
                        fontSize: "0.72rem",
                        padding: "0.15rem 0.5rem",
                        borderRadius: "9999px",
                        fontWeight: 700,
                        border: "1px solid #fecdd3",
                      }}
                    >
                      {rc.status_display || rc.status}
                    </span>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--brand-navy)" }}>
                    {rc.customer_name} &bull; <span style={{ color: "var(--gray-600)", fontWeight: 600 }}>{rc.customer_phone}</span>
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-700)", marginTop: "0.2rem" }}>
                    Device: <strong>{rc.device || rc.device_model_text}</strong>
                  </div>

                  <div
                    style={{
                      background: "white",
                      borderRadius: "8px",
                      padding: "0.6rem 0.75rem",
                      border: "1px solid #fed7aa",
                      marginTop: "0.6rem",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#c2410c", fontSize: "0.75rem", textTransform: "uppercase" }}>
                      Reported Return / Rework Reason:
                    </div>
                    <div style={{ color: "#7c2d12", marginTop: "0.2rem", fontWeight: 600 }}>
                      &ldquo;{rc.rework_reason || "Customer reported device issue persists"}&rdquo;
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "0.75rem",
                    paddingTop: "0.5rem",
                    borderTop: "1px solid #fecdd3",
                    fontSize: "0.75rem",
                  }}
                >
                  <span style={{ color: "var(--gray-600)" }}>
                    Working Tech: <strong style={{ color: "var(--brand-navy)" }}>{rc.assigned_technician_name || "Unassigned"}</strong>
                  </span>
                  <span style={{ color: "var(--gray-600)" }}>
                    Billed: <strong style={{ color: "#166534" }}>₹{rc.total_customer_charge.toLocaleString("en-IN")}</strong>
                  </span>
                  <Link
                    href={`/crm/repairs?search=${rc.order_number}`}
                    style={{
                      color: "var(--brand-purple)",
                      fontWeight: 700,
                      textDecoration: "none",
                      fontSize: "0.75rem",
                    }}
                  >
                    View Job &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TECHNICIAN PRODUCTIVITY & QUALITY MATRIX */}
      <div
        style={{
          background: "white",
          borderRadius: "var(--border-radius-xl)",
          border: "1px solid var(--border-color)",
          padding: "1.5rem",
          marginBottom: "1.75rem",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--brand-navy)", margin: 0 }}>
              Technician Quality &amp; Productivity Scorecard
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: "0.8125rem", marginTop: "0.2rem" }}>
              Work completed, revenue generated, and individual rework return rate per technician.
            </p>
          </div>
        </div>

        <div className="table-wrapper" style={{ border: "none" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Technician</th>
                <th>Total Assigned</th>
                <th>Completed</th>
                <th>In Progress</th>
                <th>Reworks / Returns</th>
                <th>Quality (Rework Rate)</th>
                <th>Revenue Generated</th>
                <th>Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {technicianStats.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "1.5rem", color: "var(--gray-500)" }}>
                    No technician activity recorded for selected date filter.
                  </td>
                </tr>
              ) : (
                technicianStats.map((t) => (
                  <tr key={t.name}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: "var(--brand-purple)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                          }}
                        >
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: "var(--brand-navy)" }}>{t.name}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{t.totalJobs} jobs</td>
                    <td>
                      <span style={{ color: "#166534", fontWeight: 700 }}>{t.completedJobs} done</span>
                    </td>
                    <td>
                      <span style={{ color: "#854d0e", fontWeight: 700 }}>{t.ongoingJobs} active</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          color: t.reworkJobs > 0 ? "#be123c" : "#166534",
                        }}
                      >
                        {t.reworkJobs} reworks
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          background: t.reworkRate > 15 ? "#fee2e2" : t.reworkRate > 0 ? "#fef3c7" : "#dcfce7",
                          color: t.reworkRate > 15 ? "#991b1b" : t.reworkRate > 0 ? "#92400e" : "#166534",
                        }}
                      >
                        {t.reworkRate}% Return Rate
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: "var(--brand-navy)" }}>
                      ₹{t.revenue.toLocaleString("en-IN")}
                    </td>
                    <td style={{ fontWeight: 800, color: "#166534" }}>
                      +₹{t.profit.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED DATA LEDGER (With Tab Navigation) */}
      <div
        style={{
          background: "white",
          borderRadius: "var(--border-radius-xl)",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Ledger Tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem 1.25rem",
            borderBottom: "1px solid var(--border-color)",
            background: "#f8fafc",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setActiveLedgerTab("profit")}
              className={`btn btn-sm ${activeLedgerTab === "profit" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "8px" }}
            >
              <DollarSign size={13} /> Profit &amp; Vendor Ledger ({filteredRepairs.length})
            </button>

            <button
              onClick={() => setActiveLedgerTab("completed")}
              className={`btn btn-sm ${activeLedgerTab === "completed" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "8px" }}
            >
              <CheckCircle2 size={13} /> Completed Bookings ({metrics.completedCount})
            </button>

            <button
              onClick={() => setActiveLedgerTab("reworks")}
              className={`btn btn-sm ${activeLedgerTab === "reworks" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "8px" }}
            >
              <RotateCcw size={13} /> Returns &amp; Reworks ({reworkCases.length})
            </button>

            <button
              onClick={() => setActiveLedgerTab("invoices")}
              className={`btn btn-sm ${activeLedgerTab === "invoices" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "8px" }}
            >
              <CreditCard size={13} /> Invoices ({filteredInvoices.length})
            </button>

            <button
              onClick={() => setActiveLedgerTab("leads")}
              className={`btn btn-sm ${activeLedgerTab === "leads" ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "8px" }}
            >
              <Layers size={13} /> Leads Received ({filteredLeads.length})
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => {
                const cat = (activeLedgerTab === "profit" || activeLedgerTab === "completed") ? "repairs" : activeLedgerTab;
                downloadExcelReport(cat, "current_filter");
              }}
              className="btn btn-secondary btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
            >
              <Download size={13} /> Export Current Table to Excel
            </button>
          </div>
        </div>

        {/* Tab 1: Profit & Vendor Ledger */}
        {activeLedgerTab === "profit" && (
          <div className="table-wrapper" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer &amp; Phone</th>
                  <th>Device &amp; Issue</th>
                  <th>Technician</th>
                  <th>Vendor &amp; Part Purchased</th>
                  <th>Vendor Cost (CP)</th>
                  <th>Customer Price (SP)</th>
                  <th>Net Profit</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepairs.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "var(--gray-500)" }}>
                      No financial records matching the selected date range.
                    </td>
                  </tr>
                ) : (
                  filteredRepairs.map((r) => {
                    const margin = r.total_customer_charge > 0 ? Math.round((r.internal_profit / r.total_customer_charge) * 100) : 0;
                    return (
                      <tr key={r.id}>
                        <td>
                          <span style={{ fontFamily: "monospace", fontWeight: 800, color: "var(--brand-purple)", fontSize: "0.8125rem" }}>
                            {r.order_number}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: "var(--brand-navy)" }}>{r.customer_name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{r.customer_phone}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: "0.8125rem" }}>{r.device || r.device_model_text}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{r.reported_issue}</div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              padding: "0.15rem 0.5rem",
                              borderRadius: "9999px",
                              background: "#f1f5f9",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            <Wrench size={10} />
                            {r.assigned_technician_name || "Unassigned"}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-800)" }}>
                            {r.part_name || r.parts_used_notes || "—"}
                          </div>
                          {r.vendor_name && (
                            <div style={{ fontSize: "0.7rem", color: "var(--gray-500)" }}>
                              Vendor: {r.vendor_name}
                            </div>
                          )}
                        </td>
                        <td style={{ fontWeight: 700, color: "#991b1b", fontSize: "0.875rem" }}>
                          ₹{Number(r.vendor_cost || 0).toLocaleString("en-IN")}
                        </td>
                        <td style={{ fontWeight: 800, color: "var(--brand-navy)", fontSize: "0.9rem" }}>
                          ₹{Number(r.total_customer_charge || 0).toLocaleString("en-IN")}
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, color: "#166534", fontSize: "0.9rem" }}>
                            +₹{Number(r.internal_profit || 0).toLocaleString("en-IN")}
                          </div>
                          <span style={{ fontSize: "0.6875rem", color: "#15803d", fontWeight: 700 }}>
                            {margin}% margin
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>
                          {toISODate(r.booking_date || r.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Completed Bookings */}
        {activeLedgerTab === "completed" && (
          <div className="table-wrapper" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Device</th>
                  <th>Technician</th>
                  <th>Work Done</th>
                  <th>Spare Replaced</th>
                  <th>Customer Charge</th>
                  <th>Completed Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredRepairs.filter((r) => (r.status || "").toLowerCase().includes("completed")).length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--gray-500)" }}>
                      No completed bookings found in this period.
                    </td>
                  </tr>
                ) : (
                  filteredRepairs
                    .filter((r) => (r.status || "").toLowerCase().includes("completed"))
                    .map((r) => (
                      <tr key={r.id}>
                        <td>
                          <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#166534" }}>
                            {r.order_number}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{r.customer_name}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{r.customer_phone}</div>
                        </td>
                        <td>{r.device || r.device_model_text}</td>
                        <td>{r.assigned_technician_name || "Unassigned"}</td>
                        <td>{r.work_performed || r.confirmed_issue || "Completed"}</td>
                        <td>{r.parts_used_notes || r.part_name || "—"}</td>
                        <td style={{ fontWeight: 800, color: "#166534" }}>
                          ₹{Number(r.total_customer_charge || 0).toLocaleString("en-IN")}
                        </td>
                        <td>{toISODate(r.booking_date || r.created_at)}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Returns & Reworks */}
        {activeLedgerTab === "reworks" && (
          <div className="table-wrapper" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Device</th>
                  <th>Technician</th>
                  <th>Return / Rework Reason</th>
                  <th>Status</th>
                  <th>Customer Charge</th>
                  <th>Reported Date</th>
                </tr>
              </thead>
              <tbody>
                {reworkCases.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--gray-500)" }}>
                      No returns or rework cases found.
                    </td>
                  </tr>
                ) : (
                  reworkCases.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#991b1b" }}>
                          {r.order_number}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{r.customer_name}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{r.customer_phone}</div>
                      </td>
                      <td>{r.device || r.device_model_text}</td>
                      <td>{r.assigned_technician_name || "Unassigned"}</td>
                      <td style={{ fontWeight: 700, color: "#be123c" }}>
                        {r.rework_reason || "Warranty complaint"}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "0.15rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: "#fee2e2",
                            color: "#991b1b",
                          }}
                        >
                          {r.status_display || r.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800 }}>
                        ₹{Number(r.total_customer_charge || 0).toLocaleString("en-IN")}
                      </td>
                      <td>{toISODate(r.booking_date || r.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Invoices */}
        {activeLedgerTab === "invoices" && (
          <div className="table-wrapper" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Order Reference</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Device</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th>Issued Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--gray-500)" }}>
                      No invoices found for this date range.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: 800, color: "var(--brand-purple)" }}>
                          {inv.invoice_number}
                        </span>
                      </td>
                      <td>{inv.repair_order_number || "—"}</td>
                      <td style={{ fontWeight: 700 }}>{inv.customer_name}</td>
                      <td>{inv.customer_phone}</td>
                      <td>{inv.device}</td>
                      <td style={{ fontWeight: 800, color: "var(--brand-navy)" }}>
                        ₹{inv.total.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "0.15rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: "#dcfce7",
                            color: "#166534",
                          }}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td>{toISODate(inv.issued_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Leads */}
        {activeLedgerTab === "leads" && (
          <div className="table-wrapper" style={{ border: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Source</th>
                  <th>Device</th>
                  <th>Reported Problem</th>
                  <th>Status</th>
                  <th>Handled By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "2rem", color: "var(--gray-500)" }}>
                      No leads received during this period.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: 800, color: "var(--brand-purple)" }}>
                          {l.reference}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{l.customer_name}</td>
                      <td>{l.customer_phone}</td>
                      <td>
                        <span
                          style={{
                            padding: "0.15rem 0.5rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: "#ede9fe",
                            color: "#6b21a8",
                          }}
                        >
                          {l.source_display || l.source}
                        </span>
                      </td>
                      <td>{l.device_model_text || "—"}</td>
                      <td>{l.reported_problem || "—"}</td>
                      <td>{l.status_display || l.status}</td>
                      <td>{l.handled_by_name || "Super Admin"}</td>
                      <td>{toISODate(l.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EXPORT TO EXCEL OPTIONS MODAL */}
      {showExportModal && (
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
            if (e.target === e.currentTarget) setShowExportModal(false);
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "var(--border-radius-2xl)",
              width: "100%",
              maxWidth: 540,
              padding: "1.75rem",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: "#ecfdf5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--brand-navy)", margin: 0 }}>
                    Download Excel Report
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "var(--gray-500)", margin: 0 }}>
                    Choose your desired report dataset and date scope.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "var(--gray-400)" }}
              >
                ✕
              </button>
            </div>

            {/* Select Dataset */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "0.4rem" }}>
                1. Select Report Type:
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { id: "master", title: "Master Business Report", desc: "All-in-one comprehensive report (Repairs + Profit + Invoices + Returns)" },
                  { id: "repairs", title: "Repair Bookings & Workshop Orders", desc: "Orders, customers, device, technician, part cost, profit" },
                  { id: "reworks", title: "Returns & Reworks Quality Report", desc: "Repeat warranty issues, return reasons, quality review" },
                  { id: "invoices", title: "Billing & Invoices Ledger", desc: "Invoice IDs, payments, tax, customer phone, totals" },
                  { id: "leads", title: "Enquiries & Lead Conversion", desc: "Website & walk-in inquiries, handled by, conversion status" },
                ].map((item) => (
                  <label
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.6rem",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "8px",
                      border: exportType === item.id ? "1.5px solid var(--brand-purple)" : "1px solid var(--border-color)",
                      background: exportType === item.id ? "#f5f3ff" : "white",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="exportType"
                      checked={exportType === item.id}
                      onChange={() => setExportType(item.id as any)}
                      style={{ marginTop: "0.2rem" }}
                    />
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--brand-navy)" }}>{item.title}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Select Scope */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-navy)", marginBottom: "0.4rem" }}>
                2. Select Date Scope:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                <label
                  style={{
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: exportScope === "today" ? "1.5px solid #059669" : "1px solid var(--border-color)",
                    background: exportScope === "today" ? "#ecfdf5" : "white",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === "today"}
                    onChange={() => setExportScope("today")}
                    style={{ display: "none" }}
                  />
                  <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-navy)" }}>Today Only</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--gray-500)" }}>{todayISO}</div>
                </label>

                <label
                  style={{
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: exportScope === "current_filter" ? "1.5px solid var(--brand-purple)" : "1px solid var(--border-color)",
                    background: exportScope === "current_filter" ? "#f5f3ff" : "white",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === "current_filter"}
                    onChange={() => setExportScope("current_filter")}
                    style={{ display: "none" }}
                  />
                  <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-navy)" }}>Current Filter</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--gray-500)" }}>
                    {singleDate || datePreset}
                  </div>
                </label>

                <label
                  style={{
                    padding: "0.6rem",
                    borderRadius: "8px",
                    border: exportScope === "all" ? "1.5px solid var(--brand-purple)" : "1px solid var(--border-color)",
                    background: exportScope === "all" ? "#f5f3ff" : "white",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  <input
                    type="radio"
                    name="exportScope"
                    checked={exportScope === "all"}
                    onChange={() => setExportScope("all")}
                    style={{ display: "none" }}
                  />
                  <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-navy)" }}>All Time</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--gray-500)" }}>All historical records</div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                onClick={() => setShowExportModal(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  downloadExcelReport(exportType, exportScope);
                  setShowExportModal(false);
                }}
                className="btn btn-primary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
              >
                <Download size={14} /> Download Excel Spreadsheet (.csv)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
