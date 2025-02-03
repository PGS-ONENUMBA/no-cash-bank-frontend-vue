<template>
  <div class="footer-menu d-md-none">
    <ul>
      <li>
        <router-link to="/dashboard" :class="{ active: isActive('/dashboard') }">
          <i class="bi bi-house-door"></i> <span>Dashboard</span>
        </router-link>
      </li>
      <li>
        <router-link to="/dashboard/get-cash" :class="{ active: isActive('/dashboard/get-cash') }">
          <i class="bi bi-currency-exchange"></i> <span>Get Cash</span>
        </router-link>
      </li>
      <li>
        <router-link to="/dashboard/pay4me" :class="{ active: isActive('/dashboard/pay4me') }">
          <i class="bi bi-check-circle"></i> <span>Pay-4-Me</span>
        </router-link>
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
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "vue-router";
import { computed } from "vue";

export default {
  name: "DashboardFooter",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    /**
     * Determines if the current route matches the given path.
     * Uses a computed property to avoid recalculating on each render.
     */
    const isActive = (route) => computed(() => router.currentRoute.value.path === route);

    /**
     * Logs the user out and redirects to the login page.
     */
    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    return { handleLogout, isActive };
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
