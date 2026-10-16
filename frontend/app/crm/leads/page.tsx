"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApiUrl } from "../../lib/api";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Phone,
  MessageCircle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Wrench,
  X,
  XCircle,
  PhoneCall,
  Calendar,
  User,
  Smartphone,
  ChevronDown,
  ArrowRight,
  Shield,
  FileText,
  DollarSign,
  Info,
} from "lucide-react";

interface LeadItem {
  id: string;
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  device_model_text: string;
  reported_problem: string;
  pickup_area?: string;
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
  booking_id?: string;
  booking_status?: string;
  has_booking?: boolean;
  is_archived?: boolean;
  internal_notes?: string;
  created_at: string;
}

interface Technician {
  id: number;
  name: string;
  phone: string;
  email: string;
  is_active: boolean;
}

const statusBadgeConfig: Record<string, { bg: string; color: string; border: string; label: string }> = {
  new: { bg: "#ede9fe", color: "#5b21b6", border: "#ddd6fe", label: "New Enquiry" },
  interested: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0", label: "Interested (Booking)" },
  callback_later: { bg: "#fef3c7", color: "#92400e", border: "#fde68a", label: "Call Back Later" },
  not_interested: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca", label: "Not Interested" },
  wrong_number: { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0", label: "Wrong Number" },
  completed: { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0", label: "Completed" },
  cancelled: { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1", label: "Cancelled" },
};

const sourceLabels: Record<string, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  website: "Website",
  walk_in: "Walk-in",
  phone: "Phone Call",
  reference: "Reference",
  referral: "Referral",
  organic_search: "Organic Search",
  whatsapp: "WhatsApp",
  other: "Other",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modals state
  const [activeLead, setActiveLead] = useState<LeadItem | null>(null);
  const [modalMode, setModalMode] = useState<"interested" | "not_interested" | "wrong_number" | "callback_later" | "delete" | null>(null);

  // Current logged in user
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Interested Modal State: Part Name, Vendor & Single Pricing
  const [confirmedIssue, setConfirmedIssue] = useState("");
  const [partName, setPartName] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorCost, setVendorCost] = useState<number>(0);
  const [customerTotalPrice, setCustomerTotalPrice] = useState<number>(2000);
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorInput, setNewVendorInput] = useState("");
  const [addingVendor, setAddingVendor] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState<number | "">("");
  const [serviceStatus, setServiceStatus] = useState("pending");
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [interestedNotes, setInterestedNotes] = useState("");

  // Not Interested Modal State
  const [rejectionReason, setRejectionReason] = useState("Price too high");
  const [customReasonDesc, setCustomReasonDesc] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");

  // Wrong Number Modal State
  const [wrongNumberNotes, setWrongNumberNotes] = useState("");

  // Call Back Later Modal State
  const [callbackDate, setCallbackDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [callbackTime, setCallbackTime] = useState("04:30 PM");
  const [callbackNotes, setCallbackNotes] = useState("");

  // Delete Lead Modal State
  const [deleteConfirmLead, setDeleteConfirmLead] = useState<LeadItem | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  // New Walk-in Lead Modal State
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [walkinEmail, setWalkinEmail] = useState("");
  const [walkinAddress, setWalkinAddress] = useState("");
  const [walkinDevice, setWalkinDevice] = useState("");
  const [walkinProblem, setWalkinProblem] = useState("");
  const [walkinSource, setWalkinSource] = useState("walk_in");
  const [walkinNotes, setWalkinNotes] = useState("");

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const u = JSON.parse(localStorage.getItem("crm_user") || "{}");
        setCurrentUser(u);
      } catch (e) {
        setCurrentUser(null);
      }
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, techRes, vendorsRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/leads/`),
        fetch(`${apiUrl}/api/v1/repairs/technicians/`),
        fetch(`${apiUrl}/api/v1/parts/vendors/`),
      ]);

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        const results = Array.isArray(data) ? data : data.results || [];
        setLeads(results);
      } else {
        showNotification("Failed to fetch leads from server.", true);
      }

      if (techRes.ok) {
        const techData = await techRes.json();
        setTechnicians(Array.isArray(techData) ? techData : []);
      }

      if (vendorsRes.ok) {
        const vData = await vendorsRes.json();
        const vList = Array.isArray(vData) ? vData : vData.results || [];
        setVendors(vList);
      }
    } catch (err: any) {
      showNotification("Could not connect to database backend: " + (err.message || ""), true);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Quick Add Vendor
  const handleAddVendor = async () => {
    const vName = newVendorInput.trim();
    if (!vName) return;
    setAddingVendor(true);
    try {
      const res = await fetch(`${apiUrl}/api/v1/parts/vendors/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: vName }),
      });
      if (res.ok) {
        const newV = await res.json();
        setVendors((prev) => [newV, ...prev]);
        setVendorName(newV.name);
        setNewVendorInput("");
        setShowAddVendor(false);
        showNotification(`Distributor "${newV.name}" added successfully!`);
      }
    } catch (e: any) {
      showNotification("Failed to add vendor: " + e.message, true);
    } finally {
      setAddingVendor(false);
    }
  };

  // Open action modal for a lead
  const openActionModal = (lead: LeadItem, action: "interested" | "not_interested" | "wrong_number" | "callback_later") => {
    setActiveLead(lead);
    setModalMode(action);

    if (action === "interested") {
      setConfirmedIssue(lead.reported_problem || "");
      setPartName("");
      setVendorName(vendors.length > 0 ? vendors[0].name : "iFix Mobile Spares (SP Road)");
      setVendorCost(0);
      setCustomerTotalPrice(2000);
      setSelectedTechId(technicians.length > 0 ? technicians[0].id : "");
      setServiceStatus("pending");
      setBookingDate(new Date().toISOString().split("T")[0]);
      setInterestedNotes("");
      setShowAddVendor(false);
      setNewVendorInput("");
    } else if (action === "not_interested") {
      setRejectionReason("Price too high");
      setCustomReasonDesc("");
      setRejectionNotes("");
    } else if (action === "wrong_number") {
      setWrongNumberNotes("Number invalid or not reachable / wrong person answered.");
    } else if (action === "callback_later") {
      setCallbackDate(new Date().toISOString().split("T")[0]);
      setCallbackTime("05:00 PM");
      setCallbackNotes("Customer requested to call back at convenient time.");
    }
  };

  // Submit Lead Action
  const submitLeadAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLead || !modalMode) return;

    const handledByName = currentUser?.full_name || "Super Admin";
    let payload: any = { action: modalMode, handled_by_name: handledByName };

    if (modalMode === "interested") {
      const custPrice = Number(customerTotalPrice) || 0;
      const vCost = Number(vendorCost) || 0;
      const profit = Math.max(0, custPrice - vCost);
      payload = {
        ...payload,
        confirmed_issue: confirmedIssue,
        part_name: partName,
        vendor_name: vendorName,
        vendor_cost: vCost,
        total_customer_charge: custPrice,
        product_price: custPrice,
        service_charges: 0,
        internal_profit: profit,
        technician_id: selectedTechId ? Number(selectedTechId) : null,
        service_status: serviceStatus,
        booking_date: bookingDate,
        notes: interestedNotes,
      };
    } else if (modalMode === "not_interested") {
      const finalReason = rejectionReason === "Other" && customReasonDesc.trim()
        ? `Other: ${customReasonDesc.trim()}`
        : rejectionReason;
      payload = {
        ...payload,
        reason: finalReason,
        notes: rejectionNotes,
      };
    } else if (modalMode === "wrong_number") {
      payload = {
        ...payload,
        notes: wrongNumberNotes,
      };
    } else if (modalMode === "callback_later") {
      if (!callbackDate || !callbackTime) {
        showNotification("Please select both callback date and time.", true);
        return;
      }
      payload = {
        ...payload,
        callback_date: callbackDate,
        callback_time: callbackTime,
        notes: callbackNotes,
      };
    }

    try {
      const res = await fetch(`${apiUrl}/api/v1/leads/${activeLead.id}/action/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotification(
          modalMode === "interested"
            ? `Lead ${activeLead.reference} confirmed Interested! Booking created/updated.`
            : modalMode === "not_interested"
            ? `Lead ${activeLead.reference} marked Not Interested.`
            : modalMode === "wrong_number"
            ? `Lead ${activeLead.reference} marked Wrong Number.`
            : `Callback scheduled for ${activeLead.reference} on ${callbackDate} at ${callbackTime}.`
        );
        setModalMode(null);
        setActiveLead(null);
        loadData();
      } else {
        const err = await res.json();
        showNotification(err.error || "Failed to update lead status.", true);
      }
    } catch (err: any) {
      showNotification("Network error submitting lead action: " + err.message, true);
    }
  };

  // Safe Delete / Archive Lead
  const handleDeleteLead = async () => {
    if (!deleteConfirmLead) return;
    try {
      const res = await fetch(`${apiUrl}/api/v1/leads/${deleteConfirmLead.id}/`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: deleteReason }),
      });

      if (res.ok) {
        showNotification(`Lead ${deleteConfirmLead.reference} safely deleted / archived.`);
        setDeleteConfirmLead(null);
        setDeleteReason("");
        loadData();
      } else {
        const err = await res.json();
        showNotification(err.error || "Failed to delete lead.", true);
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    }
  };

  // Create Walk-in Lead
  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim() || !walkinPhone.trim()) {
      showNotification("Customer Name and 10-digit Phone are required.", true);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/v1/leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: walkinName.trim(),
          customer_phone: walkinPhone.trim(),
          customer_email: walkinEmail.trim(),
          customer_address: walkinAddress.trim(),
          device_model_text: walkinDevice.trim() || "Device",
          reported_problem: walkinProblem.trim() || "General Repair Request",
          source: walkinSource,
          notes: walkinNotes.trim(),
          handled_by_name: currentUser?.full_name || "Super Admin",
        }),
      });

      if (res.ok) {
        showNotification("New walk-in lead successfully created in database!");
        setShowWalkinModal(false);
        setWalkinName("");
        setWalkinPhone("");
        setWalkinEmail("");
        setWalkinAddress("");
        setWalkinDevice("");
        setWalkinProblem("");
        setWalkinNotes("");
        loadData();
      } else {
        const err = await res.json();
        showNotification(JSON.stringify(err) || "Failed to create walk-in lead.", true);
      }
    } catch (err: any) {
      showNotification("Error submitting walk-in: " + err.message, true);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (sourceFilter !== "all" && l.source !== sourceFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = l.customer_name?.toLowerCase().includes(q);
      const matchPhone = l.customer_phone?.includes(q);
      const matchRef = l.reference?.toLowerCase().includes(q);
      const matchDevice = l.device_model_text?.toLowerCase().includes(q);
      const matchProb = l.reported_problem?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchRef && !matchDevice && !matchProb) return false;
    }
    return true;
  });

  // Metric counts
  const totalEnquiries = leads.length;
  const newCount = leads.filter((l) => l.status === "new").length;
  const interestedCount = leads.filter((l) => l.status === "interested").length;
  const callbackCount = leads.filter((l) => l.status === "callback_later").length;
  const rejectedCount = leads.filter((l) => l.status === "not_interested" || l.status === "wrong_number").length;

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

      {/* Header & Quick Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Customer Enquiries & Leads
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Database-driven CRM pipeline: Every enquiry connects directly to Bookings, Callbacks, and Invoices.
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
            onClick={() => setShowWalkinModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 1rem",
              background: "#4f46e5", color: "white", border: "none", borderRadius: "6px",
              cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700,
              boxShadow: "0 1px 2px rgba(79, 70, 229, 0.2)"
            }}
          >
            <Plus size={16} />
            + New Walk-in Lead
          </button>
        </div>
      </div>

      {/* Pipeline KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.875rem", marginBottom: "1.25rem" }}>
        <div
          onClick={() => setStatusFilter("all")}
          style={{
            background: statusFilter === "all" ? "#f8fafc" : "#ffffff",
            border: `1.5px solid ${statusFilter === "all" ? "#6366f1" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Total Enquiries</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginTop: "0.25rem" }}>{totalEnquiries}</div>
          <div style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: "0.25rem" }}>All registered in SQLite</div>
        </div>

        <div
          onClick={() => setStatusFilter("new")}
          style={{
            background: statusFilter === "new" ? "#ede9fe" : "#ffffff",
            border: `1.5px solid ${statusFilter === "new" ? "#7c3aed" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#5b21b6", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>1. New Enquiries</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#5b21b6", marginTop: "0.25rem" }}>{newCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#6d28d9", marginTop: "0.25rem" }}>Pending 4-action review</div>
        </div>

        <div
          onClick={() => setStatusFilter("interested")}
          style={{
            background: statusFilter === "interested" ? "#dcfce7" : "#ffffff",
            border: `1.5px solid ${statusFilter === "interested" ? "#16a34a" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#166534", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>2. Interested (Bookings)</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#166534", marginTop: "0.25rem" }}>{interestedCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#15803d", marginTop: "0.25rem" }}>Synced to Workshop</div>
        </div>

        <div
          onClick={() => setStatusFilter("callback_later")}
          style={{
            background: statusFilter === "callback_later" ? "#fef3c7" : "#ffffff",
            border: `1.5px solid ${statusFilter === "callback_later" ? "#d97706" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#92400e", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>3. Call Back Later</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#92400e", marginTop: "0.25rem" }}>{callbackCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#b45309", marginTop: "0.25rem" }}>Scheduled follow-ups</div>
        </div>

        <div
          onClick={() => setStatusFilter("not_interested")}
          style={{
            background: statusFilter === "not_interested" ? "#fee2e2" : "#ffffff",
            border: `1.5px solid ${statusFilter === "not_interested" ? "#dc2626" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s ease"
          }}
        >
          <div style={{ color: "#991b1b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>4. Not Interested / Wrong</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#991b1b", marginTop: "0.25rem" }}>{rejectedCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#b91c1c", marginTop: "0.25rem" }}>Reopenable anytime</div>
        </div>
      </div>

      {/* Search & Filters Bar */}
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
            placeholder="Search by customer name, phone, lead ID, device..."
            style={{
              width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.25rem",
              borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1",
              fontSize: "0.8125rem", background: "white", color: "#1e293b", fontWeight: 600
            }}
          >
            <option value="all">All Statuses</option>
            <option value="new">New Enquiries</option>
            <option value="interested">Interested (Bookings)</option>
            <option value="callback_later">Call Back Later</option>
            <option value="not_interested">Not Interested</option>
            <option value="wrong_number">Wrong Number</option>
            <option value="completed">Completed</option>
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
            <option value="website">Website Form</option>
            <option value="walk_in">Walk-in</option>
            <option value="phone">Phone Call</option>
            <option value="reference">Reference / Referral</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569", width: "160px" }}>Lead ID / Time</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Customer</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Device & Problem</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Source</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Current Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569", minWidth: "360px" }}>Four Main Actions</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569", textAlign: "center", width: "70px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 0.5rem" }} />
                    Loading database enquiries...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    <Info size={32} style={{ margin: "0 auto 0.5rem", color: "#94a3b8" }} />
                    <div style={{ fontWeight: 600, fontSize: "1rem", color: "#334155" }}>No enquiries found</div>
                    <p style={{ margin: "0.25rem 0 1rem", fontSize: "0.8125rem" }}>
                      Enquiries submitted through the website or walk-in modal will appear here automatically.
                    </p>
                    <button
                      onClick={() => setShowWalkinModal(true)}
                      style={{
                        padding: "0.5rem 1rem", background: "#4f46e5", color: "white", border: "none",
                        borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.8125rem"
                      }}
                    >
                      + Create Test Walk-in Lead
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const badge = statusBadgeConfig[lead.status] || {
                    bg: "#f1f5f9", color: "#475569", border: "#cbd5e1", label: lead.status
                  };
                  const dateStr = lead.created_at
                    ? new Date(lead.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
                    : "Recently";

                  return (
                    <tr
                      key={lead.id}
                      style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* ID & Date */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontFamily: "monospace", fontWeight: 800, color: "#1e1b4b", fontSize: "0.84rem" }}>
                          {lead.reference}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "2px", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Clock size={11} /> {dateStr}
                        </div>
                        {lead.booking_id && (
                          <div style={{ marginTop: "4px" }}>
                            <Link
                              href="/crm/repairs"
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "2px",
                                fontSize: "0.72rem", background: "#ecfdf5", color: "#065f46",
                                padding: "1px 5px", borderRadius: "4px", textDecoration: "none", fontWeight: 700
                              }}
                            >
                              <Wrench size={10} /> {lead.booking_id}
                            </Link>
                          </div>
                        )}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{lead.customer_name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "3px" }}>
                          <a
                            href={`tel:${lead.customer_phone}`}
                            style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.8125rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "2px" }}
                          >
                            <Phone size={12} /> {lead.customer_phone}
                          </a>
                          <a
                            href={`https://wa.me/91${lead.customer_phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#16a34a", fontSize: "0.8125rem" }}
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </a>
                        </div>
                        {lead.pickup_area && (
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                            📍 {lead.pickup_area}
                          </div>
                        )}
                      </td>

                      {/* Device & Issue */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 600, color: "#334155" }}>
                          {lead.device_model_text || "Apple / Smart Device"}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "2px", maxWidth: "260px" }}>
                          {lead.reported_problem}
                        </div>
                      </td>

                      {/* Source */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <span style={{
                          display: "inline-block", fontSize: "0.75rem", padding: "0.2rem 0.55rem",
                          borderRadius: "4px", background: "#f1f5f9", color: "#334155", fontWeight: 600
                        }}>
                          {sourceLabels[lead.source] || lead.source}
                        </span>
                      </td>

                      {/* Current Status Badge */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          fontSize: "0.75rem", padding: "0.25rem 0.65rem", borderRadius: "12px",
                          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                          fontWeight: 700
                        }}>
                          {badge.label}
                        </span>

                        {lead.status === "callback_later" && lead.callback_date && (
                          <div style={{ fontSize: "0.75rem", color: "#92400e", fontWeight: 700, marginTop: "4px" }}>
                            ⏰ {lead.callback_date} {lead.callback_time}
                          </div>
                        )}
                        {(lead.status === "not_interested" || lead.status === "wrong_number") && lead.rejection_reason && (
                          <div style={{ fontSize: "0.75rem", color: "#991b1b", marginTop: "4px" }}>
                            Reason: {lead.rejection_reason}
                          </div>
                        )}

                        <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "0.72rem", color: "#1e293b", fontWeight: 700, background: "#f8fafc", padding: "1px 6px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>
                          <span style={{ color: "#64748b", fontWeight: 600 }}>👤 Handled by:</span> {lead.handled_by_name || "Super Admin"}
                        </div>
                      </td>

                      {/* Four Main Actions: Mutually Exclusive Segmented Buttons */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                        <div style={{
                          display: "inline-flex", background: "#f8fafc", padding: "3px",
                          borderRadius: "8px", border: "1px solid #e2e8f0", gap: "3px"
                        }}>
                          {/* Option A: Interested */}
                          <button
                            onClick={() => openActionModal(lead, "interested")}
                            style={{
                              padding: "0.35rem 0.65rem", fontSize: "0.75rem", fontWeight: 700,
                              borderRadius: "6px", border: "none", cursor: "pointer",
                              background: lead.status === "interested" ? "#16a34a" : "transparent",
                              color: lead.status === "interested" ? "white" : "#166534",
                              transition: "all 0.15s ease",
                            }}
                          >
                            ✓ Interested
                          </button>

                          {/* Option B: Not Interested */}
                          <button
                            onClick={() => openActionModal(lead, "not_interested")}
                            style={{
                              padding: "0.35rem 0.65rem", fontSize: "0.75rem", fontWeight: 700,
                              borderRadius: "6px", border: "none", cursor: "pointer",
                              background: lead.status === "not_interested" ? "#dc2626" : "transparent",
                              color: lead.status === "not_interested" ? "white" : "#991b1b",
                              transition: "all 0.15s ease",
                            }}
                          >
                            ✗ Not Interested
                          </button>

                          {/* Option C: Wrong Number */}
                          <button
                            onClick={() => openActionModal(lead, "wrong_number")}
                            style={{
                              padding: "0.35rem 0.65rem", fontSize: "0.75rem", fontWeight: 700,
                              borderRadius: "6px", border: "none", cursor: "pointer",
                              background: lead.status === "wrong_number" ? "#64748b" : "transparent",
                              color: lead.status === "wrong_number" ? "white" : "#475569",
                              transition: "all 0.15s ease",
                            }}
                          >
                            ⊘ Wrong No.
                          </button>

                          {/* Option D: Call Back Later */}
                          <button
                            onClick={() => openActionModal(lead, "callback_later")}
                            style={{
                              padding: "0.35rem 0.65rem", fontSize: "0.75rem", fontWeight: 700,
                              borderRadius: "6px", border: "none", cursor: "pointer",
                              background: lead.status === "callback_later" ? "#d97706" : "transparent",
                              color: lead.status === "callback_later" ? "white" : "#92400e",
                              transition: "all 0.15s ease",
                            }}
                          >
                            ⏱ Call Back
                          </button>
                        </div>
                      </td>

                      {/* Row Actions: Delete/Archive */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", textAlign: "center" }}>
                        <button
                          onClick={() => setDeleteConfirmLead(lead)}
                          title="Safe delete or archive lead"
                          style={{
                            padding: "0.35rem", background: "transparent", border: "none",
                            color: "#94a3b8", cursor: "pointer", borderRadius: "4px"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                        >
                          <Trash2 size={16} />
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

      {/* ─── OPTION A: INTERESTED MODAL (CREATES / UPDATES BOOKING) ──────────────── */}
      {modalMode === "interested" && activeLead && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "620px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#166534", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Option A: Customer Interested → Create Booking
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Lead: {activeLead.reference} — {activeLead.customer_name} ({activeLead.customer_phone})
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitLeadAction} style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Device / Product
                  </label>
                  <input
                    type="text"
                    disabled
                    value={activeLead.device_model_text || "Apple / Smart Device"}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Customer's Confirmed Issue & Requirements
                </label>
                <input
                  type="text"
                  value={confirmedIssue}
                  onChange={(e) => setConfirmedIssue(e.target.value)}
                  placeholder="e.g. Original Screen Replacement + Water Damage Cleaning"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              {/* Product/Part Name & Vendor / Distributor Details */}
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#1e293b", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Wrench size={14} color="#4f46e5" /> Product / Part & Distributor Details
                </div>

                {/* Part Name */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.2rem" }}>
                    Product / Spare Part Name
                  </label>
                  <input
                    type="text"
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="e.g. iPhone 13 OLED Display Panel / Battery / Charging Port"
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
                  />
                </div>

                {/* Vendor / Distributor selection */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
                      Product Distributor / Vendor
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddVendor(!showAddVendor)}
                      style={{ fontSize: "0.72rem", color: "#4f46e5", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}
                    >
                      {showAddVendor ? "✕ Cancel" : "+ Add New Vendor"}
                    </button>
                  </div>

                  {showAddVendor && (
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      <input
                        type="text"
                        value={newVendorInput}
                        onChange={(e) => setNewVendorInput(e.target.value)}
                        placeholder="Enter Distributor / Vendor Name..."
                        style={{ flex: 1, padding: "0.4rem 0.6rem", borderRadius: "6px", border: "1px solid #4f46e5", fontSize: "0.8125rem" }}
                      />
                      <button
                        type="button"
                        disabled={addingVendor}
                        onClick={handleAddVendor}
                        style={{ padding: "0.4rem 0.8rem", borderRadius: "6px", background: "#4f46e5", color: "#fff", border: "none", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}
                      >
                        {addingVendor ? "Saving..." : "Save Vendor"}
                      </button>
                    </div>
                  )}

                  <select
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", fontSize: "0.875rem" }}
                  >
                    <option value="">Select Distributor / Vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id || v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>

                {/* Pricing: Vendor purchase cost and single customer price */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.2rem" }}>
                      Vendor Purchase Cost (Internal ₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={vendorCost}
                      onChange={(e) => setVendorCost(Number(e.target.value))}
                      placeholder="Cost paid to vendor"
                      style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
                    />
                    <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>Cost paid to distributor</span>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#166534", marginBottom: "0.2rem" }}>
                      Total Customer Price (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      required
                      value={customerTotalPrice}
                      onChange={(e) => setCustomerTotalPrice(Number(e.target.value))}
                      placeholder="Total price for customer"
                      style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1.5px solid #16a34a", fontSize: "0.875rem", fontWeight: 700, color: "#166534" }}
                    />
                    <span style={{ fontSize: "0.68rem", color: "#166534", fontWeight: 600 }}>Single final price for customer</span>
                  </div>
                </div>

                {/* Internal Profit Summary */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #e2e8f0" }}>
                  <div>
                    <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>Total Customer Charge: </span>
                    <strong style={{ fontSize: "1.05rem", color: "#0f172a" }}>₹{Number(customerTotalPrice).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#475569" }}>Internal Profit: </span>
                    <strong style={{ fontSize: "0.95rem", color: Number(customerTotalPrice) - Number(vendorCost) >= 0 ? "#166534" : "#dc2626" }}>
                      ₹{(Number(customerTotalPrice) - Number(vendorCost)).toLocaleString()}
                    </strong>
                    <div style={{ fontSize: "0.65rem", color: "#64748b" }}>(Internal only • Never on customer invoice)</div>
                  </div>
                </div>
              </div>

              {/* Technician & Service Status */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Assign Technician
                  </label>
                  <select
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value ? Number(e.target.value) : "")}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
                  >
                    <option value="">Unassigned</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.phone || "Active"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Initial Service Status
                  </label>
                  <select
                    value={serviceStatus}
                    onChange={(e) => setServiceStatus(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
                  >
                    <option value="pending">Pending</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Staff Work Notes
                </label>
                <textarea
                  rows={2}
                  value={interestedNotes}
                  onChange={(e) => setInterestedNotes(e.target.value)}
                  placeholder="Special instructions, customer preference, pickup notes..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
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

      {/* ─── OPTION B: NOT INTERESTED MODAL ───────────────────────────────────────── */}
      {modalMode === "not_interested" && activeLead && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "520px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#991b1b", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Option B: Mark Not Interested
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Lead: {activeLead.reference} — {activeLead.customer_name}
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitLeadAction} style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.35rem" }}>
                  Reason for Customer's Decision <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{ width: "100%", padding: "0.55rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
                  required
                >
                  <option value="Price too high">Price too high</option>
                  <option value="Customer changed their mind">Customer changed their mind</option>
                  <option value="Service not required">Service not required</option>
                  <option value="Chose another service provider">Chose another service provider</option>
                  <option value="Service unavailable">Service unavailable</option>
                  <option value="Other">Other (specify below)</option>
                </select>
              </div>

              {rejectionReason === "Other" && (
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Description of Reason <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={customReasonDesc}
                    onChange={(e) => setCustomReasonDesc(e.target.value)}
                    placeholder="Enter customer's exact reason..."
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
              )}

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Staff Detailed Notes
                </label>
                <textarea
                  rows={3}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Record customer comments, feedback, or pricing expectations..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
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

      {/* ─── OPTION C: WRONG NUMBER MODAL ─────────────────────────────────────────── */}
      {modalMode === "wrong_number" && activeLead && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "500px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#475569", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Option C: Mark Wrong Number
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Lead: {activeLead.reference} — {activeLead.customer_phone}
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitLeadAction} style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Verification Note / Remarks
                </label>
                <textarea
                  rows={3}
                  value={wrongNumberNotes}
                  onChange={(e) => setWrongNumberNotes(e.target.value)}
                  placeholder="e.g. Person answered stated they did not submit any enquiry..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  style={{ padding: "0.6rem 1.25rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "6px", border: "none",
                    background: "#475569", color: "white", cursor: "pointer", fontWeight: 700
                  }}
                >
                  Save as Wrong Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── OPTION D: CALL BACK LATER MODAL ─────────────────────────────────────── */}
      {modalMode === "callback_later" && activeLead && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "520px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#d97706", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Option D: Schedule Call Back Later
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Lead: {activeLead.reference} — {activeLead.customer_name} ({activeLead.customer_phone})
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitLeadAction} style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Callback Date <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={callbackDate}
                    onChange={(e) => setCallbackDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Callback Time <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={callbackTime}
                    onChange={(e) => setCallbackTime(e.target.value)}
                    placeholder="e.g. 05:00 PM"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
              </div>

              {/* Quick time suggestion buttons */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                {["11:00 AM", "02:30 PM", "05:00 PM", "07:30 PM"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCallbackTime(t)}
                    style={{
                      padding: "0.25rem 0.6rem", fontSize: "0.75rem", borderRadius: "4px",
                      background: callbackTime === t ? "#fef3c7" : "#f1f5f9",
                      color: callbackTime === t ? "#92400e" : "#475569",
                      border: "1px solid #cbd5e1", cursor: "pointer", fontWeight: 600
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Notes (What customer requested / Why callback is required)
                </label>
                <textarea
                  rows={3}
                  value={callbackNotes}
                  onChange={(e) => setCallbackNotes(e.target.value)}
                  placeholder="e.g. In a meeting; requested quote comparison call at 5 PM..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
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
                  Schedule Callback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── SAFE DELETE / ARCHIVE CONFIRMATION DIALOG ───────────────────────────── */}
      {deleteConfirmLead && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "480px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#ef4444", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <AlertCircle size={22} />
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Confirm Lead Deletion / Archival
                </h3>
              </div>
              <button
                onClick={() => setDeleteConfirmLead(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "1.5rem" }}>
              <p style={{ color: "#1e293b", fontSize: "0.875rem", lineHeight: 1.5, marginTop: 0 }}>
                Are you sure you want to remove the following lead?
              </p>

              <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "#1e1b4b" }}>
                  Lead Reference: {deleteConfirmLead.reference}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#334155", marginTop: "2px" }}>
                  Customer: <strong>{deleteConfirmLead.customer_name}</strong>
                </div>
                <div style={{ fontSize: "0.8125rem", color: "#334155" }}>
                  Phone: <strong>{deleteConfirmLead.customer_phone}</strong>
                </div>
                {deleteConfirmLead.booking_id && (
                  <div style={{ fontSize: "0.75rem", color: "#b45309", marginTop: "4px", fontWeight: 700 }}>
                    ⚠️ Note: Has linked workshop booking ({deleteConfirmLead.booking_id}). It will be archived safely without destroying financial history.
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#475569", marginBottom: "0.25rem" }}>
                  Reason for Deletion / Archival
                </label>
                <input
                  type="text"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g. Duplicate enquiry, test submission, resolved..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.84rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmLead(null)}
                  style={{ padding: "0.6rem 1.25rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteLead}
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "6px", border: "none",
                    background: "#ef4444", color: "white", cursor: "pointer", fontWeight: 700
                  }}
                >
                  Confirm Safe Archival
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── NEW WALK-IN LEAD MODAL ──────────────────────────────────────────────── */}
      {showWalkinModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "580px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#4f46e5", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Create New Customer Lead
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Direct database lead creation for Walk-in, Phone call, or Reference.
                </p>
              </div>
              <button
                onClick={() => setShowWalkinModal(false)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateWalkin} style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Customer Full Name <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Mobile Phone Number <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    placeholder="e.g. 9845012345"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={walkinEmail}
                    onChange={(e) => setWalkinEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Lead Source <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={walkinSource}
                    onChange={(e) => setWalkinSource(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
                  >
                    <option value="walk_in">Walk-in</option>
                    <option value="phone">Phone Call</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="meta_ads">Meta Ads</option>
                    <option value="website">Website</option>
                    <option value="reference">Reference / Referral</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Device / Model
                  </label>
                  <input
                    type="text"
                    value={walkinDevice}
                    onChange={(e) => setWalkinDevice(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro, MacBook Pro M2"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Address / Area
                  </label>
                  <input
                    type="text"
                    value={walkinAddress}
                    onChange={(e) => setWalkinAddress(e.target.value)}
                    placeholder="e.g. Jayanagar 4th Block, Bangalore"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Reported Problem / Service Required <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={walkinProblem}
                  onChange={(e) => setWalkinProblem(e.target.value)}
                  placeholder="e.g. Broken screen, battery draining quickly"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Internal Staff Notes
                </label>
                <textarea
                  rows={2}
                  value={walkinNotes}
                  onChange={(e) => setWalkinNotes(e.target.value)}
                  placeholder="Additional customer notes..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  style={{ padding: "0.6rem 1.25rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "6px", border: "none",
                    background: "#4f46e5", color: "white", cursor: "pointer", fontWeight: 700
                  }}
                >
                  Save Lead to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
