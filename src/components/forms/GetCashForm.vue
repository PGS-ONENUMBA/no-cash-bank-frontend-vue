<template>
  <main class="container py-2 mt-2">
    <!-- Show Preloader when loading data -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading...</p>
    </div>

    <!-- Show Error if product is not found -->
    <div v-else-if="productNotFound" class="text-center py-5">
      <h2 class="text-danger">Product Not Found</h2>
      <p>The requested product does not exist. Redirecting...</p>
    </div>

    <!-- Display Content when Data is Available -->
    <div v-else class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <!-- Display Winnable Amount -->
            <h4 class="text-center fw-bold text-success mb-3">
              Winnable Amount: 
              <span class="text-dark">{{ formatCurrency(raffleData.winnable_amount) }}</span>
            </h4>

            <p class="text-muted">
              Follow these simple steps to withdraw cash from your account quickly and securely.
            </p>
            <ul class="list-group">
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-1-circle-fill text-success me-3"></i>
                <div><strong>Step 1:</strong> Fill the form.</div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-2-circle-fill text-success me-3"></i>
                <div><strong>Step 2:</strong> Submit the request.</div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-3-circle-fill text-success me-3"></i>
                <div><strong>Step 3:</strong> Confirm and Make payment.</div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-4-circle-fill text-success me-3"></i>
                <div><strong>Step 4:</strong> Receive status of request.</div>
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
              <button type="submit" class="btn btn-orange custom-width mb-3" :disabled="loadingSubmit">
                <span v-if="loadingSubmit">
                  <i class="bi bi-hourglass-split"></i> Processing...
                </span>
                <span v-else>
                  <i class="bi bi-cash-coin me-2"></i> Submit Request
                </span>
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
import { useRoute, useRouter } from "vue-router";
import { submitAction } from "@/services/raffleService";

export default {
  name: "GetCashForm",
  setup() {
    const route = useRoute();
    const router = useRouter();

    const raffleData = ref({});
    const loading = ref(true);
    const productNotFound = ref(false);
    const loadingSubmit = ref(false);

    const formData = ref({
      email: "",
      phoneNumber: "",
      tickets: 1,
      raffle_cycle_id: route.query.raffle_cycle_id || "",
      winnable_amount: "",
    });

    /**
     * Formats a number into Nigerian currency format (₦).
     * @param {number|string} value - The amount to format.
     * @returns {string} - Formatted currency value.
     */
    const formatCurrency = (value) => {
      if (!value) return "₦0.00";
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
      }).format(value);
    };

    /**
     * Validates and fetches the raffle cycle information.
     * If the product is not found, redirects to 404.
     */
    const validateRaffleCycle = async () => {
      if (!formData.value.raffle_cycle_id) {
        productNotFound.value = true;
        setTimeout(() => router.push("/404"), 2000);
        return;
      }

      try {
        const response = await submitAction("get_raffle_cycle_by_id", {
          raffle_cycle_id: formData.value.raffle_cycle_id,
        });

        if (response.success) {
          raffleData.value = response.raffle_cycle;
          formData.value.winnable_amount = raffleData.value.winnable_amount;
        } else {
          productNotFound.value = true;
          setTimeout(() => router.push("/404"), 2000);
        }
      } catch (error) {
        console.error("Failed to fetch raffle cycle:", error);
        productNotFound.value = true;
        setTimeout(() => router.push("/404"), 2000);
      } finally {
        loading.value = false;
      }
    };

    /**
     * Handles form submission for ticket purchase.
     */
    const handleSubmit = async () => {
      loadingSubmit.value = true;

      try {
        const response = await submitAction("create_order", formData.value);
        alert(response.success ? "Request submitted successfully!" : "Failed to submit request.");
      } catch (error) {
        console.error("Submission error:", error);
        alert("An error occurred. Please try again.");
      } finally {
        loadingSubmit.value = false;
      }
    };

    onMounted(validateRaffleCycle);

    return {
      formData,
      handleSubmit,
      raffleData,
      loading,
      productNotFound,
      loadingSubmit,
      formatCurrency,
    };
  },
};
</script>
