<template>
  <nav class="navbar navbar-expand-md navbar-white fixed-top bg-white">
    <div class="container">
      <!-- Logo -->
      <router-link class="navbar-brand" to="/">
        <img src="@/assets/logo.jpeg" alt="Logo" height="30" />
      </router-link>

      <!-- Toggler for Mobile -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar Items -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Centered Navigation -->
        <ul class="navbar-nav justify-content-center w-100">
          <li class="nav-item mx-2">
            <router-link class="nav-link" to="/">
              <i class="bi-green bi bi-house-door"></i> Home
            </router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link" to="/about">
              <i class="bi-green bi bi-info-circle"></i> About
            </router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link" to="/team">
              <i class="bi-green bi bi-cash-stack"></i> Our Team
            </router-link>
          </li>
          <li class="nav-item mx-2">
            <router-link class="nav-link" to="/how-it-works">
              <i class="bi-green bi bi-question-circle"></i> How it Works
            </router-link>
          </li>
        </ul>
        <!-- Login Button -->
        <router-link class="btn btn-green btn-small" to="/login">
          <i class="bi-white bi bi-lock"></i> Login
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {};
</script>

<style scoped>
/* Add your navbar-specific styles here if needed */
</style>
