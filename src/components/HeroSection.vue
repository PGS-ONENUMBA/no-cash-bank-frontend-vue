<template>
  <div class="container py-4 mt-5">
    <div class="jumbotron-bg mb-4">
      <div class="container-fluid py-5 text-center position-relative">
        <h1 class="display-5 fs-1">Africa's First No-Cash Bank</h1>
        <p class="col-md-8 mx-auto fs-3">Experience Banking Without Cash</p>
        <p>
          At OneNnumba, we envision a world where banking is accessible to everyone, everywhere.<br />
          Our mission is to deliver secure, user-friendly online No-Cash banking that empowers<br />
          individuals to make payments with cash!
        </p>
        <div>
          <router-link to="/get-cash" class="btn btn-green btn-small mb-3">
            <i class="bi bi-cash-stack bi-white"></i> Get Cash
          </router-link>
          <router-link to="/pay4me" class="btn btn-green btn-small mb-3">
            <i class="bi bi-send-fill bi-white"></i> Pay4Me
          </router-link>
          <router-link to="/on-the-house" class="btn btn-green btn-small mb-3">
            <i class="bi bi-gift bi-white"></i> On The House
          </router-link>
          
            <!-- Video Icon -->
            <div class="mt-5 position-relative">
              <a href="#" data-bs-toggle="modal" data-bs-target="#videoModal" class="btn position-absolute top-100 start-50 translate-middle ripple-btn">
                <i class="bi bi-play-circle bi-green-medium"></i>
              </a>
              <span class="ripple"></span>
              <span class="ripple"></span>
              <span class="ripple"></span>
            </div>
            
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
/* Hero section styles here */
</style>
