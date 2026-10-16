"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApiUrl, authFetch } from "../../lib/api";
import {
  Users,
  UserPlus,
  Shield,
  Search,
  RefreshCw,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  UserCheck,
  UserX,
  BadgeCheck,
} from "lucide-react";

interface StaffUser {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  date_joined?: string;
}

const roleConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  admin: { label: "Super Admin", bg: "#fef2f2", color: "#991b1b", border: "#fecaca" },
  crm_executive: { label: "CRM Executive / Support", bg: "#ede9fe", color: "#5b21b6", border: "#ddd6fe" },
  technician: { label: "Technician / Repair Engineer", bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" },
  pickup_executive: { label: "Pickup / Delivery", bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  finance: { label: "Finance / Accounts", bg: "#dcfce7", color: "#166534", border: "#bbf7d0" },
  manager: { label: "Read-only Manager", bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" },
};

export default function UsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Current logged in user from localStorage
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("crm_executive");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${apiUrl}/api/v1/auth/users/`);
      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data) ? data : data.results || [];
        setUsers(results);
      } else {
        showNotification("Failed to load staff users list.", true);
      }
    } catch (err: any) {
      showNotification("Database connection error: " + err.message, true);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      showNotification("Please provide full name and email.", true);
      return;
    }
    if (!password.trim()) {
      showNotification("Please provide a password for this user.", true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await authFetch(`${apiUrl}/api/v1/auth/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role: role,
          password: password.trim(),
          is_active: true,
        }),
      });

      if (res.ok) {
        showNotification(`Staff user "${fullName}" successfully created! They can now log in.`);
        setShowAddModal(false);
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setRole("crm_executive");
        loadUsers();
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.email?.[0] || errData.detail || "Failed to create user. Please check inputs.";
        showNotification(msg, true);
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: StaffUser) => {
    if (user.email === "admin@fixurdevice.in") {
      showNotification("Super Admin cannot be deactivated.", true);
      return;
    }

    try {
      const res = await authFetch(`${apiUrl}/api/v1/auth/users/${user.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      if (res.ok) {
        showNotification(`User ${user.full_name} is now ${!user.is_active ? "Active" : "Deactivated"}.`);
        loadUsers();
      } else {
        showNotification("Failed to update user status.", true);
      }
    } catch (err: any) {
      showNotification("Error: " + err.message, true);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.full_name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.phone?.includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div style={{ padding: "1.5rem", maxWidth: "1500px", margin: "0 auto" }}>
      {/* Toast Notifications */}
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={26} color="#4f46e5" /> Staff & User Management
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0.25rem 0 0" }}>
            Super Admin access: Manage CRM executive, technician, manager & staff accounts. Handled leads will display the staff member&apos;s name.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={loadUsers}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 0.9rem",
              background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px",
              fontSize: "0.875rem", fontWeight: 600, color: "#475569", cursor: "pointer"
            }}
          >
            <RefreshCw size={15} /> Refresh
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1.1rem",
              background: "#4f46e5", color: "#ffffff", border: "none", borderRadius: "6px",
              fontSize: "0.875rem", fontWeight: 700, cursor: "pointer",
              boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)"
            }}
          >
            <UserPlus size={16} /> + Add New Staff User
          </button>
        </div>
      </div>

      {/* Admin Notice Banner */}
      <div style={{
        background: "#e0e7ff", border: "1px solid #c7d2fe", borderRadius: "8px",
        padding: "0.85rem 1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Shield size={20} color="#3730a3" />
          <div>
            <div style={{ fontWeight: 700, color: "#1e1b4b", fontSize: "0.875rem" }}>
              Logged in as: <span style={{ color: "#4338ca" }}>{currentUser?.full_name || "Super Admin"}</span> ({currentUser?.role || "admin"})
            </div>
            <div style={{ fontSize: "0.75rem", color: "#3730a3" }}>
              Only the Super Admin can create additional staff users. Leads handled by any staff member will record their exact name in the CRM.
            </div>
          </div>
        </div>
        <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#312e81", background: "#ffffff", padding: "0.25rem 0.6rem", borderRadius: "6px", border: "1px solid #c7d2fe" }}>
          Total Staff: {users.length}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px",
        padding: "1rem", marginBottom: "1.5rem", display: "flex", gap: "1rem",
        alignItems: "center", flexWrap: "wrap"
      }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name, email, or phone..."
            style={{
              width: "100%", padding: "0.55rem 0.75rem 0.55rem 2.2rem",
              borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.875rem"
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#475569" }}>Role:</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: "0.55rem 0.75rem", borderRadius: "6px",
              border: "1px solid #cbd5e1", fontSize: "0.875rem", color: "#1e293b", background: "#ffffff"
            }}
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="admin">Super Admin</option>
            <option value="crm_executive">CRM Executive</option>
            <option value="technician">Technician</option>
            <option value="pickup_executive">Pickup / Delivery</option>
            <option value="finance">Finance</option>
            <option value="manager">Manager</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Staff Name</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Role</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Contact Email & Phone</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Status</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569" }}>Joined Date</th>
                <th style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#475569", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    <RefreshCw className="animate-spin" size={24} style={{ margin: "0 auto 0.5rem" }} />
                    Loading staff users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
                    <Users size={32} style={{ margin: "0 auto 0.5rem", color: "#94a3b8" }} />
                    <div style={{ fontWeight: 600, fontSize: "1rem", color: "#334155" }}>No staff members found</div>
                    <p style={{ margin: "0.25rem 0", fontSize: "0.8125rem" }}>
                      Click &ldquo;+ Add New Staff User&rdquo; above to create accounts for your CRM executives or technicians.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleStyle = roleConfig[user.role] || {
                    label: user.role, bg: "#f1f5f9", color: "#475569", border: "#cbd5e1"
                  };
                  const dateStr = user.date_joined
                    ? new Date(user.date_joined).toLocaleDateString("en-IN", { dateStyle: "medium" })
                    : "—";

                  return (
                    <tr
                      key={user.id}
                      style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      {/* Name */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            background: user.role === "admin" ? "#fee2e2" : "#e0e7ff",
                            color: user.role === "admin" ? "#991b1b" : "#4338ca",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 800, fontSize: "0.85rem"
                          }}>
                            {user.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: "#0f172a" }}>
                              {user.full_name}
                              {user.email === "admin@fixurdevice.in" && (
                                <span style={{ marginLeft: "6px", fontSize: "0.7rem", color: "#991b1b", background: "#fee2e2", padding: "1px 6px", borderRadius: "8px", fontWeight: 800 }}>
                                  Primary
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: #{user.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                        <span style={{
                          display: "inline-block", fontSize: "0.75rem", padding: "0.25rem 0.65rem",
                          borderRadius: "12px", fontWeight: 700,
                          background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`
                        }}>
                          {roleStyle.label}
                        </span>
                      </td>

                      {/* Contact Email & Phone */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                        <div style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Mail size={13} color="#64748b" /> {user.email}
                        </div>
                        {user.phone && (
                          <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "2px", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <Phone size={11} color="#64748b" /> {user.phone}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "0.3rem",
                          fontSize: "0.75rem", padding: "0.2rem 0.55rem", borderRadius: "10px",
                          fontWeight: 700,
                          background: user.is_active ? "#dcfce7" : "#fee2e2",
                          color: user.is_active ? "#166534" : "#991b1b",
                          border: `1px solid ${user.is_active ? "#bbf7d0" : "#fecaca"}`
                        }}>
                          {user.is_active ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {user.is_active ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      {/* Date Joined */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", color: "#64748b", fontSize: "0.8125rem" }}>
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "0.85rem 1rem", verticalAlign: "middle", textAlign: "right" }}>
                        {user.email !== "admin@fixurdevice.in" ? (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            style={{
                              padding: "0.35rem 0.75rem", borderRadius: "6px",
                              border: user.is_active ? "1px solid #cbd5e1" : "1px solid #86efac",
                              background: user.is_active ? "#ffffff" : "#f0fdf4",
                              color: user.is_active ? "#64748b" : "#166534",
                              fontSize: "0.75rem", fontWeight: 700, cursor: "pointer",
                              display: "inline-flex", alignItems: "center", gap: "0.3rem"
                            }}
                          >
                            {user.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                            {user.is_active ? "Deactivate" : "Activate"}
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 600 }}>Super Admin</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          padding: "1rem"
        }}>
          <div style={{
            background: "#ffffff", borderRadius: "12px", width: "100%", maxWidth: "520px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)", overflow: "hidden"
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "1.25rem 1.5rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <UserPlus size={20} color="#4f46e5" /> Create New Staff User
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                  Super Admin creation: User can log in with their email and password.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateUser} style={{ padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Babu / Priya Sundaram"
                  style={{
                    width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px",
                    border: "1px solid #cbd5e1", fontSize: "0.875rem"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Email (User ID) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@fixurdevice.in"
                    style={{
                      width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px",
                      border: "1px solid #cbd5e1", fontSize: "0.875rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9845012345"
                    style={{
                      width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px",
                      border: "1px solid #cbd5e1", fontSize: "0.875rem"
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Assigned Staff Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px",
                    border: "1px solid #cbd5e1", fontSize: "0.875rem", background: "#ffffff"
                  }}
                >
                  <option value="crm_executive">CRM Executive / Customer Support</option>
                  <option value="technician">Technician / Repair Engineer</option>
                  <option value="pickup_executive">Pickup / Delivery Executive</option>
                  <option value="finance">Finance / Accounts</option>
                  <option value="manager">Read-only Manager</option>
                  <option value="admin">Administrator (Super Admin)</option>
                </select>
                <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#64748b" }}>
                  Leads handled by this user will automatically record: <b>Handled by: {fullName || "User Name"}</b>
                </p>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
                  Login Password *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set staff login password"
                    style={{
                      width: "100%", padding: "0.6rem 0.75rem", borderRadius: "6px",
                      border: "1px solid #cbd5e1", fontSize: "0.875rem"
                    }}
                  />
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "0.72rem", color: "#64748b" }}>
                  Minimum 6 characters. Provide this password to the staff member to log in.
                </p>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: "0.6rem 1rem", borderRadius: "6px", border: "1px solid #cbd5e1",
                    background: "#ffffff", color: "#475569", fontWeight: 600, fontSize: "0.875rem",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "0.6rem 1.25rem", borderRadius: "6px", border: "none",
                    background: "#4f46e5", color: "#ffffff", fontWeight: 700, fontSize: "0.875rem",
                    cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
                    display: "flex", alignItems: "center", gap: "0.4rem"
                  }}
                >
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
