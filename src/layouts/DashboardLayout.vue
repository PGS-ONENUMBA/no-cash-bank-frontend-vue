<template>
  <div>
    <!-- Dashboard Header -->
    <header class="navbar navbar-light sticky-top bg-white shadow px-3">
      <!-- Left: Logo + Site Name -->
      <a class="navbar-brand d-flex align-items-center gap-2 col-md-3 col-lg-2"
         href="#" @click="goToDashboard">
        <img :src="logoUrl" :alt="siteName" class="brand-logo img-fluid" />
        <!-- <span class="site-name d-none d-sm-inline">{{ siteName }}</span> -->
      </a>

      <!-- Center (mobile-only): small icon badge -->
      <div class="d-sm-none mx-auto">
        <img :src="iconUrl" alt="App Icon" class="app-icon-mobile" />
      </div>

      <!-- Right: User block (+ icon on desktop) -->
      <div class="navbar-nav d-flex align-items-center ms-auto">
        <div class="nav-item dropdown me-3 d-flex align-items-center gap-2">
          <img :src="iconUrl" alt="App Icon" class="app-icon d-none d-md-inline" />
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
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 mb-5">
          <router-view></router-view>
        </main>
      </div>
    </div>

    <!-- Inactivity Warning Modal -->
    <div v-if="showWarning" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">Session Expiring</h5></div>
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
import { useAuthStore } from "@/stores/authStore";
import { computed, onMounted, onUnmounted } from "vue";
import { debounce } from "lodash";
import { useRouter } from "vue-router";

/* Keep logo import (it's in src/assets, so import is correct) */
import logoPng from "@/assets/logo.png";

export default {
  name: "DashboardLayout",
  components: { SidebarMenu },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const userDisplayName = computed(() => authStore.user?.nicename || "User");
    const showWarning = computed(() => authStore.showWarning);
    const siteName = import.meta.env.VITE_SITE_NAME || "PayByChance";

    const logoUrl = logoPng;

    // icon.png is in /public, so reference by URL (no import)
    const iconUrl = `${import.meta.env.BASE_URL}icon.png`;

    const trackActivity = debounce(() => {
      if (authStore.isAuthenticated) {
        authStore.resetTimers();
        authStore.startInactivityTimer(router);
      }
    }, 500);

    const handleLogout = () => {
      authStore.logout(router);
      router.push("/login");
    };

    const cancelLogout = () => authStore.cancelLogout();
    const goToDashboard = () => router.push("/dashboard");

    onMounted(() => {
      window.addEventListener("mousemove", trackActivity);
      window.addEventListener("keydown", trackActivity);
      window.addEventListener("click", trackActivity);
      authStore.startInactivityTimer(router);
    });

    onUnmounted(() => {
      window.removeEventListener("mousemove", trackActivity);
      window.removeEventListener("keydown", trackActivity);
      window.removeEventListener("click", trackActivity);
    });

    return {
      siteName,
      userDisplayName,
      showWarning,
      handleLogout,
      cancelLogout,
      goToDashboard,
      logoUrl,
      iconUrl,
    };
  },
};
</script>

<style scoped>
.brand-logo {
  max-height: 44px;
  height: auto;
  width: auto;
  aspect-ratio: 879 / 172;
  object-fit: contain;
}

.app-icon {
  width: 28px;
  height: 28px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 6px;
}

.app-icon-mobile {
  width: 24px;
  height: 24px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 6px;
}

@media (max-width: 380px) {
  .site-name { display: none; }
}
</style>
