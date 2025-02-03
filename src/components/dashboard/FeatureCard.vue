<template>
  <div class="col">
    <div class="card text-center shadow-sm">
      <div class="card-body">
        <h5 class="card-title">
          <i :class="icon"></i> {{ title }}
        </h5>
        <p class="card-text">{{ description }}</p>
        <router-link :to="link" class="btn btn-success">Go to {{ title }}</router-link>
      </div>
    </div>
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
/* Specific card styles can be added here */
</style>
