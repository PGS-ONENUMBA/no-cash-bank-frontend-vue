<template>
  
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="fs-3">
        <i class="bi bi-check-circle"></i> Pay-4-Me (Dashboard)
      </h1>
    </div>
    <Pay4MeForm :isLoggedIn="true" />
  </div>
</template>

<script setup>
import Pay4MeForm from '@/components/forms/Pay4MeForm.vue';


</script>

<style scoped>
/* Add your custom styles for dashboard view */
</style>
