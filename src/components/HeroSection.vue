<template>
  <div>
    <HeroDesktop
      v-if="!isMobile"
      :raffleProducts="raffleProducts"
      :loading="loading"
      :redirectToProductPage="redirectToProductPage"
    />
    <HeroMobile
      v-else
      :raffleProducts="raffleProducts"
      :loading="loading"
      :redirectToProductPage="redirectToProductPage"
    />
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { fetchProducts, getRoute } from "@/services/productService";
import HeroDesktop from "@/components/HeroDesktop.vue";
import HeroMobile from "@/components/HeroMobile.vue";
import { useRouter } from "vue-router";

export default {
  components: { HeroDesktop, HeroMobile },
  setup() {
    const raffleProducts = ref([]);
    const loading = ref(false);
    const router = useRouter();
    const isMobile = ref(window.innerWidth < 768);

    const redirectToProductPage = (raffleCycleId, raffleTypeId) => {
      const routePath = getRoute(raffleTypeId);
      router.push({
        path: routePath,
        query: { raffle_cycle_id: raffleCycleId, raffle_type_id: raffleTypeId }
      });
    };

    onMounted(async () => {
      loading.value = true;
      try {
        const products = await fetchProducts();
        raffleProducts.value = products;
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }

      window.addEventListener('resize', () => {
        isMobile.value = window.innerWidth < 768;
      });
    });

    return { raffleProducts, loading, isMobile, redirectToProductPage };
  }
};
</script>
