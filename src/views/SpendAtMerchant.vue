<template>
  <div class="container py-4">
    <!-- Header -->
    <header class="mb-4 d-flex flex-column gap-2 gap-md-0 flex-md-row align-items-md-center justify-content-md-between">
      <h1 class="h3 mb-0">Spend at Merchant</h1>
    </header>

    <!-- Form -->
    <section class="card shadow-sm">
      <div class="card-header bg-light fw-semibold">Create Spend</div>

      <div class="card-body">
        <form class="row g-3" @submit.prevent="precheckAndOpenConfirm">
          <!-- Merchant Phone -->
          <div class="col-md-6">
            <label class="form-label">Merchant Phone</label>
            <input
              v-model.trim="merchantPhone"
              @blur="normalizePhone"
              class="form-control"
              placeholder="090xxxxxxxx"
              inputmode="numeric"
            />
            <div class="form-text">We’ll normalize to 11 digits.</div>
          </div>

          <!-- Merchant (select + find) -->
          <div class="col-md-6">
            <label class="form-label">Merchant</label>
            <div class="input-group">
              <select v-model="selectedVendorId" class="form-select">
                <option value="" disabled>Select merchant</option>
                <option v-for="m in merchantCandidates" :key="m.vendor_id" :value="m.vendor_id">
                  {{ m.display_name }} ({{ m.vendor_id }})
                </option>
              </select>
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="lookupMerchant"
                :disabled="lookingUp"
              >
                <span
                  v-if="lookingUp"
                  class="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                {{ lookingUp ? 'Finding…' : 'Find' }}
              </button>
            </div>
            <div class="form-text">Enter phone then click Find.</div>
          </div>

          <!-- Amount -->
          <div class="col-md-6">
            <label class="form-label">Amount (NGN)</label>
            <input
              v-model.number="amount"
              class="form-control"
              type="number" min="100" step="50" placeholder="e.g. 5000"
            />
          </div>

          <!-- Note -->
          <div class="col-md-6">
            <label class="form-label">Note (optional)</label>
            <input
              v-model.trim="note"
              class="form-control"
              placeholder="e.g. Groceries"
            />
          </div>

          <!-- Actions -->
          <div class="col-12 d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-outline-secondary" @click="resetForm(true)">
              Clear
            </button>
            <button
              type="submit"
              class="btn btn-primary d-inline-flex align-items-center"
              :disabled="submitting"
            >
              <span
                v-if="submitting"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ submitting ? 'Submitting…' : 'Pay Merchant' }}
            </button>
          </div>
        </form>

        <!-- Alerts -->
        <div v-if="errorMsg" class="alert alert-danger mt-3 mb-0 py-2">
          {{ errorMsg }}
        </div>
        <div v-if="successMsg" class="alert alert-success mt-3 mb-0 py-2">
          {{ successMsg }}
        </div>
      </div>
    </section>

    <!-- Re-auth -->
    <ReauthModal
      v-model="showConfirm"
      :require-password="requirePassword"
      @confirm="finalizeSpend"
    />
  </div>
</template>

<script setup>
/**
 * Spend at Merchant (Bootstrap)
 * -------------------------------------------
 * - Pure Bootstrap 5 (no Tailwind).
 * - Balances UI removed to avoid duplicate implementations and accidental calls.
 * - Uses dedicated proxy endpoints:
 *    • /context-proxy/v1/merchant/resolve  (merchant lookup by phone)
 *    • /context-proxy/v1/merchant/redeem   (spend/redeem with vendor_id or phone)
 * - Robust unwrapping of proxy envelopes { ok, status, data }.
 */
import { ref } from 'vue';
import { api } from '@/services/http';
import ReauthModal from '@/components/ReauthModal.vue';
import { normalizePhoneLocal } from '@/utils/phone';

/* ------------------------------------------------------------
 * Reactive State
 * ------------------------------------------------------------ */
/** @type {import('vue').Ref<string>} Merchant phone (raw user input). */
const merchantPhone = ref('');

/** @type {import('vue').Ref<Array<{vendor_id:number,display_name:string}>>} Candidates returned by the lookup. */
const merchantCandidates = ref([]);

/** @type {import('vue').Ref<string|number>} Selected vendor id from candidates (string for select binding). */
const selectedVendorId = ref('');

/** @type {import('vue').Ref<boolean>} UI flag while the lookup runs. */
const lookingUp = ref(false);

/** @type {import('vue').Ref<number|null>} Spend amount in NGN. */
const amount = ref(null);

/** @type {import('vue').Ref<string>} Optional note text. */
const note = ref('');

/** @type {import('vue').Ref<boolean>} Submission in-flight flag. */
const submitting = ref(false);

/** @type {import('vue').Ref<string>} Error message for alert. */
const errorMsg = ref('');

/** @type {import('vue').Ref<string>} Success message for alert. */
const successMsg = ref('');

// Re-auth modal controls
/** @type {import('vue').Ref<boolean>} Controls the Reauth modal visibility. */
const showConfirm = ref(false);
/** @type {import('vue').Ref<boolean>} Toggle if password is required instead of PIN. */
const requirePassword = ref(false);
/** @type {string} Captured secret (PIN/password) passed from modal. */
let pendingSecret = '';

/* ------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------ */
/**
 * Normalize phone to local 11-digit MSISDN (e.g., 090xxxxxxxx).
 * Mutates `merchantPhone` in-place.
 */
function normalizePhone() {
  merchantPhone.value = normalizePhoneLocal(merchantPhone.value);
}

/**
 * Unwraps a backend envelope into its inner `data` payload.
 * Handles both:
 *   - { data: {...} } and
 *   - { ok:true/false, status:200, data:{...} }
 * If no envelope is present, returns the original value.
 * @template T
 * @param {any} payload
 * @returns {T}
 */
function unwrap(payload) {
  if (payload && typeof payload === 'object' && 'data' in payload && !('ok' in payload)) {
    return payload.data;
  }
  if (payload && typeof payload === 'object' && 'data' in payload && 'ok' in payload) {
    return payload.data;
  }
  return payload;
}

/* ------------------------------------------------------------
 * Actions
 * ------------------------------------------------------------ */
/**
 * Look up merchant candidates by phone via Context Proxy.
 * Endpoint: POST /context-proxy/v1/merchant/resolve
 * Request: { phone: string }
 * Response (unwrapped expected shapes):
 *   - Array<{ vendor_id:number, display_name:string, ... }>
 *   - Or { merchants: Array<...> }
 */
async function lookupMerchant() {
  normalizePhone();
  errorMsg.value = '';
  successMsg.value = '';
  merchantCandidates.value = [];
  selectedVendorId.value = '';

  if (!merchantPhone.value || merchantPhone.value.length < 11) {
    errorMsg.value = 'Enter a valid merchant phone.';
    return;
  }

  lookingUp.value = true;
  try {
    const resp = await api.post('/context-proxy/v1/merchant/resolve', {
      phone: merchantPhone.value,
    });
    const unwrapped = unwrap(resp.data);
    const rows =
      Array.isArray(unwrapped) ? unwrapped : (unwrapped?.merchants || unwrapped?.data || []);
    merchantCandidates.value = rows;
    if (rows.length === 1) selectedVendorId.value = String(rows[0].vendor_id);
    if (!rows.length) errorMsg.value = 'No merchant found for that phone.';
  } catch (e) {
    errorMsg.value = e?.response?.data?.data?.error || e?.message || 'Lookup failed.';
  } finally {
    lookingUp.value = false;
  }
}

/**
 * Lightweight client-side validation, then opens the re-auth modal.
 * Ensures a merchant is selected and amount > 0.
 */
function precheckAndOpenConfirm() {
  errorMsg.value = '';
  successMsg.value = '';

  if (!selectedVendorId.value) {
    errorMsg.value = 'Please select a merchant.';
    return;
  }
  if (!amount.value || Number(amount.value) <= 0) {
    errorMsg.value = 'Enter a valid amount.';
    return;
  }
  showConfirm.value = true;
}

/**
 * Finalize spend at merchant via Context Proxy.
 * Endpoint: POST /context-proxy/v1/merchant/redeem
 * Request:
 *  - If vendor selected: { vendor_id:number, amount:number, note?:string }
 *  - Else (fallback):   { phone:string,     amount:number, note?:string }
 * Success signal:
 *  - Either outer envelope { ok:true } or payload { success:true }.
 * The function handles both.
 * @param {string} secret PIN or password emitted by the Reauth modal.
 */
async function finalizeSpend(secret) {
  pendingSecret = secret || '';
  submitting.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const payload = {
      vendor_id: Number(selectedVendorId.value) || undefined,
      phone: selectedVendorId.value ? undefined : merchantPhone.value,
      amount: Number(amount.value),
      note: note.value || '',
      // Secret is captured but not sent unless your backend requires it here.
      // Add `confirm_pin` / `confirm_password` if policy mandates.
    };

    const resp = await api.post('/context-proxy/v1/merchant/redeem', payload);
    const envelope = resp.data;
    const res = unwrap(envelope);

    const isOk = (envelope && envelope.ok === true) || (res && res.success === true);

    if (isOk) {
      successMsg.value = res?.message || 'Payment successful.';
      resetForm(false);
    } else {
      errorMsg.value = res?.message || res?.error || 'Payment failed.';
    }
  } catch (e) {
    errorMsg.value = e?.response?.data?.data?.error || e?.message || 'Payment failed.';
  } finally {
    submitting.value = false;
    pendingSecret = '';
  }
}

/**
 * Resets the form to an initial state.
 * @param {boolean} clearPhone If true, also clears the merchant phone.
 */
function resetForm(clearPhone = false) {
  if (clearPhone) merchantPhone.value = '';
  merchantCandidates.value = [];
  selectedVendorId.value = '';
  amount.value = null;
  note.value = '';
  // Keep alerts visible; caller can clear if desired.
}
</script>

<style scoped>
/* Pure Bootstrap; no custom styles needed */
</style>
