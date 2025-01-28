<template>
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <!-- Payment Limit Card -->
            <div class="mb-4">
              <div class="card text-center shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="bi bi-wallet2"></i> Payment Limit
                  </h5>
                  <p class="fs-3 card-text text-success">₦100,000</p>
                  <p class="text-muted">
                    You can process payments up to ₦100,000 per transaction.
                  </p>
                </div>
              </div>
            </div>
            <p class="text-muted">
              Use raffle tickets to pay for a client. The cash comes to the business, and any balance goes back to the customer. Follow the steps below:
            </p>
            <ul class="list-group">
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-1-circle-fill text-success me-3" style="font-size: 1.5rem;"></i>
                <div>
                  <strong>Step 1:</strong> Log in to your account and select "On The House".
                </div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-2-circle-fill text-success me-3" style="font-size: 1.5rem;"></i>
                <div>
                  <strong>Step 2:</strong> Enter the ticket and recipient details.
                </div>
              </li>
              <li class="list-group-item d-flex align-items-start">
                <i class="bi bi-3-circle-fill text-success me-3" style="font-size: 1.5rem;"></i>
                <div>
                  <strong>Step 3:</strong> Confirm the transaction, and the balance will be sent to the customer.
                </div>
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
              <!-- Ticket Number -->
              <div class="mb-3">
                <label for="ticketNumber" class="form-label">
                  <i class="bi bi-ticket me-2"></i> How Many Tickets?
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="ticketNumber"
                  v-model="formData.tickets"
                  required
                  min="1"
                />
              </div>
  
              <!-- Amount -->
              <div class="mb-3">
                <label for="amount" class="form-label">
                  <i class="bi bi-cash-stack me-2"></i> Amount
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="amount"
                  v-model="formData.amount"
                  required
                  min="1"
                />
              </div>
  
              <!-- Recipient Phone -->
              <div class="mb-3">
                <label for="recipientPhone" class="form-label">
                  <i class="bi bi-phone me-2"></i> Recipient Phone Number
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="recipientPhone"
                  v-model="formData.recipientPhone"
                  required
                />
              </div>
  
              <!-- Submit Button -->
              <button type="submit" class="btn btn-orange custom-width mb-3">
                <i class="bi bi-cash-coin me-2 bi-white"></i> Submit Payment Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "OnTheHouseForm",
    data() {
      return {
        formData: {
          tickets: 1,
          amount: 0,
          recipientPhone: "",
        },
      };
    },
    methods: {
      /**
       * Handles the form submission for the "On The House" functionality.
       */
      handleSubmit() {
        if (this.formData.tickets < 1 || this.formData.amount <= 0 || !this.formData.recipientPhone) {
          alert("Please fill out all fields correctly.");
          return;
        }
  
        alert(
          `Payment Request Submitted:\n
          Tickets: ${this.formData.tickets}\n
          Amount: ₦${this.formData.amount}\n
          Recipient Phone: ${this.formData.recipientPhone}`
        );
  
        // API call to submit form data can be added here
      },
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
  