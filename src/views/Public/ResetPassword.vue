<template>
  <div class="vh-100 d-flex align-items-center justify-content-center">
    <div class="container">
      <div class="row shadow rounded overflow-hidden">
        <!-- Left Image Column -->
        <div class="col-md-6 d-none d-md-block p-0">
          <div class="login-image h-100"></div>
        </div>

        <!-- Right Reset Form -->
        <div class="col-md-6 d-flex align-items-center justify-content-center p-4">
          <div class="w-100" style="max-width: 400px;">

            <!-- Email Form -->
            <div v-if="!token || !tokenValid">
              <h2 class="text-center mb-3">Forgot Password?</h2>
              <p class="text-center mb-4">Enter your email to receive a password reset link.</p>
              <form @submit.prevent="sendResetLink">
                <div class="mb-3">
                  <label for="email" class="form-label">
                    <i class="bi bi-envelope me-2"></i> Email Address
                  </label>
                  <input type="email" class="form-control" id="email" v-model="email" required />
                </div>
                <button type="submit" class="btn btn-orange w-100 mb-3">
                  <i class="bi bi-arrow-right-circle me-2 bi-white"></i> Send Reset Link
                </button>

                <!-- Divider -->
                <div class="text-center my-3">
                  <hr>
                  <small class="text-muted">Remembered your password?</small><br />
                  <router-link to="/login" class="text-decoration-none text-green">
                    <i class="bi bi-box-arrow-in-right me-1"></i> Back to Login
                  </router-link>
                </div>
              </form>
            </div>

            <!-- Password Reset Form -->
            <div v-if="token && tokenValid">
              <h2 class="text-center mb-3">Reset Your Password</h2>
              <p class="text-center mb-4">Enter your new password below.</p>
              <form @submit.prevent="resetPassword">
                <div class="mb-3">
                  <label for="newPassword" class="form-label">
                    <i class="bi bi-lock-fill me-2"></i> New Password
                  </label>
                  <input type="password" class="form-control" id="newPassword" v-model="password" required />
                </div>
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">
                    <i class="bi bi-shield-lock me-2"></i> Confirm Password
                  </label>
                  <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" required />
                </div>
                <button type="submit" class="btn btn-orange w-100 mb-3">
                  <i class="bi bi-arrow-right-circle me-2 bi-white"></i> Reset Password
                </button>

                <!-- Divider -->
                <div class="text-center my-3">
                  <hr>
                  <small class="text-muted">Changed your mind?</small><br />
                  <router-link to="/login" class="text-decoration-none text-green">
                    <i class="bi bi-box-arrow-in-right me-1"></i> Back to Login
                  </router-link>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import api from '@/services/apiService';

export default {
  name: 'ResetPassword',
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      token: this.$route.query.token || null,
      tokenValid: false,
    };
  },
  methods: {
    async sendResetLink() {
      try {
        const response = await api.get('/send-reset-link', { email: this.email });
        alert(response.data.success ? 'Reset link sent! Please check your email.' : 'Failed to send reset link.');
      } catch (error) {
        console.error('Error sending reset link:', error);
        alert('An error occurred. Please try again.');
      }
    },
    async validateToken() {
      if (this.token) {
        try {
          const response = await api.get('/verify-token', { token: this.token });
          this.tokenValid = response.data.valid;
          if (!this.tokenValid) {
            this.$router.push('/404');
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          this.$router.push('/404');
        }
      }
    },
    async resetPassword() {
      if (this.password !== this.confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
      try {
        const response = await api.get('/reset-password', {
          token: this.token,
          password: this.password,
        });
        if (response.data.success) {
          alert('Password reset successful! You can now log in.');
          this.$router.push('/login');
        } else {
          alert('Failed to reset password.');
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        alert('An error occurred. Please try again.');
      }
    },
  },
  mounted() {
    this.validateToken();
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
.login-image {
  background: url('@/assets/login-image.png') no-repeat center center;
  background-size: cover;
  width: 100%;
  height: 100%;
}
.container {
  width: 90%;
}
</style>
