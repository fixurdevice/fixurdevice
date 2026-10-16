"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CRMIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : null;
    if (token && !token.startsWith("admin-session-")) {
      router.replace("/crm/dashboard");
    } else {
      router.replace("/crm/login");
    }
  }, [router]);

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
        <div style={{ fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
          Checking CRM Session...
        </div>
      </div>
    </div>
  );
}
