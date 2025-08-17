// src/services/paymentService.js
import { api } from "@/services/http";

/** Context Proxy opinionated + dedicated paths */
const PROXY_ACTION   = "/context-proxy/v1/action";        // forwards to /nocash-bank/v1/action
const PROXY_SQUAD_INIT = "/context-proxy/v1/squad/initiate"; // forwards to /nocash/v1/squad/initiate
const PROXY_SQUAD_VERIFY = "/context-proxy/v1/squad/verify"; // forwards to /nocash/v1/squad/verify

/**
 * Validates product pricing for a given raffle cycle ID.
 * Browser always POSTs to the Context Proxy; server converts to GET upstream when needed.
 *
 * @param {number|string} raffleCycleId - Raffle cycle ID to fetch.
 * @returns {Promise<Object|null>} The upstream payload (e.g., {success, raffle_cycle}) or null on error.
 */
export const validateProductPricing = async (raffleCycleId) => {
  try {
    const res = await api.post(PROXY_ACTION, {
      action_type: "get_raffle_cycle_by_id",
      raffle_cycle_id: Number(raffleCycleId),
    });
    // Proxy wrapper format: { ok, status, data: <upstream payload> }
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("❌ Error fetching product by ID:", err);
    return null;
  }
};

/**
 * Creates an order in your backend and returns the upstream payload.
 *
 * @param {Object} payload
 * @param {string}  [payload.email]            - Customer email (optional).
 * @param {string}  payload.phoneNumber        - Customer phone number.
 * @param {number}  payload.tickets            - Number of tickets.
 * @param {number}  payload.amount             - Total ticket cost (NGN).
 * @param {number}  payload.raffle_cycle_id    - Raffle cycle ID.
 * @param {string|number} [payload.vendor_id]  - Selected vendor ID (optional).
 * @param {number} [payload.amount_due]        - Payment to vendor (optional).
 * @returns {Promise<Object|null>} Upstream payload (e.g., {success, order_id, ...}) or null on error.
 */
export const createOrder = async (payload) => {
  try {
    const res = await api.post(PROXY_ACTION, {
      action_type: "create_order",
      customer_email: payload.email || "",
      amount_due: payload.amount_due ?? "",            // vendor payout, optional
      vendor_id: payload.vendor_id ?? "",
      customer_phone: payload.phoneNumber,
      ticket_quantity: Number(payload.tickets),
      order_amount: Number(payload.amount),            // total ticket cost
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
 * Calls the server to initiate a Squad payment and redirects to the hosted checkout.
 *
 * SECURITY: no Squad secrets in the browser. The Context Proxy forwards with X-Plugin-Token.
 *
 * @param {Object} args
 * @param {string} args.email       - Customer email (used by Squad).
 * @param {number} args.amount      - Amount in NGN (will be converted to kobo).
 * @param {string} args.trans_ref   - Unique transaction reference (your order_id).
 * @returns {Promise<{status:"redirected", checkout_url:string}>}
 * @throws {Error} If the server did not return a checkout_url.
 */
export const processPayment = async ({ email, amount, trans_ref }) => {
  // kobo conversion on the server call
  const res = await api.post(PROXY_SQUAD_INIT, {
    email,
    amount: Math.round(Number(amount) * 100), // NGN → kobo
    currency: "NGN",
    transaction_ref: trans_ref,
    payment_channels: ["card", "bank", "ussd", "transfer"],
    metadata: { order_id: trans_ref },
  });

  // Proxy wrapper → upstream result (Squad)
  // checkout_url might be at data.data.checkout_url or data.checkout_url depending on upstream
  const checkout =
    res?.data?.data?.data?.checkout_url || res?.data?.data?.checkout_url;

  if (!checkout) throw new Error("No checkout_url from server");

  // Redirect to Squad-hosted checkout (modal/hosted page)
  window.location.href = checkout;
  return { status: "redirected", checkout_url: checkout };
};

/**
 * Verifies a Squad transaction by reference (optional; webhooks are the source of truth).
 *
 * @param {string} transRef - Transaction reference you passed in initiate.
 * @returns {Promise<Object>} Upstream payload (e.g., { data: { transaction_status: "success", ... } })
 */
export const verifyPayment = async (transRef) => {
  const res = await api.post(PROXY_SQUAD_VERIFY, { reference: transRef });
  return res.data?.data ?? res.data;
};

/**
 * Updates an order in your backend after successful verification.
 *
 * @param {string|number} transactionReference - Your order_id / transaction_ref
 * @param {string} transactionType             - e.g. "Card"
 * @param {number} transactionAmount           - Amount paid (NGN)
 * @returns {Promise<Object|null>} Upstream payload or null on error
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
