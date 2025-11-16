/**
 * @fileoverview Product Service with retry logic, caching, and Context Proxy.
 * - Uses /context-proxy/v1/proxy so we can explicitly set HTTP method.
 * - Auto-uses GET for read-only actions (get_* / fetch_*).
 * - Provides an active-cycle fallback when IDs are missing.
 */

import { ref } from "vue";
import { api } from "@/services/http"; // axios instance w/ baseURL, withCredentials, CSRF bootstrap

/** @typedef {{ raffle_cycle_id:number, raffle_type_id?:number, winnable_amount:number, ticket_price?:number, price_of_ticket?:number, raffle_status?:number, associated_types?:Array<{raffle_type_id:number,raffle_type:string}> }} RaffleCycle */
/** @typedef {{ vendor_id:number|string, vendor_name?:string, display_name?:string, business_name?:string, phone_number?:string, email?:string }} Vendor */

// ---------------------------
// Global state + config
// ---------------------------

const products = ref(/** @type {RaffleCycle[]} */([]));
const loading = ref(false);
const lastFetchTimestamp = ref(/** @type {number|null} */(null));
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const CONFIG = {
  TIMEOUT_MS: 8000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  // We’ll prefer the generic proxy so we can control HTTP verb:
  PROXY_GENERIC: "/context-proxy/v1/proxy",
};

/** Sleep utility for retry delay */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Make an axios request with retry (network + 5xx only).
 * @param {import('axios').AxiosRequestConfig} config
 * @param {number} [retryCount=0]
 * @returns {Promise<import('axios').AxiosResponse>}
 */
const makeRequestWithRetry = async (config, retryCount = 0) => {
  try {
    return await api.request(config);
  } catch (error) {
    const status = error?.response?.status;
    const retriable = status == null || (status >= 500 && status <= 599);
    if (!retriable) throw error; // don't retry 4xx

    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(`🔄 Retry attempt ${retryCount + 1} of ${CONFIG.MAX_RETRIES}...`);
      await sleep(CONFIG.RETRY_DELAY_MS);
      return makeRequestWithRetry(config, retryCount + 1);
    }
    throw error;
  }
};

/**
 * Helper to call the Context Proxy generic endpoint with the right HTTP verb.
 * If the `action_type` starts with "get_" or "fetch_", we use GET upstream.
 *
 * @template T
 * @param {{action_type:string} & Record<string, any>} body Payload for /wp-json/nocash-bank/v1/action
 * @param {{ signal?: AbortSignal, timeout?: number, methodOverride?: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE' }} [opts]
 * @returns {Promise<T>} Unwrapped payload (handles { ok,status,data } envelope)
 */
async function callProxyAction(body, opts = {}) {
  const isReadOnly = /^(get|fetch)_/i.test(body?.action_type || "");
  const method = opts.methodOverride || (isReadOnly ? "GET" : "POST");

  const res = await makeRequestWithRetry({
    method: "POST", // browser → proxy is always POST
    url: CONFIG.PROXY_GENERIC,
    timeout: opts.timeout ?? CONFIG.TIMEOUT_MS,
    signal: opts.signal,
    data: {
      path: "/wp-json/nocash-bank/v1/action",
      method, // proxy → upstream verb
      body,
    },
  });

  // Unwrap proxy envelope
  return /** @type {T} */ (res.data?.data ?? res.data);
}

/**
 * Clear in-memory cache.
 */
export const clearProductsCache = () => {
  products.value = [];
  lastFetchTimestamp.value = null;
};

/**
 * Fetch a list of raffle cycles (products) with cache + retry.
 * Uses GET upstream via generic proxy.
 *
 * @param {boolean} [forceRefresh=false]
 * @param {{signal?: AbortSignal}} [opts]
 * @returns {Promise<RaffleCycle[]>}
 */
export const fetchProducts = async (forceRefresh = false, opts = {}) => {
  if (
    !forceRefresh &&
    products.value.length > 0 &&
    lastFetchTimestamp.value &&
    Date.now() - lastFetchTimestamp.value < CACHE_DURATION
  ) {
    console.log("🔄 Using cached products data");
    return products.value;
  }

  loading.value = true;
  console.log("🚀 Fetching latest products...");

  try {
    /** @type {{ raffle_cycles?: RaffleCycle[], success?:boolean, message?:string }} */
    const payload = await callProxyAction(
      { action_type: "get_raffle_cycle" }, // keep your upstream action name
      { signal: opts.signal }
    );

    if (Array.isArray(payload?.raffle_cycles)) {
      products.value = payload.raffle_cycles;
      lastFetchTimestamp.value = Date.now();
      console.log("✅ Products fetched successfully");
      return products.value;
    }

    console.warn("⚠ No products found or invalid response format");
    return [];
  } catch (error) {
    console.error("❌ Error fetching products:", {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });
    if (products.value.length > 0) {
      console.log("⚠ Returning last known good state");
      return products.value;
    }
    return [];
  } finally {
    loading.value = false;
  }
};

/**
 * Fetch the current active/open raffle cycle.
 * Server must implement this GET action (or adapt the action name accordingly).
 *
 * @param {{signal?: AbortSignal}} [opts]
 * @returns {Promise<RaffleCycle|null>}
 */
export async function getActiveRaffleCycle(opts = {}) {
  try {
    /** @type {{ raffle_cycle?: RaffleCycle, success?:boolean }} */
    const payload = await callProxyAction(
      { action_type: "get_active_raffle_cycle" },
      { signal: opts.signal }
    );
    return payload?.raffle_cycle ?? null;
  } catch (e) {
    console.error("❌ getActiveRaffleCycle failed:", e);
    return null;
  }
}

/**
 * Fetch a raffle cycle by its ID.
 *
 * @param {number|string} raffleCycleId
 * @param {{signal?: AbortSignal}} [opts]
 * @returns {Promise<{
 *  raffle_cycle_id:number,
 *  winnable_amount:number,
 *  price_of_ticket:number,
 *  status?:number,
 *  associated_types?:Array<{raffle_type_id:number,raffle_type:string}>
 * } | null>}
 */
export const fetchProductById = async (raffleCycleId, opts = {}) => {
  try {
    console.log(`🔍 Fetching product details for Raffle Cycle ID: ${raffleCycleId}`);

    /** @type {{ success?:boolean, raffle_cycle?: RaffleCycle }} */
    const payload = await callProxyAction(
      { action_type: "get_raffle_cycle_by_id", raffle_cycle_id: Number(raffleCycleId) },
      { signal: opts.signal }
    );

    const rc = payload?.raffle_cycle;
    if (rc) {
      return {
        raffle_cycle_id: rc.raffle_cycle_id,
        winnable_amount: Number.parseFloat((rc.winnable_amount ?? 0)),
        price_of_ticket: Number.parseFloat((rc.ticket_price ?? rc.price_of_ticket ?? 0)),
        status: rc.raffle_status,
        associated_types: Array.isArray(rc.associated_types) ? rc.associated_types : [],
      };
    }
    console.warn("⚠ Product not found in the database.");
    return null;
  } catch (error) {
    console.error("❌ Error fetching product by ID:", error);
    return null;
  }
};

/**
 * Validate a raffle cycle and specific type. If IDs are missing, we’ll try
 * to auto-resolve the currently active cycle first.
 *
 * @param {number|string|undefined|null} raffleCycleId
 * @param {number|string|undefined|null} raffleTypeId
 * @param {{signal?: AbortSignal}} [opts]
 * @returns {Promise<{
 *  raffle_cycle_id:number,
 *  winnable_amount:number,
 *  price_of_ticket:number,
 *  status?:number,
 *  raffle_type_id:number,
 *  raffle_type:string
 * } | null>}
 */
export const validateRaffleCycle = async (raffleCycleId, raffleTypeId, opts = {}) => {
  try {
    let cid = raffleCycleId ? Number(raffleCycleId) : undefined;
    let tid = raffleTypeId ? Number(raffleTypeId) : undefined;

    // Fallback to active cycle if params missing
    if (!cid || !tid) {
      const active = await getActiveRaffleCycle({ signal: opts.signal });
      if (!active) {
        console.warn("⚠ Could not resolve an active raffle cycle.");
        return null;
      }
      cid = active.raffle_cycle_id;
      // If active cycle has an associated type list, pick the first by default
      if (!tid && Array.isArray(active.associated_types) && active.associated_types.length > 0) {
        tid = Number(active.associated_types[0].raffle_type_id);
      }
    }

    /** @type {{ success?:boolean, raffle_cycle?: RaffleCycle }} */
    const payload = await callProxyAction(
      { action_type: "get_raffle_cycle_by_id", raffle_cycle_id: Number(cid) },
      { signal: opts.signal }
    );

    const rc = payload?.raffle_cycle;
    if (!rc) {
      console.warn("⚠ Raffle cycle not found.");
      return null;
    }

    const types = Array.isArray(rc.associated_types) ? rc.associated_types : [];
    const selected = types.find((t) => Number(t.raffle_type_id) === Number(tid));

    if (!selected) {
      console.warn("⚠ Raffle cycle validation failed (type mismatch).");
      return null;
    }

    return {
      raffle_cycle_id: rc.raffle_cycle_id,
      winnable_amount: Number.parseFloat(rc.winnable_amount ?? 0) || 0,
      price_of_ticket: Number.parseFloat((rc.ticket_price ?? rc.price_of_ticket ?? 0)) || 0,
      status: rc.raffle_status,
      raffle_type_id: selected.raffle_type_id,
      raffle_type: selected.raffle_type,
    };
  } catch (error) {
    console.error("❌ Error validating raffle cycle:", error);
    return null;
  }
};

/**
 * Fetch vendor details by vendor_id (uses GET upstream).
 *
 * @param {number|string} vendorId
 * @param {{signal?: AbortSignal}} [opts]
 * @returns {Promise<{
 *  vendor_id:number|string, email?:string, display_name?:string, phone_number?:string,
 *  business_name?:string, business_address?:string, industry?:string,
 *  bank_name?:string, bank_account_number?:string, cac_number?:string, contact_name?:string
 * } | null>}
 */
export const fetchVendorDetails = async (vendorId, opts = {}) => {
  try {
    console.log(`🔍 Fetching vendor details for Vendor ID: ${vendorId}`);

    /** @type {{ success?:boolean, vendor?: any }} */
    const payload = await callProxyAction(
      { action_type: "get_vendor_details", vendor_id: Number(vendorId) },
      { signal: opts.signal }
    );

    const v = payload?.vendor;
    if (!v) {
      console.warn("⚠ Vendor not found.");
      return null;
    }

    return {
      vendor_id: v.vendor_id ?? v.id ?? v.ID,
      email: v.email,
      display_name: v.display_name,
      phone_number: v.phone_number,
      business_name: v.business_name,
      business_address: v.business_address,
      industry: v.industry,
      bank_name: v.bank_name,
      bank_account_number: v.bank_account_number,
      cac_number: v.cac_number,
      contact_name: v.contact_name,
    };
  } catch (error) {
    console.error("❌ Error fetching vendor details:", error);
    return null;
  }
};

/** Returns current loading state. */
export const isLoading = () => loading.value;

/**
 * Get an icon class for a raffle type.
 * @param {number|string} typeId
 * @returns {string}
 */
export const getIcon = (typeId) => {
  const key = Number(typeId);
  const icons = {
    1: "bi bi-currency-exchange",
    2: "bi bi-check-circle",
    3: "bi bi-gift",
    4: "bi bi-cash",   // fund account
    5: "bi bi-phone",  // buy airtime
    6: "bi bi-wifi",   // buy data
    7: "bi bi-wallet2",
  };
  return icons[key] || "bi bi-box";
};

/**
 * Map raffle type to a route path.
 * @param {number|string} typeId
 * @returns {string}
 */
/**
 * Map raffle type to a route path.
 *
 * Types (as used in hero buttons):
 *  1 = OnTheHouse Deals
 *  2 = Pay Merchant Service
 *  3 = WithDraw Cash Deals
 *  4 = Transfer Moni
 *
 * @param {number|string} typeId
 * @returns {string}
 */
export const getRoute = (typeId) => {
  const key = Number(typeId);

  const routes = {
    1: "/on-the-house",    // OnTheHouse Deals
    2: "/pay-merchant",    // Pay Merchant Service
    3: "/withdraw-cash",   // WithDraw Cash Deals
    4: "/transfer-moni",   // Transfer Moni
  };

  const route = routes[key];
  if (!route) {
    console.warn(`⚠ No specific route defined for raffle_type_id=${typeId}. Redirecting to Coming Soon.`);
  }
  return route || "/coming-soon";
};

