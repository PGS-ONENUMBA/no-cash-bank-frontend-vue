import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { refreshToken, logout } from "./authService";

// Set up API client
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Axios Request Interceptor:
 * - Attaches Bearer Token from Pinia store
 * - Refreshes expired tokens
 */
apiClient.interceptors.request.use(async (config) => {
  const authStore = useAuthStore();
  let token = authStore.token;

  if (!token) {
    console.warn("⚠ No token found, user might not be logged in.");
    return config;
  }

  // Refresh token if expired
  if (authStore.isTokenExpired) {
    console.log("🔄 Token expired. Refreshing...");
    token = await refreshToken();

    if (!token) {
      console.warn("❌ Token refresh failed. Logging out.");
      logout();
      return Promise.reject("Session expired. Please log in again.");
    }
  }

  // Attach token
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Axios Response Interceptor:
 * - Handles 401 errors by attempting token refresh
 * - Logs out user if refresh fails
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠ Unauthorized request. Attempting token refresh...");
      const newToken = await refreshToken();

      if (newToken) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(error.config);
      } else {
        console.error("❌ Refresh token failed. Logging out.");
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
