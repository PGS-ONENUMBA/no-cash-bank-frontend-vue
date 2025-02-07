<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <!-- ✅ Display Winnable Amount -->
            <h3 class="text-green fs-4">
              Transferable Amount: {{ formattedWinnableAmount }}
            </h3>

            <p class="text-muted">
              Use raffle tickets to pay for a client. The cash goes to the business, and any balance is refunded to the customer.
              Follow these steps:
            </p>

            <ul class="list-group">
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-1-circle-fill text-success me-3"></i>
                <div><strong>Step 1:</strong> Select "On The House" from the dashboard.</div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-2-circle-fill text-success me-3"></i>
                <div><strong>Step 2:</strong> Enter the ticket and recipient details.</div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-3-circle-fill text-success me-3"></i>
                <div><strong>Step 3:</strong> Confirm the transaction.</div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Right Column: Form -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title pb-3 fs-4">Fill The On The House Form</h2>
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="tickets" class="form-label">
                  <i class="bi bi-ticket me-2"></i> How Many Tickets?
                </label>
                <input type="number" class="form-control" id="tickets" v-model="formData.tickets" required min="1" />
              </div>

              <div class="mb-3">
                <label for="amount" class="form-label">
                  <i class="bi bi-cash-stack me-2"></i> Amount
                </label>
                <input type="number" class="form-control" id="amount" v-model="formData.amount" required min="1" />
              </div>

              <div class="mb-3">
                <label for="recipientPhone" class="form-label">
                  <i class="bi bi-phone me-2"></i> Recipient Phone Number
                </label>
                <input type="text" class="form-control" id="recipientPhone" v-model="formData.recipientPhone" required />
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

export default {
  name: "OnTheHouseForm",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const raffleData = ref({});
    const formData = ref({
      tickets: 1,
      amount: 0,
      recipientPhone: "",
      raffle_cycle_id: "",
      raffle_type_id: "",
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
      if (formData.value.tickets < 1 || formData.value.amount <= 0 || !formData.value.recipientPhone) {
        alert("Please fill out all fields correctly.");
        return;
      }

      try {
        console.log("🚀 Submitting request:", formData.value);
        router.push("/dashboard");
      } catch (error) {
        console.error("❌ Submission error:", error);
      }
    };

    onMounted(fetchRaffleDetails); // ✅ Fetch validated data

    return {
      formData,
      handleSubmit,
      raffleData,
      formattedWinnableAmount,
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
