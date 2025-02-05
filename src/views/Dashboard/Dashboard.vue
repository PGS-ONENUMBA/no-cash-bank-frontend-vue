<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="fs-3">
        <i class="bi bi-house-door"></i> Dashboard
      </h1>
    </div>

    <!-- ✅ Display Wallet Balance -->
    <WalletBalance title="Available Balance" />

    <!-- ✅ Show Preloader When Fetching Products -->
    <div v-if="loadingProducts" class="text-center py-3">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Loading products...</span>
      </div>
      <p>Loading products...</p>
    </div>

    <!-- ✅ Dynamically Render Product Cards -->
    <div v-else-if="availableProducts.length > 0" 
        class="row row-cols-1 g-4"
        :class="dynamicGridClass">
      <FeatureCard
        v-for="product in availableProducts"
        :key="`${product.raffle_cycle_id}-${product.raffle_type_id}`"
        :title="product.raffle_type"
        :icon="product.icon"
        :description="product.description"
        :link="`${product.route}?raffle_cycle_id=${product.raffle_cycle_id}&raffle_type_id=${product.raffle_type_id}`"
      />
    </div>

    <!-- ✅ No Products Found Message -->
    <div v-else class="text-center text-danger py-3">
      <p>No active products available.</p>
    </div>

    <!-- ✅ Static Features Section -->
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

    <!-- ✅ Mobile Footer Menu -->
    <DashboardFooter />
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue"; // ✅ Fixed missing computed import
import { useAuthStore } from "@/stores/authStore";
import apiClient from "@/services/apiService";
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
    const authStore = useAuthStore();
    const availableProducts = ref([]); // ✅ Stores fetched products
    const loadingProducts = ref(true); // ✅ Tracks loading state

    /**
     * ✅ Fetch available products dynamically from the API.
     * If the API returns an empty response, it logs a warning.
     */
    const fetchProducts = async () => {
      try {
        console.log("📡 Fetching products...");
        const response = await apiClient.post("/nocash-bank/v1/action", {
          action_type: "get_raffle_cycle",
        });

        if (response.data.success && Array.isArray(response.data.raffle_cycles)) {
          let parsedProducts = [];

          response.data.raffle_cycles.forEach((raffle) => {
            if (Array.isArray(raffle.associated_types)) {
              raffle.associated_types.forEach((type) => {
                parsedProducts.push({
                  raffle_cycle_id: raffle.raffle_cycle_id,
                  raffle_type_id: type.raffle_type_id,
                  raffle_type: type.raffle_type || "Unknown Product",
                  icon: getIcon(type.raffle_type_id),
                  route: getRoute(type.raffle_type_id),
                  description: getDescription(type.raffle_type_id),
                });
              });
            }
          });

          availableProducts.value = parsedProducts;
          console.log("🚀 Parsed Products:", availableProducts.value);
        } else {
          console.warn("⚠️ No products found in API response.");
        }
      } catch (error) {
        console.error("❌ Error fetching products:", error.message);
      } finally {
        loadingProducts.value = false; // ✅ Stop loading after API call
      }
    };

    /**
     * ✅ Dynamically sets Bootstrap's `row-cols-md-{value}`
     * Ensures proper grid display with a maximum of 4 columns.
     */
    const dynamicGridClass = computed(() => {
      const productCount = availableProducts.value.length || 1; // Default to 1 to prevent empty layout
      return `row-cols-md-${Math.min(productCount, 4)}`;
    });

    /**
     * ✅ Maps raffle type IDs to corresponding Bootstrap icons.
     * @param {number} typeId - The raffle type ID.
     * @returns {string} - The Bootstrap icon class.
     */
    const getIcon = (typeId) => {
      const icons = {
        1: "bi bi-currency-exchange",
        2: "bi bi-check-circle",
        3: "bi bi-gift",
      };
      return icons[typeId] || "bi bi-box";
    };

    /**
     * ✅ Maps raffle type IDs to their respective route paths.
     * @param {number} typeId - The raffle type ID.
     * @returns {string} - The route path.
     */
    const getRoute = (typeId) => {
      const routes = {
        1: "/get-cash",
        2: "/pay4me",
        3: "/on-the-house",
      };
      return routes[typeId] || "/dashboard";
    };

    /**
     * ✅ Maps raffle type IDs to appropriate descriptions.
     * @param {number} typeId - The raffle type ID.
     * @returns {string} - The description.
     */
    const getDescription = (typeId) => {
      const descriptions = {
        1: "Withdraw money securely.",
        2: "Let us pay on your behalf.",
        3: "Enjoy free giveaways and rewards.",
      };
      return descriptions[typeId] || "A special service just for you.";
    };

    // ✅ Fetch products when component is mounted
    onMounted(fetchProducts);

    return {
      availableProducts,
      loadingProducts,
      dynamicGridClass,
    };
  },
};
</script>

<style scoped>
/* ✅ Ensure consistent card height */
.card {
  height: 100%;
}

/* ✅ Define primary theme color */
.text-success {
  color: #09b850 !important;
}
</style>
