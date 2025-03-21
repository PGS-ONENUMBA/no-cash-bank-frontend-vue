<template>
  <div class="mt-6 section-about">
    <div class="container px-2 py-3">
      <div class="about-wrapper">
        <div v-if="!isMobile" class="feature-image-wrapper">
          <img src="@/assets/about.jpg" alt="About {{ siteName }}" class="img-fluid rounded shadow-sm feature-image" />
        </div>
        <div class="about-content card">
          <!-- Icon on top for mobile -->
          <div class="text-center d-md-none mb-1">
            <i class="bi bi-info-circle bi-green about-icon"></i>
          </div>
          <div class="card-body">
            <h2 class="pb-3 border-bottom d-flex align-items-center justify-content-center justify-content-md-start">
              <!-- Icon beside title on desktop -->
              <i class="bi bi-info-circle bi-green me-2 d-none d-md-inline"></i> About Us
            </h2>
            <p class="fs-6">
              {{ siteName }} is redefining banking across Africa by introducing an
              innovative No-Cash-Bank solution. Our platform is designed to bridge
              the gap between traditional banking and the digital economy,
              ensuring financial inclusion for everyone.<span v-if="!isMobile"><br /><br /></span> <span v-if="isMobile">.....</span>
              <span v-if="!isMobile">
                We are committed to providing secure, efficient, and easy-to-use
                financial services tailored to the unique needs of our customers.
              </span>
            </p>
            <router-link to="/about" class="btn btn-green mt-2">
              Read More <i class="bi bi-arrow-right text-white"></i>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, onUnmounted } from 'vue';

export default {
  name: "AboutSection",
  setup() {
    const siteName = import.meta.env.VITE_SITE_NAME || "OneNnumba";

    // Reactive state for mobile detection
    const isMobile = ref(false);

    // Function to check if the screen is mobile-sized
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768; // Bootstrap's md breakpoint
    };

    // Run on mount and on window resize
    onMounted(() => {
      checkMobile();
      window.addEventListener("resize", checkMobile);
    });

    // Clean up event listener on unmount
    onUnmounted(() => {
      window.removeEventListener("resize", checkMobile);
    });

    return { siteName, isMobile };
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

.bi-green {
  color: #6609b8; /* Match your brand color */
}

.about-icon {
  font-size: 2.5rem; /* Larger icon for mobile */
}

.section-about {
  margin-top:1em;
}

.about-wrapper {
  overflow: hidden; /* Clear floats */
}

/* Mobile-first styling */
.feature-image-wrapper {
  float: left;
  width: 100px; /* Fixed width for the image */
  margin-right: 15px; /* Space between image and text */
}

.feature-image {
  width: 100%; /* Ensure image fits the wrapper */
}

.about-content {
  background-color: #fff;
  border-radius: 10px;
  padding: 0px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Desktop styling */
@media (min-width: 768px) {
  .about-wrapper {
    display: flex; /* Use flexbox for side-by-side layout */
    align-items: center;
  }

  .feature-image-wrapper {
    float: none; /* Reset float for desktop */
    width: 33.33%; /* Roughly col-md-4 equivalent */
    margin-right: 20px;
  }

  .about-content {
    width: 66.67%; /* Roughly col-md-8 equivalent */
    padding-left: 20px; /* Space from image */
  }
}
</style>
