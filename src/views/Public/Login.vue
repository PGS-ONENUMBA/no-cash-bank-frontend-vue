<template>
  <div>
    <!-- Main Content -->
    <div class=" mt-5 pt-2 align-items-center justify-content-center vh-100">
      <div class="row justify-content-center mt-5">
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h2 class="card-title text-center pb-3">Login</h2>
              <form @submit.prevent="handleLogin">
                <!-- Username Field -->
                <div class="mb-3">
                  <label for="username" class="form-label">
                    <i class="bi bi-person me-2"></i> Username
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="username"
                    v-model="username"
                    required
                  />
                </div>
                <!-- Password Field -->
                <div class="mb-3">
                  <label for="password" class="form-label">
                    <i class="bi bi-lock-fill me-2"></i> Password
                  </label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    required
                    v-model="password"
                  />
                </div>
                <!-- Remember Me Checkbox -->
                <div class="form-check mb-3">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="rememberMe"
                    v-model="rememberMe"
                  />
                  <label class="form-check-label" for="rememberMe">Remember me</label>
                </div>
                <!-- Error Message -->
                <div v-if="errorMessage" class="alert alert-danger text-center">
                  {{ errorMessage }}
                </div>
                <!-- Submit Button -->
                <button
                  type="submit"
                  class="btn btn-orange w-100 mb-3"
                  :disabled="loading"
                >
                  <span v-if="loading">
                    <i class="spinner-border spinner-border-sm"></i> Logging in...
                  </span>
                  <span v-else>
                    <i class="bi bi-box-arrow-in-right me-2 bi-white"></i> Login
                  </span>
                </button>
              </form>
              <!-- Forgot Password Link -->
              <div class="text-center">
                <router-link to="/reset-password" class="text-decoration-none text-green">
                  <i class="bi bi-question-circle me-1"></i> Forgot your password?
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Login Component
 *
 * Handles user authentication by sending login credentials to the backend API.
 * On success, it stores the access token, refresh token, and user data in local storage.
 *
 * Features:
 * - Real-time data binding with `v-model`
 * - Displays a loading state during authentication
 * - Shows an error message if login fails
 * - Redirects authenticated users to the dashboard
 */

import { login } from "@/services/authService";

export default {
  name: "Login",
  data() {
    return {
      username: "", // Stores the user's entered username
      password: "", // Stores the user's entered password
      rememberMe: false, // Checkbox for "Remember me" option
      loading: false, // Controls the loading state during login
      errorMessage: null, // Stores error messages
    };
  },
  methods: {
    /**
     * Handles the login process by sending user credentials to the API.
     * If successful, stores the access token, refresh token, and user data.
     */
    async handleLogin() {
      this.loading = true;
      this.errorMessage = null;

      try {
        const response = await login(this.username, this.password);

        // Destructure API response
        const { token, refresh_token, refresh_token_expires_in, user_id, user_display_name, user_nicename, user_email, phone_number, wallet_balance } = response;

        // Store authentication token securely
        localStorage.setItem("authToken", token);
        localStorage.setItem("tokenExpiry", Date.now() + 1200 * 1000); // Expires in 20 minutes
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("refresh_token_expires_in", refresh_token_expires_in);
        localStorage.setItem("userData", JSON.stringify({
          user_id,
          user_display_name,
          user_nicename,
          user_email,
          phone_number,
          wallet_balance
        }));

        // Redirect the user to the dashboard
        this.$router.push({ name: "Dashboard" });
      } catch (error) {
        // Handle API errors
        if (error.response && error.response.data) {
          this.errorMessage = error.response.data.message;
        } else {
          this.errorMessage = "An unexpected error occurred. Please try again.";
        }
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* Styling for the Login Component */

/* Alert box styles */
.alert {
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
</style>
