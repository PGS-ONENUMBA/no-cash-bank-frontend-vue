<template>
  <div class="container-fluid py-5">
    <div class="row justify-content-center">
      <div class="col-md-12 mx-auto">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h2 class="card-title text-left pb-3">
              <i class="bi bi-person-circle"></i> Profile
            </h2>

            <div v-if="loading" class="text-center">
              <i class="spinner-border text-primary"></i> Loading...
            </div>

            <div v-else>

              <!-- Render vendor or customer-->
              <div v-if="user?.user_role === 'vendor'">
              
                <div class="mb-3">
                  <strong>Name:</strong>
                  <p class="text-muted">{{ user?.vendor_details.business_name || "N/A" }}</p>
                </div>
  
                <div class="mb-3">
                  <strong>Address:</strong>
                  <p class="text-muted">{{ user?.vendor_details.business_address || "N/A" }}</p>
                </div>
  
                <div class="mb-3">
                  <strong>Phone Number:</strong>
                  <p class="text-muted">{{ user?.phone_number || "N/A" }}</p>
                </div>

                <div class="mb-3">
                  <strong>CAC Number:</strong>
                  <p class="text-muted">{{ user?.vendor_details.cac_number || "N/A" }}</p>
                </div>

                <div class="mb-3">
                  <WalletBalance title="Available Balance" />
                </div>

              </div>

              <div v-if="user?.user_role === 'customer'">
                <!-- ✅ Show error only if data is truly missing -->
                <div v-if="errorMessage" class="alert alert-danger text-center">
                  {{ errorMessage }}
                </div>
  
                <div class="mb-3">
                  <strong>Username:</strong>
                  <p class="text-muted">{{ user?.nicename || "N/A" }}</p>
                </div>
  
                <div class="mb-3">
                  <strong>Email:</strong>
                  <p class="text-muted">{{ user?.email || "N/A" }}</p>
                </div>
  
                <div class="mb-3">
                  <strong>Phone Number:</strong>
                  <p class="text-muted">{{ user?.phone_number || "N/A" }}</p>
                </div>
  
                <div class="mb-3">
                  <WalletBalance title="Available Balance" />
                </div>
              </div>

            </div>

           
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Footer Menu -->
    <DashboardFooter />
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/authStore";
import { computed, ref, onMounted } from "vue";
import apiService from "@/services/apiService";
import DashboardFooter from "@/components/dashboard/DashboardFooter.vue";
import WalletBalance from "@/components/common/WalletBalance.vue";

export default {
  name: "Profile",
  components: {
    WalletBalance,
    DashboardFooter,
  },
  setup() {
    const authStore = useAuthStore();
    const loading = ref(true);
    const errorMessage = ref(null);

    const user = computed(() => authStore.user);

    /**
     * Fetches user data and ensures the error is only shown when data is truly missing.
     */
    const fetchUserData = async () => {
      loading.value = true;
      errorMessage.value = null; // Reset error before fetching

      try {
        if (!authStore.user || !authStore.user.nicename) {
          console.log("Fetching user data from API...");
          const response = await apiService.get("/user/profile");

          console.log("✅ User data fetched:", response.data);

          if (response?.data) {
            authStore.setUser(response.data);
          } else {
            throw new Error("Invalid API response format.");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        // ✅ Only show error if user data is missing
        if (!authStore.user) {
          errorMessage.value = "Failed to load profile data. Please try again.";
        }
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchUserData);

    return {
      user,
      loading,
      errorMessage,
    };
  },
};
</script>

<style scoped>
/* Hide sidebar on mobile */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
