<template>
  <div class="col">
    <router-link :to="link" class="card-link">
      <div class="card text-center shadow-sm custom-card">
        <div class="card-body">
          <h5 class="card-title">
            <i :class="icon" class="text-purple"><br /></i> {{ title }}
          </h5>
          <p class="card-text">{{ description }}</p>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "FeatureCard",
  props: {
    /**
     * The title of the feature card.
     * @type {String}
     */
    title: { type: String, required: true },

    /**
     * The Bootstrap icon class for the feature.
     * @type {String}
     */
    icon: { type: String, required: true },

    /**
     * Description text for the feature.
     * @type {String}
     */
    description: { type: String, required: true },

    /**
     * The route path the feature card links to.
     * @type {String}
     */
    link: { type: String, required: true },
  },
};
</script>

<style scoped>
/* ✅ Remove default router-link styling */
.card-link {
  text-decoration: none;
  color: inherit;
}


.custom-card:hover {
  box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

/* ✅ Purple Icons */
.text-purple {
  color: #6609b8 !important;
}
</style>
