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
  