import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/store/authStore"; // Import Pinia auth store

// Import layouts
import PublicLayout from "@/layouts/PublicLayout.vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";

// Public Views (accessible to all users)
import HomeView from '@/views/Public/HomeView.vue';
import AboutView from '@/views/Public/AboutView.vue';
import TeamView from '@/views/Public/TeamView.vue';
import HowItWorksView from '@/views/Public/How-It-WorksView.vue';
import LoginView from '@/views/Public/LoginView.vue';
import PublicGetCashView from '@/views/Public/GetCashView.vue';
import PublicPay4MeView from '@/views/Public/PublicPay4MeView.vue';
import PublicOnTheHouseView from '@/views/Public/OnTheHouseView.vue';
import PrivacyView from '@/views/PrivacyView.vue';
import TermsView from '@/views/TermsView.vue';
import ResetPasswordView from '@/views/Public/ResetPasswordView.vue';
import NotFound from '@/views/404View.vue';

// Dashboard Views (restricted to authenticated users)
import DashboardView from '@/views/Dashboard/DashboardView.vue';
import DashboardGetCashView from '@/views/Dashboard/GetCashView.vue';
import DashboardPay4MeView from '@/views/Dashboard/Pay4MeView.vue';
import OnTheHouseView from '@/views/Dashboard/OnTheHouseView.vue';
import TransferView from '@/views/Dashboard/TransferView.vue';
import ReportsView from '@/views/Dashboard/ReportsView.vue';
import ProfileView from '@/views/Dashboard/ProfileView.vue';

/**
 * Route Definitions
 */
const routes = [
  // 🔹 Public Routes (Using PublicLayout)
  {
    path: "/",
    component: PublicLayout,
    children: [
      { path: '', name: 'Home', component: HomeView, meta: { title: 'Home' } },
      { path: 'about', name: 'About', component: AboutView, meta: { title: 'About Us' } },
      { path: 'team', name: 'Team', component: TeamView, meta: { title: 'Our Team' } },
      { path: 'how-it-works', name: 'HowItWorks', component: HowItWorksView, meta: { title: 'How It Works' } },
      { path: 'get-cash', name: 'PublicGetCash', component: PublicGetCashView, meta: { title: 'Get Cash' } },
      { path: 'pay4me', name: 'Pay4Me', component: PublicPay4MeView, meta: { title: 'Pay-4-Me' } },
      { path: 'on-the-house', name: 'PublicOnTheHouse', component: PublicOnTheHouseView, meta: { title: 'On The House' } },
      { path: 'login', name: 'Login', component: LoginView, meta: { title: 'Login' } },
      { path: 'privacy', name: 'Privacy', component: PrivacyView, meta: { title: 'Privacy' } },
      { path: 'terms', name: 'Terms', component: TermsView, meta: { title: 'Terms & Conditions' } },
      { path: 'reset-password', name: 'ResetPassword', component: ResetPasswordView, meta: { title: 'Reset Password' } },
    ],
  },

  // 🔹 Dashboard Routes (Using DashboardLayout) – Protected
  {
    path: "/dashboard",
    component: DashboardLayout,
    meta: { requiresAuth: true }, // Authentication required
    children: [
      { path: '', name: 'Dashboard', component: DashboardView, meta: { title: 'Dashboard' } },
      { path: 'get-cash', name: 'DashboardGetCash', component: DashboardGetCashView, meta: { title: 'Get Cash' } },
      { path: 'pay4me', name: 'DashboardPay4Me', component: DashboardPay4MeView, meta: { title: 'Pay-4-Me' } },
      { path: 'on-the-house', name: 'OnTheHouseView', component: OnTheHouseView, meta: { title: 'On The House' } },
      { path: 'transfer', name: 'DashboardTransfer', component: TransferView, meta: { title: 'Transfer' } },
      { path: 'reports', name: 'DashboardReports', component: ReportsView, meta: { title: 'Reports' } },
      { path: 'profile', name: 'DashboardProfile', component: ProfileView, meta: { title: 'Profile Page' } },
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

  // Redirect to dashboard if already logged in
  if (to.name === "Login" && isAuthenticated) {
    next({ name: "Dashboard" });
    return;
  }

  // Redirect to login if authentication is required
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "Login" });
  } else {
    document.title = to.meta.title || "No-Cash-Bank";
    next();
  }
});

export default router;
