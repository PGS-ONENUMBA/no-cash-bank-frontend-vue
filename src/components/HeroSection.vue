<template>
  <div class="container py-4 mt-5">
    <div class="jumbotron-bg mb-4">
      <div class="container-fluid py-5 text-center position-relative">
        <h1 class="display-5 fs-1">Africa's First No-Cash Bank</h1>
        <p class="col-md-8 mx-auto fs-3">Experience Banking Without Cash</p>
        <p>
          At {{ siteName }}, we envision a world where banking is accessible to everyone, everywhere.<br />
          Our mission is to deliver secure, user-friendly online No-Cash banking that empowers<br />
          individuals to make payments with cash!
        </p>

        <!-- Display Preloader when fetching -->
        <Preloader v-if="loading" />

        <!-- Dynamically Render Raffle Cycles -->
        <div v-else>
          <button
            v-for="raffle in displayedRaffles"
            :key="`${raffle.raffle_cycle_id}-${raffle.raffle_type_id}`"
            @click="redirectToProductPage(raffle.raffle_cycle_id, raffle.raffle_type_id)"
            class="btn btn-green btn-small mb-3"
          >
            <i class="bi bi-cash-stack bi-white"></i> {{ raffle.raffle_type }}
          </button>
          <!-- Video Icon -->
          <div class="mt-5 position-relative">
              <a href="#" data-bs-toggle="modal" data-bs-target="#videoModal" class="btn position-absolute top-100 start-50 translate-middle ripple-btn">
                <i class="bi bi-play-circle bi-green-medium"></i>
              </a>
              <span class="ripple"></span>
              <span class="ripple"></span>
              <span class="ripple"></span>
            </div>
            <!-- Video Modal -->
            <div class="modal fade" id="videoModal" tabindex="-1" aria-labelledby="videoModalLabel" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                  <div class="modal-header border-0">
                    <h5 class="modal-title" id="videoModalLabel">
                      <i class="bi bi-play-circle me-2"></i> Testimonial Video
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <div class="ratio ratio-16x9">
                      <iframe id="videoIframe" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Testimonial Video" allowfullscreen></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router"; // Import Vue Router
import Preloader from "@/components/common/Preloader.vue"; 
import apiClient from "@/services/apiService"; 

export default {
  name: "HeroSection",
  components: { Preloader },
  setup() {
    const displayedRaffles = ref([]); // Stores the raffle products to be displayed
    const loading = ref(false); // Controls preloader visibility
    const router = useRouter(); // Initialize Vue Router
    const siteName = import.meta.env.VITE_SITE_NAME || "OneNnumba"; // Fallback to "OneNnumba" if env variable is missing
  

    /**
     * Fetches all active raffle cycles from the API.
     * Each raffle cycle contains multiple associated types, which are expanded into separate products.
     */
    const fetchRaffles = async () => {
      loading.value = true; // Show preloader
      try {
        const response = await apiClient.post("/nocash-bank/v1/action", {
          action_type: "get_raffle_cycle"
        });

        if (response.data.success) {
          const fetchedRaffles = response.data.raffle_cycles; // Handle multiple active cycles
          let expandedRaffles = [];

          fetchedRaffles.forEach(raffle => {
            if (Array.isArray(raffle.associated_types)) {
              // Expand the associated types into multiple products
              raffle.associated_types.forEach(type => {
                expandedRaffles.push({
                  raffle_cycle_id: raffle.raffle_cycle_id,
                  raffle_type_id: type.raffle_type_id,
                  raffle_type: type.raffle_type, 
                  winnable_amount: raffle.winnable_amount
                });
              });
            }
          });

          displayedRaffles.value = expandedRaffles;
        }
      } catch (error) {
        console.error("Error fetching raffle cycles:", error.message);
      } finally {
        loading.value = false; // Hide preloader
      }
    };

    /**
     * Redirects users to the appropriate product page with relevant query parameters.
     * @param {string} raffleCycleId - The ID of the raffle cycle.
     * @param {string} raffleTypeId - The ID of the associated raffle type.
     */
    const redirectToProductPage = (raffleCycleId, raffleTypeId) => {
      let routePath = "";

      switch (parseInt(raffleTypeId)) {
        case 1:
          routePath = "/get-cash";
          break;
        case 2:
          routePath = "/pay4me";
          break;
        case 3:
          routePath = "/on-the-house";
          break;
        default:
          console.warn("Invalid raffle type. No navigation.");
          return;
      }

      // Navigate to the corresponding product page with query parameters
      router.push({
        path: routePath,
        query: {
          raffle_cycle_id: raffleCycleId,
          raffle_type_id: raffleTypeId,
        }
      });
    };

    // Fetch raffles on component mount
    onMounted(fetchRaffles);

    return {
      displayedRaffles,
      redirectToProductPage, // Use this for navigation
      loading,
      siteName
    };
  }
};
</script>

<style scoped>
/* Add styles for better layout */
</style>
