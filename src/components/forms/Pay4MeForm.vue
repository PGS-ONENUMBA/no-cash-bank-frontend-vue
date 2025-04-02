<template>
  <main class="container py-2 mt-2">
    <div class="row g-4 d-flex align-items-stretch">
      <!-- Left Column: Instructions -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <h3 class="text-muted fs-4">
              We can pay for you to cover expenses up to {{ formattedWinnableAmount }} at the ticket price of: <span v-if="ticketCurrentPrice > 0">{{ formatCurrency(ticketCurrentPrice) }}</span>
            </h3>
            <p class="text-success fs-5">Transferable Amount: {{ formattedWinnableAmount }}</p>
            <h5 class="fw-bold"><i class="bi bi-lightbulb"></i> How It Works</h5>
            <ul class="list-unstyled">
              <li><i class="bi bi-1-circle text-success"></i> Enter your phone number.</li>
              <li><i class="bi bi-2-circle text-success"></i> Choose if you want to pay a vendor.</li>
              <li><i class="bi bi-3-circle text-success"></i> Select a vendor and buy tickets.</li>
              <li><i class="bi bi-4-circle text-success"></i> If you win, we pay the vendor or credit your wallet.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Right Column: Form -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <h2 class="card-title pb-3 fs-4">Transfer Moni</h2>

            <!-- Loading State -->
            <div v-if="isLoading" class="text-center">
              <p>Loading raffle details...</p>
            </div>

            <!-- Step 1: Customer Phone -->
            <form v-else-if="!showVendorQuestion && !showFullForm" @submit.prevent="showVendorQuestion = true">
              <div class="mb-3">
                <label for="customerPhone" class="form-label">
                  <i class="bi bi-telephone me-2"></i> Your Phone Number
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="customerPhone"
                  v-model="formData.customerPhone"
                  required
                  placeholder="e.g., 09012345678"
                />
              </div>
              <button type="submit" class="btn btn-orange custom-width mb-3">
                <i class="bi bi-arrow-right-circle me-2"></i> Next
              </button>
            </form>

            <!-- Step 2: Vendor Question -->
            <div v-else-if="showVendorQuestion && !showFullForm">
              <p class="mb-3">Do you want to pay a registered vendor?</p>
              <button class="btn btn-orange custom-width mb-3 me-2" @click="hasVendor = true; showFullForm = true">
                <i class="bi bi-check-circle me-2"></i> Yes
              </button>
              <button class="btn btn-secondary custom-width mb-3" @click="hasVendor = false; showFullForm = true">
                <i class="bi bi-x-circle me-2"></i> No
              </button>
              <button type="button" class="btn btn-link" @click="showVendorQuestion = false">Back</button>
            </div>

            <!-- Step 3: Full Form -->
            <form v-else-if="showFullForm" @submit.prevent="handleSubmit">
              <div v-if="hasVendor">
                <div class="mb-3 position-relative">
                  <label for="vendorSearch" class="form-label">
                    <i class="bi bi-shop me-2"></i> Select Vendor
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
                <div class="mb-3">
                  <label for="amountDue" class="form-label">
                    <i class="bi bi-cash me-2"></i> Amount Due to Vendor
                  </label>
                  <input
                    type="number"
                    class="form-control"
                    id="amountDue"
                    v-model="formData.amountDue"
                    required
                    :min="1000"
                    :max="winnableAmount"
                  />
                  <small class="text-muted">Min: ₦1,000 | Max: {{ formattedWinnableAmount }}</small>
                </div>
              </div>

              <!-- Number of Tickets -->
              <div class="mb-3">
                <label for="tickets" class="form-label">
                  <i class="bi bi-ticket me-2"></i> How Many Tickets?
                </label>
                <span v-if="ticketCurrentPrice > 0">Current Ticket Price: {{ formatCurrency(ticketCurrentPrice) }}</span>
                <input type="number" class="form-control" id="tickets" v-model="formData.tickets" required min="1" />
                <p class="text-success fw-bold">You will pay: {{ formatCurrency(totalTicketCost) }}</p>
              </div>

              <!-- Hidden Fields -->
              <input type="hidden" v-model="formData.raffle_cycle_id" />
              <input type="hidden" v-model="formData.raffle_type_id" />
              <input type="hidden" v-model="formData.winnable_amount" />
              <input type="hidden" v-model="formData.price_of_ticket" />

              <button type="submit" class="btn btn-orange custom-width mb-3">
                <i class="bi bi-cash-coin me-2"></i> Submit Payment Request
              </button>
              <button type="button" class="btn btn-secondary custom-width mb-3 ms-2" @click="showFullForm = false; showVendorQuestion = true">
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
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { validateRaffleCycle } from "@/services/productService";
import { fetchVendors } from "@/services/fetchVendors";
import formatCurrency from "@/services/currencyFormatter";
import { createOrder, processPayment } from "@/services/paymentService";

export default {
  name: "Pay4MeForm",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const raffleData = ref({});
    const raffleCycleId = route.query.raffle_cycle_id;
    const raffleTypeId = route.query.raffle_type_id;
    const ticketCurrentPrice = ref(0);
    const showVendorQuestion = ref(false);
    const showFullForm = ref(false);
    const hasVendor = ref(false);
    const isLoading = ref(true);
    const vendors = ref([]); // All vendors from DB
    const filteredVendors = ref([]);
    const vendorSearch = ref("");
    const showDropdown = ref(false);

    const formData = ref({
      customerPhone: "",
      amountDue: "",
      tickets: 1,
      raffle_cycle_id: raffleCycleId,
      raffle_type_id: raffleTypeId,
      winnable_amount: "",
      price_of_ticket: "",
      vendor_id: "",
    });

    const fetchRaffleDetails = async () => {
      if (!raffleCycleId || !raffleTypeId) {
        console.warn("⚠ Missing raffle cycle parameters in URL.");
        isLoading.value = false;
        return;
      }
      try {
        const validatedRaffle = await validateRaffleCycle(raffleCycleId, raffleTypeId);
        if (validatedRaffle) {
          raffleData.value = validatedRaffle;
          formData.value.raffle_cycle_id = validatedRaffle.raffle_cycle_id;
          formData.value.raffle_type_id = validatedRaffle.raffle_type_id;
          formData.value.winnable_amount = validatedRaffle.winnable_amount;
          formData.value.price_of_ticket = validatedRaffle.price_of_ticket;
          ticketCurrentPrice.value = Number(validatedRaffle.price_of_ticket);
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

    const fetchVendorList = async () => {
      try {
        const vendorData = await fetchVendors();
        vendors.value = vendorData;
        filteredVendors.value = vendorData; // Initially show all vendors
      } catch (error) {
        console.error("❌ Error fetching vendors:", error);
      }
    };

    const filterVendors = () => {
      const searchTerm = vendorSearch.value.toLowerCase();
      if (!searchTerm) {
        filteredVendors.value = vendors.value; // Reset to full list
        formData.value.vendor_id = ""; // Clear selection when search is empty
      } else {
        filteredVendors.value = vendors.value.filter((vendor) =>
          vendor.vendor_name.toLowerCase().includes(searchTerm)
        );
      }
    };

    const selectVendor = (vendor) => {
      formData.value.vendor_id = vendor.vendor_id;
      vendorSearch.value = vendor.vendor_name;
      showDropdown.value = false; // Hide dropdown after selection
    };

    // const delayHideDropdown = () => {
    //   setTimeout(() => {
    //     showDropdown.value = false;
    //   }, 200); // Delay to allow click to register
    // };

    const selectedVendorName = computed(() => {
      const selected = vendors.value.find((v) => v.vendor_id === formData.value.vendor_id);
      return selected ? selected.vendor_name : "";
    });

    const winnableAmount = computed(() => raffleData.value.winnable_amount || 0);
    const formattedWinnableAmount = computed(() => {
      return winnableAmount.value
        ? Number(winnableAmount.value).toLocaleString("en-NG", { style: "currency", currency: "NGN" })
        : "Loading...";
    });

    const totalTicketCost = computed(() => {
      return formData.value.tickets > 0 && ticketCurrentPrice.value > 0
        ? formData.value.tickets * ticketCurrentPrice.value
        : 0;
    });

    const handleSubmit = async () => {
      if (isLoading.value || !winnableAmount.value) {
        alert("Please wait for raffle details to load.");
        return;
      }

      if (formData.value.tickets < 1) {
        alert("Please select at least one ticket.");
        return;
      }

      if (hasVendor.value) {
        if (!formData.value.vendor_id) {
          alert("Please select a vendor.");
          return;
        }
        if (formData.value.amountDue < 1000) {
          alert("Amount due must be at least ₦1,000.");
          return;
        }
        if (formData.value.amountDue > winnableAmount.value) {
          alert("Amount due cannot exceed the winnable amount.");
          return;
        }
      }

      try {
        const orderData = {
          phoneNumber: formData.value.customerPhone,
          tickets: parseInt(formData.value.tickets, 10),
          amount: totalTicketCost.value,
          raffle_cycle_id: parseInt(raffleCycleId, 10),
        };

        if (hasVendor.value) {
          orderData.vendor_id = formData.value.vendor_id;
          orderData.amount_due = parseFloat(formData.value.amountDue);
        }

        const response = await createOrder(orderData);

        if (response?.order_id) {
          const paymentResponse = await processPayment({
            email: `${formData.value.customerPhone}@paybychance.com`,
            amount: totalTicketCost.value,
            trans_ref: response.order_id,
          });

          if (paymentResponse.status === "closed") {
            console.log("❌ Payment Cancelled by user");
            return;
          }
        }
      } catch (error) {
        console.error("❌ Submission error:", error.message, error);
        alert(`Error: ${error.message || "Failed to submit order. Please try again."}`);
      }
    };

    onMounted(async () => {
      await fetchRaffleDetails();
      await fetchVendorList();
    });

    return {
      formData,
      showVendorQuestion,
      showFullForm,
      hasVendor,
      isLoading,
      vendorSearch,
      filteredVendors,
      showDropdown,
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
.dropdown-menu { display: block; } /* Ensure dropdown stays visible when shown */
</style>
