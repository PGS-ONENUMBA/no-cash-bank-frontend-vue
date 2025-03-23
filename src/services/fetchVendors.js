// src/services/fetchVendors.js
import axios from 'axios';

// Configuration constants (mirrored from productService.js)
const CONFIG = {
    TIMEOUT_MS: 8000,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    API_PATH: '/nocash-bank/v1/action',
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
            throw error; // Client errors (e.g., 400) don't retry
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
 * Fetches vendors with auth and retry logic
 * @returns {Promise<Array>} Array of vendors
 */
export const fetchVendors = async () => {
    try {
        console.log("🚀 Fetching vendors...");

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
                'Content-Type': 'application/json',
            },
            params: {
                action_type: "get_vendors", // Matches backend routing
            },
        });

        if (response.data.success && Array.isArray(response.data.vendors)) {
            const vendors = response.data.vendors.map((vendor) => ({
                vendor_id: vendor.ID,
                vendor_name: vendor.vendor_name || "Unnamed Vendor",
            }));
            console.log("✅ Vendors fetched successfully:", vendors);
            return vendors;
        }

        console.warn("⚠ No vendors found or invalid response format");
        return [];
    } catch (error) {
        console.error("❌ Error fetching vendors:", {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
        });
        return [];
    }
};
