<template>
  <div class="container">
    <div class="row">
      <div class="col-lg-7">
        <div class="hero-actions">
          <!-- Watch Video Button -->
          <button
            data-bs-toggle="modal"
            data-bs-target="#videoModal"
            class="btn btn-outline-purple mb-4"
          >
            <i class="bi bi-play-circle me-2"></i> Watch Video
          </button>

          <!-- Raffle Product Buttons -->
          <div class="mt-4">
            <!-- Loading State -->
            <div v-if="loading" class="d-flex align-items-center">
              <Preloader />
              <span class="fs-6 text-dark ms-2">Please wait, loading products...</span>
            </div>

            <!-- No Products State -->
            <div v-else-if="raffleProducts.length === 0" class="text-muted fs-6">
              No products available.
            </div>

            <!-- Product Grid with Dynamic Columns and Gaps -->
            <div v-else class="row g-3">
              <template v-for="raffle in raffleProducts" :key="raffle.raffle_cycle_id">
                <div
                    v-for="type in raffle.associated_types"
                    :key="`${raffle.raffle_cycle_id}-${type.raffle_type_id}`"
                    :class="columnClass"
                  >
                    {{ console.log("Type ID:", type.raffle_type_id) }}
                    <button
                      @click="$emit('redirect', raffle.raffle_cycle_id, type.raffle_type_id)"
                      class="btn btn-purple text-center w-100"
                    >

                    <div class="d-flex flex-column justify-content-center align-items-center">
                      <i :class="`${getIcon(type.raffle_type_id)} me-2 text-white fs-4`"></i>
                      <span>{{ type.raffle_type }}</span>
                      <!-- <small>₦{{ formatAmount(raffle.winnable_amount) }}</small> -->
                    </div>
                  </button>
                </div>
              </template>
            </div>
          </div>

          <!-- Video Modal -->
          <div class="modal fade" id="videoModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg">
              <div class="modal-content">
                <div class="modal-header border-0">
                  <h5 class="modal-title">
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
  </div>
</template>

<script>
import Preloader from "@/components/common/Preloader.vue";
import { getIcon } from "@/services/productService";

export default {
  name: "HeroActions",
  components: { Preloader },
  props: ["raffleProducts", "loading"],
  computed: {
    // Dynamically determine column class based on number of products
    columnClass() {
      const productCount = this.raffleProducts.reduce((sum, raffle) => sum + raffle.associated_types.length, 0);
      if (productCount === 1) return "col-12"; // 100% width
      if (productCount === 2) return "col-6";  // 2 columns
      return "col-4"; // 3 columns for 3+ products
    }
  },
  methods: {
    formatAmount(amount) {
      return new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(parseFloat(amount) || 0);
    },
    getIcon,
  },
};
</script>

<style lang="css" scoped>
.btn-purple {
  background-color: #6609b8;
  color: #fff;
  padding: 0.2rem 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
  flex-direction: column;
}

.btn-purple:hover {
  background-color: #4d088f;
  color: #fff;
}

/* Mobile-specific overrides */
@media (max-width: 768px) {
  .btn-purple {
    font-size: 0.8rem;
    padding: 0.6rem 1rem;
    gap: 0.1rem;
  }
}

@media (max-width: 450px) {
  .btn-purple {
    font-size: 0.8rem;
    padding: 0.6rem 1rem;
    gap: 0.1rem;
  }
}

.btn-outline-purple {
  border: 2px solid #6609b8;
  color: #6609b8;
  background: transparent;
}

.btn-outline-purple:hover {
  background-color: #6609b8;
  color: #fff;
}
</style>
