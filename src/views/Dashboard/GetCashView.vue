<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="fs-3">
        <i class="bi bi-currency-exchange"></i> Get Cash - Dashboard
      </h1>
    </div>
    <!-- Pass the `isLoggedIn` prop to specify that the user is authenticated -->
    <GetCashForm :isLoggedIn="true" />
  </div>
</template>

<script>
import GetCashForm from "@/components/forms/GetCashForm.vue";

export default {
  name: "DashboardGetCash",
  components: {
    GetCashForm, // Import the reusable component
  },
};
</script>
