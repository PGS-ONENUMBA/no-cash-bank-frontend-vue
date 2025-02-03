<template>
  <div>
    <!-- Main Content -->
    <div class=" mt-5 pt-2 align-items-center justify-content-center vh-100">
      <div class="row justify-content-center mt-5">
        <div class="col-md-4">
          <div class="card shadow-sm">

        <div class="card-body">
          <!-- Email Form -->
          <div v-if="!token || !tokenValid">
            <h2 class="card-title text-center pb-3">Forgot Password?</h2>
            <p class="text-center">Enter your email to receive a password reset link.</p>
            <form @submit.prevent="sendResetLink">
              <div class="mb-3">
                <label for="email" class="form-label">
                  <i class="bi bi-envelope me-2"></i> Email Address
                </label>
                <!-- Input field for the user to provide their email address -->
                <input type="email" class="form-control" id="email" v-model="email" required>
              </div>
              <!-- Submit button for sending the reset link -->
              <button type="submit" class="btn btn-orange w-100 mb-3">
                <i class="bi bi-arrow-right-circle me-2 bi-white"></i> Send Reset Link
              </button>
            </form>
          </div>
  
          <!-- Password Reset Form -->
          <div v-if="token && tokenValid">
            <h2 class="card-title text-center pb-3">Reset Your Password</h2>
            <p class="text-center">Enter your new password below.</p>
            <form @submit.prevent="resetPassword">
              <div class="mb-3">
                <label for="newPassword" class="form-label">
                  <i class="bi bi-lock-fill me-2"></i> New Password
                </label>
                <!-- Input field for entering the new password -->
                <input type="password" class="form-control" id="newPassword" v-model="password" required>
              </div>
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">
                  <i class="bi bi-shield-lock me-2"></i> Confirm Password
                </label>
                <!-- Input field for confirming the new password -->
                <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" required>
              </div>
              <!-- Submit button for resetting the password -->
              <button type="submit" class="btn btn-orange w-100 mb-3">
                <i class="bi bi-arrow-right-circle me-2 bi-white"></i> Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
          </div>
        </div>
      </div>
  </template>
  
  <script setup>
  /**
   * ResetPassword Component
   *
   * This component handles both:
   * 1. Sending a password reset link to the user's email.
   * 2. Resetting the password when accessed via a token (from the email).
   *
   * Features:
   * - Displays an email input form if no valid token is provided.
   * - Displays a password reset form if a valid token is detected.
   * - Redirects to a 404 page if the token is invalid.
   */

   import { ref, onMounted } from 'vue'
   import { useRouter } from 'vue-router'
  
  // import axios from 'axios'; // Import Axios for API requests
  import api from '@/services/apiService'; // Reusable API service

  const router = useRouter();

  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const token = ref('')
  const tokenValid = ref(false)

  const sendResetLink = async () => {
    try {
          const response = await api.get('/send-reset-link', { email: email.value });
          if (response.data.success) {
            alert('Reset link sent! Please check your email.');
          } else {
            alert('Failed to send reset link.');
          }
    } catch (error) {
          console.error('Error sending reset link:', error);
          alert('An error occurred. Please try again.');
    }
  }

  const validateToken = async () => {
    if (token.value) {
          try {
            const response = await api.get('/verify-token', { token: token.value });
            tokenValid.value = response.data.valid;
            if (!tokenValid.value) {
              router.push('/404'); // Redirect to 404 if the token is invalid
            }
          } catch (error) {
            console.error('Token validation failed:', error);
            router.push('/404');
          }
        }
  }

  const resetPassword = async () => {
    if (password.value !== confirmPassword.value) {
          alert('Passwords do not match.');
          return;
        }
        try {
          const response = await api.get('/reset-password', {
            token: token.value,
            password: password.value,
          });
          if (response.data.success) {
            alert('Password reset successful! You can now log in.');
            router.push('/login'); // Redirect to login page
          } else {
            alert('Failed to reset password.');
          }
        } catch (error) {
          console.error('Error resetting password:', error);
          alert('An error occurred. Please try again.');
        }
  }

  onMounted(() => {
    validateToken()
  })
  
  // export default {
  //   name: 'ResetPassword',
  //   data() {
  //     return {
  //       email: '', // Holds the user's email for the reset link
  //       password: '', // Holds the new password for resetting
  //       confirmPassword: '', // Holds the confirmed new password
  //       token: this.$route.query.token || null, // Token extracted from the URL query
  //       tokenValid: false, // Boolean to track token validity
  //     };
  //   },
  //   methods: {
  //     /**
  //      * Sends a password reset link to the provided email address.
  //      */
  //     async sendResetLink() {
  //       try {
  //         const response = await api.get('/send-reset-link', { email: this.email });
  //         if (response.data.success) {
  //           alert('Reset link sent! Please check your email.');
  //         } else {
  //           alert('Failed to send reset link.');
  //         }
  //       } catch (error) {
  //         console.error('Error sending reset link:', error);
  //         alert('An error occurred. Please try again.');
  //       }
  //     },
  //     /**
  //      * Validates the token from the URL.
  //      * If the token is invalid, redirects to the 404 page.
  //      */
  //     async validateToken() {
  //       if (this.token) {
  //         try {
  //           const response = await api.get('/verify-token', { token: this.token });
  //           this.tokenValid = response.data.valid;
  //           if (!this.tokenValid) {
  //             this.$router.push('/404'); // Redirect to 404 if the token is invalid
  //           }
  //         } catch (error) {
  //           console.error('Token validation failed:', error);
  //           this.$router.push('/404');
  //         }
  //       }
  //     },
  //     /**
  //      * Resets the user's password using the provided token.
  //      * Ensures the passwords match before making the request.
  //      */
  //     async resetPassword() {
  //       if (this.password !== this.confirmPassword) {
  //         alert('Passwords do not match.');
  //         return;
  //       }
  //       try {
  //         const response = await api.get('/reset-password', {
  //           token: this.token,
  //           password: this.password,
  //         });
  //         if (response.data.success) {
  //           alert('Password reset successful! You can now log in.');
  //           this.$router.push('/login'); // Redirect to login page
  //         } else {
  //           alert('Failed to reset password.');
  //         }
  //       } catch (error) {
  //         console.error('Error resetting password:', error);
  //         alert('An error occurred. Please try again.');
  //       }
  //     },
  //   },
  //   /**
  //    * Lifecycle hook that runs when the component is mounted.
  //    * Validates the token if present in the URL query.
  //    */
  //   mounted() {
  //     this.validateToken();
  //   },
  // };
  </script>
  
  <style scoped>
  /* Button styles for the reset password page */
  .btn-orange {
    background-color: #ff6f00;
    color: white;
    border: none;
  }
  
  .btn-orange:hover {
    background-color: #e65d00;
  }
  
  /* Text color for links */
  .text-green {
    color: #09b850;
  }
  </style>
  