<template>
  <section id="faq" class="container-fluid px-4 py-3 mt-3 section-faq">
    <div class="container px-4 py-3">
      <!-- FAQ Header -->
      <h2 class="pb-2 border-bottom d-flex align-items-center">
        <i class="bi bi-question-circle bi-green me-2"></i> FAQ
      </h2>

      <!-- Accordion for FAQs -->
      <div class="accordion" id="faqAccordion">
        <div
          class="accordion-item"
          v-for="(faq, index) in faqs"
          :key="index"
        >
          <!-- Accordion Header -->
          <h2 class="accordion-header" :id="'heading' + index">
            <button
              class="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              :data-bs-target="'#collapse' + index"
              :aria-expanded="index === 0"
              :aria-controls="'collapse' + index"
            >
              {{ faq.question }}
            </button>
          </h2>

          <!-- Accordion Body -->
          <div
            :id="'collapse' + index"
            class="accordion-collapse collapse"
            :class="{ show: index === 0 }"
            :aria-labelledby="'heading' + index"
            data-bs-parent="#faqAccordion"
          >
            <div class="accordion-body">
              <ul class="list-group">
                <li
                  class="list-group-item d-flex align-items-center"
                  v-for="(item, idx) in faq.answers"
                  :key="idx"
                >
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  {{ item }}
                </li>
              </ul>
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
  name: "FAQ",
  setup() {
    /**
     * List of Frequently Asked Questions (FAQs)
     */
    const faqs = ref([
      {
        question: "What is a No-Cash-Bank?",
        answers: [
          "Cashless transactions for ease and convenience",
          "Secure digital banking solutions",
          "Financial inclusion for everyone",
        ],
      },
      {
        question: "How secure is OneNnumba?",
        answers: [
          "End-to-end encryption",
          "Multi-factor authentication",
          "Regular audits for compliance",
        ],
      },
      {
        question: "How do I get started?",
        answers: [
          "Sign up on our platform",
          "Complete your profile and KYC process",
          "Start using our No-Cash banking services",
        ],
      },
    ]);

    return { faqs };
  },
};
</script>

<style scoped>
/* FAQ Section Styling */
.section-faq {
  background-color: #f8f9fa;
}
</style>
