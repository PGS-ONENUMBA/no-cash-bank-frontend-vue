<template>
  <div>
    <h1>Get Cash - Dashboard</h1>
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
