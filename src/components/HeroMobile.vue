<template>
  <section class="hero-section d-flex flex-column justify-content-center align-items-center py-4 mt-5">
    <div class="container text-center text-dark">
      <h1 class="display-6 fw-bold mb-3">
        Africa's First No <span class="text-purple">Cash Bank</span>
      </h1>
      <p class="fs-6 mb-3">Accessible banking at PayByChance.</p>
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
