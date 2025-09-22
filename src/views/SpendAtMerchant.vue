<template>
  <div class="container py-4">

    <!-- Header -->
    <header class="mb-4 d-flex flex-column gap-2 gap-md-0 flex-md-row align-items-md-center justify-content-md-between">
      <h1 class="h3 mb-0">Spend at Merchant</h1>
      <button
        class="btn btn-outline-secondary d-inline-flex align-items-center"
        @click="refreshBalances"
        :disabled="loadingBalances"
      >
        <span
          v-if="loadingBalances"
          class="spinner-border spinner-border-sm me-2"
          role="status"
          aria-hidden="true"
        ></span>
        {{ loadingBalances ? 'Refreshing…' : 'Refresh Balances' }}
      </button>
    </header>

    <!-- Balances -->
    <section class="card mb-4 shadow-sm">
      <div class="card-header bg-light fw-semibold">Your Balances</div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle mb-0">
            <thead class="table-light">
              <tr class="text-nowrap">
                <th>Source</th>
                <th>Vendor</th>
                <th>Available</th>
                <th>Locked</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in balances" :key="row.key" class="text-nowrap">
                <td>
                  <span class="badge bg-secondary rounded-pill">{{ row.type }}</span>
                </td>
                <td>{{ row.vendor_name || '—' }}</td>
                <td>
                  <span class="badge bg-success">{{ fmtAmount(row.available) }}</span>
                </td>
                <td>
                  <span class="badge bg-warning text-dark">{{ fmtAmount(row.locked) }}</span>
                </td>
                <td>{{ row.currency || 'NGN' }}</td>
              </tr>

              <tr v-if="!balances.length && !loadingBalances">
                <td colspan="5" class="py-3 text-center text-muted">No balances yet.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Loading placeholder -->
        <div v-if="loadingBalances" class="p-3">
          <div class="placeholder-glow">
            <span class="placeholder col-6"></span>
            <span class="placeholder col-7"></span>
            <span class="placeholder col-5"></span>
          </div>
        </div>
      </div>
    </section>

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
import { ref, onMounted } from 'vue';
import { api } from '@/services/http';
import ReauthModal from '@/components/ReauthModal.vue';
import { normalizePhoneLocal } from '@/utils/phone';

// -------- state
const balances = ref([]);
const loadingBalances = ref(false);

const merchantPhone = ref('');
const merchantCandidates = ref([]);
const selectedVendorId = ref('');
const lookingUp = ref(false);

const amount = ref(null);
const note = ref('');
const submitting = ref(false);

const errorMsg = ref('');
const successMsg = ref('');

// re-auth
const showConfirm = ref(false);
const requirePassword = ref(false); // flip to true if your policy requires password instead of PIN
let pendingSecret = ''; // pin or password captured from modal

// -------- utils
const fmtAmount = (n) =>
  n == null ? '0' : new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 }).format(Number(n));

function normalizePhone() {
  merchantPhone.value = normalizePhoneLocal(merchantPhone.value);
}

// -------- API helpers
function unwrap(payload) {
  // backend envelopes: { ok, status, data } or raw
  if (payload && typeof payload === 'object' && 'data' in payload && !('ok' in payload)) {
    return payload.data;
  }
  if (payload && typeof payload === 'object' && 'data' in payload && 'ok' in payload) {
    return payload.data;
  }
  return payload;
}

async function refreshBalances() {
  loadingBalances.value = true;
  errorMsg.value = '';
  try {
    const { data } = await api.post('/context-proxy/v1/action', {
      action_type: 'get_wallet_balances',
    });
    const unwrapped = unwrap(data);
    // expect: [{ key, type, vendor_id?, vendor_name?, available, locked, currency }]
    balances.value = Array.isArray(unwrapped) ? unwrapped : unwrapped?.balances || [];
  } catch (e) {
    errorMsg.value = e?.response?.data?.data?.message || e?.message || 'Failed to load balances.';
  } finally {
    loadingBalances.value = false;
  }
}

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
    const { data } = await api.post('/context-proxy/v1/action', {
      action_type: 'get_merchant_by_phone',
      phone: merchantPhone.value,
    });
    const unwrapped = unwrap(data);
    const rows = Array.isArray(unwrapped) ? unwrapped : unwrapped?.merchants || [];
    merchantCandidates.value = rows;
    if (rows.length === 1) selectedVendorId.value = String(rows[0].vendor_id);
    if (!rows.length) errorMsg.value = 'No merchant found for that phone.';
  } catch (e) {
    errorMsg.value = e?.response?.data?.data?.message || e?.message || 'Lookup failed.';
  } finally {
    lookingUp.value = false;
  }
}

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
  showConfirm.value = true; // opens modal to capture PIN/password
}

async function finalizeSpend(secret) {
  pendingSecret = secret || '';
  submitting.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const payload = {
      action_type: 'spend_at_merchant',
      vendor_id: Number(selectedVendorId.value),
      merchant_phone: merchantPhone.value,
      amount: Number(amount.value),
      note: note.value || '',
      // backend should accept either (based on policy)
      confirm_pin: requirePassword.value ? undefined : pendingSecret,
      confirm_password: requirePassword.value ? pendingSecret : undefined,
    };

    const { data } = await api.post('/context-proxy/v1/action', payload);
    const res = unwrap(data);

    // Expect backend: { success, message, txn_id?, new_balances? }
    if (res?.success) {
      successMsg.value = res?.message || 'Payment successful.';
      if (Array.isArray(res?.new_balances)) balances.value = res.new_balances;
      resetForm(false);
    } else {
      errorMsg.value = res?.message || 'Payment failed.';
    }
  } catch (e) {
    errorMsg.value = e?.response?.data?.data?.message || e?.message || 'Payment failed.';
  } finally {
    submitting.value = false;
    pendingSecret = '';
  }
}

function resetForm(clearPhone = false) {
  if (clearPhone) merchantPhone.value = '';
  merchantCandidates.value = [];
  selectedVendorId.value = '';
  amount.value = null;
  note.value = '';
}

onMounted(() => {
  refreshBalances().catch(() => {});
});
</script>

<style scoped>
/* no custom CSS required; uses Bootstrap utilities/components */
</style>
