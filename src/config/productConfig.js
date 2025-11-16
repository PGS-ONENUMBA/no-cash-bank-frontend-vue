/**
 * Product form configuration for the DynamicProductForm.
 *
 * Each product key maps to:
 * - label: heading shown on the form
 * - winnableAmountLabel: text on the left panel
 * - raffleTypeId: default raffle_type_id for this product
 * - fields: array describing inputs rendered by DynamicProductForm
 *
 * Field types:
 * - "text" | "email" | "tel" | "number" => standard <input>
 * - "vendorSelect" => uses <VendorSelect> component, v-model="formData.vendor_id"
 * - "hidden" => bound to hidden <input> for backend only
 */

/**
 * @typedef {{
 *   name: string,
 *   label?: string,
 *   type: 'text'|'email'|'tel'|'number'|'hidden'|'vendorSelect',
 *   required?: boolean,
 *   icon?: string,
 *   min?: number,
 *   placeholder?: string
 * }} ProductFieldConfig
 */

/**
 * @typedef {{
 *   key: string,
 *   label: string,
 *   winnableAmountLabel: string,
 *   raffleTypeId: number,
 *   fields: ProductFieldConfig[]
 * }} ProductConfig
 */

/** @type {Record<string, ProductConfig>} */
export const PRODUCT_CONFIG = {
  // -----------------------------
  // Pay Merchant (raffle_type_id = 2)
  // -----------------------------
  "pay-merchant": {
    key: "pay-merchant",
    label: "Pay Merchant",
    winnableAmountLabel: "Payment Limit",
    raffleTypeId: 2,
    fields: [
      {
        name: "customerPhone",
        label: "Your Phone Number",
        type: "tel",
        required: true,
        icon: "bi-telephone",
        placeholder: "e.g., 09012345678",
      },
      {
        name: "vendor_id",
        label: "Vendor",
        type: "vendorSelect",
        required: true,
        icon: "bi-shop",
      },
      {
        name: "tickets",
        label: "How Many Tickets?",
        type: "number",
        required: true,
        icon: "bi-ticket",
        min: 1,
      },
      // hidden fields used by backend
      { name: "raffle_cycle_id", type: "hidden" },
      { name: "raffle_type_id", type: "hidden" },
      { name: "winnable_amount", type: "hidden" },
      { name: "price_of_ticket", type: "hidden" },
    ],
  },

  // -----------------------------
  // Withdraw Cash (raffle_type_id = 3)
  // -----------------------------
  "withdraw-cash": {
    key: "withdraw-cash",
    label: "WithDraw Cash",
    winnableAmountLabel: "Withdrawal Limit",
    raffleTypeId: 3,
    fields: [
      {
        name: "phoneNumber",
        label: "Your Phone Number",
        type: "tel",
        required: true,
        icon: "bi-telephone",
        placeholder: "e.g., 09012345678",
      },
      {
        name: "tickets",
        label: "How Many Tickets?",
        type: "number",
        required: true,
        icon: "bi-ticket",
        min: 1,
      },
      { name: "raffle_cycle_id", type: "hidden" },
      { name: "raffle_type_id", type: "hidden" },
      { name: "winnable_amount", type: "hidden" },
      { name: "price_of_ticket", type: "hidden" },
      { name: "email", type: "hidden" }, // derived in payload if needed
    ],
  },

  // -----------------------------
  // Transfer Moni (raffle_type_id = 4)
  // -----------------------------
  "transfer-moni": {
    key: "transfer-moni",
    label: "Transfer Moni",
    winnableAmountLabel: "Transfer Limit",
    raffleTypeId: 4,
    fields: [
      {
        name: "senderPhone",
        label: "Your Phone Number",
        type: "tel",
        required: true,
        icon: "bi-telephone",
        placeholder: "e.g., 09012345678",
      },
      {
        name: "recipientPhone",
        label: "Recipient Phone Number",
        type: "tel",
        required: true,
        icon: "bi-telephone",
        placeholder: "e.g., 09098765432",
      },
      {
        name: "recipientEmail",
        label: "Recipient Email (Optional)",
        type: "email",
        required: false,
        icon: "bi-envelope",
        placeholder: "e.g., friend@example.com",
      },
      {
        name: "tickets",
        label: "How Many Tickets?",
        type: "number",
        required: true,
        icon: "bi-ticket",
        min: 1,
      },
      { name: "raffle_cycle_id", type: "hidden" },
      { name: "raffle_type_id", type: "hidden" },
      { name: "winnable_amount", type: "hidden" },
      { name: "price_of_ticket", type: "hidden" },
    ],
  },

  // -----------------------------
  // On The House (raffle_type_id = 1)
  // -----------------------------
  "on-the-house": {
    key: "on-the-house",
    label: "OnTheHouse Deals",
    winnableAmountLabel: "Reward Limit",
    raffleTypeId: 1,
    fields: [
      {
        name: "phoneNumber",
        label: "Your Phone Number",
        type: "tel",
        required: true,
        icon: "bi-telephone",
        placeholder: "e.g., 09012345678",
      },
      {
        name: "email",
        label: "Email (Optional)",
        type: "email",
        required: false,
        icon: "bi-envelope",
        placeholder: "e.g., you@example.com",
      },
      {
        name: "tickets",
        label: "How Many Tickets?",
        type: "number",
        required: true,
        icon: "bi-ticket",
        min: 1,
      },
      { name: "raffle_cycle_id", type: "hidden" },
      { name: "raffle_type_id", type: "hidden" },
      { name: "winnable_amount", type: "hidden" },
      { name: "price_of_ticket", type: "hidden" },
    ],
  },
};
