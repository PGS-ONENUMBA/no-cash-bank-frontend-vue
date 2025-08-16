// src/services/fetchVendors.js

/**
 * Fetch Vendors service — uses the Context Proxy (cookie + CSRF) so **no Basic
 * credentials are ever shipped to the browser**. The proxy accepts a POST from
 * the app and forwards GET/POST upstream as required (server-side).
 *
 * Requirements:
 * - `@/services/http` must export an Axios instance named `api` configured with:
 *   - baseURL = import.meta.env.VITE_API_BASE_URL (e.g., https://backend.example.com/wp-json)
 *   - withCredentials: true
 *   - request interceptor that:
 *       • skips `/context-proxy/v1/csrf`
 *       • ensures a CSRF token exists (via a raw axios call to `/context-proxy/v1/csrf`)
 *       • attaches header: `x-csrf-token: <token>` to `/context-proxy/v1/*`
 *   - response interceptor that retries once on 401 by refreshing CSRF
 */

import { api } from "@/services/http";

/**
 * @typedef {Object} Vendor
 * @property {string|number} vendor_id  - Unique identifier
 * @property {string}        vendor_name - Display name (fallbacks applied)
 */

/**
 * Internal config for retries and paths.
 * @type {{ TIMEOUT_MS:number, MAX_RETRIES:number, RETRY_DELAY_MS:number, PROXY_PATH:string }}
 */
const CONFIG = {
  TIMEOUT_MS: 8000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  // We always POST to the proxy; the proxy decides GET vs POST upstream.
  PROXY_PATH: "/context-proxy/v1/action",
};

/**
 * Sleep utility for retry delay.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Perform an Axios request with retry logic for network/5xx errors.
 * 4xx errors are not retried.
 *
 * @template T
 * @param {import('axios').AxiosRequestConfig} config - Axios request configuration.
 * @param {number} [retryCount=0] - Current retry attempt.
 * @returns {Promise<import('axios').AxiosResponse<T>>}
 */
const makeRequestWithRetry = async (config, retryCount = 0) => {
  try {
    return await api.request(config);
  } catch (error) {
    const status = error?.response?.status;
    // Do not retry on client errors
    if (typeof status === "number" && status >= 400 && status < 500) {
      throw error;
    }
    // Retry for network/5xx up to MAX_RETRIES
    if (retryCount < CONFIG.MAX_RETRIES) {

      console.log(`🔄 Retry attempt ${retryCount + 1} of ${CONFIG.MAX_RETRIES}...`);
      await sleep(CONFIG.RETRY_DELAY_MS);
      return makeRequestWithRetry(config, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Normalize a raw vendor object returned by the upstream into our `Vendor` shape.
 * Applies sensible fallbacks for differing API field names.
 *
 * @param {Record<string, any>} v - Raw vendor object from backend.
 * @returns {Vendor}
 */
const mapVendor = (v) => ({
  vendor_id: v?.ID ?? v?.vendor_id ?? v?.id ?? "",
  vendor_name: v?.vendor_name || v?.display_name || "Unnamed Vendor",
});

/**
 * Fetch the list of vendors through the Context Proxy.
 *
 * Server contract:
 * - Endpoint: POST `/context-proxy/v1/action`
 * - Body: `{ "action_type": "get_vendors" }`
 * - Proxy response shape: `{ ok: boolean, status: number, data: { success: boolean, vendors?: Array } }`
 *
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] - Optional abort signal to cancel the request.
 * @returns {Promise<Vendor[]>} Array of normalized vendors (empty array on error).
 */
export const fetchVendors = async (options = {}) => {
  try {

    console.log("🚀 Fetching vendors...");

    const res = await makeRequestWithRetry({
      method: "POST", // Always POST to proxy (proxy will forward GET upstream for read-only actions)
      url: CONFIG.PROXY_PATH,
      timeout: CONFIG.TIMEOUT_MS,
      data: { action_type: "get_vendors" },
      signal: options.signal,
    });

    // Proxy normalizes responses under `data`; upstream payload is inside `.data`
    const payload = res?.data?.data ?? res?.data;

    if (payload?.success && Array.isArray(payload?.vendors)) {
      const vendors = payload.vendors.map(mapVendor);

      console.log("✅ Vendors fetched successfully:", vendors);
      return vendors;
    }


    console.warn("⚠ No vendors found or invalid response format");
    return [];
  } catch (error) {

    console.error("❌ Error fetching vendors:", {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });
    return [];
  }
};

export default fetchVendors;
