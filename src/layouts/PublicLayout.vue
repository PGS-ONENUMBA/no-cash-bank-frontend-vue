<template>
    <div>
      <!-- Public Header -->
      <NavBar />
      
      <!-- Main Content -->
      <main mt-5>
        <router-view></router-view>
      </main>
  
      <!-- Public Footer -->
      <FooterComponent />
    </div>
  </template>
  
  <script setup>
  import NavBar from "@/components/NavBar.vue";
  import FooterComponent from "@/components/FooterComponent.vue";
  

  </script>
  
  <style scoped>
  /* Add any styles specific to the public layout */
  </style>
  