import { ref } from "vue";
import apiClient from "@/services/apiService"; // Ensure you have an Axios instance setup

// Store products globally to avoid redundant API calls
const products = ref([]);
const loading = ref(false);

/**
 * Fetch all products from API (cached for efficiency).
 */
export const fetchProducts = async () => {
  if (products.value.length > 0) return products.value; // Return cached products

  loading.value = true;

  try {
    console.log("🚀 Fetching products...");
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
              raffle_type: type.raffle_type,
              icon: getIcon(type.raffle_type_id),
              route: `${getRoute(type.raffle_type_id)}?raffle_cycle_id=${raffle.raffle_cycle_id}&raffle_type_id=${type.raffle_type_id}`,
            });
          });
        }
      });

      products.value = parsedProducts;
      console.log("✅ Products loaded:", products.value);
    } else {
      console.warn("⚠ No products found.");
    }
  } catch (error) {
    console.error("❌ Error fetching products:", error);
  } finally {
    loading.value = false;
  }

  return products.value;
};

/**
 * Get loading state for UI components.
 */
export const isLoading = () => loading;

/**
 * Maps raffle type IDs to correct icons.
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
 * Maps raffle type IDs to correct routes.
 */
const getRoute = (typeId) => {
  const routes = {
    1: "/get-cash",
    2: "/pay4me",
    3: "/on-the-house",
  };
  return routes[typeId] || "/dashboard";
};
