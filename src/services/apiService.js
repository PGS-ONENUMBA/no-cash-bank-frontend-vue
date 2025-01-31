import axios from "axios";
import { refreshToken, logout } from "./authService";

// Set up API client
const apiClient = axios.create({
  baseURL: "http://localhost:8001/no-cash-bank-env/core/wp-json",
  headers: { "Content-Type": "application/json" },
});

/**
 * Axios Request Interceptor:
 * - Attaches Bearer Token to each request
 * - Refreshes the token if expired
 * - Logs out user if inactive for too long
 */
apiClient.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("authToken");
  const tokenExpiry = localStorage.getItem("tokenExpiry");
  const lastActive = localStorage.getItem("lastActive");

  // Refresh token if expired
  if (token && tokenExpiry && Date.now() > tokenExpiry) {
    console.log("Token expired. Refreshing...");
    token = await refreshToken();

    if (!token) {
      console.warn("Session expired. Logging out.");
      logout();
      return Promise.reject("Session expired. Please log in again.");
    }
  }

  // Attach token to request headers
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

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
      console.warn("Unauthorized request. Attempting to refresh token...");
      const newToken = await refreshToken();

      if (newToken) {
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(error.config); // Retry failed request
      } else {
        console.warn("Refresh failed. Logging out.");
        logout();
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
