<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <!-- Payment Limit -->
            <WalletBalance title="Payment Limit" />

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
import { ref } from "vue";
import WalletBalance from "@/components/common/WalletBalance.vue";

export default {
  name: "OnTheHouseForm",
  components: { WalletBalance },
  setup() {
    const formData = ref({
      tickets: 1,
      amount: 0,
      recipientPhone: "",
    });

    const handleSubmit = () => {
      if (formData.value.tickets < 1 || formData.value.amount <= 0 || !formData.value.recipientPhone) {
        alert("Please fill out all fields correctly.");
        return;
      }

      console.log("Payment Request Submitted:", formData.value);
    };

    return { formData, handleSubmit };
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
