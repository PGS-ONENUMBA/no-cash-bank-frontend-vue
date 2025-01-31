import apiClient from "@/services/apiService"; // Import API service


/**
 * Logs in the user by sending credentials to the API.
 * Stores authentication tokens and user data in localStorage.
 *
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<object>} - Response data containing tokens and user info
 */
export const login = async (username, password) => {
  try {
    const response = await apiClient.post("/jwt-auth/v1/token", {
      username,
      password,
    });

    // Extract tokens & user data
    //const { token, refresh_token, user_id, user_email, phone_number, wallet_balance } = response;

    // Store tokens & expiry
    // localStorage.setItem("authToken", token);
    // localStorage.setItem("refreshToken", refresh_token);
    // localStorage.setItem("tokenExpiry", Date.now() + 1200 * 1000); // Expires in 20 minutes
    // localStorage.setItem("lastActive", Date.now()); // Store last activity time
    // localStorage.setItem(
    //   "userData",
    //   JSON.stringify({ user_id, phone_number, user_email, wallet_balance })
    // );

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

/**
 * Refreshes the access token before it expires.
 * If the user has been inactive for too long, they will be logged out.
 *
 * @returns {Promise<string|null>} - New access token or null if refresh fails
 */
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  const lastActive = localStorage.getItem("lastActive");

  if (!refreshToken) {
    console.error("No refresh token available.");
    return null;
  }

  // Check if user is inactive for longer than the limit
  if (Date.now() - lastActive > INACTIVITY_LIMIT) {
    console.warn("User inactive for too long. Logging out.");
    logout();
    return null;
  }

  try {
    const response = await apiClient.post("/api/v1/token/refresh", {
      refresh_token: refreshToken,
    });

    // Store new JWT and update last active time
    localStorage.setItem("authToken", response.data.token);
    localStorage.setItem("tokenExpiry", Date.now() + 1200 * 1000); // Expires in 20 minutes
    localStorage.setItem("lastActive", Date.now()); // Reset inactivity timer

    return response.data.token;
  } catch (error) {
    console.error("Token refresh failed:", error.response?.data || error.message);
    return null;
  }
};

/**
 * Logs the user out by clearing all stored authentication data.
 */
export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("refresh_token_expires_in");
  localStorage.removeItem("tokenExpiry");
  localStorage.removeItem("userData");
};
