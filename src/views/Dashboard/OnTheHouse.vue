<template>
    <main class="container py-5 mt-5">
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
  