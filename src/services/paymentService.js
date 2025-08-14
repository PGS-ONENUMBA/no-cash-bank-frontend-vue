// import apiClient from "./apiService";
import axios from "axios";

import { initiatePayment, verifyTransaction } from "@/services/squad.service";
const authString = btoa(import.meta.env.VITE_APP_USER_NAME.trim() + ":" + import.meta.env.VITE_APP_USER_PASSWORD.trim());

/**
 *
 *
 **/
export const validateProductPricing = async (raffleCycleId) => {
  console.log("Validating raffle cycle:", raffleCycleId);

  try {
    const response = await axios({
      method: 'get',
      url: `${import.meta.env.VITE_API_BASE_URL}/nocash-bank/v1/action`,
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      },
      params: {
        action_type: "get_raffle_cycle_by_id",
        raffle_cycle_id: raffleCycleId
      }
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching product by ID:", error);
    return null;
  }
};

/**
 *
 * Create order and log to DB. Return the order ID
 **/
export const createOrder = async (payload) => {

  console.log("Creating order:", payload);
  console.log("Type Of rafflecycleid: ", typeof(payload.raffle_cycle_id))

  try {
    const response = await axios({
      method: 'post',
      url: `${import.meta.env.VITE_API_BASE_URL}/nocash-bank/v1/action`,
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      },
      data: {
        "action_type": "create_order",
        "customer_email": payload.email || '',
        "amount_due": payload.amount_due || '', // Payment to vendor
        "vendor_id": payload.vendor_id || '',
        "customer_phone": payload.phoneNumber,
        "ticket_quantity": payload.tickets,
        "order_amount": payload.amount, // Ticket total cost
        "raffle_cycle_id": payload.raffle_cycle_id,
        "purchase_platform": "web",
        "payment_method_used": "card"
      }
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching product by ID:", error);
    return null;
  }
};



export const processPayment = async (payload) => {
  const { email, amount, trans_ref } = payload;

  const res = await initiatePayment({
    email,
    amount: Math.round(Number(amount) * 100), // ₦ → kobo
    currency: "NGN",
    transaction_ref: trans_ref,
    payment_channels: ["card", "bank", "ussd", "transfer"],
    metadata: { order_id: trans_ref },
  });

  const checkout =
    res && res.data && res.data.data && res.data.data.checkout_url;
  if (!checkout) throw new Error("No checkout_url from server");

  window.location.href = checkout; // opens Squad hosted modal
  return { status: "redirected", checkout_url: checkout };
};

export const verifyPayment = async (transRef) => {
  const res = await verifyTransaction(transRef);
  return res; // check res.data.data.transaction_status === "success"
};



/**
 *
 * Update the earlier created order after verifying the transaction
 **/
export const updateOrderStatus = async (transactionReference, transactionType, transactionAmount) => {
  console.log("check amount ",transactionAmount)
  try {
    const response = await axios({
      method: 'post',
      url: `${import.meta.env.VITE_API_BASE_URL}/nocash-bank/v1/action`,
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      },
      data: {
      "action_type": "complete_order",
      "order_id": transactionReference,
      "amount": transactionAmount,
      "payment_method_used": transactionType
      }
    });
    console.log("Order Update Response:", response);
    return response
  } catch (error) {
    console.error("❌ Error Updating order", error);
    return null;
  }
};


