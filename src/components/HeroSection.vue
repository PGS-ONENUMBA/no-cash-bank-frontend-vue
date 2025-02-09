<template>
  <div class="container py-4 mt-5">
    <div class="jumbotron-bg mb-4">
      <div class="container-fluid py-5 text-center position-relative">
        <h1 class="display-5 fs-1">Africa's First No-Cash Bank</h1>
        <p class="col-md-8 mx-auto fs-3">Experience Banking Without Cash</p>
        <p>
          At {{ siteName }}, we envision a world where banking is accessible to everyone, everywhere.<br />
          Our mission is to deliver secure, user-friendly online No-Cash banking that empowers<br />
          individuals to make payments with cash!
        </p>

        <!-- Display Preloader when fetching -->
        <Preloader v-if="loading" />

        <!-- Raffle Cycles Display -->
        <div v-else class="container">
          <div class="d-grid gap-2 d-md-block text-center">
            <template v-for="raffle in raffleProducts" :key="raffle.raffle_cycle_id">
              <button
                v-for="type in raffle.associated_types"
                :key="`${raffle.raffle_cycle_id}-${type.raffle_type_id}`"
                @click="redirectToProductPage(raffle.raffle_cycle_id, type.raffle_type_id)"
                class="btn btn-green m-2"
              >
                <i :class="`${getIcon(type.raffle_type_id)} me-2 text-white fs-3`"></i>
                <div class="d-flex flex-column">
                  <span>{{ type.raffle_type }}</span>
                  <small>Amount ₦{{ formatAmount(raffle.winnable_amount) }}</small>
                </div>
              </button>
            </template>
          </div>
        </div>

        <!-- Video Section -->
        <div class="mt-5 position-relative">
          <a 
            href="#" 
            data-bs-toggle="modal" 
            data-bs-target="#videoModal" 
            class="btn position-absolute top-100 start-50 translate-middle ripple-btn"
          >
            <i class="bi bi-play-circle bi-green-medium"></i>
          </a>
          <span class="ripple"></span>
          <span class="ripple"></span>
          <span class="ripple"></span>
        </div>

        <!-- Video Modal -->
        <div class="modal fade" id="videoModal" tabindex="-1" aria-labelledby="videoModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
              <div class="modal-header border-0">
                <h5 class="modal-title" id="videoModalLabel">
                  <i class="bi bi-play-circle me-2"></i> Testimonial Video
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="ratio ratio-16x9">
                  <iframe 
                    id="videoIframe" 
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                    title="Testimonial Video" 
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Preloader from "@/components/common/Preloader.vue";
import { fetchProducts, isLoading, getIcon, getRoute } from "@/services/productService";

export default {
  name: "HeroSection",
  components: { Preloader },
  
  setup() {
    const raffleProducts = ref([]);
    const loading = ref(false);
    const router = useRouter();
    const siteName = import.meta.env.VITE_SITE_NAME || "OneNnumba";

  // Format amount with thousand separator and 2 decimal places
    const formatAmount = (amount) => {
      return new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(parseFloat(amount) || 0);
    };

    // Handle product page navigation
    const redirectToProductPage = (raffleCycleId, raffleTypeId) => {
      const routePath = getRoute(raffleTypeId);
      
      router.push({
        path: routePath,
        query: {
          raffle_cycle_id: raffleCycleId,
          raffle_type_id: raffleTypeId,
        }
      });
    };

    // Fetch raffle products on component mount
    onMounted(async () => {
      loading.value = true;
      try {
        const products = await fetchProducts();
        raffleProducts.value = products;
      } catch (error) {
        console.error('Error fetching raffle products:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      raffleProducts,
      loading,
      siteName,
      redirectToProductPage,
      formatAmount,
      getIcon
    };
  }
};
</script>

<style scoped>
.btn-green {
  color: white;
  min-width: 200px;
  padding: 0.75rem 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-green:hover {
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn-green small {
  opacity: 0.9;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .btn-green {
    width: 100%;
    margin-bottom: 0.5rem;
    justify-content: center;
  }
}

.ripple-btn {
  z-index: 1;
}

.ripple {
  position: absolute;
  border: 4px solid #e4d2f4;
  border-radius: 50%;
  animation: ripple 1.5s linear infinite;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ripple:nth-child(2) {
  animation-delay: 0.5s;
}

.ripple:nth-child(3) {
  animation-delay: 1s;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.5;
  }
  100% {
    width: 100px;
    height: 100px;
    opacity: 0;
  }
}
</style>