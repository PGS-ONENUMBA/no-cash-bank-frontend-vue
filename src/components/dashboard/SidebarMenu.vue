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
            <router-link class="nav-link" :class="{ active: isActive('/dashboard/transfer') }" to="/dashboard/transfer">
              <i class="bi bi-arrow-up-right-circle"></i> Transfer
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" :class="{ active: isActive('/dashboard/reports') }" to="/dashboard/reports">
              <i class="bi bi-clock-history"></i> Reports
            </router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" @click="logout">
              <i class="bi bi-box-arrow-right"></i> Sign out
            </a>
          </li>
        </ul>
      </div>
    </nav>
  </template>
  
  <script>
  export default {
    name: "SidebarMenu",
    methods: {
      isActive(route) {
        return this.$route.path === route;
      },
      logout() {
        localStorage.removeItem("authToken"); // Clear authentication token
        this.$router.push("/login"); // Redirect to login page
      },
    },
  };
  </script>
  
  <style scoped>
  .sidebar .nav-link.active {
    font-weight: bold;
    background-color: #e9ecef;
    color: #09b850;
  }
  </style>
  