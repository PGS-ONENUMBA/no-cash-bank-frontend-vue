<template>
    <div>
      <!-- Public Header -->
      <Navbar />
      
      <!-- Main Content -->
      <main>
        <router-view></router-view>
      </main>
  
      <!-- Public Footer -->
      <Footer />
    </div>
  </template>
  
  <script>
  import Navbar from "@/components/Navbar.vue";
  import Footer from "@/components/Footer.vue";
  
  export default {
    name: "PublicLayout",
    components: {
      Navbar,
      Footer,
    },
  };
  </script>
  
  <style scoped>
  /* Add any styles specific to the public layout */
  </style>
  