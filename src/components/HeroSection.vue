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

        <!-- PWA Install Button -->
        <div class="d-flex align-items-center justify-content-center">
          <button v-if="showInstallButton && isMobileOrTablet === true" @click="installPwa" type="button" class="btn btn-primary d-flex align-items-center gap-2">
            <i class="bi bi-download text-white"></i>
            <span>Install App</span>
          </button>
        </div>

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

    const showInstallButton = ref(false); 
    const isMobileOrTablet = window.matchMedia("(max-width: 1024px)").matches;

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

       /**
    * Register the PWA beforeInstallPrompt event
    **/
    const registerbeforeInstallPrompt = () => {
      window.addEventListener('beforeinstallprompt', (event) => {
          // Prevent the mini-infobar from appearing on mobile.
          event.preventDefault();
          console.log('👍', 'beforeinstallprompt', event);
          // Stash the event so it can be triggered later.
          window.deferredPrompt = event;
          // Remove the 'hidden' class from the install button container.
          showInstallButton.value = true
      });
    }

     /**
    * Install PWA button 
    **/
    const installPwa = async () => {
      console.log("Pwa installed")
      const promptEvent = window.deferredPrompt;
      if (!promptEvent) {
        // The deferred prompt isn't available.
        return;
      }
       // Show the install prompt.
       promptEvent.prompt();
      // Log the result
      const result = await promptEvent.userChoice;
      console.log('👍', 'userChoice', result);
      // Reset the deferred prompt variable, since
      // prompt() can only be called once.
      window.deferredPrompt = null;
      showInstallButton.value = false
    };

     /**
     * Check if PWA is installed already, and clear the deferedPrompt event stored earlier
     **/
     const checkPwaInstalled = () => {
      window.addEventListener('appinstalled', (event) => {
      console.log('👍', 'appinstalled', event);
      // Clear the deferredPrompt so it can be garbage collected
        window.deferredPrompt = null;
      });
    }

    // Fetch raffles on component mount
    onMounted(fetchRaffles);

    onMounted(registerbeforeInstallPrompt);

    return {
      displayedRaffles,
      redirectToProductPage, // Use this for navigation
      loading,
      installPwa,
      showInstallButton, // PWA Custom Install Button
      checkPwaInstalled, // This will check if PWA is installed. It fires the "appInstalled" event
      isMobileOrTablet, // 
    };
  }
};
</script>

<style scoped>
/* Add styles for better layout */
</style>
