<template>
  <div class="container text-center py-5 mt-5">
    <div class="card shadow-sm p-4 mx-auto" style="max-width: 600px;">
      <h2 class="text-dark">Thank You!</h2>
      <p class="lead">We are processing your request<span class="ellipsis"></span></p>

      <!-- Progress Checklist -->
      <ul class="list-group text-start mt-4">
        <li class="list-group-item" :class="getStatusClass('submitted')">
          ✅ Payment submitted
        </li>
        <li class="list-group-item" :class="getStatusClass('payment_verified')">
          ✅ Payment verified
        </li>
        <li class="list-group-item" :class="getStatusClass('amount_matched')">
          ✅ Amount matched
        </li>
        <li class="list-group-item" :class="getStatusClass('amount_mismatch_wallet_updated')">
          ⚠️ Payment mismatch, wallet credited instead
        </li>
        <li class="list-group-item" :class="getStatusClass('raffle_queued')">
          🎲 Raffle entry confirmed
        </li>
        <li class="list-group-item" :class="getStatusClass('winner_selected')">
          🎉 You won the raffle!
        </li>
        <li class="list-group-item" :class="getStatusClass('entry_processed')">
          📨 Raffle processed. Try again next time.
        </li>
        <li class="list-group-item" :class="getStatusClass('payment_failed')">
          ❌ Payment verification failed
        </li>
      </ul>

      <!-- Current Message -->
      <div class="mt-4">
        <p class="fw-bold">Current Status: {{ stage }}</p>
        <p>{{ message }}</p>
      </div>

      <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { io } from "socket.io-client";

const route = useRoute();
const stage = ref("submitted");
const message = ref("");
const errorMessage = ref("");
const socket = ref(null);
const completedStages = ref(new Set());

const apiUrl = import.meta.env.VITE_API_BASE_URL + "/nocash-bank/v1/action";
const socketUrl = "https://socket.paybychance.com";

const reference = route.query.reference;
const terminalStages = new Set([
  "payment_failed",
  "winner_selected",
  "entry_processed"
]);

function handleStatusUpdate(data) {
  if (!data || !data.status) return;
  if (terminalStages.has(stage.value)) return;

  stage.value = data.status;
  message.value = data.message || "";
  completedStages.value.add(data.status);
  console.log("🟢 Status updated:", stage.value);
}

function getStatusClass(checkStage) {
  return completedStages.value.has(checkStage)
    ? "list-group-item-success"
    : "list-group-item-secondary";
}

function initSocket() {
  socket.value = io(socketUrl, {
    transports: ["websocket"],
    extraHeaders: { "User-Agent": "PayByChanceApp/1.0" }
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
        Authorization: auth
      },
      body: JSON.stringify({
        reference,
        action_type: "submit_order"
      })
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
</script>

<style scoped>
.card {
  border-radius: 15px;
  background: #f8f9fa;
}
h2 {
  font-weight: bold;
}
.lead {
  color: #6c757d;
}
p {
  font-size: 1.1rem;
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
</style>
