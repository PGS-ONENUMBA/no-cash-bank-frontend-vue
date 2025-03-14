<template>
  <div class="container text-center py-5 mt-5">
    <div class="card shadow-sm p-4 mx-auto" style="max-width: 500px;">
      <h2 class="text-dark">Thank You!</h2>
      <p class="lead">Your raffle journey begins...</p>

      <!-- Stage: Submitted (Verification) -->
      <div v-if="stage === 'submitted'" class="text-center">
        <div class="coin-stack">
          <div class="coin" v-for="n in 5" :key="n" :style="{ '--i': n }"></div>
        </div>
        <p>Verifying payment, please wait...</p>
      </div>

      <!-- Stage: Payment Verified (Raffle) -->
      <div v-if="stage === 'payment_verified'" class="text-center">
        <svg class="raffle-wheel" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#28a745" stroke-width="10"/>
          <circle cx="50" cy="50" r="35" fill="#fff"/>
          <path v-for="i in 8" :key="i" :d="getWheelSegment(i)" fill="#28a745"/>
        </svg>
        <p>Raffle spinning...</p>
      </div>

      <!-- Stage: Raffle Complete (Result) -->
      <div v-if="stage === 'raffle_complete'" class="text-center">
        <div v-if="result === '1'" class="result-confetti">
          <div class="confetti-piece" v-for="n in 20" :key="n" :style="{ '--i': n }"></div>
          <div class="alert alert-success mt-3">🎉 You Won! Redirecting...</div>
        </div>
        <div v-else-if="result === 'moved'" class="alert alert-info mt-3">
          Moved to a new raffle cycle! Check your dashboard...
        </div>
        <div v-else class="alert alert-warning mt-3">
          Better luck next time! Redirecting...
        </div>
      </div>

      <!-- Error State -->
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
import axios from "axios";
import gsap from "gsap";

export default {
  name: "ThankYouPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    /** @type {Ref<string>} Current stage of the raffle process */
    const stage = ref("submitted");
    /** @type {Ref<string|null>} Result of the raffle ('0', '1', 'moved') */
    const result = ref(null);
    /** @type {Ref<string|null>} Error message if something fails */
    const errorMessage = ref(null);
    /** @type {Ref<Socket|null>} Socket.IO client instance */
    const socket = ref(null);

    /** @type {string} Socket.IO server URL from environment or default */
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "https://socket.paybychance.com/";

    /**
     * Generates SVG path for raffle wheel segments.
     * @param {number} i - Segment index (1-8).
     * @returns {string} SVG path string.
     */
    const getWheelSegment = (i) => {
      const angle = (i * 45 - 22.5) * Math.PI / 180;
      const x1 = 50 + 35 * Math.cos(angle);
      const y1 = 50 + 35 * Math.sin(angle);
      const x2 = 50 + 35 * Math.cos(angle + Math.PI / 4);
      const y2 = 50 + 35 * Math.sin(angle + Math.PI / 4);
      return `M50,50 L${x1},${y1} A35,35 0 0,1 ${x2},${y2} Z`;
    };
    /**
     * Animates UI elements based on current stage.
     * @function animateStage
     */
    const animateStage = () => {
      if (stage.value === "submitted") {
        gsap.to(".coin", { rotation: 360, yoyo: true, repeat: -1, duration: 1, stagger: 0.1 });
      } else if (stage.value === "payment_verified") {
        gsap.to(".raffle-wheel", { rotation: 360, duration: 3, repeat: -1, ease: "power2.inOut" });
      } else if (stage.value === "raffle_complete" && result.value === "1") {
        gsap.to(".confetti-piece", {
          y: 150,
          x: () => Math.random() * 80 - 40,
          rotation: () => Math.random() * 360,
          duration: 2,
          stagger: 0.05,
        });
      }
    };
    /**
     * Submits the order to the backend and sets up Socket.IO for updates.
     * @async
     * @function submitOrder
     */
    const submitOrder = async () => {
      const transRef = route.query.reference;
      if (!transRef) {
        errorMessage.value = "Invalid transaction reference.";
        return;
      }

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/nocash-bank/v1/action`,
          { action_type: "submit_order", order_id: transRef, amount: "2750000" },
          { headers: { Authorization: `Basic ${btoa("webappclient:3tw5JUNoOt2C8NfK2FPxRGBL")}` } }
        );

        if (!response.data.success) {
          errorMessage.value = response.data.message || "Failed to submit order.";
          return;
        }

        // Connect to Socket.IO with custom UA
        socket.value = io(socketUrl, {
          transports: ["websocket"],
          extraHeaders: {
            "User-Agent": "PayByChanceApp/1.0 Capacitor",
          },
        });

        socket.value.on("connect", () => {
          console.log("Connected to Socket.IO");
          socket.value.emit("join_order", transRef);
          animateStage();
        });

        socket.value.on("status_update", (data) => {
          console.log("Status update:", data);
          stage.value = data.status;
          if (data.status === "raffle_complete") {
            result.value = data.raffle_win_status; // '0', '1', or 'moved'
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
      } catch (error) {
        errorMessage.value = "Error submitting order: " + error.message;
        console.error("Order submission error:", error);
      }
    };

    onMounted(submitOrder);

    onBeforeUnmount(() => {
      if (socket.value) socket.value.disconnect();
    });

    return {
      stage,
      result,
      errorMessage,
      getWheelSegment,
    };
  },
};
</script>

<style scoped>
.card {
  border-radius: 15px;
  background: #f8f9fa;
}

h2 {
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.lead {
  color: #6c757d;
}

/* Coin Stack Animation */
.coin-stack {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 20px auto;
}
.coin {
  position: absolute;
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, #FFD700 40%, #DAA520 70%);
  border-radius: 50%;
  top: calc(50% - 25px + var(--i) * 4px);
  left: calc(50% - 25px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

/* Raffle Wheel */
.raffle-wheel {
  width: 150px;
  height: 150px;
  margin: 20px auto;
}

/* Confetti */
.result-confetti {
  position: relative;
  height: 150px;
}
.confetti-piece {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #28a745;
  top: -20px;
  left: calc(50% + (var(--i) - 10) * 8px);
  transform: rotate(45deg);
}

p {
  font-size: 1.2rem;
  margin-top: 15px;
  color: #343a40;
}
</style>
