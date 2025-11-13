Here is your updated Vue FAQ component rebuilt with the new PayByChance FAQs. Structure remains clean, practical, and ready to drop into your codebase. No opinions, no fluff.

**Updated Component (just replace your existing file):**

```vue
<template>
  <section id="faq" class="container-fluid px-4 py-3 mt-3 section-faq">
    <div class="container px-4 py-3">
      <h2 class="pb-2 border-bottom d-flex align-items-center">
        <i class="bi bi-question-circle bi-green me-2"></i> FAQ
      </h2>

      <div class="accordion" id="faqAccordion">
        <div
          class="accordion-item"
          v-for="(faq, index) in faqs"
          :key="index"
        >
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
    const faqs = ref([
      {
        question: "What is PayByChance?",
        answers: [
          "An innovative promotional value-added service for meeting needs and reaching goals at a minimal ₦250 participation cost",
          "Gives consumers the chance to unlock greater value with every transaction"
        ]
      },
      {
        question: "How does PayByChance work?",
        answers: [
          "Scan the PayByChance QR code at a partner store or online",
          "Make a small participation payment",
          "System instantly notifies you if you’ve won",
          "Winnings can be used immediately at the store"
        ]
      },
      {
        question: "Is PayByChance licensed or regulated?",
        answers: [
          "Yes, licensed by Lagos State Lotteries and Gaming Authority (LSLGA)",
          "Also licensed by the FCT Lotteries Board"
        ]
      },
      {
        question: "What makes PayByChance different?",
        answers: [
          "Combines digital payments, customer engagement, and instant gratification",
          "Delivers real value to both consumers and merchants with every transaction"
        ]
      },
      {
        question: "How can I participate?",
        answers: [
          "Scan the PayByChance QR code in-store or online",
          "Follow instructions and complete your ₦250 participation payment"
        ]
      },
      {
        question: "What happens after I make a payment?",
        answers: [
          "You receive an instant message showing whether you’ve won",
          "If you win, the value is added to your PayByChance wallet or used directly at the store"
        ]
      },
      {
        question: "How do I use my winnings?",
        answers: [
          "Use your winnings instantly at the store where you participated",
          "You can also use them at any PayByChance merchant"
        ]
      },
      {
        question: "Can I play multiple times?",
        answers: [
          "Yes, you can participate as many times as you want",
          "More entries increase your chances of winning"
        ]
      },
      {
        question: "Is my payment secure?",
        answers: [
          "All transactions are processed through licensed payment partners",
          "Encrypted and PCI-DSS-compliant systems are used"
        ]
      },
      {
        question: "What payment methods are accepted?",
        answers: [
          "Bank cards",
          "Bank transfers",
          "USSD",
          "PayByChance wallet"
        ]
      },
      {
        question: "How do I know if I’ve won?",
        answers: [
          "You get instant on-screen feedback",
          "You also receive an SMS or email confirmation"
        ]
      },
      {
        question: "Can I withdraw my winnings?",
        answers: [
          "Yes, depending on merchant policy",
          "Winnings can be used directly or moved to your wallet for later use or withdrawal"
        ]
      },
      {
        question: "How can my business partner with PayByChance?",
        answers: [
          "Register on the PayByChance website",
          "Once approved, you receive your QR code and merchant dashboard access"
        ]
      },
      {
        question: "What are the benefits for my store?",
        answers: [
          "Increased customer traffic and repeat visits",
          "Higher transaction volumes",
          "Better brand visibility",
          "Access to customer analytics via the merchant dashboard"
        ]
      },
      {
        question: "How are settlements handled?",
        answers: [
          "Processed through licensed payment partners and settlement banks",
          "Automatic payouts based on agreed timelines"
        ]
      },
      {
        question: "What infrastructure do I need to get started?",
        answers: [
          "Just a visible space to display your QR code and materials",
          "Platform runs fully online with no special hardware needed"
        ]
      },
      {
        question: "Can PayByChance integrate with my existing POS or payment system?",
        answers: [
          "Yes, through simple API integration",
          "Supports most POS terminals and gateways"
        ]
      },
      {
        question: "How does PayByChance support compliance and transparency?",
        answers: [
          "All raffles and payments are monitored by regulators",
          "Each transaction and draw is digitally verified"
        ]
      },
      {
        question: "Who provides customer support?",
        answers: [
          "24/7 support via email, phone, and in-app chat",
          "Dedicated account managers for top merchant partners"
        ]
      },
      {
        question: "How do I monitor transactions and performance?",
        answers: [
          "Use your merchant dashboard",
          "View transactions, wallet balances, reports, and engagement metrics in real time"
        ]
      },
      {
        question: "How long does it take to onboard a merchant?",
        answers: [
          "Typically 3–5 working days including verification, training, and QR setup"
        ]
      },
      {
        question: "Can multiple branches of a store use PayByChance?",
        answers: [
          "Yes, each branch receives a unique QR code"
        ]
      },
      {
        question: "What happens if a customer experiences a failed transaction?",
        answers: [
          "Failed or incomplete transactions are not charged",
          "Instant reversals are triggered by the processor if applicable"
        ]
      },
      {
        question: "What if the internet connection is slow or unavailable?",
        answers: [
          "Transactions resume once connection returns",
          "Offline participation is possible on supported POS terminals"
        ]
      },
      {
        question: "Who can I contact for partnership or support?",
        answers: [
          "support@paybychance.com",
          "www.paybychance.com"
        ]
      }
    ]);

    return { faqs };
  }
};
</script>

<style scoped>
.section-faq {
  background-color: #f8f9fa;
}
</style>
