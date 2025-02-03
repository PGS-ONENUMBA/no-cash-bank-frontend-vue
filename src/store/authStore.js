import { defineStore } from "pinia";
import { loginAPI } from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    tokenExpiry: null,
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
        console.log("🔹 Calling login API...");
        
        if (this.token) {
          console.warn("⚠ Already logged in, skipping API call.");
          return;
        }
  
        try {
          console.log(`🔹 Sending login request for: ${username}`);
          const data = await loginAPI(username, password);
          console.log("✅ Login successful. API Response:", data);
  
          this.token = data.token;
          this.refreshToken = data.refresh_token;
          this.tokenExpiry = Date.now() + 1200 * 1000; // 20 min expiry
          this.user = data;
  
          console.log("✅ Setting authentication state...");
          console.log("🔄 Updated store values:", this.$state);
  
          return true;
        } catch (error) {
          console.error("❌ Login failed:", error.message);
          throw error;
        }
      },

    /**
     * Logs out the user and clears authentication state.
     */
    logout() {
      console.warn("⚠ Logging out...");
      this.$reset();
    },

    /**
     * Updates the authentication token.
     */
    setToken(newToken) {
      console.log("🔄 Updating token...");
      this.token = newToken;
      this.tokenExpiry = Date.now() + 1200 * 1000;
    },
  },
});
