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

          <!-- 🟢 Dynamically Render Products Dropdown -->
          <li class="nav-item dropdown mx-2">
            <button
              class="nav-link dropdown-toggle"
              id="productsDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="bi bi-box-seam bi-green"></i> Products
            </button>
            <ul class="dropdown-menu" aria-labelledby="productsDropdown">
              <li v-if="loadingProducts" class="dropdown-item text-center">
                <div class="spinner-border text-success" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </li>
              <li v-else-if="availableProducts.length > 0" v-for="product in availableProducts" :key="`${product.raffle_cycle_id}-${product.raffle_type_id}`">
                <router-link class="dropdown-item" :to="product.route">
                  <i :class="product.icon"></i> {{ product.raffle_type }}
                </router-link>
              </li>
              <li v-else class="dropdown-item text-danger">No products available</li>
            </ul>
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
import { computed, ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import apiClient from "@/services/apiService";

export default {
  name: "Navbar",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const availableProducts = ref([]);
    const loadingProducts = ref(true);

    // Get site name and logo path from environment variables
    const siteName = import.meta.env.VITE_SITE_NAME || "OneNnumba";
    const logoPath = "/assets/logo.jpeg"; // Ensure the correct path is used

    // Computed property for authentication status
    const isAuthenticated = computed(() => authStore.isAuthenticated);

    // Computed property for user display name
    const userDisplayName = computed(() => authStore.user?.user_nicename || "User");

    /**
     * Fetches available products dynamically from the API.
     */
    const fetchProducts = async () => {
      try {
        console.log("Fetching products...");
        const response = await apiClient.post("/nocash-bank/v1/action", {
          action_type: "get_raffle_cycle",
        });

        console.log("✅ API Response:", response.data);

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

          availableProducts.value = parsedProducts;
          console.log("🚀 Parsed Products:", availableProducts.value);
        } else {
          console.warn("⚠️ No products found in API response.");
        }
      } catch (error) {
        console.error("❌ Error fetching products:", error.message);
      } finally {
        loadingProducts.value = false;
      }
    };

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

    /**
     * Handles user logout and redirects to login page.
     */
    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    // Fetch products on component mount
    onMounted(fetchProducts);

    return {
      siteName,
      logoPath,
      isAuthenticated,
      userDisplayName,
      handleLogout,
      availableProducts,
      loadingProducts,
    };
  },
};
</script>
