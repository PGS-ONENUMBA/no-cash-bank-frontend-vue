<template>
  <div>
    <!-- Dashboard Header (Minimal) -->
    <header class="navbar navbar-light sticky-top bg-white shadow">
      <a class="navbar-brand col-md-3 col-lg-2 px-3" href="#">
        {{ siteName }}
      </a>
      <div class="navbar-nav">
        <div class="nav-item text-nowrap">
          <a class="nav-link px-3" href="#" @click="logout">
            <i class="bi bi-box-arrow-right"></i> Logout
          </a>
        </div>
      </div>
    </header>

    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <SidebarMenu />

        <!-- Main Content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <router-view></router-view>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>

import SidebarMenu from "@/components/dashboard/SidebarMenu.vue";

const siteName = import.meta.env.VITE_SITE_NAME

const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("refresh_token_expires_in");
  localStorage.removeItem("tokenExpiry");
  localStorage.removeItem("userData");
  this.$router.push("/login");
}

// export default {
//   name: "DashboardLayout",
//   components: {
//     SidebarMenu,
//   },
//   data() {
//     return {
//       siteName: import.meta.env.VITE_SITE_NAME,
//     };
//   },
//   methods: {
//     logout() {
//       localStorage.removeItem("authToken");
//       localStorage.removeItem("refresh_token");
//       localStorage.removeItem("refresh_token_expires_in");
//       localStorage.removeItem("tokenExpiry");
//       localStorage.removeItem("userData");
//       this.$router.push("/login");
//     },
//   },
// };
</script>

<style scoped>
/* Dashboard-specific styles */
</style>
