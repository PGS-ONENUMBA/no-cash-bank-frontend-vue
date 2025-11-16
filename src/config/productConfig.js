// src/config/productConfig.js

/**
 * @typedef {Object} ProductField
 * A single field definition used to dynamically generate form inputs.
 *
 * @property {string} name               Unique key used in v-model and payload.
 * @property {string} label              User-facing label text.
 * @property {string} [icon]             Optional Bootstrap icon name (bi-*).
 * @property {string} type               Field type: "text" | "email" | "tel" | "number" | "vendorSelect" | "hidden".
 * @property {boolean} [required=false]  Whether field must be filled before submission.
 * @property {number} [min]              Minimum allowed numeric value (if type=number).
 * @property {string} [placeholder]      Input placeholder text.
 */

/**
 * @typedef {Object} ProductConfig
 * Configuration for a PayByChance product. Controls dynamic form rendering and backend payload mapping.
 *
 * @property {string} key                Internal product key (used in switches and routing).
 * @property {string} label              UI label loaded from environment.
 * @property {number} raffleTypeId       Default raffle_type_id for backend validation.
 * @property {string} layout             UI layout option (e.g., "standard", "requiresVendor").
 * @property {ProductField[]} fields     List of form fields defining inputs and hidden values.
 */

/**
 * @type {Record<string, ProductConfig>}
 * Map of product slug => product configuration.
 *
 * Extend this file to add new products.
 * All form rendering and order payload logic is built from these configs.
 */
export const PRODUCT_CONFIG = {
  "on-the-house": {
    key: "on-the-house",
    label: "OnTheHouse Deals",
    raffleTypeId: 1,
    layout: "standard",
    fields: [
      /** User email (optional) */
      {
        name: "email",
        label: "Email (Optional)",
        icon: "bi-envelope",
        type: "email",
        required: false,
      },
      /** User phone */
      {
        name: "phoneNumber",
        label: "Phone Number",
        icon: "bi-telephone",
        type: "tel",
        required: true,
      },
      /** Number of tickets */
      {
        name: "tickets",
        label: "How Many Tickets?",
        icon: "bi-ticket",
        type: "number",
        required: true,
        min: 1,
      },
      /** Hidden required API fields */
      { name: "raffle_cycle_id", type: "hidden" },
      { name: "raffle_type_id", type: "hidden" },
      { name: "winnable_amount", type: "hidden" },
      { name: "price_of_ticket", type: "hidden" },
    ],
  },

  "pay-merchant": {
    key: "pay-merchant",
    label: "Pay Merchant",
    winnableAmountLabel: "Payment Limit",
    raffleTypeId: 2,
    layout: "requiresVendor",
    fields: [
      /** Customer phone number */
      {
        name: "customerPhone",
        label: "Your Phone Number",
        icon: "bi-telephone",
        type: "tel",
        required: true,
      },
      /** Vendor selected from list or QR */
      {
        name: "vendor_id",
        label: "Vendor",
        icon: "bi-shop",
        type: "vendorSelect",
        required: true,
      },
      /** Ticket quantity */
      {
        name: "tickets",
        label: "How Many Tickets?",
        icon: "bi-ticket",
        type: "number",
        required: true,
        min: 1,
      },
      /** Required hidden API fields */
      { name: "raffle_cycle_id", type: "hidden" },
      { name: "raffle_type_id", type: "hidden" },
      { name: "winnable_amount", type: "hidden" },
      { name: "price_of_ticket", type: "hidden" },
    ],
  },

  "withdraw-cash": {
    key: "withdraw-cash",
    label: "WithDraw Cash",
    winnableAmountLabel: "Withdrawal Limit",
    raffleTypeId: 3,
    layout: "standard",
    fields: [
      /** User phone */
      {
        name: "phoneNumber",
        label: "Your Phone Number",
        icon: "bi-telephone",
        type: "tel",
        required: true,
      },
      /** Ticket quantity */
      {
        name: "tickets",
        label: "How Many Tickets?",
        icon: "bi-ticket",
        type: "number",
        required: true,
        min: 1,
      },
      /** Required hidden API fields */
      { name: "raffle_cycle_id", type: "hidden" },
      { name: "raffle_type_id", type: "hidden" },
      { name: "winnable_amount", type: "hidden" },
      { name: "price_of_ticket", type: "hidden" },
    ],
  },

  "transfer-moni": {
    key: "transfer-moni",
    label: "Transfer Moni",
    winnableAmountLabel: "Transferable Limit",
    raffleTypeId: 4,
    layout: "standard",
    fields: [
      /** Sender phone */
      {
        name: "senderPhone",
        label: "Your Phone Number",
        icon: "bi-telephone",
        type: "tel",
        required: true,
      },
      /** Receiver phone */
      {
        name: "recipientPhone",
        label: "Recipient Phone Number",
        icon: "bi-telephone",
        type: "tel",
        required: true,
      },
      /** Optional receiver email */
      {
        name: "recipientEmail",
        label: "Recipient Email (Optional)",
        icon: "bi-envelope",
        type: "email",
        required: false,
      },
      /** Ticket quantity */
      {
        name: "tickets",
        label: "How Many Tickets?",
        icon: "bi-ticket",
        type: "number",
        required: true,
        min: 1,
      },
      /** Required hidden API fields */
      { name: "raffle_cycle_id", type: "hidden" },
      { name: "raffle_type_id", type: "hidden" },
      { name: "winnable_amount", type: "hidden" },
      { name: "price_of_ticket", type: "hidden" },
    ],
  },
};
