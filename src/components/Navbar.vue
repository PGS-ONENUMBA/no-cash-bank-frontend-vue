<template>
  <nav class="navbar navbar-expand-md navbar-white fixed-top bg-white shadow-sm">
    <div class="container">
      <!-- Logo -->
      <router-link class="navbar-brand" to="/">
        <img :src="logoPath" :alt="siteName" class="navbar-logo img-fluid" />
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

          <!-- Products Dropdown -->
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
              <li
                v-else-if="availableProducts.length > 0"
                v-for="product in availableProducts"
                :key="`${product.raffle_cycle_id}-${product.raffle_type_id}`"
              >
                <router-link
                  class="dropdown-item"
                  :to="{
                    path: product.route,
                    query: {
                      raffle_cycle_id: product.raffle_cycle_id,
                      raffle_type_id: product.raffle_type_id
                    }
                  }"
                >
                  <i :class="product.icon"></i> {{ product.raffle_type }}
                </router-link>
              </li>
              <li v-else class="dropdown-item text-danger">No products available</li>
            </ul>
          </li>

          <!-- ✅ Pay at Merchant (top nav, only if logged in) -->
          <li v-if="isAuthenticated" class="nav-item mx-2">
            <router-link class="nav-link" to="/dashboard/spend">
              <i class="bi bi-bag-check bi-green"></i> Spend
            </router-link>
          </li>
        </ul>

        <!-- Login Button -->
        <router-link v-if="!isAuthenticated" class="btn btn-green btn-small" to="/login">
          <i class="bi bi-lock bi-white"></i> Login
        </router-link>

        <!-- User Profile Dropdown -->
        <div v-else class="d-flex align-items-center">
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
              <li class="dropdown-item">
                <strong><i class="bi bi-wallet2"></i> Wallet:</strong>
                <span class="text-success">{{ formattedBalance }}</span>
              </li>
              <li class="dropdown-item" v-if="userPhoneNumber">
                <strong><i class="bi bi-phone"></i> Phone:</strong> {{ userPhoneNumber }}
              </li>

              <!-- ✅ Quick link inside user menu -->
              <li>
                <router-link class="dropdown-item" to="/dashboard/spend">
                  <i class="bi bi-bag-check"></i> Spend
                </router-link>
              </li>

              <li><hr class="dropdown-divider" /></li>
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
/**
 * @component Navbar
 * @description Main navigation component for the application. Handles user authentication status,
 * product navigation, and user profile management. Uses Bootstrap for styling and responsive design.
 *
 * @requires Vue
 * @requires Vue Router
 * @requires Pinia Auth Store
 * @requires Product Service
 */

import { computed, ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { fetchProducts, isLoading, getIcon, getRoute } from "@/services/productService";
import logoImg from '@/assets/logo.png';  // or .jpeg whatever file name and extension is

export default {
  name: "FrontEndAppNavbar",

  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const availableProducts = ref([]);
    const loadingProducts = isLoading();

    const siteName = import.meta.env.VITE_SITE_NAME || "OneNnumba";


// ...

const logoPath = logoImg;


    /**
     * Transform raw raffle data into displayable product format
     */
    const transformProducts = (raffles) => {
      const transformed = [];

      raffles.forEach(raffle => {
        // For each raffle cycle, create entries for all associated types
        raffle.associated_types.forEach(type => {
          transformed.push({
            raffle_cycle_id: raffle.raffle_cycle_id,
            raffle_type_id: type.raffle_type_id,
            raffle_type: type.raffle_type,
            winnable_amount: raffle.winnable_amount,
            icon: getIcon(type.raffle_type_id),
            route: getRoute(type.raffle_type_id)
          });
        });
      });

      console.log('Transformed products:', transformed);
      return transformed;
    };

    // Authentication computed properties
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const userDisplayName = computed(() => authStore.user?.displayName || "User");
    const userPhoneNumber = computed(() => authStore.user?.phone_number || null);
    const formattedBalance = computed(() =>
      new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN"
      }).format(parseFloat(authStore.user?.wallet_balance ?? 0.00))
    );

    // Handle user logout
    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    // Fetch and transform products on component mount
    onMounted(async () => {
      try {
        const rawProducts = await fetchProducts();
        console.log('Raw products received:', rawProducts);
        availableProducts.value = transformProducts(rawProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        availableProducts.value = [];
      }
    });

    return {
      siteName,
      logoPath,
      isAuthenticated,
      userDisplayName,
      userPhoneNumber,
      formattedBalance,
      handleLogout,
      availableProducts,
      loadingProducts,
    };
  },
};
</script>

<style scoped>
/* Add any component-specific styles here */
.navbar-logo {
  max-height: 50px;  /* adjust this to suit your navbar height */
  height: auto;
  width: auto;        /* let width adjust according to aspect ratio */
  object-fit: contain;
}

/* Optional media queries for smaller screens */
@media (max-width: 768px) {
  .navbar-logo {
    max-height: 40px;   /* smaller logo on mobile */
  }
}

</style>
