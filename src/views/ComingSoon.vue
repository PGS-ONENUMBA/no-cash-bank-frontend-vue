<!--
 * Vue component that represents a full-page layout.
 * This component serves as a container for the main content of the application.
 * It can include slots for dynamic content and supports customization through props.
 *
 * @module FullPageComponent
 * @vue-prop {string} [title] - The title of the page, used for display or metadata purposes.
 * @vue-prop {boolean} [isLoading=false] - Indicates whether the page is in a loading state.
 * @vue-slot default - The default slot for injecting the main content of the page.
 * @vue-slot header - Optional slot for injecting custom header content.
 * @vue-slot footer - Optional slot for injecting custom footer content.
 *
 -->
<template>
  <div class="container text-center vh-100 d-flex flex-column justify-content-center align-items-center">
    <div class="text-center">
      <!-- Contextual Icon -->
      <i class="bi bi-rocket-takeoff text-orange display-1 mb-3 animate-bounce"></i>
      <h1 class="display-1 text-orange fw-bold">Coming Soon</h1>
      <p class="text-muted fs-3">
        We're working hard to launch it soon.
      </p>
      <router-link to="/" class="btn btn-green btn-lg mt-3">
        <i class="bi bi-house-door me-2 bi-white"></i> Back to Home
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "ComingSoon",
};
</script>

<style scoped>
.text-orange {
  color: #ff6f00;
}

.btn-green {
  background-color: #09b850;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}

.btn-green:hover {
  background-color: #07a047;
}

.bi-white {
  color: white;
}

/* Bounce Animation */
.animate-bounce {
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}

/* Fade Animation */
.animate-fade {
  animation: fadeIn 1.5s ease-in-out;
}
@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
