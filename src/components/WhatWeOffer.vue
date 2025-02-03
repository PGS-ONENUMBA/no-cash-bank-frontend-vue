<template>
  <section class="container-fluid py-3 section-what-we-do">
    <div class="container px-4 py-3">
      <h2 class="pb-3 border-bottom">What We Offer</h2>
      <div class="row g-4 py-5 row-cols-1 row-cols-lg-3">
        <div class="col" v-for="(offer, index) in offers" :key="index">
          <div class="card h-100 text-center shadow-sm">
            <div class="card-body">
              <i :class="offer.icon" class="offer-icon"></i>
              <h3 class="card-title mt-3 fs-4">{{ offer.title }}</h3>
              <p class="card-text">{{ offer.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from "vue";

export default {
  name: "WhatWeOffer",
  setup() {
    // List of offers
    const offers = ref([
      {
        icon: "bi bi-toggles2 bi-green",
        title: "Seamless Transactions",
        description: "Enjoy fast and hassle-free transactions tailored to your needs.",
      },
      {
        icon: "bi bi-cpu-fill bi-green",
        title: "Secure, User-Friendly Services",
        description: "Track your transactions with our intuitive tools.",
      },
      {
        icon: "bi bi-tools bi-green",
        title: "24/7 Support",
        description: "Get assistance whenever you need it from our dedicated team.",
      },
    ]);

    return {
      offers,
    };
  },
};
</script>

<style scoped>
/* Section Background */
.section-what-we-do {
  background-color: #ffffff;
}

/* Green Icons */
.bi-green {
  color: #28a745;
}

/* Offer Icons */
.offer-icon {
  font-size: 3rem;
}
</style>
