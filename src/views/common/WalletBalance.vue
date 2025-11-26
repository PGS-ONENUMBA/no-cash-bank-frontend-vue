<template>
  <div class="card text-center border-0 shadow-sm mb-4">
    <div class="card-body">
      <h5 class="card-title">
        <i class="bi bi-wallet2"></i> {{ title }}
      </h5>

      <!-- Loading -->
      <p v-if="loading" class="fs-3 text-muted">Fetching balance...</p>

      <!-- Loaded -->
      <p v-else class="fs-3 text-success">
        {{ formattedBalance }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { fetchVendorWalletSummary } from "@/services/walletService";
import { useAuthStore } from "@/stores/authStore";

export default {
  name: "WalletBalance",
  props: {
    title: { type: String, required: true },
  },
  setup() {
    const authStore = useAuthStore();
    const walletBalance = ref(null);
    const loading = ref(false);

    const loadBalance = async () => {
      try {
        loading.value = true;

        if (authStore.user?.user_role === "vendor") {
          const summary = await fetchVendorWalletSummary();

          const raw =
            summary.balance_ngn ??
            summary.wallet_balance ??
            summary.available_balance ??
            0;

          const n = parseFloat(String(raw).replace(/,/g, ""));
          walletBalance.value = Number.isNaN(n) ? 0 : n;
        } else {
          // customers use authStore for now
          const raw = authStore.user?.wallet_balance ?? "0.00";
          const n = parseFloat(String(raw).replace(/,/g, ""));
          walletBalance.value = Number.isNaN(n) ? 0 : n;
        }
      } catch (e) {
        console.error("Wallet balance load failed:", e);
        walletBalance.value = 0;
      } finally {
        loading.value = false;
      }
    };

    const formattedBalance = computed(() =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(walletBalance.value ?? 0)
    );

    onMounted(loadBalance);

    return { walletBalance, formattedBalance, loading };
  },
};
</script>
