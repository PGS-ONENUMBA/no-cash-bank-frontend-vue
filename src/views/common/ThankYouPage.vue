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
        </div>

        <!-- Step 2: Amount Confirmation -->
        <div class="step d-flex align-items-center mb-3" :class="{ 'text-muted': !paymentVerified }">
          <span class="status-icon me-2">{{ amountMatched ? '✅' : paymentVerified ? '⏳' : ' ' }}</span>
          <span class="step-text">Confirming Amount</span>
        </div>

        <!-- Step 3: Wallet Crediting (if discrepancy) -->
        <div v-if="walletCredited" class="step d-flex align-items-center mb-3">
          <span class="status-icon me-2">✅</span>
          <span class="step-text">Crediting Wallet</span>
        </div>

        <div v-if="walletCredited" class="alert alert-warning mt-2 mb-3">
          Sorry, due to a payment discrepancy, you couldn’t join the raffle. Your wallet has been credited—check your balance later!
        </div>

        <!-- Step 4: Raffle Execution -->
        <div v-if="!walletCredited" class="step d-flex align-items-center mb-3" :class="{ 'text-muted': !amountMatched }">
          <span class="status-icon me-2">{{ raffleQueued ? '✅' : amountMatched ? '⏳' : ' ' }}</span>
          <span class="step-text">Running Raffle</span>
        </div>

        <!-- Step 5: Win Status -->
        <div v-if="raffleQueued" class="step d-flex align-items-center mb-3" :class="{ 'text-muted': !raffleQueued }">
          <span class="status-icon me-2">{{ winStatusChecked ? '✅' : raffleQueued ? '⏳' : ' ' }}</span>
          <span class="step-text">Win Status</span>
          <span v-if="stage === 'winner_selected'" class="ms-2">🎉 You Won!</span>
          <span v-else-if="stage === 'entry_processed'" class="ms-2">Try again next time!</span>
        </div>

        <!-- Internal states for future logic -->
        <div v-if="stage === 'moved_to_next_cycle'" class="alert alert-info mt-3">
          Moving to a new raffle cycle... (Internal state)
        </div>

        <div v-if="stage === 'cycle_moved'" class="alert alert-info mt-3">
          Raffle cycle completed. (Internal state)
        </div>

        <!-- Error messaging -->
        <div v-if="stage === 'payment_failed'" class="alert alert-danger mt-3">
          Payment verification failed: {{ message }}
        </div>

        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

/**
 * Retrieves the value of a browser cookie by name.
 * @param {string} name - Cookie name to retrieve.
 * @returns {string|null} Cookie value or null if not found.
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Creates or updates a cookie with expiration time.
 * @param {string} name - Cookie name.
 * @param {string} value - Cookie value.
 * @param {number} minutes - Time to expire in minutes.
 */
function setCookie(name, value, minutes) {
  const expires = new Date(Date.now() + minutes * 60000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

/**
 * Deletes a browser cookie by name.
 * @param {string} name - Cookie name to delete.
 */
function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

// Vue route object used to extract query parameters
const route = useRoute();

// Reference string either from query param or cookie fallback
const reference = route.query.reference || getCookie("nocash_last_ref");

// Backend API endpoints
const apiUrl = import.meta.env.VITE_API_BASE_URL + "/nocash-bank/v1/action";
const lookupUrl = import.meta.env.VITE_API_BASE_URL + "/nocash-bank/v1/check_order_status";

// State variables
const stage = ref("submitted"); // Current processing stage
const message = ref(""); // Custom message for users
const errorMessage = ref(""); // Error display binding

// Derived/computed states for UI rendering
const paymentVerified = computed(() => stage.value !== "submitted" && stage.value !== "payment_failed");
const amountMatched = computed(() => ["amount_matched", "raffle_queued", "winner_selected", "entry_processed"].includes(stage.value));
const walletCredited = computed(() => stage.value === "amount_mismatch_wallet_updated");
const raffleQueued = computed(() => ["raffle_queued", "winner_selected", "entry_processed"].includes(stage.value));
const winStatusChecked = computed(() => ["winner_selected", "entry_processed"].includes(stage.value));

/**
 * Submits the order to the backend and handles optimistic update.
 * Uses cookie to cache reference and retries via fallback if timed out.
 */
async function submitOrder() {
  if (!reference) {
    errorMessage.value = "No reference provided.";
    return;
  }

  setCookie("nocash_last_ref", reference, 15); // Temporarily store reference for fallback lookup

  try {
    const auth = `Basic ${btoa(import.meta.env.VITE_APP_USER_NAME + ":" + import.meta.env.VITE_APP_USER_PASSWORD)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Cancel if longer than 10 seconds

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
      setTimeout(lookupOrderStatus, 3000); // Wait 3s then poll order status manually
      return;
    }

    stage.value = result.status || "entry_processed";
    message.value = result.message || "";
  } catch (err) {
    errorMessage.value = "Submission error: " + (err.message || "Unknown");
    stage.value = "payment_failed";
    setTimeout(lookupOrderStatus, 3000); // Fallback check
  }
}

/**
 * Fallback order status fetcher if initial POST fails or is aborted.
 */
async function lookupOrderStatus() {
  try {
    const res = await fetch(`${lookupUrl}?reference=${encodeURIComponent(reference)}`);
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

// Kick off order submission logic
onMounted(submitOrder);

/**
 * Watches stage to clear cookie once terminal stage is reached.
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
    console.log("🧹 Cleared reference cookie after terminal state:", newStage);
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
.text-muted {
  color: #6c757d;
}
</style>
