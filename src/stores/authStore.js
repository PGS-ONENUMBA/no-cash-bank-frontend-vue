import { defineStore } from "pinia";
import { loginAPI, refreshToken } from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    tokenExpiry: null,
    inactivityTimeout: null,
    warningTimeout: null,
    showWarning: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isTokenExpired: (state) => state.tokenExpiry && Date.now() > state.tokenExpiry,
  },

  actions: {
    /**
     * ✅ Logs in the user and initializes session tracking.
     */
    async login(username, password) {
      if (this.token) return;

      try {
        const data = await loginAPI(username, password);
        const tokenExpiryMin = import.meta.env.VITE_TOKEN_EXPIRY_MIN || 20; // Default to 20 min

        this.token = data.token;
        this.refreshToken = data.refresh_token;
        this.tokenExpiry = Date.now() + tokenExpiryMin * 60 * 1000;
        this.user = data;

        console.log(`🔑 Token expires in ${tokenExpiryMin} minutes`);

        this.startInactivityTimer(); // Start tracking inactivity
      } catch (error) {
        throw error;
      }
    },

    /**
     * Handles refreshing the authentication token before expiration.
     * 
     * How Token Refresh Works:
     * Every 60 seconds, refreshTokenIfNeeded() checks if the token will expire within 2 minutes.
     * If expiry is close, it calls refreshToken() to get a new token.
     * If refresh fails, it logs the user out.
     * Logout is prevented as long as refresh works.
     * The app keeps users logged in seamlessly, unless their refresh token also expires!
     */
    async refreshTokenIfNeeded() {
      const bufferTimeMs = (import.meta.env.VITE_TOKEN_REFRESH_BUFFER_MIN || 2) * 60 * 1000; // Refresh 2 min before expiry

      if (this.tokenExpiry && Date.now() > this.tokenExpiry - bufferTimeMs) {
        console.log("🔄 Refreshing token before expiry...");

        try {
          const data = await refreshToken(this.refreshToken);
          if (data?.token) {
            this.token = data.token;
            this.tokenExpiry = Date.now() + (import.meta.env.VITE_TOKEN_EXPIRY_MIN || 20) * 60 * 1000;
            console.log("✅ Token refreshed successfully!");
          } else {
            console.warn("⚠ Token refresh failed, logging out...");
            this.logout();
          }
        } catch (error) {
          console.error("❌ Token refresh error:", error);
          this.logout();
        }
      }
    },

    /**
     * ✅ Logs out the user and redirects to the login page.
     * @param {Object} routerInstance - Vue Router instance (must be passed from component)
     */
    logout(routerInstance) {
      console.log("🚀 Logging out user...");

      this.resetTimers();
      this.$reset(); // Reset Pinia state

      if (routerInstance) {
        console.log("🔄 Redirecting to login...");
        routerInstance.push("/login").catch((err) =>
          console.warn("⚠ Router navigation error:", err)
        );
      } else {
        console.warn("⚠ No router instance provided. Cannot redirect.");
      }
    },

    /**
     * ✅ Starts inactivity tracking and token refresh.
     * @param {Object} routerInstance - Vue Router instance
     */
    startInactivityTimer(routerInstance) {
      this.resetTimers();

      const warningTimeMs = (import.meta.env.VITE_INACTIVITY_WARNING_MIN || 9) * 60 * 1000;
      const autoLogoutTimeMs = (import.meta.env.VITE_AUTO_LOGOUT_MIN || 10) * 60 * 1000;

      console.log(
        `🕒 Setting inactivity timers: Warning at ${warningTimeMs / 1000}s, Logout at ${
          autoLogoutTimeMs / 1000
        }s`
      );

      this.warningTimeout = setTimeout(() => {
        this.showWarning = true;
        console.log("⚠ Warning: User will be logged out soon!");
      }, warningTimeMs);

      this.inactivityTimeout = setTimeout(() => {
        if (this.showWarning) {
          console.warn("⏳ Auto-logging out due to inactivity.");
          this.logout(routerInstance);
        }
      }, autoLogoutTimeMs);

      // 🔄 Start periodic token refresh
      this.tokenRefreshInterval = setInterval(() => {
        this.refreshTokenIfNeeded();
      }, 60 * 1000); // Check token refresh every 60 seconds
    },

    /**
     * ✅ Resets inactivity timers and warning state.
     */
    resetTimers() {
      clearTimeout(this.warningTimeout);
      clearTimeout(this.inactivityTimeout);
      clearInterval(this.tokenRefreshInterval); // Stop token refresh
      this.showWarning = false;
    },

    /**
     * ✅ Cancels logout and resets timers.
     */
    cancelLogout() {
      this.resetTimers();
      this.startInactivityTimer();
    },
  },
});
