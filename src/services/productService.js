import { ref } from "vue";
import apiClient from "@/services/apiService"; // Axios instance

// ✅ Holds products globally (avoiding redundant API calls)
const products = ref([]);
const loading = ref(false);

/**
 * ✅ Fetches all active raffle cycles from API.
 * @param {boolean} forceRefresh - If true, fetches fresh data.
 * @returns {Promise<Array>} - List of products.
 */
export const fetchProducts = async (forceRefresh = false) => {
  // ✅ Ensure we only fetch fresh data when necessary
  if (!forceRefresh && products.value.length > 0) {
    return products.value; 
  }

  loading.value = true; // Show loader

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
              winnable_amount: parseFloat(raffle.winnable_amount), // ✅ Ensure numeric value
              price_of_ticket: parseFloat(raffle.price_of_ticket), // ✅ Store ticket price
              icon: getIcon(type.raffle_type_id),
              route: `${getRoute(type.raffle_type_id)}?raffle_cycle_id=${raffle.raffle_cycle_id}&raffle_type_id=${type.raffle_type_id}`,
            });
          });
        }
      });

      products.value = parsedProducts;
      console.log("✅ Products fetched successfully:", products.value);
    } else {
      console.warn("⚠ No products found.");
      products.value = []; // Ensure empty array if no data found
    }
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    products.value = []; // Ensure empty array on error
  } finally {
    loading.value = false; // Hide loader
  }

  return products.value;
};

/**
 * ✅ Fetches product details by `raffle_type_id`.
 * Ensures **real-time API validation**.
 * @param {string} raffleTypeId - The ID of the raffle type.
 * @returns {Promise<Object|null>} - Product details or null.
 */
export const fetchProductById = async (raffleTypeId) => {
  try {
    console.log(`🔍 Fetching product details for Raffle Type ID: ${raffleTypeId}`);
    
    const response = await apiClient.post("/nocash-bank/v1/action", {
      action_type: "get_raffle_cycle_by_id",
      raffle_cycle_id: raffleTypeId,
    });

    if (response.data.success) {
      const raffleCycle = response.data.raffle_cycle;

      return {
        raffle_cycle_id: raffleCycle.raffle_cycle_id,
        winnable_amount: parseFloat(raffleCycle.winnable_amount),
        price_of_ticket: parseFloat(raffleCycle.price_of_ticket),
        status: raffleCycle.status,
        associated_types: raffleCycle.associated_types,
      };
    } else {
      console.warn("⚠ Product not found in the database.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error fetching product by ID:", error);
    return null;
  }
};

/**
 * ✅ Validates a raffle cycle against the API.
 * @param {string} raffleCycleId - The ID of the raffle cycle to verify.
 * @param {string} raffleTypeId - The ID of the associated raffle type.
 * @returns {Promise<Object|null>} - Returns validated raffle data or `null` if invalid.
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
          winnable_amount: parseFloat(raffleCycle.winnable_amount),
          price_of_ticket: parseFloat(raffleCycle.price_of_ticket),
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
 * ✅ Returns loading state for UI components.
 */
export const isLoading = () => loading.value;

/**
 * ✅ Maps raffle type IDs to correct icons.
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
 * ✅ Maps raffle type IDs to correct routes.
 */
const getRoute = (typeId) => {
  const routes = {
    1: "/get-cash",
    2: "/pay4me",
    3: "/on-the-house",
  };
  return routes[typeId] || "/dashboard";
};
