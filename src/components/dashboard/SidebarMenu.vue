<template>
  <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar">
    <div class="position-sticky pt-3">
      <!-- Show Preloader While Loading -->
      <div v-if="loadingProducts" class="text-center py-3">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading products...</span>
        </div>
      </div>

      <!-- Debugging Log -->
      <p v-if="!loadingProducts && availableProducts.length === 0" class="text-center text-danger">
        No products available.
      </p>

      <!-- Navigation Links -->
      <ul v-if="availableProducts.length > 0" class="nav flex-column">
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard') }" to="/dashboard">
            <i class="bi bi-house-door"></i> Dashboard
          </router-link>
        </li>

        <!-- 🟢 Dynamically Render Product Menu Items -->
        <li
          v-for="product in availableProducts"
          :key="`${product.raffle_cycle_id}-${product.raffle_type_id}`"
          class="nav-item"
        >
          <router-link
            class="nav-link"
            :class="{ active: isActive(product.route) }"
            :to="{
              path: product.route,
              query: {
                raffle_cycle_id: product.raffle_cycle_id,
                raffle_type_id: product.raffle_type_id,
              },
            }"
          >
            <i :class="product.icon"></i> {{ product.raffle_type }}
          </router-link>
        </li>

        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/transfer') }" to="/dashboard/transfer">
            <i class="bi bi-arrow-up-right-circle"></i> Transfer
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/reports') }" to="/dashboard/reports">
            <i class="bi bi-clock-history"></i> Reports
          </router-link>
        </li>
      </ul>

      <!-- Profile & Logout -->
      <ul class="nav flex-column mt-4">
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/profile') }" to="/dashboard/profile">
            <i class="bi bi-person"></i> My Profile
          </router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click.prevent="handleLogout">
            <i class="bi bi-box-arrow-right"></i> Logout
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/services/apiService";
import { useAuthStore } from "@/stores/authStore";

export default {
  name: "SidebarMenu",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const availableProducts = ref([]);
    const loadingProducts = ref(true);

    /**
     * Determines if the given route is active.
     * @param {string} route - The route to check.
     * @returns {boolean} - Returns true if active, otherwise false.
     */
    const isActive = (route) => computed(() => router.currentRoute.value.path === route);

    /**
     * Fetches available products from API & dynamically loads them.
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
                  route: getRoute(type.raffle_type_id),
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
     * @param {number} typeId - The raffle type ID.
     * @returns {string} - The corresponding Bootstrap icon class.
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
     * @param {number} typeId - The raffle type ID.
     * @returns {string} - The corresponding route.
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
     * Handles user logout & redirects to login.
     */
    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    // Fetch product menu items when component loads
    onMounted(fetchProducts);

    return {
      isActive,
      handleLogout,
      availableProducts,
      loadingProducts,
    };
  },
};
</script>

<style scoped>
/* Active state for sidebar links */
.sidebar .nav-link.active {
  color: #09b850;
}

/* Adjustments for sidebar spacing */
.nav.flex-column {
  padding-left: 10px;
}
</style>
