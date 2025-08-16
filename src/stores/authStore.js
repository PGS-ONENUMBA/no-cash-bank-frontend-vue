import { defineStore } from "pinia";
import router from "@/router";
import { loginUser, refreshToken, logout as logoutAPI } from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,

    token: localStorage.getItem("auth_token") || null,
    // Keep this key optional; refresh now relies on HttpOnly cookie server-side.
    refreshToken: localStorage.getItem("refresh_token") || null,
    tokenExpiry: Number(localStorage.getItem("token_expiry")) || null,

    inactivityTimeout: null,
    warningTimeout: null,
    tokenRefreshInterval: null,          // ✅ ensure we can clear it later
    showWarning: false,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
    isTokenExpired:  (s) => !!s.tokenExpiry && Date.now() > s.tokenExpiry,
  },

  actions: {
    /**
     * Login and initialize session tracking.
     */
    async login(username, password, routerInstance) {
      if (this.token) return; // already logged in

      const data = await loginUser(username, password);

      // You may read actual TTL from server if provided; we keep env fallback.
      const tokenExpiryMin = parseInt(import.meta.env.VITE_TOKEN_EXPIRY_MIN) || 20;

      this.token = data?.data?.token || null;
      // If server returns refresh_token in body, you may store it; cookie is preferred.
      this.refreshToken = data?.data?.refresh_token || null;
      this.tokenExpiry = Date.now() + tokenExpiryMin * 60 * 1000;
      this.user = data?.data || null;

      // persist minimal items
      localStorage.setItem("auth_token", this.token || "");
      localStorage.setItem("token_expiry", String(this.tokenExpiry));
      if (this.refreshToken) localStorage.setItem("refresh_token", this.refreshToken);

      this.startInactivityTimer(routerInstance);

      if (routerInstance) {
        setTimeout(() => {
          routerInstance.push("/dashboard").catch((err) =>
            console.error("❌ Router navigation error:", err)
          );
        }, 300);
      }
    },

    /**
     * Refresh JWT using HttpOnly cookie (server-side).
     * Do not require refresh_token in JS; cookie handles it.
     */
    async refreshTokenIfNeeded() {
      const bufferMs = (parseInt(import.meta.env.VITE_TOKEN_REFRESH_BUFFER_MIN) || 2) * 60 * 1000;
      if (this.tokenExpiry && Date.now() > this.tokenExpiry - bufferMs) {
        try {
          const data = await refreshToken();   // may return { token, refresh_token? }
          if (data?.token) {
            this.token = data.token;
            localStorage.setItem("auth_token", this.token);

            const mins = parseInt(import.meta.env.VITE_TOKEN_EXPIRY_MIN) || 20;
            this.tokenExpiry = Date.now() + mins * 60 * 1000;
            localStorage.setItem("token_expiry", String(this.tokenExpiry));

            // Optional if server returns it; otherwise rely on cookie
            if (data.refresh_token) {
              this.refreshToken = data.refresh_token;
              localStorage.setItem("refresh_token", data.refresh_token);
            }
            console.log("✅ Token refreshed");
          } else {
            console.warn("⚠ Token refresh failed, logging out…");
            this.logout();
          }
        } catch (err) {
          console.error("❌ Token refresh error:", err);
          this.logout();
        }
      }
    },

    /**
     * Logout, clear state/storage, tell server to clear cookie, redirect to login.
     */
    async logout(routerInstance = null) {
      this.resetTimers();

      // Clear store & localStorage
      this.$reset();
      localStorage.removeItem("auth");           // pinia persist key
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_expiry");
      localStorage.removeItem("user");

      try {
        await logoutAPI(); // clear HttpOnly refresh cookie on server
      } catch (err) {
        console.warn("⚠ Logout API failed (continuing):", err);
      }

      const r = routerInstance || router;
      if (r) r.push("/login").catch(() => {});
    },

    /**
     * Inactivity + periodic refresh
     */
    startInactivityTimer(routerInstance) {
      this.resetTimers();

      const warnMs = (parseInt(import.meta.env.VITE_INACTIVITY_WARNING_MIN) || 9) * 60 * 1000;
      const autoMs = (parseInt(import.meta.env.VITE_AUTO_LOGOUT_MIN) || 10) * 60 * 1000;

      this.warningTimeout = setTimeout(() => {
        this.showWarning = true;
      }, warnMs);

      this.inactivityTimeout = setTimeout(() => {
        if (this.showWarning) this.logout(routerInstance);
      }, autoMs);

      this.tokenRefreshInterval = setInterval(() => {
        this.refreshTokenIfNeeded();
      }, 60 * 1000);
    },

    resetTimers() {
      clearTimeout(this.warningTimeout);
      clearTimeout(this.inactivityTimeout);
      clearInterval(this.tokenRefreshInterval);
      this.warningTimeout = null;
      this.inactivityTimeout = null;
      this.tokenRefreshInterval = null;
      this.showWarning = false;
    },

    cancelLogout() {
      this.resetTimers();
      this.startInactivityTimer();
    },

    setToken(token) {
      this.token = token;
      if (token) localStorage.setItem("auth_token", token);
      else localStorage.removeItem("auth_token");
    },

    setUser(userData) {
      this.user = userData;
      if (userData) localStorage.setItem("user", JSON.stringify(userData));
      else localStorage.removeItem("user");
    },

    clearAuth() {
      this.setToken(null);
      this.setUser(null);
      this.tokenExpiry = null;
      localStorage.removeItem("token_expiry");
      localStorage.removeItem("refresh_token");
    },
  },

  // Pinia persistence (minimal)
  persist: {
    enabled: true,
    strategies: [{ key: "auth", storage: localStorage }],
  },
});
