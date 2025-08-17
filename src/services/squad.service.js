// src/services/squad.service.js
import { api } from "@/services/http"; // axios with CSRF interceptor to Context Proxy

export async function initiatePayment(payload) {
  // payload = { email, amount(kobo), currency, transaction_ref, payment_channels, metadata, ... }
  const res = await api.post("/context-proxy/v1/squad/initiate", payload);

  // The proxy wraps downstream response as { ok, status, data }
  // Squad returns checkout_url either at data.data.checkout_url or data.checkout_url
  const checkout =
    res?.data?.data?.data?.checkout_url || res?.data?.data?.checkout_url;

  if (!checkout) throw new Error("No checkout_url from server");
  return { checkout_url: checkout };
}

export async function verifyTransaction(reference) {
  const res = await api.post("/context-proxy/v1/squad/verify", { reference });
  return res.data; // you can inspect res.data.data.transaction_status === "success"
}
