<template>
    <div>
      <!-- Main Content -->
      <main class="container py-5 mt-5">
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
                      <p class="fs-3 card-text text-success">₦50,000</p>
                      <p class="text-muted">You can make payments up to ₦50,000 per transaction.</p>
                    </div>
                  </div>
                </div>
                <p class="text-muted">
                  Follow these simple steps to make a payment on behalf of your client securely. Ensure all details are accurate before proceeding.
                </p>
                <ul class="list-group">
                  <li class="list-group-item d-flex align-items-start">
                    <i class="bi bi-1-circle-fill text-success me-3" style="font-size: 1.5rem;"></i>
                    <div><strong>Step 1:</strong> Log in to your account.</div>
                  </li>
                  <li class="list-group-item d-flex align-items-start">
                    <i class="bi bi-2-circle-fill text-success me-3" style="font-size: 1.5rem;"></i>
                    <div><strong>Step 2:</strong> Select "Pay-4-Me" from the dashboard.</div>
                  </li>
                  <li class="list-group-item d-flex align-items-start">
                    <i class="bi bi-3-circle-fill text-success me-3" style="font-size: 1.5rem;"></i>
                    <div><strong>Step 3:</strong> Enter the recipient details and confirm the request.</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
      
          <!-- Right Column: Form -->
          <div class="col-lg-6 d-flex">
            <div class="card w-100 shadow-sm">
              <div class="card-body">
                <h2 class="card-title pb-3 fs-4">Fill The Pay4Me Form</h2>
                <form>
                  <!-- Email and Phone Number -->
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <label for="email" class="form-label">
                        <i class="bi bi-envelope me-2"></i> Email
                      </label>
                      <input type="email" class="form-control" id="email" required>
                    </div>
                    <div class="col-md-6">
                      <label for="phoneNumber" class="form-label">
                        <i class="bi bi-telephone me-2"></i> Phone Number
                      </label>
                      <input type="text" class="form-control" id="phoneNumber" required>
                    </div>
                  </div>
      
                  <!-- Number of Tickets -->
                  <div class="mb-3">
                    <label for="tickets" class="form-label">
                      <i class="bi bi-ticket me-2"></i> How Many Tickets?
                    </label>
                    <input type="number" class="form-control" id="tickets" required>
                  </div>
      
                  <!-- Recipient Registered Phone Number -->
                  <div class="mb-3">
                    <label for="recipientPhoneNumber" class="form-label">
                      <i class="bi bi-phone me-2"></i> Recipient Registered Phone Number
                    </label>
                    <input type="text" class="form-control" id="recipientPhoneNumber" required>
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
      </main>
    </div>
  </template>
  
  <script>
  export default {
    name: "Pay4Me",
  };
  </script>
  
  <style scoped>
  /* Styling */
  .card-title {
    font-weight: 400;
  }
  .text-muted {
    font-weight: 300;
  }
  </style>
  