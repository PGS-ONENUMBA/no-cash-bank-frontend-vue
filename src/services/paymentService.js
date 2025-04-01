
// src/services/paymentService.js

import axios from "axios";

/**
 * Validates the pricing of a product by fetching raffle cycle details via API proxy.
 *
 * @async
 * @function validateProductPricing
 * @param {string} raffleCycleId - The ID of the raffle cycle to validate.
 * @returns {Promise<Object|null>} The raffle cycle details if successful, or null if an error occurs.
 */
  export const validateProductPricing = async (raffleCycleId) => {
    try {
      const response = await axios.get("/api/nocash-action", {
        params: {
          action_type: "get_raffle_cycle_by_id",
          raffle_cycle_id: raffleCycleId
        }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error validating raffle cycle:", error);
      return null;
    }
  };
/**
 * Creates a new order using a secure backend proxy.
 *
 * @async
 * @function createOrder
 * @param {Object} payload - The payload containing order details.
 * @returns {Promise<Object|null>} The created order details if successful, or null if an error occurs.
 */
  export const createOrder = async (payload) => {
    try {
      const response = await axios.post("/api/create-order", payload);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating order:", error);
      return null;
    }
  };

/**
 * Verifies a Squad payment using a secure backend proxy.
 *
 * @async
 * @function verifyPayment
 * @param {string} transRef - The transaction reference to verify.
 * @returns {Promise<Object>} The verification result, including status code and transaction status.
 */
  export const verifyPayment = async (transRef) => {
    try {
      const response = await axios.get("/api/verify-payment", {
        params: { trans_ref: transRef }
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error verifying payment:", error);
      return { statusCode: 500, transactionStatus: "failed" };
    }
  };

/**
 * Completes an order after successful payment by updating its status.
 *
 * @async
 * @function updateOrderStatus
 * @param {string} transactionReference - The reference ID of the transaction.
 * @param {string} transactionType - The type of transaction (e.g., payment method used).
 * @param {number} transactionAmount - The amount involved in the transaction.
 * @returns {Promise<Object|null>} The updated order details if successful, or null if an error occurs.
 */
export const updateOrderStatus = async (transactionReference, transactionType, transactionAmount) => {
  try {
    const response = await axios.post("/api/nocash-action", {
      action_type: "complete_order",
      order_id: transactionReference,
      amount: transactionAmount,
      payment_method_used: transactionType
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    return null;
  }
};
