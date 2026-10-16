/**
 * FixUrDevice Centralized API Configuration & Client Helper
 * Dynamically resolves the backend API endpoint to prevent ERR_CONNECTION_REFUSED
 * in production environments.
 */

export function getApiUrl(): string {
  // 1. Explicit environment variable takes highest priority
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.trim().replace(/\/+$/, "");
  }

  // 2. Client-side browser inspection
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Local development: browser running on developer machine
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8000";
    }
    // Production deployments (e.g. fixurdevice.in, vercel.app, etc.)
    return "https://fixurdevice-ga9v.onrender.com";
  }

  // 3. Server-side SSR/SSG build phase
  if (process.env.NODE_ENV === "production") {
    return "https://fixurdevice-ga9v.onrender.com";
  }

  return "http://localhost:8000";
}

export const API_BASE_URL = getApiUrl();
