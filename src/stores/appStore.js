import { defineStore } from "pinia";
import apiClient from "@/services/apiService"; // Axios instance

export const useAppStore = defineStore("app", {
  state: () => ({
    appAuthToken: null, // No need to persist this
  }),

  getters: {
    isAppAuthenticated: (state) => !!state.appAuthToken,
  },

  actions: {
    /**
     * ✅ Generates Basic Auth Token for App Authentication.
     * Uses credentials stored in environment variables.
     */
    generateAppAuthToken() {
      const username = import.meta.env.VITE_APP_USER_NAME;
      const password = import.meta.env.VITE_APP_USER_PASSWORD;

      if (!username || !password) {
        console.error("❌ Missing App Credentials in .env");
        return null;
      }

      return `Basic ${btoa(`${username}:${password}`)}`;
    },

    /**
     * ✅ Makes an API request with dynamic Basic Auth.
     * @param {String} endpoint - API endpoint.
     * @param {Object} data - Payload.
     * @returns {Promise<Object>} - API Response.
     */
    async makeApiRequest(endpoint, data = {}) {
      try {
        const token = this.generateAppAuthToken();

        if (!token) {
          throw new Error("❌ App authentication token missing.");
        }

        const response = await apiClient.post(endpoint, data, {
          headers: { Authorization: token },
        });

        return response.data;
      } catch (error) {
        console.error("❌ Error making API request:", error);
        return null;
      }
    },
  },
});
