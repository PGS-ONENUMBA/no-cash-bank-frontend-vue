import axios from "axios";
import { useAuthStore } from "@/stores/authStore"; // Customer Authentication Store

// ✅ Load API Base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Load App Credentials from Env
const APP_USERNAME = import.meta.env.VITE_APP_USER_NAME;
const APP_PASSWORD = import.meta.env.VITE_APP_USER_PASSWORD;

// Encode Basic Auth credentials
const encodedCredentials = btoa(`${APP_USERNAME}:${APP_PASSWORD}`);

// ✅ Create Axios instance with Basic Auth
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * ✅ Returns the correct authentication headers dynamically.
 * - Uses Basic Auth for app authentication.
 * - Uses Bearer Token for customer-authenticated requests.
 */
const getAuthHeaders = async (useBasicAuth = false) => {
  const authStore = useAuthStore();

  if (useBasicAuth) {
    // ✅ Use Basic Auth (for app authentication)
    return {
      Authorization: `Basic ${encodedCredentials}`,
    };
  }

  if (!authStore.token) {
    console.warn("❌ No authentication token found. User may not be logged in.");
    throw new Error("Missing authentication token");
  }

  // ✅ Validate the token before making the request
  try {
    const validationResponse = await axios.post(`${API_BASE_URL}/jwt-auth/v1/token/validate`, {}, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    });

    if (!validationResponse.data.success) {
      console.warn("⚠ Token validation failed. User may need to reauthenticate.");
      throw new Error("Invalid or expired authentication token.");
    }
  } catch (error) {
    console.error("❌ Token validation request failed:", error);
    throw new Error("Authentication error");
  }

  return {
    Authorization: `Bearer ${authStore.token}`,
  };
};

/**
 * ✅ Makes a POST request with the correct authentication method.
 * @param {string} endpoint - The API endpoint.
 * @param {object} data - The request body.
 * @param {boolean} useBasicAuth - Whether to use Basic Auth.
 */
export const post = async (endpoint, data = {}, useBasicAuth = false) => {
  try {
    const headers = await getAuthHeaders(useBasicAuth);
    const response = await apiClient.post(endpoint, data, { headers });
    return response.data;
  } catch (error) {
    console.error(`❌ POST request failed: ${endpoint}`, error);
    throw error;
  }
};

export default apiClient;
