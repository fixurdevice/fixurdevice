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
    return "https://fixurdevice-guje.onrender.com";
  }

  // 3. Server-side SSR/SSG build phase
  if (process.env.NODE_ENV === "production") {
    return "https://fixurdevice-guje.onrender.com";
  }

  return "http://localhost:8000";
}

export const API_BASE_URL = getApiUrl();

/**
 * Retrieves valid CRM authentication token from localStorage or cookie.
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("crm_token");
  if (token && !token.startsWith("admin-session-")) {
    return token;
  }
  const match = document.cookie.match(/(?:^|;\s*)crm_token=([^;]+)/);
  if (match && match[1] && !match[1].startsWith("admin-session-")) {
    return match[1];
  }
  return null;
}

/**
 * Returns RequestInit headers object including Authorization: Token <key>
 */
export function getAuthHeaders(extraHeaders?: HeadersInit): Headers {
  const headers = new Headers(extraHeaders || {});
  const token = getAuthToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Token ${token}`);
  }
  return headers;
}

let redirectingToLogin = false;

/**
 * Authenticated fetch wrapper for FixUrDevice CRM.
 * Automatically injects the Authorization: Token header and redirects to /crm/login
 * if the backend responds with 401 Unauthorized or 403 Forbidden.
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = getAuthHeaders(init?.headers);

  const response = await fetch(input, {
    ...init,
    headers,
  });

  // If session expired or unauthenticated
  if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
    const isCrmRoute = window.location.pathname.startsWith("/crm");
    const isLoginPage = window.location.pathname === "/crm/login";
    if (isCrmRoute && !isLoginPage && !redirectingToLogin) {
      redirectingToLogin = true;
      localStorage.removeItem("crm_token");
      localStorage.removeItem("crm_user");
      document.cookie = "crm_token=; path=/; max-age=0";
      window.location.href = `/crm/login?reason=session_expired`;
    }
  }

  return response;
}
