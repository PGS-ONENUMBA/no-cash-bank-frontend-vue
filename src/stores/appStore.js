import { defineStore } from "pinia";
import { api } from "@/services/http";            // axios w/ CSRF + withCredentials
import { proxyAction } from "@/services/apiService"; // helper that posts to /context-proxy/v1/action

export const useAppStore = defineStore("app", {
  state: () => ({}),

  actions: {
    /**
     * Call a No-Cash-Bank action through the Context Proxy.
     * @param {string} action_type
     * @param {object} [params]
     * @param {number} [timeout=8000]
     * @returns {Promise<any>}
     */
    async callAction(action_type, params = {}, timeout = 8000) {
      return proxyAction(action_type, params, { timeout });
    },

    /**
     * Generic allowlisted proxy (if you need to hit a non-action endpoint server-side).
     * Requires the path to be allowlisted in the Context Proxy plugin.
     * @param {string} path - e.g. "/wp-json/nocash/v1/squad/initiate"
     * @param {string} [method="POST"]
     * @param {object|null} [body=null]
     * @param {number} [timeout=8000]
     */
    async proxy(path, method = "POST", body = null, timeout = 8000) {
      const res = await api.post(
        "/context-proxy/v1/proxy",
        { path, method, body },
        { timeout }
      );
      return res?.data?.data ?? res?.data;
    },
  },
});
