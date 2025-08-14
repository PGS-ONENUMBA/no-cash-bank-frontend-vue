import { api } from "./http";

let CSRF = null;

// Prefer the new Context Proxy CSRF endpoint
export async function getCsrf() {
  const { data } = await api.get("/context-proxy/v1/csrf");
  if (data && data.ok && data.csrf) CSRF = data.csrf;
  return CSRF;
}
export function getCsrfToken() { return CSRF; }
export function resetCsrf() { CSRF = null; }
