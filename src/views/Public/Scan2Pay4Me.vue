<template>
  <div class="container py-5">
    <!-- Pay-4-Me Introduction -->
    <div class="text-center mb-4 mt-5">
      <h2 class="fw-bold">
        <i class="bi bi-qr-code-scan me-2"></i> Pay Vendor via QR Code Scan
      </h2>
    </div>
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
