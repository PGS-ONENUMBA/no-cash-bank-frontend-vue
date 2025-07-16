<template>
  <div>
    <!-- Main Content -->
    <main class="container py-5 mt-5">
      <div class="row">
        <div class="col-md-10 mx-auto">
          <h1 class="pb-3 border-bottom text-center">
            <i class="bi bi-file-earmark-text me-2"></i> Terms and Conditions of Use for PayByChance
          </h1>

          <!-- Bootstrap Accordion Start -->
          <div class="accordion" id="termsAccordion">
            <div class="accordion-item" v-for="(section, index) in sections" :key="index">
              <h2 class="accordion-header" :id="`heading-${index}`">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="`#collapse-${index}`" aria-expanded="true" :aria-controls="`collapse-${index}`">
                  {{ section.title }}
                </button>
              </h2>
              <div :id="`collapse-${index}`" class="accordion-collapse collapse" :class="{ show: index === 0 }" :aria-labelledby="`heading-${index}`" data-bs-parent="#termsAccordion">
                <div class="accordion-body" v-html="section.content"></div>
              </div>
            </div>
          </div>
          <!-- Bootstrap Accordion End -->

        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: "TermsAndConditions",
  data() {
    return {
      sections: [
        {
          title: "1. General Terms",
          content: `<p>Welcome to PayByChance, Africa’s first Universal Transaction Chancification Company. PayByChance is a promotional platform... [trimmed for brevity]</p>`
        },
        {
          title: "2. How It Works (Step-by-Step Journey)",
          content: `<ul><li>Access: Initiate a transaction through a participating merchant...</li><li>Ticket Purchase: Voluntarily buy a ₦250 ticket...</li><li>Draw Mechanics: An automated draw is triggered...</li></ul>`
        },
        {
          title: "3. Participation Rules",
          content: `<strong>A. Eligibility</strong><ul><li>Be at least 18 years old.</li><li>Have a valid Nigerian phone number.</li><li>Use a recognized payment method.</li><li>Agree to these Terms and use the platform responsibly.</li></ul>`
        },
        {
          title: "4. Draws and Winnings",
          content: `<ul><li>Winning amount is remitted to the merchant on behalf of the winner, or</li><li>Deposited in the user’s PayByChance wallet...</li></ul>`
        },
        {
          title: "5. Account Creation and Security",
          content: `<strong>A. Account Registration:</strong> To participate, you must create an account...<br><strong>B. Account Security:</strong> Use strong credentials...`
        },
        {
          title: "6. Payments",
          content: `<p>We accept bank transfers, debit cards, mobile wallets. You must use legitimate payment methods...</p>`
        },
        {
          title: "7. Intellectual Property",
          content: `<p>All content belongs to PGS-OneNumba Ltd or licensors. You may not use logos, trademarks, or content without authorization...</p>`
        },
        {
          title: "8. Privacy and Data Protection",
          content: `<p>We collect and use your personal data... Contact us to do so or to close your account.</p>`
        },
        {
          title: "9. Limitation of Liability",
          content: `<p>PayByChance is chance-based. We offer no guarantees... We are not liable for any direct or indirect losses...</p>`
        },
        {
          title: "10. Misuse and Disqualification",
          content: `<p>Fraud, misrepresentation, or manipulation results in disqualification...</p>`
        },
        {
          title: "11. Termination and Suspension",
          content: `<p>We may suspend or terminate your account for Terms violations. Any unused tickets or winnings are forfeited.</p>`
        },
        {
          title: "12. Amendments and Updates",
          content: `<p>Terms may change anytime. Updates are posted on our platform. Continued use implies acceptance of changes.</p>`
        },
        {
          title: "13. Disputes and Governing Law:",
          content: `<p>These Terms are governed by Nigerian law. Disputes are to be settled via Mediation at the Lagos Multidoor Courthouse.</p>`
        },
        {
          title: "14. Contact Information",
          content: `<p>Company: PGS-OneNumba Ltd<br>Address: No 177, Moshood Olugbani Street, Off Ligali Ayorinde, Victoria Island, Lagos</p>`
        },
        {
          title: "15. Definitions",
          content: `<p>This section defines important terms used in this document such as "Account," "Draw," "Merchant," "Platform," "Threshold," etc.</p>`
        }
      ]
    };
  }
};
</script>

<style scoped>
body {
  font-family: 'Public Sans', sans-serif;
}

h1,
h2 {
  font-weight: 400;
}

p {
  line-height: 1.6;
  font-size: 1rem;
}

ul li {
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.accordion-button {
  font-weight: 500;
}
</style>
