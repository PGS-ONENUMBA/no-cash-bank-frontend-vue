<template>
    <header>
      <nav class="navbar navbar-expand-md navbar-white fixed-top bg-white">
        <div class="container">
          <a class="navbar-brand" href="#">
            <img src="@/assets/onenumba-logo.jpeg" alt="Logo" height="30" />
          </a>
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
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav justify-content-center w-100">
              <li class="nav-item mx-2">
                <a class="nav-link" href="index.html"><i class="bi-green bi bi-house-door"></i> Home</a>
              </li>
              <li class="nav-item mx-2">
                <a class="nav-link" href="#"><i class="bi-green bi bi-info-circle"></i> About</a>
              </li>
              <li class="nav-item mx-2">
                <a class="nav-link" href="team.html"><i class="bi-green bi bi-cash-stack"></i> Our Team</a>
              </li>
              <li class="nav-item mx-2">
                <a class="nav-link" href="#"><i class="bi-green bi bi-question-circle"></i> How it Works</a>
              </li>
            </ul>
            <a class="btn btn-green btn-small" href="#">
              <i class="bi bi-lock bi-white"></i> Login
            </a>
          </div>
        </div>
      </nav>
    </header>
  </template>
  
  <script>
  export default {};
  </script>
  
  <style scoped>
  /* Navbar styles */
  </style>
  