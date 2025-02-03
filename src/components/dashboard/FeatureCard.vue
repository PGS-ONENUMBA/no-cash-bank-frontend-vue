<template>
    <div class="col">
      <div class="card text-center shadow-sm">
        <div class="card-body">
          <h5 class="card-title">
            <i :class="icon"></i> {{ title }}
          </h5>
          <p class="card-text">{{ description }}</p>
          <router-link :to="link" class="btn btn-success">Go to {{ title }}</router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from "vue";
  
  const props = defineProps({
    title: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: true },
  });
  </script>

  
  <style scoped>
  /* Add any specific card styles */
  </style>
  