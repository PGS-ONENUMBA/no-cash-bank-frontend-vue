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
                  <p class="text-muted">{{ user.user_nicename || 'N/A' }}</p>
                </div>
  
                <div class="mb-3">
                  <strong>Email:</strong>
                  <p class="text-muted">{{ user.user_email || 'N/A' }}</p>
                </div>
  
                <div class="mb-3">
                  <strong>Phone Number:</strong>
                  <p class="text-muted">{{ user.phone_number || 'N/A' }}</p>
                </div>
  
                <div class="mb-3">
                  <strong>Wallet Balance:</strong>
                  <p class="text-success fs-4">₦{{ user.wallet_balance || '0.00' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  </template>
  
  <script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import apiService from "@/services/apiService"; // Adjust the import as needed

const user = ref({
  user_nicename: "",
  user_email: "",
  phone_number: "",
  wallet_balance: "",
});
const loading = ref(true);
const router = useRouter();

/**
 * Load user data from localStorage.
 * If data is missing, fetch fresh data from API.
 */
const fetchUserData = async () => {
  loading.value = true;
  try {
    // Retrieve user data from localStorage
    const storedUserData = JSON.parse(localStorage.getItem("userData")) || {};
    console.log("Stored User Data:", storedUserData);

    // Check if required data is missing
    const isDataIncomplete =
      !storedUserData.user_nicename ||
      !storedUserData.user_email ||
      !storedUserData.phone_number ||
      !storedUserData.wallet_balance;

    if (!isDataIncomplete) {
      console.log("Using localStorage data.");
      user.value = storedUserData;
    } else {
      console.log("Fetching user data from API...");
      const response = await apiService.get("/user/profile");

      if (response && response.data) {
        user.value = response.data;
        console.log("Fetched User Data:", response.data);
        localStorage.setItem("userData", JSON.stringify(response.data));
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
 * Handle user logout
 * - Clears localStorage
 * - Redirects to login page
 */
const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("tokenExpiry");
  router.push({ name: "Login" });
};

onMounted(fetchUserData);
</script>

  
  <style scoped>
  /* Profile Page Styles */
  .card {
    max-width: 500px;
    margin: auto;
  }
  </style>
  