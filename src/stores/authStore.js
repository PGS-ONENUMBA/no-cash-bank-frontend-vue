// src/stores/authStore.js
import { defineStore } from "pinia";
import router from "@/router";
import { loginUser, refreshToken, logout as logoutAPI } from "@/services/authService";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,

    token: localStorage.getItem("auth_token") || null,
    // Kept for now in case you still use it; but refresh is via HttpOnly cookie primarily
    refreshToken: localStorage.getItem("refresh_token") || null,
    tokenExpiry: Number(localStorage.getItem("token_expiry")) || null,
  }),

  getters: {
    isAuthenticated: (s) => !!s.token,
    isTokenExpired: (s) => !!s.tokenExpiry && Date.now() > s.tokenExpiry,
  },

  actions: {
    /**
     * Login and set auth state.
     * Router navigation handled here.
     */
    async login(username, password, routerInstance) {
      if (this.token) return; // already logged in

      const data = await loginUser(username, password);

      const tokenExpiryMin = parseInt(import.meta.env.VITE_TOKEN_EXPIRY_MIN) || 20;

      this.token = data?.data?.token || null;
      this.refreshToken = data?.data?.refresh_token || null;
      this.tokenExpiry = Date.now() + tokenExpiryMin * 60 * 1000;
      this.user = data?.data || null;

      localStorage.setItem("auth_token", this.token || "");
      localStorage.setItem("token_expiry", String(this.tokenExpiry));
      if (this.refreshToken) localStorage.setItem("refresh_token", this.refreshToken);

      const r = routerInstance || router;
      if (r) {
        r.push("/dashboard").catch((err) =>
          console.error("❌ Router navigation error:", err)
        );
      }
    },

    /**
     * Optional: still keep token refresh helper if you call it from an interceptor.
     */
    async refreshTokenIfNeeded() {
      const bufferMs =
        (parseInt(import.meta.env.VITE_TOKEN_REFRESH_BUFFER_MIN) || 2) *
        60 *
        1000;
      if (this.tokenExpiry && Date.now() > this.tokenExpiry - bufferMs) {
        try {
          const data = await refreshToken();
          if (data?.token) {
            this.token = data.token;
            localStorage.setItem("auth_token", this.token);

            const mins =
              parseInt(import.meta.env.VITE_TOKEN_EXPIRY_MIN) || 20;
            this.tokenExpiry = Date.now() + mins * 60 * 1000;
            localStorage.setItem("token_expiry", String(this.tokenExpiry));

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
     * Logout: clear state, tell server to clear cookie, redirect to login.
     */
    async logout(routerInstance = null) {
      // Clear store & localStorage
      this.$reset();
      localStorage.removeItem("auth"); // pinia persist key
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_expiry");
      localStorage.removeItem("user");

      try {
        await logoutAPI(); // clears HttpOnly refresh cookie server-side
      } catch (err) {
        console.warn("⚠ Logout API failed (continuing):", err);
      }

      const r = routerInstance || router;
      if (r) r.push("/login").catch(() => {});
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

  persist: {
    enabled: true,
    strategies: [{ key: "auth", storage: localStorage }],
  },
});
