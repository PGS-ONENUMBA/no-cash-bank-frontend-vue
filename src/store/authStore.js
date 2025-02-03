import { defineStore } from "pinia";
import { loginAPI } from "@/services/authService";
import { debounce } from "lodash"; // For better performance
export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    tokenExpiry: null,
    inactivityTimeout: null, // Main inactivity timer
    warningTimeout: null, // Warning timer
    showWarning: false, // Controls warning display
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isTokenExpired: (state) => state.tokenExpiry && Date.now() > state.tokenExpiry,
  },

  actions: {
    /**
     * Logs in the user and sets authentication state.
     */
    async login(username, password) {
        // console.log("🔹 Calling login API...");
        
        if (this.token) {
          // console.warn("⚠ Already logged in, skipping API call.");
          return;
        }
  
        try {
          // console.log(`🔹 Sending login request for: ${username}`);
          const data = await loginAPI(username, password);
          // console.log("✅ Login successful. API Response:", data);
  
          this.token = data.token;
          this.refreshToken = data.refresh_token;
          this.tokenExpiry = Date.now() + 1200 * 1000; // 20 min expiry
          this.user = data;

          this.startInactivityTimer(); // Start tracking inactivity
  
          // console.log("✅ Setting authentication state...");
          // console.log("🔄 Updated store values:", this.$state);
  
          return true;
        } catch (error) {
          // console.error("❌ Login failed:", error.message);
          throw error;
        }
    },

    /**
     * Logs out the user and clears authentication state.
     */
    logout() {
      // console.warn("⚠ Logging out...");
      this.$reset();
    },

    /**
     * Updates the authentication token.
     */
    setToken(newToken) {
      // console.log("🔄 Updating token...");
      this.token = newToken;
      this.tokenExpiry = Date.now() + 1200 * 1000;
    },

    /**
     * Starts the inactivity tracking.
     */
    startInactivityTimer() {
      this.resetTimers(); // Reset any existing timers

      // Set warning before logout (e.g., 9 minutes)
      this.warningTimeout = setTimeout(() => {
        this.showWarning = true; // Show warning modal
      }, 0.5 * 60 * 1000); // 9 minutes

      // Set auto-logout after warning (e.g., 1 more minute)
      this.inactivityTimeout = setTimeout(() => {
        if (this.showWarning) {
          this.logoutUser();
        }
      }, 1 * 60 * 1000); // 10 minutes
    },

    /**
     * Resets the inactivity timers and warning.
     */
    resetTimers() {
      clearTimeout(this.warningTimeout);
      clearTimeout(this.inactivityTimeout);
      this.showWarning = false;
    },

    /**
     * User cancels logout, reset timers.
     */
    cancelLogout() {
      this.resetTimers();
      this.startInactivityTimer();
    },
  },
});
