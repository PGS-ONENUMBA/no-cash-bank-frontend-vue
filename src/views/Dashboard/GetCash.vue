<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="fs-3">
        <i class="bi bi-currency-exchange"></i> Get Cash - Dashboard
      </h1>
    </div>

      <!-- ✅ Provide the required "title" prop -->
      <WalletBalance title="Available Balance" />

    <!-- Get Cash Form Component -->
    <GetCashForm :isLoggedIn="true" :walletBalance="walletBalance" />

    <!-- Mobile Footer Menu (Only on Mobile) -->
    <DashboardFooter />
  </div>
</template>

<script>
/**
 * DashboardGetCash Component (Pinia-Integrated)
 *
 * - Ensures wallet transactions fetch real-time data from the backend.
 * - Uses `authStore` to retrieve the user's wallet balance.
 * - Provides `walletBalance` as a prop to the `GetCashForm`.
 */

import { useAuthStore } from "@/stores/authStore";
import { computed, onMounted } from "vue";
import GetCashForm from "@/components/forms/GetCashForm.vue";
import DashboardFooter from "@/components/dashboard/DashboardFooter.vue";
import WalletBalance from "@/components/common/WalletBalance.vue";

export default {
  name: "DashboardGetCash",
  components: {
    WalletBalance, // ✅ Use WalletBalance here
    GetCashForm,
    DashboardFooter,
  },
  setup() {
    const authStore = useAuthStore(); // Access Pinia Auth Store

    // Reactive Computed Property for Wallet Balance
    const walletBalance = computed(() => authStore.user?.wallet_balance || null);

    // Ensure wallet balance is always up-to-date
    onMounted(async () => {
      if (!walletBalance.value) {
        await authStore.fetchUserData(); // Fetch fresh user data if missing
      }
    });

    return {
      walletBalance,
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

/* Hide sidebar on mobile */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
