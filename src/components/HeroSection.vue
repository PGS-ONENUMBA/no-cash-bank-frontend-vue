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

        <!-- Preloader -->
        <div v-if="loading" class="text-center">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <div v-else>
          <!-- Dynamically Render Raffle Cycles -->
          <button
            v-for="raffle in displayedRaffles"
            :key="`${raffle.raffle_cycle_id}-${raffle.raffle_type_id}`"
            @click="handleProductClick(raffle)"
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
import { useRouter } from "vue-router";
import apiClient from "@/services/apiService"; // Uses Axios instance

export default {
  name: "HeroSection",
  setup() {
    const router = useRouter();
    const displayedRaffles = ref([]);
    const loading = ref(true); // Preloader state

    /**
     * Fetch all active raffle cycles from the API.
     */
    const fetchRaffles = async () => {
      try {
        const response = await apiClient.post("/nocash-bank/v1/action", {
          action_type: "get_raffle_cycle"
        });

        if (response.data.success) {
          const fetchedRaffles = response.data.raffle_cycles;
          let expandedRaffles = [];

          fetchedRaffles.forEach(raffle => {
            if (Array.isArray(raffle.associated_types)) {
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
        console.error("❌ Error fetching raffle cycles:", error.message);
      } finally {
        loading.value = false; // Hide preloader once data is fetched
      }
    };

    /**
     * Handle product click: Redirect to the correct path based on raffle_type_id
     */
    const handleProductClick = (raffle) => {
      let routePath = "";

      switch (parseInt(raffle.raffle_type_id)) {
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
          alert(`Coming Soon: ${raffle.raffle_type}`);
          return;
      }

      router.push({
        path: routePath,
        query: {
          raffle_cycle_id: raffle.raffle_cycle_id,
          raffle_type_id: raffle.raffle_type_id,
          winnable_amount: raffle.winnable_amount,
        }
      });
    };

    onMounted(fetchRaffles);

    return {
      displayedRaffles,
      handleProductClick,
      loading, // Preloader state
    };
  }
};
</script>

<style scoped>
/* Centering the preloader */
.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>
