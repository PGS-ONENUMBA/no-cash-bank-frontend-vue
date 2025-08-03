<template>
  <div class="container text-center py-5 mt-5">
    <div class="card shadow-sm p-4 mx-auto" style="max-width: 600px;">
      <h2 class="text-dark">Thank You!</h2>
      <p class="lead">We’re processing your request—please wait.</p>

      <!-- 🟢 Animated Progress Bar -->
      <transition name="fade" mode="out-in">
        <div class="progress my-4" style="height: 20px;" :key="stage">
          <div
            class="progress-bar"
            role="progressbar"
            :class="progressBarClass"
            :style="{ width: progressValue }"
          >
            {{ progressBarText }}
          </div>
        </div>
      </transition>

      <!-- 📨 Contextual Alert Messages -->
      <div v-if="stage === 'amount_mismatch_wallet_updated'" class="alert alert-warning mt-3">
        Sorry, due to a payment discrepancy, you couldn’t join the raffle. Your wallet has been credited—check your balance later!
      </div>
      <div v-if="stage === 'winner_selected'" class="alert alert-success mt-3">
        🎉 Congratulations! You won the raffle!
      </div>
      <div v-if="stage === 'entry_processed'" class="alert alert-info mt-3">
        Try again next time. Your entry was processed.
      </div>
      <div v-if="stage === 'payment_failed'" class="alert alert-danger mt-3">
        Payment verification failed: {{ message }}
      </div>
      <div v-if="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

/**
 * Retrieves the value of a named cookie from the browser.
 * @param {string} name - The cookie name.
 * @returns {string|null} - The cookie value or null if not found.
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Sets a browser cookie with the specified expiration in minutes.
 * @param {string} name - Cookie name.
 * @param {string} value - Cookie value.
 * @param {number} minutes - Expiration time in minutes.
 */
function setCookie(name, value, minutes) {
  const expires = new Date(Date.now() + minutes * 60000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

/**
 * Deletes a cookie by name.
 * @param {string} name - Cookie name to delete.
 */
function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

// ⛳ Retrieve route object to access query parameters
const route = useRoute();

// 🧾 Reference ID from query or fallback cookie
const reference = route.query.reference || getCookie("nocash_last_ref");

// 🔗 Backend API base URLs
const apiUrl = import.meta.env.VITE_API_BASE_URL + "/nocash-bank/v1/action";
const lookupUrl = import.meta.env.VITE_API_BASE_URL + "/nocash-bank/v1/action";

// 🎛️ App state: tracks process stage, messages, and errors
const stage = ref("submitted");
const message = ref("");
const errorMessage = ref("");

/**
 * Dynamically returns the progress bar color class based on current stage.
 */
const progressBarClass = computed(() => {
  if (stage.value === "winner_selected") return "bg-success";
  if (["entry_processed", "amount_mismatch_wallet_updated"].includes(stage.value)) return "bg-warning text-dark";
  if (stage.value === "payment_failed") return "bg-danger";
  return "bg-info progress-bar-striped progress-bar-animated";
});

/**
 * Provides progress label text depending on the current processing state.
 */
const progressBarText = computed(() => {
  if (stage.value === "winner_selected") return "You Won!";
  if (stage.value === "entry_processed") return "Raffle Completed";
  if (stage.value === "amount_mismatch_wallet_updated") return "Wallet Credited";
  if (stage.value === "payment_failed") return "Error Processing Payment";
  return "Processing...";
});

/**
 * Defines progress bar width percentage for animation.
 */
const progressValue = computed(() => {
  if (stage.value === "winner_selected") return "100%";
  if (stage.value === "entry_processed") return "95%";
  if (stage.value === "amount_mismatch_wallet_updated") return "90%";
  if (stage.value === "payment_failed") return "100%";
  return "70%"; // initial processing
});

/**
 * Main API trigger to submit order reference to backend.
 * Handles timeout and fallback if initial request fails.
 */
async function submitOrder() {
  if (!reference) {
    errorMessage.value = "No reference provided.";
    return;
  }

  setCookie("nocash_last_ref", reference, 15); // save ref for later use

  try {
    const auth = `Basic ${btoa(import.meta.env.VITE_APP_USER_NAME + ":" + import.meta.env.VITE_APP_USER_PASSWORD)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      signal: controller.signal,
      body: JSON.stringify({
        reference,
        action_type: "submit_order",
      }),
    });

    clearTimeout(timeoutId);
    const result = await res.json();

    if (!result.success) {
      errorMessage.value = result.message || "Submission failed.";
      stage.value = "payment_failed";
      setTimeout(lookupOrderStatus, 3000); // fallback retry
      return;
    }

    stage.value = result.status || "entry_processed";
    message.value = result.message || "";
  } catch (err) {
    errorMessage.value = "Submission error: " + (err.message || "Unknown");
    stage.value = "payment_failed";
    setTimeout(lookupOrderStatus, 3000); // fallback retry
  }
}

/**
 * Manual lookup fallback to check the status of the order.
 * Called after failed/aborted submission.
 */
async function lookupOrderStatus() {
  try {
    const res = await fetch(`${lookupUrl}?action_type=check_order_status&reference=${encodeURIComponent(reference)}`);
    const data = await res.json();

    if (data.success) {
      stage.value = data.status || "entry_processed";
      message.value = "Order status updated via lookup.";
    } else {
      errorMessage.value = data.message || "Could not retrieve order status.";
    }
  } catch (err) {
    errorMessage.value = "Status check failed: " + err.message;
  }
}

// 🚀 Trigger submission when component mounts
onMounted(submitOrder);

/**
 * 👀 Watch for completion stages and clear saved reference cookie.
 */
watch(stage, (newStage) => {
  const terminalStages = new Set([
    "winner_selected",
    "entry_processed",
    "amount_mismatch_wallet_updated",
    "payment_failed"
  ]);

  if (terminalStages.has(newStage)) {
    deleteCookie("nocash_last_ref");
    console.log("Cleared reference cookie after terminal state:", newStage);
  }
});
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
.progress-bar {
  font-weight: 600;
  transition: all 0.8s ease-in-out;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
