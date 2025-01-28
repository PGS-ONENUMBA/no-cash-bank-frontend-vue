<template>
  <div>
    <!-- Page Content -->
    <main class="container py-5 mt-5">
      <!-- Title Section -->
      <h1 class="text-center mb-5">
        <i class="bi bi-question-circle me-2"></i> How It Works
      </h1>
      <p class="text-muted fs-5 text-center mb-5">
        Discover the simple and secure process behind our No-Cash-Bank platform.
      </p>

      <!-- Step-by-Step Process Section -->
      <section>
        <h2 class="text-center mb-4">Our Simple Process</h2>
        <div class="row row-cols-1 row-cols-md-3 g-4">
          <div class="col" v-for="(step, index) in steps" :key="index">
            <div class="card h-100">
              <div class="card-header text-center">
                <i :class="[step.icon, step.iconColorClass, 'fs-1']"></i>
                <h4 class="card-title mt-2">{{ step.title }}</h4>
              </div>
              <div class="card-body text-center">
                <p class="card-text">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="mt-5">
        <h2 class="text-center mb-4">Why Choose No-Cash-Bank?</h2>
        <div class="row g-4">
          <div class="col-md-4" v-for="(feature, index) in features" :key="index">
            <div class="card h-100 text-center">
              <div class="card-header">
                <i :class="[feature.icon, feature.iconColorClass, 'fs-1']"></i>

                <h4 class="card-title mt-2">{{ feature.title }}</h4>
              </div>
              <div class="card-body">
                <p class="card-text">{{ feature.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call-to-Action Section -->
      <section class="text-center mt-5">
        <h2>Ready to Get Started?</h2>
        <p class="fs-5">
          Click and experience no-cash-banking.
        </p>
        <div class="d-flex flex-wrap justify-content-center gap-3 mt-4">
          <router-link to="/get-cash" class="btn btn-green btn-lg">
            <i class="bi bi-cash-stack me-2 bi-white"></i> Get Cash
          </router-link>
          <router-link to="/pay4me" class="btn btn-green btn-lg">
            <i class="bi bi-send-fill me-2 bi-white"></i> Pay4Me
          </router-link>
          <router-link to="/on-the-house" class="btn btn-orange btn-lg">
            <i class="bi bi-gift-fill me-2 bi-white"></i> On The House
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
export default {
  name: "HowItWorks",
  data() {
    return {
      steps: [
        {
          icon: "bi bi-person-plus-fill",
          iconColorClass: "text-green", // Green icon
          title: "Sign Up",
          description: "Create your free account with just a few clicks. All you need is your email and basic information.",
        },
        {
          icon: "bi bi-file-lock-fill",
          iconColorClass: "text-orange", // Orange icon
          title: "Verify Your Identity",
          description: "Complete our secure KYC process to ensure compliance and the safety of your transactions.",
        },
        {
          icon: "bi bi-wallet2",
          iconColorClass: "text-green", // Green icon
          title: "Start Banking",
          description: "Access our features like cashless payments, financial tools, and secure transactions.",
        },
      ],
      features: [
        {
          icon: "bi bi-shield-check",
          iconColorClass: "text-green", // Green icon
          title: "Secure Platform",
          description: "Your data and transactions are safeguarded with state-of-the-art encryption and security protocols.",
        },
        {
          icon: "bi bi-speedometer",
          iconColorClass: "text-orange", // Orange icon
          title: "Fast Transactions",
          description: "Enjoy seamless and quick transactions, ensuring your banking experience is smooth and efficient.",
        },
        {
          icon: "bi bi-people",
          iconColorClass: "text-green", // Green icon
          title: "Financial Inclusion",
          description: "Our platform is designed to make banking accessible for everyone, regardless of location or background.",
        },
      ],
    };
  },
};
</script>

<style scoped>
/* Global Styles */
body {
  font-family: 'Public Sans', sans-serif;
}

/* Colors */
.text-green {
  color: #09b850;
}

.text-orange {
  color: #ff6f00;
}

/* Button Styling */
.btn-green {
  background-color: #09b850;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}

.btn-green:hover {
  background-color: #07a047;
}

.btn-orange {
  background-color: #ff6f00;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1rem;
  border-radius: 0.5rem;
}

.btn-orange:hover {
  background-color: #e65d00;
}

/* Title and Card Text */
h1,
h2,
h4 {
  font-weight: 400;
}

.card-title {
  font-weight: 400;
}

.card-text {
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Card Header */
.card-header {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
  background-color: #f8f9fa;
}

.card {
  border-radius: 0.5rem;
}

/* Call-to-Action Section */
.text-center .btn {
  min-width: 200px;
}
</style>
