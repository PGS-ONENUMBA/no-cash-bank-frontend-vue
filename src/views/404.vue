<template>
    <div class="container text-center vh-100 d-flex flex-column justify-content-center align-items-center">
      <div class="text-center">
        <h1 class="display-1 text-orange fw-bold">404</h1>
        <h2 class="text-muted">Oops! Page Not Found</h2>
        <p class="text-muted fs-5">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <router-link to="/" class="btn btn-green btn-lg mt-3">
          <i class="bi bi-house-door me-2 bi-white"></i> Back to Home
        </router-link>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "NotFound",
  };
  </script>
  
  <style scoped>
  /* Styles for the 404 page */
  .text-orange {
    color: #ff6f00;
  }
  
  .btn-green {
    background-color: #09b850;
    color: white;
    border: none;
    padding: 0.8rem 2rem;
    font-size: 1rem;
    border-radius: 0.5rem;
  }
  
  .btn-green:hover {
    background-color: #07a047;
  }
  </style>
  