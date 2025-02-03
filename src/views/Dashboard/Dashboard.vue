<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="fs-3">
        <i class="bi bi-house-door"></i> Dashboard
      </h1>
    </div>

    <!-- ✅ Reusable Wallet Balance Component -->
    <WalletBalance />

    <!-- First Row: 3 Columns (Product Forms) -->
    <div class="row row-cols-1 row-cols-md-3 g-4">
      <FeatureCard
        title="Get Cash"
        icon="bi bi-currency-exchange"
        description="Withdraw money securely."
        link="/dashboard/get-cash"
      />
      <FeatureCard
        title="Transfer Funds"
        icon="bi bi-arrow-up-right-circle"
        description="Easily send money to others."
        link="/dashboard/transfer"
      />
      <FeatureCard
        title="Pay-4-Me"
        icon="bi bi-check-circle"
        description="Let us pay on your behalf."
        link="/dashboard/pay4me"
      />
    </div>

    <!-- Second Row: 2 Columns (Other Features) -->
    <div class="row row-cols-1 row-cols-md-2 g-4 mt-3">
      <FeatureCard
        title="On The House"
        icon="bi bi-gift"
        description="Enjoy free giveaways and rewards."
        link="/dashboard/on-the-house"
      />
      <FeatureCard
        title="Transaction Reports"
        icon="bi bi-clock-history"
        description="View your transaction history."
        link="/dashboard/reports"
      />
    </div>

    <!-- Mobile Footer Menu -->
    <DashboardFooter />
  </div>
</template>

<script>
import { useAuthStore } from "@/store/authStore";
import WalletBalance from "@/components/common/WalletBalance.vue";
import { computed, onMounted } from "vue";
import FeatureCard from "@/components/dashboard/FeatureCard.vue";
import DashboardFooter from "@/components/dashboard/DashboardFooter.vue";

export default {
  name: "Dashboard",
  components: {
    WalletBalance, // ✅ Import the reusable Wallet Balance component
    FeatureCard,
    DashboardFooter,
  },
  setup() {
    const authStore = useAuthStore();

    // Computed property for wallet balance
    const walletBalance = computed(() => authStore.user?.wallet_balance || "0.00");

    // Fetch latest user data (for updated balance)
    onMounted(async () => {
      if (!walletBalance.value) {
        await authStore.fetchUserData();
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
</style>
