<template>
  <section class="hero-section d-flex align-items-center mt-5">
    <div class="container text-start text-dark">
      <h1 class="display-5 fw-bold mb-3">
        Africa's First No <span class="text-purple">Cash Bank</span>
      </h1>
      <p class="fs-6 mb-3">Experience banking without cash at PayByChance accessible to <br />everyone and anywhere</p>
      <ul class="list-unstyled mb-4">
        <li class="mb-2">
          <i class="bi bi-check-circle-fill text-purple me-2"></i>
          <strong>Perform Seamless Transaction</strong>
        </li>
        <li>
          <i class="bi bi-check-circle-fill text-purple me-2"></i>
          <strong>Banking Without Cash</strong>
        </li>
      </ul>
      <HeroActions
        :raffleProducts="raffleProducts"
        :loading="loading"
        @redirect="redirectToProductPage"
      />
    </div>
  </section>
</template>

<script>
import HeroActions from "@/components/HeroActions.vue";
export default {
  name: "HeroDesktop",
  components: { HeroActions },
  props: ["raffleProducts", "loading", "redirectToProductPage"],
};
</script>

<style scoped>
.hero-section {
  background: url('@/assets/hero-paybychance.png') no-repeat center center;
  background-size: cover;
  width: 100%;
  height: 100vh;
  position: relative;
  padding: 4rem 2rem;
}
.text-purple {
  color: #6609b8;
}
</style>
