<template>
  <div>
    <!-- Page Header -->
    <div
      class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom"
    >
      <h1 class="fs-3"><i class="bi bi-house-door"></i> Dashboard</h1>
    </div>

    <!-- VENDOR VIEW -->
    <div v-if="user?.user_role === 'vendor'">
      <!-- Vendor Logo and Date -->
      <div class="mb-4 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <!-- Dynamic vendor logo based on user id -->
          <img :src="vendorLogo" height="90" alt="Vendor Logo" />
          <h3 class="fw-bold ms-3">{{ user.vendor_details.business_name }}</h3>
        </div>

        <div class="d-flex flex-column align-items-center justify-content-center">
          <p class="fw-bold" style="cursor: pointer;">
            {{ getFormattedDate() }}
          </p>
        </div>
      </div>

      <!-- Greeting -->
      <div class="d-flex justify-content-between align-items-center my-4">
        <div>
          <p class="fst-normal h5">{{ getGreeting() }} Admin, welcome back!</p>
        </div>
      </div>

      <!-- Vendor Financials and QR Download card -->
      <div class="container">
        <div class="row gap-4" style="height: 200px;">
          <!-- Business Details -->
          <div class="col card border-0 shadow-sm text-bg-success">
            <div class="card-body">
              <h5 class="fw-bold">Business Details</h5>

              <div class="d-flex">
                <p class="fst-normal me-1">Bank Name:</p>
                <p class="fst-normal mb-0">
                  {{ user.vendor_details.bank_name }}
                </p>
              </div>

              <div class="d-flex">
                <p class="fst-normal me-1">Bank Account Number:</p>
                <p class="fst-normal mb-0">
                  {{ user.vendor_details.bank_account_number }}
                </p>
              </div>
            </div>
          </div>

          <!-- Wallet Details -->
          <div class="col card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="fw-bold">Wallet Details</h5>

              <div class="d-flex text-success fst-normal">
                <p class="fst-normal me-1 mb-0">Balance:</p>
                <p class="fst-normal mb-0">{{ user.wallet_balance }}</p>
              </div>
            </div>
          </div>

          <!-- QR Code Download - generate on button click only -->
          <div class="col card shadow-sm border-0">
            <div
              class="card-body text-center"
              title="Customers can scan this QR code to make payments"
            >
              <h5 class="fw-bold">Download QR Code</h5>

              <p class="small mb-3">
                Click the button to generate your Scan2Pay QR code and download it as a PDF file.
              </p>

              <button
                type="button"
                class="btn btn-success"
                @click="handleDownloadQr"
                :disabled="!vendorQrValue"
              >
                Generate and Download
              </button>

              <!-- Optional: show the URL for debugging or user info -->
              <p v-if="vendorQrValue" class="text-muted small mt-3">
                {{ vendorQrValue }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CUSTOMER VIEW -->
    <div v-if="user?.user_role === 'customer'">
      <!-- Wallet Balance -->
      <WalletBalance title="Available Balance" />

      <!-- Loading Spinner for products -->
      <div v-if="loadingProducts" class="text-center py-3">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading products...</span>
        </div>
      </div>

      <!-- Dynamic product cards grid -->
      <div
        v-else-if="availableProducts.length > 0"
        class="row row-cols-1 g-4"
        :class="dynamicGridClass"
      >
        <FeatureCard
          v-for="product in availableProducts"
          :key="`${product.raffle_cycle_id}-${product.raffle_type_id}`"
          :title="product.raffle_type"
          :icon="product.icon"
          :description="`${winnableAmountLabel}: ${formatCurrency(
            product.winnable_amount
          )}`"
          :link="{
            path: product.route,
            query: {
              raffle_cycle_id: product.raffle_cycle_id,
              raffle_type_id: product.raffle_type_id,
            },
          }"
        />
      </div>

      <!-- No products -->
      <div v-else class="text-center text-danger py-3">
        <p>No active products available.</p>
      </div>

      <!-- Static features -->
      <div class="row row-cols-1 row-cols-md-3 g-4 mt-3">
        <FeatureCard
          title="Transfer Funds"
          icon="bi bi-arrow-up-right-circle"
          description="Easily send money to others."
          link="/dashboard/transfer"
        />
        <FeatureCard
          title="Spend at Merchant"
          icon="bi bi-bag-check"
          description="Pay from your Wallet Balances."
          link="/dashboard/spend"
        />
        <FeatureCard
          title="Transaction Reports"
          icon="bi bi-clock-history"
          description="View your transaction history."
          link="/dashboard/reports"
        />
      </div>
    </div>

    <!-- Mobile Footer Menu -->
    <DashboardFooter />
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import {
  fetchProducts,
  isLoading,
  getIcon,
  getRoute,
} from "@/services/productService";
import WalletBalance from "@/components/common/WalletBalance.vue";
import FeatureCard from "@/components/dashboard/FeatureCard.vue";
import DashboardFooter from "@/components/dashboard/DashboardFooter.vue";

// Service that will generate the QR and PDF on demand
import downloadQrCode from "@/services/generateQRCodePdf";

export default {
  name: "DashboardView",
  components: {
    WalletBalance,
    FeatureCard,
    DashboardFooter,
  },
  setup() {
    const authStore = useAuthStore();
    const availableProducts = ref([]);
    const loadingProducts = isLoading();

    // Label for winnable amount, configurable by env
    const winnableAmountLabel =
      import.meta.env.VITE_WINNABLE_AMOUNT_LABEL || "Winnable Amount";

    // Current logged in user from Pinia store
    const user = computed(() => authStore.user);

    // Normalize user id (covers different possible fields)
    const userId = computed(() => {
      const u = user.value || {};
      return u.id ?? u.ID ?? u.user_id ?? null;
    });

    // Simple MVP logo mapping:
    // user id 3 -> spar_logo
    // user id 22 -> mattoris_logo
    // all others -> spar_logo as default
    const vendorLogo = computed(() => {
      const id = userId.value;
      if (id === 3) return "/spar_logo.png";
      if (id === 22) return "/mattoris_logo.jpg";
      return "/spar_logo.png";
    });

    // Vendor specific Scan2Pay URL that will be encoded in the QR
    // Example:
    // https://www.paybychance.com/scan2pay4me?raffle_type_id=2&vendor_id=22
    const vendorQrValue = computed(() => {
      const u = user.value;
      if (!u || u.user_role !== "vendor") return "";

      const vendorId = u.vendor_details?.vendor_id ?? userId.value;
      if (!vendorId) return "";

      const baseUrl = "https://www.paybychance.com";
      const raffleTypeId = 2; // Scan2Pay raffle type id

      return `${baseUrl}/scan2pay4me?raffle_type_id=${raffleTypeId}&vendor_id=${vendorId}`;
    });

    // Button click handler: generate QR and download PDF on demand
    const handleDownloadQr = async () => {
      if (!vendorQrValue.value) {
        console.error("Vendor QR value is missing");
        return;
      }

      try {
        await downloadQrCode({
          qrValue: vendorQrValue.value,
          vendorName:
            user.value?.vendor_details?.business_name || "Vendor",
        });
      } catch (error) {
        console.error("Failed to generate QR PDF:", error);
      }
    };

    // Transform raw raffle data into the product cards used on dashboard
    const transformProducts = (raffles) => {
      const transformed = [];

      raffles.forEach((raffle) => {
        raffle.associated_types.forEach((type) => {
          transformed.push({
            raffle_cycle_id: raffle.raffle_cycle_id,
            raffle_type_id: type.raffle_type_id,
            raffle_type: type.raffle_type,
            winnable_amount: raffle.winnable_amount,
            icon: getIcon(type.raffle_type_id),
            route: getRoute(type.raffle_type_id),
          });
        });
      });

      return transformed;
    };

    // Greeting for user based on local time
    const getGreeting = () => {
      const hour = new Date().getHours();

      if (hour >= 0 && hour < 12) return "Good morning";
      if (hour >= 12 && hour < 18) return "Good afternoon";
      return "Good evening";
    };

    // Format date as "Today's date is 5th Jun 2025."
    const getFormattedDate = () => {
      const now = new Date();

      const day = now.getDate();
      const suffix =
        day % 10 === 1 && day !== 11
          ? "st"
          : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = months[now.getMonth()];
      const year = now.getFullYear();

      return `Today's date is ${day}${suffix} ${month} ${year}.`;
    };

    // Load and build product list for customer view
    const loadProducts = async () => {
      try {
        const rawProducts = await fetchProducts();
        availableProducts.value = transformProducts(rawProducts);
      } catch (error) {
        console.error("Error loading products:", error);
        availableProducts.value = [];
      }
    };

    // Adjust grid columns based on product count
    const dynamicGridClass = computed(() => {
      const count = availableProducts.value.length;
      return count ? `row-cols-md-${Math.min(count, 4)}` : "row-cols-md-1";
    });

    // Currency formatting for NGN
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount);
    };

    // On mount, load products once
    onMounted(() => {
      loadProducts();
    });

    return {
      user,
      userId,
      vendorLogo,
      vendorQrValue,
      handleDownloadQr,
      availableProducts,
      loadingProducts,
      dynamicGridClass,
      formatCurrency,
      winnableAmountLabel,
      getGreeting,
      getFormattedDate,
    };
  },
};
</script>

<style scoped>
.card {
  height: 100%;
}

.text-success {
  color: #09b850 !important;
}
</style>
