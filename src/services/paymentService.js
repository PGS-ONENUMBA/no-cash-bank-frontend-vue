// src/services/paymentService.js  (drop-in)

import { api } from "@/services/http"; // axios instance with baseURL, withCredentials, CSRF interceptor

const PROXY_ACTION  = "/context-proxy/v1/action";  // opinionated action proxy
const PROXY_GENERIC = "/context-proxy/v1/proxy";   // allowlisted generic proxy

/**
 * Validate product pricing for a given raffle cycle ID.
 * Server forwards GET upstream; browser always POSTs to the proxy.
 * @param {number|string} raffleCycleId
 * @returns {Promise<Object|null>}
 */
export const validateProductPricing = async (raffleCycleId) => {
  try {
    const res = await api.post(PROXY_ACTION, {
      action_type: "get_raffle_cycle_by_id",
      raffle_cycle_id: Number(raffleCycleId),
    });
    // proxy shape: { ok, status, data: {...upstream...} }
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("❌ Error fetching product by ID:", err);
    return null;
  }
};

/**
 * Create order and log to DB. Returns upstream payload (should contain order_id).
 * @param {{
 *  phoneNumber:string,
 *  tickets:number,
 *  amount:number,
 *  raffle_cycle_id:number|string,
 *  vendor_id?:string|number,
 *  amount_due?:number,
 *  email?:string
 * }} payload
 */
export const createOrder = async (payload) => {
  try {
    const res = await api.post(PROXY_ACTION, {
      action_type: "create_order",
      customer_email: payload.email || "",
      amount_due: payload.amount_due ?? "",         // vendor payout (optional)
      vendor_id: payload.vendor_id ?? "",
      customer_phone: payload.phoneNumber,
      ticket_quantity: Number(payload.tickets),
      order_amount: Number(payload.amount),
      raffle_cycle_id: Number(payload.raffle_cycle_id),
      purchase_platform: "web",
      payment_method_used: "card",
    });
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("❌ Error creating order:", err);
    return null;
  }
};

/**
 * Initiate Squad payment via the server (no secrets in the browser).
 * Server (Context Proxy) calls /nocash/v1/squad/initiate and injects X-Plugin-Token.
 * @param {{ email:string, amount:number, trans_ref:string }} payload
 * @returns {Promise<{status:"redirected", checkout_url:string}>}
 */
export const processPayment = async ({ email, amount, trans_ref }) => {
  const res = await api.post(PROXY_GENERIC, {
    path: "/wp-json/nocash/v1/squad/initiate",
    method: "POST",
    body: {
      email,
      amount: Math.round(Number(amount) * 100), // ₦ → kobo
      currency: "NGN",
      transaction_ref: trans_ref,
      payment_channels: ["card", "bank", "ussd", "transfer"],
      metadata: { order_id: trans_ref },
    },
  });

  const payload = res.data?.data ?? res.data;
  const checkout =
    payload?.data?.data?.checkout_url ||
    payload?.data?.checkout_url ||
    payload?.checkout_url;

  if (!checkout) {
    console.error("Initiate response (missing checkout_url):", payload);
    throw new Error("Missing checkout_url from payment initiate");
  }

  window.location.href = checkout; // Squad-hosted modal
  return { status: "redirected", checkout_url: checkout };
};

/**
 * Verify Squad transaction (optional if you rely on webhooks).
 * @param {string} transRef
 */
export const verifyPayment = async (transRef) => {
  const res = await api.post(PROXY_GENERIC, {
    path: "/wp-json/nocash/v1/squad/verify",
    method: "POST",
    body: { reference: transRef },
  });
  return res.data?.data ?? res.data; // check .data.transaction_status === "success"
};

/**
 * Update the earlier created order after verification.
 * @param {string|number} transactionReference
 * @param {string} transactionType
 * @param {number} transactionAmount
 */
export const updateOrderStatus = async (
  transactionReference,
  transactionType,
  transactionAmount
) => {
  try {
    const res = await api.post(PROXY_ACTION, {
      action_type: "complete_order",
      order_id: transactionReference,
      amount: Number(transactionAmount),
      payment_method_used: transactionType,
    });
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("❌ Error updating order:", err);
    return null;
  }
};
