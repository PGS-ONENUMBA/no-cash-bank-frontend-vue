<template>
  <div class="vh-100 d-flex flex-column">
    <!--- Logo --->
    <div class="m-4 d-flex justify-content-center">
      <img width="150" src="../assets/logo.jpeg" alt="logo">
    </div>

    <div class="d-flex flex-column align-items-center justify-content-center flex-grow-1 px-3">
      <!--- Content --->
      <div class="mb-4 text-center w-100 onboarding-container">
        <transition name="slide">
          <div class="slide" :key="currentIndex">
            <img :src="content[currentIndex].image" alt="Onboarding Step" class="onboarding-image">
            <h2 class="onboarding-title">{{ content[currentIndex].title }}</h2>
            <p class="onboarding-description">{{ content[currentIndex].description }}</p>
          </div>
        </transition>
      </div>

      <!--- Step Indicators and Control Buttons  -->
      <div class="d-flex flex-column align-items-center mt-4">
        <!--- Step Indicators -->
        <div class="d-flex gap-2 mb-3">
          <span v-for="(step, index) in content.length" :key="index" 
            class="rounded-circle" 
            :class="{'bg-primary': index === currentIndex, 'bg-secondary': index !== currentIndex}" 
            style="width: 10px; height: 10px;"></span>
        </div>

        <!--- Control Buttons -->
        <div class="d-flex justify-content-center gap-2">
          <button @click="nextSlide" class="btn btn-primary">Next</button>
          <button @click="skipOnboarding" class="btn btn-secondary">Skip</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const content = ref([
  { 
    title: 'Step 1', 
    description: 'This is the first step of the onboarding process.', 
    image: '/public/images/onboardingimages/silhouette.png'
  },
  { 
    title: 'Step 2', 
    description: 'This is the second step of the onboarding process.', 
    image: '/public/images/onboardingimages/silhouette.png'
  },
  { 
    title: 'Step 3', 
    description: 'This is the third step of the onboarding process.', 
    image: '/public/images/onboardingimages/silhouette.png'
  }
]);

const currentIndex = ref(0);
const emit = defineEmits(['toggleOnboarding'])

const nextSlide = () => {
  if (currentIndex.value < content.value.length - 1) {
    currentIndex.value++;
  } else {
      toggleOnboardingScreen()
  }
};

const skipOnboarding = () => {
    toggleOnboardingScreen()
};

const toggleOnboardingScreen = () => {
    emit('toggleOnboarding', false)
    localStorage.setItem('isOnboardingScreenSeen', true)
}

const isPWA = computed(() => {
  return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone);
});

const isMobile = computed(() => {
  return window.matchMedia('(max-width: 768px)').matches;
});

onMounted(() => {
   if (isPWA.value && isMobile.value) {
      emit('toggleOnboarding', true)
   } else {
      emit('toggleOnboarding', false)
   }

   if(localStorage.getItem("isOnboardingScreenSeen") !== null) {
      emit('toggleOnboarding', false)
   }
});
</script>

<style scoped>
.slide {
  width: 100%;
  text-align: center;
  position: absolute;
  top: 0; /* Ensure it's aligned at the top */
  left: 0; /* Default position */
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

.onboarding-image {
  width: 100%;
  max-width: 300px;
  height: auto;
}

.onboarding-container {
  max-width: 400px;
  position: relative;
  min-height: 400px; /* Ensure enough height to fit image + text */
  overflow: hidden; /* Prevents slides from appearing outside */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
