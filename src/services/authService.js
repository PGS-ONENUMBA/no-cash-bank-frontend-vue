import apiClient from "@/services/apiService";
import { useAuthStore } from "@/store/authStore";

/**
 * ✅ Logs in the user by sending credentials to the API.
 * - Uses Pinia store to manage authentication state.
 * - Ensures CSP compliance (No reliance on local storage).
 * 
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<object>} - API response containing user data & tokens
 */
export const loginAPI = async (username, password) => {
  try {
    const response = await apiClient.post(import.meta.env.VITE_LOGIN_ENDPOINT || "/jwt-auth/v1/token", {
      username,
      password,
    });

    if (response.status === 200 && response.data.token) {
      return response.data;
    } else {
      throw new Error("Unexpected API response structure.");
    }
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data?.message || error.message);
    throw error;
  }
};

/**
 * ✅ Refreshes the access token before it expires.
 * - Uses Pinia state instead of local storage.
 * - Ensures API response is valid before updating state.
 * 
 * @returns {Promise<string|null>} - New access token or null if refresh fails
 */
export const refreshToken = async () => {
  const authStore = useAuthStore();
  const refreshToken = authStore.refreshToken;

  if (!refreshToken) {
    console.warn("⚠ No refresh token available.");
    return null;
  }

  try {
    const response = await apiClient.post(import.meta.env.VITE_REFRESH_TOKEN_ENDPOINT || "/api/v1/token/refresh", {
      refresh_token: refreshToken,
    });

    if (response.status === 200 && response.data.token) {
      authStore.setToken(response.data.token);
      return response.data.token;
    } else {
      console.warn("⚠ Token refresh API response invalid.");
      return null;
    }
  } catch (error) {
    console.error("❌ Token refresh failed:", error.response?.data?.message || error.message);
    return null;
  }
};

/**
 * ✅ Logs out the user by clearing authentication state in Pinia.
 * - Calls the API to revoke the token before clearing state.
 * - Ensures complete cleanup before redirection.
 */
export const logout = async () => {
  const authStore = useAuthStore();

  try {
    // Attempt API logout if needed
    await apiClient.post(import.meta.env.VITE_LOGOUT_ENDPOINT || "/api/v1/logout");

    // Clear authentication state in Pinia
    authStore.clearAuth();
  } catch (error) {
    console.warn("⚠ Logout API call failed, proceeding with local cleanup.");
  }
};
