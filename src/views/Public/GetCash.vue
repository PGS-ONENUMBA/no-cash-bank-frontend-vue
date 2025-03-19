<template>
  <div class="container py-5">
    <!-- Pay-4-Me Introduction -->
    <div class="text-center mb-4 mt-5">
      <h2 class="fw-bold">
        <i class="bi bi-check-circle"></i> {{ productName }}
      </h2>
    </div>
    <!-- Include the reusable form component -->
    <GetCashForm />
  </div>
</template>

<script>
import GetCashForm from "@/components/forms/GetCashForm.vue";

export default {
  name: "PublicGetCash",
  components: {
    GetCashForm, // Import the reusable component
  },
  setup() {
    return {
      productName: import.meta.env.VITE_PRODUCT_ONE, // Uses env variable, fallback to "Pay4Me"
    };
  },
};
</script>
