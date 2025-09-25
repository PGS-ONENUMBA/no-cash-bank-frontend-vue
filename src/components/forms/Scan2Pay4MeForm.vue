<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Vendor Details -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <div class="text-center mb-4 mt-5">
              <h3 class="fw-bold fs-4">
                <i class="bi bi-qr-code-scan me-2"></i> Pay Vendor via QR Code Scan
              </h3>
            </div>
            <p class="text-success fs-5">
              Spendable Amount: {{ formattedWinnableAmount }}
            </p>
            <div v-if="vendorDetails" class="mt-2">
              <p><strong>Business Name:</strong> {{ vendorDetails.business_name }}</p>
              <p><strong>Address:</strong> {{ vendorDetails.business_address }}</p>
              <p><strong>Industry:</strong> {{ vendorDetails.industry }}</p>
              <p><strong>Phone:</strong> {{ formData.recipient_phone_number }}</p>
              <p><strong>Contact:</strong> {{ vendorDetails.contact_name }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Form -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-2">
                <label for="phoneNumber" class="form-label">
                  <i class="bi bi-telephone me-2"></i> Your Phone Number
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="phoneNumber"
                  v-model.trim="formData.phone_number"
                  required
                />
              </div>

              <div class="mb-2">
                <label for="amountDue" class="form-label">
                  <i class="bi bi-currency-exchange me-2"></i> Amount Due (NGN)
                </label>
                <input
                  type="number"
                  class="form-control"
                  id="amountDue"
                  v-model.number="formData.amount_due"
                  required
                  min="1"
                />
              </div>

              <div class="mb-2">
                <label for="tickets" class="form-label">
                  <i class="bi bi-ticket me-2"></i> How Many Tickets?
                </label>

                <!-- Show ticket price per unit -->
                <p class="text-muted mb-1">
                  Ticket Price:
                  <span class="fw-semibold">
                    {{ Number(formData.ticket_price || 0).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }) }}
                  </span>
                </p>

                <input
                  type="number"
                  class="form-control"
                  id="tickets"
                  v-model.number="formData.tickets"
                  required
                  min="1"
                />

                <!-- Total cost preview -->
                <p class="text-success fw-bold mt-1">
                  You will pay: {{ totalTicketCost.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }) }}
                </p>
              </div>

              <!-- Hidden Fields (canonical names) -->
              <input type="hidden" v-model="formData.raffle_cycle_id" />
              <input type="hidden" v-model="formData.raffle_type_id" />
              <input type="hidden" v-model="formData.winnable_amount" />
              <input type="hidden" v-model="formData.ticket_price" />
              <input type="hidden" v-model="formData.vendor_id" />

              <button type="submit" class="btn btn-orange custom-width mt-2" :disabled="isSubmitting">
                <i class="bi bi-qr-code-scan me-2"></i> Pay By Chance
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { fetchProducts, fetchVendorDetails } from '@/services/productService';
import { createOrder, processPayment } from '@/services/paymentService';

/**
 * Canonical payload schema (agreed):
 * {
 *   phone_number: string,
 *   raffle_type_id: number,
 *   raffle_cycle_id: number,
 *   tickets: number,
 *   ticket_price: number,
 *   amount: number,                // tickets * ticket_price
 *   vendor_id?: string|number,     // present in vendor/QR flow
 *   amount_due?: number,           // vendor invoice/amount to settle
 *   recipient_phone_number?: string
 * }
 */
export default {
  name: 'Scan2Pay4Me',
  setup() {
    const router = useRouter();
    const route = useRoute();

    const raffleData = ref({});
    const vendorDetails = ref(null);
    const isSubmitting = ref(false);

    const formData = ref({
      phone_number: '',
      recipient_phone_number: '',
      amount_due: null,
      tickets: 1,
      raffle_cycle_id: null,
      raffle_type_id: null,
      winnable_amount: null,
      ticket_price: null,
      vendor_id: null,
    });

    const totalTicketCost = computed(() => {
      const qty = Number(formData.value.tickets || 0);
      const unit = Number(formData.value.ticket_price || 0);
      return qty > 0 && unit > 0 ? qty * unit : 0;
    });

    const formattedWinnableAmount = computed(() => {
      return raffleData.value.winnable_amount
        ? Number(raffleData.value.winnable_amount).toLocaleString('en-NG', {
            style: 'currency',
            currency: 'NGN',
          })
        : 'Loading...';
    });

    const fetchRaffleDetails = async () => {
      const raffleTypeId = Number(route.query.raffle_type_id);
      const vendorId = route.query.vendor_id;

      if (!raffleTypeId || !vendorId) {
        console.warn('⚠ Missing QR code parameters.');
        router.push('/dashboard');
        return;
      }

      try {
        const cycles = await fetchProducts();
        if (cycles && cycles.length) {
          const cycle = cycles.find((c) =>
            Array.isArray(c.associated_types) &&
            c.associated_types.some((t) => Number(t.raffle_type_id) === raffleTypeId)
          );

          if (cycle) {
            raffleData.value = {
              raffle_cycle_id: Number(cycle.raffle_cycle_id),
              winnable_amount: Number(cycle.winnable_amount),
              ticket_price: Number(cycle.ticket_price),
              associated_types: cycle.associated_types,
            };

            formData.value.raffle_cycle_id = Number(cycle.raffle_cycle_id);
            formData.value.raffle_type_id = raffleTypeId; // ✅ include explicitly (no inference)
            formData.value.winnable_amount = Number(cycle.winnable_amount);
            formData.value.ticket_price = Number(cycle.ticket_price);
            formData.value.vendor_id = vendorId;
          } else {
            console.error('❌ No matching raffle cycle found.');
            router.push('/dashboard');
            return;
          }
        } else {
          console.error('❌ No raffle cycles available.');
          router.push('/404');
          return;
        }

        const vendor = await fetchVendorDetails(vendorId);
        if (vendor) {
          vendorDetails.value = {
            business_name: vendor.business_name,
            business_address: vendor.business_address,
            industry: vendor.industry,
            contact_name: vendor.contact_name,
          };
          formData.value.recipient_phone_number = vendor.phone_number || 'N/A';
          formData.value.vendor_id = vendor.vendor_id ?? vendorId;
        } else {
          console.error('❌ Vendor details fetch failed.');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('❌ Error fetching details:', error);
        router.push('/dashboard');
      }
    };

    const validateForm = () => {
      const f = formData.value;
      if (!f.phone_number || String(f.phone_number).length < 7) return 'Enter a valid phone number.';
      if (!f.recipient_phone_number) return "Recipient's phone number missing.";
      if (!f.amount_due || Number(f.amount_due) < 1) return 'Amount due must be at least ₦1.';
      if (!f.tickets || Number(f.tickets) < 1) return 'Tickets must be at least 1.';
      if (!f.raffle_cycle_id || !f.raffle_type_id) return 'Raffle identifiers are missing.';
      if (!f.ticket_price || Number(f.ticket_price) <= 0) return 'Ticket price unavailable.';
      return null;
    };

    const handleSubmit = async () => {
      const errorMsg = validateForm();
      if (errorMsg) {
        alert(errorMsg);
        return;
      }

      isSubmitting.value = true;
      try {
        const amount = totalTicketCost.value;

        // ✅ Canonical payload aligned to backend + paymentService
        const orderData = {
          phone_number: String(formData.value.phone_number),
          raffle_type_id: Number(formData.value.raffle_type_id),
          raffle_cycle_id: Number(formData.value.raffle_cycle_id),
          tickets: Number(formData.value.tickets),
          ticket_price: Number(formData.value.ticket_price),
          amount: Number(amount), // tickets * ticket_price
          vendor_id: formData.value.vendor_id, // present in this QR/vendor flow
          amount_due: Number(formData.value.amount_due),
          recipient_phone_number: String(formData.value.recipient_phone_number || ''),
        };

        const response = await createOrder(orderData);

        if (response?.order_id) {
          // Email derived from phone for payment modal consistency across flows
          const paymentResponse = await processPayment({
            email: `${orderData.phone_number}@paybychance.com`,
            amount: Number(amount),
            trans_ref: response.order_id,
          });

          // Align behavior with Pay4MeForm: redirect on success, stop on cancel
          if (paymentResponse?.status === 'closed') {
            console.log('❌ Payment Cancelled by user');
            return;
          }

          if (paymentResponse?.status === 'success' || paymentResponse?.paid === true) {
            router.push('/thank-you');
          } else {
            alert('Payment not completed. Please try again.');
          }
        } else {
          alert(`Error: ${response?.message || 'Could not create order.'}`);
        }
      } catch (error) {
        console.error('❌ Submission error:', error);
        alert('Failed to process payment. Please try again.');
      } finally {
        isSubmitting.value = false;
      }
    };

    onMounted(fetchRaffleDetails);

    return {
      formData,
      vendorDetails,
      handleSubmit,
      raffleData,
      formattedWinnableAmount,
      isSubmitting,
      totalTicketCost,
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
</style>
