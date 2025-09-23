<template>
  <div class="container py-4">
    <header class="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between mb-3">
      <h1 class="h4 mb-2 mb-md-0">Wallet logs</h1>
      <small class="text-muted d-block mb-2">
        All payments from customers can be found here
      </small>
      <div class="text-muted">
        Available: <strong>{{ naira(balance?.available) }}</strong>
        <span class="ms-3">Pending: <strong>{{ naira(balance?.pending) }}</strong></span>
      </div>
    </header>

    <section class="card mb-3">
      <div class="card-header bg-light fw-semibold">Filters</div>
      <div class="card-body">
        <form class="row g-2" @submit.prevent="reload">
          <div class="col-12 col-md-3">
            <label class="form-label">Status</label>
            <select v-model="filters.status" class="form-select">
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="captured">Captured</option>
              <option value="settled">Settled</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">From</label>
            <input v-model="filters.from" type="date" class="form-control" />
          </div>
          <div class="col-6 col-md-3">
            <label class="form-label">To</label>
            <input v-model="filters.to" type="date" class="form-control" />
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label">Search</label>
            <input v-model.trim="filters.search" class="form-control" placeholder="ref / phone" />
          </div>
          <div class="col-12 d-flex justify-content-end">
            <button class="btn btn-primary" :disabled="loading" type="submit">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Apply
            </button>
          </div>
        </form>
      </div>
    </section>

    <section class="card">
      <div class="card-header bg-light fw-semibold d-flex justify-content-between align-items-center">
        <span>Incoming Payments</span>
        <button class="btn btn-outline-secondary btn-sm" @click="reload" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span> Refresh
        </button>
      </div>
      <div class="card-body p-0">
        <div v-if="error" class="alert alert-danger m-3">{{ error }}</div>
        <div v-else>
          <div v-if="items.length === 0" class="p-3 text-muted">No records.</div>
          <div v-else class="table-responsive">
            <table class="table table-sm align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in items" :key="r.spend_id">
                  <td>{{ fmtDate(r.created_at) }}</td>
                  <td>{{ naira(r.amount) }}</td>
                  <td><span class="badge bg-secondary text-uppercase">{{ r.status }}</span></td>
                  <td><code>{{ r.trans_ref }}</code></td>
                  <td class="text-end">
                    <button class="btn btn-outline-secondary btn-sm" disabled>View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="d-flex justify-content-between align-items-center p-3">
            <small class="text-muted">
              Page {{ page }} of {{ totalPages }} ({{ total }} items)
            </small>
            <div class="btn-group">
              <button class="btn btn-outline-secondary btn-sm" :disabled="page<=1||loading" @click="go(page-1)">Prev</button>
              <button class="btn btn-outline-secondary btn-sm" :disabled="page>=totalPages||loading" @click="go(page+1)">Next</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { api } from '@/services/http';

const loading = ref(false);
const error = ref('');

const balance = ref({ available: 0, pending: 0 });

const page = ref(1);
const perPage = ref(20);
const total = ref(0);
const items = ref([]);

const filters = ref({ status: '', from: '', to: '', search: '' });

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)));

/** Format NGN as ₦x,xxx.xx */
function naira(n) {
  const v = Number(n || 0);
  return '₦' + new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}
function fmtDate(s) {
  if (!s) return '';
  const d = new Date(s.replace(' ', 'T'));
  return d.toLocaleString();
}
/** Unwrap { ok, status, data } envelopes (or pass-through). */
function unwrap(p) {
  if (p && typeof p === 'object' && 'data' in p && 'ok' in p) return p.data;
  if (p && typeof p === 'object' && 'data' in p) return p.data;
  return p;
}

/**
 * Primary→fallback fetch helper.
 * Tries a primary POST endpoint; if 404/405, falls back to /context-proxy/v1/action.
 */
async function postWithFallback(primaryPath, primaryBody, fallbackActionType, map = x => x) {
  try {
    const r = await api.post(primaryPath, primaryBody);
    return map(unwrap(r.data));
  } catch (e) {
    const code = e?.response?.status;
    if (code !== 404 && code !== 405) throw e;
    const r2 = await api.post('/context-proxy/v1/action', { action_type: fallbackActionType, ...primaryBody });
    return map(unwrap(r2.data));
  }
}

/** Load vendor balance: POST /context-proxy/v1/vendor/balance → fallback action vendor_wallet_summary */
async function loadBalance() {
  try {
    const payload = await postWithFallback(
      '/context-proxy/v1/vendor/balance',
      {},
      'vendor_wallet_summary',
      (u) => u?.balance || u || { available: 0, pending: 0 }
    );
    balance.value = payload;
  } catch (e) {
    // keep zeros but surface error on ledger pane, not here
    console.error(e);
  }
}

/** Load ledger: POST /context-proxy/v1/vendor/ledger → fallback action vendor_wallet_ledger */
async function loadLedger() {
  const body = {
    page: page.value,
    per_page: perPage.value,
    status: filters.value.status || undefined,
    from: filters.value.from || undefined,
    to: filters.value.to || undefined,
    q: filters.value.search || undefined,
  };

  try {
    const payload = await postWithFallback(
      '/context-proxy/v1/vendor/ledger',
      body,
      'vendor_wallet_ledger',
      (u) => {
        // Accept shapes: { items,total } OR { rows,total } OR { data:{...} }
        return {
          items: u?.items || u?.rows || [],
          total: Number(u?.total ?? u?.total_rows ?? 0),
        };
      }
    );
    items.value = payload.items;
    total.value = payload.total;
  } catch (e) {
    error.value = e?.response?.data?.data?.error || e?.message || 'Failed to load ledger.';
  }
}

async function reload() {
  loading.value = true;
  error.value = '';
  try {
    await Promise.all([loadBalance(), loadLedger()]);
  } finally {
    loading.value = false;
  }
}
function go(p) {
  page.value = Math.min(Math.max(1, p), totalPages.value);
  void reload();
}

void reload();
</script>
