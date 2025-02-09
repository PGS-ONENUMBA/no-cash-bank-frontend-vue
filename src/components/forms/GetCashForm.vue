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
                    <i class="bi bi-envelope me-2"></i> Email
                  </label>
                  <input type="email" class="form-control" id="email" v-model="formData.email" required />
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
                <input type="number" class="form-control" id="tickets" v-model="formData.tickets" required min="1" />
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
  </main>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { validateRaffleCycle } from "@/services/productService"; // ✅ Ensure valid cycle
import WalletBalance from "@/components/common/WalletBalance.vue";

export default {
  name: "GetCashForm",
  components: {
    WalletBalance,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const raffleData = ref({});
    const formData = ref({
      email: "",
      phoneNumber: "",
      tickets: 1,
      raffle_cycle_id: "",
      raffle_type_id: "",
      winnable_amount: "",
      price_of_ticket: "",
    });

    /**
     * ✅ Fetch and validate raffle cycle details dynamically.
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
          router.push("/");
        }
      } catch (error) {
        console.error("❌ Error validating raffle cycle:", error);
      }
    };

    /**
     * ✅ Handles form submission and validation.
     */
    const handleSubmit = async () => {
      if (!formData.value.email || !formData.value.phoneNumber || formData.value.tickets < 1) {
        alert("Please fill out all required fields correctly.");
        return;
      }

      try {
        console.log("🚀 Submitting request:", formData.value);
        router.push("/dashboard");
      } catch (error) {
        console.error("❌ Submission error:", error);
      }
    };

    /**
     * ✅ Formats currency values for display.
     */
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount);
    };

    onMounted(fetchRaffleDetails);

    return {
      formData,
      handleSubmit,
      raffleData,
      formatCurrency,
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
