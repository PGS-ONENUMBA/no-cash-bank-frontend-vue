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
                  v-model="formData.customerPhone"
                  required
                  inputmode="numeric"
                  autocomplete="tel"
                  placeholder="e.g., 09012345678"
                />
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
                <div class="mb-1" v-if="ticketCurrentPrice > 0">
                  Current Ticket Price: {{ formatCurrency(ticketCurrentPrice) }}
                </div>
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

              <!-- Hidden Fields -->
              <input type="hidden" v-model="formData.raffle_cycle_id" />
              <input type="hidden" v-model="formData.raffle_type_id" />
              <input type="hidden" v-model="formData.winnable_amount" />
              <input type="hidden" v-model="formData.price_of_ticket" />

              <button
                type="submit"
                class="btn btn-orange custom-width mb-3"
                :disabled="!formData.vendor_id || !formData.tickets || ticketCurrentPrice <= 0"
                title="Select a vendor to continue"
              >
                <i class="bi bi-cash-coin me-2"></i> Pay By Chance
              </button>
              <button
                type="button"
                class="btn btn-secondary custom-width mb-3 ms-2"
                @click="showFullForm = false"
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
 * A guided, two-step flow for “Pay Merchant”:
 *  - Step 1: capture customer's phone number.
 *  - Step 2: require a registered vendor + number of tickets (no vendor amount field).
 *
 * Security & Flow notes:
 *  - Uses backend Context Proxy + CSRF for all API operations.
 *  - `processPayment` redirects to Squad; we pass `returnUrl` so Squad returns the user
 *    to `/thank-you?reference=...` which then verifies server-side.
 */

import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { validateRaffleCycle } from "@/services/productService";
import { fetchVendors } from "@/services/fetchVendors";
import formatCurrency from "@/services/currencyFormatter";
import { createOrder, processPayment } from "@/services/paymentService";

/**
 * @typedef {Object} Vendor
 * @property {number|string} vendor_id   Unique vendor identifier.
 * @property {string}        vendor_name Display name for the vendor.
 */

export default {
  name: "Pay4MeForm",
  setup() {
    const router = useRouter();
    const route  = useRoute();

    // ---- Route params ----
    const raffleCycleId = route.query.raffle_cycle_id;
    const raffleTypeId  = route.query.raffle_type_id;

    // ---- State ----
    const raffleData         = ref({});
    const ticketCurrentPrice = ref(0);
    const showFullForm       = ref(false);
    const isLoading          = ref(true);

    /** @type {import('vue').Ref<Vendor[]>} */
    const vendors         = ref([]);
    /** @type {import('vue').Ref<Vendor[]>} */
    const filteredVendors = ref([]);
    const vendorSearch    = ref("");
    const showDropdown    = ref(false);

    const formData = ref({
      customerPhone: "",
      tickets: 1,
      raffle_cycle_id: raffleCycleId,
      raffle_type_id: raffleTypeId,
      winnable_amount: "",
      price_of_ticket: "",
      vendor_id: "",
    });

    /**
     * Close the vendor dropdown slightly after blur so mousedown can select.
     * @returns {void}
     */
    const delayHideDropdown = () => {
      setTimeout(() => { showDropdown.value = false; }, 150);
    };

    /**
     * Fetch and validate raffle details for the given cycle and type.
     * Populates local state needed for price & limits.
     * @returns {Promise<void>}
     */
    const fetchRaffleDetails = async () => {
      if (!raffleCycleId || !raffleTypeId) {
        console.warn("⚠ Missing raffle cycle parameters in URL.");
        isLoading.value = false;
        return;
      }
      try {
        const validatedRaffle = await validateRaffleCycle(raffleCycleId, raffleTypeId);
        if (validatedRaffle) {
          raffleData.value                 = validatedRaffle;
          formData.value.raffle_cycle_id   = validatedRaffle.raffle_cycle_id;
          formData.value.raffle_type_id    = validatedRaffle.raffle_type_id;
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
     * Fetch list of registered vendors from the backend.
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
     * Filter vendors as the user types.
     * Resets selection when search is cleared.
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
     * Select a vendor from the dropdown suggestions.
     * @param {Vendor} vendor
     * @returns {void}
     */
    const selectVendor = (vendor) => {
      formData.value.vendor_id = vendor.vendor_id;
      vendorSearch.value = vendor.vendor_name;
      showDropdown.value = false;
    };

    /** Selected vendor name for display. */
    const selectedVendorName = computed(() => {
      const selected = vendors.value.find((v) => v.vendor_id === formData.value.vendor_id);
      return selected ? selected.vendor_name : "";
    });

    /** Numeric winnable amount for this raffle. */
    const winnableAmount = computed(() => Number(raffleData.value.winnable_amount || 0));

    /** Winnable amount formatted in NGN. */
    const formattedWinnableAmount = computed(() =>
      winnableAmount.value
        ? Number(winnableAmount.value).toLocaleString("en-NG", { style: "currency", currency: "NGN" })
        : "Loading..."
    );

    /** Total ticket cost based on current price and quantity. */
    const totalTicketCost = computed(() => {
      const t = Number(formData.value.tickets) || 0;
      const p = Number(ticketCurrentPrice.value) || 0;
      return t > 0 && p > 0 ? t * p : 0;
    });

    /**
     * Submit the form: create an order, then initiate payment via Squad.
     * IMPORTANT: Do not navigate to /thank-you here; `processPayment` redirects to Squad,
     * and Squad returns the user to the provided `returnUrl`.
     * @returns {Promise<void>}
     */
    const handleSubmit = async () => {
      if (!navigator.onLine) {
        alert("You are offline. Please check your internet connection and try again.");
        return;
      }
      if (isLoading.value || !winnableAmount.value) {
        alert("Please wait for raffle details to load.");
        return;
      }
      if (!formData.value.vendor_id) {
        alert("Please select a registered vendor.");
        return;
      }
      if (Number(formData.value.tickets) < 1) {
        alert("Please select at least one ticket.");
        return;
      }
      if (ticketCurrentPrice.value <= 0) {
        alert("Ticket price is unavailable at the moment. Please try again shortly.");
        return;
      }

      try {
        // 1) Create order (no amount_due here; wins are vendor-locked)
        const orderData = {
          phoneNumber: formData.value.customerPhone,
          tickets: Number(formData.value.tickets),
          amount: totalTicketCost.value,
          raffle_cycle_id: Number(raffleCycleId),
          vendor_id: formData.value.vendor_id,
        };

        const response = await createOrder(orderData);

        // 2) Initiate payment and redirect to Squad
        if (response?.order_id) {
          const txRef = response.order_id;
          const returnUrl = `${window.location.origin}/thank-you?reference=${encodeURIComponent(txRef)}`;

          const paymentResponse = await processPayment({
            email: `${formData.value.customerPhone}@paybychance.com`,
            amount: totalTicketCost.value,
            trans_ref: txRef,
            returnUrl, // server uses this to set Squad callback_url
          });

          if (paymentResponse?.status === "closed") {
            console.log("❌ Payment Cancelled by user");
            return;
          }
          // No router.push here—Squad handles redirect to returnUrl.
        }
      } catch (error) {
        console.error("❌ Submission error:", error?.message, error);
        if (error?.message === "Network Error") {
          alert("Network error. Please check your internet connection and try again.");
        } else {
          alert(`Error: ${error?.message || "Failed to submit order. Please try again."}`);
        }
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
</style>
