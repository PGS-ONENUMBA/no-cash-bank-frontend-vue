import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore"; // Import Pinia auth store

// Import layouts
import PublicLayout from "@/layouts/PublicLayout.vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";

// Public Views
import Home from "@/views/Public/Home.vue";
import About from "@/views/Public/About.vue";
import Team from "@/views/Public/Team.vue";
import HowItWorks from "@/views/Public/How-It-Works.vue";
import Login from "@/views/Public/Login.vue";
import PublicGetCash from "@/views/Public/GetCash.vue";
import PublicPay4Me from "@/views/Public/Pay4Me.vue";
import PublicOnTheHouse from "@/views/Public/OnTheHouse.vue";
import Privacy from "@/views/Privacy.vue";
import Terms from "@/views/Terms.vue";
import ResetPassword from "@/views/Public/ResetPassword.vue";
import ThankYou from "@/views/common/ThankYouPage.vue";
import NotFound from "@/views/404.vue";
import PublicScan2Pay4Me from "@/views/Public/Scan2Pay4Me.vue";
import ComingSoon from "@/views/ComingSoon.vue"; // Import ComingSoon component

import SpendAtMerchant from '@/views/SpendAtMerchant.vue';
// Test
import Test from "@/views/Public/Test.vue";

// Dashboard Views (Protected Routes)
import Dashboard from "@/views/Dashboard/Dashboard.vue";
import DashboardGetCash from "@/views/Dashboard/GetCash.vue";
import DashboardPay4Me from "@/views/Dashboard/Pay4Me.vue";
import DashboardOnTheHouse from "@/views/Dashboard/OnTheHouse.vue";
import Transfer from "@/views/Dashboard/Transfer.vue";
import Reports from "@/views/Dashboard/Reports.vue";
import Profile from "@/views/Dashboard/Profile.vue";
import VendorLogs from '@/views/VendorLogs.vue';
/**
 * Route Definitions
 */
const routes = [
  // 🔹 Public Routes (Using PublicLayout)
  {
    path: "/",
    component: PublicLayout,
    children: [
      { path: "", name: "Home", component: Home, meta: { title: "Home" } },
      { path: "thank-you", name: "ThankYou", component: ThankYou, meta: { title: "Thank you" } },
      { path: "about", name: "About", component: About, meta: { title: "About Us" } },
      { path: "team", name: "Team", component: Team, meta: { title: "Our Team" } },
      { path: "how-it-works", name: "HowItWorks", component: HowItWorks, meta: { title: "How It Works" } },
      { path: "get-cash", name: "PublicGetCash", component: PublicGetCash, meta: { title: "Get Cash" } },
      { path: "pay4me", name: "PublicPay4Me", component: PublicPay4Me, meta: { title: "Pay-4-Me" } },
      { path: "on-the-house", name: "PublicOnTheHouse", component: PublicOnTheHouse, meta: { title: "On The House" } },
      { path: "login", name: "Login", component: Login, meta: { title: "Login" } },
      { path: "privacy", name: "Privacy", component: Privacy, meta: { title: "Privacy" } },
      { path: "terms", name: "Terms", component: Terms, meta: { title: "Terms & Conditions" } },
      { path: "reset-password", name: "ResetPassword", component: ResetPassword, meta: { title: "Reset Password" } },
      { path: "scan2pay4me", name: "PublicScan2Pay4Me", component: PublicScan2Pay4Me, meta: { title: "Scan to Pay4Me" } }, // New route
      { path: "test", name: "Test", component: Test, meta: { title: "Test" } },
      { path: "404", name: "ExplicitNotFound", component: NotFound, meta: { title: "404 - Page Not Found" } }, // Explicit 404
      { path: "coming-soon", name: "ComingSoon", component: ComingSoon, meta: { title: "Coming Soon" } }, // ComingSoon
    ],
  },

  // 🔹 Dashboard Routes (Using DashboardLayout) – Protected
  {
    path: "/dashboard",
    component: DashboardLayout,
    meta: { requiresAuth: true }, // Authentication required
    children: [
      { path: "", name: "Dashboard", component: Dashboard, meta: { title: "Dashboard", role: ["customer", "vendor"] } },
      { path: "get-cash", name: "DashboardGetCash", component: DashboardGetCash, meta: { title: "Get Cash" } },
      { path: "pay4me", name: "DashboardPay4Me", component: DashboardPay4Me, meta: { title: "Pay-4-Me" } },
      { path: "on-the-house", name: "DashboardOnTheHouse", component: DashboardOnTheHouse, meta: { title: "On The House" } },
      { path: "transfer", name: "DashboardTransfer", component: Transfer, meta: { title: "Transfer", role:["customer"] } },
      { path: "reports", name: "DashboardReports", component: Reports, meta: { title: "Reports", role: ["customer", "vendor"] } },
      { path: "profile", name: "DashboardProfile", component: Profile, meta: { title: "Profile Page", role: ["customer", "vendor"] } },
      { path: 'spend', name: 'SpendAtMerchant', component: SpendAtMerchant, meta: { title: "Spend at merchant", role: ["customer"] } },
      { path: 'vendor/logs', name: 'VendorLogs',component: VendorLogs, meta: { title: "Vendor Logs", role: ["vendor"] } }, // Placeholder for vendor logs

    ],
  },

  // 🔹 Catch-all Route (404)
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
    meta: { title: "404 - Page Not Found" },
  },
];

/**
 * Router Instance
 */
const router = createRouter({
  history: createWebHistory(),
  routes,

  /**
   * Scroll Behavior
   */
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    } else {
      return { top: 0 };
    }
  },
});



/**
 * Navigation Guards
 *
 * - Uses Pinia Store for authentication state
 * - Redirects unauthenticated users from protected routes
 * - Prevents logged-in users from accessing the login page
 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated; // Use Pinia getter

   // 2️⃣ 🔹 Vendor cannot access routes with NO meta.role
   if (!to.meta.role && isAuthenticated && authStore.user.user_role === "vendor") {
    console.log("No role on this route, and vendor is not allowed to see this route");
    return next('/dashboard'); // Prevent further execution
  }

  // Redirect to dashboard if already logged in
  if (to.name === "Login" && isAuthenticated) {
    next({ name: "Dashboard" });
    return;
  }

  // Redirect to login if authentication is required
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "Login" });
  } else {
    document.title = to.meta.title || "PayByChance";
    next();
  }


});

export default router;
