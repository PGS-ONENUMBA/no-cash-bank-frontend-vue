<template>
    <div>
      <!-- Header Section -->
      <header class="navbar navbar-light sticky-top bg-white shadow">
        <a class="navbar-brand col-md-3 col-lg-2 px-3" href="#">
          OneNUMBA
        </a>
        <div class="navbar-nav">
          <div class="nav-item text-nowrap">
            <a class="nav-link px-3" href="#">
              <i class="bi bi-person-circle"></i>
            </a>
          </div>
        </div>
      </header>
  
      <!-- Main Container -->
      <div class="container-fluid">
        <div class="row">
          <!-- Sidebar Section -->
          <SidebarMenu />
  
          <!-- Main Content -->
          <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <!-- Page Header -->
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 class="fs-3">
                <i class="bi bi-house-door"></i> Dashboard
              </h1>
            </div>
  
            <!-- Wallet Balance -->
            <div class="mb-4">
              <div class="card text-center shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="bi bi-wallet2"></i> Wallet Balance
                  </h5>
                  <p class="card-text fs-3 text-success">₦10,000</p>
                </div>
              </div>
            </div>
  
            <!-- Other Cards Section -->
            <div class="row row-cols-1 row-cols-md-2 g-4">
              <FeatureCard
                title="Transfer Funds"
                icon="bi bi-cash-stack"
                description="Easily send money to others."
                link="/dashboard/transfer"
              />
              <FeatureCard
                title="Get Cash"
                icon="bi bi-currency-exchange"
                description="Withdraw money securely."
                link="/dashboard/get-cash"
              />
              <FeatureCard
                title="Pay-4-Me"
                icon="bi bi-check-circle"
                description="Let us pay on your behalf."
                link="/dashboard/pay4me"
              />
              <FeatureCard
                title="Reports"
                icon="bi bi-clock-history"
                description="View transaction history."
                link="/dashboard/reports"
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  // Import reusable components
  import SidebarMenu from "@/components/dashboard/SidebarMenu.vue";
  import FeatureCard from "@/components/dashboard/FeatureCard.vue";
  
  export default {
    name: "Dashboard",
    components: {
      SidebarMenu,
      FeatureCard,
    },
  };
  </script>
  
  <style scoped>
  .card {
    height: 100%;
  }
  
  .text-success {
    color: #09b850 !important;
  }
  </style>
  