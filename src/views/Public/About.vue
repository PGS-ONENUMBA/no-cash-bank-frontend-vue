<template>
    <div>
      <!-- About Page Content -->
      <main class="container py-5 mt-5">
        <!-- Page Header -->
        <h1 class="text-center mb-5">
          <i class="bi bi-info-circle me-2"></i> About Us
        </h1>
        <p class="text-muted fs-5 text-center mb-5">
          Learn more about our mission, vision, and the values that drive us forward.
        </p>
  
        <!-- Mission and Vision Section -->
        <div class="row row-cols-1 row-cols-md-2 g-4 mb-5">
          <!-- Mission Card -->
          <div class="col">
            <div class="card h-100">
              <div class="card-header bg-light text-center">
                <h3 class="card-title mb-0">Our Mission</h3>
              </div>
              <img
                src="@/assets/mission.jpg"
                class="card-img-top rounded-top"
                alt="Our Mission"
              />
              <div class="card-body d-flex flex-column">
                <p class="card-text flex-grow-1">
                  At No-Cash-Bank, our mission is to redefine banking by introducing a 
                  revolutionary no-cash platform that fosters financial inclusivity for everyone. 
                  We aim to make financial services accessible, secure, and innovative.
                </p>
              </div>
            </div>
          </div>
  
          <!-- Vision Card -->
          <div class="col">
            <div class="card h-100">
              <div class="card-header bg-light text-center">
                <h3 class="card-title mb-0">Our Vision</h3>
              </div>
              <img
                src="@/assets/vision.jpg"
                class="card-img-top rounded-top"
                alt="Our Vision"
              />
              <div class="card-body d-flex flex-column">
                <p class="card-text flex-grow-1">
                  We envision a world where banking goes beyond cash, providing equal 
                  opportunities for individuals and businesses to thrive in the digital economy.
                </p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Core Values Section -->
        <section>
          <h2 class="text-center mb-4">Our Core Values</h2>
          <div class="row g-4">
            <!-- Security Card -->
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-header bg-light text-center">
                  <i class="bi bi-shield-lock-fill text-green icon-large"></i>
                  <h4 class="card-title mb-0">Security</h4>
                </div>
                <div class="card-body text-center">
                  <p class="mt-3">
                    We prioritize the safety and privacy of our users' financial information with 
                    state-of-the-art encryption and security protocols.
                  </p>
                </div>
              </div>
            </div>
  
            <!-- Innovation Card -->
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-header bg-light text-center">
                  <i class="bi bi-lightning-fill text-orange icon-large"></i>
                  <h4 class="card-title mb-0">Innovation</h4>
                </div>
                <div class="card-body text-center">
                  <p class="mt-3">
                    We constantly strive to develop cutting-edge solutions to simplify banking 
                    and empower users worldwide.
                  </p>
                </div>
              </div>
            </div>
  
            <!-- Inclusivity Card -->
            <div class="col-md-4">
              <div class="card h-100">
                <div class="card-header bg-light text-center">
                    <i class="bi bi-people-fill text-green icon-large"></i>
                  <h4 class="card-title mb-0">Inclusivity</h4>
                </div>
                <div class="card-body text-center">
                  <p class="mt-3">
                    Our platform is designed to cater to the needs of everyone, fostering 
                    financial inclusion for underserved communities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </template>
  
  <script>
  export default {
    name: "About", // Component name
  };
  </script>
  
  <style scoped>
  /* General Styles */
  body {
    font-family: 'Public Sans', sans-serif;
  }
  
  /* Card Styles */
  .card {
    border-radius: 1rem; /* Rounded corners for a polished look */
  }
  
  .card-title {
    font-weight: 400; /* Medium font weight for titles */
  }
  
  .card-text {
    font-size: 0.95rem; /* Smaller font size for better readability */
    line-height: 1.6; /* Increased line height for readability */
  }
  
  /* Page Header Styling */
  h1,
  h2 {
    font-weight: 400; /* Medium font weight for headers */
  }
  
  /* Icon Styling */
  .icon-large {
    font-size: 3rem; /* Large icons for emphasis */
  }
  
  .text-green {
    color: #723ba2; /* Green color for icons and accents */
  }
  
  .text-orange {
    color: #ff6f00; /* Orange color for icons and accents */
  }
  </style>
  