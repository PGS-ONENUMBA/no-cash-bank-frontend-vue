import apiClient from "./apiService";
import axios from "axios";
const authString = btoa(import.meta.env.VITE_APP_USER_NAME.trim() + ":" + import.meta.env.VITE_APP_USER_PASSWORD.trim());




/**
 * 
 * Fetch product Price here
 **/
export const validateProductPricing = async (raffleCycleId) => {

  try {
    const response = await axios({
      method: 'post',
      url: `${import.meta.env.VITE_API_BASE_URL}/nocash-bank/v1/action`,
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      },
      data: {
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
 * Create order and log to DB. Return the order ID (reference)
 **/
export const createOrder = async (payload) => {
  // Generate a random numeric ID (18-20 digits)
  const randomNumber = Math.floor(Math.random() * 10 ** 18).toString();

  // Generate two random uppercase letters
  const randomLetters = String.fromCharCode(
    65 + Math.floor(Math.random() * 26),
    65 + Math.floor(Math.random() * 26)
  );

  // Concatenate number and letters
  const orderId = `${randomNumber}${randomLetters}`;

  // Log the order to the mock DB
  mockDB.orders.push({ ...payload, order_status: "pending", order_id: orderId });

  // Return the order ID
  return orderId;
};


/**
 * 
 * Call Squad API here to make payment. Pass payload from the form filled by the user
 **/
export const processPayment = (payload) => {

  console.log("Processing payment:", payload);


  // Destructure the payload to extract necessary data
  const { email, amount, trans_ref, } = payload;

  // console.log(email, amount, trans_ref);

  // Return a Promise to handle async response
  return new Promise((resolve, reject) => {
    if (!window.squad) {
      reject("Squad script not loaded!");
      return;
    }

    // Call the Squad API to initiate payment
    const squadInstance = new squad({
      onClose: () => {
        resolve({ status: "closed" }); // ✅ Resolve the response to the calling component
      },
      onLoad: () => console.log("Widget loaded successfully"),
      onSuccess: (response) => {
        // console.log("Payment Successful:", response);
        resolve(response); // ✅ Resolve the response to the calling component
      },
      key: import.meta.env.VITE_SQUAD_SANDBOX_PK, // Replace with your actual key
      email: email,
      amount: amount * 100, // Convert to Kobo
      transaction_ref: trans_ref,
      currency_code: "NGN",
    });
    squadInstance.setup();
    squadInstance.open();
  });
};


/**
 * 
 * Verify payment by passing in the transaction reference from the url
 * THis must be called efore deciding whether to give value to the customer or not
 **/
export const verifyPayment = async (transRef) => {
  console.log("Verifying transaction:", transRef);

  // Call the Squad API to verify the payment
  const requestOptions = {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_SQUAD_SANDBOX_SK}`
    },
  };

  const response = await fetch(`https://sandbox-api-d.squadco.com/transaction/verify/${transRef}`, requestOptions)
  const data = await response.json();

  return { statusCode: data.status, transactionStatus: data.data.transaction_status };
};

/**
 * 
 * Update the earlier created order after verifying the transaction
 **/
export const updateOrderStatus = async (transRef, status) => { };


