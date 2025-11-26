import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { useAppStore } from "@/stores/appStore";
import router from "@/router";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const LOGIN_ENDPOINT = "/jwt-auth/v1/token";
const REFRESH_ENDPOINT = "/jwt-auth/v1/token/refresh";
const LOGOUT_ENDPOINT = "/jwt-auth/v1/logout";

/**
 * Login user and return response data.
 */
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${LOGIN_ENDPOINT}`,
      { username, password },
      { withCredentials: true }
    );

    console.log("✅ Login response:", response.data);

    if (response.data.success) {
      return response.data;
    }

    throw new Error(response.data.message || "Login failed.");
  } catch (error) {
    console.error("❌ Login error:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Refresh user access token using refresh token cookie.
 */
export const refreshToken = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}${REFRESH_ENDPOINT}`,
      {},
      { withCredentials: true }
    );

    console.log("✅ Token refresh response:", response.data);

    if (response.data.success) {
      const authStore = useAuthStore();
      authStore.setToken(response.data.data.token);
      return response.data.data;
    }

    throw new Error(response.data.message || "Token refresh failed.");
  } catch (error) {
    console.error(
      "❌ Failed to refresh user token:",
      error.response?.data || error.message
    );
    return null;
  }
};

/**
 * Refresh app token via client credentials.
 */
export const refreshAppToken = async () => {
  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_REFRESH_TOKEN_ENDPOINT,
      {
        grant_type: "client_credentials",
        client_id: import.meta.env.VITE_APP_CLIENT_ID,
        client_secret: import.meta.env.VITE_APP_CLIENT_SECRET,
      }
    );

    if (response.data.access_token) {
      const appStore = useAppStore();
      appStore.setAppToken(response.data.access_token);
      return response.data.access_token;
    }

    console.warn("⚠ App Token refresh failed. Using existing token.");
    return null;
  } catch (error) {
    console.error("❌ Failed to refresh App Token:", error);
    return null;
  }
};

/**
 * Logout user - always clears local state and redirects to login.
 */
export const logout = async () => {
  const authStore = useAuthStore();

  try {
    await axios.post(
      `${API_BASE_URL}${LOGOUT_ENDPOINT}`,
      {},
      { withCredentials: true }
    );
  } catch (error) {
    console.warn("⚠ Logout API call failed, proceeding with local cleanups.", error);
  } finally {
    authStore.clearAuth();

    try {
      await router.push({ name: "login" });
    } catch {
      window.location.href = "/login";
    }
  }
};
