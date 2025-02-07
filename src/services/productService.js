import { ref } from "vue";
import apiClient from "@/services/apiService"; // Axios instance

// ✅ Cache products globally
const products = ref([]);
const loading = ref(false);

/**
 * ✅ Fetches products from API.
 * If `forceRefresh` is `true`, it ignores cache and fetches new data.
 */
export const fetchProducts = async (forceRefresh = false) => {
  if (!forceRefresh && products.value.length > 0) {
    return products.value; // ✅ Return cached products if no refresh requested
  }

  loading.value = true;
  try {
    console.log("🚀 Fetching latest products...");
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
              winnable_amount: raffle.winnable_amount, // ✅ Ensure winnable amount is stored
              icon: getIcon(type.raffle_type_id),
              route: `${getRoute(type.raffle_type_id)}?raffle_cycle_id=${raffle.raffle_cycle_id}&raffle_type_id=${type.raffle_type_id}`,
            });
          });
        }
      });

      products.value = parsedProducts; // ✅ Store updated results
      console.log("✅ Updated Products Cache:", products.value);
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
 * ✅ Fetches product details by `raffle_type_id`, ensuring fresh data.
 */
export const fetchProductById = async (raffleTypeId) => {
  await fetchProducts(true); // ✅ Force API refresh

  return products.value.find((product) => product.raffle_type_id === parseInt(raffleTypeId)) || null;
};

/**
 * ✅ Validates a raffle cycle against the API to ensure integrity.
 * @param {string} raffleCycleId - The ID of the raffle cycle to verify.
 * @param {string} raffleTypeId - The ID of the associated raffle type.
 * @returns {object|null} - Returns the validated raffle data or `null` if invalid.
 */
export const validateRaffleCycle = async (raffleCycleId, raffleTypeId) => {
  try {
    console.log(`🔍 Validating Raffle Cycle: ${raffleCycleId}, Type: ${raffleTypeId}`);

    const response = await apiClient.post("/nocash-bank/v1/action", {
      action_type: "get_raffle_cycle_by_id",
      raffle_cycle_id: raffleCycleId,
    });

    if (response.data.success) {
      const raffleCycle = response.data.raffle_cycle;

      // ✅ Ensure the raffle type exists within this cycle
      const selectedType = raffleCycle.associated_types.find(
        (type) => type.raffle_type_id === parseInt(raffleTypeId)
      );

      if (selectedType) {
        return {
          raffle_cycle_id: raffleCycle.raffle_cycle_id,
          winnable_amount: raffleCycle.winnable_amount,
          status: raffleCycle.status,
          raffle_type_id: selectedType.raffle_type_id,
          raffle_type: selectedType.raffle_type,
        };
      }
    }

    console.warn("⚠ Raffle cycle validation failed. Possible data tampering.");
    return null;
  } catch (error) {
    console.error("❌ Error validating raffle cycle:", error);
    return null;
  }
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
