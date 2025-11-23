<!-- src/components/forms/DynamicProductForm.vue -->
<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">

      <!-- LEFT COLUMN: Product / raffle summary -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">

            <!-- Winnable amount -->
           <h3 class="text-muted fs-4" v-if="config.key === 'pay-merchant' && serviceDescriptionText">
                {{ serviceDescriptionText }}
            </h3>           <!-- Ticket price -->
            <p class="text-success fs-5">
              Reward Value:
              <span v-if="raffleData.winnable_amount">
                {{ formatCurrency(raffleData.winnable_amount) }}
              </span>
              <span v-else>
                <i class="bi bi-arrow-repeat text-muted"></i> Loading...
              </span>
            </p>
            <!-- Simple guide -->
             <h5 class="fw-bold mt-4"><i class="bi bi-lightbulb"></i> How It Works</h5>
            <ul class="list-unstyled">
              <li><i class="bi bi-1-circle text-success"></i> Fill the form.</li>
              <li><i class="bi bi-2-circle text-success"></i> Submit and pay.</li>
              <li><i class="bi bi-3-circle text-success"></i> Wait for confirmation.</li>
            </ul>

            <!-- Extra vendor details for QR Scan2Pay flow -->
            <div
              v-if="isQrMode && vendorDetails"
              class="mt-3"
            >
              <h5 class="fw-bold">
                <i class="bi bi-shop"></i> Vendor
              </h5>
              <p class="mb-1">
                <strong>Name:</strong>
                {{ vendorDetails.business_name || vendorDetails.vendor_name }}
              </p>
              <p
                v-if="vendorDetails.business_address"
                class="mb-1"
              >
                <strong>Address:</strong> {{ vendorDetails.business_address }}
              </p>
              <p
                v-if="vendorDetails.industry"
                class="mb-1"
              >
                <strong>Industry:</strong> {{ vendorDetails.industry }}
              </p>
              <p
                v-if="vendorDetails.contact_name"
                class="mb-1"
              >
                <strong>Contact:</strong> {{ vendorDetails.contact_name }}
              </p>
            </div>

          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Dynamic form rendering -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title pb-3 fs-4">
              {{ titleText }}
            </h2>

            <form @submit.prevent="handleSubmit">
              <!-- Dynamic fields -->
              <div
                v-for="field in visibleFields"
                :key="field.name"
                class="mb-3"
              >
                <label :for="field.name" class="form-label">
                  <i
                    v-if="field.icon"
                    :class="['me-2', 'bi', field.icon]"
                  ></i>
                  {{ field.label }}
                  <span
                    v-if="field.required"
                    class="text-danger"
                  >
                    *
                  </span>
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

                <!-- Vendor field: behaves differently in QR mode -->
                <template v-else-if="field.type === 'vendorSelect'">
                  <!-- QR mode: show locked vendor name, vendor_id is prefilled -->
                  <div v-if="isQrMode">
                    <input
                      type="text"
                      class="form-control"
                      :value="vendorDisplayName || 'Selected vendor'"
                      disabled
                    />
                    <!-- keep vendor_id bound for backend -->
                    <input
                      type="hidden"
                      v-model="formData.vendor_id"
                    />
                    <small class="text-muted">
                      Vendor is locked because you arrived from a Scan2Pay QR code.
                    </small>
                  </div>

                  <!-- Normal mode: full VendorSelect dropdown -->
                  <VendorSelect
                    v-else
                    v-model="formData.vendor_id"
                  />
                </template>
              </div>

              <!-- Hidden fields required by API -->
              <input
                v-for="field in hiddenFields"
                :key="field.name"
                type="hidden"
                v-model="formData[field.name]"
              />

              <!-- Ticket total -->
              <p
                class="text-success fw-bold"
                v-if="totalTicketCost > 0"
              >
                You will pay: {{ formatCurrency(totalTicketCost) }}
              </p>

              <!-- Submit button -->
              <button
                type="submit"
                class="btn btn-orange custom-width mb-3 d-inline-flex align-items-center gap-2"
                :disabled="isSubmitting || !canSubmit"
              >
                <span v-if="!isSubmitting">
                  <i class="bi bi-cash-coin me-2"></i>
                  Pay By Chance
                </span>
                <span
                  v-else
                  class="d-inline-flex align-items-center gap-2"
                >
                  <span
                    class="spinner-border spinner-border-sm"
                    role="status"
                  ></span>
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
import { fetchProducts, fetchVendorDetails } from "@/services/productService";
import { createOrder, processPayment } from "@/services/paymentService";
import formatCurrency from "@/services/currencyFormatter";
import VendorSelect from "@/components/common/VendorSelect.vue";
import { buildServiceDescription } from "@/config/productConfig"; // <- add this

export default {
  name: "DynamicProductForm",
  components: { VendorSelect },

  props: {
    config: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      default: "normal", // "normal" or "qr"
    },
    initialRaffleCycleId: {
      type: Number,
      default: 0,
    },
    initialRaffleTypeId: {
      type: Number,
      default: 0,
    },
    initialVendorId: {
      type: Number,
      default: 0,
    },
  },

  setup(props) {
    const route = useRoute();

    const isQrMode = computed(() => props.mode === "qr");

    // Use query param if present, otherwise initialRaffleCycleId, otherwise 1
    const raffleCycleIdFromUrl = route.query.raffle_cycle_id
      ? Number(route.query.raffle_cycle_id)
      : props.initialRaffleCycleId || 1;

    // Default raffle type for this product
    const raffleTypeId = props.initialRaffleTypeId || props.config.raffleTypeId;

    // State
    const raffleData = ref({});
    const ticketCurrentPrice = ref(0);
    const isSubmitting = ref(false);
    const vendorDetails = ref(null);
    // Computed service description text for display
    // from config with dynamic values
    //
    const serviceDescriptionText = computed(() =>
      buildServiceDescription(props.config, {
        winnableAmount: raffleData.value.winnable_amount,
        ticketPrice: ticketCurrentPrice.value,
        formatCurrency,
      })
    );
    // Form model
    const formData = reactive({});
    props.config.fields.forEach((field) => {
      formData[field.name] = field.type === "number" ? 1 : "";
    });

    // If this is QR Pay Merchant, lock vendor from props.initialVendorId
    if (props.config.key === "pay-merchant" && isQrMode.value && props.initialVendorId) {
      formData.vendor_id = props.initialVendorId;
    }

    // Fields for rendering
    const visibleFields = computed(() =>
      props.config.fields.filter((f) => f.type !== "hidden")
    );
    const hiddenFields = computed(() =>
      props.config.fields.filter((f) => f.type === "hidden")
    );

    // Vendor display name
    const vendorDisplayName = computed(() => {
      if (!vendorDetails.value) return "";
      return (
        vendorDetails.value.business_name ||
        vendorDetails.value.vendor_name ||
        ""
      );
    });

    // Dynamic title
    const titleText = computed(() => {
      if (props.config.key === "pay-merchant" && isQrMode.value && vendorDisplayName.value) {
        return `Pay ${vendorDisplayName.value}`;
      }
      return `${props.config.label} Request`;
    });

    // Total ticket cost
    const totalTicketCost = computed(() => {
      const tickets = Number(formData.tickets || 0);
      if (!tickets || !ticketCurrentPrice.value) return 0;
      return tickets * ticketCurrentPrice.value;
    });

    // Simple required field check
    const canSubmit = computed(() => {
      for (const field of props.config.fields) {
        if (!field.required) continue;
        if (!formData[field.name]) return false;
      }
      if (formData.tickets && Number(formData.tickets) < 1) return false;
      if (!ticketCurrentPrice.value) return false;
      return true;
    });

    // Bootstrap raffle info from products list
    const bootstrapRaffle = async () => {
      try {
        const all = await fetchProducts();

        if (!Array.isArray(all) || all.length === 0) {
          console.warn("No products returned from fetchProducts");
          return;
        }

        const cycle = all.find(
          (p) => Number(p.raffle_cycle_id) === raffleCycleIdFromUrl
        );

        if (!cycle) {
          console.warn(
            "No raffle cycle found for",
            raffleCycleIdFromUrl,
            "type",
            raffleTypeId
          );
          return;
        }

        // Resolve specific type from associated_types
        const types = Array.isArray(cycle.associated_types)
          ? cycle.associated_types
          : [];

        const typeMatch = types.find(
          (t) => Number(t.raffle_type_id) === raffleTypeId
        );

        const finalTypeId = typeMatch
          ? Number(typeMatch.raffle_type_id)
          : Number(raffleTypeId);

        const price = Number(
          cycle.ticket_price ?? cycle.price_of_ticket ?? 0
        );
        const winAmount = Number(cycle.winnable_amount ?? 0);

        raffleData.value = {
          raffle_cycle_id: Number(cycle.raffle_cycle_id),
          raffle_type_id: finalTypeId,
          winnable_amount: winAmount,
          price_of_ticket: price,
        };

        formData.raffle_cycle_id = raffleData.value.raffle_cycle_id;
        formData.raffle_type_id = finalTypeId;
        formData.winnable_amount = winAmount;
        formData.price_of_ticket = price;

        ticketCurrentPrice.value = price;

        // If QR mode for Pay Merchant, fetch vendor details for display
        if (props.config.key === "pay-merchant" && isQrMode.value && props.initialVendorId) {
          try {
            const v = await fetchVendorDetails(props.initialVendorId);
            vendorDetails.value = v || null;
          } catch (err) {
            console.error("Failed to fetch vendor details for QR:", err);
          }
        }
      } catch (err) {
        console.error("Error bootstrapping raffle from products list:", err);
      }
    };

    // Build canonical payload for backend create_order handler
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
          return {
            ...base,
            customer_phone: String(formData.customerPhone),
            vendor_id: Number(formData.vendor_id),
          };

        case "transfer-moni":
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

    // Submit handler
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
      isQrMode,
      vendorDetails,
      vendorDisplayName,
      titleText,
      serviceDescriptionText,
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
