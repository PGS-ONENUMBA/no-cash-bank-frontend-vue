<template>
    <div class="container-fluid">
      <div class="row">
        <!-- Main Content -->
          <!-- Page Header -->
          <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
            <h1 class="fs-3">
              <i class="bi bi-arrow-up-right-circle"></i> Transfer Funds
            </h1>
          </div>
  
          <!-- Current Balance Display -->
          <div class="mb-4">
            <div class="card text-center shadow-sm">
              <div class="card-body">
                <h5 class="card-title">
                  <i class="bi bi-wallet2"></i> Current Balance
                </h5>
                <p class="fs-3 card-text text-success">₦10,000</p>
              </div>
            </div>
          </div>
  
          <!-- Transfer Form -->
          <div class="card shadow-sm">
            <div class="card-header">
              <h5><i class="bi bi-arrow-up-right-circle"></i> Transfer Details</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="submitTransfer">
                <!-- Bank Selection Dropdown -->
                <div class="mb-3">
                  <label for="bankSelect" class="form-label">
                    <i class="bi bi-bank"></i> Select Bank
                  </label>
                  <select class="form-select" id="bankSelect" v-model="selectedBank" required>
                    <option value="" disabled>Select Bank</option>
                    <option v-for="bank in banks" :key="bank.code" :value="bank.code">
                      {{ bank.name }}
                    </option>
                  </select>
                </div>
  
                <!-- Recipient Account Number -->
                <div class="mb-3">
                  <label for="recipientAccount" class="form-label">
                    <i class="bi bi-credit-card"></i> Recipient Account Number
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="recipientAccount"
                    v-model="recipientAccount"
                    placeholder="Enter account number"
                    required
                  />
                </div>
  
                <!-- Amount -->
                <div class="mb-3">
                  <label for="amount" class="form-label">
                    <i class="bi bi-cash"></i> Amount
                  </label>
                  <input
                    type="number"
                    class="form-control"
                    id="amount"
                    v-model="amount"
                    placeholder="Enter amount to transfer"
                    required
                  />
                </div>
  
                <!-- Description -->
                <div class="mb-3">
                  <label for="description" class="form-label">
                    <i class="bi bi-chat-dots"></i> Description (Optional)
                  </label>
                  <textarea
                    class="form-control"
                    id="description"
                    v-model="description"
                    rows="3"
                    placeholder="Enter a description"
                  ></textarea>
                </div>
  
                <!-- Submit Button -->
                <button type="submit" class="btn btn-orange w-100">
                  <i class="bi bi-arrow-right-circle"></i> Transfer Now
                </button>
              </form>
            </div>
          </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'

  const banks = ref([
          { code: "044", name: "Access Bank (044)" },
          { code: "063", name: "Access Bank (Diamond) (063)" },
          { code: "035", name: "ALAT by WEMA (035)" },
          { code: "023", name: "Citibank Nigeria (023)" },
          { code: "050", name: "EcoBank Nigeria (050)" },
          { code: "214", name: "First City Monument Bank (FCMB) (214)" },
          { code: "011", name: "First Bank of Nigeria (FBN) (011)" },
          { code: "058", name: "Guaranty Trust Bank (GTBank) (058)" },
          { code: "070", name: "Heritage Bank (070)" },
          { code: "301", name: "Jaiz Bank (301)" },
          { code: "082", name: "Keystone Bank (082)" },
          { code: "057", name: "Stanbic IBTC Bank (057)" },
          { code: "068", name: "Standard Chartered Bank (068)" },
          { code: "232", name: "Sterling Bank (232)" },
          { code: "221", name: "Union Bank of Nigeria (221)" },
          { code: "032", name: "United Bank for Africa (UBA) (032)" },
          { code: "033", name: "Unity Bank (033)" },
          { code: "215", name: "Wema Bank (215)" },
          { code: "035A", name: "Zenith Bank (035A)" },
  ])

  const selectedBank = ref('');
  const recipientAccount = ref('');
  const amount = ref('');
  const description = ref('')

  const submitTransfer = () => {
    if (!this.selectedBank) {
          alert("Please select a bank.");
          return;
        }
        if (!this.recipientAccount) {
          alert("Please enter the recipient's account number.");
          return;
        }
        if (this.amount <= 0) {
          alert("Please enter a valid transfer amount.");
          return;
        }
        alert(
          `Transfer of ₦${this.amount} to account ${this.recipientAccount} at bank ${this.selectedBank} was submitted successfully.`
    );
  }


  // export default {
  //   name: "Transfer",
  //   data() {
  //     return {
  //       banks: [
  //         { code: "044", name: "Access Bank (044)" },
  //         { code: "063", name: "Access Bank (Diamond) (063)" },
  //         { code: "035", name: "ALAT by WEMA (035)" },
  //         { code: "023", name: "Citibank Nigeria (023)" },
  //         { code: "050", name: "EcoBank Nigeria (050)" },
  //         { code: "214", name: "First City Monument Bank (FCMB) (214)" },
  //         { code: "011", name: "First Bank of Nigeria (FBN) (011)" },
  //         { code: "058", name: "Guaranty Trust Bank (GTBank) (058)" },
  //         { code: "070", name: "Heritage Bank (070)" },
  //         { code: "301", name: "Jaiz Bank (301)" },
  //         { code: "082", name: "Keystone Bank (082)" },
  //         { code: "057", name: "Stanbic IBTC Bank (057)" },
  //         { code: "068", name: "Standard Chartered Bank (068)" },
  //         { code: "232", name: "Sterling Bank (232)" },
  //         { code: "221", name: "Union Bank of Nigeria (221)" },
  //         { code: "032", name: "United Bank for Africa (UBA) (032)" },
  //         { code: "033", name: "Unity Bank (033)" },
  //         { code: "215", name: "Wema Bank (215)" },
  //         { code: "035A", name: "Zenith Bank (035A)" },
  //       ],
  //       selectedBank: "",
  //       recipientAccount: "",
  //       amount: "",
  //       description: "",
  //     };
  //   },
  //   methods: {
  //     /**
  //      * Handles the form submission for fund transfer.
  //      */
  //     submitTransfer() {
  //       if (!this.selectedBank) {
  //         alert("Please select a bank.");
  //         return;
  //       }
  //       if (!this.recipientAccount) {
  //         alert("Please enter the recipient's account number.");
  //         return;
  //       }
  //       if (this.amount <= 0) {
  //         alert("Please enter a valid transfer amount.");
  //         return;
  //       }
  //       alert(
  //         `Transfer of ₦${this.amount} to account ${this.recipientAccount} at bank ${this.selectedBank} was submitted successfully.`
  //       );
  //     },
  //   },
  // };
  </script>
  
  <style scoped>
  /* General Styles */
  .card {
    height: 100%;
  }
  
  .text-success {
    color: #09b850 !important;
  }
  
  .btn-orange {
    background-color: #ff6f00;
    color: white;
    border: none;
  }
  
  .btn-orange:hover {
    background-color: #e65d00;
  }
  </style>
  