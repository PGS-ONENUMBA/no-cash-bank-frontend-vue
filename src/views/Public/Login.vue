<template>
  <div>
    <!-- Main Content -->
    <main class="container d-flex align-items-center justify-content-center vh-100">
      <div class="row justify-content-center mt-5">
        <div class="col-md-8">
          <div class="card shadow-sm">
            <div class="card-body">
              <h2 class="card-title text-center pb-3">Login</h2>
              <p class="text-center">
                Welcome to No-Cash-Bank, the innovative raffle-based banking platform.
              </p>
              <form @submit.prevent="handleLogin">
                <!-- Email Field -->
                <div class="mb-3">
                  <label for="email" class="form-label">
                    <i class="bi bi-envelope me-2"></i> Email
                  </label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    v-model="email"
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
              <!-- Back to Home Link -->
              <div class="text-center mt-3">
                <router-link to="/" class="text-decoration-none text-green">
                  <i class="bi bi-arrow-left-circle me-1"></i> Back to Home
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
/**
 * Login Component
 * 
 * This component handles the user login process. It includes a form where users
 * can enter their email and password, along with a "Remember me" checkbox.
 * Upon submission, the form calls the `handleLogin` method, which sends
 * the credentials to the backend for authentication.
 * 
 * Features:
 * - Real-time data binding with `v-model`.
 * - Displays loading state while the login request is being processed.
 * - Shows error messages in case of failed login attempts.
 */

import { login } from "@/services/authService"; // Import the reusable login function

export default {
  name: "Login",
  data() {
    return {
      email: "", // Holds the user's email
      password: "", // Holds the user's password
      rememberMe: false, // Stores the "Remember me" checkbox state
      loading: false, // Indicates whether a login request is in progress
      errorMessage: null, // Stores error messages to display to the user
    };
  },
  methods: {
    /**
     * Handles the login process.
     * 
     * Sends the user's email and password to the backend for authentication.
     * If successful, it stores the authentication token and redirects the user
     * to the dashboard. If unsuccessful, it displays an error message.
     */
    async handleLogin() {
      this.loading = true;
      this.errorMessage = null;

      try {
        const response = await login(this.email, this.password);

        // Extract the token from the response
        const { token } = response.data;

        // Save the token in localStorage
        localStorage.setItem("authToken", token);

        // Redirect the user to the dashboard
        this.$router.push({ name: "Dashboard" });
      } catch (error) {
        // Display the error message to the user
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
