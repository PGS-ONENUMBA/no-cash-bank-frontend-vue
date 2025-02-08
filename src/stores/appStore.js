import { defineStore } from "pinia";
import { refreshAppToken } from "@/services/authService";

export const useAppStore = defineStore("appStore", {
  state: () => ({
    appToken: import.meta.env.VITE_APP_AUTH_TOKEN, // Initial token from ENV
    appRefreshToken: import.meta.env.VITE_APP_REFRESH_TOKEN, // Initial refresh token from ENV
    appTokenExpiry: null, // Expiry timestamp for app token
  }),

  getters: {
    isAppTokenExpired: (state) => state.appTokenExpiry && Date.now() > state.appTokenExpiry,
  },

  actions: {
    /**
     * ✅ Sets new app token & refresh token.
     */
    setAppToken(token, refreshToken, expiryMinutes) {
      this.appToken = token;
      this.appRefreshToken = refreshToken;
      this.appTokenExpiry = Date.now() + (expiryMinutes || 60) * 60 * 1000; // Default to 60 min
    },

    /**
     * ✅ Refreshes App Token if needed.
     */
    async refreshAppTokenIfNeeded() {
      const bufferTimeMs = (parseInt(import.meta.env.VITE_TOKEN_REFRESH_BUFFER_MIN) || 5) * 60 * 1000; // Refresh 5 min before expiry

      if (this.appTokenExpiry && Date.now() > this.appTokenExpiry - bufferTimeMs) {
        console.log("🔄 Refreshing App Token before expiry...");

        try {
          const newToken = await refreshAppToken();
          if (newToken) {
            this.setAppToken(newToken, this.appRefreshToken, 60); // Refresh for another 60 minutes
            console.log("✅ App Token refreshed successfully!");
          } else {
            console.warn("⚠ App Token refresh failed. Retrying later...");
          }
        } catch (error) {
          console.error("❌ App Token refresh error:", error);
        }
      }
    },

    /**
     * ✅ Starts monitoring app token expiry.
     */
    startAppTokenMonitor() {
      this.refreshAppTokenIfNeeded();
      setInterval(() => {
        this.refreshAppTokenIfNeeded();
      }, 60 * 1000); // Check app token refresh every 60 seconds
    },
  },
});
