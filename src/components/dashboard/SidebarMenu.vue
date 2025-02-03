<template>
  <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar">
    <div class="position-sticky pt-3">
      <!-- Navigation Links -->
      <ul class="nav flex-column">
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard') }" to="/dashboard">
            <i class="bi bi-house-door"></i> Dashboard
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/get-cash') }" to="/dashboard/get-cash">
            <i class="bi bi-currency-exchange"></i> Get Cash
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/pay4me') }" to="/dashboard/pay4me">
            <i class="bi bi-check-circle"></i> Pay-4-Me
          </router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/on-the-house') }" to="/dashboard/on-the-house">
            <i class="bi bi-gift"></i> On The House
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
import { useAuthStore } from "@/store/authStore";
import { computed } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "SidebarMenu",
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    /**
     * Checks if a given route matches the current path for active state.
     */
    const isActive = (route) => computed(() => router.currentRoute.value.path === route);

    /**
     * Handles user logout via Pinia store.
     */
    const handleLogout = async () => {
      await authStore.logout();
      router.push("/login");
    };

    return {
      isActive,
      handleLogout,
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
