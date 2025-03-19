<template>

  <div class="container py-5">
    <!-- Pay-4-Me Introduction -->
    <div class="text-center mb-4 mt-5">
      <h2 class="fw-bold">
        <i class="bi bi-check-circle"></i> {{ productName }}
      </h2>
    </div>

    <!-- Pay-4-Me Form, -->
    <OnTheHouseForm />
  </div>
</template>

<script>
import OnTheHouseForm from "@/components/forms/OnTheHouseForm.vue";

export default {
  name: "PublicOnTheHouse",
  components: {
    OnTheHouseForm,
  },
  setup() {
    return {
      productName: import.meta.env.VITE_PRODUCT_THREE || "One The House", // Uses env variable, fallback to "Pay4Me"
    };
  },
};
</script>
