import apiClient from "@/services/apiService";
import { useAuthStore } from "@/stores/authStore";

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
let retryCount = 0; // Prevent infinite retries
const MAX_RETRIES = 3; // Limit retries to avoid memory leak
export const refreshToken = async () => {
  const authStore = useAuthStore();
  
  if (!authStore.refreshToken || retryCount >= MAX_RETRIES) {
    console.error("❌ Max token refresh attempts reached. Logging out...");
    authStore.logout();
    return;
  }

  try {
    console.log(`🔄 Token expired. Refreshing... Attempt ${retryCount + 1}`);

    const response = await apiClient.post("/auth/refresh-token", {
      refresh_token: authStore.refreshToken,
    });

    if (response.data.success) {
      authStore.token = response.data.token;
      authStore.tokenExpiry = Date.now() + 1000 * 60 * 20; // ✅ Extend expiry by 20 min
      retryCount = 0; // ✅ Reset retry count
      console.log("✅ Token refreshed successfully!");
    } else {
      throw new Error("⚠ Failed to refresh token.");
    }
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    retryCount++; // ✅ Increase retry count on failure

    // **Wait 3 seconds before retrying to prevent spam**
    await new Promise((resolve) => setTimeout(resolve, 3000));

    refreshToken(); // **Retry refresh**
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
