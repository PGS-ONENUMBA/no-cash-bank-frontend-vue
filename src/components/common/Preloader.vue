<template>
    <div class="preloader-container">
      <div class="spinner"></div>
    </div>
  </template>
  
  <style scoped>
  .preloader-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
  }
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #6609b8;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    100% { transform: rotate(360deg); }
  }
  </style>
  