<template>
  <div>
    <!-- Dashboard Header -->
    <header class="navbar navbar-light sticky-top bg-white shadow px-3">
      <!-- Left: Logo + Site Name -->
      <a
        class="navbar-brand d-flex align-items-center gap-2 col-md-3 col-lg-2"
        href="#"
        @click.prevent="goToDashboard"
      >
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

        <!-- Optional: add a Logout button/icon here if you want -->
        <!--
        <button class="btn btn-outline-danger btn-sm" @click="handleLogout">
          <i class="bi bi-box-arrow-right me-1"></i> Logout
        </button>
        -->
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
  </div>
</template>

<script>
import SidebarMenu from "@/components/dashboard/SidebarMenu.vue";
import { useAuthStore } from "@/stores/authStore";
import { computed } from "vue";
import { useRouter } from "vue-router";

import logoPng from "@/assets/logo.png";

export default {
  name: "DashboardLayout",
  components: { SidebarMenu },
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const userDisplayName = computed(
      () => authStore.user?.nicename || authStore.user?.email || "User"
    );
    const siteName = import.meta.env.VITE_SITE_NAME || "PayByChance";

    const logoUrl = logoPng;
    const iconUrl = `${import.meta.env.BASE_URL}icon.png`;

    const handleLogout = async () => {
      await authStore.logout(router); // store will redirect to /login
    };

    const goToDashboard = () => {
      router.push("/dashboard").catch(() => {});
    };

    return {
      siteName,
      userDisplayName,
      handleLogout,
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
  .site-name {
    display: none;
  }
}
</style>
