import axios from "axios";

// Example: VITE_API_BASE_URL="https://backend.paybychance.com/wp-json"
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // needed for HttpOnly cookie
});

// REQUEST interceptor — attach CSRF to protected routes (but not to /csrf itself)
api.interceptors.request.use(async (config) => {
  try {
    const url = String(config?.url || "");

    // do NOT attach CSRF when fetching the CSRF itself
    const isCsrfPath = url.includes("/context-proxy/v1/csrf");

    // attach CSRF for these namespaces
    const needsCsrf =
      !isCsrfPath &&
      (
        url.includes("/context-proxy/v1/") || // context-proxy endpoints
        url.includes("/nocash/v1/squad/")   || // (if still using Squad plugin with same CSRF)
        url.includes("/nocash/v1/action")      // legacy path (if still in use)
      );

    if (!needsCsrf) return config;

    // lazy import to avoid circular deps
    const { getCsrfToken, getCsrf } = await import("./csrf.js");

    if (!getCsrfToken() || String(getCsrfToken()).length < 8) {
      await getCsrf(); // uses a raw axios instance; won't hit this interceptor
    }

    config.headers = {
      ...(config.headers || {}),
      // use lowercase to match picky CORS/proxies during preflight echo
      "x-csrf-token": getCsrfToken() || "",
      "content-type": config.headers?.["Content-Type"] || config.headers?.["content-type"] || "application/json",
    };

    config.withCredentials = true;
  } catch {
    // noop — server will reject if CSRF is required
  }
  return config;
});

// RESPONSE interceptor — refresh CSRF & retry once on 401
const retried = new WeakSet();

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const cfg   = error?.config;
    const url   = String(cfg?.url || "");
    const code  = error?.response?.status;

    const isProtected =
      url.includes("/context-proxy/v1/") ||
      url.includes("/nocash/v1/squad/") ||
      url.includes("/nocash/v1/action");

    const canRetry = cfg && isProtected && code === 401 && !retried.has(cfg);

    if (!canRetry) throw error;

    try {
      const { resetCsrf, getCsrf, getCsrfToken } = await import("./csrf.js");
      resetCsrf();
      await getCsrf();
      retried.add(cfg);

      cfg.headers = {
        ...(cfg.headers || {}),
        "x-csrf-token": getCsrfToken() || "",
        "content-type": cfg.headers?.["content-type"] || "application/json",
      };
      cfg.withCredentials = true;

      return api.request(cfg);
    } catch {
      throw error;
    }
  }
);
