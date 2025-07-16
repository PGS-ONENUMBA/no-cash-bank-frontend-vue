<template>
  <section class="hero-section d-flex align-items-center mt-5">
    <div class="container text-start text-dark">
      <h1 class="display-5 fw-bold mb-3">
        PayByChance: <span class="text-purple">Achieve Your Goals With Ease</span>
      </h1>

      <p class="fs-6 mb-3">Experience the power of chance - <br />Turn everyday Transactions into extraordinary possibilities—only on PayByChance.</p>
      <ul class="list-unstyled mb-4">
        <li>
          <i class="bi bi-check-circle-fill text-purple me-2"></i>
          <strong>Make payments</strong>
        </li>
        <li>
          <i class="bi bi-check-circle-fill text-purple me-2"></i>
          <strong>Fulfill needs and</strong>
        </li>
        <li>
          <i class="bi bi-check-circle-fill text-purple me-2"></i>
          <strong>Unlock possibilities with PayByChance</strong>
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
import heroImage from "@/assets/hero-paybychance.png"; // Import the image explicitly
export default {
  name: "HeroDesktop",
  components: { HeroActions },
  props: ["raffleProducts", "loading", "redirectToProductPage"],
  data() {
    return {
      heroImageUrl: heroImage, // Make the image URL available to the template or style
    };
  },
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
