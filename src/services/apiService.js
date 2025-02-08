import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { useAppStore } from "@/stores/appStore";
import { refreshToken, refreshAppToken, logout } from "./authService";

// Create Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Allow cookies (for refresh tokens)
});

/**
 * ✅ Determines whether a request should use the **App Token** or **Customer Token**.
 */
const useAppTokenForRequest = (url) => {
  const appTokenEndpoints = [
    "/nocash-bank/v1/action",
    "/nocash-bank/v1/products",
    "/nocash-bank/v1/login",
  ];
  return appTokenEndpoints.some((endpoint) => url.includes(endpoint));
};

/**
 * ✅ Axios Request Interceptor: Attaches Bearer Token
 */
apiClient.interceptors.request.use(async (config) => {
  const authStore = useAuthStore();
  const appStore = useAppStore();
  let token;

  const isAppAPI = useAppTokenForRequest(config.url);

  if (isAppAPI) {
    token = appStore.appToken;
    if (!token) {
      token = await refreshAppToken();
    }
  } else {
    token = authStore.token;
    if (authStore.isTokenExpired) {
      console.log("🔄 Refreshing user token...");
      token = await refreshToken();
      if (!token) {
        logout();
        return Promise.reject("Session expired. Please log in again.");
      }
    }
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * ✅ Axios Response Interceptor: Handles Token Expiry
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
