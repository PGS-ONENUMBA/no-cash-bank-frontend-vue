import axios from "axios";

let CSRF = null;
let inflight = null;

// fetch CSRF using a plain axios instance with NO interceptors
const raw = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export function getCsrfToken() {
  return CSRF;
}

export async function getCsrf() {
  if (CSRF) return CSRF;
  if (inflight) return inflight;

  inflight = raw
    .get("/context-proxy/v1/csrf") // sets HttpOnly cookie; returns { ok, csrf }
    .then(({ data }) => {
      CSRF = data && data.ok ? data.csrf : null;
      inflight = null;
      return CSRF;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });

  return inflight;
}

export function resetCsrf() {
  CSRF = null;
  inflight = null;
}
