<template>
  <section id="faq" class="container-fluid px-4 py-3 mt-3 section-faq">
    <div class="container px-4 py-3">
      <h2 class="pb-2 border-bottom d-flex align-items-center">
        <i class="bi bi-question-circle bi-green me-2"></i> FAQ
      </h2>

      <!-- Category navigation -->
      <ul class="nav nav-pills mb-3 flex-wrap">
        <li class="nav-item" v-for="category in categories" :key="category.id">
          <a
            class="nav-link"
            :href="'#faq-category-' + category.id"
          >
            {{ category.title }}
          </a>
        </li>
      </ul>

      <!-- Categories + Accordions -->
      <div
        v-for="(category, cIndex) in categories"
        :key="category.id"
        :id="'faq-category-' + category.id"
        class="mb-4"
      >
        <h3 class="h5 mb-2">
          {{ category.title }}
        </h3>
        <p v-if="category.subtitle" class="text-muted small mb-2">
          {{ category.subtitle }}
        </p>

        <div class="accordion" :id="'faqAccordion-' + category.id">
          <div
            class="accordion-item"
            v-for="(faq, index) in category.faqs"
            :key="index"
          >
            <h2
              class="accordion-header"
              :id="`heading-${category.id}-${index}`"
            >
              <button
                class="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                :data-bs-target="`#collapse-${category.id}-${index}`"
                :aria-expanded="index === 0 && cIndex === 0"
                :aria-controls="`collapse-${category.id}-${index}`"
              >
                {{ faq.question }}
              </button>
            </h2>

            <div
              :id="`collapse-${category.id}-${index}`"
              class="accordion-collapse collapse"
              :class="{ show: index === 0 && cIndex === 0 }"
              :aria-labelledby="`heading-${category.id}-${index}`"
              :data-bs-parent="`#faqAccordion-${category.id}`"
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

        <hr v-if="cIndex < categories.length - 1" class="mt-4" />
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from "vue";

export default {
  name: "FAQ",
  setup() {
    const categories = ref([
      {
        id: "overview",
        title: "Overview & Licensing",
        subtitle: "High level view of what PayByChance is and how it is regulated.",
        faqs: [
          {
            question: "What is PayByChance?",
            answers: [
              "PayByChance is an innovative promotional value-added service that helps consumers meet needs and goals with a minimal ₦250 participation cost.",
              "It gives customers a chance to unlock greater value and achieve more with every transaction."
            ]
          },
          {
            question: "What makes PayByChance different?",
            answers: [
              "It combines digital payments, customer engagement, and instant gratification in a single flow.",
              "Every transaction can deliver real value to both consumers and merchants."
            ]
          },
          {
            question: "Is PayByChance licensed or regulated?",
            answers: [
              "Yes. PayByChance operates under licenses from the Lagos State Lotteries and Gaming Authority (LSLGA).",
              "It is also licensed by the FCT Lotteries Board, ensuring full compliance with promotional and gaming regulations."
            ]
          },
          {
            question: "How does PayByChance support compliance and transparency?",
            answers: [
              "Raffle and payment systems are monitored by regulatory bodies.",
              "Every transaction and draw is digitally verified to ensure fairness and transparency."
            ]
          }
        ]
      },
      {
        id: "customers",
        title: "Customer Participation",
        subtitle: "How customers join, play, win, and use their value.",
        faqs: [
          {
            question: "How does PayByChance work?",
            answers: [
              "You scan a PayByChance QR code at a partner store or online.",
              "You are redirected to a secure PayByChance page to make a small participation payment.",
              "The system instantly tells you if you have won or not.",
              "Any amount won can be used immediately at the store."
            ]
          },
          {
            question: "How can I participate?",
            answers: [
              "Scan the PayByChance QR code displayed at the checkout counter, product shelf, or online store.",
              "Follow the instructions on the landing page and complete your ₦250 participation payment."
            ]
          },
          {
            question: "What happens after I make a payment?",
            answers: [
              "You receive an instant on-screen message confirming whether you have won.",
              "If you win, the value is added to your PayByChance wallet or used directly for purchases at the store."
            ]
          },
          {
            question: "How do I use my winnings?",
            answers: [
              "You can instantly use your winnings to pay for goods or services at the same store where you participated.",
              "You can also use them at any other participating PayByChance merchant, subject to merchant setup."
            ]
          },
          {
            question: "Can I play multiple times?",
            answers: [
              "Yes. You can participate as many times as you wish.",
              "The more entries you make, the higher your chances of winning."
            ]
          },
          {
            question: "How do I know if I have won?",
            answers: [
              "You get an instant on-screen notification immediately after payment.",
              "You also receive an SMS or email confirmation with your transaction details."
            ]
          },
          {
            question: "Can I withdraw my winnings?",
            answers: [
              "Yes, depending on the merchant’s policy and wallet configuration.",
              "Winnings can be used directly for purchases or transferred to your wallet for later use or withdrawal."
            ]
          },
          {
            question: "What happens if a customer experiences a failed transaction?",
            answers: [
              "If a transaction fails or is incomplete, the customer’s account is not charged.",
              "If any charge was made in error, an instant reversal is processed by the payment processor."
            ]
          },
          {
            question: "What happens if the internet connection is slow or unavailable?",
            answers: [
              "Transactions resume automatically once connectivity is restored.",
              "Offline participation is possible on select POS terminals that are integrated with PayByChance."
            ]
          }
        ]
      },
      {
        id: "payments-security",
        title: "Payments & Security",
        subtitle: "How your payments are handled and protected.",
        faqs: [
          {
            question: "Is my payment secure?",
            answers: [
              "Yes. All transactions are processed securely through licensed payment partners.",
              "We use encrypted, PCI-DSS-compliant payment systems to protect customer data."
            ]
          },
          {
            question: "What payment methods are accepted?",
            answers: [
              "Bank cards.",
              "Bank transfers.",
              "USSD.",
              "PayByChance wallet, where available."
            ]
          }
        ]
      },
      {
        id: "merchants",
        title: "Merchants & Partners",
        subtitle: "How businesses integrate PayByChance and benefit from it.",
        faqs: [
          {
            question: "How can my business partner with PayByChance?",
            answers: [
              "Register as a merchant through the PayByChance website.",
              "After approval, you receive a unique QR code and access to your merchant dashboard."
            ]
          },
          {
            question: "What are the benefits for my store?",
            answers: [
              "Increased customer traffic and repeat visits.",
              "Higher transaction volumes as customers spend more to win.",
              "Stronger brand visibility with in-store promotional materials.",
              "Access to customer insights and analytics through your dashboard."
            ]
          },
          {
            question: "How are settlements handled?",
            answers: [
              "Settlements are processed through licensed payment partners and settlement banks.",
              "You receive automatic payouts into your merchant account based on agreed timelines."
            ]
          },
          {
            question: "What infrastructure do I need to get started?",
            answers: [
              "A visible space in your store to display the PayByChance QR code and communication materials.",
              "The platform runs online, so no dedicated POS or hardware is required unless you integrate it into your existing systems."
            ]
          },
          {
            question: "Can PayByChance integrate with my existing POS or payment system?",
            answers: [
              "Yes. PayByChance can integrate with most POS terminals and digital payment gateways.",
              "Integration is done through a simple API connection provided during onboarding."
            ]
          },
          {
            question: "How do I monitor transactions and performance?",
            answers: [
              "Log in to your PayByChance merchant dashboard.",
              "You can see transactions, wallet balances, reports, and customer engagement metrics in real time."
            ]
          },
          {
            question: "How long does it take to onboard a merchant?",
            answers: [
              "Onboarding typically takes 3–5 working days.",
              "This includes verification, training, and QR code setup."
            ]
          },
          {
            question: "Can multiple branches of a store use PayByChance?",
            answers: [
              "Yes. Each branch receives a unique QR code.",
              "This allows separate tracking and reporting per location."
            ]
          }
        ]
      },
      {
        id: "support",
        title: "Support & Contact",
        subtitle: "Help, escalation, and partnership enquiries.",
        faqs: [
          {
            question: "Who provides customer support?",
            answers: [
              "PayByChance offers 24/7 customer and merchant support via email, phone, and in-app chat.",
              "Dedicated account managers are assigned to top merchant partners."
            ]
          },
          {
            question: "Who can I contact for partnership or support?",
            answers: [
              "Email: support@paybychance.com.",
              "Website: www.paybychance.com."
            ]
          }
        ]
      }
    ]);

    return { categories };
  }
};
</script>

<style scoped>
.section-faq {
  background-color: #f8f9fa;
}
</style>
