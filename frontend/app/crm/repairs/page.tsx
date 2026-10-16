"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApiUrl } from "../../lib/api";
import {
  Wrench,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  AlertCircle,
  RefreshCw,
  User,
  ArrowRight,
  FileText,
  DollarSign,
  RotateCcw,
  Shield,
  Edit,
  X,
  Plus,
  ChevronDown,
  Info,
  Check,
  PackageCheck,
  CheckSquare,
  Calendar,
} from "lucide-react";

interface RepairBooking {
  id: string;
  order_number: string;
  booking_id: string;
  booking_date: string;
  customer: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  lead?: string;
  linked_lead_id?: string;
  linked_lead_reference?: string;
  device: string;
  device_model_text: string;
  reported_issue: string;
  intake_condition?: string;
  confirmed_issue?: string;
  diagnosis?: string;
  work_performed?: string;
  parts_used_notes?: string;
  rework_reason?: string;
  assigned_technician?: number;
  assigned_technician_name?: string;
  status: string;
  status_display?: string;
  priority?: string;
  part_name?: string;
  vendor_name?: string;
  vendor_cost?: number;
  product_price: number;
  service_charges: number;
  total_customer_charge: number;
  internal_profit: number;
  has_invoice: boolean;
  invoice_id?: string;
  invoice_number?: string;
  internal_notes?: string;
  technician_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Technician {
  id: number;
  name: string;
  phone: string;
  email: string;
  is_active: boolean;
  active_jobs_count?: number;
}

const statusBadgeStyles: Record<string, { bg: string; color: string; border: string; label: string }> = {
  pending: { bg: "#fef3c7", color: "#92400e", border: "#fde68a", label: "Pending" },
  scheduled: { bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd", label: "Scheduled" },
  in_progress: { bg: "#fef9c3", color: "#854d0e", border: "#fef08a", label: "In Progress" },
  repair_in_progress: { bg: "#fef9c3", color: "#854d0e", border: "#fef08a", label: "In Progress" },
  completed: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0", label: "Completed (Done & Delivered)" },
  repair_completed: { bg: "#dcfce7", color: "#166534", border: "#bbf7d0", label: "Completed (Done & Delivered)" },
  rework: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca", label: "Rework Required" },
  rework_required: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca", label: "Rework Required" },
  awaiting_device: { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1", label: "Awaiting Device" },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<RepairBooking[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Primary Tab: Ongoing (active jobs) vs Completed (done & delivered) vs All
  const [mainTab, setMainTab] = useState<"ongoing" | "completed" | "all">("ongoing");
  const [statusFilter, setStatusFilter] = useState("all");
  const [techFilter, setTechFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Direct Mark Done / Complete Modal State
  const [completingBooking, setCompletingBooking] = useState<RepairBooking | null>(null);
  const [completionWorkDone, setCompletionWorkDone] = useState("");
  const [completionTechId, setCompletionTechId] = useState<number | "">("");
  const [completionPaymentDone, setCompletionPaymentDone] = useState(true);
  const [completionDelivered, setCompletionDelivered] = useState(true);
  const [completionGenInvoice, setCompletionGenInvoice] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  // Edit / Update Modal State
  const [editingBooking, setEditingBooking] = useState<RepairBooking | null>(null);
  const [editWorkflowStage, setEditWorkflowStage] = useState<"ongoing" | "completed">("ongoing");
  const [editStatus, setEditStatus] = useState("in_progress");
  const [editTechId, setEditTechId] = useState<number | "">("");
  const [editConfirmedIssue, setEditConfirmedIssue] = useState("");
  const [editWorkPerformed, setEditWorkPerformed] = useState("");
  const [editPartsUsed, setEditPartsUsed] = useState("");
  const [editPartName, setEditPartName] = useState("");
  const [editVendorName, setEditVendorName] = useState("");
  const [editVendorCost, setEditVendorCost] = useState<number>(0);
  const [editCustomerPrice, setEditCustomerPrice] = useState<number>(0);
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorInput, setNewVendorInput] = useState("");
  const [addingVendor, setAddingVendor] = useState(false);
  const [editProductPrice, setEditProductPrice] = useState<number>(0);
  const [editServiceCharges, setEditServiceCharges] = useState<number>(0);
  const [editInternalProfit, setEditInternalProfit] = useState<number>(0);
  const [editNotes, setEditNotes] = useState("");

  // Rework Modal State
  const [reworkBooking, setReworkBooking] = useState<RepairBooking | null>(null);
  const [reworkReasonText, setReworkReasonText] = useState("");

  // Invoice Generation Modal State
  const [invoiceBooking, setInvoiceBooking] = useState<RepairBooking | null>(null);
  const [invoiceTaxRate, setInvoiceTaxRate] = useState<number>(0);
  const [invoiceWarranty, setInvoiceWarranty] = useState("90 Days Service & Replacement Warranty");
  const [invoicePaymentStatus, setInvoicePaymentStatus] = useState("paid");

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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, techsRes, vendorsRes] = await Promise.all([
        fetch(`${apiUrl}/api/v1/repairs/`),
        fetch(`${apiUrl}/api/v1/repairs/technicians/`),
        fetch(`${apiUrl}/api/v1/parts/vendors/`),
      ]);

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        const results = Array.isArray(data) ? data : data.results || [];
        setBookings(results);
      } else {
        showNotification("Failed to fetch bookings.", true);
      }

      if (techsRes.ok) {
        const techData = await techsRes.json();
        setTechnicians(Array.isArray(techData) ? techData : []);
      }

      if (vendorsRes.ok) {
        const vData = await vendorsRes.json();
        const vList = Array.isArray(vData) ? vData : vData.results || [];
        setVendors(vList);
      }
    } catch (err: any) {
      showNotification("Database connection error: " + err.message, true);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Direct Mark Done Modal
  const openCompleteModal = (booking: RepairBooking) => {
    setCompletingBooking(booking);
    setCompletionWorkDone(booking.work_performed || booking.confirmed_issue || "Display / hardware repair completed and fully tested");
    setCompletionTechId(booking.assigned_technician || (technicians[0]?.id || ""));
    setCompletionPaymentDone(true);
    setCompletionDelivered(true);
    setCompletionGenInvoice(!booking.has_invoice);
  };

  // Submit Mark Done (Moves booking to Completed)
  const handleConfirmDone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingBooking) return;
    setIsCompleting(true);

    try {
      const payload: any = {
        status: "completed",
        work_performed: completionWorkDone.trim() || "Repair successfully completed & tested",
        assigned_technician: completionTechId ? Number(completionTechId) : completingBooking.assigned_technician,
        internal_notes: `[Completed]: Payment: ${completionPaymentDone ? "Received in full" : "Pending"} | Delivery: ${completionDelivered ? "Delivered to customer" : "Ready for pickup"}. ${completingBooking.internal_notes || ""}`.trim(),
      };

      const res = await fetch(`${apiUrl}/api/v1/repairs/${completingBooking.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update repair status.");
      }

      // Auto-generate invoice if requested and doesn't exist
      if (completionGenInvoice && !completingBooking.has_invoice) {
        try {
          await fetch(`${apiUrl}/api/v1/payments/invoices/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              repair_order_id: completingBooking.id,
              product_price: completingBooking.product_price,
              service_charges: completingBooking.service_charges,
              tax_rate: 0,
              warranty: "90 Days Service & Replacement Warranty",
              status: completionPaymentDone ? "paid" : "pending",
              customer_name: completingBooking.customer_name,
              customer_phone: completingBooking.customer_phone,
              customer_email: completingBooking.customer_email,
              customer_address: completingBooking.customer_address,
              device: completingBooking.device_model_text,
              service: completionWorkDone || completingBooking.confirmed_issue || "Completed Repair",
              technician: technicians.find((t) => t.id === Number(completionTechId))?.name || completingBooking.assigned_technician_name,
            }),
          });
        } catch (invErr) {
          console.warn("Auto-invoice generation warning:", invErr);
        }
      }

      showNotification(`✓ Booking ${completingBooking.order_number} marked as Completed & Delivered! Moved to Completed section.`);
      setCompletingBooking(null);
      await loadData();
      // Keep user in current view or let them see the updated status
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    } finally {
      setIsCompleting(false);
    }
  };

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
        setEditVendorName(newV.name);
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

  // Open Edit Modal
  const openEditModal = (booking: RepairBooking) => {
    setEditingBooking(booking);
    const isComp = booking.status === "completed" || booking.status === "repair_completed";
    setEditWorkflowStage(isComp ? "completed" : "ongoing");
    setEditStatus(booking.status || "in_progress");
    setEditTechId(booking.assigned_technician || "");
    setEditConfirmedIssue(booking.confirmed_issue || booking.diagnosis || "");
    setEditWorkPerformed(booking.work_performed || "");
    setEditPartsUsed(booking.parts_used_notes || "");
    setEditPartName(booking.part_name || "");
    setEditVendorName(booking.vendor_name || (vendors.length > 0 ? vendors[0].name : ""));
    setEditVendorCost(booking.vendor_cost || 0);
    setEditCustomerPrice(booking.total_customer_charge || booking.product_price || 0);
    setEditNotes(booking.internal_notes || "");
  };

  // Submit Edit Booking
  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    // Resolve final status based on toggle
    let finalStatus = editStatus;
    if (editWorkflowStage === "completed") {
      finalStatus = "completed";
    } else if (finalStatus === "completed" || finalStatus === "repair_completed") {
      finalStatus = "in_progress";
    }

    try {
      const custPrice = Number(editCustomerPrice) || 0;
      const vCost = Number(editVendorCost) || 0;
      const margin = Math.max(0, custPrice - vCost);

      const res = await fetch(`${apiUrl}/api/v1/repairs/${editingBooking.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: finalStatus,
          assigned_technician: editTechId ? Number(editTechId) : null,
          confirmed_issue: editConfirmedIssue,
          work_performed: editWorkPerformed,
          parts_used_notes: editPartsUsed,
          part_name: editPartName,
          vendor_name: editVendorName,
          vendor_cost: vCost,
          total_customer_charge: custPrice,
          product_price: custPrice,
          service_charges: 0,
          internal_profit: margin,
          internal_notes: editNotes,
        }),
      });

      if (res.ok) {
        showNotification(
          finalStatus === "completed"
            ? `Booking ${editingBooking.order_number} marked Completed and moved to Completed section!`
            : `Booking ${editingBooking.order_number} successfully updated in Ongoing jobs!`
        );
        setEditingBooking(null);
        loadData();
      } else {
        const err = await res.json();
        showNotification(err.error || "Failed to update booking.", true);
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    }
  };

  // Quick Technician Reassignment
  const handleReassignTech = async (bookingId: string, techId: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/v1/repairs/${bookingId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_technician: techId ? Number(techId) : null }),
      });

      if (res.ok) {
        showNotification("Technician reassigned successfully.");
        loadData();
      } else {
        showNotification("Failed to reassign technician.", true);
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    }
  };

  // Submit Rework
  const handleConfirmRework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reworkBooking) return;
    if (!reworkReasonText.trim()) {
      showNotification("Rework reason is required.", true);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/v1/repairs/${reworkBooking.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rework",
          rework_reason: reworkReasonText.trim(),
        }),
      });

      if (res.ok) {
        showNotification(`Booking ${reworkBooking.order_number} reopened for rework and moved to Ongoing queue.`);
        setReworkBooking(null);
        setReworkReasonText("");
        setMainTab("ongoing"); // Switch to ongoing so staff sees the reopened job
        loadData();
      } else {
        showNotification("Failed to mark rework.", true);
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    }
  };

  // Generate Invoice from Booking
  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceBooking) return;

    try {
      const res = await fetch(`${apiUrl}/api/v1/payments/invoices/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repair_order_id: invoiceBooking.id,
          product_price: invoiceBooking.product_price,
          service_charges: invoiceBooking.service_charges,
          tax_rate: Number(invoiceTaxRate) || 0,
          warranty: invoiceWarranty,
          status: invoicePaymentStatus,
          customer_name: invoiceBooking.customer_name,
          customer_phone: invoiceBooking.customer_phone,
          customer_email: invoiceBooking.customer_email,
          customer_address: invoiceBooking.customer_address,
          device: invoiceBooking.device_model_text,
          service: invoiceBooking.confirmed_issue || invoiceBooking.work_performed,
          technician: invoiceBooking.assigned_technician_name,
        }),
      });

      if (res.ok) {
        const invData = await res.json();
        showNotification(`Invoice ${invData.invoice_number} successfully created! PDF ready.`);
        setInvoiceBooking(null);
        loadData();
      } else {
        const err = await res.json();
        showNotification(err.error || "Failed to generate invoice.", true);
      }
    } catch (err: any) {
      showNotification("Error generating invoice: " + err.message, true);
    }
  };

  // KPI calculations
  const totalCount = bookings.length;
  const completedCount = bookings.filter((b) => b.status === "completed" || b.status === "repair_completed").length;
  const ongoingCount = totalCount - completedCount;
  const inProgressCount = bookings.filter((b) => b.status === "in_progress" || b.status === "repair_in_progress").length;
  const scheduledCount = bookings.filter((b) => b.status === "scheduled" || b.status === "pending").length;
  const reworkCount = bookings.filter((b) => b.status === "rework" || b.status === "rework_required").length;
  const completedWithReworkCount = bookings.filter((b) => (b.status === "completed" || b.status === "repair_completed") && !!b.rework_reason).length;

  // Filter bookings based on active Tab, statusFilter, techFilter, dateFilter, and search
  const filteredBookings = bookings.filter((b) => {
    const isComp = b.status === "completed" || b.status === "repair_completed";

    // GLOBAL SEARCH OVERRIDE:
    // If the user is searching, find matching bookings from ANYWHERE (ongoing or completed, any date)
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchOrder = b.order_number?.toLowerCase().includes(q);
      const matchLead = b.linked_lead_reference?.toLowerCase().includes(q);
      const matchName = b.customer_name?.toLowerCase().includes(q);
      const matchPhone = b.customer_phone?.includes(q);
      const matchDevice = b.device_model_text?.toLowerCase().includes(q);
      const matchIssue = (b.reported_issue || "").toLowerCase().includes(q);
      const matchPart = (b.part_name || "").toLowerCase().includes(q);
      const matchTech = (b.assigned_technician_name || "").toLowerCase().includes(q);
      return matchOrder || matchLead || matchName || matchPhone || matchDevice || matchIssue || matchPart || matchTech;
    }

    // 1. Primary Tab filter (Ongoing vs Completed vs All)
    if (mainTab === "ongoing") {
      // Completed jobs are ALWAYS hidden from ongoing/pending list
      if (isComp) return false;
      // Pending/ongoing jobs stay in pending until completed, but if user explicitly filtered by date:
      if (dateFilter) {
        const bDate = (b.booking_date || b.created_at || "").slice(0, 10);
        if (bDate !== dateFilter) return false;
      }
    } else if (mainTab === "completed") {
      // Must be completed
      if (!isComp) return false;
      // If date filter is set, show completed on that date
      if (dateFilter) {
        const compDate = (b.updated_at || b.booking_date || b.created_at || "").slice(0, 10);
        if (compDate !== dateFilter) return false;
      }
      if (statusFilter === "with_rework" && !b.rework_reason) return false;
      if (statusFilter === "standard" && !!b.rework_reason) return false;
    } else if (mainTab === "all") {
      if (dateFilter) {
        const bDate = (b.booking_date || b.created_at || "").slice(0, 10);
        if (bDate !== dateFilter) return false;
      }
    }

    // 2. Sub-status filter
    if (statusFilter !== "all") {
      if (statusFilter === "in_progress" && (b.status === "in_progress" || b.status === "repair_in_progress")) {
        // match
      } else if (statusFilter === "scheduled" && (b.status === "scheduled" || b.status === "pending")) {
        // match
      } else if (statusFilter === "completed" && isComp) {
        // match
      } else if (statusFilter === "rework" && (b.status === "rework" || b.status === "rework_required")) {
        // match
      } else if (b.status !== statusFilter) {
        return false;
      }
    }

    // 3. Technician filter
    if (techFilter !== "all") {
      if (String(b.assigned_technician) !== String(techFilter)) return false;
    }

    return true;
  });

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Toast notifications */}
      {successMsg && (
        <div style={{
          backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46",
          padding: "0.75rem 1.25rem", borderRadius: "8px", marginBottom: "1rem",
          display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{
          backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b",
          padding: "0.75rem 1.25rem", borderRadius: "8px", marginBottom: "1rem",
          display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600
        }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Repair Bookings & Workshop Jobs
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Track active repair progress, technician assignments, completed jobs, and invoice generation.
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
          <Link
            href="/crm/leads"
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 1rem",
              background: "#4f46e5", color: "white", textDecoration: "none", borderRadius: "6px",
              fontSize: "0.8125rem", fontWeight: 700
            }}
          >
            + From Enquiries
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.875rem", marginBottom: "1.25rem" }}>
        {/* Ongoing Jobs Card */}
        <div
          onClick={() => { setMainTab("ongoing"); setStatusFilter("all"); }}
          style={{
            background: mainTab === "ongoing" && statusFilter === "all" ? "#eff6ff" : "#ffffff",
            border: `2px solid ${mainTab === "ongoing" && statusFilter === "all" ? "#2563eb" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s"
          }}
        >
          <div style={{ color: "#1d4ed8", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>🛠️ Ongoing Repairs</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1d4ed8", marginTop: "0.25rem" }}>{ongoingCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#3b82f6", marginTop: "0.25rem" }}>Active workshop queue</div>
        </div>

        {/* Scheduled Card */}
        <div
          onClick={() => { setMainTab("ongoing"); setStatusFilter("scheduled"); }}
          style={{
            background: mainTab === "ongoing" && statusFilter === "scheduled" ? "#e0f2fe" : "#ffffff",
            border: `2px solid ${mainTab === "ongoing" && statusFilter === "scheduled" ? "#0284c7" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s"
          }}
        >
          <div style={{ color: "#0369a1", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Scheduled / Pending</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0369a1", marginTop: "0.25rem" }}>{scheduledCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#0284c7", marginTop: "0.25rem" }}>Awaiting start</div>
        </div>

        {/* In Progress Card */}
        <div
          onClick={() => { setMainTab("ongoing"); setStatusFilter("in_progress"); }}
          style={{
            background: mainTab === "ongoing" && statusFilter === "in_progress" ? "#fef9c3" : "#ffffff",
            border: `2px solid ${mainTab === "ongoing" && statusFilter === "in_progress" ? "#ca8a04" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s"
          }}
        >
          <div style={{ color: "#854d0e", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>In Progress</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#854d0e", marginTop: "0.25rem" }}>{inProgressCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#a16207", marginTop: "0.25rem" }}>Under technician care</div>
        </div>

        {/* Completed Services Card */}
        <div
          onClick={() => { setMainTab("completed"); setStatusFilter("all"); }}
          style={{
            background: mainTab === "completed" ? "#dcfce7" : "#ffffff",
            border: `2px solid ${mainTab === "completed" ? "#16a34a" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s"
          }}
        >
          <div style={{ color: "#166534", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>✅ Completed Services</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#166534", marginTop: "0.25rem" }}>{completedCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#15803d", marginTop: "0.25rem" }}>Done, Delivered & Invoiced</div>
        </div>

        {/* Rework Required Card */}
        <div
          onClick={() => { setMainTab("ongoing"); setStatusFilter("rework"); }}
          style={{
            background: mainTab === "ongoing" && statusFilter === "rework" ? "#fee2e2" : "#ffffff",
            border: `2px solid ${mainTab === "ongoing" && statusFilter === "rework" ? "#dc2626" : "#e2e8f0"}`,
            borderRadius: "10px", padding: "1rem", cursor: "pointer", transition: "all 0.15s"
          }}
        >
          <div style={{ color: "#991b1b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>⚠️ Rework Required</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#991b1b", marginTop: "0.25rem" }}>{reworkCount}</div>
          <div style={{ fontSize: "0.75rem", color: "#b91c1c", marginTop: "0.25rem" }}>Reopened jobs</div>
        </div>
      </div>

      {/* ─── PRIMARY WORKFLOW TABS: ONGOING vs COMPLETED ───────────────────────── */}
      <div style={{
        display: "flex", gap: "0.5rem", borderBottom: "2px solid #e2e8f0",
        marginBottom: "1.25rem", paddingBottom: "0.25rem"
      }}>
        <button
          onClick={() => { setMainTab("ongoing"); setStatusFilter("all"); }}
          style={{
            padding: "0.75rem 1.5rem", borderRadius: "8px 8px 0 0",
            border: "none", cursor: "pointer", fontWeight: 800, fontSize: "0.95rem",
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: mainTab === "ongoing" ? "#1e1b4b" : "transparent",
            color: mainTab === "ongoing" ? "white" : "#64748b",
            transition: "all 0.2s"
          }}
        >
          <Wrench size={16} />
          Ongoing Repairs
          <span style={{
            background: mainTab === "ongoing" ? "rgba(255,255,255,0.2)" : "#e2e8f0",
            color: mainTab === "ongoing" ? "white" : "#475569",
            padding: "0.15rem 0.55rem", borderRadius: "999px", fontSize: "0.78rem"
          }}>
            {ongoingCount}
          </span>
        </button>

        <button
          onClick={() => { setMainTab("completed"); setStatusFilter("all"); }}
          style={{
            padding: "0.75rem 1.5rem", borderRadius: "8px 8px 0 0",
            border: "none", cursor: "pointer", fontWeight: 800, fontSize: "0.95rem",
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: mainTab === "completed" ? "#166534" : "transparent",
            color: mainTab === "completed" ? "white" : "#64748b",
            transition: "all 0.2s"
          }}
        >
          <CheckCircle2 size={16} />
          Completed (Done &amp; Delivered)
          <span style={{
            background: mainTab === "completed" ? "rgba(255,255,255,0.25)" : "#e2e8f0",
            color: mainTab === "completed" ? "white" : "#475569",
            padding: "0.15rem 0.55rem", borderRadius: "999px", fontSize: "0.78rem"
          }}>
            {completedCount}
          </span>
          {completedWithReworkCount > 0 && (
            <span style={{
              background: mainTab === "completed" ? "rgba(254, 240, 138, 0.3)" : "#fef3c7",
              color: mainTab === "completed" ? "#fef08a" : "#b45309",
              border: mainTab === "completed" ? "1px solid rgba(254, 240, 138, 0.5)" : "1px solid #fde68a",
              padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.72rem",
              display: "inline-flex", alignItems: "center", gap: "3px", fontWeight: 700
            }}>
              <RotateCcw size={10} /> {completedWithReworkCount} with Rework
            </span>
          )}
        </button>

        <button
          onClick={() => { setMainTab("all"); setStatusFilter("all"); }}
          style={{
            padding: "0.75rem 1.5rem", borderRadius: "8px 8px 0 0",
            border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.95rem",
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: mainTab === "all" ? "#334155" : "transparent",
            color: mainTab === "all" ? "white" : "#64748b",
            transition: "all 0.2s"
          }}
        >
          All Bookings ({totalCount})
        </button>
      </div>

      {/* Filters Bar */}
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
            placeholder={`Search ${mainTab === "ongoing" ? "ongoing repairs" : mainTab === "completed" ? "completed jobs" : "all bookings"} by Order ID, customer, phone, device...`}
            style={{
              width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.25rem",
              borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem", outline: "none"
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {mainTab === "ongoing" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "0.55rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1",
                fontSize: "0.8125rem", background: "white", color: "#1e293b", fontWeight: 600
              }}
            >
              <option value="all">All Ongoing Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="scheduled">Scheduled / Pending</option>
              <option value="rework">Rework Required</option>
            </select>
          )}

          {mainTab === "completed" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "0.55rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1",
                fontSize: "0.8125rem", background: "white", color: "#1e293b", fontWeight: 600
              }}
            >
              <option value="all">All Completed ({completedCount})</option>
              <option value="with_rework">⚠️ Completed with Rework ({completedWithReworkCount})</option>
              <option value="standard">Standard Completed ({completedCount - completedWithReworkCount})</option>
            </select>
          )}

          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.85rem", borderRadius: "6px", border: "1px solid #cbd5e1",
              fontSize: "0.8125rem", background: "white", color: "#1e293b", fontWeight: 600
            }}
          >
            <option value="all">All Technicians</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
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
              title="Filter bookings by date"
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
            🔍 <strong>Global Search Active:</strong> Showing all results matching &ldquo;{search}&rdquo; across ongoing &amp; completed bookings from all dates.
          </span>
          <button
            onClick={() => setSearch("")}
            style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, cursor: "pointer", fontSize: "0.8125rem" }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Bookings Table */}
      <div style={{ background: "white", borderRadius: "10px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Booking &amp; Lead ID</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Customer</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Device &amp; Work Details</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Assigned Tech</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Pricing Breakdown</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 0.5rem" }} />
                    Loading database bookings...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    {dateFilter ? (
                      <div>
                        <Calendar size={36} style={{ margin: "0 auto 0.5rem", color: "#64748b" }} />
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>No bookings found for {dateFilter}</div>
                        <p style={{ margin: "0.25rem 0 1rem", fontSize: "0.8125rem", color: "#64748b" }}>
                          Try clearing the date filter to see all {mainTab} records.
                        </p>
                        <button
                          onClick={() => setDateFilter("")}
                          style={{
                            padding: "0.5rem 1rem", background: "#4f46e5", color: "white", border: "none",
                            borderRadius: "6px", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer"
                          }}
                        >
                          Clear Date Filter
                        </button>
                      </div>
                    ) : mainTab === "completed" ? (
                      <div>
                        <CheckCircle2 size={36} style={{ margin: "0 auto 0.5rem", color: "#16a34a" }} />
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1e293b" }}>No completed repairs yet</div>
                        <p style={{ margin: "0.25rem 0 1rem", fontSize: "0.8125rem", color: "#64748b" }}>
                          When technicians finish working on phones and you mark them &ldquo;Done&rdquo;, they will automatically appear here.
                        </p>
                        <button
                          onClick={() => setMainTab("ongoing")}
                          style={{
                            padding: "0.5rem 1rem", background: "#1e1b4b", color: "white", border: "none",
                            borderRadius: "6px", fontWeight: 700, fontSize: "0.8125rem", cursor: "pointer"
                          }}
                        >
                          View Ongoing Repairs →
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Wrench size={36} style={{ margin: "0 auto 0.5rem", color: "#94a3b8" }} />
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "#334155" }}>No ongoing bookings found</div>
                        <p style={{ margin: "0.25rem 0 1rem", fontSize: "0.8125rem" }}>
                          Mark leads as &ldquo;Interested&rdquo; from the Enquiries desk to create new bookings.
                        </p>
                        <Link
                          href="/crm/leads"
                          style={{
                            padding: "0.5rem 1rem", background: "#4f46e5", color: "white", textDecoration: "none",
                            borderRadius: "6px", fontWeight: 600, fontSize: "0.8125rem", display: "inline-block"
                          }}
                        >
                          Go to Enquiries Page →
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const badge = statusBadgeStyles[b.status] || {
                    bg: "#f1f5f9", color: "#475569", border: "#cbd5e1", label: b.status_display || b.status
                  };
                  const isCompleted = b.status === "completed" || b.status === "repair_completed";
                  const isRework = b.status === "rework" || b.status === "rework_required";

                  return (
                    <tr
                      key={b.id}
                      style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Booking ID & Lead */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontFamily: "monospace", fontWeight: 800, color: "#1e1b4b", fontSize: "0.875rem" }}>
                          {b.order_number}
                        </div>
                        {b.linked_lead_reference && (
                          <div style={{ color: "#6366f1", fontSize: "0.75rem", marginTop: "2px", fontWeight: 600 }}>
                            Lead: {b.linked_lead_reference}
                          </div>
                        )}
                        <div style={{ color: "#94a3b8", fontSize: "0.72rem", marginTop: "2px" }}>
                          📅 {b.booking_date}
                        </div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{b.customer_name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "2px" }}>
                          <a
                            href={`tel:${b.customer_phone}`}
                            style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.8125rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "2px" }}
                          >
                            <Phone size={12} /> {b.customer_phone}
                          </a>
                          <a
                            href={`https://wa.me/91${b.customer_phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#16a34a", fontSize: "0.8125rem" }}
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle size={14} />
                          </a>
                        </div>
                        {b.customer_address && (
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px", maxWidth: "260px" }}>
                            📍 {b.customer_address}
                          </div>
                        )}
                      </td>

                      {/* Device & Diagnosis & Work Performed */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>
                          {b.device_model_text || "Apple / Smart Device"}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "0.8125rem", marginTop: "2px", maxWidth: "240px" }}>
                          <strong>Reported:</strong> {b.reported_issue || "General Issue"}
                        </div>
                        {b.confirmed_issue && (
                          <div style={{ color: "#0f172a", fontSize: "0.78rem", marginTop: "3px", fontWeight: 600, maxWidth: "240px" }}>
                            <strong>Confirmed:</strong> {b.confirmed_issue}
                          </div>
                        )}
                        {b.work_performed && (
                          <div style={{
                            color: "#166534", fontSize: "0.78rem", marginTop: "3px",
                            background: "#f0fdf4", padding: "0.2rem 0.45rem", borderRadius: "4px",
                            display: "inline-flex", alignItems: "center", gap: "0.25rem", fontWeight: 600
                          }}>
                            ✓ {b.work_performed}
                          </div>
                        )}
                        {b.rework_reason && (
                          <div style={{
                            color: isRework ? "#b91c1c" : "#c2410c",
                            fontSize: "0.75rem",
                            marginTop: "5px",
                            fontWeight: 700,
                            background: isRework ? "#fee2e2" : "#fff7ed",
                            border: isRework ? "1px solid #fecaca" : "1px solid #fed7aa",
                            padding: "0.25rem 0.55rem",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem"
                          }}>
                            <RotateCcw size={11} />
                            <span>
                              <strong>{isRework ? "⚠️ Active Rework:" : "🔄 Rework History:"}</strong> {b.rework_reason}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Assigned Tech with Quick Reassign */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <select
                          value={b.assigned_technician || ""}
                          onChange={(e) => handleReassignTech(b.id, e.target.value)}
                          style={{
                            padding: "0.35rem 0.6rem", borderRadius: "6px", border: "1px solid #cbd5e1",
                            fontSize: "0.78rem", background: "white", color: "#1e293b", fontWeight: 600,
                            maxWidth: "140px"
                          }}
                        >
                          <option value="">Unassigned</option>
                          {technicians.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "3px" }}>
                          Current: <strong>{b.assigned_technician_name || "Unassigned"}</strong>
                        </div>
                      </td>

                      {/* Pricing Breakdown: Single Customer Price & Vendor Info */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                          Total: ₹{b.total_customer_charge.toLocaleString()}
                        </div>
                        {b.part_name && (
                          <div style={{ fontSize: "0.78rem", color: "#475569", marginTop: "2px" }}>
                            Part: <strong>{b.part_name}</strong>
                          </div>
                        )}
                        {b.vendor_name && (
                          <div style={{ fontSize: "0.75rem", color: "#6366f1", marginTop: "2px", fontWeight: 600 }}>
                            Vendor: {b.vendor_name}
                            {b.vendor_cost ? ` (₹${Number(b.vendor_cost).toLocaleString()} cost)` : ""}
                          </div>
                        )}
                        {/* Internal Profit — Clearly marked internal only, strictly hidden from invoice */}
                        <div style={{
                          display: "inline-block", fontSize: "0.7rem", padding: "1px 6px",
                          borderRadius: "4px", background: "#f0fdf4", color: "#166534",
                          border: "1px solid #bbf7d0", fontWeight: 700, marginTop: "3px"
                        }}>
                          Internal Margin: ₹{b.internal_profit.toLocaleString()} [Internal Only]
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem",
                          fontSize: "0.75rem", padding: "0.25rem 0.65rem", borderRadius: "12px",
                          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                          fontWeight: 700
                        }}>
                          {badge.label}
                        </span>

                        {isCompleted && b.rework_reason && (
                          <div style={{ marginTop: "4px" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "3px",
                              fontSize: "0.7rem", background: "#fff7ed", color: "#c2410c",
                              border: "1px solid #fed7aa", padding: "2px 6px", borderRadius: "4px", fontWeight: 700
                            }}>
                              <RotateCcw size={10} /> Rework Handled
                            </span>
                          </div>
                        )}

                        {b.has_invoice && b.invoice_number && (
                          <div style={{ marginTop: "4px" }}>
                            <Link
                              href="/crm/invoices"
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "2px",
                                fontSize: "0.72rem", background: "#eff6ff", color: "#1d4ed8",
                                padding: "1px 5px", borderRadius: "4px", textDecoration: "none", fontWeight: 700
                              }}
                            >
                              <FileText size={10} /> {b.invoice_number}
                            </Link>
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "top", textAlign: "right" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end" }}>
                          {/* 1. If ongoing: Direct "Mark Done / Completed" Button */}
                          {!isCompleted && (
                            <button
                              onClick={() => openCompleteModal(b)}
                              style={{
                                padding: "0.4rem 0.85rem", fontSize: "0.78rem", fontWeight: 800,
                                background: "#16a34a", color: "white", border: "none", borderRadius: "6px",
                                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.3rem",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                              }}
                              title="Mark phone service as completed & delivered"
                            >
                              <CheckCircle2 size={13} /> Mark Done
                            </button>
                          )}

                          {/* 2. Edit / Progress Button */}
                          <button
                            onClick={() => openEditModal(b)}
                            style={{
                              padding: "0.35rem 0.75rem", fontSize: "0.75rem", fontWeight: 700,
                              background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "6px",
                              cursor: "pointer", color: "#334155", display: "inline-flex", alignItems: "center", gap: "0.25rem"
                            }}
                          >
                            <Edit size={12} /> Edit / Progress
                          </button>

                          {/* 3. Mark Rework Button (available on all non-rework bookings) */}
                          {!isRework && (
                            <button
                              onClick={() => {
                                setReworkBooking(b);
                                setReworkReasonText("");
                              }}
                              style={{
                                padding: "0.3rem 0.65rem", fontSize: "0.72rem", fontWeight: 700,
                                background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "6px",
                                cursor: "pointer", color: "#be123c", display: "inline-flex", alignItems: "center", gap: "0.25rem"
                              }}
                              title="Reopen job for rework if customer has persistent issue"
                            >
                              <RotateCcw size={11} /> Mark Rework
                            </button>
                          )}

                          {/* 4. Generate Invoice Button (eligible when completed) */}
                          {isCompleted && !b.has_invoice && (
                            <button
                              onClick={() => {
                                setInvoiceBooking(b);
                                setInvoiceTaxRate(0);
                                setInvoiceWarranty("90 Days Service & Replacement Warranty");
                                setInvoicePaymentStatus("paid");
                              }}
                              style={{
                                padding: "0.35rem 0.75rem", fontSize: "0.75rem", fontWeight: 700,
                                background: "#1e1b4b", color: "white", border: "none", borderRadius: "6px",
                                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.25rem"
                              }}
                            >
                              <FileText size={12} /> Generate Invoice
                            </button>
                          )}

                          {/* 5. View PDF Button */}
                          {b.has_invoice && (
                            <a
                              href={`${apiUrl}/api/v1/payments/invoices/${b.invoice_id}/pdf/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: "0.3rem 0.65rem", fontSize: "0.72rem", fontWeight: 700,
                                background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", borderRadius: "6px",
                                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem"
                              }}
                            >
                              <FileText size={11} /> View PDF
                            </a>
                          )}
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

      {/* ─── DIRECT "MARK DONE / COMPLETED & DELIVERED" MODAL ──────────────────── */}
      {completingBooking && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "14px", width: "100%", maxWidth: "560px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{
              background: "#166534", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle2 size={20} /> Mark Repair Completed &amp; Delivered
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Booking #{completingBooking.order_number} — {completingBooking.customer_name} ({completingBooking.device_model_text})
                </p>
              </div>
              <button
                onClick={() => setCompletingBooking(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmDone} style={{ padding: "1.5rem" }}>
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px",
                padding: "0.85rem 1rem", marginBottom: "1.25rem", fontSize: "0.85rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <span style={{ color: "#166534", fontWeight: 600 }}>Customer: <strong>{completingBooking.customer_name}</strong></span>
                  <span style={{ color: "#166534", fontWeight: 600 }}>Phone: <strong>{completingBooking.customer_phone}</strong></span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#166534" }}>Total Billed Amount:</span>
                  <strong style={{ fontSize: "1rem", color: "#14532d" }}>₹{completingBooking.total_customer_charge.toLocaleString()}</strong>
                </div>
              </div>

              {/* Technician who completed work */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Technician Who Completed Work *
                </label>
                <select
                  value={completionTechId}
                  onChange={(e) => setCompletionTechId(e.target.value ? Number(e.target.value) : "")}
                  style={{ width: "100%", padding: "0.55rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", fontWeight: 600 }}
                  required
                >
                  <option value="">Select Technician</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work performed */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Work Performed Summary *
                </label>
                <textarea
                  rows={2}
                  value={completionWorkDone}
                  onChange={(e) => setCompletionWorkDone(e.target.value)}
                  placeholder="e.g. Original OLED Screen fitted, touch calibrated, sound & charging verified"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem" }}
                  required
                />
              </div>

              {/* Checkboxes: Payment & Phone Delivered */}
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                  <input
                    type="checkbox"
                    checked={completionPaymentDone}
                    onChange={(e) => setCompletionPaymentDone(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#16a34a" }}
                  />
                  <span>💰 Payment Done &amp; Received in Full (₹{completingBooking.total_customer_charge.toLocaleString()})</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>
                  <input
                    type="checkbox"
                    checked={completionDelivered}
                    onChange={(e) => setCompletionDelivered(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#16a34a" }}
                  />
                  <span>📦 Phone Delivered to Customer (or Handover Ready)</span>
                </label>

                {!completingBooking.has_invoice && (
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: 700, color: "#1d4ed8", marginTop: "0.25rem" }}>
                    <input
                      type="checkbox"
                      checked={completionGenInvoice}
                      onChange={(e) => setCompletionGenInvoice(e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                    />
                    <span>📄 Auto-generate PDF Tax Invoice &amp; Save</span>
                  </label>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setCompletingBooking(null)}
                  style={{ padding: "0.6rem 1.25rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: 600 }}
                  disabled={isCompleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "6px", border: "none",
                    background: "#16a34a", color: "white", cursor: "pointer", fontWeight: 800,
                    display: "inline-flex", alignItems: "center", gap: "0.4rem"
                  }}
                  disabled={isCompleting}
                >
                  {isCompleting ? "Saving..." : "✓ Confirm Done & Move to Completed"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── EDIT / WORK PROGRESS MODAL ────────────────────────────────────────── */}
      {editingBooking && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "680px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column"
          }}>
            <div style={{
              background: "#1e1b4b", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Update Booking #{editingBooking.order_number}
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Customer: {editingBooking.customer_name} ({editingBooking.customer_phone}) | Device: {editingBooking.device_model_text}
                </p>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} style={{ padding: "1.5rem", overflowY: "auto" }}>
              {/* Top High-level 2-way toggle: Ongoing vs Completed */}
              <div style={{
                background: "#f1f5f9", padding: "0.4rem", borderRadius: "10px",
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "1.25rem"
              }}>
                <button
                  type="button"
                  onClick={() => { setEditWorkflowStage("ongoing"); if (editStatus === "completed") setEditStatus("in_progress"); }}
                  style={{
                    padding: "0.65rem 1rem", borderRadius: "8px", border: "none",
                    fontWeight: 800, fontSize: "0.875rem", cursor: "pointer",
                    background: editWorkflowStage === "ongoing" ? "#1e1b4b" : "transparent",
                    color: editWorkflowStage === "ongoing" ? "white" : "#475569",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem"
                  }}
                >
                  <Wrench size={14} /> 1. Ongoing / In Progress
                </button>

                <button
                  type="button"
                  onClick={() => { setEditWorkflowStage("completed"); setEditStatus("completed"); }}
                  style={{
                    padding: "0.65rem 1rem", borderRadius: "8px", border: "none",
                    fontWeight: 800, fontSize: "0.875rem", cursor: "pointer",
                    background: editWorkflowStage === "completed" ? "#16a34a" : "transparent",
                    color: editWorkflowStage === "completed" ? "white" : "#475569",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.35rem"
                  }}
                >
                  <CheckCircle2 size={14} /> 2. Completed (Done &amp; Delivered)
                </button>
              </div>

              {editWorkflowStage === "completed" ? (
                <div style={{
                  background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.85rem 1rem",
                  borderRadius: "8px", marginBottom: "1rem", color: "#166534", fontSize: "0.85rem"
                }}>
                  <strong>✓ Moving to Completed Section:</strong> Saving this form will record the service as completed, eligible for Invoice download, and move the booking to the <strong>Completed</strong> tab.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                      Ongoing Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", fontWeight: 600 }}
                    >
                      <option value="in_progress">In Progress (Active Work)</option>
                      <option value="scheduled">Scheduled / Pending</option>
                      <option value="rework">Rework Required</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                      Assigned Technician
                    </label>
                    <select
                      value={editTechId}
                      onChange={(e) => setEditTechId(e.target.value ? Number(e.target.value) : "")}
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
                </div>
              )}

              {/* Diagnosis and Work Performed */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Confirmed Issue After Inspection
                </label>
                <input
                  type="text"
                  value={editConfirmedIssue}
                  onChange={(e) => setEditConfirmedIssue(e.target.value)}
                  placeholder="e.g. Broken touch digitizer, IC re-soldering needed"
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Work Performed
                  </label>
                  <input
                    type="text"
                    value={editWorkPerformed}
                    onChange={(e) => setEditWorkPerformed(e.target.value)}
                    placeholder="e.g. Display module replaced & sealed"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Parts / Products Used
                  </label>
                  <input
                    type="text"
                    value={editPartsUsed}
                    onChange={(e) => setEditPartsUsed(e.target.value)}
                    placeholder="e.g. iPhone OLED Display Part #AP-SCR-15"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              {/* Pricing & Vendor Details (Single Customer Price, No separate service charge) */}
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#1e293b", marginBottom: "0.65rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Distributor / Vendor &amp; Customer Pricing</span>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>
                    Single Price for Customer • Vendor details internal only
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.2rem" }}>
                      Product / Part Name
                    </label>
                    <input
                      type="text"
                      value={editPartName}
                      onChange={(e) => setEditPartName(e.target.value)}
                      placeholder="e.g. iPhone OLED Display (OEM)"
                      style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                      <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>
                        Distributor / Vendor Purchased From
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddVendor(!showAddVendor)}
                        style={{
                          background: "none", border: "none", color: "#4f46e5", fontSize: "0.72rem",
                          fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "2px"
                        }}
                      >
                        <Plus size={12} /> {showAddVendor ? "Cancel" : "+ Add Vendor"}
                      </button>
                    </div>

                    {showAddVendor ? (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <input
                          type="text"
                          value={newVendorInput}
                          onChange={(e) => setNewVendorInput(e.target.value)}
                          placeholder="New Vendor Name"
                          style={{ flex: 1, padding: "0.4rem", borderRadius: "6px", border: "1px solid #818cf8", fontSize: "0.78rem" }}
                        />
                        <button
                          type="button"
                          onClick={handleAddVendor}
                          disabled={addingVendor}
                          style={{
                            padding: "0.4rem 0.65rem", background: "#4f46e5", color: "white",
                            border: "none", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer"
                          }}
                        >
                          {addingVendor ? "..." : "Save"}
                        </button>
                      </div>
                    ) : (
                      <select
                        value={editVendorName}
                        onChange={(e) => setEditVendorName(e.target.value)}
                        style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
                      >
                        <option value="">Select Vendor / Distributor</option>
                        {vendors.map((v) => (
                          <option key={v.id} value={v.name}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.2rem" }}>
                      Vendor Purchase Price / Cost (₹) <span style={{ color: "#94a3b8", fontWeight: 400 }}>[Internal]</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={editVendorCost}
                      onChange={(e) => setEditVendorCost(Number(e.target.value))}
                      placeholder="e.g. 1500"
                      style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.2rem" }}>
                      Total Price for Customer (₹) <span style={{ color: "#16a34a", fontWeight: 700 }}>* Single Price</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={editCustomerPrice}
                      onChange={(e) => setEditCustomerPrice(Number(e.target.value))}
                      placeholder="e.g. 2800"
                      style={{ width: "100%", padding: "0.45rem", borderRadius: "6px", border: "2px solid #4f46e5", fontWeight: 700, fontSize: "0.95rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Total Customer Charge: <strong style={{ color: "#0f172a", fontSize: "1rem" }}>₹{Number(editCustomerPrice).toLocaleString()}</strong>
                  </span>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "#166534", fontWeight: 700, background: "#f0fdf4", padding: "2px 8px", borderRadius: "4px", border: "1px solid #bbf7d0" }}>
                      Internal Margin: ₹{Math.max(0, Number(editCustomerPrice) - Number(editVendorCost)).toLocaleString()} [Internal Only]
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Testing results, customer feedback, parts order notes..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  style={{ padding: "0.6rem 1.25rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "6px", border: "none",
                    background: editWorkflowStage === "completed" ? "#166534" : "#1e1b4b",
                    color: "white", cursor: "pointer", fontWeight: 700
                  }}
                >
                  {editWorkflowStage === "completed" ? "Save & Move to Completed" : "Save Changes to Database"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── REWORK REOPEN MODAL ─────────────────────────────────────────────────── */}
      {reworkBooking && (
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
                  Reopen Job for Rework
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Booking #{reworkBooking.order_number} — {reworkBooking.customer_name}
                </p>
              </div>
              <button
                onClick={() => setReworkBooking(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmRework} style={{ padding: "1.5rem" }}>
              <p style={{ fontSize: "0.84rem", color: "#475569", lineHeight: 1.5, marginTop: 0 }}>
                Reopening a job for rework places it back into the <strong>Ongoing Repairs</strong> queue with status &ldquo;Rework Required&rdquo;. Please record the customer findings:
              </p>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Rework Reason &amp; Findings <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={reworkReasonText}
                  onChange={(e) => setReworkReasonText(e.target.value)}
                  placeholder="e.g. Original touch problem recurring; screen ghosting; customer requested warranty inspection..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setReworkBooking(null)}
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
                  Confirm &amp; Move to Ongoing Rework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── INVOICE GENERATION MODAL ────────────────────────────────────────────── */}
      {invoiceBooking && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem"
        }}>
          <div style={{
            background: "white", borderRadius: "12px", width: "100%", maxWidth: "600px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", overflow: "hidden"
          }}>
            <div style={{
              background: "#166534", color: "white", padding: "1.25rem 1.5rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700 }}>
                  Generate Tax Invoice
                </h3>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", opacity: 0.9 }}>
                  Booking #{invoiceBooking.order_number} → PDF Generation &amp; Database Record
                </p>
              </div>
              <button
                onClick={() => setInvoiceBooking(null)}
                style={{ background: "transparent", border: "none", color: "white", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateInvoice} style={{ padding: "1.5rem" }}>
              <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.8125rem" }}>
                  <div><strong>Customer:</strong> {invoiceBooking.customer_name}</div>
                  <div><strong>Phone:</strong> {invoiceBooking.customer_phone}</div>
                  <div><strong>Device:</strong> {invoiceBooking.device_model_text}</div>
                  <div><strong>Technician:</strong> {invoiceBooking.assigned_technician_name}</div>
                  <div><strong>Product Price:</strong> ₹{invoiceBooking.product_price.toLocaleString()}</div>
                  <div><strong>Service Charges:</strong> ₹{invoiceBooking.service_charges.toLocaleString()}</div>
                </div>
                <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #e2e8f0", fontSize: "0.95rem" }}>
                  <strong>Final Payable: ₹{invoiceBooking.total_customer_charge.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    Payment Status
                  </label>
                  <select
                    value={invoicePaymentStatus}
                    onChange={(e) => setInvoicePaymentStatus(e.target.value)}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
                  >
                    <option value="paid">Paid (Full Payment Received)</option>
                    <option value="pending">Pending Payment</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                    GST / Tax Rate (%)
                  </label>
                  <select
                    value={invoiceTaxRate}
                    onChange={(e) => setInvoiceTaxRate(Number(e.target.value))}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white" }}
                  >
                    <option value="0">0% (Inclusive / None)</option>
                    <option value="18">18% GST</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "0.25rem" }}>
                  Warranty / Invoice Terms
                </label>
                <input
                  type="text"
                  value={invoiceWarranty}
                  onChange={(e) => setInvoiceWarranty(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setInvoiceBooking(null)}
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
                  Confirm &amp; Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
