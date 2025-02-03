<template>
  <div class="container py-5">
    <!-- Pay-4-Me Introduction -->
    <div class="text-center mb-4 mt-5">
      <h2 class="fw-bold">
        <i class="bi bi-check-circle"></i> Get Cash
      </h2>
    </div>
    <!-- Include the reusable form component -->
    <GetCashForm />
  </div>
</template>

<script setup>
import GetCashForm from "@/components/forms/GetCashForm.vue";
</script>
