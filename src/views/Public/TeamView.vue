<template>
  <div>
    <!-- Main Content -->
    <main class="container py-5 mt-5">
      <h1 class="text-center mb-5">
        <i class="bi bi-people-fill me-2"></i> Meet Our Team
      </h1>
      <p class="text-muted fs-5 text-center mb-5">
        Get to know the amazing people behind our success.
      </p>

      <!-- Team Members -->
      <div class="row g-4">
        <!-- Dynamic Team Members -->
        <div
          class="col-md-4"
          v-for="(member, index) in teamMembers"
          :key="index"
        >
          <div class="card h-100 text-center shadow-sm">
            <!-- Team Member Image -->
            <img
              :src="member.image"
              class="card-img-top"
              :alt="`Image of ${member.name}`"
            />
            <div class="card-body">
              <!-- Member Name and Role -->
              <h5 class="card-title">{{ member.name }}</h5>
              <p class="card-text text-muted">{{ member.role }}</p>
              <!-- Social Media Links -->
              <a
                :href="member.linkedin"
                class="text-success me-3"
                target="_blank"
                rel="noopener"
              >
                <i class="bi bi-linkedin"></i>
              </a>
              <a
                :href="member.twitter"
                class="text-success"
                target="_blank"
                rel="noopener"
              >
                <i class="bi bi-twitter"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
/**
 * Team Component
 * This component displays the "Meet Our Team" page with a list of team members.
 *
 * Features:
 * - Dynamically renders team member details from the `teamMembers` data array.
 * - Each team member displays their name, role, image, and social media links.
 */

 import { ref } from 'vue'
const teamMembers =  ref([
        {
          name: "John Doe",
          role: "CEO & Founder",
          image: new URL('@/assets/team1.jpg', import.meta.url).href, // Image path
          linkedin: "https://linkedin.com/in/johndoe", // LinkedIn profile link
          twitter: "https://twitter.com/johndoe", // Twitter profile link
        },
        {
          name: "Jane Smith",
          role: "Chief Operating Officer",
          image: new URL('@/assets/team2.jpg', import.meta.url).href,
          linkedin: "https://linkedin.com/in/janesmith",
          twitter: "https://twitter.com/janesmith",
        },
        {
          name: "Emily Johnson",
          role: "Head of Marketing",
          image: new URL('@/assets/team3.jpg', import.meta.url).href,
          linkedin: "https://linkedin.com/in/emilyjohnson",
          twitter: "https://twitter.com/emilyjohnson",
        },
        {
          name: "Michael Brown",
          role: "Lead Developer",
          image: new URL('@/assets/team4.jpg', import.meta.url).href,
          linkedin: "https://linkedin.com/in/michaelbrown",
          twitter: "https://twitter.com/michaelbrown",
        },
        {
          name: "Sophia Lee",
          role: "UI/UX Designer",
          image: new URL('@/assets/team5.jpg', import.meta.url).href,
          linkedin: "https://linkedin.com/in/sophialee",
          twitter: "https://twitter.com/sophialee",
        },
        {
          name: "David Kim",
          role: "Financial Analyst",
          image: new URL('@/assets/team6.jpg', import.meta.url).href,
          linkedin: "https://linkedin.com/in/davidkim",
          twitter: "https://twitter.com/davidkim",
        },
  ])

</script>

<style scoped>
/* Styles specific to the Team component */

/* Card Styling */
.card {
  border-radius: 1rem; /* Rounded corners for a polished look */
}

/* Card Title Styling */
.card-title {
  font-weight: 400; /* Make the card title bold */
}

/* Card Text Styling */
.card-text {
  font-size: 0.95rem; /* Adjust text size */
  line-height: 1.6; /* Improve readability */
}

/* Page Header Styling */
h1 {
  font-weight: 400; /* Make the main title bold */
}
</style>
