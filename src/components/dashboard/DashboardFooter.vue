<template>
  <div class="footer-menu d-md-none mt-5">
    <ul>
      <!-- Dashboard -->
      <li>
        <router-link to="/dashboard" :class="{ active: isActive('/dashboard') }">
          <i class="bi bi-house-door"></i> <span>Home</span>
        </router-link>
      </li>

      <!-- Dynamically Render Products -->
      <li v-for="product in availableProducts" :key="`${product.raffle_cycle_id}-${product.raffle_type_id}`">
        <router-link
          :to="{
            path: product.route,
            query: {
              raffle_cycle_id: product.raffle_cycle_id,
              raffle_type_id: product.raffle_type_id
            }
          }"
          :class="{ active: isActive(product.route) }"
        >
          <i :class="product.icon"></i> <span>{{ product.raffle_type }}</span>
        </router-link>
      </li>

      <!-- Transfer Funds -->
      <li>
        <router-link to="/dashboard/transfer" :class="{ active: isActive('/dashboard/transfer') }">
          <i class="bi bi-arrow-up-right-circle"></i> <span>Transfer</span>
        </router-link>
      </li>

      <!-- Logout -->
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
import { fetchProducts } from "@/services/productService";

export default {
  name: "DashboardFooter",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    const availableProducts = ref([]);

    /**
     * ✅ Fetch dynamic products for footer menu
     */
    const loadProducts = async () => {
      try {
        availableProducts.value = await fetchProducts();
      } catch (error) {
        console.error("❌ Error fetching products:", error);
      }
    };

    /**
     * ✅ Determines if the current route matches the given path.
     */
    const isActive = (route) => computed(() => router.currentRoute.value.path === route);

    /**
     * ✅ Logs the user out and redirects to the login page.
     */
    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    onMounted(loadProducts);

    return { handleLogout, isActive, availableProducts };
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
</style>
