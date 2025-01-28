<template>
  <div class="container py-5">
    <h1 class="fs-3">
      <i class="bi bi-check-circle"></i> Pay-4-Me (Dashboard)
    </h1>
    <Pay4MeForm />
  </div>
</template>

<script>
import Pay4MeForm from '@/components/forms/Pay4MeForm.vue';

export default {
  name: 'DashboardPay4Me',
  components: {
    Pay4MeForm,
  },
};
</script>

<style scoped>
/* Add your custom styles for dashboard view */
</style>
