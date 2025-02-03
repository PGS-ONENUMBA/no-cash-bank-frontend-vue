<template>
  <main class="container py-5 mt-2"><div class="text-center mb-4 mt-3">
      <h2 class="fw-bold">
        <i class="bi bi-check-circle"></i> On The House
      </h2>
  
    </div>
    <OnTheHouseForm />
  </main>
</template>

<script>
import OnTheHouseForm from "@/components/forms/OnTheHouseForm.vue";

export default {
  name: "PublicOnTheHouse",
  components: {
    OnTheHouseForm,
  },
};
</script>
