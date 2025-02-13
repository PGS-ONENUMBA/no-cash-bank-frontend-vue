   /**
   * Create Mock DB
   * 
   **/

   const mockDB = {
      raffle_cycles: [
        {
          raffle_cycle_id: 1,
          raffle_type_id: 1, // Get Cash
          winnable_amount: 100000,
          ticket_price: 50,
          created_at: "2021-09-01T00:00:00Z",
        },
        {
          raffle_cycle_id: 2,
          raffle_type_id: 2, // Pay4Me
          winnable_amount: 5000000,
          ticket_price: 5000,
          created_at: "2021-09-01T00:00:00Z",
        },
        {
          raffle_cycle_id: 3,
          raffle_type_id: 3, // OneTheHouse
          winnable_amount: 5000000,
          ticket_price: 5000,
          created_at: "2021-09-01T00:00:00Z",
        },
      ],
      orders: [
        {
          order_id: 1,
          order_status: "pending",
          raffle_cycle_id: 1,
          raffle_type_id: 1,
          amount: 1000,
          number_of_tickets: 1,
          email: "ter@gmail.com",
          phone_number: "08012345678",
        }
      ],
   }
  
  
  /**
   * 
   * 
   **/
  export const validateProductPricing = async (raffleCycleId, raffleTypeId) => {
    // Find the matching raffle cycle
    const raffle = mockDB.raffle_cycles.find(
        (r) => r.raffle_cycle_id === raffleCycleId && r.raffle_type_id === raffleTypeId
    );

    // If not found, return null or handle accordingly
    if (!raffle) {
        return null; // Or handle it differently (e.g., throw an error)
    }

    // Return the ticket price
    return raffle.ticket_price;
};

  /**
   * 
   * Create order and log to DB. Return the order ID
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
  
    // console.log(mockDB.orders);
  
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

          // Throw a message to the user here. Use a modal or toast
          alert("Oops! You closed the payment modal without completing the transaction.");
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
        "Authorization" : `Bearer ${import.meta.env.VITE_SQUAD_SANDBOX_SK}`
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
  export const updateOrderStatus = async (transRef, status) => {};


  