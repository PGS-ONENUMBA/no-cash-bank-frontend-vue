<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Vendor Details / Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <h3 class="text-muted fs-4">
              We can pay for you to cover expenses up to {{ formattedWinnableAmount }}
              at the ticket price of:
              <span v-if="ticketCurrentPrice > 0">{{ formatCurrency(ticketCurrentPrice) }}</span>
            </h3>
            <p class="text-success fs-5">Winnable Amount: {{ formattedWinnableAmount }}</p>

            <div v-if="vendorDetails" class="mt-3">
              <h5 class="fw-bold"><i class="bi bi-shop"></i> Vendor</h5>
              <p class="mb-1"><strong>Name:</strong> {{ vendorDetails.business_name || vendorDetails.vendor_name }}</p>
              <p class="mb-1"><strong>Address:</strong> {{ vendorDetails.business_address }}</p>
              <p class="mb-1"><strong>Industry:</strong> {{ vendorDetails.industry }}</p>
              <p class="mb-1" v-if="vendorDetails.contact_name"><strong>Contact:</strong> {{ vendorDetails.contact_name }}</p>
            </div>

            <h5 class="fw-bold mt-4"><i class="bi bi-lightbulb"></i> How It Works</h5>
            <ul class="list-unstyled">
              <li><i class="bi bi-1-circle text-success"></i> Enter your phone number.</li>
              <li><i class="bi bi-2-circle text-success"></i> Choose how many tickets to buy.</li>
              <li><i class="bi bi-3-circle text-success"></i> If you win, your win is locked to this vendor—spend it there.</li>
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

            <!-- Step 1: Customer Phone (same as Pay4MeForm) -->
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

            <!-- Step 2: Tickets only (vendor & type come from URL) -->
            <form v-else @submit.prevent="handleSubmit">
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

              <!-- Hidden Fields (bound to validated raffle data) -->
              <input type="hidden" v-model="formData.raffle_cycle_id" />
              <input type="hidden" v-model="formData.raffle_type_id" />
              <input type="hidden" v-model="formData.winnable_amount" />
              <input type="hidden" v-model="formData.price_of_ticket" />
              <input type="hidden" v-model="formData.vendor_id" />

              <button
                type="submit"
                class="btn btn-orange custom-width mb-3"
                :disabled="!canSubmit"
                :title="!canSubmit ? 'Enter phone, set tickets, and wait for price' : ''"
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
 * Scan2Pay4Me.vue — aligned 1:1 with Pay4MeForm logic.
 * Differences:
 * - Vendor and Raffle Type are provided via URL: /scan2pay4me?raffle_type_id=2&vendor_id=3
 * - No vendor search, no amount_due; all other logic mirrors Pay4MeForm.
 */
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { fetchProducts, fetchVendorDetails, validateRaffleCycle } from '@/services/productService';
import formatCurrency from '@/services/currencyFormatter';
import { createOrder, processPayment } from '@/services/paymentService';

export default {
  name: 'Scan2Pay4Me',
  setup() {
    const router = useRouter();
    const route  = useRoute();

    // ---- Route params ----
    const raffleTypeIdFromUrl = Number(route.query.raffle_type_id || 0); // must be 2 for this flow
    const vendorIdFromUrl     = Number(route.query.vendor_id || 0);

    // ---- State ----
    const raffleData         = ref({});
    const ticketCurrentPrice = ref(0);
    const showFullForm       = ref(false);
    const isLoading          = ref(true);

    const vendorDetails      = ref(null);

    // Form model (aligned with Pay4MeForm)
    const formData = ref({
      customerPhone: '',
      tickets: 1,
      raffle_cycle_id: null,  // will be resolved from products -> validated via validateRaffleCycle
      raffle_type_id: null,   // set from URL (2)
      winnable_amount: '',
      price_of_ticket: '',
      vendor_id: null,        // set from URL
    });

    /** Numeric winnable amount (from server). */
    const winnableAmount = computed(() => Number(raffleData.value.winnable_amount || 0));

    /** Winnable amount formatted in NGN. */
    const formattedWinnableAmount = computed(() =>
      winnableAmount.value
        ? Number(winnableAmount.value).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })
        : 'Loading...'
    );

    /** Total ticket cost based on current price and quantity. */
    const totalTicketCost = computed(() => {
      const t = Number(formData.value.tickets) || 0;
      const p = Number(ticketCurrentPrice.value) || 0;
      return t > 0 && p > 0 ? t * p : 0;
    });

    /** Form can submit only when all critical parts are present. */
    const canSubmit = computed(() => {
      return !!formData.value.customerPhone
        && Number(formData.value.tickets) >= 1
        && Number(ticketCurrentPrice.value) > 0
        && Number(formData.value.raffle_cycle_id) > 0
        && Number(formData.value.vendor_id) > 0
        && Number(formData.value.raffle_type_id) > 0;
    });

    /**
     * Bootstrap: resolve raffle_cycle_id from products using raffle_type_id, then
     * validate cycle & price; fetch vendor details from vendor_id.
     */
    const bootstrap = async () => {
      if (!raffleTypeIdFromUrl || !vendorIdFromUrl) {
        console.warn('⚠ Missing QR code parameters.');
        router.push('/dashboard');
        return;
      }
      try {
        // 1) Resolve raffle_cycle_id by scanning products for associated_types
        const cycles = await fetchProducts();
        const cycle = Array.isArray(cycles) ?
          cycles.find(c => Array.isArray(c.associated_types) && c.associated_types.some(t => Number(t.raffle_type_id) === raffleTypeIdFromUrl))
          : null;
        if (!cycle) {
          console.error('❌ No matching raffle cycle found.');
          router.push('/dashboard');
          return;
        }

        // 2) Validate via server to get authoritative price & IDs
        const validated = await validateRaffleCycle(Number(cycle.raffle_cycle_id), raffleTypeIdFromUrl);
        if (!validated) {
          console.error('❌ Raffle validation failed.');
          router.push('/404');
          return;
        }

        raffleData.value               = validated;
        formData.value.raffle_cycle_id = Number(validated.raffle_cycle_id);
        formData.value.raffle_type_id  = Number(validated.raffle_type_id || raffleTypeIdFromUrl);
        formData.value.winnable_amount = validated.winnable_amount;
        formData.value.price_of_ticket = validated.price_of_ticket;
        ticketCurrentPrice.value       = Number(validated.price_of_ticket);

        // 3) Set vendor from URL and fetch details for display
        formData.value.vendor_id = Number(vendorIdFromUrl);
        const vendor = await fetchVendorDetails(vendorIdFromUrl);
        vendorDetails.value = vendor || null;
      } catch (err) {
        console.error('❌ Error during bootstrap:', err);
      } finally {
        isLoading.value = false;
      }
    };

    /**
     * Submit the form: create an order, then initiate payment via Squad.
     * Squad will redirect back to /thank-you?reference=...
     */
    const handleSubmit = async () => {
      if (!navigator.onLine) {
        alert('You are offline. Please check your internet connection and try again.');
        return;
      }
      if (!canSubmit.value) {
        alert('Please complete all required fields.');
        return;
      }
      try {
        // Canonical payload (what backend expects) — mirrors Pay4MeForm
        const canonical = {
          customer_phone: String(formData.value.customerPhone),
          ticket_quantity: Number(formData.value.tickets),
          order_amount: Number(totalTicketCost.value),
          raffle_cycle_id: Number(formData.value.raffle_cycle_id),
          raffle_type_id: Number(formData.value.raffle_type_id), // 2 from URL
          vendor_id: Number(formData.value.vendor_id),           // from URL
          purchase_platform: 'web',
          payment_method_used: 'card',
        };

        const response = await createOrder(canonical);
        if (!response?.order_id) {
          alert(`Error: ${response?.message || 'Could not create order.'}`);
          return;
        }

        const txRef = response.order_id;
        const returnUrl = `${window.location.origin}/thank-you?reference=${encodeURIComponent(txRef)}`;
        await processPayment({
          email: `${formData.value.customerPhone}@paybychance.com`,
          amount: Number(totalTicketCost.value),
          trans_ref: txRef,
          returnUrl,
        });
        // NOTE: processPayment redirects the browser; no code runs after this.
      } catch (error) {
        console.error('❌ Submission error:', error);
        const serverMsg = error?.response?.data?.message || error?.message || 'Failed to submit order. Please try again.';
        alert(`Error: ${serverMsg}`);
      }
    };

    onMounted(bootstrap);

    return {
      // state
      vendorDetails,
      raffleData,
      ticketCurrentPrice,
      isLoading,
      showFullForm,

      // form
      formData,
      handleSubmit,

      // computed
      winnableAmount,
      formattedWinnableAmount,
      totalTicketCost,
      canSubmit,

      // utils
      formatCurrency,
    };
  },
};
</script>

<style scoped>
.text-purple { color: #6f42c1; }
.btn-orange { background-color: #ff6f00; color: white; border: none; }
.btn-orange:hover { background-color: #e65d00; }
.custom-width { width: 200px; }
.card-body { padding: 1.25rem; }
.list-group-item-action:hover { cursor: pointer; background-color: #f8f9fa; }
.dropdown-menu { display: block; }
</style>
