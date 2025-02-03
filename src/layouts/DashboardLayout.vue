<template>
  <div>
    <!-- Dashboard Header -->
    <header class="navbar navbar-light sticky-top bg-white shadow px-3">
      <a class="navbar-brand col-md-3 col-lg-2" href="#" @click="goToDashboard">
        {{ siteName }}
      </a>

      <!-- Right Side of Navbar -->
      <div class="navbar-nav d-flex align-items-center">
        <div class="nav-item dropdown me-3">
          <span>
            <i class="bi bi-person-circle me-2"></i> {{ userDisplayName }}
          </span>
        </div>
      </div>
    </header>

    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <SidebarMenu />

        <!-- Main Content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
          <router-view></router-view>
        </main>
      </div>
    </div>

    <!-- Inactivity Warning Modal -->
    <div v-if="showWarning" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Session Expiring</h5>
          </div>
          <div class="modal-body">
            <p>You have been inactive. You will be logged out soon.</p>
            <p>Do you want to stay logged in?</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="cancelLogout">Stay Logged In</button>
            <button class="btn btn-danger" @click="handleLogout">Logout</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showWarning" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import SidebarMenu from "@/components/dashboard/SidebarMenu.vue";
import { useAuthStore } from "@/store/authStore";
import { computed, onMounted, onUnmounted } from "vue";
import { debounce } from "lodash";
import { useRouter } from "vue-router";

export default {
  name: "DashboardLayout",
  components: {
    SidebarMenu,
  },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const userDisplayName = computed(() => authStore.user?.user_nicename || "User");
    const showWarning = computed(() => authStore.showWarning);
     // ✅ Define `siteName` properly
     const siteName = import.meta.env.VITE_SITE_NAME || "OneNUMBA"; 

    const trackActivity = debounce(() => {
      if (authStore.isAuthenticated) {
        authStore.resetTimers();
        authStore.startInactivityTimer(router); // ✅ Pass router instance
      }
    }, 500);

    const handleLogout = () => {
      console.log("Logout button clicked."); // Debugging log
      authStore.logout(router); // Call the logout function from Pinia
      router.push("/login"); // Ensure redirection happens
    };

    const cancelLogout = () => {
      authStore.cancelLogout();
    };

    const goToDashboard = () => {
      router.push("/dashboard");
    };

    onMounted(() => {
      window.addEventListener("mousemove", trackActivity);
      window.addEventListener("keydown", trackActivity);
      window.addEventListener("click", trackActivity);

      authStore.startInactivityTimer(router); // ✅ Pass router instance on mount
    });

    onUnmounted(() => {
      window.removeEventListener("mousemove", trackActivity);
      window.removeEventListener("keydown", trackActivity);
      window.removeEventListener("click", trackActivity);
    });

    return {
      siteName, // ✅ Ensure this is returned
      userDisplayName,
      showWarning,
      handleLogout,
      cancelLogout,
      goToDashboard,
    };
  },
};
</script>

<style scoped>
.modal {
  display: block;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border-radius: 10px;
}
</style>
