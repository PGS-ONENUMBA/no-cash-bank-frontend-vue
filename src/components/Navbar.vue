<template>
  <nav class="navbar navbar-expand-md navbar-white fixed-top bg-white shadow-sm">
    <div class="container">
      <!-- Logo -->
      <router-link class="navbar-brand" to="/">
        <img :src="logoPath" :alt="siteName" height="30" />
      </router-link>

      <!-- Toggler for Mobile -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar Items -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Centered Navigation -->
        <ul class="navbar-nav justify-content-center w-100">
          <li class="nav-item mx-2">
            <router-link class="nav-link" to="/">
              <i class="bi bi-house-door bi-green"></i> Home
            </router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link" to="/about">
              <i class="bi bi-info-circle bi-green"></i> About
            </router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link" to="/team">
              <i class="bi bi-cash-stack bi-green"></i> Our Team
            </router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link" to="/how-it-works">
              <i class="bi bi-question-circle bi-green"></i> How it Works
            </router-link>
          </li>
        </ul>

        <!-- Login Button -->
        <router-link v-if="!isAuthenticated" class="btn btn-green btn-small" to="/login">
          <i class="bi bi-lock bi-white"></i> Login
        </router-link>
        <div v-else class="d-flex align-items-center">
          <!-- Profile Dropdown -->
          <div class="dropdown">
            <button
              class="btn btn-outline-secondary dropdown-toggle"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="bi bi-person-circle me-2"></i> {{ userDisplayName }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              <li>
                <router-link class="dropdown-item" to="/dashboard/profile">
                  <i class="bi bi-person"></i> My Profile
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item" to="/dashboard">
                  <i class="bi bi-speedometer2"></i> Dashboard
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button class="dropdown-item text-danger" @click="handleLogout">
                  <i class="bi bi-box-arrow-right"></i> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { computed } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

export default {
  name: "Navbar",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    // Get site name and logo path from environment variables
    const siteName = import.meta.env.VITE_SITE_NAME || "OneNnumba";
    const logoPath = "/assets/logo.jpeg"; // Ensure the correct path is used

    // Computed property for authentication status
    const isAuthenticated = computed(() => authStore.isAuthenticated);

    // Computed property for user display name
    const userDisplayName = computed(() => authStore.user?.user_nicename || "User");

    /**
     * Handles user logout and redirects to login page.
     */
    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    return {
      siteName,
      logoPath,
      isAuthenticated,
      userDisplayName,
      handleLogout,
    };
  },
};
</script>

<style scoped>
/* Navbar background and shadow */
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Green color for icons */
.bi-green {
  color: #723ba2;
}

/* Button styles */
.btn-green {
  background-color: #6609b8;
  color: white;
  border: none;
}

.btn-green:hover {
  background-color: #723ba2;
}

/* Profile dropdown */
.dropdown-menu {
  min-width: 180px;
}
</style>
