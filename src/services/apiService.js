// src/services/apiService.js

/**
 * Central API service.
 *
 * - All browser calls that previously hit `/nocash-bank/v1/action` MUST go through
 *   the server-side Context Proxy: POST `/context-proxy/v1/action` with cookie+CSRF.
 *   (No Basic credentials in the browser.)
 *
 * - JWT-protected endpoints (e.g., /jwt-auth/v1/token/validate, or your user APIs)
 *   use Bearer tokens from Pinia's `useAuthStore`.
 *
 * Prereqs:
 * - `@/services/http` exports an Axios instance named `api` that:
 *   • has baseURL = import.meta.env.VITE_API_BASE_URL (https://backend.site/wp-json)
 *   • sets withCredentials: true
 *   • request interceptor attaches `x-csrf-token` ONLY for `/context-proxy/v1/*`
 *     (it should auto-fetch CSRF via `/context-proxy/v1/csrf` when missing)
 *   • response interceptor retries once on 401 by refreshing CSRF
 *
 * Env:
 *   VITE_API_BASE_URL=https://backend.paybychance.com/wp-json
 *
 * ⚠️ Remove any use of VITE_APP_USER_NAME / VITE_APP_USER_PASSWORD in the frontend.
 */

import { api } from "@/services/http";
import { useAuthStore } from "@/stores/authStore";

/** Default timeouts (override per-call if needed) */
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Call the server-side Context Proxy action endpoint.
 *
 * Always **POST** from the browser; the proxy will forward GET/POST upstream
 * depending on the action (e.g., any `get_*` is forwarded as GET).
 *
 * @template T
 * @param {string} action_type - The upstream action name (e.g., "get_raffle_cycle").
 * @param {object} [params={}] - Additional parameters for the action.
 * @param {{timeout?: number}} [opts]
 * @returns {Promise<T>} - Returns the upstream payload (`res.data.data ?? res.data`).
 */
export async function proxyAction(action_type, params = {}, opts = {}) {
  const timeout = opts.timeout ?? DEFAULT_TIMEOUT_MS;
  const res = await api.post(
    "/context-proxy/v1/action",
    { action_type, ...params },
    { timeout }
  );
  // Proxy shape: { ok, status, data: { ...upstream... } }
  return res?.data?.data ?? res?.data;
}

/**
 * Build Authorization header for JWT-protected endpoints.
 * Throws if the user is not authenticated.
 *
 * @returns {{ Authorization: string }}
 */
function bearerHeader() {
  const auth = useAuthStore?.();
  if (!auth?.token) {
    throw new Error("Missing authentication token");
  }
  return { Authorization: `Bearer ${auth.token}` };
}

/**
 * GET helper for JWT-protected endpoints (non-proxy).
 *
 * @template T
 * @param {string} endpoint - e.g., "/wp/v2/users/me" (relative to VITE_API_BASE_URL)
 * @param {object} [params] - Query params
 * @param {{timeout?: number}} [opts]
 * @returns {Promise<T>}
 */
export async function jwtGet(endpoint, params = {}, opts = {}) {
  const timeout = opts.timeout ?? DEFAULT_TIMEOUT_MS;
  const res = await api.get(endpoint, {
    params,
    headers: bearerHeader(),
    timeout,
  });
  return res.data;
}

/**
 * POST helper for JWT-protected endpoints (non-proxy).
 *
 * @template T
 * @param {string} endpoint - e.g., "/my-namespace/v1/secure-op"
 * @param {any} body
 * @param {{timeout?: number}} [opts]
 * @returns {Promise<T>}
 */
export async function jwtPost(endpoint, body, opts = {}) {
  const timeout = opts.timeout ?? DEFAULT_TIMEOUT_MS;
  const res = await api.post(endpoint, body, {
    headers: bearerHeader(),
    timeout,
  });
  return res.data;
}

/**
 * Optional: validate the JWT token (cheap check you can call before protected flows).
 * Mirrors WordPress JWT plugin validation endpoint.
 *
 * @returns {Promise<boolean>}
 */
export async function validateJwt() {
  try {
    const res = await api.post(
      "/jwt-auth/v1/token/validate",
      {},
      { headers: bearerHeader() }
    );
    return !!res?.data?.success;
  } catch {
    return false;
  }
}

export { api }; // re-export the configured Axios instance for advanced use
export default api;
