<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <h3 class="text-success fs-4">
              Transferable Amount: {{ formattedWinnableAmount }}
            </h3>

            <p class="text-muted">
              Need someone to cover a payment on your behalf? With **Pay4Me**, request payment assistance, and let us handle the bill.
            </p>

            <h5 class="fw-bold"><i class="bi bi-lightbulb"></i> How It Works</h5>
            <ul class="list-unstyled">
              <li><i class="bi bi-1-circle text-success"></i> Enter the **amount** and **payment details**.</li>
              <li><i class="bi bi-2-circle text-success"></i> Enter the phone number/email of the recipient.</li>
              <li><i class="bi bi-3-circle text-success"></i> Pay for your raffle ticket.</li>
              <li><i class="bi bi-4-circle text-success"></i> When you win in the instant raffle draw, the payment is processed automatically.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Right Column: Form -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title pb-3 fs-4">Fill The Pay4Me Form</h2>
            <form @submit.prevent="handleSubmit">
              <div class="row mb-3">
                <!-- Email Field -->
                <div class="col-md-6">
                  <label for="email" class="form-label">
                    <i class="bi bi-envelope me-2"></i> Email <small style="font-size: 13px; font-style:italic">(Optional)</small>
                  </label>
                  <input type="email" class="form-control" id="email" v-model="formData.email" />
                </div>

                <!-- Phone Number Field -->
                <div class="col-md-6">
                  <label for="phoneNumber" class="form-label">
                    <i class="bi bi-telephone me-2"></i> Phone Number
                  </label>
                  <input type="text" class="form-control" id="phoneNumber" v-model="formData.phoneNumber" required />
                </div>
              </div>
              <!-- Number of Tickets Field -->
              <div class="mb-3">
                <label for="tickets" class="form-label">
                  <i class="bi bi-ticket me-2"></i> How Many Tickets?
                </label>
                <span v-if="ticketCurrentPrice > 0">Current Ticket Price is : <span> {{ formatCurrency(ticketCurrentPrice) }} </span></span>
                <input type="number" class="form-control" id="tickets" v-model="formData.tickets" required min="1" />
                <p>You will pay : {{ formatCurrency(totalTicketCost) }}</p>
              </div>

              <!-- ✅ Hidden Fields for Backend Validation -->
              <input type="hidden" v-model="formData.raffle_cycle_id" />
              <input type="hidden" v-model="formData.raffle_type_id" />
              <input type="hidden" v-model="formData.winnable_amount" />
              <input type="hidden" v-model="formData.price_of_ticket" />

              <button type="submit" class="btn btn-orange custom-width mb-3">
                <i class="bi bi-cash-coin me-2"></i> Submit Payment Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { validateRaffleCycle } from "@/services/productService"; // ✅ API Validation Call

// Import Currency Formatter
import formatCurrency  from "@/services/currencyFormatter";

// Import Payment Helper
import { validateProductPricing, createOrder, processPayment } from "@/services/paymentService";

export default {
  name: "Pay4MeForm",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const raffleData = ref({});
    const raffleCycleId = route.query.raffle_cycle_id;
    const raffleTypeId = route.query.raffle_type_id;
    const ticketCurrentPrice = ref(0);
    const isPaymentCancelled = ref(false); // Used to control the ToastComponent visibility if user cancels payment
    const formData = ref({
      tickets: 1,
      amount: 0,
      email: "",
      phoneNumber: "",
      raffle_cycle_id: raffleCycleId,
      raffle_type_id: raffleTypeId,
      winnable_amount: "",
      price_of_ticket: "",
    });


    /**
     * ✅ Fetch and validate raffle cycle details.
     */
    const fetchRaffleDetails = async () => {
      const raffleCycleId = route.query.raffle_cycle_id;
      const raffleTypeId = route.query.raffle_type_id;

      if (!raffleCycleId || !raffleTypeId) {
        console.warn("⚠ Missing raffle cycle parameters in URL.");
        return;
      }

      try {
        const validatedRaffle = await validateRaffleCycle(raffleCycleId, raffleTypeId);
        if (validatedRaffle) {
          raffleData.value = validatedRaffle;
          formData.value.raffle_cycle_id = validatedRaffle.raffle_cycle_id;
          formData.value.raffle_type_id = validatedRaffle.raffle_type_id;
          formData.value.winnable_amount = validatedRaffle.winnable_amount;
          formData.value.price_of_ticket = validatedRaffle.price_of_ticket;
        } else {
          console.error("❌ Raffle validation failed. Redirecting...");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("❌ Error validating raffle cycle:", error);
      }
    };

    /**
     * ✅ Format `winnable_amount` for display.
     */
    const formattedWinnableAmount = computed(() => {
      return raffleData.value.winnable_amount
        ? Number(raffleData.value.winnable_amount).toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          })
        : "Loading...";
    });

   /**
     * ✅ Handles form submission and redirects on success.
     */
     const handleSubmit = async () => {
      if (formData.value.tickets < 1  || !formData.value.phoneNumber) {
        alert("Please fill out all fields correctly.");
        return;
      }

      try {

        // Call create order api here first before calling payment API
        const response = await createOrder({...formData.value, amount: totalTicketCost.value, raffleCycleId});
       
        // console.log(response);
  
        // Initiate payment request to Squad by pasing the order id returned from the create order response above
        // The order id is the transaction reference
        if(response !== null) {
          
          // const userEmail = formData.value.email || `${formData.value.phoneNumber}@paybychance.com`
          const paymentResponse = await processPayment({email: formData.value.email || `${formData.value.phoneNumber}@paybychance.com`, amount: totalTicketCost.value, trans_ref:response.order_id});
          
          // Check if user cancelled the transaction / closed the modal
          if(paymentResponse.status === "closed") {
            console.log("❌ Payment Cancelled by user");
            // return;
            isPaymentCancelled.value = true;
            return
          }

        }
        
      } catch (error) {
        console.error("❌ Submission error:", error);
      }
    };

         /**
     * ✅ Compute Total Ticket Price for the user
     */
     const totalTicketCost = computed(() => {
        if (formData.value.tickets > 0 && ticketCurrentPrice.value > 0) {
            return formData.value.tickets * ticketCurrentPrice.value;
        }
        return 0; // Ensure it always returns a valid value
    });

     /**
     * ✅ Fetch current ticket price.
     */
     const verifyTicketCost = async () => {
        try {
            const price = await validateProductPricing(raffleCycleId);
            
            ticketCurrentPrice.value = Number(price.raffle_cycle.ticket_price); 
            
        } catch (error) {
            console.error("❌ Error verifying ticket price:", error);
        }
     };

     onMounted(() => {
      fetchRaffleDetails()
      verifyTicketCost()
    })

    return {
      formData,
      handleSubmit,
      raffleData,
      formattedWinnableAmount,
      formatCurrency,
      totalTicketCost,
      ticketCurrentPrice,
    };
  },
};
</script>

<style scoped>
.btn-orange {
  background-color: #ff6f00;
  color: white;
  border: none;
}
.btn-orange:hover {
  background-color: #e65d00;
}
</style>
