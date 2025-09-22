<template>
  <div class="container py-3">
    <h3 class="mb-3">
      <i class="bi bi-bag-check text-success"></i> Pay at Merchant
    </h3>

    <vendor-balances-table
      :balances="balances"
      :loading="loading"
      :error="error"
      @refresh="loadBalances"
      @pay="openPay"
    />

    <pay-merchant-modal
      :show="showModal"
      :vendor="selectedVendor"
      @close="closeModal"
      @success="handleSuccess"
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import VendorBalancesTable from "@/components/VendorBalancesTable.vue";
import PayMerchantModal from "@/components/PayMerchantModal.vue";
import { fetchVendorBalances } from "@/services/balancesService";

export default {
  name: "CustomerSpend",
  components: { VendorBalancesTable, PayMerchantModal },
  setup() {
    const balances = ref([]);
    const loading = ref(false);
    const error = ref("");

    const showModal = ref(false);
    const selectedVendor = ref(null);

    const loadBalances = async () => {
      loading.value = true;
      error.value = "";
      try {
        balances.value = await fetchVendorBalances();
      } catch (e) {
        error.value = e?.message || "Failed to load balances";
        balances.value = [];
      } finally {
        loading.value = false;
      }
    };

    const openPay = (vendorRow) => {
      selectedVendor.value = { ...vendorRow };
      showModal.value = true;
    };
    const closeModal = () => {
      showModal.value = false;
      selectedVendor.value = null;
    };

    const handleSuccess = ({ merchantId, newBalance }) => {
      // update the row inline
      const idx = balances.value.findIndex(b => String(b.merchant_id) === String(merchantId));
      if (idx >= 0) balances.value[idx].balance_ngn = newBalance;
      // you can also trigger a full refresh if you prefer accuracy:
      // loadBalances();
    };

    onMounted(loadBalances);

    return {
      balances, loading, error,
      showModal, selectedVendor,
      loadBalances, openPay, closeModal, handleSuccess,
    };
  },
};
</script>
