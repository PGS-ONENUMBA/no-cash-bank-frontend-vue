<template>
    <div v-if="showOnboarding" class="">
        <!--- Logo --->
        <div class="m-4 d-flex justify-content-center">
            <img width="150" src="../assets/logo.jpeg" alt="logo">
        </div>
        <div class="d-flex flex-column align-items-center justify-content-center vh-100">
  
      
          <!--- Content --->
          <div class="mb-4 text-center w-100" style="max-width: 400px; position: relative; min-height: 150px;">
            <transition name="slide">
              <div class="slide" :key="currentIndex">
                <h2>{{ content[currentIndex].title }}</h2>
                <p>{{ content[currentIndex].description }}</p>
              </div>
            </transition>
          </div>
      
          <!--- Step Indicators and control buttons  -->
          <div class="d-flex flex-column align-items-center">
            
            <!--- Step Indicators -->
            <div class="d-flex gap-2 mb-3">
              <span v-for="(step, index) in content.length" :key="index" 
                class="rounded-circle" 
                :class="{'bg-primary': index === currentIndex, 'bg-secondary': index !== currentIndex}" 
                style="width: 10px; height: 10px;"></span>
            </div>
      
            <!--- Control Buttons -->
            <div class="d-flex justify-content-center gap-2">
              <button @click="nextSlide" v-if="currentIndex < content.length - 1" class="btn btn-primary">Next</button>
              <button @click="skipOnboarding" class="btn btn-secondary">Skip</button>
            </div>
          </div>
        </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const content = ref([
    { title: 'Step 1', description: 'This is the first step of the onboarding process.' },
    { title: 'Step 2', description: 'This is the second step of the onboarding process.' },
    { title: 'Step 3', description: 'This is the third step of the onboarding process.' }
  ]);
  
  const currentIndex = ref(0);
  const showOnboarding = ref(true);
  
  const nextSlide = () => {
    if (currentIndex.value < content.value.length - 1) {
      currentIndex.value++;
    } else {
      showOnboarding.value = false;
    }
  };
  
  const skipOnboarding = () => {
    showOnboarding.value = false;
  };
  </script>
  
  <style scoped>
  .slide {
    transition: transform 0.5s ease-in-out;
    position: absolute;
    width: 100%;
    text-align: center;
  }
  
  .slide-enter-active, .slide-leave-active {
    transition: transform 0.5s ease-in-out;
  }
  .slide-enter-from {
    transform: translateX(100%);
  }
  .slide-leave-to {
    transform: translateX(-100%);
  }
  </style>
  