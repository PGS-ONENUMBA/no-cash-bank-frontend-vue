<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Page Header -->
      <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 class="fs-3">
          <i class="bi bi-arrow-up-right-circle"></i> Transfer Funds
        </h1>
      </div>

      <!-- ✅ Provide the required "title" prop -->
      <WalletBalance title="Available Balance" />

      <!-- Transfer Form -->
      <div class="card shadow-sm">
        <div class="card-header">
          <h5><i class="bi bi-arrow-up-right-circle"></i> Transfer Details</h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitTransfer">
            <!-- Inline Fields -->
            <div class="d-flex flex-wrap gap-2">
              <!-- Bank Selection Dropdown -->
              <div class="flex-grow-1">
                <label for="bankSelect" class="form-label">
                  <i class="bi bi-bank"></i> Bank
                </label>
                <select class="form-control compact-input" id="bankSelect" v-model="selectedBank" required>
                  <option value="" disabled>Select</option>
                  <option v-for="bank in banks" :key="bank.code" :value="bank.code">
                    {{ bank.name }}
                  </option>
                </select>
              </div>

              <!-- Recipient Account Number -->
              <div class="flex-grow-1">
                <label for="recipientAccount" class="form-label">
                  <i class="bi bi-credit-card"></i> Account No.
                </label>
                <input
                  type="text"
                  class="form-control compact-input"
                  id="recipientAccount"
                  v-model="recipientAccount"
                  required
                />
              </div>

              <!-- Amount -->
              <div class="flex-grow-1">
                <label for="amount" class="form-label">
                  <i class="bi bi-cash"></i> Amount
                </label>
                <input
                  type="number"
                  class="form-control compact-input"
                  id="amount"
                  v-model="amount"
                  required
                />
              </div>
            </div>

            <!-- Description -->
            <div class="mt-3">
              <label for="description" class="form-label">
                <i class="bi bi-chat-dots"></i> Description (Optional)
              </label>
              <textarea class="form-control" id="description" v-model="description" rows="2"></textarea>
            </div>

            <!-- Submit Button -->
            <div class="d-grid gap-2 col-3 mt-3">
              <button class="btn btn-light" type="submit" :disabled="loading">
                <span v-if="loading">
                <i class="spinner-border spinner-border-sm"></i> Processing...
              </span>
              <span v-else>
                <i id="transfer" class="bi bi-arrow-right-circle"></i> Transfer Now
              </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Mobile Footer Menu -->
    <DashboardFooter />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import apiService from "@/services/apiService";
import DashboardFooter from "@/components/dashboard/DashboardFooter.vue";
import WalletBalance from "@/components/common/WalletBalance.vue";

export default {
  name: "TransferView",
  components: {
    WalletBalance, // ✅ Use WalletBalance here
    DashboardFooter,
  },
  setup() {
    const authStore = useAuthStore();
    const loading = ref(false);
    const walletBalance = computed(() => authStore.user?.wallet_balance || "0.00");

    // Transfer Form Data
    const banks = ref([
      { code: "044", name: "Access Bank" },
      { code: "063", name: "Access Bank (Diamond)" },
      { code: "035", name: "ALAT by WEMA" },
      { code: "023", name: "Citibank Nigeria" },
      { code: "050", name: "EcoBank Nigeria" },
      { code: "214", name: "First City Monument Bank (FCMB)" },
      { code: "011", name: "First Bank of Nigeria (FBN)" },
      { code: "058", name: "Guaranty Trust Bank (GTBank)" },
      { code: "070", name: "Heritage Bank" },
      { code: "301", name: "Jaiz Bank" },
      { code: "082", name: "Keystone Bank" },
      { code: "057", name: "Stanbic IBTC Bank" },
      { code: "068", name: "Standard Chartered Bank" },
      { code: "232", name: "Sterling Bank" },
      { code: "221", name: "Union Bank of Nigeria" },
      { code: "032", name: "United Bank for Africa (UBA)" },
      { code: "033", name: "Unity Bank" },
      { code: "215", name: "Wema Bank" },
      { code: "035A", name: "Zenith Bank" },
    ]);
    const selectedBank = ref("");
    const recipientAccount = ref("");
    const amount = ref("");
    const description = ref("");

    /**
     * Handles fund transfer submission
     */
    const submitTransfer = async () => {
      if (!selectedBank.value || !recipientAccount.value || !amount.value) {
        alert("Please fill in all required fields.");
        return;
      }

      loading.value = true;

      try {
        const response = await apiService.post("/user/transfer", {
          bank: selectedBank.value,
          recipientAccount: recipientAccount.value,
          amount: amount.value,
          description: description.value,
        });

        if (response?.data?.success) {
          alert(`Transfer of ₦${amount.value} successful!`);
          authStore.fetchUserData(); // Refresh wallet balance after transfer
        } else {
          throw new Error(response.data?.message || "Transfer failed.");
        }
      } catch (error) {
        console.error("Transfer error:", error);
        alert("Transaction failed. Please try again.");
      } finally {
        loading.value = false;
      }
    };

    // Fetch wallet balance when the page loads
    onMounted(async () => {
      if (!walletBalance.value) {
        await authStore.fetchUserData();
      }
    });

    return {
      walletBalance,
      banks,
      selectedBank,
      recipientAccount,
      amount,
      description,
      loading,
      submitTransfer,
    };
  },
};
</script>

<style scoped>
/* General Styles */
.card {
  height: 100%;
}

.text-success {
  color: #09b850 !important;
}


.btn-light {
  background-color: #6609b8;
  color: white;
  border: none;
  text-align: left;
}

.btn-light:hover {
  background-color: #723ba2;
}
#transfer {
  color: #fff!important;
}
/* Compact Input Styles */
.compact-input {
  display: inline-block;
  width: 100%;
  padding: 6px;
  font-size: 0.9rem;
}

/* Hide sidebar on mobile */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
