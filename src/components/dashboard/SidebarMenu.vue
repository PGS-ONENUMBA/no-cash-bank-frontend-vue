<template>
  <nav id="sidebarMenu" class="col-md-3 col-lg-2 d-md-block bg-light sidebar">
    <div class="position-sticky pt-3">

      <!-- Navigation Links -->
      <ul class="nav flex-column">

        <!-- Dashboard -->
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard') }" to="/dashboard">
            <i class="bi bi-house-door sidebar-icon"></i> Dashboard
          </router-link>
        </li>

        <!-- CUSTOMER: products + Spend -->
        <template v-if="userRole === 'customer'">
          <!-- Loader (customer only) -->
          <li class="nav-item" v-if="loadingProducts">
            <div class="text-center py-3">
              <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Loading products...</span>
              </div>
            </div>
          </li>

          <!-- Empty state (customer only) -->
          <li class="nav-item" v-else-if="availableProducts.length === 0">
            <p class="text-center text-danger mb-0">No products available.</p>
          </li>

          <!-- Dynamic product menu -->
          <li
            v-for="product in availableProducts"
            :key="`${product.raffle_cycle_id}-${product.raffle_type_id}`"
            class="nav-item"
          >
            <router-link
              class="nav-link"
              :class="{ active: isActive(product.route) }"
              :to="{
                path: product.route,
                query: {
                  raffle_cycle_id: product.raffle_cycle_id,
                  raffle_type_id: product.raffle_type_id,
                },
              }"
            >
              <i :class="product.icon" class="sidebar-icon"></i> {{ product.raffle_type }}
            </router-link>
          </li>

          <!-- Spend -->
          <li class="nav-item">
            <router-link
              class="nav-link"
              :class="{ active: isActive('/dashboard/spend') }"
              to="/dashboard/spend"
            >
              <i class="bi bi-bag-check sidebar-icon"></i> Spend
            </router-link>
          </li>
        </template>

        <!-- VENDOR: Vendor Wallet -->
        <li class="nav-item" v-if="isVendor">
          <router-link
            class="nav-link d-flex align-items-center"
            :class="{ active: isActive('/vendor/logs') }"
            :to="{ name: 'VendorLogs' }"
          >
            <i class="bi bi-wallet2 sidebar-icon"></i>
            <span>Wallet Logs</span>
          </router-link>
        </li>

        <!-- Transfer (still global) -->
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/transfer') }" to="/dashboard/transfer">
            <i class="bi bi-arrow-up-right-circle sidebar-icon"></i> Transfer
          </router-link>
        </li>

        <!-- Reports (still global) -->
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/reports') }" to="/dashboard/reports">
            <i class="bi bi-clock-history sidebar-icon"></i> Reports
          </router-link>
        </li>
      </ul>

      <!-- Profile & Logout -->
      <ul class="nav flex-column mt-4">
        <li class="nav-item">
          <router-link class="nav-link" :class="{ active: isActive('/dashboard/profile') }" to="/dashboard/profile">
            <i class="bi bi-person sidebar-icon"></i> My Profile
          </router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" @click.prevent="handleLogout">
            <i class="bi bi-box-arrow-right sidebar-icon"></i> Logout
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchProducts, isLoading, getIcon, getRoute } from '@/services/productService'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'SidebarMenu',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const availableProducts = ref([])
    const loadingProducts = isLoading()

    const userRole = computed(() => authStore.user?.user_role || 'guest')
    const isVendor = computed(() => {
      // support either a single string role or an array of roles
      const roles = authStore.user?.roles || authStore.user?.user_role || []
      return Array.isArray(roles) ? roles.includes('vendor') : roles === 'vendor'
    })

    /** Transform raw raffle data into menu items */
    const transformProducts = (raffles) => {
      const out = []
      raffles.forEach((raffle) => {
        (raffle.associated_types || []).forEach((type) => {
          out.push({
            raffle_cycle_id: raffle.raffle_cycle_id,
            raffle_type_id: type.raffle_type_id,
            raffle_type: type.raffle_type,
            winnable_amount: raffle.winnable_amount,
            icon: `${getIcon(type.raffle_type_id)} sidebar-icon`,
            route: getRoute(type.raffle_type_id),
          })
        })
      })
      return out
    }

    /** Load and transform products using cached service */
    const loadProducts = async () => {
      try {
        const raw = await fetchProducts()
        availableProducts.value = transformProducts(raw || [])
      } catch (err) {
        console.error('❌ Error loading products:', err)
        availableProducts.value = []
      }
    }

    /** Check if route is active */
    const isActive = (route) => router.currentRoute.value.path === route

    /** Handle user logout */
    const handleLogout = async () => {
      await authStore.logout()
      router.push('/login')
    }

    onMounted(() => {
      if (userRole.value === 'customer') {
        loadProducts()
      }
    })

    return {
      authStore,
      userRole,
      isVendor,
      isActive,
      handleLogout,
      availableProducts,
      loadingProducts,
    }
  },
}
</script>

<style scoped>
/* ✅ Sidebar link text should be black */
.sidebar .nav-link {
  color: black;
  font-weight: 500;
  transition: color 0.3s ease-in-out;
}

/* ✅ Purple Icons */
.sidebar-icon {
  color: #6609b8;
  margin-right: 8px;
}

/* ✅ Hover */
.sidebar .nav-link:hover {
  color: #555;
}

/* ✅ Active state remains green */
.sidebar .nav-link.active {
  color: #09b850;
}

/* Adjust spacing */
.nav.flex-column {
  padding-left: 10px;
}
</style>
