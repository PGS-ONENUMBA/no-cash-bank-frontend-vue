<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <h3 class="text-muted fs-4">
              We can pay for you to cover expenses up to {{ formattedWinnableAmount }}
              at the ticket price of:
              <span v-if="ticketCurrentPrice > 0">{{ formatCurrency(ticketCurrentPrice) }}</span>
            </h3>
            <p class="text-success fs-5">Winnable Amount: {{ formattedWinnableAmount }}</p>

            <h5 class="fw-bold"><i class="bi bi-lightbulb"></i> How It Works</h5>
            <ul class="list-unstyled">
              <li v-if="ticketCurrentPrice > 0">
                  <i class="bi bi-1-circle text-success"></i>Current Ticket Price: {{ formatCurrency(ticketCurrentPrice) }}
              </li>
              <li><i class="bi bi-1-circle text-success"></i> Enter your phone number.</li>
              <li><i class="bi bi-2-circle text-success"></i> Select a registered vendor and buy tickets.</li>
              <li><i class="bi bi-3-circle text-success"></i> If you win, your win is locked to that vendor—spend it there.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Right Column: Form -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title pb-3 fs-4">Pay Merchant Request</h2>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center">
              <p>Loading raffle details...</p>
            </div>

            <!-- Step 1: Customer Phone -->
            <form v-else-if="!showFullForm" @submit.prevent="showFullForm = true">
              <div class="mb-3">
                <label for="customerPhone" class="form-label">
                  <i class="bi bi-telephone me-2"></i> Your Phone Number
                </label>
                <input
                  type="tel"
                  class="form-control"
                  id="customerPhone"
                  v-model.trim="formData.customerPhone"
                  required
                  inputmode="numeric"
                  autocomplete="tel"
                  placeholder="e.g., 09012345678"
                />
                <small class="text-muted">Use your active mobile number.</small>
              </div>
              <button type="submit" class="btn btn-orange custom-width mb-3">
                <i class="bi bi-arrow-right-circle me-2"></i> Next
              </button>
            </form>

            <!-- Full Form (registered vendor is REQUIRED) -->
            <form v-else @submit.prevent="handleSubmit">
              <!-- Required: Registered Vendor -->
              <div class="mb-3 position-relative">
                <label for="vendorSearch" class="form-label">
                  <i class="bi bi-shop me-2"></i> Select Registered Vendor <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="vendorSearch"
                  v-model="vendorSearch"
                  placeholder="Type to search vendors..."
                  @input="filterVendors"
                  @focus="showDropdown = true"
                  @blur="delayHideDropdown"
                  required
                  autocomplete="off"
                />
                <ul
                  v-if="showDropdown && filteredVendors.length"
                  class="list-group dropdown-menu w-100 mt-1"
                  style="max-height: 200px; overflow-y: auto; position: absolute; z-index: 1000;"
                >
                  <li
                    v-for="vendor in filteredVendors"
                    :key="vendor.vendor_id"
                    class="list-group-item list-group-item-action"
                    @mousedown="selectVendor(vendor)"
                  >
                    {{ vendor.vendor_name }}
                  </li>
                </ul>
                <small v-if="formData.vendor_id" class="text-success">
                  Selected: {{ selectedVendorName }}
                </small>
                <small v-else class="text-muted">Type and select a vendor.</small>
              </div>

              <!-- Number of Tickets -->
              <div class="mb-3">
                <label for="tickets" class="form-label">
                  <i class="bi bi-ticket me-2"></i> How Many Tickets?
                </label>

                <input
                  type="number"
                  class="form-control"
                  id="tickets"
                  v-model.number="formData.tickets"
                  required
                  min="1"
                />
                <p class="text-success fw-bold">
                  You will pay: {{ formatCurrency(totalTicketCost) }}
                </p>
              </div>

              <!-- Hidden Fields (bound to validated raffle data) -->
              <input type="hidden" v-model="formData.raffle_cycle_id" />
              <input type="hidden" v-model="formData.raffle_type_id" />
              <input type="hidden" v-model="formData.winnable_amount" />
              <input type="hidden" v-model="formData.price_of_ticket" />

              <button
                type="submit"
                class="btn btn-orange custom-width mb-3 d-inline-flex align-items-center gap-2"
                :disabled="!canSubmit || isRedirecting"
                :aria-busy="isRedirecting ? 'true' : 'false'"
                :title="!canSubmit ? 'Enter phone, select vendor, set tickets, and wait for price' : ''"
              >
                <i v-if="!isRedirecting" class="bi bi-cash-coin"></i>
                <span v-if="!isRedirecting">Pay By Chance</span>
                <span v-else class="d-inline-flex align-items-center gap-2">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Redirecting…</span>
                </span>
              </button>
              <button
                type="button"
                class="btn btn-secondary custom-width mb-3 ms-2"
                @click="showFullForm = false"
                :disabled="isRedirecting"
              >
                <i class="bi bi-arrow-left-circle me-2"></i> Back
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
/**
 * Pay4MeForm.vue
 *
 * Two-step “Pay Merchant” (Pay Vendor) entry flow.
 *
 * Security & Flow notes:
 * - We retrieve raffle details (server-validated) and display authoritative ticket_price.
 * - We call the Context Proxy with canonical keys for "create_order".
 * - For robustness during rollout, we also include a `params` block with legacy aliases.
 * - `processPayment` sends the user to Squad and returns to /thank-you?reference=...
 */

import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { validateRaffleCycle } from "@/services/productService";
import { fetchVendors } from "@/services/fetchVendors";
import formatCurrency from "@/services/currencyFormatter";
import { createOrder, processPayment } from "@/services/paymentService";

/**
 * @typedef {Object} Vendor
 * @property {number|string} vendor_id
 * @property {string} vendor_name
 */

/**
 * @typedef {Object} RaffleData
 * @property {number|string} raffle_cycle_id
 * @property {number|string} raffle_type_id
 * @property {number|string} price_of_ticket
 * @property {number|string} winnable_amount
 */

/**
 * @typedef {Object} FormModel
 * @property {string} customerPhone
 * @property {number} tickets
 * @property {number|null} raffle_cycle_id
 * @property {number|null} raffle_type_id
 * @property {number|string} winnable_amount
 * @property {number|string} price_of_ticket
 * @property {number|string} vendor_id
 */

export default {
  name: "Pay4MeForm",
  setup() {
    const router = useRouter();
    const route  = useRoute();

    // ---- Route params (stringy from query) ----
    const raffleCycleId = Number(route.query.raffle_cycle_id || 0);
    const raffleTypeId  = Number(route.query.raffle_type_id || 0); // may be missing

    // ---- State ----
    /** @type {import('vue').Ref<RaffleData|Object>} */
    const raffleData         = ref({});
    const ticketCurrentPrice = ref(0);
    const showFullForm       = ref(false);
    const isLoading          = ref(true);
    const isRedirecting      = ref(false);

    /** @type {import('vue').Ref<Vendor[]>} */
    const vendors         = ref([]);
    /** @type {import('vue').Ref<Vendor[]>} */
    const filteredVendors = ref([]);
    const vendorSearch    = ref("");
    const showDropdown    = ref(false);

    // Form model
    /** @type {import('vue').Ref<FormModel>} */
    const formData = ref({
      customerPhone: "",
      tickets: 1,
      raffle_cycle_id: raffleCycleId || null, // will be overwritten after server validation
      raffle_type_id: raffleTypeId || null,   // may be null; we infer below if vendor selected
      winnable_amount: "",
      price_of_ticket: "",
      vendor_id: "", // numeric string or number from list
    });

    /** Disable dropdown hiding until click completes. */
    const delayHideDropdown = () => {
      setTimeout(() => { showDropdown.value = false; }, 150);
    };

    /**
     * Fetch and validate raffle details for the given cycle and type.
     * Always trust server-provided IDs and prices.
     * @returns {Promise<void>}
     */
    const fetchRaffleDetails = async () => {
      if (!raffleCycleId) {
        console.warn("⚠ Missing raffle_cycle_id in URL.");
        isLoading.value = false;
        return;
      }
      try {
        // fallback: if no raffleTypeId in URL, send 2 for Pay Vendor (this page)
        const typeForCheck = raffleTypeId || 2;
        const validatedRaffle = await validateRaffleCycle(raffleCycleId, typeForCheck);
        if (validatedRaffle) {
          raffleData.value                 = validatedRaffle;
          formData.value.raffle_cycle_id   = Number(validatedRaffle.raffle_cycle_id);
          formData.value.raffle_type_id    = Number(validatedRaffle.raffle_type_id || typeForCheck);
          formData.value.winnable_amount   = validatedRaffle.winnable_amount;
          formData.value.price_of_ticket   = validatedRaffle.price_of_ticket;
          ticketCurrentPrice.value         = Number(validatedRaffle.price_of_ticket);
        } else {
          console.error("❌ Raffle validation failed. Redirecting...");
          router.push("/404");
        }
      } catch (error) {
        console.error("❌ Error validating raffle cycle:", error);
      } finally {
        isLoading.value = false;
      }
    };

    /**
     * Populate registered vendors for selection.
     * @returns {Promise<void>}
     */
    const fetchVendorList = async () => {
      try {
        const vendorData = await fetchVendors();
        vendors.value = vendorData;
        filteredVendors.value = vendorData;
      } catch (error) {
        console.error("❌ Error fetching vendors:", error);
      }
    };

    /**
     * Live filter vendors by name.
     * @returns {void}
     */
    const filterVendors = () => {
      const searchTerm = vendorSearch.value.toLowerCase().trim();
      if (!searchTerm) {
        filteredVendors.value = vendors.value;
        formData.value.vendor_id = "";
      } else {
        filteredVendors.value = vendors.value.filter((vendor) =>
          String(vendor.vendor_name || "").toLowerCase().includes(searchTerm)
        );
      }
    };

    /**
     * Select a vendor; coerce ID to number for safety.
     * @param {Vendor} vendor
     * @returns {void}
     */
    const selectVendor = (vendor) => {
      formData.value.vendor_id = Number(vendor.vendor_id);
      vendorSearch.value = vendor.vendor_name;
      showDropdown.value = false;

      // If type wasn't set (URL missing), infer Pay Vendor (2) when a vendor is chosen.
      if (!formData.value.raffle_type_id) {
        formData.value.raffle_type_id = 2;
      }
    };

    /**
     * Selected vendor name for display.
     * @returns {import('vue').ComputedRef<string>}
     */
    const selectedVendorName = computed(() => {
      const vid = Number(formData.value.vendor_id || 0);
      const selected = vendors.value.find((v) => Number(v.vendor_id) === vid);
      return selected ? selected.vendor_name : "";
    });

    /** Numeric winnable amount (from server). */
    const winnableAmount = computed(() => Number(raffleData.value.winnable_amount || 0));

    /** Winnable amount formatted in NGN. */
    const formattedWinnableAmount = computed(() =>
      winnableAmount.value
        ? Number(winnableAmount.value).toLocaleString("en-NG", { style: "currency", currency: "NGN" })
        : "Loading..."
    );

    /**
     * Total ticket cost based on current price and quantity.
     * @returns {import('vue').ComputedRef<number>}
     */
    const totalTicketCost = computed(() => {
      const t = Number(formData.value.tickets) || 0;
      const p = Number(ticketCurrentPrice.value) || 0;
      return t > 0 && p > 0 ? t * p : 0;
    });

    /**
     * Final raffle_type_id to send (explicit or inferred from vendor selection).
     * @returns {import('vue').ComputedRef<number>}
     */
    const resolvedRaffleTypeId = computed(() => {
      const explicit = Number(formData.value.raffle_type_id || 0);
      if (explicit > 0) return explicit;
      return Number(formData.value.vendor_id) > 0 ? 2 : 1;
    });

    /**
     * Form can submit only when all critical parts are present.
     * @returns {import('vue').ComputedRef<boolean>}
     */
    const canSubmit = computed(() => {
      return !!formData.value.customerPhone
        && Number(formData.value.vendor_id) > 0
        && Number(formData.value.tickets) >= 1
        && Number(ticketCurrentPrice.value) > 0
        && Number(formData.value.raffle_cycle_id) > 0;
    });

    /**
     * Submit the form: create an order, then initiate payment via Squad.
     * Squad will redirect back to /thank-you?reference=...
     * Sets a preloader + disables controls during redirect.
     * @returns {Promise<void>}
     */
    const handleSubmit = async () => {
      if (!navigator.onLine) {
        alert("You are offline. Please check your internet connection and try again.");
        return;
      }
      if (!canSubmit.value || isRedirecting.value) {
        return;
      }

      try {
        isRedirecting.value = true;

        // Build canonical payload (what backend expects).
        const canonical = {
          action_type: 'create_order',                        // harmless if service already sets this
          customer_phone: String(formData.value.customerPhone),
          ticket_quantity: Number(formData.value.tickets),
          order_amount: Number(totalTicketCost.value),
          raffle_cycle_id: Number(formData.value.raffle_cycle_id),
          raffle_type_id: Number(resolvedRaffleTypeId.value), // ensure 2 for Pay Vendor flow
          vendor_id: Number(formData.value.vendor_id),
          purchase_platform: 'web',
          payment_method_used: 'card'
        };

        // For robustness during rollout: include legacy aliases under params.
        // Safe to delete later when you’re confident end-to-end.
        const body = {
          ...canonical,
          params: {
            ...canonical,
            phoneNumber: canonical.customer_phone,   // legacy
            tickets: canonical.ticket_quantity,      // legacy
            amount: canonical.order_amount,          // legacy
            platform: canonical.purchase_platform,   // legacy
            paymentMethod: canonical.payment_method_used // legacy
          }
        };

        console.debug("▶ createOrder payload (component)", body);

        const response = await createOrder(body);

        // 2) Initiate payment and redirect to Squad
        if (!response?.order_id) {
          isRedirecting.value = false;
          alert(`Error: ${response?.message || 'Could not create order.'}`);
          return;
        }

        const txRef = response.order_id;
        const returnUrl = `${window.location.origin}/thank-you?reference=${encodeURIComponent(txRef)}`;
        await processPayment({
          email: `${formData.value.customerPhone}@paybychance.com`,
          amount: Number(totalTicketCost.value),
          trans_ref: txRef,
          returnUrl, // server uses this to set Squad callback_url
        });
        // processPayment redirects; no code runs after this.
      } catch (error) {
        console.error("❌ Submission error:", error);
        const serverMsg = error?.response?.data?.message || error?.message || "Failed to submit order. Please try again.";
        alert(`Error: ${serverMsg}`);
        isRedirecting.value = false;
      }
    };

    onMounted(async () => {
      await fetchRaffleDetails();
      await fetchVendorList();
    });

    return {
      formData,
      showFullForm,
      isLoading,
      isRedirecting,
      vendorSearch,
      filteredVendors,
      showDropdown,
      delayHideDropdown,
      handleSubmit,
      raffleData,
      winnableAmount,
      formattedWinnableAmount,
      formatCurrency,
      totalTicketCost,
      ticketCurrentPrice,
      filterVendors,
      selectVendor,
      selectedVendorName,
      canSubmit,
      resolvedRaffleTypeId,
    };
  },
};
</script>

<style scoped>
.text-purple { color: #6f42c1; }
.btn-orange { background-color: #ff6f00; color: white; border: none; }
.btn-orange:hover { background-color: #e65d00; }
.list-group-item-action:hover { cursor: pointer; background-color: #f8f9fa; }
.dropdown-menu { display: block; }
.custom-width { width: 200px; }
.spinner-border { vertical-align: -0.125em; }
</style>
