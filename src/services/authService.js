// Extracts loginAPI function for modular use.
// Uses Pinia Store (authStore) to manage authentication.
// Ensures CSP Compliance (No inline scripts/local storage reliance for wallet transactions).

import apiClient from "@/services/apiService";
import { useAuthStore } from "@/store/authStore";

/**
 * Logs in the user by sending credentials to the API.
 * On success, updates Pinia store.
 *
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<object>} - API response containing user data & tokens
 */
export const loginAPI = async (username, password) => {
  try {
    console.log("🔹 Sending login request for:", username);

    const response = await apiClient.post("/jwt-auth/v1/token", {
      username,
      password,
    });

    console.log("✅ Login successful. API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Login API request failed:", error.response?.data || error.message);
    throw error;
  }
};


/**
 * Refreshes the access token before it expires.
 * Uses Pinia state instead of relying on localStorage.
 *
 * @returns {Promise<string|null>} - New access token or null if refresh fails
 */
export const refreshToken = async () => {
  const authStore = useAuthStore();
  const refreshToken = authStore.refreshToken;

  if (!refreshToken) {
    console.error("No refresh token available.");
    return null;
  }

  try {
    const response = await apiClient.post("/api/v1/token/refresh", {
      refresh_token: refreshToken,
    });

    authStore.setToken(response.data.token);
    return response.data.token;
  } catch (error) {
    console.error("Token refresh failed:", error.response?.data || error.message);
    return null;
  }
};

/**
 * Logs out the user by clearing authentication data from Pinia.
 */
export const logout = () => {
  const authStore = useAuthStore();
  authStore.clearAuth();
};
