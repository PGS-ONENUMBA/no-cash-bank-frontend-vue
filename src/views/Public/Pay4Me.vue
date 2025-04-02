<template>
  <div class="container py-5">
    <!-- Pay-4-Me Introduction -->
    <div class="text-center mb-4 mt-5">
      <h2 class="fw-bold">
        <i class="bi bi-check-circle"></i> {{ productName }}
      </h2>
    </div>

    <!-- Pay-4-Me Form -->
    <Pay4MeForm />
  </div>
</template>

<script>
import Pay4MeForm from "@/components/forms/Pay4MeForm.vue";

export default {
  name: "PublicPay4Me",
  components: {
    Pay4MeForm,
  },
  setup() {
    return {
      productName: import.meta.env.VITE_PRODUCT_TWO || "Transfer Moni", // Uses env variable, fallback to "Transfer Moni"
    };
  },
};
</script>

<style scoped>
/* Improved readability and spacing */
.text-center {
  max-width: 600px;
  margin: auto;
}
.card {
  border-left: 5px solid #09b850;
}
ul.list-unstyled li {
  font-size: 1rem;
  margin-bottom: 8px;
}
</style>
