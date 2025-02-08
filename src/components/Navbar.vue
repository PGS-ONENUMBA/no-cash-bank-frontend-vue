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

          <!-- 🔥 Dynamically Render Products Dropdown -->
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
                <router-link class="dropdown-item" :to="{
                  path: product.route,
                  query: {
                    raffle_cycle_id: product.raffle_cycle_id,
                    raffle_type_id: product.raffle_type_id
                  }
                }">
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
              <!-- Show Wallet Balance -->
              <li class="dropdown-item">
                <strong><i class="bi bi-wallet2"></i> Wallet:</strong>
                <span class="text-success">{{ formattedBalance }}</span>
              </li>
              <!-- Show Phone Number (If Available) -->
              <li class="dropdown-item" v-if="userPhoneNumber">
                <strong><i class="bi bi-phone"></i> Phone:</strong> {{ userPhoneNumber }}
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
import { computed, ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { fetchProducts, isLoading } from "@/services/productService"; // ✅ Use centralized service

export default {
  name: "Navbar",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const availableProducts = ref([]);
    const loadingProducts = isLoading();

    const siteName = import.meta.env.VITE_SITE_NAME || "OneNnumba";
    const logoPath = "/assets/logo.jpeg";

    /**
     * ✅ Retrieves authentication status
     */
    const isAuthenticated = computed(() => authStore.isAuthenticated);

    /**
     * ✅ Retrieves user display name
     */
    const userDisplayName = computed(() => authStore.user?.displayName || "User");

    /**
     * ✅ Retrieves user's phone number
     */
    const userPhoneNumber = computed(() => authStore.user?.phone_number || null);

    /**
     * ✅ Retrieves formatted wallet balance
     */
    const formattedBalance = computed(() =>
      new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
        parseFloat(authStore.user?.wallet_balance ?? 0.00)
      )
    );

    /**
     * ✅ Fetch products from the API
     */
    const loadProducts = async () => {
      availableProducts.value = await fetchProducts();
    };

    /**
     * ✅ Handles user logout
     */
    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    onMounted(loadProducts);

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
