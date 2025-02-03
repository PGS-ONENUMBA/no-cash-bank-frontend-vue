<template>
  <div>
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow-sm">
            <div class="card-body">
              <h2 class="card-title text-center pb-3">
                <i class="bi bi-person-circle"></i> Profile
              </h2>

              <div v-if="loading" class="text-center">
                <i class="spinner-border text-primary"></i> Loading...
              </div>

              <div v-else>
                <div class="mb-3">
                  <strong>Username:</strong>
                  <p class="text-muted">{{ user?.user_nicename || "N/A" }}</p>
                </div>

                <div class="mb-3">
                  <strong>Email:</strong>
                  <p class="text-muted">{{ user?.user_email || "N/A" }}</p>
                </div>

                <div class="mb-3">
                  <strong>Phone Number:</strong>
                  <p class="text-muted">{{ user?.phone_number || "N/A" }}</p>
                </div>

                <div class="mb-3">
                   <!-- ✅ Reusable Wallet Balance Component -->
                  <WalletBalance />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Footer Menu (Only on Mobile) -->
    <DashboardFooter />
  </div>
</template>

<script>
import { useAuthStore } from "@/store/authStore";
import { computed, ref, onMounted } from "vue";
import apiService from "@/services/apiService";
import DashboardFooter from "@/components/dashboard/DashboardFooter.vue";
import WalletBalance from "@/components/common/WalletBalance.vue";

export default {
  name: "Profile",
  components: {
    WalletBalance, // ✅ Use WalletBalance here
    DashboardFooter,
  },
  setup() {
    const authStore = useAuthStore();
    const loading = ref(true);

    // Computed property for reactive user data
    const user = computed(() => authStore.user);

    /**
     * Fetches user data.
     * - Uses Pinia state if available.
     * - Calls API if data is missing.
     */
    const fetchUserData = async () => {
      loading.value = true;

      try {
        // Check if user data is already in Pinia
        if (!authStore.user || !authStore.user.user_nicename) {
          console.log("Fetching user data from API...");
          const response = await apiService.get("/user/profile");

          if (response?.data) {
            authStore.setUser(response.data); // Update Pinia store
          } else {
            throw new Error("Invalid API response format.");
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load profile data. Please try again.");
      } finally {
        loading.value = false;
      }
    };

    /**
     * Handles logout
     * - Clears authentication state via Pinia
     * - Redirects to login page
     */
    const logout = () => {
      authStore.logout();
    };

    // Fetch user data on component mount
    onMounted(fetchUserData);

    return {
      user,
      loading,
      logout,
    };
  },
};
</script>

<style scoped>
/* Profile Page Styles */
.card {
  max-width: 500px;
  margin: auto;
}

/* Hide sidebar on mobile */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
