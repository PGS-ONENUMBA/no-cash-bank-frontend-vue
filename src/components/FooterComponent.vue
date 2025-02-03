<template>
  <footer class="bg-dark text-white py-4">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <p class="mb-0">&copy; 2025 Your Company. All rights reserved.</p>
        </div>
        <div class="col-md-6 text-md-end">
          <!-- Vue Router links -->
          <router-link to="/privacy" class="footer-link me-3">Privacy</router-link>
          <router-link to="/terms" class="footer-link me-3">Terms</router-link>
          <router-link to="/how-it-works" class="footer-link me-3">How it Works</router-link>
          <router-link to="/#faq" class="footer-link me-3">FAQ</router-link>
          
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-link {
  color: #f8f9fa;
  text-decoration: none;
  font-size: 0.9rem;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>
