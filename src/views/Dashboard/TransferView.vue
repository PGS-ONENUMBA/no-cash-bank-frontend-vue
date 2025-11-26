<template>
  <div class="container-fluid">
    <div class="row">
      <!-- Page Header -->
      <div
        class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom"
      >
        <h1 class="fs-3">
          <i class="bi bi-cash-stack"></i> Request Payout
        </h1>
      </div>

      <!-- Wallet balance -->
      <WalletBalance title="Available Balance" />

      <!-- Payout Request Form -->
      <div class="card shadow-sm">
        <div class="card-header">
          <h5>
            <i class="bi bi-arrow-up-right-circle"></i> Bank Payout Details
          </h5>
          <p class="small text-muted mb-0">
            Submit a payout request. Our team will process it via bank transfer
            and update your wallet and email once completed.
          </p>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitPayoutRequest">
            <div class="d-flex flex-wrap gap-2">
              <!-- Amount -->
              <div class="flex-grow-1">
                <label for="amount" class="form-label">
                  <i class="bi bi-cash"></i> Amount
                </label>
                <input
                  type="number"
                  class="form-control compact-input"
                  id="amount"
                  v-model.number="amount"
                  min="1"
                  required
                />
                <small class="text-muted">
                  Max you can request now:
                  {{ formattedWalletBalance }}
                </small>
              </div>
            </div>

            <!-- Description -->
            <div class="mt-3">
              <label for="description" class="form-label">
                <i class="bi bi-chat-dots"></i> Description (Optional)
              </label>
              <textarea
                class="form-control"
                id="description"
                v-model="description"
                rows="2"
                placeholder="Example: Payout for sales on 1st–7th, or any note to admin"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <div class="d-grid gap-2 col-3 mt-3">
              <button class="btn btn-light" type="submit" :disabled="loading">
                <span v-if="loading">
                  <i class="spinner-border spinner-border-sm"></i>
                  Sending request...
                </span>
                <span v-else>
                  <i id="transfer" class="bi bi-send"></i>
                  Submit Request
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
  import { fetchVendorWalletSummary } from "@/services/walletService";

  export default {
    name: "TransferView",
    components: { WalletBalance, DashboardFooter },
    setup() {
      const authStore = useAuthStore();
      const loading = ref(false);

      // live balance fetched from backend (not from store)
      const availableBalance = ref(0);
      const loadingBalance = ref(false);

      const formattedWalletBalance = computed(() =>
        new Intl.NumberFormat("en-NG", {
          style: "currency",
          currency: "NGN",
        }).format(availableBalance.value)
      );

      const amount = ref("");
      const description = ref("");

      const refreshBalance = async () => {
        try {
          loadingBalance.value = true;
          const summary = await fetchVendorWalletSummary();

          // adjust field name to what your PHP returns (common patterns below)
          const raw =
            summary.balance_ngn ??
            summary.wallet_balance ??
            summary.available_balance ??
            0;

          const n = parseFloat(String(raw).replace(/,/g, ""));
          availableBalance.value = Number.isNaN(n) ? 0 : n;
        } catch (e) {
          console.error("Failed to fetch wallet summary:", e);
          availableBalance.value = 0;
        } finally {
          loadingBalance.value = false;
        }
      };

      const submitPayoutRequest = async () => {
        // always refresh just before validation so user cannot bypass with stale UI
        await refreshBalance();

        if (!amount.value) {
          alert("Please enter an amount.");
          return;
        }

        const amt = Number(amount.value);
        if (!amt || amt <= 0) {
          alert("Amount must be greater than zero.");
          return;
        }

        if (amt > availableBalance.value) {
          alert(
            `You cannot request more than your wallet balance (${formattedWalletBalance.value}).`
          );
          return;
        }

        const vendorId =
          authStore.user?.vendor_details?.vendor_id ??
          authStore.user?.id ??
          authStore.user?.ID ??
          null;

        loading.value = true;

        try {
          const response = await apiService.post("/context-proxy/v1/action", {
            action_type: "request_vendor_withdrawal",
            amount: amt,
            description: description.value,
            acting_vendor_id: vendorId,
          });

          if (response?.data?.ok === true) {
            alert(
              response.data.data?.message ||
                "Your payout request has been submitted. You will receive an email once it is processed."
            );

            // optional: refresh JWT profile
            if (authStore.fetchUserData) {
              await authStore.fetchUserData();
            }

            // refresh balance after successful request
            await refreshBalance();

            amount.value = "";
            description.value = "";
          } else {
            throw new Error(response?.data?.data?.message || "Request failed.");
          }
        } catch (error) {
          console.error("Payout request error:", error);
          alert(
            error?.message ||
              "Could not submit your request. Please try again later."
          );
        } finally {
          loading.value = false;
        }
      };

      onMounted(async () => {
        if (!authStore.user) {
          await authStore.fetchUserData();
        }
        await refreshBalance();
      });

      return {
        amount,
        description,
        loading,
        formattedWalletBalance,
        submitPayoutRequest,
        loadingBalance,
      };
    },
  };
</script>


<style scoped>
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
  color: #fff !important;
}

.compact-input {
  display: inline-block;
  width: 100%;
  padding: 6px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
