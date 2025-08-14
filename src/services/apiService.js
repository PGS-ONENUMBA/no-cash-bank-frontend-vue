import axios from "axios";
import { useAuthStore } from "@/stores/authStore"; // Customer Authentication Store

// Base URL only; DO NOT keep Basic creds in .env anymore.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// One axios instance for everything
const apiClient = axios.create({
  baseURL: API_BASE_URL,           // e.g. http://localhost/.../wp-json
  withCredentials: true,           // required for HttpOnly cookie + CSRF
  headers: { "Content-Type": "application/json" },
});

/* ---------------------------
   CSRF (Context Proxy)
---------------------------- */
let CSRF = null;

async function ensureCsrf() {
  if (CSRF) return CSRF;
  // Context Proxy issues cookie + returns csrf
  const { data } = await apiClient.get("/context-proxy/v1/csrf");
  if (data && data.ok && data.csrf) CSRF = data.csrf;
  return CSRF;
}

// Auto-attach CSRF for proxy calls
apiClient.interceptors.request.use(async (config) => {
  try {
    const url = String(config.url || "");
    const needsCsrf =
      url.includes("/context-proxy/v1/"); // all proxy calls require CSRF

    if (!needsCsrf) return config;

    await ensureCsrf();
    config.headers = {
      ...(config.headers || {}),
      "X-CSRF-Token": CSRF || "",
      "Content-Type": config.headers?.["Content-Type"] || "application/json",
    };
    config.withCredentials = true;
  } catch {
    // no-op; server will reject if CSRF missing
  }
  return config;
});

/* ---------------------------
   Bearer (customer JWT)
---------------------------- */
const getAuthHeaders = async () => {
  const authStore = useAuthStore();
  if (!authStore.token) {
    console.warn("❌ No authentication token found. User may not be logged in.");
    throw new Error("Missing authentication token");
  }

  // Optional: validate token server-side before use
  await axios.post(
    `${API_BASE_URL}/jwt-auth/v1/token/validate`,
    {},
    { headers: { Authorization: `Bearer ${authStore.token}` }, withCredentials: true }
  );

  return { Authorization: `Bearer ${authStore.token}` };
};

/* ---------------------------
   POST wrapper
   - useBasicAuth === true  -> route via Context Proxy (server does Basic)
   - else                   -> send Bearer (customer) to the endpoint
---------------------------- */
export const post = async (endpoint, data = {}, useBasicAuth = false) => {
  try {
    if (useBasicAuth) {
      // If you’re calling your nocash-bank action endpoint, use the opinionated proxy:
      if (endpoint.includes("/nocash-bank/v1/action")) {
        const res = await apiClient.post("/context-proxy/v1/action", data);
        return res.data;
      }

      // Otherwise use the generic proxy (must be allowlisted server-side)
      const res = await apiClient.post("/context-proxy/v1/proxy", {
        path: endpoint,        // e.g. "/wp-json/your-namespace/v1/whatever"
        method: "POST",
        body: data,
      });
      return res.data;
    }

    // Customer-authenticated call (Bearer)
    const headers = await getAuthHeaders();
    const res = await apiClient.post(endpoint, data, { headers });
    return res.data;
  } catch (error) {
    console.error(`❌ POST request failed: ${endpoint}`, error);
    throw error;
  }
};

export default apiClient;

/* ---------------------------
   Optional sugar methods
---------------------------- */
// Mirrors your old Basic flow for nocash-bank actions:
export const postAction = async (payload) => {
  const res = await apiClient.post("/context-proxy/v1/action", payload);
  return res.data;
};

// If you need generic proxying to another allowlisted path:
export const proxyPost = async (path, body) => {
  const res = await apiClient.post("/context-proxy/v1/proxy", { path, method: "POST", body });
  return res.data;
};
