<!-- 📌 src/components/dashboard/WalletBalance.vue -->
<template>
    <div class="card text-center shadow-sm mb-5">
      <div class="card-body">
        <h5 class="card-title">
          <i class="bi bi-wallet2"></i> Win Wallet Balance
        </h5>
        <p v-if="walletBalance !== null" class="fs-3 text-success">
          {{ formattedBalance }}
        </p>
        <p v-else class="fs-3 text-muted">Fetching balance...</p>
      </div>
    </div>
  </template>
  
  <script>
  import { computed } from "vue";
  import { useAuthStore } from "@/store/authStore";
  
  export default {
    name: "WalletBalance",
    setup() {
      const authStore = useAuthStore();
  
      // Computed property for real-time balance
      const walletBalance = computed(() => authStore.user?.wallet_balance || "0.00");
  
      // Format balance to Nigerian Naira (₦)
      const formattedBalance = computed(() =>
        new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
          parseFloat(walletBalance.value)
        )
      );
  
      return { walletBalance, formattedBalance };
    },
  };
  </script>
  
  <style scoped>
  .text-success {
    color: #09b850 !important;
  }
  </style>
  