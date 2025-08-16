/**
 * @fileoverview Product Service with retry logic, caching, and Context Proxy (server-side Basic)
 */
import { ref } from "vue";
import { api } from "@/services/http"; // axios instance with CSRF interceptor + baseURL

// Global state
const products = ref([]);
const loading = ref(false);
const lastFetchTimestamp = ref(null);
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Configuration constants
const CONFIG = {
  TIMEOUT_MS: 8000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  PROXY_PATH: "/context-proxy/v1/action",
};

/** Sleep utility for retry delay */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Makes API request with retry logic (uses shared axios instance `api`)
 * Retries only network/5xx.
 * @param {import('axios').AxiosRequestConfig} config
 * @param {number} retryCount
 * @returns {Promise<import('axios').AxiosResponse>}
 */
const makeRequestWithRetry = async (config, retryCount = 0) => {
  try {
    return await api.request(config);
  } catch (error) {
    const status = error?.response?.status;
    if (typeof status === "number" && status >= 400 && status < 500) {
      throw error; // don’t retry 4xx
    }
    if (retryCount < CONFIG.MAX_RETRIES) {
      console.log(`🔄 Retry attempt ${retryCount + 1} of ${CONFIG.MAX_RETRIES}...`);
      await sleep(CONFIG.RETRY_DELAY_MS);
      return makeRequestWithRetry(config, retryCount + 1);
    }
    throw error;
  }
};

/** Clear in-memory cache (optional export if you want to force refresh elsewhere) */
export const clearProductsCache = () => {
  products.value = [];
  lastFetchTimestamp.value = null;
};

/**
 * Fetches products with caching and retry logic
 * @param {boolean} [forceRefresh=false]
 * @param {{signal?: AbortSignal}} [opts]
 * @returns {Promise<Array>}
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
    const res = await makeRequestWithRetry({
      method: "POST",
      url: CONFIG.PROXY_PATH,
      timeout: CONFIG.TIMEOUT_MS,
      data: { action_type: "get_raffle_cycle" },
      signal: opts.signal,
    });

    // Proxy normalizes to { ok, status, data: { … } }
    const payload = res.data?.data ?? res.data;

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
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
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
 * Fetches product details by `raffle_cycle_id`.
 * @param {number|string} raffleCycleId
 * @param {{signal?: AbortSignal}} [opts]
 * @returns {Promise<Object|null>}
 */
export const fetchProductById = async (raffleCycleId, opts = {}) => {
  try {
    console.log(`🔍 Fetching product details for Raffle Cycle ID: ${raffleCycleId}`);

    const res = await makeRequestWithRetry({
      method: "POST",
      url: CONFIG.PROXY_PATH,
      timeout: CONFIG.TIMEOUT_MS,
      data: { action_type: "get_raffle_cycle_by_id", raffle_cycle_id: Number(raffleCycleId) },
      signal: opts.signal,
    });

    const payload = res.data?.data ?? res.data;
    if (payload?.success && payload?.raffle_cycle) {
      const rc = payload.raffle_cycle;
      return {
        raffle_cycle_id: rc.raffle_cycle_id,
        winnable_amount: Number.parseFloat(rc.winnable_amount ?? 0) || 0,
        price_of_ticket: Number.parseFloat(rc.ticket_price ?? 0) || 0,
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
 * Validates raffle cycle and type
 * @param {number|string} raffleCycleId
 * @param {number|string} raffleTypeId
 * @param {{signal?: AbortSignal}} [opts]
 * @returns {Promise<Object|null>}
 */
export const validateRaffleCycle = async (raffleCycleId, raffleTypeId, opts = {}) => {
  try {
    console.log(`🔍 Validating Raffle Cycle: ${raffleCycleId}, Type: ${raffleTypeId}`);

    const res = await makeRequestWithRetry({
      method: "POST",
      url: CONFIG.PROXY_PATH,
      timeout: CONFIG.TIMEOUT_MS,
      data: { action_type: "get_raffle_cycle_by_id", raffle_cycle_id: Number(raffleCycleId) },
      signal: opts.signal,
    });

    const payload = res.data?.data ?? res.data;
    if (payload?.success && payload?.raffle_cycle) {
      const rc = payload.raffle_cycle;
      const types = Array.isArray(rc.associated_types) ? rc.associated_types : [];
      const selected = types.find((t) => Number(t.raffle_type_id) === Number(raffleTypeId));

      if (selected) {
        return {
          raffle_cycle_id: rc.raffle_cycle_id,
          winnable_amount: Number.parseFloat(rc.winnable_amount ?? 0) || 0,
          price_of_ticket: Number.parseFloat(rc.ticket_price ?? 0) || 0,
          status: rc.raffle_status,
          raffle_type_id: selected.raffle_type_id,
          raffle_type: selected.raffle_type,
        };
      }
    }
    console.warn("⚠ Raffle cycle validation failed. Possible data tampering.");
    return null;
  } catch (error) {
    console.error("❌ Error validating raffle cycle:", error);
    return null;
  }
};

/**
 * Fetches vendor details by vendor_id
 * @param {number|string} vendorId
 * @param {{signal?: AbortSignal}} [opts]
 * @returns {Promise<Object|null>}
 */
export const fetchVendorDetails = async (vendorId, opts = {}) => {
  try {
    console.log(`🔍 Fetching vendor details for Vendor ID: ${vendorId}`);

    const res = await makeRequestWithRetry({
      method: "POST",
      url: CONFIG.PROXY_PATH,
      timeout: CONFIG.TIMEOUT_MS,
      data: { action_type: "get_vendor_details", vendor_id: Number(vendorId) },
      signal: opts.signal,
    });

    const payload = res.data?.data ?? res.data;
    if (payload?.success && payload?.vendor) {
      const v = payload.vendor;
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
    }
    console.warn("⚠ Vendor not found.");
    return null;
  } catch (error) {
    console.error("❌ Error fetching vendor details:", error);
    return null;
  }
};

/** Returns loading state */
export const isLoading = () => loading.value;

/** Gets icon class for raffle type */
export const getIcon = (typeId) => {
  const icons = {
    1: "bi bi-currency-exchange",
    2: "bi bi-check-circle",
    3: "bi bi-gift",
    4: "bi bi-cash",   // fund account
    5: "bi bi-phone",  // buy airtime
    6: "bi bi-wifi",   // buy data
    7: "bi bi-wallet2",
  };
  return icons[typeId] || "bi bi-box";
};

/** Gets route for raffle type */
export const getRoute = (typeId) => {
  const routes = {
    1: "/get-cash",
    2: "/pay4me",
    3: "/on-the-house",
  };
  const route = routes[typeId];
  if (!route) {
    console.warn(`⚠ No specific route defined for raffle_type_id=${typeId}. Redirecting to Coming Soon.`);
  }
  return route || "/coming-soon";
};
