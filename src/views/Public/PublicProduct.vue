<!-- src/views/Public/PublicProduct.vue -->
<template>
  <div class="container py-5">
    <div class="text-center mb-4 mt-5">
      <h2 class="fw-bold">
        <i class="bi bi-check-circle"></i> {{ productConfig.label }}
      </h2>
    </div>

    <DynamicProductForm
      :config="productConfig"
      :mode="mode"
      :initialRaffleCycleId="raffle_cycle_id"
      :initialRaffleTypeId="raffle_type_id"
      :initialVendorId="vendor_id"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { PRODUCT_CONFIG } from "@/config/productConfig";
import DynamicProductForm from "@/components/forms/DynamicProductForm.vue";

const props = defineProps({
  productKey: { type: String, required: true },
  mode: { type: String, default: "normal" },          // "normal" | "qr"
  raffle_cycle_id: { type: Number, default: 0 },
  raffle_type_id: { type: Number, default: 0 },
  vendor_id: { type: Number, default: 0 },            // only used in qr mode
});

const productConfig = computed(() => PRODUCT_CONFIG[props.productKey]);
const mode = computed(() => props.mode);
const raffle_cycle_id = computed(() => props.raffle_cycle_id);
const raffle_type_id = computed(() => props.raffle_type_id);
const vendor_id = computed(() => props.vendor_id);
</script>
