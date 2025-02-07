<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <!-- Display Winnable Amount -->
            <div v-if="errorMessage" class="alert alert-warning" role="alert">
              {{ errorMessage }}
            </div>

              
            <h3 class="text-purple fs-4">
              Transferable Amount: {{ formattedWinnableAmount }}
            </h3>

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
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { fetchProductById } from "@/services/productService";
import { validateRaffleCycle } from "@/services/productService";

export default {
  name: "GetCashForm",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const raffleData = ref({});
    const formData = ref({
      email: "",
      phoneNumber: "",
      tickets: 1,
      raffle_cycle_id: "",
      winnable_amount: "",
    });
    const errorMessage = ref(null);

    /**
     * ✅ Fetch the latest raffle details dynamically using route parameters.
     */
    const fetchRaffleDetails = async () => {
      const raffleCycleId = route.query.raffle_cycle_id;
      const raffleTypeId = route.query.raffle_type_id;

      if (!raffleCycleId || !raffleTypeId) {
        errorMessage.value = "Invalid raffle cycle details.";
        return;
      }

      // try {
      //   const response = await validateRaffleCycle(parseInt(raffleTypeId), parseInt(raffleCycleId));
      //   if (response) {
      //     raffleData.value = response;
      //     formData.value.raffle_cycle_id = response.raffle_cycle_id;
      //     formData.value.winnable_amount = response.winnable_amount;
      //   }
      // } catch (error) {
      //   errorMessage.value = "Invalid raffle cycle. Redirecting...";
      //   setTimeout(() => router.push("/"), 2000);
      // }

      const response = await validateRaffleCycle(raffleCycleId, raffleTypeId);

      if (response) {
        raffleData.value = response;
          formData.value.raffle_cycle_id = response.raffle_cycle_id;
          formData.value.winnable_amount = response.winnable_amount;
      } else {
        errorMessage.value = "Invalid raffle cycle. Redirecting...";
        setTimeout(() => router.push("/"), 2000);
      }

    };

    /**
     * ✅ Formats `winnable_amount` as currency.
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
      if (!formData.value.email || !formData.value.phoneNumber || formData.value.tickets < 1) {
        alert("Please fill out all required fields correctly.");
        return;
      }

      try {
        console.log("🚀 Submitting request:", formData.value);
        router.push("/dashboard"); // ✅ Redirect to dashboard on success
      } catch (error) {
        console.error("Submission error:", error);
      }
    };

    onMounted(fetchRaffleDetails);

    return {
      formData,
      handleSubmit,
      raffleData,
      formattedWinnableAmount,
      errorMessage 
    };
  },
};
</script>

<style scoped>
.btn-orange {
  background-color: #ff6f00;
  color: white;
}
.btn-orange:hover {
  background-color: #e65d00;
}
</style>
