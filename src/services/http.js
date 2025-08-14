import axios from "axios";

// Example: VITE_API_BASE_URL="http://localhost/.../wp-json"
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  try {
    const url = String(config.url || "");
    const isCsrfPath =
      url.includes("/context-proxy/v1/csrf"); // ⬅️ EXEMPT this path

    const needsCsrf =
      !isCsrfPath &&
      (
        url.includes("/context-proxy/v1/") ||   // all proxy endpoints
        url.includes("/nocash/v1/squad/") ||    // if you still use Squad plugin CSRF
        url.includes("/nocash/v1/action")       // legacy path (if still in use)
      );

    if (!needsCsrf) return config;

    // lazy import to avoid hard circular deps
    const mod = await import("./csrf.js");
    const getToken = mod.getCsrfToken?.bind(mod);
    const fetchCsrf = mod.getCsrf?.bind(mod);

    if (!getToken || !fetchCsrf) return config;
    if (!getToken() || String(getToken()).length < 8) {
      await fetchCsrf(); // uses raw axios; doesn't trigger this interceptor
    }

    config.headers = {
      ...(config.headers || {}),
      "X-CSRF-Token": getToken() || "",
      "Content-Type": config.headers?.["Content-Type"] || "application/json",
    };
    config.withCredentials = true;
  } catch {
    // noop; server will reject if CSRF is required
  }
  return config;
});
