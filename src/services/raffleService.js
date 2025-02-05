import apiClient from "@/services/apiService";

/**
 * Submits an action to the No Cash Bank API.
 * 
 * @param {string} actionType - The action type (create_order, complete_order, get_raffle_cycle).
 * @param {Object} data - The request payload.
 * @returns {Promise<Object>} - API response.
 */
export const submitAction = async (actionType, data = {}) => {
  try {
    const response = await apiClient.post("/nocash-bank/v1/action", {
      action_type: actionType,
      ...data
    });

    return response.data;
  } catch (error) {
    console.error("❌ API request failed:", error.response?.data?.message || error.message);
    throw error;
  }
};
