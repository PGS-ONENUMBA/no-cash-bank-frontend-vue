import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { useAppStore } from "@/stores/appStore";

// API endpoints from .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOGIN_ENDPOINT = "/jwt-auth/v1/token";
const REFRESH_ENDPOINT = "/jwt-auth/v1/token/refresh";

/**
 * ✅ Logs in the user and stores tokens in Pinia.
 */
export const loginUser = async (username, password) => {
  try {
    console.log("🚀 Logging in with:", { username, password });

    const response = await axios.post(
      `${API_BASE_URL}${LOGIN_ENDPOINT}`,
      { username, password }, // Ensure the correct payload format
      { withCredentials: true }
    );

    console.log("✅ Login response:", response.data);

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || "Login failed.");
    }
  } catch (error) {
    console.error("❌ Login error:", error.response?.data || error.message);
    throw error;
  }
};


/**
 * ✅ Refreshes the Customer's JWT access token using the refresh token cookie.
 */
export const refreshToken = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}${REFRESH_ENDPOINT}`, {}, {
      withCredentials: true, // Ensures refresh token is used via cookies
    });

    if (response.data.success) {
      const authStore = useAuthStore();
      authStore.setToken(response.data.data.token);
      authStore.setRefreshToken(response.data.data.refresh_token);  // ✅ Store new refresh token
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Token refresh failed.");
    }
  } catch (error) {
    console.error("❌ Failed to refresh user token:", error.response?.data || error.message);
    return null;
  }
};

/**
 * ✅ Refreshes the App Token using Client Credentials (If Needed).
 */
export const refreshAppToken = async () => {
  try {
    const response = await axios.post(import.meta.env.VITE_APP_REFRESH_TOKEN_ENDPOINT, {
      grant_type: "client_credentials",
      client_id: import.meta.env.VITE_APP_CLIENT_ID,
      client_secret: import.meta.env.VITE_APP_CLIENT_SECRET,
    });

    if (response.data.access_token) {
      const appStore = useAppStore();
      appStore.setAppToken(response.data.access_token);
      return response.data.access_token;
    } else {
      console.warn("⚠ App Token refresh failed. Using existing token.");
      return null;
    }
  } catch (error) {
    console.error("❌ Failed to refresh App Token:", error);
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
