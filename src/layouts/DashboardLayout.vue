<template>
  <div>
    <!-- Dashboard Header -->
    <header class="navbar navbar-light sticky-top bg-white shadow px-3">
      <!-- Logo redirects to Dashboard -->
      <a class="navbar-brand col-md-3 col-lg-2" href="#" @click.prevent="goToDashboard">
        {{ siteName }}
      </a>

      <!-- Right Side of Navbar -->
      <div class="navbar-nav d-flex align-items-center">
        <!-- User Dropdown -->
        <div class="nav-item dropdown me-3">
          <span class="cursor-pointer" @click="goToProfile">
            <i class="bi bi-person-circle me-2"></i> {{ userDisplayName }}
          </span>
        </div>
      </div>
    </header>

    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <SidebarMenu />

        <!-- Main Content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 mb-5">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>

import SidebarMenu from "@/components/dashboard/SidebarMenu.vue";
import { useAuthStore } from "@/store/authStore";
import { computed } from "vue";
import { useRouter } from "vue-router";

const siteName = import.meta.env.VITE_SITE_NAME

const authStore = useAuthStore();
const router = useRouter();

/* Get username from Pinia store.
*/
const userDisplayName = computed(() => authStore.user?.user_nicename || "User");

/**
* Redirect to dashboard when logo is clicked.
*/
  const goToDashboard = () => {
    router.push({ name: "Dashboard" });
  };

  /**
   * Redirect to user profile when name is clicked.
   */
    const goToProfile = () => {
    router.push({ name: "DashboardProfile" });
  };

// const logout = () => {
//   localStorage.removeItem("authToken");
//   localStorage.removeItem("refresh_token");
//   localStorage.removeItem("refresh_token_expires_in");
//   localStorage.removeItem("tokenExpiry");
//   localStorage.removeItem("userData");
//   this.$router.push("/login");
// }

// export default {
//   name: "DashboardLayout",
//   components: {
//     SidebarMenu,
//   },
//   setup() {
//     const authStore = useAuthStore();
//     const router = useRouter();

//     /**
//      * Get username from Pinia store.
//      */
//     const userDisplayName = computed(() => authStore.user?.user_nicename || "User");

//     /**
//      * Redirect to dashboard when logo is clicked.
//      */
//     const goToDashboard = () => {
//       router.push({ name: "Dashboard" });
//     };

//     /**
//      * Redirect to user profile when name is clicked.
//      */
//     const goToProfile = () => {
//       router.push({ name: "DashboardProfile" });
//     };

//     return {
//       userDisplayName,
//       goToDashboard,
//       goToProfile,
//       siteName: import.meta.env.VITE_SITE_NAME, // Getting site name from env
//     };
//   },
// };
</script>

<style scoped>
/* Navbar styling */
.navbar .dropdown-menu {
  min-width: 200px;
}

/* Make username clickable */
.cursor-pointer {
  cursor: pointer;
}

/* Adjust spacing */
.nav-item .nav-link {
  display: flex;
  align-items: center;
}
</style>
