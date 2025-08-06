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
              <p><strong>Phone:</strong> {{ formData.recipientPhoneNumber }}</p>
              <p><strong>Contact:</strong> {{ vendorDetails.contact_name }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Form -->
      <!-- @todo rework the form to reflect the ticket pricing and value as user is typing in number of tickets. -->
      <div class="col-lg-6 d-flex">
        <div class="card w-100 shadow-sm">
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-2">
                <label for="phoneNumber" class="form-label">
                  <i class="bi bi-telephone me-2"></i> Your Phone Number
                </label>
                <input type="text" class="form-control" id="phoneNumber" v-model="formData.phoneNumber" required />
              </div>
              <div class="mb-2">
                <label for="amountDue" class="form-label">
                  <i class="bi bi-currency-exchange me-2"></i> Amount Due (NGN)
                </label>
                <input type="number" class="form-control" id="amountDue" v-model="formData.amountDue" required min="1" />
              </div>
              <div class="mb-2">
                <label for="tickets" class="form-label">
                  <i class="bi bi-ticket me-2"></i> How Many Tickets?
                </label>

                <!-- Show ticket price per unit -->
                <p class="text-muted mb-1">
                  Ticket Price:
                  <span class="fw-semibold">
                    {{ Number(formData.price_of_ticket).toLocaleString("en-NG", { style: "currency", currency: "NGN" }) }}
                  </span>
                </p>

                <input
                  type="number"
                  class="form-control"
                  id="tickets"
                  v-model="formData.tickets"
                  required
                  min="1"
                />
                <!-- Total cost preview -->
                <p class="text-success fw-bold mt-1">
                  You will pay: {{ totalTicketCost.toLocaleString("en-NG", { style: "currency", currency: "NGN" }) }}
                </p>
              </div>

              <!-- Hidden Fields -->
              <input type="hidden" v-model="formData.raffle_cycle_id" />
              <input type="hidden" v-model="formData.raffle_type_id" />
              <input type="hidden" v-model="formData.winnable_amount" />
              <input type="hidden" v-model="formData.price_of_ticket" />
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
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { fetchProducts, fetchVendorDetails } from "@/services/productService";
import { createOrder, processPayment } from "@/services/paymentService";

export default {
  name: "Scan2Pay4Me",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const raffleData = ref({});
    const vendorDetails = ref(null);
    const isSubmitting = ref(false);
    const totalTicketCost = computed(() => {
      return formData.value.tickets > 0 && formData.value.price_of_ticket > 0
        ? formData.value.tickets * formData.value.price_of_ticket
        : 0;
    });


    const formData = ref({
      phoneNumber: "",
      recipientPhoneNumber: "",
      amountDue: "",
      tickets: 1,
      raffle_cycle_id: "",
      raffle_type_id: "",
      winnable_amount: "",
      price_of_ticket: "",
      vendor_id: "",
    });

    const formattedWinnableAmount = computed(() => {
      return raffleData.value.winnable_amount
        ? Number(raffleData.value.winnable_amount).toLocaleString("en-NG", {
            style: "currency",
            currency: "NGN",
          })
        : "Loading...";
    });

    const fetchRaffleDetails = async () => {
      const raffleTypeId = route.query.raffle_type_id;
      const vendorId = route.query.vendor_id;

      if (!raffleTypeId || !vendorId) {
        console.warn("⚠ Missing QR code parameters.");
        router.push("/dashboard");
        return;
      }

      try {
        const cycles = await fetchProducts();
        if (cycles.length) {
          const cycle = cycles.find(cycle =>
            cycle.associated_types.some(type => type.raffle_type_id === parseInt(raffleTypeId))
          );

          if (cycle) {
            raffleData.value = {
              raffle_cycle_id: cycle.raffle_cycle_id,
              winnable_amount: parseFloat(cycle.winnable_amount),
              price_of_ticket: parseFloat(cycle.ticket_price),
              associated_types: cycle.associated_types,
            };
            formData.value.raffle_cycle_id = cycle.raffle_cycle_id;
            formData.value.raffle_type_id = raffleTypeId;
            formData.value.winnable_amount = cycle.winnable_amount;
            formData.value.price_of_ticket = cycle.ticket_price;
            formData.value.vendor_id = vendorId;
          } else {
            console.error("❌ No matching raffle cycle found.");
            router.push("/dashboard");
            return;
          }
        } else {
          console.error("❌ No raffle cycles available.");
          router.push("/404");
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
          formData.value.recipientPhoneNumber = vendor.phone_number || "N/A";
          formData.value.vendor_id = vendor.vendor_id;
        } else {
          console.error("❌ Vendor details fetch failed.");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("❌ Error fetching details:", error);
        router.push("/dashboard");
      }
    };

    const handleSubmit = async () => {
      if (!formData.value.phoneNumber || !formData.value.recipientPhoneNumber || !formData.value.amountDue || formData.value.tickets < 1) {
        alert("Please fill out all required fields correctly.");
        return;
      }

      isSubmitting.value = true;
      try {
        const orderAmount = formData.value.tickets * formData.value.price_of_ticket;

        const orderData = {
          phoneNumber: formData.value.phoneNumber,
          tickets: parseInt(formData.value.tickets, 10),
          amount: orderAmount,
          raffle_cycle_id: parseInt(formData.value.raffle_cycle_id, 10),
          vendor_id: formData.value.vendor_id,
          amount_due: parseFloat(formData.value.amountDue),
          recipient_phone_number: formData.value.recipientPhoneNumber,
        };

        const response = await createOrder(orderData);

        if (response?.order_id) {
          const paymentResponse = await processPayment({
            email: `${formData.value.phoneNumber}@paybychance.com`,
            amount: orderAmount,
            trans_ref: response.order_id,
          });

          if (paymentResponse?.status === "closed") {
            console.log("❌ Payment Cancelled by user");
            return;
          }

          router.push("/thank-you");
        } else {
          alert(`Error: ${response?.message || "Could not create order."}`);
        }
      } catch (error) {
        console.error("❌ Submission error:", error);
        alert("Failed to process payment. Please try again.");
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
.text-purple {
  color: #6f42c1;
}
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
.card-body {
  padding: 1.25rem;
}
</style>
