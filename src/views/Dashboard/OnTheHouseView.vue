<template>
  
  
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="fs-3">
        <i class="bi bi-check-circle"></i> Pay-4-Me (Dashboard)
      </h1>
    </div>
    <OnTheHouseForm :isLoggedIn="true" />
  </div>
  </template>
  
  <script setup>
  import OnTheHouseForm from "@/components/forms/OnTheHouseForm.vue";
  </script>
  