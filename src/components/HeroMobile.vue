<template>
  <section class="hero-section d-flex flex-column justify-content-center align-items-center py-4 mt-5">
    <div class="container text-center text-dark">
      <h1 class="display-6 fw-bold mb-3">
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
export default {
  name: "HeroMobile",
  components: { HeroActions },
  props: ["raffleProducts", "loading", "redirectToProductPage"],
};
</script>

<style scoped>
.text-purple {
  color: #6609b8;
}
</style>
