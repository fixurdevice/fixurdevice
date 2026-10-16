"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Wrench,
  FileText,
  CreditCard,
  Truck,
  MessageSquare,
  BarChart2,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Activity,
  Shield,
  ChevronRight,
  XCircle,
  PhoneCall,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/crm/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Order Pipeline",
    items: [
      { label: "1. Enquiries", href: "/crm/leads", icon: Users },
      { label: "2. Bookings", href: "/crm/repairs", icon: Wrench },
      { label: "3. Call Back Later", href: "/crm/callbacks", icon: PhoneCall },
      { label: "4. Not Interested", href: "/crm/rejected", icon: XCircle },
      { label: "5. Invoices", href: "/crm/invoices", icon: FileText },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Customers Directory", href: "/crm/customers", icon: Users },
    ],
  },
  {
    label: "Reports",
    items: [
      { label: "Reports & Analytics", href: "/crm/reports", icon: BarChart2 },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Staff Users", href: "/crm/users", icon: Users },
      { label: "Technicians", href: "/crm/technicians", icon: Wrench },
      { label: "Settings", href: "/crm/settings", icon: Settings },
    ],
  },
];

function CRMLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuth, setIsAuth] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("crm_token");
      return Boolean(token && !token.startsWith("admin-session-"));
    }
    return true;
  });
  const [userProfile, setUserProfile] = useState<{ full_name: string; email: string; role: string } | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("crm_user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {}
      }
    }
    return { full_name: "Super Admin", email: "admin@fixurdevice.in", role: "admin" };
  });
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If on login page, skip authentication check
    if (pathname === "/crm/login") {
      return;
    }

    // Check token in localStorage or cookie
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("crm_token");
      if (!token || token.startsWith("admin-session-")) {
        setIsAuth(false);
        localStorage.removeItem("crm_token");
        localStorage.removeItem("crm_user");
        router.replace("/crm/login");
      } else {
        setIsAuth(true);
        const storedUser = localStorage.getItem("crm_user");
        if (storedUser) {
          try {
            setUserProfile(JSON.parse(storedUser));
          } catch (e) {
            setUserProfile({ full_name: "Super Admin", email: "admin@fixurdevice.in", role: "admin" });
          }
        }
      }
    }
  }, [pathname, router]);

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.removeItem("crm_token");
      localStorage.removeItem("crm_user");
      document.cookie = "crm_token=; path=/; max-age=0";
      window.location.href = "/crm/login";
    }
  };

  // If on login page, render children directly without CRM layout shell
  if (pathname === "/crm/login") {
    return <>{children}</>;
  }

  // Authentication Guard Loader (only when unauthenticated)
  if (!isAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "white",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              border: "3px solid rgba(108, 63, 255, 0.2)",
              borderTopColor: "var(--brand-purple)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1.25rem",
            }}
          />
          <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "white", marginBottom: "0.25rem" }}>
            FixUrDevice CRM
          </div>
          <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
            Verifying Admin Session...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            zIndex: 199,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Single Unified Sidebar (Desktop Fixed, Mobile Drawer) */}
      <aside
        className={`crm-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
        style={{
          width: 260,
          height: "100vh",
          position: "sticky",
          top: 0,
          flexShrink: 0,
          background: "#0f172a",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          zIndex: 200,
          overflowY: "auto",
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "1.25rem 1.25rem 1rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(108, 63, 255, 0.35)",
                padding: "2px",
                overflow: "hidden",
              }}
            >
              <Image
                src="/levlox_logo.png"
                alt="FixUrDevice Logo"
                width={32}
                height={32}
                style={{ width: "32px", height: "32px", objectFit: "contain" }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: "white", fontSize: "0.95rem", lineHeight: 1.1 }}>
                FixUrDevice
              </div>
              <div style={{ fontSize: "0.625rem", color: "#a78bfa", fontWeight: 700, letterSpacing: "0.05em" }}>
                CRM PORTAL
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="mobile-close-btn"
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              padding: "0.25rem",
            }}
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav style={{ padding: "0.75rem 0", flex: 1 }}>
          {navGroups.map((group) => (
            <div key={group.label} style={{ marginBottom: "0.5rem" }}>
              <div
                style={{
                  padding: "0.35rem 1.25rem",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  marginTop: "0.5rem",
                }}
              >
                {group.label}
              </div>
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/crm/dashboard" && pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`crm-sidebar-link ${active ? "active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.625rem 1.25rem",
                      fontSize: "0.875rem",
                      fontWeight: active ? 700 : 500,
                      color: active ? "white" : "rgba(255,255,255,0.7)",
                      background: active ? "rgba(108, 63, 255, 0.25)" : "transparent",
                      borderLeft: active ? "3px solid var(--brand-purple)" : "3px solid transparent",
                      textDecoration: "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <item.icon size={17} color={active ? "#a78bfa" : "rgba(255,255,255,0.6)"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom User Profile & Sign Out */}
        <div
          style={{
            padding: "1rem 1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6c3fff 0%, #4f46e5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: "0.875rem",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(108, 63, 255, 0.4)",
              }}
            >
              {(userProfile?.full_name || "Admin")[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userProfile?.full_name || "Super Admin"}
              </div>
              <div style={{ color: "#38bdf8", fontSize: "0.7rem", fontWeight: 600 }}>
                {userProfile?.role === "admin" ? "Super Administrator" : "Staff"}
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            id="crm-sign-out-btn"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.5rem 0.75rem",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              color: "#fca5a5",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top Header Bar */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid var(--border-color)",
            padding: "0 1.5rem",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="crm-mobile-menu-btn"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--brand-navy)",
                padding: "0.25rem",
                display: "none",
              }}
              aria-label="Open CRM Menu"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--gray-500)" }}>
              <span style={{ color: "var(--brand-navy)", fontWeight: 700 }}>CRM</span>
              <ChevronRight size={14} />
              <span style={{ textTransform: "capitalize", color: "var(--brand-purple)", fontWeight: 600 }}>
                {pathname.replace("/crm/", "").replace("/", " - ") || "Dashboard"}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Quick Search */}
            <div style={{ position: "relative" }} className="crm-search-box">
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--gray-400)",
                }}
              />
              <input
                type="text"
                placeholder="Search leads, repairs, IMEI..."
                style={{
                  padding: "0.45rem 0.875rem 0.45rem 2.25rem",
                  border: "1.5px solid var(--border-color)",
                  borderRadius: "var(--border-radius-full)",
                  fontSize: "0.8125rem",
                  width: 230,
                  outline: "none",
                  color: "var(--brand-navy)",
                }}
              />
            </div>

            {/* Notification Bell */}
            <button
              style={{
                position: "relative",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--gray-600)",
                padding: "0.4rem",
              }}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--error)",
                  border: "2px solid white",
                }}
              />
            </button>

            {/* Active User Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.35rem 0.85rem",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                borderRadius: "var(--border-radius-full)",
                fontSize: "0.78rem",
              }}
            >
              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                👤 {userProfile?.full_name || "Super Admin"}
              </span>
              <span
                style={{
                  background: userProfile?.role === "admin" ? "#fee2e2" : "#e0e7ff",
                  color: userProfile?.role === "admin" ? "#991b1b" : "#4338ca",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "12px",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  textTransform: "capitalize",
                }}
              >
                {userProfile?.role === "admin" ? "Super Admin" : userProfile?.role?.replace("_", " ") || "Staff"}
              </span>
            </div>
          </div>
        </header>

        {/* CRM Body */}
        <main style={{ flex: 1, padding: "1.5rem", overflowX: "hidden" }}>
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "50vh",
                  color: "var(--gray-500)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    border: "3px solid rgba(108,63,255,0.2)",
                    borderTopColor: "var(--brand-purple)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>

      {/* Responsive styles */}
      <style jsx global>{`
        @media (max-width: 1023px) {
          .crm-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: -280px !important;
            transition: left 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
            box-shadow: 10px 0 30px rgba(0, 0, 0, 0.4) !important;
          }
          .crm-sidebar.sidebar-open {
            left: 0 !important;
          }
          .crm-mobile-menu-btn {
            display: flex !important;
          }
          .crm-search-box {
            display: none !important;
          }
        }
        @media (min-width: 1024px) {
          .mobile-close-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#090d16",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: "0.875rem",
          }}
        >
          Loading CRM...
        </div>
      }
    >
      <CRMLayoutInner>{children}</CRMLayoutInner>
    </Suspense>
  );
}
