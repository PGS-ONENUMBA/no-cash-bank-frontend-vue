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
  TIMEOUT_MS: 8000,        // Increased timeout
  MAX_RETRIES: 3,          // Maximum number of retry attempts
  RETRY_DELAY_MS: 1000,    // Delay between retries
  PROXY_PATH: "/context-proxy/v1/action", // Context Proxy opinionated route
};

/** Sleep utility for retry delay */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Makes API request with retry logic (uses shared axios instance `api`)
 * @param {Object} config - Axios request configuration
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} API response
 */
const makeRequestWithRetry = async (config, retryCount = 0) => {
  try {
    return await api.request(config);
  } catch (error) {
    // 4xx: don’t retry
    if (error.response?.status >= 400 && error.response?.status < 500) {
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
 * Fetches products with caching and retry logic
 * @param {boolean} [forceRefresh=false] - Force fresh data fetch
 * @returns {Promise<Array>} Array of products
 */
export const fetchProducts = async (forceRefresh = false) => {
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
    const response = await makeRequestWithRetry({
      method: "POST",
      url: CONFIG.PROXY_PATH,
      timeout: CONFIG.TIMEOUT_MS,
      data: { action_type: "get_raffle_cycle" },
    });

    if (response.data?.ok && Array.isArray(response.data.data?.raffle_cycles)) {
      products.value = response.data.data.raffle_cycles;
      lastFetchTimestamp.value = Date.now();
      console.log("✅ Products fetched successfully");
      return products.value;
    }

    // Back-compat: some endpoints may return { success: true, raffle_cycles: [...] }
    if (response.data?.success && Array.isArray(response.data?.raffle_cycles)) {
      products.value = response.data.raffle_cycles;
      lastFetchTimestamp.value = Date.now();
      console.log("✅ Products fetched successfully (legacy shape)");
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
 * @param {number} raffleCycleId - The raffle cycle ID
 * @returns {Promise<Object|null>} Product details or null
 */
export const fetchProductById = async (raffleCycleId) => {
  try {
    console.log(`🔍 Fetching product details for Raffle Cycle ID: ${raffleCycleId}`);

    const response = await api.post(
      CONFIG.PROXY_PATH,
      { action_type: "get_raffle_cycle_by_id", raffle_cycle_id: raffleCycleId },
      { timeout: CONFIG.TIMEOUT_MS }
    );

    // Prefer proxy wrapper {ok, data:{...}}, else legacy {success, raffle_cycle}
    const payload = response.data?.data || response.data;
    if (payload?.success && payload?.raffle_cycle) {
      const rc = payload.raffle_cycle;
      return {
        raffle_cycle_id: rc.raffle_cycle_id,
        winnable_amount: parseFloat(rc.winnable_amount),
        price_of_ticket: parseFloat(rc.ticket_price),
        status: rc.raffle_status,
        associated_types: rc.associated_types,
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
 * @param {number} raffleCycleId - The raffle cycle ID
 * @param {number} raffleTypeId - The raffle type ID
 * @returns {Promise<Object|null>} Validated raffle details or null
 */
export const validateRaffleCycle = async (raffleCycleId, raffleTypeId) => {
  try {
    console.log(`🔍 Validating Raffle Cycle: ${raffleCycleId}, Type: ${raffleTypeId}`);

    const response = await api.post(
      CONFIG.PROXY_PATH,
      { action_type: "get_raffle_cycle_by_id", raffle_cycle_id: raffleCycleId },
      { timeout: CONFIG.TIMEOUT_MS }
    );

    const payload = response.data?.data || response.data;
    if (payload?.success && payload?.raffle_cycle) {
      const rc = payload.raffle_cycle;
      const selectedType = Array.isArray(rc.associated_types)
        ? rc.associated_types.find((t) => Number(t.raffle_type_id) === Number(raffleTypeId))
        : null;

      if (selectedType) {
        return {
          raffle_cycle_id: rc.raffle_cycle_id,
          winnable_amount: parseFloat(rc.winnable_amount),
          price_of_ticket: parseFloat(rc.ticket_price),
          status: rc.raffle_status,
          raffle_type_id: selectedType.raffle_type_id,
          raffle_type: selectedType.raffle_type,
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
 * @param {number} vendorId - The vendor ID
 * @returns {Promise<Object|null>} Vendor details or null
 */
export const fetchVendorDetails = async (vendorId) => {
  try {
    console.log(`🔍 Fetching vendor details for Vendor ID: ${vendorId}`);

    const response = await api.post(
      CONFIG.PROXY_PATH,
      { action_type: "get_vendor_details", vendor_id: vendorId },
      { timeout: CONFIG.TIMEOUT_MS }
    );

    const payload = response.data?.data || response.data;
    if (payload?.success && payload?.vendor) {
      const v = payload.vendor;
      return {
        vendor_id: v.vendor_id,
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
