"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getApiUrl, authFetch } from "../../lib/api";
import {
  Wrench,
  User,
  Plus,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Smartphone,
  AlertCircle,
  Activity,
  ArrowRight,
  Shield,
  Search,
  RefreshCw,
  Power
} from "lucide-react";

interface DbTechnician {
  id: number;
  name: string;
  phone: string;
  email: string;
  is_active: boolean;
  active_jobs_count: number;
}

const API_BASE = getApiUrl();

export default function TechniciansPage() {
  const [techList, setTechList] = useState<DbTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTechs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE}/api/v1/repairs/technicians/`);
      if (!res.ok) throw new Error("Failed to load technicians");
      const data = await res.json();
      setTechList(data);
    } catch (err: any) {
      console.error(err);
      setError("Unable to connect to workshop database. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechs();
  }, []);

  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    setSaving(true);
    try {
      const res = await authFetch(`${API_BASE}/api/v1/repairs/technicians/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim(),
          email: newEmail.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to create technician");
      }

      setShowAddModal(false);
      setNewName("");
      setNewPhone("");
      setNewEmail("");
      fetchTechs();
    } catch (err: any) {
      alert("Error adding technician: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = techList.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone.includes(searchQuery) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", color: "var(--brand-navy)" }}>
            Workshop Technicians &amp; Workload
          </h1>
          <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Database-backed workshop technician management and live active repair allocations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={fetchTechs}
            className="btn btn-secondary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary btn-sm"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
          >
            <Plus size={14} /> Add Technician
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div style={{ background: "white", padding: "1rem 1.25rem", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)", marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
          <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search technicians by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "2.25rem", fontSize: "0.85rem" }}
          />
        </div>
        <div style={{ fontSize: "0.82rem", color: "var(--gray-500)", marginLeft: "auto" }}>
          Total Workshop Technicians: <strong>{techList.length}</strong>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "1rem", borderRadius: "var(--border-radius-lg)", color: "#b91c1c", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading && techList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>Loading workshop technicians from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "var(--border-radius-xl)", border: "1px solid var(--border-color)" }}>
          <Wrench size={36} style={{ color: "var(--gray-300)", margin: "0 auto 1rem" }} />
          <p style={{ fontWeight: 700, color: "var(--gray-700)" }}>No technicians found</p>
          <p style={{ color: "var(--gray-400)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Try adjusting your search or add a new technician above.</p>
        </div>
      ) : (
        /* Technicians Grid */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.25rem" }}>
          {filtered.map((tech) => (
            <div
              key={tech.id}
              style={{
                background: "white",
                borderRadius: "var(--border-radius-xl)",
                border: "1px solid var(--border-color)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "1.15rem",
                    }}
                  >
                    {tech.name ? tech.name[0].toUpperCase() : "T"}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--brand-navy)", margin: 0 }}>
                        {tech.name}
                      </h3>
                      <span style={{ fontSize: "0.7rem", background: "#f1f5f9", padding: "0.1rem 0.45rem", borderRadius: "999px", fontWeight: 700, color: "var(--gray-600)" }}>
                        ID #{tech.id}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.25rem" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "999px",
                          background: tech.is_active ? "#dcfce7" : "#fee2e2",
                          color: tech.is_active ? "#15803d" : "#b91c1c",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: tech.is_active ? "#16a34a" : "#dc2626" }}></span>
                        {tech.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase" }}>Active Jobs</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: tech.active_jobs_count > 0 ? "#7c3aed" : "var(--gray-400)" }}>
                    {tech.active_jobs_count}
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div style={{ borderTop: "1px solid var(--gray-100)", borderBottom: "1px solid var(--gray-100)", padding: "0.85rem 0", display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.82rem" }}>
                <a
                  href={`tel:${tech.phone}`}
                  style={{ color: "var(--brand-purple)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.35rem", fontWeight: 600 }}
                >
                  <Phone size={13} /> {tech.phone || "No phone registered"}
                </a>
                <div style={{ color: "var(--gray-500)", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                  <Mail size={13} /> {tech.email}
                </div>
              </div>

              {/* Footer action */}
              <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", color: tech.active_jobs_count > 0 ? "#b45309" : "#15803d", fontWeight: 600 }}>
                  {tech.active_jobs_count > 0 ? `Currently busy with ${tech.active_jobs_count} job(s)` : "Available for assignment"}
                </span>
                <Link
                  href="/crm/repairs"
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: "0.8rem", color: "var(--brand-purple)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                >
                  Manage Bookings <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Tech Modal */}
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
            zIndex: 999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "var(--border-radius-2xl)",
              padding: "2rem",
              width: "100%",
              maxWidth: 460,
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem", color: "var(--brand-navy)" }}>
              Add Workshop Technician
            </h2>
            <p style={{ color: "var(--gray-500)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Registers technician directly in the database for repair assignment and workload tracking.
            </p>

            <form onSubmit={handleAddTech}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="tech-name">Technician Full Name *</label>
                <input
                  id="tech-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="tech-phone">Mobile Number *</label>
                <input
                  id="tech-phone"
                  type="tel"
                  className="form-input"
                  placeholder="10-digit mobile"
                  maxLength={10}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor="tech-email">Work Email (Optional)</label>
                <input
                  id="tech-email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. ramesh@fixurdevice.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Technician"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
