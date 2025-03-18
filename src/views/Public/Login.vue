<template>
  <div class="vh-100 d-flex align-items-center justify-content-center">
    <div class="container">
      <div class="row shadow rounded overflow-hidden">
        <!-- Left Image Column (hidden on mobile) -->
        <div class="col-md-6 d-none d-md-block p-0">
          <div class="login-image h-100"></div>
        </div>

        <!-- Right Login Form -->
        <div class="col-md-6 d-flex align-items-center justify-content-center p-4">
          <div class="w-100" style="max-width: 400px;">
            <h2 class="text-center mb-4">Login</h2>
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
                <div class="input-group">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control"
                    id="password"
                    v-model="password"
                    required
                  />
                  <button
                    class="btn btn-light btn-outline-secondary toggle-btn"
                    type="button"
                    @click="togglePasswordVisibility"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="errorMessage" class="alert alert-danger text-center">
                {{ errorMessage }}
              </div>

              <!-- Submit Button -->
              <button type="submit" class="btn btn-green w-100 mb-3" :disabled="loading">
                <span v-if="loading">
                  <i class="spinner-border spinner-border-sm"></i> Logging in...
                </span>
                <span v-else>
                  <i class="bi text-white bi-box-arrow-in-right me-2"></i> Login
                </span>
              </button>

              <!-- Forgot Password -->
              <div class="text-center">
                <router-link to="/reset-password" class="text-decoration-none text-green">
                  <i class="bi bi-question-circle me-1"></i> Forgot your password?
                </router-link>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
<script>
import { useAuthStore } from "@/stores/authStore";
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "UserLogin",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const username = ref("");
    const password = ref("");
    const loading = ref(false);
    const errorMessage = ref(null);
    const showPassword = ref(false);

    /**
     * ✅ Toggles password visibility
     */
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    /**
     * ✅ Handles user login
     */
     const handleLogin = async () => {
        loading.value = true;
        errorMessage.value = null;

        try {
          console.log("🚀 Logging in with:", { username: username.value, password: password.value });
          await authStore.login(username.value, password.value, router);

          console.log("✅ Login successful. Redirecting...");
          setTimeout(() => {
            router.push("/dashboard").catch(err =>
              console.error("❌ Router navigation error:", err)
            );
          }, 500); // Small delay to allow state updates
        } catch (error) {
          console.error("❌ Login error:", error.message);
          errorMessage.value = error.message || "Login failed. Try again.";
        } finally {
          loading.value = false;
        }
      };



    return {
      username,
      password,
      loading,
      errorMessage,
      handleLogin,
      showPassword,
      togglePasswordVisibility,
    };
  },
};
</script>

<style scoped>
  /* Ensures button aligns properly inside password field */
  .toggle-btn {
    border: none;
    background: none;
  }

  /* Left image column background */
  .login-image {
    background: url('@/assets/login-image.png') no-repeat center center;
    background-size: cover;
    width: 100%;
    height: 100%;
  }
  .container{
    width: 90%;
  }
</style>
