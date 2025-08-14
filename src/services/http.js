import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  try {
    const url = String(config.url || "");
    const needsCsrf =
      url.includes("/context-proxy/v1/") ||
      url.includes("/nocash/v1/squad/") || // keep if you still use Squad CSRF too
      url.includes("/nocash/v1/action");   // if you still hit old proxy path

    if (!needsCsrf) return config;

    // lazy import to avoid cycles
    const { getCsrfToken, getCsrf } = await import("./csrf.js");
    if (!getCsrfToken() || String(getCsrfToken()).length < 8) await getCsrf();

    config.headers = {
      ...(config.headers || {}),
      "X-CSRF-Token": getCsrfToken() || "",
      "Content-Type": config.headers?.["Content-Type"] || "application/json",
    };
    config.withCredentials = true;
  } catch { /* empty */ }
  return config;
});
