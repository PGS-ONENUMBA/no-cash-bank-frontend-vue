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
          <!-- Dynamically Render Raffle Cycles -->
          <button
            v-for="raffle in displayedRaffles"
            :key="`${raffle.raffle_cycle_id}-${raffle.raffle_type_id}`"
            @click="fetchRaffleDetails(raffle.raffle_cycle_id, raffle.raffle_type_id)"
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
import apiClient from "@/services/apiService"; // Uses Axios instance

export default {
  name: "HeroSection",
  setup() {
    const displayedRaffles = ref([]);

    /**
     * Fetch all active raffle cycles from the API.
     */
    const fetchRaffles = async () => {
      try {
        const response = await apiClient.post("/nocash-bank/v1/action", {
          action_type: "get_raffle_cycle"
        });

        if (response.data.success) {
          const fetchedRaffles = response.data.raffle_cycles; // Now handling multiple active cycles
          let expandedRaffles = [];

          fetchedRaffles.forEach(raffle => {
            if (Array.isArray(raffle.associated_types)) {
              // Expand the associated types into multiple products
              raffle.associated_types.forEach(type => {
                expandedRaffles.push({
                  raffle_cycle_id: raffle.raffle_cycle_id,
                  raffle_type_id: type.raffle_type_id,
                  raffle_type: type.raffle_type, // Readable name from API
                  winnable_amount: raffle.winnable_amount
                });
              });
            }
          });

          displayedRaffles.value = expandedRaffles;
          console.log("🚀 Updated Raffle List:", displayedRaffles.value);
        }
      } catch (error) {
        console.error("❌ Error fetching raffle cycles:", error.message);
      }
    };

    /**
     * Fetch full raffle cycle details when a button is clicked.
     */
     const fetchRaffleDetails = async (raffleId, raffleTypeId) => {
  try {
    const response = await apiClient.post("/nocash-bank/v1/action", {
      action_type: "get_raffle_cycle_by_id",
      raffle_cycle_id: raffleId
    });

    if (response.data.success) {
      const raffleCycle = response.data.raffle_cycle;

      // Find only the selected raffle type
      const selectedType = raffleCycle.associated_types.find(type => type.raffle_type_id === raffleTypeId);

      if (selectedType) {
        const filteredResponse = {
          raffle_cycle_id: raffleCycle.raffle_cycle_id,
          winnable_amount: raffleCycle.winnable_amount,
          status: raffleCycle.status,
          created_date: raffleCycle.created_date,
          updated_date: raffleCycle.updated_date,
          raffle_type_id: selectedType.raffle_type_id,
          raffle_type: selectedType.raffle_type
        };

        alert(`Raffle Details: ${JSON.stringify(filteredResponse, null, 2)}`);
      } else {
        alert("Raffle type not found in this cycle.");
      }
    } else {
      console.error("❌ Error: Invalid response from API", response.data);
    }
  } catch (error) {
    console.error("❌ Error fetching raffle details:", error.message);
  }
};



    // Fetch raffles on component mount
    onMounted(fetchRaffles);

    return {
      displayedRaffles,
      fetchRaffleDetails
    };
  }
};
</script>

<style scoped>
/* Hero section styles here */
</style>
