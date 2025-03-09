/**
 * @fileoverview Product Service with retry logic and improved error handling
 */
import { ref } from "vue";
import axios from 'axios';

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
    API_PATH: '/nocash-bank/v1/action'
};

/**
 * Sleep utility for retry delay
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Creates authentication header
 * @returns {string} Base64 encoded auth string
 */
const getAuthString = () => {
    const username = import.meta.env.VITE_APP_USER_NAME?.trim();
    const password = import.meta.env.VITE_APP_USER_PASSWORD?.trim();

    if (!username || !password) {
        throw new Error('Authentication credentials not found in environment variables');
    }

    return btoa(`${username}:${password}`);
};

/**
 * Makes API request with retry logic
 * @param {Object} config - Axios request configuration
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} API response
 */
const makeRequestWithRetry = async (config, retryCount = 0) => {
    try {
        return await axios(config);
    } catch (error) {
        if (error.response?.status >= 400 && error.response?.status < 500) {
            throw error;
        }

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
    if (!forceRefresh &&
        products.value.length > 0 &&
        lastFetchTimestamp.value &&
        Date.now() - lastFetchTimestamp.value < CACHE_DURATION) {
        console.log("🔄 Using cached products data");
        return products.value;
    }

    loading.value = true;
    console.log("🚀 Fetching latest products...");

    try {
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        if (!baseURL) {
            throw new Error('API base URL not found in environment variables');
        }

        const response = await makeRequestWithRetry({
            method: 'GET',
            url: `${baseURL}${CONFIG.API_PATH}`,
            timeout: CONFIG.TIMEOUT_MS,
            headers: {
                'Authorization': `Basic ${getAuthString()}`,
                'Content-Type': 'application/json'
            },
            params: { action_type: "get_raffle_cycle" }
        });

        if (response.data.success && Array.isArray(response.data.raffle_cycles)) {
            products.value = response.data.raffle_cycles;
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
            statusText: error.response?.statusText
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

        const authString = getAuthString();

        const response = await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}${CONFIG.API_PATH}`,
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json'
            },
            params: {
                action_type: "get_raffle_cycle_by_id",
                raffle_cycle_id: raffleCycleId
            }
        });

        if (response.data.success) {
            const raffleCycle = response.data.raffle_cycle;
            return {
                raffle_cycle_id: raffleCycle.raffle_cycle_id,
                winnable_amount: parseFloat(raffleCycle.winnable_amount),
                price_of_ticket: parseFloat(raffleCycle.ticket_price), // Fixed typo
                status: raffleCycle.raffle_status, // Adjusted field name
                associated_types: raffleCycle.associated_types,
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

        const authString = getAuthString();

        const response = await axios({
            method: 'GET',
            url: `${import.meta.env.VITE_API_BASE_URL}${CONFIG.API_PATH}`,
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json'
            },
            params: {
                action_type: "get_raffle_cycle_by_id",
                raffle_cycle_id: raffleCycleId
            }
        });

        console.log('Response:', response.data);

        if (response.data.success) {
            const raffleCycle = response.data.raffle_cycle;
            const selectedType = raffleCycle.associated_types.find(
                (type) => type.raffle_type_id === parseInt(raffleTypeId)
            );

            if (selectedType) {
                return {
                    raffle_cycle_id: raffleCycle.raffle_cycle_id,
                    winnable_amount: parseFloat(raffleCycle.winnable_amount),
                    price_of_ticket: parseFloat(raffleCycle.ticket_price),
                    status: raffleCycle.raffle_status,
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
 * Returns loading state
 * @returns {boolean} Whether data is currently loading
 */
export const isLoading = () => loading.value;

/**
 * Gets icon class for raffle type
 * @param {number} typeId - Raffle type ID
 * @returns {string} Bootstrap icon class
 */
export const getIcon = (typeId) => {
    const icons = {
        1: "bi bi-currency-exchange",
        2: "bi bi-check-circle",
        3: "bi bi-gift",
    };
    return icons[typeId] || "bi bi-box";
};

/**
 * Gets route for raffle type
 * @param {number} typeId - Raffle type ID
 * @returns {string} Route path
 */
export const getRoute = (typeId) => {
    const routes = {
        1: "/get-cash",
        2: "/pay4me",
        3: "/on-the-house",
    };
    return routes[typeId] || "/dashboard";
};
