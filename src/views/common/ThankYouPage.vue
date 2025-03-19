<template>
  <div class="container text-center py-5 mt-5">
    <div class="card shadow-sm p-4 mx-auto" style="max-width: 500px;">
      <h2 class="text-dark">Thank You!</h2>
      <p class="lead">Please wait while we process your request...</p>

      <!-- Stage 1: Submitted - Initial payment verification -->
      <div v-if="stage === 'submitted'" class="text-center">
        <div class="coin-stack">
          <div class="coin" v-for="n in 5" :key="n" :style="{ '--i': n }"></div>
        </div>
        <p>Verifying your payment...</p>
      </div>

      <!-- Stage 2: Payment Verified - Payment confirmed, checking amount -->
      <div v-if="stage === 'payment_verified'" class="text-center">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Checking payment...</span>
        </div>
        <p>Payment verified, checking amount...</p>
      </div>

      <!-- Stage 3: Amount Matched - Amount matches, raffle next -->
      <div v-if="stage === 'amount_matched'" class="text-center">
        <svg class="check-circle" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
        <p>Amount matches, preparing raffle...</p>
      </div>

      <!-- Stage 4: Amount Mismatch - Wallet credited, terminal state -->
      <div v-if="stage === 'amount_mismatch_wallet_updated'" class="text-center">
        <div class="wallet-icon">
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2">
            <rect x="2" y="6" width="20" height="12" rx="2"/>
            <path d="M18 14h4M6 10h12"/>
          </svg>
        </div>
        <p>{{ message }}</p>
        <div class="alert alert-warning mt-3">Wallet credited! Check your balance on the dashboard...</div>
      </div>

      <!-- Stage 5: Raffle Queued - Raffle processing started -->
      <div v-if="stage === 'raffle_queued'" class="text-center">
        <svg class="raffle-wheel" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#28a745" stroke-width="10"/>
          <circle cx="50" cy="50" r="35" fill="#fff"/>
          <path v-for="i in 8" :key="i" :d="getWheelSegment(i)" fill="#28a745"/>
        </svg>
        <p>Raffle spinning...</p>
      </div>

      <!-- Stage 6: Winner Selected - User won, terminal state -->
      <div v-if="stage === 'winner_selected'" class="text-center">
        <div class="result-confetti">
          <div class="confetti-piece" v-for="n in 20" :key="n" :style="{ '--i': n }"></div>
          <div class="alert alert-success mt-3">🎉 You Won! Redirecting to dashboard...</div>
        </div>
      </div>

      <!-- Stage 7 & 8: Moved to Next Cycle - Cycle transition, conditional -->
      <div v-if="stage === 'moved_to_next_cycle' || stage === 'cycle_moved'" class="text-center">
        <svg class="cycle-arrow" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#17a2b8" stroke-width="2">
          <path d="M12 2a10 10 0 0 1 10 10h-4M12 22a10 10 0 0 1-10-10h4"/>
          <path d="M22 12h-4l2-2m-6 12h4l-2 2"/>
        </svg>
        <p>{{ message }}</p>
        <div class="alert alert-info mt-3" v-if="stage === 'moved_to_next_cycle'">
          Moving to a new raffle cycle...
        </div>
        <div class="alert alert-info mt-3" v-else-if="stage === 'cycle_moved'">
          Moved to new cycle! Redirecting to dashboard...
        </div>
      </div>

      <!-- Error State - Fallback for failures -->
      <div v-if="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { io } from "socket.io-client";
import gsap from "gsap";

export default {
  name: "ThankYouPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const stage = ref("submitted");
    const message = ref("");
    const errorMessage = ref(null);
    const socket = ref(null);

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "https://socket.paybychance.com:5000";
    const apiUrl = import.meta.env.VITE_API_BASE_URL+"/nocash-bank/v1/action";

    const getWheelSegment = (i) => {
      const angle = (i * 45 - 22.5) * Math.PI / 180;
      const x1 = 50 + 35 * Math.cos(angle);
      const y1 = 50 + 35 * Math.sin(angle);
      const x2 = 50 + 35 * Math.cos(angle + Math.PI / 4);
      const y2 = 50 + 35 * Math.sin(angle + Math.PI / 4);
      return `M50,50 L${x1},${y1} A35,35 0 0,1 ${x2},${y2} Z`;
    };

    const animateStage = () => {
      if (stage.value === "submitted") {
        gsap.to(".coin", { rotation: 360, yoyo: true, repeat: -1, duration: 1, stagger: 0.1 });
      } else if (stage.value === "raffle_queued") {
        gsap.to(".raffle-wheel", { rotation: 360, duration: 3, repeat: -1, ease: "power2.inOut" });
      } else if (stage.value === "winner_selected") {
        gsap.to(".confetti-piece", {
          y: 100,
          x: () => Math.random() * 100 - 50,
          rotation: () => Math.random() * 360,
          duration: 2,
          stagger: 0.05,
        });
      }
    };

    // Post to API and setup Socket.IO listener
    const submitOrder = async () => {
      // Get reference from query param (e.g., ?reference=test4242)
      const transRef = route.query.reference;
      console.log("Transaction reference:", transRef);
      if (!transRef) {
        errorMessage.value = "Invalid transaction reference.";
        return;
      }

      if (!apiUrl) {
        errorMessage.value = "API URL is not configured.";
        return;
      }

      if (!socketUrl) {
        errorMessage.value = "Socket server URL is not configured.";
        return;
      }

      // Step 1: Post to submit-order API to queue the order
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: transRef })
        });
        const result = await response.json();

        if (!result.success) {
          errorMessage.value = result.message || "Failed to queue order for verification.";
          return;
        }
        console.log("API response:", result);
      } catch (err) {
        errorMessage.value = "API request failed: " + err.message;
        console.error("API error:", err);
        return;
      }

      // Step 2: Connect to Socket.IO after successful API call
      socket.value = io(socketUrl, {
        transports: ["websocket"],
        extraHeaders: { "User-Agent": "PayByChanceApp/1.0 Capacitor" },
      });

      // Start animation for submitted stage
      animateStage();

      socket.value.on("connect", () => {
        console.log("Connected to Socket.IO");
        socket.value.emit("join_order", transRef);
      });

      socket.value.on("status_update", (data) => {
        console.log("Status update:", data);
        stage.value = data.status;
        message.value = data.message || "";

        if (["amount_mismatch_wallet_updated", "winner_selected", "cycle_moved"].includes(data.status)) {
          setTimeout(() => router.push("/dashboard"), 4000);
        }

        animateStage();
      });

      socket.value.on("connect_error", (err) => {
        errorMessage.value = "Connection error: " + err.message;
        console.error("Socket.IO connect error:", err);
      });

      socket.value.on("error", (err) => {
        errorMessage.value = "Socket error: " + err.message;
        console.error("Socket.IO error:", err);
      });

      setTimeout(() => {
        if (stage.value === "submitted") {
          errorMessage.value = "Verification timed out. Please try again later.";
          socket.value.disconnect();
        }
      }, 10000);
    };

    onMounted(submitOrder);
    onBeforeUnmount(() => {
      if (socket.value) socket.value.disconnect();
    });

    return { stage, message, errorMessage, getWheelSegment };
  },
};
</script>

<style scoped>
.card { border-radius: 15px; background: #f8f9fa; }
h2 { font-weight: bold; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
.lead { color: #6c757d; }
.coin-stack { position: relative; width: 100px; height: 100px; margin: 20px auto; }
.coin {
  position: absolute; width: 50px; height: 50px;
  background: radial-gradient(circle, #FFD700 40%, #DAA520 70%);
  border-radius: 50%; top: calc(50% - 25px + var(--i) * 6px); left: calc(50% - 25px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}
.raffle-wheel { width: 150px; height: 150px; margin: 20px auto; }
.check-circle, .wallet-icon { margin: 20px auto; }
.cycle-arrow { margin: 20px auto; }
.result-confetti { position: relative; height: 150px; }
.confetti-piece {
  position: absolute; width: 8px; height: 8px; background: #28a745;
  top: -20px; left: calc(50% + (var(--i) - 10) * 8px); transform: rotate(45deg);
}
p { font-size: 1.2rem; margin-top: 15px; color: #343a40; }
</style>
