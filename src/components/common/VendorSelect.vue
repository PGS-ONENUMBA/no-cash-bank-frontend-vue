<template>
  <div class="position-relative">
    <input
      type="text"
      class="form-control"
      v-model="searchTerm"
      placeholder="Type to search vendors..."
      @input="filterVendors"
      @focus="showDropdown = true"
      @blur="delayHideDropdown"
      autocomplete="off"
    />

    <!-- Dropdown list -->
    <ul
      v-if="showDropdown && filteredVendors.length"
      class="list-group dropdown-menu w-100 mt-1"
      style="max-height: 200px; overflow-y: auto; position: absolute; z-index: 1000;"
    >
      <li
        v-for="vendor in filteredVendors"
        :key="vendor.vendor_id"
        class="list-group-item list-group-item-action"
        @mousedown.prevent="selectVendor(vendor)"
      >
        {{ vendor.vendor_name || vendor.business_name || ('Vendor #' + vendor.vendor_id) }}
      </li>
    </ul>

    <small v-if="selectedVendorName" class="text-success">
      Selected: {{ selectedVendorName }}
    </small>
    <small v-else class="text-muted">
      Type and select a vendor.
    </small>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { fetchVendors } from "@/services/fetchVendors";

/**
 * Lightweight vendor selector used only on Pay Merchant.
 * v-model holds vendor_id (number).
 */
export default {
  name: "VendorSelect",
  props: {
    modelValue: {
      type: [Number, String, null],
      default: null,
    },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const vendors = ref([]);
    const filteredVendors = ref([]);
    const searchTerm = ref("");
    const showDropdown = ref(false);

    const loadVendors = async () => {
      try {
        const data = await fetchVendors();
        vendors.value = Array.isArray(data) ? data : [];
        filteredVendors.value = vendors.value.slice();

        // If we already have a value, pre-fill the label
        if (props.modelValue) {
          const match = vendors.value.find(
            (v) => Number(v.vendor_id) === Number(props.modelValue)
          );
          if (match) {
            searchTerm.value = match.vendor_name || match.business_name || "";
          }
        }
      } catch (err) {
        console.error("❌ Error fetching vendors in VendorSelect:", err);
      }
    };

    const filterVendors = () => {
      const term = searchTerm.value.toLowerCase().trim();
      if (!term) {
        filteredVendors.value = vendors.value.slice();
        return;
      }
      filteredVendors.value = vendors.value.filter((v) =>
        String(v.vendor_name || v.business_name || "")
          .toLowerCase()
          .includes(term)
      );
    };

    const selectVendor = (vendor) => {
      const id = Number(vendor.vendor_id);
      emit("update:modelValue", id);
      searchTerm.value = vendor.vendor_name || vendor.business_name || "";
      showDropdown.value = false;
    };

    const delayHideDropdown = () => {
      setTimeout(() => {
        showDropdown.value = false;
      }, 150);
    };

    const selectedVendorName = computed(() => {
      const id = Number(props.modelValue || 0);
      const match = vendors.value.find((v) => Number(v.vendor_id) === id);
      return match ? match.vendor_name || match.business_name || "" : "";
    });

    // React if parent changes modelValue (rare but safe)
    watch(
      () => props.modelValue,
      (val) => {
        if (!val || !vendors.value.length) return;
        const match = vendors.value.find(
          (v) => Number(v.vendor_id) === Number(val)
        );
        if (match) {
          searchTerm.value = match.vendor_name || match.business_name || "";
        }
      }
    );

    onMounted(loadVendors);

    return {
      vendors,
      filteredVendors,
      searchTerm,
      showDropdown,
      filterVendors,
      selectVendor,
      delayHideDropdown,
      selectedVendorName,
    };
  },
};
</script>

<style scoped>
.dropdown-menu {
  display: block;
}
.list-group-item-action:hover {
  cursor: pointer;
  background-color: #f8f9fa;
}
</style>
