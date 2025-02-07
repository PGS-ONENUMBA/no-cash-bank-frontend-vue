<template>
  <OnboardingScreen v-if="showOnboardingScreen" />
  <div v-else>
    <router-view></router-view> <!-- Ensures correct layout is applied -->
  </div>
  
</template>

<script setup>

import { ref } from 'vue';
import OnboardingScreen from "@/components/OnboardingScreen.vue";
const showOnboardingScreen = ref(true);

</script>

<style>
/* Global styles if needed */
</style>



