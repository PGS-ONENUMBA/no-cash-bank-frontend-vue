<template>
  <div class="card text-center shadow-sm mb-4">
    <div class="card-body">
      <h5 class="card-title">
        <i class="bi bi-wallet2"></i> {{ title }}
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
import { useAuthStore } from "@/stores/authStore";

export default {
  name: "WalletBalance",
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  setup() {
    const authStore = useAuthStore();

    /**
     * ✅ Retrieves user's wallet balance from Pinia state.
     * Defaults to `0.00` if no value is found.
     */
    const walletBalance = computed(() => authStore.user?.wallet_balance ?? "0.00");

    /**
     * ✅ Formats wallet balance as Nigerian Naira (₦).
     */
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
