<template>
  <div class="container text-center py-5 mt-5">
    <div class="card shadow-sm p-4 mx-auto" style="max-width: 600px;">
      <h2 class="text-dark">
        {{ stage === 'verifying' ? 'Thank You!' : resultTitle }}
      </h2>
      <p class="lead">
        {{ stage === 'verifying' ? 'We’re processing your request—please wait.' : resultSubtitle }}
      </p>

      <!-- Progress -->
      <transition name="fade" mode="out-in">
        <div v-if="stage === 'verifying'" class="progress my-4" style="height: 20px;" :key="stage">
          <div class="progress-bar" role="progressbar" :class="progressBarClass" :style="{ width: progressValue }">
            {{ progressBarText }}
          </div>
        </div>
      </transition>

      <!-- Contextual messages -->
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
/**
 * ThankYou.vue
 *
 * Securely finalizes a payment after Squad checkout.
 * - Reads ?reference=... (or fallback cookie) and normalizes duplicate query keys
 * - Calls server-side verify endpoint: /context-proxy/v1/squad/verify
 *   (browser always POSTs; server injects X-Plugin-Token and updates the order)
 * - Expects normalized payload from server { success, status, message }
 * - Drives final UI state without making any further internal API calls
 *
 * Security:
 * - Uses shared axios `api` (withCredentials + CSRF interceptor).
 * - No Basic/App secrets in the browser.
 */

import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "@/services/http"; // axios instance with CSRF bootstrap

/** @typedef {'verifying'|'winner_selected'|'entry_processed'|'amount_mismatch_wallet_updated'|'payment_failed'} ThankYouStage */

/**
 * Normalized UI payload the page expects.
 * @typedef {Object} VerifyUiPayload
 * @property {boolean} success             - True when payment verified and processed.
 * @property {ThankYouStage|string} status - One of the UI stages.
 * @property {string} [message]            - Optional human message for display.
 * @property {string} [order_id]           - Optional order/reference for logs.
 */

/** Cookie helpers */

/**
 * Read a cookie value by name.
 * @param {string} name
 * @returns {string|null}
 */
function getCookie(name) {
  const m = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return m ? decodeURIComponent(m[2]) : null;
}

/**
 * Set a cookie with minute-based expiry.
 * @param {string} name
 * @param {string} value
 * @param {number} minutes
 * @returns {void}
 */
function setCookie(name, value, minutes) {
  const expires = new Date(Date.now() + minutes * 60000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

/**
 * Delete a cookie by name.
 * @param {string} name
 * @returns {void}
 */
function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/`;
}

const route = useRoute();
const router = useRouter();

/**
 * Extract a single `reference` from route (de-duping arrays) or cookie.
 * Also normalizes the URL if duplicate `reference` keys exist.
 * @returns {string|undefined}
 */
function getNormalizedReference() {
  /** @type {string|string[]|undefined} */
  const raw = route.query.reference;

  // If duplicated like ?reference=abc&reference=abc, Vue makes it an array
  if (Array.isArray(raw)) {
    const first = raw.find(Boolean) || "";
    // Replace URL with a single reference param (no page reload)
    router.replace({ path: route.path, query: { ...route.query, reference: first } }).catch(() => {});
    return first;
  }

  return raw || getCookie("nocash_last_ref") || undefined;
}

/** Proxy constants (browser → proxy) */
const PROXY_SQUAD_VERIFY = "/context-proxy/v1/squad/verify";

/** UI state */

/** @type {import('vue').Ref<ThankYouStage>} */
const stage = ref("verifying");
const message = ref("");
const errorMessage = ref("");

/** UI computed */

const progressBarClass = computed(() => {
  if (stage.value === "winner_selected") return "bg-success";
  if (["entry_processed", "amount_mismatch_wallet_updated"].includes(stage.value)) return "bg-warning text-dark";
  if (stage.value === "payment_failed") return "bg-danger";
  return "bg-info progress-bar-striped progress-bar-animated";
});

/** @returns {string} */
const progressBarText = computed(() => {
  if (stage.value === "winner_selected") return "You Won!";
  if (stage.value === "entry_processed") return "Raffle Completed";
  if (stage.value === "amount_mismatch_wallet_updated") return "Wallet Credited";
  if (stage.value === "payment_failed") return "Error Processing Payment";
  return "Verifying Payment...";
});

/** @returns {string} */
const progressValue = computed(() => {
  if (stage.value === "winner_selected") return "100%";
  if (stage.value === "entry_processed") return "95%";
  if (stage.value === "amount_mismatch_wallet_updated") return "90%";
  if (stage.value === "payment_failed") return "100%";
  return "70%";
});

/** @returns {string} */
const resultTitle = computed(() => {
  if (stage.value === "winner_selected") return "Congratulations!";
  if (stage.value === "entry_processed") return "Better Luck Next Time!";
  if (stage.value === "amount_mismatch_wallet_updated") return "Wallet Credited";
  if (stage.value === "payment_failed") return "Payment Failed";
  return "Thank You!";
});

/** @returns {string} */
const resultSubtitle = computed(() => {
  if (stage.value === "winner_selected") return "You won the raffle!";
  if (stage.value === "entry_processed") return "Your entry was processed successfully.";
  if (stage.value === "amount_mismatch_wallet_updated") return "We returned your funds.";
  if (stage.value === "payment_failed") return message.value || "Verification failed.";
  return "We’re processing your request—please wait.";
});

/**
 * Normalize various server/proxy payload shapes into the UI payload.
 * Accepts either:
 *  - Proxy envelope: { ok, status, data: { success, status, message, ... } }
 *  - Already-normalized: { success, status, message }
 *  - Raw gateway-ish:    { transaction_status: 'success'|'failed', message? }
 *
 * @param {any} raw
 * @returns {VerifyUiPayload}
 */
function normalizeVerifyPayload(raw) {
  const base = raw?.data ?? raw; // unwrap proxy shape {ok,status,data}

  // Prefer already-normalized structures from the server
  if (typeof base?.success === "boolean" && typeof base?.status === "string") {
    return {
      success: base.success,
      status: /** @type {ThankYouStage|string} */ (base.status),
      message: base.message || "",
      order_id: base.order_id || "",
    };
  }

  // Fallback: interpret a gateway-like object
  const txnStatus = (base?.transaction_status || base?.status || "").toString().toLowerCase();
  const ok = txnStatus === "success";
  return {
    success: ok,
    status: ok ? "entry_processed" : "payment_failed",
    message: base?.message || base?.reason || "",
    order_id: base?.transaction_ref || "",
  };
}

/**
 * Verify with server (which also updates the order).
 * On success, the server decides the final business status.
 * @returns {Promise<void>}
 */
async function verifyAndFinalize() {
  const reference = getNormalizedReference();

  if (!reference) {
    errorMessage.value = "No reference provided.";
    stage.value = "payment_failed";
    return;
  }

  // Keep the ref around for refreshes/deep links
  setCookie("nocash_last_ref", reference, 15);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await api.post(
      PROXY_SQUAD_VERIFY,
      { reference },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const normalized = normalizeVerifyPayload(res.data);
    stage.value = /** @type {ThankYouStage} */ (
      normalized.status || (normalized.success ? "entry_processed" : "payment_failed")
    );
    message.value = normalized.message || (normalized.success ? "" : "Verification failed.");
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Unknown error";
    errorMessage.value = `Verification error: ${msg}`;
    stage.value = "payment_failed";
  }
}

/** Init */
onMounted(verifyAndFinalize);

/**
 * Cleanup cookie after terminal states so we don't keep stale references.
 */
watch(stage, (newStage) => {
  const terminal = new Set([
    "winner_selected",
    "entry_processed",
    "amount_mismatch_wallet_updated",
    "payment_failed",
  ]);
  if (terminal.has(newStage)) {
    deleteCookie("nocash_last_ref");
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
    text-shadow: 0 2px 4px rgba(0,0,0,.1);
  }
  .lead {
    color: #6c757d;
  }
  .progress-bar {
    font-weight: 600;
    transition: all .8s ease-in-out;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .4s;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
</style>
