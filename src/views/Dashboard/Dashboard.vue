<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="fs-3">
        <i class="bi bi-house-door"></i> Dashboard
      </h1>
    </div>

    <!-- ✅ Display Available Balance -->
    <WalletBalance title="Available Balance" />

    <!-- ✅ Show Preloader while Loading -->
    <div v-if="loadingProducts" class="text-center py-3">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading products...</span>
      </div>
    </div>

    <!-- ✅ Dynamically Render Product Cards with Dynamic Columns -->
    <div v-else-if="availableProducts.length > 0" class="row row-cols-1 g-4" :class="dynamicGridClass">
      <FeatureCard
        v-for="product in availableProducts"
        :key="`${product.raffle_cycle_id}-${product.raffle_type_id}`"
        :title="product.raffle_type"
        :icon="product.icon"
        :description="`${winnableAmountLabel}: ${formatCurrency(product.winnable_amount)}`"
        :link="{
          path: product.route,
          query: {
            raffle_cycle_id: product.raffle_cycle_id,
            raffle_type_id: product.raffle_type_id
          }
        }"

      />
    </div>

    <!-- No Products Found Message -->
    <div v-else class="text-center text-danger py-3">
      <p>No active products available.</p>
    </div>

    <!-- Static Features -->
    <div class="row row-cols-1 row-cols-md-2 g-4 mt-3">
      
      <FeatureCard
        title="Transfer Funds"
        icon="bi bi-arrow-up-right-circle"
        description="Easily send money to others."
        link="/dashboard/transfer"
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
import { ref, computed, onMounted } from "vue";
import { fetchProducts } from "@/services/productService"; // ✅ Use centralized product service
import WalletBalance from "@/components/common/WalletBalance.vue";
import FeatureCard from "@/components/dashboard/FeatureCard.vue";
import DashboardFooter from "@/components/dashboard/DashboardFooter.vue";

export default {
  name: "Dashboard",
  components: {
    WalletBalance,
    FeatureCard,
    DashboardFooter,
  },
  setup() {
    const availableProducts = ref([]);
    const loadingProducts = ref(true);

     // ✅ Load the environment variable for winnable amount label
     const winnableAmountLabel = import.meta.env.VITE_WINNABLE_AMOUNT_LABEL || "Winnable Amount";

    /**
     * ✅ Fetch available products dynamically using the product service.
     */
    const loadProducts = async () => {
      try {
        loadingProducts.value = true;
        availableProducts.value = await fetchProducts();
      } catch (error) {
        console.error("❌ Error fetching products:", error);
      } finally {
        loadingProducts.value = false;
      }
    };

    /**
     * ✅ Compute Bootstrap's `row-cols-md-{value}` dynamically.
     * - If products are **1-2**, show in 1 column.
     * - If **3**, show 3 columns.
     * - If **4+**, show a max of 4 columns.
     */
    const dynamicGridClass = computed(() => {
      const count = availableProducts.value.length;
      return count ? `row-cols-md-${Math.min(count, 4)}` : "row-cols-md-1";
    });

    /**
     * ✅ Format the currency for display.
     */
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount);
    };

    // Fetch products on component mount
    onMounted(loadProducts);

    return {
      availableProducts,
      loadingProducts,
      dynamicGridClass,
      formatCurrency,
      winnableAmountLabel, // ✅ Use label from env variable
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
