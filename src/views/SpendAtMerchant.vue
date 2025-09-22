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
              class="form-control"
              placeholder="090xxxxxxxx"
              inputmode="numeric"
              autocomplete="off"
            />
            <div class="form-text">
              We’ll normalize to 11 digits. Once it’s valid, we’ll auto-find the merchant.
            </div>
          </div>

          <!-- Merchant (select + auto-find) -->
          <div class="col-md-6">
            <label class="form-label">Merchant</label>
            <div class="input-group">
              <select v-model="selectedVendorId" class="form-select">
                <option value="" disabled>Select merchant</option>
                <option
                  v-for="m in merchantCandidates"
                  :key="m.vendor_id"
                  :value="m.vendor_id"
                >
                  {{ optionLabel(m) }}
                </option>
              </select>
              <button
                type="button"
                class="btn btn-outline-secondary"
                @click="manualLookup"
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
            <div class="form-text">
              Spendable here:
              <strong v-if="selectedVendorId">
                {{ naira(selectedVendorBalance) }}
              </strong>
              <span v-else class="text-muted">—</span>
            </div>
          </div>

          <!-- Amount -->
          <div class="col-md-6">
            <label class="form-label">Amount (₦)</label>
            <input
              v-model.number="amount"
              class="form-control"
              type="number"
              :min="100"
              :step="50"
              :max="selectedVendorBalance || null"
              placeholder="e.g. 5000"
              @input="clampToBalance"
            />
            <div class="form-text">
              Max: <strong>{{ naira(selectedVendorBalance) }}</strong>
            </div>
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
 * Spend at Merchant (Bootstrap, balance-aware)
 * ----------------------------------------------------------------
 * Enhancements:
 *  • Uses wallet balances (per vendor) to show spendable funds in the
 *    <select> options and below the selector.
 *  • Auto-resolves merchant as soon as phone reaches a valid 11-digit
 *    normalized format (no need to press “Find”).
 *  • Amount entry is capped to the current vendor balance (both UI max and runtime checks).
 *  • All amounts shown with ₦ sign, thousands separators, 2 decimal places; zeros as ₦0.00.
 *  • Uses Context Proxy endpoints:
 *      - POST /context-proxy/v1/action           { action_type: 'get_wallet_balances' }
 *      - POST /context-proxy/v1/merchant/resolve { phone }
 *      - POST /context-proxy/v1/merchant/redeem  { vendor_id | phone, amount, note }
 */
import { ref, computed, watch } from 'vue';
import { api } from '@/services/http';
import ReauthModal from '@/components/ReauthModal.vue';
import { normalizePhoneLocal } from '@/utils/phone';

/* ----------------------------------------------------------------
 * Reactive State
 * ---------------------------------------------------------------- */
/** Merchant phone (user input). */
const merchantPhone = ref('');

/** Merchant candidates returned by lookup. */
const merchantCandidates = ref([]);

/** Selected vendor id (string for binding; convert to number when needed). */
const selectedVendorId = ref('');

/** Lookup spinner flag. */
const lookingUp = ref(false);

/** Spend amount (in NGN). */
const amount = ref(null);

/** Optional note. */
const note = ref('');

/** Submission flag. */
const submitting = ref(false);

/** Alerts. */
const errorMsg = ref('');
const successMsg = ref('');

// Re-auth modal controls
const showConfirm = ref(false);
const requirePassword = ref(false);
let pendingSecret = '';

/* ----------------------------------------------------------------
 * Balance store (from /action:get_wallet_balances)
 * ---------------------------------------------------------------- */
/**
 * Raw buckets as returned by backend.
 * Expected bucket shape:
 *  {
 *    key: 'vendor:123' | 'vendor:0',
 *    type: 'vendor_wallet' | 'general_wallet',
 *    vendor_id: number|null,
 *    vendor_name: string,
 *    available: number,
 *    locked: number,
 *    currency: 'NGN'
 *  }
 */
const balanceBuckets = ref([]);

/** Quick lookup map: vendor_id -> available. 0 represents “General Wallet”. */
const balancesByVendorId = computed(() => {
  const map = new Map();
  for (const b of balanceBuckets.value) {
    const vid = Number(b.vendor_id ?? 0);
    map.set(vid, Number(b.available || 0));
  }
  return map;
});

/** Currently selected vendor balance (number). */
const selectedVendorBalance = computed(() => {
  const vid = Number(selectedVendorId.value || 0);
  return balancesByVendorId.value.get(vid) || 0;
});

/* ----------------------------------------------------------------
 * Formatting helpers
 * ---------------------------------------------------------------- */
/**
 * Formats a number as ₦ with thousand separators and 2 d.p.
 * Ensures 0 => “₦0.00”.
 * @param {number} n
 * @returns {string}
 */
function naira(n) {
  const v = Number.isFinite(n) ? n : 0;
  return '₦' + new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

/**
 * Builds the option label: "Name — ₦x,xxx.xx"
 * Falls back to “General Wallet” for vendor_id=0 if ever used.
 * @param {{vendor_id:number, display_name:string}} m
 */
function optionLabel(m) {
  const vid = Number(m.vendor_id || 0);
  const name = vid > 0 ? m.display_name : 'General Wallet';
  const bal = balancesByVendorId.value.get(vid) || 0;
  return `${name} — ${naira(bal)}`;
}

/* ----------------------------------------------------------------
 * API envelopes
 * ---------------------------------------------------------------- */
/**
 * Unwraps envelope shapes:
 *  - { data: {...} }
 *  - { ok: true, status: 200, data: {...} }
 *  - passthrough otherwise
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

/* ----------------------------------------------------------------
 * Data loading
 * ---------------------------------------------------------------- */
/**
 * Loads wallet balances and updates local bucket/map state.
 * Balances are used to:
 *  - show vendor spendable in the select & hint,
 *  - cap the amount.
 */
async function loadBalances() {
  try {
    const { data } = await api.post('/context-proxy/v1/action', { action_type: 'get_wallet_balances' });
    const unwrapped = unwrap(data);
    balanceBuckets.value = Array.isArray(unwrapped) ? unwrapped : (unwrapped?.balances || []);
  } catch (e) {
    // Non-fatal for the form; just zero everything if it fails
    balanceBuckets.value = [];
  }
}

/**
 * Manual lookup click handler (still available as a backup).
 */
function manualLookup() {
  // Force a lookup right away using current normalized phone
  void lookupMerchant(true);
}

/**
 * Auto-lookup by phone:
 * - As the user types, we normalize.
 * - Once it reaches a valid 11-digit form, schedule a debounced lookup.
 */
let lookupTimer = null;
watch(merchantPhone, (val, prev) => {
  // Normalize but avoid infinite loops
  const normalized = normalizePhoneLocal(val || '');
  if (normalized !== val) {
    merchantPhone.value = normalized;
    return; // next tick will handle further logic
  }

  // If not valid length, clear selection/candidates
  if (!normalized || normalized.length < 11) {
    if (lookupTimer) clearTimeout(lookupTimer);
    merchantCandidates.value = [];
    selectedVendorId.value = '';
    return;
  }

  // Debounce auto-lookup
  if (lookupTimer) clearTimeout(lookupTimer);
  lookupTimer = setTimeout(() => lookupMerchant(false), 250);
});

/**
 * Lookup merchant candidates by phone via Context Proxy.
 * @param {boolean} fromClick Whether this was triggered by the "Find" button
 */
async function lookupMerchant(fromClick) {
  lookingUp.value = true;
  errorMsg.value = '';
  successMsg.value = '';
  merchantCandidates.value = [];
  selectedVendorId.value = '';

  try {
    const resp = await api.post('/context-proxy/v1/merchant/resolve', {
      phone: merchantPhone.value,
    });
    const unwrapped = unwrap(resp.data);
    const rows = Array.isArray(unwrapped) ? unwrapped : (unwrapped?.merchants || unwrapped?.data || []);
    merchantCandidates.value = rows;

    if (rows.length === 1) {
      selectedVendorId.value = String(rows[0].vendor_id);
    } else if (!rows.length && fromClick) {
      errorMsg.value = 'No merchant found for that phone.';
    }
  } catch (e) {
    errorMsg.value = e?.response?.data?.data?.error || e?.message || 'Lookup failed.';
  } finally {
    lookingUp.value = false;
  }
}

/* ----------------------------------------------------------------
 * UX logic
 * ---------------------------------------------------------------- */
/**
 * Clamp the amount field to the current selected vendor balance.
 * Called on <input>.
 */
function clampToBalance() {
  const max = Number(selectedVendorBalance.value.valueOf() || 0);
  if (amount.value == null) return;
  if (amount.value < 0) amount.value = 0;
  if (max > 0 && amount.value > max) amount.value = max;
}

/**
 * Basic validation then open re-auth modal.
 */
function precheckAndOpenConfirm() {
  errorMsg.value = '';
  successMsg.value = '';

  if (!selectedVendorId.value) {
    errorMsg.value = 'Please select a merchant.';
    return;
  }

  const max = Number(selectedVendorBalance.value.valueOf() || 0);
  const amt = Number(amount.value || 0);

  if (!amt || amt <= 0) {
    errorMsg.value = 'Enter a valid amount.';
    return;
  }
  if (amt > max) {
    errorMsg.value = `Amount exceeds your spendable balance at this merchant (${naira(max)}).`;
    return;
  }
  if (max <= 0) {
    errorMsg.value = 'Insufficient balance at this merchant.';
    return;
  }

  showConfirm.value = true;
}

/**
 * Finalize spend via Context Proxy, with a server-side guard as well.
 * @param {string} secret PIN or password emitted by Reauth modal.
 */
async function finalizeSpend(secret) {
  pendingSecret = secret || '';
  submitting.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  // One more client-side guard (defense in depth)
  const max = Number(selectedVendorBalance.value.valueOf() || 0);
  const amt = Number(amount.value || 0);
  if (amt > max) {
    submitting.value = false;
    errorMsg.value = `Amount exceeds your spendable balance at this merchant (${naira(max)}).`;
    return;
  }

  try {
    const payload = {
      vendor_id: Number(selectedVendorId.value) || undefined,
      // Backend accepts vendor_id OR phone; we send vendor_id once resolved.
      amount: amt,
      note: note.value || '',
      // If policy requires, include confirm_pin/confirm_password here:
      // confirm_pin: requirePassword.value ? undefined : pendingSecret,
      // confirm_password: requirePassword.value ? pendingSecret : undefined,
    };

    const resp = await api.post('/context-proxy/v1/merchant/redeem', payload);
    const envelope = resp.data;
    const res = unwrap(envelope);
    const isOk = (envelope && envelope.ok === true) || (res && res.success === true);

    if (isOk) {
      successMsg.value = res?.message || 'Payment successful.';
      // Refresh balances so select labels + caps update
      await loadBalances();
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
 * Reset form state.
 * @param {boolean} clearPhone Also clear phone field if true.
 */
function resetForm(clearPhone = false) {
  if (clearPhone) merchantPhone.value = '';
  merchantCandidates.value = [];
  selectedVendorId.value = '';
  amount.value = null;
  note.value = '';
  // Keep alerts; caller may clear if desired.
}

/* ----------------------------------------------------------------
 * Init
 * ---------------------------------------------------------------- */
void loadBalances();
</script>

<style scoped>
/* Pure Bootstrap; no custom styles needed */
</style>
