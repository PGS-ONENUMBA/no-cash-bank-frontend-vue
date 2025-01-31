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
  
  <script>
  import apiService from "@/services/apiService"; // API service for fetching user data
  
  export default {
    name: "Profile",
    data() {
      return {
        user: {
          user_nicename: "",
          user_email: "",
          phone_number: "",
          wallet_balance: "",
        },
        loading: true, // Tracks loading state
      };
    },
    methods: {
      /**
       * Load user data from localStorage.
       * If data is missing, fetch fresh data from API.
       */
      async fetchUserData() {
        this.loading = true;
  
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
            // Use localStorage data if complete
            console.log("Using localStorage data.");
            this.user = storedUserData;
          } else {
            // Fetch fresh user data from API
            console.log("Fetching user data from API...");
            const response = await apiService.get("/user/profile");
  
            // Ensure response structure is correct
            if (response && response.data) {
              this.user = response.data;
              console.log("Fetched User Data:", response.data);
  
              // Update localStorage with new data
              localStorage.setItem("userData", JSON.stringify(response.data));
            } else {
              throw new Error("Invalid API response format.");
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          alert("Failed to load profile data. Please try again.");
        } finally {
          this.loading = false;
        }
      },
  
      /**
       * Handle user logout
       * - Clears localStorage
       * - Redirects to login page
       */
      logout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("tokenExpiry");
        this.$router.push({ name: "Login" });
      },
    },
    mounted() {
      this.fetchUserData(); // Fetch user data on component load
    },
  };
  </script>
  
  <style scoped>
  /* Profile Page Styles */
  .card {
    max-width: 500px;
    margin: auto;
  }
  </style>
  