import { api } from "./http";

// p = { email, amount(kobo), currency, transaction_ref, payment_channels, metadata, ... }
export async function initiatePayment(p) {
  const { data } = await api.post("/nocash/v1/squad/initiate", p);
  return data; // look for data.data.checkout_url
}

export async function verifyTransaction(reference) {
  const { data } = await api.post("/nocash/v1/squad/verify", { reference });
  return data;
}
