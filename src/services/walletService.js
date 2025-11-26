// src/services/walletService.js
import { api } from "@/services/http";

/**
 * Fetch wallet summary for the *currently authenticated vendor*.
 * Backend: GET /context-proxy/v1/vendor/summary
 *
 * Expected response:
 *   { ok: true, status: 200, data: { balance_ngn: "12345.67", ... } }
 */
export async function fetchVendorWalletSummary() {
  const res = await api.get("/context-proxy/v1/vendor/summary");

  if (!res?.data?.ok) {
    throw new Error(res?.data?.error || "Failed to load wallet summary");
  }

  // returns the `data` block only
  return res.data.data || {};
}
