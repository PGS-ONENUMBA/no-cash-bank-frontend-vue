<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <WalletBalance title="Payment Limit" />

            <p class="text-muted">
              Need someone to cover a payment on your behalf? With **Pay4Me**, request payment assistance, and let someone else handle the bill.
            </p>

            <h5 class="fw-bold"><i class="bi bi-lightbulb"></i> How It Works</h5>
            <ul class="list-unstyled">
              <li><i class="bi bi-1-circle text-success"></i> Enter the **amount** and **payment details**.</li>
              <li><i class="bi bi-2-circle text-success"></i> Enter the email of a **sponsor** (friend, family, or business partner).</li>
              <li><i class="bi bi-3-circle text-success"></i> The sponsor gets a **notification** and can approve the payment.</li>
              <li><i class="bi bi-4-circle text-success"></i> Once approved, the payment is processed automatically.</li>
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
                <div class="col-md-6">
                  <label for="email" class="form-label">
                    <i class="bi bi-envelope me-2"></i> Sponsor's Email
                  </label>
                  <input type="email" class="form-control" id="email" v-model="formData.email" required />
                </div>
                <div class="col-md-6">
                  <label for="phoneNumber" class="form-label">
                    <i class="bi bi-telephone me-2"></i> Your Phone Number
                  </label>
                  <input type="text" class="form-control" id="phoneNumber" v-model="formData.phoneNumber" required />
                </div>
              </div>

              <div class="mb-3">
                <label for="tickets" class="form-label">
                  <i class="bi bi-ticket me-2"></i> How Many Tickets?
                </label>
                <input type="number" class="form-control" id="tickets" v-model="formData.tickets" required min="1" />
              </div>

              <div class="mb-3">
                <label for="recipientPhoneNumber" class="form-label">
                  <i class="bi bi-phone me-2"></i> Recipient Registered Phone Number
                </label>
                <input type="text" class="form-control" id="recipientPhoneNumber" v-model="formData.recipientPhoneNumber" required />
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
  name: "Pay4MeForm",
  components: { WalletBalance },
  setup() {
    const formData = ref({
      email: "",
      phoneNumber: "",
      tickets: 1,
      recipientPhoneNumber: "",
    });

    const handleSubmit = () => {
      if (!formData.value.email || !formData.value.phoneNumber || !formData.value.recipientPhoneNumber || formData.value.tickets < 1) {
        alert("Please fill out all fields correctly.");
        return;
      }

      console.log("Pay4Me Request Submitted:", formData.value);
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
  
  .text-success {
    color: #09b850 !important;
  }
  </style>
  