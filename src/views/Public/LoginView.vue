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

<script setup>
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

 import { useAuthStore } from "@/store/authStore";
 import { ref } from 'vue'
 import { useRouter } from 'vue-router'


const authStore = useAuthStore();
const router = useRouter()

const username = ref('');
const password = ref('');
const rememberMe = ref('');
const loading = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
      loading.value = true;
      errorMessage.value = null;

      try {
        await authStore.login(username.value, password.value);

        console.log("✅ Login complete. Redirecting to dashboard...");
        router.push({ name: "Dashboard" });
      } catch (error) {
        console.error("❌ Login error:", error.message);
        errorMessage.value = error.message || "Login failed. Try again.";
      } finally {
        loading.value = false;
      }
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
