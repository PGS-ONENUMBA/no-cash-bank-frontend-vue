<template>
  <div>
    <!-- About Page Content -->
    <main class="container py-5 mt-5">
      <!-- Page Header -->
      <h1 class="text-center mb-5">
        <i class="bi bi-info-circle me-2"></i> About {{ companyName }}
      </h1>
      <p class="text-muted fs-5 text-center mb-5">
        Learn more about our mission, vision, and the values that drive us forward.
      </p>

      <!-- Show Preloader while fetching data -->
      <Preloader v-if="loading" />

      <!-- Main Content -->
      <div v-else>
        <!-- Mission and Vision Section -->
        <div class="row row-cols-1 row-cols-md-2 g-4 mb-5">
          <!-- Mission Card -->
          <div class="col">
            <div class="card h-100">
              <div class="card-header bg-light text-center">
                <h3 class="card-title mb-0">Our Mission</h3>
              </div>
              <img :src="missionImage" class="card-img-top rounded-top" alt="Our Mission" />
              <div class="card-body d-flex flex-column">
                <p class="card-text flex-grow-1">
                  At {{ companyName }}, our mission is to redefine banking by introducing a 
                  revolutionary no-cash platform that fosters financial inclusivity for everyone.
                </p>
              </div>
            </div>
          </div>

          <!-- Vision Card -->
          <div class="col">
            <div class="card h-100">
              <div class="card-header bg-light text-center">
                <h3 class="card-title mb-0">Our Vision</h3>
              </div>
              <img :src="visionImage" class="card-img-top rounded-top" alt="Our Vision" />
              <div class="card-body d-flex flex-column">
                <p class="card-text flex-grow-1">
                  We envision a world where banking goes beyond cash, providing equal 
                  opportunities for individuals and businesses to thrive in the digital economy.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Core Values Section -->
        <section>
          <h2 class="text-center mb-4">Our Core Values</h2>
          <div class="row g-4">
            <div class="col-md-4" v-for="(value, index) in coreValues" :key="index">
              <div class="card h-100">
                <div class="card-header bg-light text-center">
                  <i :class="value.iconClass" class="icon-large"></i>
                  <h4 class="card-title mb-0">{{ value.title }}</h4>
                </div>
                <div class="card-body text-center">
                  <p class="mt-3">{{ value.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import Preloader from "@/components/common/Preloader.vue"; // Import Preloader

export default {
  name: "About",
  components: { Preloader },
  setup() {
    const loading = ref(true);
    const companyName = ref(import.meta.env.VITE_SITE_NAME || "PayByChance");
    const missionText = ref("");
    const visionText = ref("");
    const missionImage = ref("");
    const visionImage = ref("");
    const coreValues = ref([]);

    /**
     * Fetch About page content from an API or local source
     */
    const fetchAboutContent = async () => {
      loading.value = true;
      try {
        missionText.value = `At ${companyName.value}, our mission is to redefine banking by introducing a revolutionary no-cash platform.`;
        visionText.value = `We envision a world where banking goes beyond cash, providing equal opportunities for individuals and businesses.`;
        missionImage.value = new URL("@/assets/mission.jpg", import.meta.url).href;
        visionImage.value = new URL("@/assets/vision.jpg", import.meta.url).href;

        coreValues.value = [
          {
            title: "Security",
            description: "We prioritize the safety and privacy of our users' financial information with state-of-the-art encryption.",
            iconClass: "bi bi-shield-lock-fill text-green",
          },
          {
            title: "Innovation",
            description: "We constantly develop cutting-edge solutions to simplify banking and empower users worldwide.",
            iconClass: "bi bi-lightning-fill text-orange",
          },
          {
            title: "Inclusivity",
            description: "Our platform is designed to cater to the needs of everyone, fostering financial inclusion for all.",
            iconClass: "bi bi-people-fill text-green",
          },
        ];
      } catch (error) {
        console.error("❌ Error fetching about content:", error.message);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchAboutContent);

    return {
      loading,
      companyName,
      missionText,
      visionText,
      missionImage,
      visionImage,
      coreValues,
    };
  },
};
</script>

<style scoped>
/* General Styles */
body {
  font-family: "Public Sans", sans-serif;
}

/* Card Styles */
.card {
  border-radius: 1rem; /* Rounded corners for a polished look */
}

.card-title {
  font-weight: 400; /* Medium font weight for titles */
}

.card-text {
  font-size: 0.95rem; /* Smaller font size for better readability */
  line-height: 1.6; /* Increased line height for readability */
}

/* Page Header Styling */
h1,
h2 {
  font-weight: 400; /* Medium font weight for headers */
}

/* Icon Styling */
.icon-large {
  font-size: 3rem; /* Large icons for emphasis */
}

.text-green {
  color: #723ba2; /* Green color for icons and accents */
}

.text-orange {
  color: #ff6f00; /* Orange color for icons and accents */
}
</style>
