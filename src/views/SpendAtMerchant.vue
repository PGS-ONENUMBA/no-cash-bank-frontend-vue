<template>
  <div class="mx-auto max-w-5xl p-4">
    <header class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Spend at Merchant</h1>
      <button class="rounded bg-gray-100 px-3 py-2 text-sm" @click="refreshBalances" :disabled="loadingBalances">
        {{ loadingBalances ? 'Refreshing…' : 'Refresh Balances' }}
      </button>
    </header>

    <!-- Balances -->
    <section class="mb-6 rounded-lg border bg-white">
      <div class="border-b p-3 font-medium">Your Balances</div>
      <div class="p-3 overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-left text-gray-600">
              <th class="p-2">Source</th>
              <th class="p-2">Vendor</th>
              <th class="p-2">Available</th>
              <th class="p-2">Locked</th>
              <th class="p-2">Currency</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in balances" :key="row.key" class="border-t">
              <td class="p-2">{{ row.type }}</td>
              <td class="p-2">{{ row.vendor_name || '—' }}</td>
              <td class="p-2">{{ fmtAmount(row.available) }}</td>
              <td class="p-2">{{ fmtAmount(row.locked) }}</td>
              <td class="p-2">{{ row.currency || 'NGN' }}</td>
            </tr>
            <tr v-if="!balances.length">
              <td colspan="5" class="p-3 text-gray-500">No balances yet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Form -->
    <section class="rounded-lg border bg-white">
      <div class="border-b p-3 font-medium">Create Spend</div>
      <div class="p-4">
        <form class="grid gap-4 md:grid-cols-2" @submit.prevent="precheckAndOpenConfirm">
          <div class="md:col-span-1">
            <label class="mb-1 block text-sm font-medium">Merchant Phone</label>
            <input
              v-model.trim="merchantPhone"
              @blur="normalizePhone"
              class="w-full rounded border px-3 py-2 outline-none focus:ring"
              placeholder="090xxxxxxxx"
              inputmode="numeric"
            />
            <small class="text-gray-500">We’ll normalize to 11 digits.</small>
          </div>

          <div class="md:col-span-1">
            <label class="mb-1 block text-sm font-medium">Merchant</label>
            <div class="flex gap-2">
              <select v-model="selectedVendorId" class="w-full rounded border px-3 py-2">
                <option value="" disabled>Select merchant</option>
                <option v-for="m in merchantCandidates" :key="m.vendor_id" :value="m.vendor_id">
                  {{ m.display_name }} ({{ m.vendor_id }})
                </option>
              </select>
              <button type="button" class="rounded border px-3 py-2" @click="lookupMerchant" :disabled="lookingUp">
                {{ lookingUp ? 'Finding…' : 'Find' }}
              </button>
            </div>
            <small class="text-gray-500">Enter phone then click Find.</small>
          </div>

          <div class="md:col-span-1">
            <label class="mb-1 block text-sm font-medium">Amount (NGN)</label>
            <input
              v-model.number="amount"
              class="w-full rounded border px-3 py-2 outline-none focus:ring"
              type="number" min="100" step="50" placeholder="e.g. 5000"
            />
          </div>

          <div class="md:col-span-1">
            <label class="mb-1 block text-sm font-medium">Note (optional)</label>
            <input
              v-model.trim="note"
              class="w-full rounded border px-3 py-2 outline-none focus:ring"
              placeholder="e.g. Groceries"
            />
          </div>

          <div class="md:col-span-2 flex items-center justify-end gap-2">
            <button type="button" class="rounded border px-3 py-2" @click="resetForm">Clear</button>
            <button type="submit" class="rounded bg-indigo-600 px-4 py-2 text-white" :disabled="submitting">
              {{ submitting ? 'Submitting…' : 'Pay Merchant' }}
            </button>
          </div>
        </form>

        <!-- Alerts -->
        <p v-if="errorMsg" class="mt-3 text-sm text-red-600">{{ errorMsg }}</p>
        <p v-if="successMsg" class="mt-3 text-sm text-green-600">{{ successMsg }}</p>
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
let pendingSecret = ""; // pin or password captured from modal

// -------- utils
const fmtAmount = (n) => (n == null ? '0' : new Intl.NumberFormat('en-NG').format(Number(n)));

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
    balances.value = Array.isArray(unwrapped) ? unwrapped : (unwrapped?.balances || []);
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
    const rows = Array.isArray(unwrapped) ? unwrapped : (unwrapped?.merchants || []);
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
  // If you have a global auth guard, route meta will handle it.
  // Otherwise you could do a ping here and redirect to /login if 401.
  refreshBalances().catch(() => {});
});
</script>

<style scoped>
/* minimal styling */
</style>
