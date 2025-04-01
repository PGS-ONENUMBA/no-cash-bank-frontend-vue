<template>
  <div class="container text-center py-5 mt-5">
    <div class="card shadow-sm p-4 mx-auto" style="max-width: 600px;">
      <h2 class="text-dark">Thank You!</h2>
      <p class="lead">We’re processing your request—here’s the progress:</p>

      <div class="stage-display mt-4">
        <!-- Step 1: Payment Verification -->
        <div class="step d-flex align-items-center mb-3">
          <span class="status-icon me-2">{{ paymentVerified ? '✅' : '⏳' }}</span>
          <span class="step-text">Payment Verification</span>
          <span v-if="stage === 'submitted'" class="ms-2 ellipsis"></span>
        </div>

        <!-- Step 2: Checking Amount -->
        <div class="step d-flex align-items-center mb-3" :class="{ 'text-muted': !paymentVerified }">
          <span class="status-icon me-2">{{ amountMatched ? '✅' : paymentVerified ? '⏳' : ' ' }}</span>
          <span class="step-text">Confirming Amount</span>
          <span v-if="stage === 'payment_verified'" class="ms-2 ellipsis"></span>
        </div>

        <!-- Step 3: Crediting Wallet (only if discrepancy) -->
        <div v-if="walletCredited" class="step d-flex align-items-center mb-3">
          <span class="status-icon me-2">{{ walletCredited ? '✅' : '⏳' }}</span>
          <span class="step-text">Crediting Wallet</span>
          <span v-if="stage === 'amount_mismatch_wallet_updated'" class="ms-2 ellipsis"></span>
        </div>

        <!-- Step 4: Discrepancy Message (if wallet credited) -->
        <div v-if="walletCredited" class="alert alert-warning mt-2 mb-3">
          Sorry, due to a payment discrepancy, you couldn’t join the raffle. Your wallet has been credited—check your balance later!
        </div>

        <!-- Step 5: Running Raffle (only if no discrepancy) -->
        <div v-if="!walletCredited" class="step d-flex align-items-center mb-3" :class="{ 'text-muted': !amountMatched }">
          <span class="status-icon me-2">{{ raffleQueued ? '✅' : amountMatched ? '⏳' : ' ' }}</span>
          <span class="step-text">Running Raffle</span>
          <span v-if="stage === 'raffle_queued'" class="ms-2 ellipsis"></span>
        </div>

        <!-- Step 6: Win Status (only if raffle ran) -->
        <div v-if="raffleQueued" class="step d-flex align-items-center mb-3" :class="{ 'text-muted': !raffleQueued }">
          <span class="status-icon me-2">{{ winStatusChecked ? '✅' : raffleQueued ? '⏳' : ' ' }}</span>
          <span class="step-text">Win Status</span>
          <span v-if="stage === 'entry_processed' || stage === 'winner_selected'" class="ms-2">
            {{ winnerSelected ? '🎉 You Won!' : 'Try again next time!' }}
          </span>
        </div>

        <!-- Internal States (placeholders) -->
        <div v-if="stage === 'moved_to_next_cycle'" class="alert alert-info mt-3">
          Moving to a new raffle cycle... (Internal state)
        </div>
        <div v-if="stage === 'cycle_moved'" class="alert alert-info mt-3">
          Raffle cycle completed. (Internal state)
        </div>

        <!-- Failure State -->
        <div v-if="stage === 'payment_failed'" class="alert alert-danger mt-3">
          Payment verification failed: {{ message }}
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { io } from "socket.io-client";

const route = useRoute();
const stage = ref("submitted");
const message = ref("");
const errorMessage = ref("");
const socket = ref(null);

const apiUrl = import.meta.env.VITE_API_BASE_URL + "/nocash-bank/v1/action";
const socketUrl = "https://socket.paybychance.com";
const reference = route.query.reference;

// Derived states for step completion
const paymentVerified = computed(() => stage.value !== "submitted" && stage.value !== "payment_failed");
const amountMatched = computed(() => ["amount_matched", "raffle_queued", "winner_selected", "entry_processed"].includes(stage.value));
const walletCredited = computed(() => stage.value === "amount_mismatch_wallet_updated");
const raffleQueued = computed(() => ["raffle_queued", "winner_selected", "entry_processed"].includes(stage.value));
const winStatusChecked = computed(() => ["winner_selected", "entry_processed"].includes(stage.value));
const winnerSelected = computed(() => stage.value === "winner_selected");

// Terminal states to freeze updates
const terminalStages = new Set(["payment_failed", "winner_selected", "entry_processed", "amount_mismatch_wallet_updated"]);

/**
 * Handles real-time status updates from the socket
 * @param {object} data - Incoming message from server
 */
function handleStatusUpdate(data) {
  if (!data || !data.status) return;
  if (terminalStages.has(stage.value)) return; // Freeze on terminal states

  stage.value = data.status;
  message.value = data.message || "";
  console.log("🟢 Status updated:", stage.value);
}

/**
 * Initializes the socket connection and joins the reference room
 */
function initSocket() {
  socket.value = io(socketUrl, {
    transports: ["websocket"],
    extraHeaders: { "User-Agent": "PayByChanceApp/1.0" },
  });

  socket.value.on("connect", () => {
    console.log("✅ Connected to socket");
    socket.value.emit("join_order", reference);
  });

  socket.value.on("status_update", handleStatusUpdate);

  socket.value.on("connect_error", (err) => {
    errorMessage.value = "Socket connection failed: " + err.message;
  });

  socket.value.on("disconnect", () => {
    console.log("🔌 Socket disconnected");
  });
}

/**
 * Submits the order to the backend API
 */
async function submitOrder() {
  if (!reference) {
    errorMessage.value = "No reference provided in the URL.";
    return;
  }

  try {
    const auth = `Basic ${btoa(import.meta.env.VITE_APP_USER_NAME + ":" + import.meta.env.VITE_APP_USER_PASSWORD)}`;
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify({
        reference,
        action_type: "submit_order",
      }),
    });

    const result = await res.json();
    if (!result.success) {
      errorMessage.value = result.message || "Failed to submit order.";
      return;
    }

    console.log("📤 Order submitted, now connecting to socket...");
    initSocket();

    setTimeout(() => {
      if (stage.value === "submitted") {
        errorMessage.value = "Verification timed out. Please try again.";
        socket.value?.disconnect();
      }
    }, 30000);
  } catch (err) {
    errorMessage.value = "API request failed: " + err.message;
  }
}

onMounted(submitOrder);
onBeforeUnmount(() => socket.value?.disconnect());
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
.stage-display {
  text-align: left;
}
.step {
  font-size: 1.1rem;
}
.step-text {
  flex-grow: 1;
}
.status-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}
.ellipsis {
  display: inline-block;
}
.ellipsis::after {
  content: "...";
  animation: dots 1.5s steps(3, end) infinite;
}
@keyframes dots {
  0% { content: ""; }
  33% { content: "."; }
  66% { content: ".."; }
  100% { content: "..."; }
}
.text-muted {
  color: #6c757d;
}
</style>
