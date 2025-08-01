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
            <i class="bi bi-house-door sidebar-icon"></i> Dashboard
          </router-link>
        </li>

        <!-- 🟢 @TODO Dynamically Render Product Menu Items. not working as it should -->
        <template v-if="authStore?.user.user_role === 'customer'">
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
            <i :class="product.icon" class="sidebar-icon"></i> {{ product.raffle_type }}
          </router-link>
        </li>
        </template>
      

        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/transfer') }" to="/dashboard/transfer">
            <i class="bi bi-arrow-up-right-circle sidebar-icon"></i> Transfer
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/reports') }" to="/dashboard/reports">
            <i class="bi bi-clock-history sidebar-icon"></i> Reports
          </router-link>
        </li>
      </ul>

      <!-- Profile & Logout -->
      <ul class="nav flex-column mt-4">
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/profile') }" to="/dashboard/profile">
            <i class="bi bi-person sidebar-icon"></i> My Profile
          </router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click.prevent="handleLogout">
            <i class="bi bi-box-arrow-right sidebar-icon"></i> Logout
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { fetchProducts, isLoading, getIcon, getRoute } from "@/services/productService";
import { useAuthStore } from "@/stores/authStore";

export default {
  name: "SidebarMenu",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const availableProducts = ref([]);
    const loadingProducts = isLoading();

    /**
     * Transform raw raffle data into menu items
     */
    const transformProducts = (raffles) => {
      const transformed = [];
      
      raffles.forEach(raffle => {
        raffle.associated_types.forEach(type => {
          transformed.push({
            raffle_cycle_id: raffle.raffle_cycle_id,
            raffle_type_id: type.raffle_type_id,
            raffle_type: type.raffle_type,
            winnable_amount: raffle.winnable_amount,
            icon: `${getIcon(type.raffle_type_id)} sidebar-icon`,
            route: getRoute(type.raffle_type_id)
          });
        });
      });

      return transformed;
    };

    /**
     * Load and transform products using cached service
     */
    const loadProducts = async () => {
      try {
        const rawProducts = await fetchProducts();
        availableProducts.value = transformProducts(rawProducts);
      } catch (error) {
        console.error("❌ Error loading products:", error);
        availableProducts.value = [];
      }
    };

    /**
     * Check if route is active
     */
    const isActive = (route) => router.currentRoute.value.path === route;

    /**
     * Handle user logout
     */
    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    onMounted(loadProducts);

    return {
      authStore,
      isActive,
      handleLogout,
      availableProducts,
      loadingProducts,
    };
  },
};
</script>

<style scoped>
/* ✅ Sidebar link text should be black */
.sidebar .nav-link {
  color: black;
  font-weight: 500;
  transition: color 0.3s ease-in-out;
}

/* ✅ Purple Icons */
.sidebar-icon {
  color: #6609b8;
  margin-right: 8px;
}

/* ✅ Change text color on hover */
.sidebar .nav-link:hover {
  color: #555; /* Lighter black */
}

/* ✅ Active state remains green */
.sidebar .nav-link.active {
  color: #09b850;
}

/* Adjustments for sidebar spacing */
.nav.flex-column {
  padding-left: 10px;
}
</style>
