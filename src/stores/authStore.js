import { defineStore } from "pinia";
import { loginAPI, refreshToken } from "@/services/authService";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    refreshToken: localStorage.getItem("refresh_token") || null,
    tokenExpiry: parseInt(localStorage.getItem("token_expiry"), 10) || null,
    inactivityTimeout: null,
    warningTimeout: null,
    tokenRefreshInterval: null,
    showWarning: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isTokenExpired: (state) => state.tokenExpiry && Date.now() > state.tokenExpiry,
  },

  actions: {
    /**
     * ✅ Logs in the user and stores authentication data.
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

        // 🛠 Store user session in localStorage
        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("token", this.token);
        localStorage.setItem("refresh_token", this.refreshToken);
        localStorage.setItem("token_expiry", this.tokenExpiry);

        console.log(`🔑 Token expires in ${tokenExpiryMin} minutes`);

        this.startInactivityTimer(); // Start inactivity tracking
      } catch (error) {
        throw error;
      }
    },

    /**
     * ✅ Refreshes the authentication token before expiration.
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

            // 🔄 Update stored values
            localStorage.setItem("token", this.token);
            localStorage.setItem("token_expiry", this.tokenExpiry);

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
     * ✅ Logs out the user and clears stored authentication state.
     */
    logout() {
      console.log("🚀 Logging out user...");

      this.resetTimers();
      this.$reset(); // Reset Pinia state

      // Clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_expiry");

      const router = useRouter();
      router.push("/login").catch((err) =>
        console.warn("⚠ Router navigation error:", err)
      );
    },

    /**
     * ✅ Starts inactivity tracking and token refresh.
     */
    startInactivityTimer() {
      this.resetTimers();

      const warningTimeMs = (import.meta.env.VITE_INACTIVITY_WARNING_MIN || 9) * 60 * 1000;
      const autoLogoutTimeMs = (import.meta.env.VITE_AUTO_LOGOUT_MIN || 10) * 60 * 1000;

      console.log(
        `🕒 Setting inactivity timers: Warning at ${warningTimeMs / 1000}s, Logout at ${
          autoLogoutTimeMs / 1000
        }s`
      );

      // 🔥 Show warning before auto-logout
      this.warningTimeout = setTimeout(() => {
        this.showWarning = true;
        console.log("⚠ Warning: User will be logged out soon!");
      }, warningTimeMs);

      // ⏳ Auto logout on inactivity
      this.inactivityTimeout = setTimeout(() => {
        if (this.showWarning) {
          console.warn("⏳ Auto-logging out due to inactivity.");
          this.logout();
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
