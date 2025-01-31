<template>
    <main class="container py-2 mt-2">
        <div class="row g-4 d-flex align-items-stretch">
        <!-- Left Column: Instructions -->
        <div class="col-lg-6 d-flex">
            <div class="card w-100 shadow-sm">
            <div class="card-body">
                <!-- Withdrawable Amount Card -->
                <div class="mb-4">
                <div class="card text-center shadow-sm">
                    <div class="card-body">
                    <h5 class="card-title">
                        <i class="bi bi-wallet2"></i> Withdrawable Amount
                    </h5>
                    <p class="fs-3 card-text display-4 text-success">₦10,000</p>
                    </div>
                </div>
                </div>
                <p class="text-muted">
                Follow these simple steps to withdraw cash from your account quickly and securely. Ensure all your details are up-to-date before proceeding.
                </p>
                <ul class="list-group">
                <li class="list-group-item d-flex align-items-start">
                    <i class="bi bi-1-circle-fill text-success me-3" style="font-size: 1.5rem;"></i>
                    <div><strong>Step 1:</strong> Log in to your account.</div>
                </li>
                <li class="list-group-item d-flex align-items-start">
                    <i class="bi bi-2-circle-fill text-success me-3" style="font-size: 1.5rem;"></i>
                    <div><strong>Step 2:</strong> Select "Get Cash" from the dashboard.</div>
                </li>
                <li class="list-group-item d-flex align-items-start">
                    <i class="bi bi-3-circle-fill text-success me-3" style="font-size: 1.5rem;"></i>
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
                <!-- Submit Button -->
                <button type="submit" class="btn btn-orange custom-width mb-3">
                    <i class="bi bi-cash-coin me-2 bi-white"></i> Submit Request
                </button>
                </form>
            </div>
            </div>
        </div>
        </div>
    </main>
  </template>
  
  <script>
  export default {
    name: "GetCashForm",
    data() {
      return {
        formData: {
          email: "",
          phoneNumber: "",
          tickets: 1,
        },
      };
    },
    methods: {
      /**
       * Handle form submission for the Get Cash process.
       */
      handleSubmit() {
        // Validate form data
        if (!this.formData.email || !this.formData.phoneNumber || this.formData.tickets < 1) {
          alert("Please fill out all required fields correctly.");
          return;
        }
  
        // Submit the form data
        alert(
          `Request submitted: \nEmail: ${this.formData.email} \nPhone: ${this.formData.phoneNumber} \nTickets: ${this.formData.tickets}`
        );
        // You can add an API call here to send the form data
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
  