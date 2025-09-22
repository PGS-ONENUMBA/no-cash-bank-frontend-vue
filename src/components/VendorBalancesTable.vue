<template>
  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Balances per Merchant</h5>
      <button class="btn btn-sm btn-outline-secondary" @click="$emit('refresh')">
        <i class="bi bi-arrow-clockwise"></i> Refresh
      </button>
    </div>

    <div class="card-body p-0">
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="balances.length === 0" class="p-4 text-center text-muted">
        No vendor balances yet.
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover mb-0 align-middle">
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Phone</th>
              <th class="text-end">Balance</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in balances" :key="row.merchant_id">
              <td>
                <strong>{{ row.merchant_name }}</strong>
                <div class="small text-muted">ID: {{ row.merchant_id }}</div>
              </td>
              <td>{{ row.merchant_phone }}</td>
              <td class="text-end">
                {{ formatNgn(row.balance_ngn) }}
              </td>
              <td class="text-end">
                <button
                  class="btn btn-sm btn-success"
                  :disabled="row.balance_ngn <= 0"
                  @click="$emit('pay', row)"
                >
                  <i class="bi bi-bag-check"></i> Pay merchant
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="error" class="text-danger px-3 py-2 mb-0">{{ error }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "VendorBalancesTable",
  props: {
    balances: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    error: { type: String, default: "" },
  },
  emits: ["pay", "refresh"],
  methods: {
    formatNgn(v) {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(v || 0));
    },
  },
};
</script>
