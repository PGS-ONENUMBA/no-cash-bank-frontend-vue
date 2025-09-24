// src/services/paymentService.js
import { api } from "@/services/http";

/** Context Proxy endpoints */
const PROXY_ACTION = "/context-proxy/v1/action";                 // → /wp-json/nocash-bank/v1/action
const PROXY_SQUAD_VERIFY = "/context-proxy/v1/squad/verify";     // → /wp-json/nocash/v1/squad/verify
const PROXY_SQUAD_INITIATE = "/context-proxy/v1/squad/initiate"; // → /wp-json/nocash/v1/squad/initiate"

/**
 * Fetch authoritative pricing for a raffle cycle.
 * Proxy returns { ok, status, data }; we unwrap to data.
 *
 * @param {number|string} raffleCycleId
 * @returns {Promise<any|null>}
 */
export const validateProductPricing = async (raffleCycleId) => {
  try {
    const res = await api.post(PROXY_ACTION, {
      action_type: "get_raffle_cycle_by_id",
      raffle_cycle_id: Number(raffleCycleId),
    });
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("❌ Error fetching product by ID:", err);
    return null;
  }
};

/**
 * @typedef {Object} CreateOrderArgs
 * @property {string}  [customer_email]       Optional email.
 * @property {string}  [phoneNumber]          LEGACY alias for customer_phone.
 * @property {number}  [tickets]              LEGACY alias for ticket_quantity.
 * @property {number}  [amount]               LEGACY alias for order_amount.
 * @property {string}  [platform]             LEGACY alias for purchase_platform.
 * @property {string}  [paymentMethod]        LEGACY alias for payment_method_used.
 *
 * @property {string}  [customer_phone]       Canonical customer phone.
 * @property {number}  [ticket_quantity]      Canonical ticket count.
 * @property {number}  [order_amount]         Canonical amount (NGN).
 * @property {number}  raffle_cycle_id        Canonical raffle cycle id (required).
 * @property {number}  raffle_type_id         Canonical raffle type id (required; dynamic per form).
 * @property {number}  [vendor_id]            Only include if the selected type needs it.
 * @property {number}  [amount_due]           Optional vendor payout (if ever used).
 * @property {string}  [purchase_platform]    Defaults to "web".
 * @property {string}  [payment_method_used]  Defaults to "card".
 */

/**
 * Create an order with **dynamic raffle type**.
 *
 * IMPORTANT:
 * - `raffle_type_id` is **required** and comes from the form (don’t infer).
 * - If the chosen raffle type requires a vendor (e.g. type 2), pass `vendor_id`.
 * - We still accept legacy input names, but always POST canonical keys.
 *
 * @param {CreateOrderArgs} payload
 * @returns {Promise<any|null>} Upstream payload (proxy-unwrapped) or null on error
 */
export const createOrder = async (payload) => {
  try {
    // ---- Read inputs (support canonical and legacy field names) ----
    const customer_phone = String(
      payload.customer_phone ?? payload.phoneNumber ?? ""
    );
    const ticket_quantity = Number(
      payload.ticket_quantity ?? payload.tickets ?? 0
    );
    const order_amount = Number(
      payload.order_amount ?? payload.amount ?? 0
    );
    const raffle_cycle_id = Number(payload.raffle_cycle_id ?? 0);

    // Dynamic & required
    const hasType =
      payload.raffle_type_id !== undefined && payload.raffle_type_id !== null;
    const raffle_type_id = hasType ? Number(payload.raffle_type_id) : NaN;

    const vendor_id =
      payload.vendor_id === undefined ||
      payload.vendor_id === null ||
      payload.vendor_id === ""
        ? undefined
        : Number(payload.vendor_id);

    const purchase_platform = String(
      payload.purchase_platform ?? payload.platform ?? "web"
    );
    const payment_method_used = String(
      payload.payment_method_used ?? payload.paymentMethod ?? "card"
    );

    // ---- Minimal client-side validation (avoid sending obviously-bad bodies) ----
    if (!Number.isFinite(raffle_type_id)) {
      // Keep this strict so forms must supply the type explicitly
      throw new Error("raffle_type_id is required");
    }
    if (!customer_phone) throw new Error("customer_phone is required");
    if (!(ticket_quantity > 0)) throw new Error("ticket_quantity must be > 0");
    if (!(order_amount > 0)) throw new Error("order_amount must be > 0");
    if (!(raffle_cycle_id > 0)) throw new Error("raffle_cycle_id must be > 0");

    // Optional: enforce vendor for a known vendor type (backend already enforces this)
    // if (raffle_type_id === 2 && !vendor_id) {
    //   throw new Error("vendor_id is required for this raffle type");
    // }

    // ---- Canonical body (what the backend expects) ----
    /** @type {Record<string, any>} */
    const body = {
      action_type: "create_order",
      customer_phone,
      ticket_quantity,
      order_amount,
      raffle_cycle_id,
      raffle_type_id,     // 🔑 dynamic
      purchase_platform,
      payment_method_used,
    };
    if (vendor_id !== undefined) body.vendor_id = vendor_id;
    if (payload.customer_email !== undefined)
      body.customer_email = String(payload.customer_email || "");
    if (
      payload.amount_due !== undefined &&
      payload.amount_due !== null &&
      payload.amount_due !== ""
    ) {
      body.amount_due = Number(payload.amount_due);
    }

    // ---- Legacy alias block (safe to keep during rollout; remove later) ----
    body.params = {
      phoneNumber: customer_phone,
      tickets: ticket_quantity,
      amount: order_amount,
      platform: purchase_platform,
      paymentMethod: payment_method_used,
    };

    // Debug breadcrumb (keep while stabilizing)

    console.debug("▶ createOrder payload (service)", body);

    const res = await api.post(PROXY_ACTION, body);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("❌ Error creating order:", err);
    return null;
  }
};

/**
 * Initiate Squad payment via the Context Proxy (server adds X-Plugin-Token).
 *
 * @param {{ email:string, amount:number, trans_ref:string, returnUrl?:string }} args
 * @returns {Promise<{status:"redirected", checkout_url:string}>}
 */
export const processPayment = async ({ email, amount, trans_ref, returnUrl }) => {
  const res = await api.post(PROXY_SQUAD_INITIATE, {
    email,
    amount: Math.round(Number(amount) * 100), // ₦ → kobo
    currency: "NGN",
    transaction_ref: trans_ref,
    payment_channels: ["card", "bank", "ussd", "transfer"],
    metadata: { order_id: trans_ref },
    return_url: returnUrl, // proxy maps this to Squad's callback_url
  });

  const d = res?.data;
  const checkout =
    d?.checkout_url ||
    d?.data?.checkout_url ||
    d?.data?.data?.checkout_url ||
    d?.data?.data?.data?.checkout_url ||
    null;

  if (!checkout) throw new Error("No checkout_url from server");

  window.location.href = checkout; // Do not router.push after this
  return { status: "redirected", checkout_url: checkout };
};

/**
 * Verify payment (UI-friendly envelope is returned).
 * @param {string} transRef
 * @returns {Promise<any>}
 */
export const verifyPayment = async (transRef) => {
  const res = await api.post(PROXY_SQUAD_VERIFY, { reference: transRef });
  return res.data?.data ?? res.data;
};

/**
 * (Optional legacy) Update order status after verification.
 */
export const updateOrderStatus = async (transactionReference, transactionType, transactionAmount) => {
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
