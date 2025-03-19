<template>
  <div class="container py-5">
    <!-- Include the reusable form component -->
    <Scan2Pay4MeForm />
  </div>
</template>

<script>
import Scan2Pay4MeForm from "@/components/forms/Scan2Pay4MeForm.vue";

export default {
  name: "PublicScan2Pay4Me",
  components: {
    Scan2Pay4MeForm, // Import the reusable component
  },
};
</script>
