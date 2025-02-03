<template>
    <section class="container-fluid py-3 section-what-we-do">
      <div class="container px-4 py-3">
        <h2 class="pb-3 border-bottom">What We Offer</h2>
        <div class="row g-4 py-5 row-cols-1 row-cols-lg-3">
          <div class="col" v-for="(offer, index) in offers" :key="index">
            <div class="card h-100 text-center shadow-sm">
              <div class="card-body">
                <i :class="offer.icon" style="font-size: 3rem;"></i>
                <h3 class="card-title mt-3 fs-4">{{ offer.title }}</h3>
                <p class="card-text">{{ offer.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue'

  const offers = ref([
          {
            icon: "bi-green bi bi-toggles2",
            title: "Seamless Transactions",
            description: "Enjoy fast and hassle-free transactions tailored to your needs.",
          },
          {
            icon: "bi-green bi bi-cpu-fill",
            title: "Secure, User-Friendly Services",
            description: "Track your transactions with our intuitive tools.",
          },
          {
            icon: "bi-green bi bi-tools",
            title: "24/7 Support",
            description: "Get assistance whenever you need it from our dedicated team.",
          },
  ])

  // export default {
  //   data() {
  //     return {
  //       offers: [
  //         {
  //           icon: "bi-green bi bi-toggles2",
  //           title: "Seamless Transactions",
  //           description: "Enjoy fast and hassle-free transactions tailored to your needs.",
  //         },
  //         {
  //           icon: "bi-green bi bi-cpu-fill",
  //           title: "Secure, User-Friendly Services",
  //           description: "Track your transactions with our intuitive tools.",
  //         },
  //         {
  //           icon: "bi-green bi bi-tools",
  //           title: "24/7 Support",
  //           description: "Get assistance whenever you need it from our dedicated team.",
  //         },
  //       ],
  //     };
  //   },
  // };
  </script>
  
  <style scoped>
  /* Add styles specific to this component */
  .section-what-we-do {
    background-color: #ffffff;
  }
  .bi-green {
    color: #28a745;
  }
  </style>
  