<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <!-- Withdrawable Amount Card -->
            <WalletBalance :title="raffleData.winnable_amount ? `₦${raffleData.winnable_amount}` : 'Loading...'" />

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
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    v-model="formData.email"
                    required
                  />
                </div>
                <!-- Phone Number Field -->
                <div class="col-md-6">
                  <label for="phoneNumber" class="form-label">
                    <i class="bi bi-telephone me-2"></i> Phone Number
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="phoneNumber"
                    v-model="formData.phoneNumber"
                    required
                  />
                </div>
              </div>
              <!-- Number of Tickets Field -->
              <div class="mb-3">
                <label for="tickets" class="form-label">
                  <i class="bi bi-ticket me-2"></i> How Many Tickets?
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="tickets"
                  v-model="formData.tickets"
                  required
                  min="1"
                />
              </div>

              <!-- Hidden Fields -->
              <input type="hidden" v-model="formData.raffle_cycle_id" />
              <input type="hidden" v-model="formData.winnable_amount" />

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
import WalletBalance from "@/components/common/WalletBalance.vue";
import { submitAction } from "@/services/raffleService";

export default {
  name: "GetCashForm",
  components: {
    WalletBalance,
  },
  setup() {
    const raffleData = ref({});
    const formData = ref({
      email: "",
      phoneNumber: "",
      tickets: 1,
      raffle_cycle_id: "",
      winnable_amount: "",
    });

    // Fetch raffle cycle information
    const fetchRaffleCycle = async () => {
      try {
        const response = await submitAction("get_raffle_cycle");
        console.log("Raffle cycle response:", response);
        if (response.success && response.raffle_type_id["1"]) {
          raffleData.value = response.raffle_type_id["1"];
          formData.value.raffle_cycle_id = raffleData.value.raffle_cycle_id;
          formData.value.winnable_amount = raffleData.value.winnable_amount;
        }
      } catch (error) {
        console.error("Failed to fetch raffle cycle:", error);
      }
    };

    // Handle form submission
    const handleSubmit = async () => {
      if (!formData.value.email || !formData.value.phoneNumber || formData.value.tickets < 1) {
        alert("Please fill out all required fields correctly.");
        return;
      }

      try {
        const response = await submitAction("create_order", formData.value);
        if (response.success) {
          alert("Request submitted successfully!");
        } else {
          alert("Failed to submit request. Please try again.");
        }
      } catch (error) {
        console.error("Submission error:", error);
        alert("An error occurred. Please try again.");
      }
    };

    onMounted(fetchRaffleCycle);

    return {
      formData,
      handleSubmit,
      raffleData,
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
