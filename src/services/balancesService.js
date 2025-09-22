import { api } from "@/services/http";

/**
 * Returns an array like:
 * [{ merchant_id, merchant_name, merchant_phone, balance_ngn }, ...]
 * Adjust `action_type` if your backend differs.
 */
export async function fetchVendorBalances() {
  const { data } = await api.post("/context-proxy/v1/proxy", {
    path: "/wp-json/nocash-bank/v1/action",
    method: "GET",
    body: { action_type: "get_vendor_balances" },
  });

  if (!data?.ok) throw new Error(data?.error || "Failed to load balances");
  // unwrap standard envelope { ok, status, data }
  return Array.isArray(data.data) ? data.data : [];
}
