<!-- src/components/forms/DynamicProductForm.vue -->
<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">

      <!-- LEFT COLUMN: Generic product/raffle summary -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">

            <!-- Winnable amount -->
            <p class="text-muted fs-4">
              Winnable amount:
              <span v-if="raffleData.winnable_amount">
                {{ formatCurrency(raffleData.winnable_amount) }}
              </span>
              <span v-else>
                <i class="bi bi-arrow-repeat text-muted"></i> Loading...
              </span>
            </p>

            <!-- Ticket price -->
            <p class="text-success fs-5">
              Current ticket price:
              <span v-if="ticketCurrentPrice > 0">
                {{ formatCurrency(ticketCurrentPrice) }}
              </span>
              <span v-else>
                <i class="bi bi-arrow-repeat text-muted"></i> Loading...
              </span>
            </p>

            <!-- Simple guide -->
            <ul class="list-unstyled">
              <li><i class="bi bi-1-circle text-success"></i> Fill the form.</li>
              <li><i class="bi bi-2-circle text-success"></i> Submit and pay.</li>
              <li><i class="bi bi-3-circle text-success"></i> Wait for confirmation.</li>
            </ul>

          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Dynamic form rendering -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title pb-3 fs-4">{{ config.label }} Request</h2>

            <form @submit.prevent="handleSubmit">

              <!-- Build fields from config -->
              <div
                v-for="field in visibleFields"
                :key="field.name"
                class="mb-3"
              >
                <label :for="field.name" class="form-label">
                  <i v-if="field.icon" :class="['me-2', 'bi', field.icon]"></i>
                  {{ field.label }}
                  <span v-if="field.required" class="text-danger">*</span>
                </label>

                <!-- Standard input field -->
                <input
                  v-if="['text','email','tel','number'].includes(field.type)"
                  :id="field.name"
                  :type="field.type === 'number' ? 'number' : field.type"
                  class="form-control"
                  v-model="formData[field.name]"
                  :required="field.required"
                  :min="field.min"
                  :placeholder="field.placeholder || ''"
                />

                <!-- Vendor select (only Pay Merchant uses this) -->
                <VendorSelect
                  v-else-if="field.type === 'vendorSelect'"
                  v-model="formData.vendor_id"
                />
              </div>

              <!-- Hidden fields required by API -->
              <input
                v-for="field in hiddenFields"
                :key="field.name"
                type="hidden"
                v-model="formData[field.name]"
              />

              <!-- Ticket total -->
              <p class="text-success fw-bold" v-if="totalTicketCost > 0">
                You will pay: {{ formatCurrency(totalTicketCost) }}
              </p>

              <!-- Submit -->
              <button
                type="submit"
                class="btn btn-orange custom-width mb-3 d-inline-flex align-items-center gap-2"
                :disabled="isSubmitting || !canSubmit"
              >
                <span v-if="!isSubmitting">
                  <i class="bi bi-cash-coin me-2"></i> Pay By Chance
                </span>
                <span v-else class="d-inline-flex align-items-center gap-2">
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                  <span>Processing…</span>
                </span>
              </button>

            </form>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { validateRaffleCycle, validateProductPricing } from "@/services/productService";
import { createOrder, processPayment } from "@/services/paymentService";
import formatCurrency from "@/services/currencyFormatter";
import VendorSelect from "@/components/common/VendorSelect.vue";

export default {
  name: "DynamicProductForm",
  components: { VendorSelect },

  props: {
    // Product config from PRODUCT_CONFIG
    config: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const route = useRoute();

    // Raffle cycle comes from URL query; default to 1 if missing
    const raffleCycleIdFromUrl = route.query.raffle_cycle_id
      ? Number(route.query.raffle_cycle_id)
      : 1;

    // Default raffle type for the product (from config)
    const raffleTypeId = props.config.raffleTypeId;

    // State
    const raffleData = ref({});
    const ticketCurrentPrice = ref(0);
    const isSubmitting = ref(false);

    // Build reactive form model from config fields
    const formData = reactive({});
    props.config.fields.forEach((field) => {
      formData[field.name] = field.type === "number" ? 1 : "";
    });

    // Fields to render vs hidden fields
    const visibleFields = computed(() =>
      props.config.fields.filter((f) => f.type !== "hidden")
    );
    const hiddenFields = computed(() =>
      props.config.fields.filter((f) => f.type === "hidden")
    );

    // Total ticket cost (for display and backend)
    const totalTicketCost = computed(() => {
      const tickets = Number(formData.tickets || 0);
      if (!tickets || !ticketCurrentPrice.value) return 0;
      return tickets * ticketCurrentPrice.value;
    });

    // Simple client-side required-field check
    const canSubmit = computed(() => {
      for (const field of props.config.fields) {
        if (!field.required) continue;
        if (!formData[field.name]) return false;
      }
      if (formData.tickets && Number(formData.tickets) < 1) return false;
      if (!ticketCurrentPrice.value) return false;
      return true;
    });

    // Fetch raffle details + current ticket price from backend
    const bootstrapRaffle = async () => {
      try {
        const validated = await validateRaffleCycle(
          raffleCycleIdFromUrl,
          raffleTypeId
        );

        if (!validated) {
          console.error("Raffle validation failed");
          return;
        }

        raffleData.value = validated;

        // Hidden fields for API
        formData.raffle_cycle_id = Number(validated.raffle_cycle_id);
        formData.raffle_type_id = Number(validated.raffle_type_id);
        formData.winnable_amount = validated.winnable_amount;
        formData.price_of_ticket = validated.price_of_ticket;

        // Always fetch current ticket price from pricing endpoint
        const priceResp = await validateProductPricing(
          Number(validated.raffle_cycle_id)
        );
        ticketCurrentPrice.value = Number(
          priceResp?.raffle_cycle?.ticket_price || validated.price_of_ticket
        );
      } catch (err) {
        console.error("Error bootstrapping raffle:", err);
      }
    };

    // Build canonical payload sent to backend create_order handler
    const buildCanonicalPayload = () => {
      const base = {
        raffle_cycle_id: Number(formData.raffle_cycle_id),
        raffle_type_id: Number(formData.raffle_type_id || raffleTypeId),
        ticket_quantity: Number(formData.tickets),
        order_amount: Number(totalTicketCost.value),
        purchase_platform: "web",
        payment_method_used: "card",
      };

      switch (props.config.key) {
        case "pay-merchant":
          // Pay Merchant: customer phone + vendor_id
          return {
            ...base,
            customer_phone: String(formData.customerPhone),
            vendor_id: Number(formData.vendor_id),
          };

        case "transfer-moni":
          // Transfer Moni: sender + recipient
          return {
            ...base,
            customer_phone: String(formData.senderPhone),
            recipient_phone: String(formData.recipientPhone),
            recipient_email:
              formData.recipientEmail ||
              `${formData.recipientPhone}@paybychance.com`,
          };

        case "on-the-house":
        case "withdraw-cash":
        default:
          // Simple flows: one phone number and optional email
          return {
            ...base,
            customer_phone: String(
              formData.phoneNumber || formData.customerPhone
            ),
            recipient_phone: null,
            recipient_email:
              formData.email ||
              `${formData.phoneNumber || formData.customerPhone}@paybychance.com`,
          };
      }
    };

    // Submit handler: create order then redirect to Squad
    const handleSubmit = async () => {
      if (!navigator.onLine) {
        alert("You are offline. Please check your internet connection.");
        return;
      }
      if (!canSubmit.value || isSubmitting.value) return;

      try {
        isSubmitting.value = true;

        const canonical = buildCanonicalPayload();
        let payload = canonical;

        // For Pay Merchant keep the legacy shape with params
        if (props.config.key === "pay-merchant") {
          canonical.action_type = "create_order";

          payload = {
            ...canonical,
            params: {
              ...canonical,
              phoneNumber: canonical.customer_phone,
              tickets: canonical.ticket_quantity,
              amount: canonical.order_amount,
              platform: canonical.purchase_platform,
              paymentMethod: canonical.payment_method_used,
            },
          };
        }

        const response = await createOrder(payload);

        if (!response?.order_id) {
          alert(response?.message || "Could not create order");
          isSubmitting.value = false;
          return;
        }

        const txRef = response.order_id;
        const emailForPayment =
          canonical.recipient_email ||
          canonical.customer_phone + "@paybychance.com";
        const returnUrl = `${window.location.origin}/thank-you?reference=${encodeURIComponent(
          txRef
        )}`;

        await processPayment({
          email: emailForPayment,
          amount: canonical.order_amount,
          trans_ref: txRef,
          returnUrl,
        });
        // Squad handles redirect from here
      } catch (err) {
        console.error("Submission error:", err);
        const serverMsg =
          err?.response?.data?.message || err?.message || "Submit failed";
        alert(`Error: ${serverMsg}`);
        isSubmitting.value = false;
      }
    };

    onMounted(bootstrapRaffle);

    return {
      formData,
      raffleData,
      ticketCurrentPrice,
      totalTicketCost,
      formatCurrency,
      handleSubmit,
      canSubmit,
      isSubmitting,
      visibleFields,
      hiddenFields,
    };
  },
};
</script>


<style scoped>
.btn-orange {
  background-color: #ff6f00;
  color: white;
  border: none;
}
.btn-orange:hover {
  background-color: #e65d00;
}
.custom-width {
  width: 200px;
}
</style>
