<template>
  <div class="container text-center py-5">
    <div class="card shadow-sm p-4 mx-auto" style="max-width: 500px;">
      <h2 class="text-primary">Thank You!</h2>
      <p class="lead">We are processing your payment...</p>

      <div v-if="loading" class="text-center">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>Verifying payment, please wait...</p>
      </div>

      <div v-if="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>

      <div v-if="paymentStatus === 'pending'" class="alert alert-warning mt-3">
        Payment is still being processed. Please wait...
      </div>

      <div v-if="paymentStatus === 'success'" class="alert alert-success mt-3">
        Payment successful! Redirecting...
      </div>

      <div v-if="paymentStatus === 'failed'" class="alert alert-danger mt-3">
        Payment failed. Please try again.
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { verifyPayment } from "@/services/paymentService";

export default {
  name: "ThankYouPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const paymentStatus = ref("pending");
    const errorMessage = ref(null);
    const loading = ref(true);
    let attempts = 0;
    const maxRetries = 3;

    const checkPaymentStatus = async () => {
      const transRef = route.query.trans_ref;
      if (!transRef) {
        errorMessage.value = "Invalid transaction reference.";
        loading.value = false;
        return;
      }

      try {
        const response = await verifyPayment(transRef);
        if (response.success) {
          paymentStatus.value = "success";
          setTimeout(() => router.push("/dashboard"), 3000);
        } else if (response.pending) {
          if (attempts < maxRetries) {
            attempts++;
            setTimeout(checkPaymentStatus, 3000); // Retry after 3 seconds
          } else {
            paymentStatus.value = "failed";
            errorMessage.value = "Payment verification failed after multiple attempts.";
          }
        } else {
          paymentStatus.value = "failed";
        }
      } catch (error) {
        if (attempts < maxRetries) {
          attempts++;
          setTimeout(checkPaymentStatus, 3000);
        } else {
          errorMessage.value = "Error verifying payment. Please contact support.";
        }
      } finally {
        loading.value = false;
      }
    };

    onMounted(checkPaymentStatus);

    return {
      paymentStatus,
      errorMessage,
      loading,
    };
  },
};
</script>

<style scoped>
.text-primary {
  color: #007bff;
}
</style>
