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
    // Generate a random order ID
    const orderId = Math.floor(Math.random() * 1000000);

    // Log the order to the DB
    mockDB.orders.push({ ...payload, order_status: 'pending', order_id: orderId });

    console.log(mockDB.orders);

    // Return the order ID
    return orderId;
  };

  /**
   * 
   * 
   **/
  export const processPayment = (payload) => {

    console.log("Processing payment:", payload);
  
    // Destructure the payload to extract necessary data
    const { trans_ref, amount, email } = payload;
  
    // Return a Promise to handle async response
    return new Promise((resolve, reject) => {
      if (!window.squad) {
        reject("Squad script not loaded!");
        return;
      }
  
      const squadInstance = new squad({
        onClose: () => console.log("Widget closed"),
        onLoad: () => console.log("Widget loaded successfully"),
        onSuccess: (response) => {
          console.log("Payment Successful:", response);
          resolve(response); // ✅ Resolve the response to the calling component
        },
        key: import.meta.env.VITE_SQUAD_PK, // Replace with your actual key
        email: email,
        amount: 10000 * 100, // Convert to Kobo
        transaction_ref: "4678388588350909090AH",
        currency_code: "NGN"
      });
  
      squadInstance.setup();
      squadInstance.open();
    });
  };
  

  /**
   * 
   * 
   **/
  export const verifyPayment = async (transRef) => {
    console.log("Verifying transaction:", transRef);
    
    // Simulate different outcomes by changing `success` to `false`
    return new Promise((resolve) => {
      setTimeout(() => {
        if (transRef === "TEST123456") {
          resolve({ success: true }); // Simulates a successful payment
        } else {
          resolve({ success: false }); // Simulates a failed payment
        }
      }, 2000);
    });
  };

  /**
   * 
   * 
   **/
  export const updateOrderStatus = async (transRef, status) => {};


  