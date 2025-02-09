import { defineStore } from "pinia";
import { loginUser, refreshToken } from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,

    token: localStorage.getItem("auth_token") || null,
    refreshToken: localStorage.getItem("refresh_token") || null,
    tokenExpiry: localStorage.getItem("token_expiry") || null, // ✅ Persist token expiry

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
    async login(username, password, routerInstance) {
      if (this.token) return;
    
      try {
        const data = await loginUser(username, password);
        const tokenExpiryMin = parseInt(import.meta.env.VITE_TOKEN_EXPIRY_MIN) || 20;
    
        this.token = data.data.token; // ✅ Ensure correct token path
        this.refreshToken = data.data.refresh_token;
        this.tokenExpiry = Date.now() + tokenExpiryMin * 60 * 1000;
        this.user = data.data;
    
        console.log(`🔑 Token expires in ${tokenExpiryMin} minutes`);
        this.startInactivityTimer();
    
        if (routerInstance) {
          console.log("✅ Redirecting from authStore...");
          setTimeout(() => {
            routerInstance.push("/dashboard").catch(err =>
              console.error("❌ Router navigation error:", err)
            );
          }, 500);
        }
      } catch (error) {
        console.error("❌ Login failed:", error);
        throw error;
      }
    },
    
    

    /**
     * ✅ Refreshes the Customer's JWT access token using the refresh token.
     * Prevents logout if refresh is successful.
     */
    async refreshTokenIfNeeded() {
      const bufferTimeMs = (parseInt(import.meta.env.VITE_TOKEN_REFRESH_BUFFER_MIN) || 2) * 60 * 1000; // Refresh 2 min before expiry
    
      if (this.tokenExpiry && Date.now() > this.tokenExpiry - bufferTimeMs) {
        console.log("🔄 Refreshing token before expiry...");
    
        try {
          const data = await refreshToken();
          if (data?.token && data?.refresh_token) {
            this.token = data.token;
            this.refreshToken = data.refresh_token;  // ✅ Always store the latest refresh token
            this.tokenExpiry = Date.now() + (parseInt(import.meta.env.VITE_TOKEN_EXPIRY_MIN) || 20) * 60 * 1000;
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
    }
    ,

    /**
     * ✅ Logs out the user, clears data, and redirects.
     */
    logout(routerInstance = null) {
      console.log("🚀 Logging out user...");
    
      this.resetTimers();
      this.$reset(); // Reset Pinia state
      localStorage.removeItem("auth");
      localStorage.removeItem("refresh_token");
      document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
     * ✅ Starts inactivity tracking and auto-logout.
     */
    startInactivityTimer(routerInstance) {
      this.resetTimers();

      const warningTimeMs = (parseInt(import.meta.env.VITE_INACTIVITY_WARNING_MIN) || 9) * 60 * 1000;
      const autoLogoutTimeMs = (parseInt(import.meta.env.VITE_AUTO_LOGOUT_MIN) || 10) * 60 * 1000;

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
     * ✅ Resets inactivity timers and warnings.
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
    setToken(token) {
      this.token = token;
      localStorage.setItem("auth_token", token); // Persist token
    },
    setUser(userData) {
      this.user = userData;
      localStorage.setItem("user", JSON.stringify(userData)); // Persist user
    },
    clearAuth() {
      this.token = null;
      this.user = null;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  },

  // ✅ Enable Pinia Persistence
  persist: {
    enabled: true,
    strategies: [
      {
        key: "auth",
        storage: localStorage, // Use sessionStorage if needed
      },
    ],
  },
});
