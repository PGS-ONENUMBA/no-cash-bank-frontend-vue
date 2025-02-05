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
    /**
     * Title to display on the wallet balance component.
     * @type {String}
     */
    title: {
      type: String,
      required: true,
    },
  },
  setup() {
    const authStore = useAuthStore();

    /**
     * Retrieves the user's wallet balance from Pinia store.
     * If unavailable, defaults to "0.00".
     */
    const walletBalance = computed(() => authStore.user?.wallet_balance || "0.00");

    /**
     * Formats the balance as Nigerian Naira (₦).
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
