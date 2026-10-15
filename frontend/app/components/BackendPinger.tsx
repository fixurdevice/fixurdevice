"use client";
import { useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Lightweight client-side pinger that warms up the Render backend
 * as soon as any user loads the website.
 */
export default function BackendPinger() {
  useEffect(() => {
    // Non-blocking ping to wake up free-tier backend if it is asleep
    try {
      fetch(`${API_BASE}/healthz/`, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
      }).catch(() => {
        // Silent fail — no user disruption
      });
    } catch (e) {
      // Ignore
    }
  }, []);

  return null;
}
