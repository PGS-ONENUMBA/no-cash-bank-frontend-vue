<template>
  <div class="position-relative">
    <!-- Search box -->
    <input
      type="text"
      class="form-control"
      v-model="searchTerm"
      placeholder="Type to search vendors..."
      @focus="showDropdown = true"
      @input="filterVendors"
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
        @mousedown="selectVendor(vendor)"
      >
        {{ vendor.vendor_name }}
      </li>
    </ul>

    <!-- Selected vendor label -->
    <small v-if="modelValue" class="text-success">
      Selected: {{ selectedVendorName }}
    </small>
    <small v-else class="text-muted">
      Type and select a vendor.
    </small>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { fetchVendors } from "@/services/fetchVendors";

export default {
  name: "VendorSelect",

  props: {
    // v-model binds to vendor_id
    modelValue: {
      type: [Number, String],
      default: null,
    },
  },

  emits: ["update:modelValue"],

  setup(props, { emit }) {
    const vendors = ref([]);
    const filteredVendors = ref([]);
    const searchTerm = ref("");
    const showDropdown = ref(false);

    // Load vendors once
    const loadVendors = async () => {
      try {
        const data = await fetchVendors();
        vendors.value = Array.isArray(data) ? data : [];
        filteredVendors.value = vendors.value;
      } catch (err) {
        console.error("Error loading vendors:", err);
      }
    };

    // Filter vendors on search
    const filterVendors = () => {
      const term = searchTerm.value.toLowerCase().trim();
      if (!term) {
        filteredVendors.value = vendors.value;
        return;
      }
      filteredVendors.value = vendors.value.filter((v) =>
        String(v.vendor_name || "").toLowerCase().includes(term)
      );
    };

    // Small delay so click can fire before blur hides dropdown
    const delayHideDropdown = () => {
      setTimeout(() => {
        showDropdown.value = false;
      }, 150);
    };

    // When user picks a vendor, update v-model
    const selectVendor = (vendor) => {
      const id = Number(vendor.vendor_id);
      emit("update:modelValue", id);
      searchTerm.value = vendor.vendor_name;
      showDropdown.value = false;
    };

    // Helper to display current selected vendor name
    const selectedVendorName = computed(() => {
      const id = Number(props.modelValue || 0);
      const v = vendors.value.find(() => Number(v.vendor_id) === id);
      return v ? v.vendor_name : "";
    });

    onMounted(loadVendors);

    return {
      vendors,
      filteredVendors,
      searchTerm,
      showDropdown,
      filterVendors,
      delayHideDropdown,
      selectVendor,
      selectedVendorName,
    };
  },
};
</script>

<style scoped>
.list-group-item-action:hover {
  cursor: pointer;
  background-color: #f8f9fa;
}
.dropdown-menu {
  display: block;
}
</style>
