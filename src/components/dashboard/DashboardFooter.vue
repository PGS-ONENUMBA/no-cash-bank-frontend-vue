<template>
  <div class="footer-menu d-md-none">
    <ul>
      <li>
        <router-link to="/dashboard" :class="{ active: isActive('/dashboard') }">
          <i class="bi bi-house-door"></i> <span>Dashboard</span>
        </router-link>
      </li>

      <!-- Dropdown for Dynamic Products -->
      <li class="dropdown">
        <a href="#" class="dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-cart-check"></i> <span>Products</span>
        </a>
        <ul class="dropdown-menu">
          <li v-if="loadingProducts" class="text-center p-2">
            <div class="spinner-border text-success" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </li>
          <li v-for="product in availableProducts" :key="`${product.raffle_cycle_id}-${product.raffle_type_id}`">
            <router-link class="dropdown-item" :to="product.route">
              <i :class="product.icon"></i> {{ product.raffle_type }}
            </router-link>
          </li>
          <li v-if="!loadingProducts && availableProducts.length === 0" class="text-center text-muted p-2">
            No products available
          </li>
        </ul>
      </li>

      <li>
        <router-link to="/dashboard/transfer" :class="{ active: isActive('/dashboard/transfer') }">
          <i class="bi bi-arrow-up-right-circle"></i> <span>Transfer</span>
        </router-link>
      </li>

      <li>
        <a href="#" @click.prevent="handleLogout">
          <i class="bi bi-box-arrow-right"></i> <span>Logout</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import apiClient from "@/services/apiService";

export default {
  name: "DashboardFooter",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const availableProducts = ref([]);
    const loadingProducts = ref(true);

    /**
     * Checks if the given route is currently active.
     */
    const isActive = (route) => computed(() => router.currentRoute.value.path === route);

    /**
     * Fetches available products dynamically.
     */
    const fetchProducts = async () => {
      try {
        console.log("Fetching products...");
        const response = await apiClient.post("/nocash-bank/v1/action", {
          action_type: "get_raffle_cycle",
        });

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
                  route: getRoute(type.raffle_type_id, raffle.raffle_cycle_id),
                });
              });
            }
          });

          availableProducts.value = parsedProducts;
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
     * Generates the correct route for each product.
     */
    const getRoute = (typeId, cycleId) => {
      const routes = {
        1: `/get-cash?raffle_cycle_id=${cycleId}`,
        2: `/pay4me?raffle_cycle_id=${cycleId}`,
        3: `/on-the-house?raffle_cycle_id=${cycleId}`,
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
      handleLogout,
      isActive,
      availableProducts,
      loadingProducts,
    };
  },
};
</script>

<style scoped>
/* Mobile Footer Menu */
.footer-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #ffffff;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
  z-index: 1000;
}

.footer-menu ul {
  display: flex;
  justify-content: space-around;
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer-menu ul li a {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-size: 14px;
}

.footer-menu ul li a.active {
  color: #09b850;
  font-weight: bold;
}

/* Dropdown Styles */
.dropdown-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #333;
  text-decoration: none;
  background: none;
  border: none;
}

.dropdown-menu {
  min-width: 160px;
}

.dropdown-item {
  font-size: 14px;
}
</style>
