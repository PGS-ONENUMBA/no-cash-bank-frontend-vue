<template>
  <!-- Main container with centered content and padding -->
  <div class="container text-center py-5 mt-5">
    <!-- Card for visual grouping, with shadow and padding, limited to 500px width -->
    <div class="card shadow-sm p-4 mx-auto" style="max-width: 500px;">
      <!-- Header thanking the user -->
      <h2 class="text-dark">Thank You!</h2>
      <!-- Lead text prompting the user to wait during processing -->
      <p class="lead">Please wait while we process your request...</p>

      <!-- Stage 1: 'submitted' - Displays when payment is initially submitted -->
      <!-- Shows animated coins to indicate verification in progress -->
      <div v-if="stage === 'submitted'" class="text-center">
        <!-- Container for stacked coin animation -->
        <div class="coin-stack">
          <!-- Loops 5 times to create a stack of coins, each with a unique index -->
          <div class="coin" v-for="n in 5" :key="n" :style="{ '--i': n }"></div>
        </div>
        <p>Verifying your payment...</p>
      </div>

      <!-- Stage 2: 'payment_verified' - Payment confirmed, now checking amount -->
      <!-- Shows a green spinner to indicate ongoing processing -->
      <div v-if="stage === 'payment_verified'" class="text-center">
        <!-- Bootstrap spinner for visual feedback -->
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Checking payment...</span> <!-- Accessibility text -->
        </div>
        <p>Payment verified, checking amount...</p>
      </div>

      <!-- Stage 3: 'amount_matched' - Amount matches, preparing for raffle -->
      <!-- Shows a green checkmark SVG to indicate success -->
      <div v-if="stage === 'amount_matched'" class="text-center">
        <!-- SVG for a checkmark inside a circle -->
        <svg class="check-circle" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2">
          <circle cx="12" cy="12" r="10"/> <!-- Outer circle -->
          <path d="M9 12l2 2 4-4"/> <!-- Checkmark path -->
        </svg>
        <p>Amount matches, preparing raffle...</p>
      </div>

      <!-- Stage 4: 'amount_mismatch_wallet_updated' - Terminal state, wallet credited -->
      <!-- Shows a wallet icon and warning message -->
      <div v-if="stage === 'amount_mismatch_wallet_updated'" class="text-center">
        <!-- Container for wallet SVG -->
        <div class="wallet-icon">
          <!-- SVG representing a wallet with a yellow stroke -->
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2">
            <rect x="2" y="6" width="20" height="12" rx="2"/> <!-- Wallet rectangle -->
            <path d="M18 14h4M6 10h12"/> <!-- Details inside wallet -->
          </svg>
        </div>
        <!-- Dynamic message from Socket.IO -->
        <p>{{ message }}</p>
        <!-- Alert informing user of wallet credit -->
        <div class="alert alert-warning mt-3">Wallet credited! Check your balance on the dashboard...</div>
      </div>

      <!-- Stage 5: 'raffle_queued' - Raffle processing has started -->
      <!-- Shows an animated raffle wheel -->
      <div v-if="stage === 'raffle_queued'" class="text-center">
        <!-- SVG for a spinning raffle wheel -->
        <svg class="raffle-wheel" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#28a745" stroke-width="10"/> <!-- Outer ring -->
          <circle cx="50" cy="50" r="35" fill="#fff"/> <!-- Inner white circle -->
          <!-- Dynamic segments for the wheel, 8 in total -->
          <path v-for="i in 8" :key="i" :d="getWheelSegment(i)" fill="#28a745"/>
        </svg>
        <p>Raffle spinning...</p>
      </div>

      <!-- Stage 6: 'winner_selected' - Terminal state, user won -->
      <!-- Shows confetti animation and success message -->
      <div v-if="stage === 'winner_selected'" class="text-center">
        <div class="result-confetti">
          <!-- 20 confetti pieces with random animations -->
          <div class="confetti-piece" v-for="n in 20" :key="n" :style="{ '--i': n }"></div>
          <!-- Success alert with emoji -->
          <div class="alert alert-success mt-3">🎉 You Won! Redirecting to dashboard...</div>
        </div>
      </div>

      <!-- Stage 7 & 8: 'moved_to_next_cycle' or 'cycle_moved' - Cycle transition -->
      <!-- Shows an arrow SVG and conditional messages -->
      <div v-if="stage === 'moved_to_next_cycle' || stage === 'cycle_moved'" class="text-center">
        <!-- SVG for a circular arrow indicating cycle change -->
        <svg class="cycle-arrow" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#17a2b8" stroke-width="2">
          <path d="M12 2a10 10 0 0 1 10 10h-4M12 22a10 10 0 0 1-10-10h4"/> <!-- Circular paths -->
          <path d="M22 12h-4l2-2m-6 12h4l-2 2"/> <!-- Arrowheads -->
        </svg>
        <!-- Dynamic message from Socket.IO -->
        <p>{{ message }}</p>
        <!-- Info alert for in-progress cycle move -->
        <div class="alert alert-info mt-3" v-if="stage === 'moved_to_next_cycle'">
          Moving to a new raffle cycle...
        </div>
        <!-- Info alert for completed cycle move, terminal state -->
        <div class="alert alert-info mt-3" v-else-if="stage === 'cycle_moved'">
          Moved to new cycle! Redirecting to dashboard...
        </div>
      </div>

      <!-- Error State - Displays if any error occurs -->
      <div v-if="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue"; // Vue Composition API utilities
import { useRouter, useRoute } from "vue-router"; // Router utilities for navigation and route data
import { io } from "socket.io-client"; // Socket.IO client for real-time updates
import gsap from "gsap"; // GSAP for animations

export default {
  name: "ThankYouPage", // Component name for debugging and clarity

  setup() {
    // Reactive variables using ref
    const route = useRoute(); // Access current route (e.g., query params)
    const router = useRouter(); // Router instance for navigation
    const stage = ref("submitted"); // Tracks current processing stage, starts at 'submitted'
    const message = ref(""); // Dynamic message from Socket.IO
    const errorMessage = ref(null); // Error message if something fails
    const socket = ref(null); // Socket.IO instance, initially null

    // Configuration constants
    const socketUrl = "https://socket.paybychance.com"; // Socket.IO server URL (mapped to 64.225.94.21:5000)
    const apiUrl = import.meta.env.VITE_API_BASE_URL + "/nocash-bank/v1/action"; // API endpoint for submitting orders

    // Function to generate SVG path for raffle wheel segments
    // Creates 8 triangular segments for the spinning wheel effect
    const getWheelSegment = (i) => {
      const angle = (i * 45 - 22.5) * Math.PI / 180; // Calculate starting angle for each segment (45° apart)
      const x1 = 50 + 35 * Math.cos(angle); // X-coordinate of first point on inner circle
      const y1 = 50 + 35 * Math.sin(angle); // Y-coordinate of first point
      const x2 = 50 + 35 * Math.cos(angle + Math.PI / 4); // X-coordinate of second point (45° arc)
      const y2 = 50 + 35 * Math.sin(angle + Math.PI / 4); // Y-coordinate of second point
      // SVG path: Move to center, line to first point, arc to second, close back to center
      return `M50,50 L${x1},${y1} A35,35 0 0,1 ${x2},${y2} Z`;
    };

    // Animation logic for different stages using GSAP
    const animateStage = () => {
      // Stage 1: Animate coins spinning for 'submitted'
      if (stage.value === "submitted") {
        gsap.to(".coin", {
          rotation: 360, // Full rotation
          yoyo: true, // Reverse animation
          repeat: -1, // Infinite loop
          duration: 1, // 1 second per cycle
          stagger: 0.1 // Stagger each coin by 0.1s
        });
      }
      // Stage 5: Spin the raffle wheel for 'raffle_queued'
      else if (stage.value === "raffle_queued") {
        gsap.to(".raffle-wheel", {
          rotation: 360, // Continuous spin
          duration: 3, // 3 seconds per rotation
          repeat: -1, // Infinite
          ease: "power2.inOut" // Smooth easing
        });
      }
      // Stage 6: Scatter confetti for 'winner_selected'
      else if (stage.value === "winner_selected") {
        gsap.to(".confetti-piece", {
          y: 100, // Fall 100px
          x: () => Math.random() * 100 - 50, // Random horizontal spread
          rotation: () => Math.random() * 360, // Random rotation
          duration: 2, // 2 seconds
          stagger: 0.05 // Stagger each piece
        });
      }
    };

    // Main function to submit order and listen for updates
    const submitOrder = async () => {
      // Extract transaction reference from URL query (e.g., ?reference=0764d62b5db5bcc9)
      const transRef = route.query.reference;
      console.log("Transaction reference:", transRef);
      if (!transRef) {
        errorMessage.value = "Invalid transaction reference.";
        return; // Exit if no reference
      }

      // Validate API URL
      if (!apiUrl) {
        errorMessage.value = "API URL is not configured.";
        return;
      }

      // Validate Socket.IO URL
      if (!socketUrl) {
        errorMessage.value = "Socket server URL is not configured.";
        return;
      }

      // Fetch authentication credentials from environment variables
      const username = import.meta.env.VITE_APP_USER_NAME;
      const password = import.meta.env.VITE_APP_USER_PASSWORD;
      if (!username || !password) {
        errorMessage.value = "Authentication credentials are missing.";
        return; // Exit if credentials missing
      }

      // Step 1: Submit order to API
      // Create Basic Auth header for API request
      const authString = `${username}:${password}`;
      const base64Auth = btoa(authString); // Encode to Base64
      const authHeader = `Basic ${base64Auth}`;
      console.log("Authorization Header:", authHeader); // Debug log

      try {
        // POST request to submit-order endpoint
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader // Basic Auth header
          },
          body: JSON.stringify({
            reference: transRef, // Transaction thanks to URL query
            action_type: 'submit_order' // Action to queue order
          })
        });

        const result = await response.json();
        if (!result.success) {
          errorMessage.value = result.message || "Failed to queue order for verification.";
          return; // Exit if API fails
        }
        console.log("API response:", result); // Log success
      } catch (err) {
        errorMessage.value = "API request failed: " + err.message;
        console.error("API error:", err);
        return; // Exit on network or parsing error
      }

      // Step 2: Connect to Socket.IO for real-time updates
      socket.value = io(socketUrl, {
        transports: ["websocket"], // Force WebSocket transport
        extraHeaders: { "User-Agent": "PayByChanceApp/1.0 Capacitor" } // Custom header
      });

      // Start initial animation for 'submitted' stage
      animateStage();

      // Socket.IO event: On successful connection
      socket.value.on("connect", () => {
        console.log("Connected to Socket.IO");
        socket.value.emit("join_order", transRef); // Join room for this order
      });

      // Socket.IO event: Receive status updates from server
      socket.value.on("status_update", (data) => {
        console.log("Status update:", data);
        stage.value = data.status; // Update stage
        message.value = data.message || ""; // Update message

        // Redirect to dashboard for terminal states after 4 seconds
        if (["amount_mismatch_wallet_updated", "winner_selected", "cycle_moved"].includes(data.status)) {
          setTimeout(() => router.push("/dashboard"), 4000);
        }

        // Trigger animations for new stage
        animateStage();
      });

      // Socket.IO event: Handle connection errors
      socket.value.on("connect_error", (err) => {
        errorMessage.value = "Connection error: " + err.message;
        console.error("Socket.IO connect error:", err);
      });

      // Socket.IO event: Handle server errors
      socket.value.on("error", (err) => {
        errorMessage.value = "Socket error: " + err.message;
        console.error("Socket.IO error:", err);
      });

      // Timeout: Fail if stuck on 'submitted' for 30 seconds
      setTimeout(() => {
        if (stage.value === "submitted") {
          errorMessage.value = "Verification timed out. Please try again later.";
          socket.value.disconnect();
        }
      }, 30000);
    };

    // Lifecycle hook: Run submitOrder when component mounts
    onMounted(submitOrder);

    // Lifecycle hook: Disconnect Socket.IO when component unmounts
    onBeforeUnmount(() => {
      if (socket.value) socket.value.disconnect();
    });

    // Return reactive variables and functions to template
    return { stage, message, errorMessage, getWheelSegment };
  },
};
</script>

<style scoped>
/* Card styling: Rounded corners and light gray background */
.card { border-radius: 15px; background: #f8f9fa; }

/* Header: Bold with subtle shadow */
h2 { font-weight: bold; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }

/* Lead text: Gray color for secondary emphasis */
.lead { color: #6c757d; }

/* Coin stack container: Centered, fixed size for animation */
.coin-stack { position: relative; width: 100px; height: 100px; margin: 20px auto; }

/* Coin styling: Gold gradient, circular, stacked with shadow */
.coin {
  position: absolute; width: 50px; height: 50px;
  background: radial-gradient(circle, #FFD700 40%, #DAA520 70%);
  border-radius: 50%; top: calc(50% - 25px + var(--i) * 6px); left: calc(50% - 25px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* Raffle wheel: Larger size for visibility */
.raffle-wheel { width: 150px; height: 150px; margin: 20px auto; }

/* Centered SVGs for checkmark, wallet, and cycle arrow */
.check-circle, .wallet-icon { margin: 20px auto; }
.cycle-arrow { margin: 20px auto; }

/* Confetti container: Fixed height for animation space */
.result-confetti { position: relative; height: 150px; }

/* Confetti pieces: Small green squares with random positioning */
.confetti-piece {
  position: absolute; width: 8px; height: 8px; background: #28a745;
  top: -20px; left: calc(50% + (var(--i) - 10) * 8px); transform: rotate(45deg);
}

/* Paragraphs: Larger font, dark color, spaced from icons */
p { font-size: 1.2rem; margin-top: 15px; color: #343a40; }
</style>
