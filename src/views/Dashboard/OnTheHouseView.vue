<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="fs-3">
        <i class="bi bi-gift"></i> On The House (Dashboard)
      </h1>
    </div>

    <!-- ✅ Reusable Wallet Balance Component -->
    <WalletBalance />

    <!-- On The House Form Component -->
    <OnTheHouseForm :isLoggedIn="true" :walletBalance="walletBalance" />

    <!-- Mobile Footer Menu (Only on Mobile) -->
    <DashboardFooter />
  </div>
</template>

<script setup>
/**
 * DashboardOnTheHouse Component (Pinia-Integrated)
 *
 * - Ensures wallet transactions fetch real-time data from the backend.
 * - Uses `authStore` to retrieve the user's wallet balance.
 * - Provides `walletBalance` as a prop to the `OnTheHouseForm`.
 */

import { useAuthStore } from "@/store/authStore";
import { computed, onMounted } from "vue";
import OnTheHouseForm from "@/components/forms/OnTheHouseForm.vue";
import DashboardFooter from "@/components/dashboard/DashboardFooter.vue";
import WalletBalance from "@/components/dashboard/WalletBalance.vue";


const authStore = useAuthStore(); // Access Pinia Auth Store

// Reactive Computed Property for Wallet Balance
const walletBalance = computed(() => authStore.user?.wallet_balance || null);

// Ensure wallet balance is always up-to-date
onMounted(async () => {
  if (!walletBalance.value) {
    await authStore.fetchUserData(); // Fetch fresh user data if missing
  }
});

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
