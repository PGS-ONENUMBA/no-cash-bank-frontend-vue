<template>
  <div v-if="show" class="modal fade show d-block" tabindex="-1" role="dialog" style="background: rgba(0,0,0,.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <form @submit.prevent="submit">
          <div class="modal-header">
            <h5 class="modal-title">Pay {{ vendor?.merchant_name }}</h5>
            <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <div class="mb-2 small text-muted">
              Merchant ID: {{ vendor?.merchant_id }} • Phone: {{ vendor?.merchant_phone }}
            </div>
            <div class="mb-3">
              <label class="form-label">Amount (NGN)</label>
              <input
                type="number"
                class="form-control"
                min="1"
                step="1"
                v-model.number="amount"
                :max="maxAmount"
                required
              />
              <div class="form-text">
                Available: {{ formatNgn(maxAmount) }}
              </div>
              <div v-if="amount > maxAmount" class="text-danger small mt-1">
                Amount exceeds available balance for this merchant.
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Re-authentication</label>
              <div class="input-group">
                <input
                  v-if="mode==='password'"
                  type="password"
                  class="form-control"
                  placeholder="Enter your password"
                  v-model.trim="password"
                  :disabled="submitting"
                />
                <input
                  v-else
                  type="password"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="6"
                  class="form-control"
                  placeholder="Enter your 4–6 digit PIN"
                  v-model.trim="pin"
                  :disabled="submitting"
                />
                <button class="btn btn-outline-secondary" type="button" @click="toggleMode" :disabled="submitting">
                  Use {{ mode === 'password' ? 'PIN' : 'Password' }}
                </button>
              </div>
            </div>

            <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>
            <div v-if="success" class="alert alert-success py-2">{{ success }}</div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="$emit('close')" :disabled="submitting">Cancel</button>
            <button type="submit" class="btn btn-success" :disabled="isInvalid || submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              Confirm payment
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { spendAtMerchant } from "@/services/spendService";

export default {
  name: "PayMerchantModal",
  props: {
    show: { type: Boolean, default: false },
    vendor: { type: Object, default: null }, // { merchant_id, merchant_name, merchant_phone, balance_ngn }
  },
  emits: ["close", "success"],
  data() {
    return {
      amount: null,
      mode: "pin", // default to PIN; toggleable
      pin: "",
      password: "",
      submitting: false,
      error: "",
      success: "",
    };
  },
  computed: {
    maxAmount() {
      return Number(this.vendor?.balance_ngn || 0);
    },
    isInvalid() {
      const amtOk = Number(this.amount) > 0 && Number(this.amount) <= this.maxAmount;
      const authOk = this.mode === "password" ? this.password.length >= 6 : this.pin.length >= 4;
      return !(amtOk && authOk);
    },
  },
  methods: {
    formatNgn(v) {
      return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(Number(v || 0));
    },
    toggleMode() {
      this.mode = this.mode === "password" ? "pin" : "password";
      this.pin = "";
      this.password = "";
    },
    async submit() {
      if (this.isInvalid) return;
      this.submitting = true;
      this.error = "";
      this.success = "";

      try {
        const res = await spendAtMerchant({
          merchantId: this.vendor.merchant_id,
          amount: Number(this.amount),
          pin: this.mode === "pin" ? this.pin : undefined,
          password: this.mode === "password" ? this.password : undefined,
        });

        this.success = res?.message || "Payment successful";
        // notify parent so it can refresh balances & show toast
        this.$emit("success", {
          merchantId: this.vendor.merchant_id,
          newBalance: Number(res?.new_balance ?? (this.maxAmount - Number(this.amount))),
          txnRef: res?.txn_ref,
        });

        // optional: auto-close after a beat
        setTimeout(() => this.$emit("close"), 800);
      } catch (e) {
        this.error = e?.message || "Payment failed";
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
