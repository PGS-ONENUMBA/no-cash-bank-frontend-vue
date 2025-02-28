<template>
    <div 
      class="toast align-items-center top-0 start-50 translate-middle-x" 
      :class="backgroundClass" 
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <div class="d-flex">
        <div class="toast-body">
          <slot name="message">Default Toast Message</slot>
        </div>
        <button 
          type="button" 
          class="btn-close me-2 m-auto" 
          data-bs-dismiss="toast" 
          aria-label="Close"
        ></button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps } from 'vue';
  
  const props = defineProps({
    backgroundClass: {
      type: String,
      default: 'bg-primary'
    }
  });
  </script>
  
  <style scoped>
  .toast-body {
    font-size: 1rem;
    font-weight: 500;
  }
  </style>
  