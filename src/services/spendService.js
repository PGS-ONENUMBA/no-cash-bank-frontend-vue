import { api } from "@/services/http";

/**
 * Spend from customer’s vendor-locked balance into that merchant’s wallet.
 * Backend should verify auth (password or pin) for the current session user.
 *
 * @param {Object} p
 * @param {number|string} p.merchantId
 * @param {number} p.amount     (in NGN)
 * @param {string} [p.pin]      (optional)
 * @param {string} [p.password] (optional)
 */
export async function spendAtMerchant({ merchantId, amount, pin, password }) {
  const payload = {
    action_type: "spend_at_merchant",
    merchant_id: merchantId,
    amount: Number(amount),
    // include only the field user provided; backend can accept either
    ...(pin ? { pin } : {}),
    ...(password ? { password } : {}),
  };

  const { data } = await api.post("/context-proxy/v1/proxy", {
    path: "/wp-json/nocash-bank/v1/action",
    method: "POST",
    body: payload,
  });

  if (!data?.ok) {
    const msg = data?.data?.message || data?.error || "Payment failed";
    const code = data?.status || 400;
    const error = new Error(msg);
    error.code = code;
    throw error;
  }

  return data.data; // expected: { success, message, new_balance, txn_ref, ... }
}
