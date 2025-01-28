<template>
  <div>
    <!-- Header Section -->
    <header class="navbar navbar-light sticky-top bg-white shadow">
      <a class="navbar-brand col-md-3 col-lg-2 px-3" href="#">
        siteName
      </a>
      <div class="navbar-nav">
        <div class="nav-item text-nowrap">
          <a class="nav-link px-3" href="#">
            <i class="bi bi-person-circle"></i>
          </a>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar Section -->
        <SidebarMenu />

        <!-- Main Content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <router-view /> <!-- This renders the child route content -->
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import SidebarMenu from "@/components/dashboard/SidebarMenu.vue";

export default {
  name: "DashboardLayout",
  components: {
    SidebarMenu,
  }
};
</script>

<style scoped>
/* Optional styling for the layout */
</style>
