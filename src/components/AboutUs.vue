<template>
  <div class="container-fluid py-2 section-about">
    <div class="container px-2 py-3">
      <div class="row align-items-center">
        <div class="col-md-4 col-12 text-center text-md-start">
          <img src="@/assets/about.jpg" alt="About {{ siteName }}" class="img-fluid rounded shadow-sm" />
        </div>
        <div class="col-md-8 col-12">
          <h2 class="pb-3 border-bottom d-flex align-items-center">
            <i class="bi bi-info-circle bi-green me-2 d-md-none"></i> About Us
          </h2>
          <p class="fs-7">
            {{ siteName }} is redefining banking across Africa by introducing an
            innovative No-Cash-Bank solution. Our platform is designed to bridge
            the gap between traditional banking and the digital economy,
            ensuring financial inclusion for everyone. <br /><br />
            We are committed to providing secure, efficient, and easy-to-use
            financial services tailored to the unique needs of our customers.
          </p>
          <!-- Read More Button -->
          <router-link to="/about" class="btn btn-green mt-2">
            Read More <i class="bi bi-arrow-right text-white"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutSection",
  setup() {
    const siteName = import.meta.env.VITE_SITE_NAME || "OneNnumba"; // Fallback to "OneNnumba" if env variable is missing
    return { siteName };
  },
};
</script>

<style scoped>
.img-fluid {
  max-width: 100%;
  height: auto;
}

.btn-green {
  background-color: #6609b8;
  color: white;
  border: none;
}

.btn-green:hover {
  background-color: #723ba2;
}
</style>
