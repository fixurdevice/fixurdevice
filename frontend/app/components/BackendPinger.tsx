"use client";
import { useEffect } from "react";
import { getApiUrl } from "../lib/api";

/**
 * Lightweight client-side pinger that warms up the remote Render backend
 * as soon as any user loads the website.
 */
export default function BackendPinger() {
  useEffect(() => {
    const apiUrl = getApiUrl();
    // Only ping remote backend (e.g. Render free-tier sleep); skip local dev to prevent ERR_CONNECTION_REFUSED
    if (!apiUrl || apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
      return;
    }

    try {
      fetch(`${apiUrl}/healthz/`, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
      }).catch(() => {
        // Silent fail — no user disruption
      });
    } catch {
      // Ignore
    }
  }, []);

  return null;
}
