<template>
  <div class="container text-center py-5 mt-5">
    <div class="card shadow-sm p-4 mx-auto" style="max-width: 600px;">
      <h2 class="text-dark">
        {{ stage === 'verifying' ? 'Thank You!' : resultTitle }}
      </h2>
      <p class="lead">
        {{ stage === 'verifying' ? 'We’re processing your request—please wait.' : resultSubtitle }}
      </p>

      <!-- 🟢 Animated Progress Bar -->
      <transition name="fade" mode="out-in">
        <div
          v-if="stage === 'verifying'"
          class="progress my-4"
          style="height: 20px;"
          :key="stage"
        >
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

// 🔧 Cookie utilities
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, minutes) {
  const expires = new Date(Date.now() + minutes * 60000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

const route = useRoute();
const reference = route.query.reference || getCookie("nocash_last_ref");
const apiUrl = import.meta.env.VITE_API_BASE_URL + "/nocash-bank/v1/action";

// 🚦 State management
const stage = ref("verifying");
const message = ref("");
const errorMessage = ref("");

// 🎨 UI Computed Props
const progressBarClass = computed(() => {
  if (stage.value === "winner_selected") return "bg-success";
  if (["entry_processed", "amount_mismatch_wallet_updated"].includes(stage.value)) return "bg-warning text-dark";
  if (stage.value === "payment_failed") return "bg-danger";
  return "bg-info progress-bar-striped progress-bar-animated";
});

const progressBarText = computed(() => {
  if (stage.value === "winner_selected") return "You Won!";
  if (stage.value === "entry_processed") return "Raffle Completed";
  if (stage.value === "amount_mismatch_wallet_updated") return "Wallet Credited";
  if (stage.value === "payment_failed") return "Error Processing Payment";
  return "Verifying Payment...";
});

const progressValue = computed(() => {
  if (stage.value === "winner_selected") return "100%";
  if (stage.value === "entry_processed") return "95%";
  if (stage.value === "amount_mismatch_wallet_updated") return "90%";
  if (stage.value === "payment_failed") return "100%";
  return "70%";
});

const resultTitle = computed(() => {
  if (stage.value === 'winner_selected') return 'Congratulations!';
  if (stage.value === 'entry_processed') return 'Better Luck Next Time!';
  if (stage.value === 'amount_mismatch_wallet_updated') return 'Wallet Credited';
  if (stage.value === 'payment_failed') return 'Payment Failed';
  return 'Thank You!';
});

const resultSubtitle = computed(() => {
  if (stage.value === 'winner_selected') return 'You won the raffle!';
  if (stage.value === 'entry_processed') return 'Your entry was processed successfully.';
  if (stage.value === 'amount_mismatch_wallet_updated') return 'We returned your funds.';
  if (stage.value === 'payment_failed') return message.value || 'Verification failed.';
  return 'We’re processing your request—please wait.';
});

// 📨 Submit initial order to backend
async function submitOrder() {
  if (!reference) {
    errorMessage.value = "No reference provided.";
    return;
  }

  setCookie("nocash_last_ref", reference, 15);

  try {
    const auth = `Basic ${btoa(import.meta.env.VITE_APP_USER_NAME + ":" + import.meta.env.VITE_APP_USER_PASSWORD)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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
      if (result.message === 'Duplicate order') {
        await lookupOrderStatus();
        return;
      }
      stage.value = result.status || "payment_failed";
      errorMessage.value = result.message || "Submission failed.";
      message.value = result.message || "";
      return;
    }

    stage.value = result.status || "entry_processed";
    message.value = result.message || "";
  } catch (err) {
    errorMessage.value = "Submission error: " + (err.message || "Unknown");
    stage.value = "payment_failed";
    setTimeout(lookupOrderStatus, 3000);
  }
}

// 🔎 Fallback lookup if duplicate or timeout occurs
async function lookupOrderStatus() {
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
        action_type: "check_order_status",
      }),
    });

    const data = await res.json();

    if (data.success) {
      stage.value = data.status || "entry_processed";
      message.value = data.message || "";
    } else {
      stage.value = data.status || "payment_failed";
      errorMessage.value = data.message || "Could not retrieve order status.";
    }
  } catch (err) {
    errorMessage.value = "Status check failed: " + err.message;
  }
}

// 🚀 Init
onMounted(submitOrder);

// 🧹 Cleanup ref cookie on terminal states
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
