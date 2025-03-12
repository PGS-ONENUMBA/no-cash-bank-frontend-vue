<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <!-- ✅ Winnable Amount Display -->
            <h4 class="text-success">
              Transferable Amount: {{ formatCurrency(raffleData.winnable_amount) }}
            </h4>

            <p class="text-muted">
              Follow these simple steps to withdraw cash from your account quickly and securely.
              Ensure all your details are up-to-date before proceeding.
            </p>

            <ul class="list-group">
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-1-circle-fill text-success me-3"></i>
                <div><strong>Step 1:</strong> Log in to your account.</div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-2-circle-fill text-success me-3"></i>
                <div><strong>Step 2:</strong> Select "Get Cash" from the dashboard.</div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-3-circle-fill text-success me-3"></i>
                <div><strong>Step 3:</strong> Enter your details and confirm the request.</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Right Column: Form -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title pb-3 fs-4">Fill The Get Cash Form</h2>
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

              <!-- ✅ Hidden Fields for API Validation -->
              <input type="hidden" v-model="formData.raffle_cycle_id" />
              <input type="hidden" v-model="formData.raffle_type_id" />
              <input type="hidden" v-model="formData.winnable_amount" />
              <input type="hidden" v-model="formData.price_of_ticket" />

              <!-- Submit Button -->
              <button type="submit" class="btn btn-orange custom-width mb-3">
                <i class="bi bi-cash-coin me-2"></i> Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div 
      v-if="isPaymentCancelled" 
      class="alert alert-warning d-flex align-items-center position-fixed top-0 start-50 translate-middle-x shadow"
      role="alert"
      style="z-index: 1055; max-width: 500px;"
    >
      <svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:">
        <use xlink:href="#exclamation-triangle-fill"/>
      </svg>
      <div>
        Payment was cancelled. Please try again.
      </div>

      <button 
        type="button" 
        class="btn-close me-2 m-auto" 
        @click="dismissAlert"
        aria-label="Close" ></button>
  </div>
  
  </main>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { validateRaffleCycle } from "@/services/productService"; // ✅ Ensure valid cycle
import WalletBalance from "@/components/common/WalletBalance.vue";
import ToastComponent from "@/components/common/ToastComponent.vue";

// Import Payment Helper
import { validateProductPricing, createOrder, processPayment } from "@/services/paymentService";

// Import Currency Formatter
import formatCurrency  from "@/services/currencyFormatter";

export default {
  name: "GetCashForm",
  components: {
    WalletBalance,
    ToastComponent
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const raffleData = ref({});
    const raffleCycleId = route.query.raffle_cycle_id;
    const raffleTypeId = route.query.raffle_type_id;
    const ticketCurrentPrice = ref(0);
    const isPaymentCancelled = ref(false); // Used to control the ToastComponent visibility if user cancels payment
    const formData = ref({
      email: "",
      phoneNumber: "",
      tickets: 1,
      raffle_cycle_id: raffleCycleId,
      raffle_type_id: raffleTypeId,
      winnable_amount: "",
      price_of_ticket: "",
    });

    /**
     * ✅ Fetch and validate raffle cycle details dynamically.
     */
    const fetchRaffleDetails = async () => {

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
          router.push("/");
        }
      } catch (error) {
        console.error("❌ Error validating raffle cycle:", error);
      }
    };

     /**
     * ✅ Fetches current ticket price.
     */
     const verifyTicketCost = async () => {
        try {
            const price = await validateProductPricing(raffleCycleId);

            console.log("Ticket Price is: ", price)
            
            ticketCurrentPrice.value = Number(price.raffle_cycle.ticket_price); 
            
        } catch (error) {
            console.error("❌ Error verifying ticket price:", error);
        }
     };

     /**
     * ✅ Compute Total Ticket Price for the user. This will update as the user increases ticket count
     */
     const totalTicketCost = computed(() => {
        if (formData.value.tickets > 0 && ticketCurrentPrice.value > 0) {
            return formData.value.tickets * ticketCurrentPrice.value;
        }
        return 0; // Ensure it always returns a valid value
    });


    /**
     * ✅ Handles form submission and validation.
     * Create order
     */
    const handleSubmit = async () => {
      if ( !formData.value.phoneNumber || formData.value.tickets < 1) {
        alert("Please fill out all required fields correctly.");
        return;
      }

      try {
        console.log("🚀 Submitting request:", formData.value);

        // Call create order api here first before calling payment API
        const response = await createOrder({...formData.value, amount: totalTicketCost.value, raffleCycleId});

        // Initiate payment request to Squad by pasing the order id returned from the create order response above
        // The order id is the transaction reference
        if(response !== null) {
  
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

    // Dismmissible Alert
    const dismissAlert = () => {
     isPaymentCancelled.value = !isPaymentCancelled.value;
    }

    onMounted(() => {
      fetchRaffleDetails()
      verifyTicketCost()
    })

    // onMounted(fetchRaffleDetails);
    // onMounted(verifyTicketCost);

    return {
      formData,
      handleSubmit,
      raffleData,
      formatCurrency,
      ticketCurrentPrice,
      totalTicketCost,
      dismissAlert,
      isPaymentCancelled,
    };
  },
};
</script>