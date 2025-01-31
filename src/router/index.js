/**
 * Vue Router Configuration
 *
 * This file sets up routing for the Vue application. It defines:
 * - Path-to-component mapping for each route
 * - A global navigation guard to dynamically set the document title
 * - Route-based scroll behavior for smoother navigation
 * - Protected dashboard routes requiring authentication
 *
 * Key Features:
 * - Public routes for non-authenticated users (e.g., Home, About, Login)
 * - Dashboard routes for authenticated users (using DashboardLayout)
 * - Catch-all route for 404 pages
 * - Secure authentication redirection
 */

import { createRouter, createWebHistory } from 'vue-router';

// Import layouts
import PublicLayout from '@/layouts/PublicLayout.vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';

// Public Views (accessible to all users)
import Home from '@/views/Public/Home.vue';
import About from '@/views/Public/About.vue';
import Team from '@/views/Public/Team.vue';
import HowItWorks from '@/views/Public/How-It-Works.vue';
import Login from '@/views/Public/Login.vue';
import PublicGetCash from '@/views/Public/GetCash.vue';
import PublicPay4Me from '@/views/Public/Pay4Me.vue';
import PublicOnTheHouse from '@/views/Public/OnTheHouse.vue';
import Privacy from '@/views/Privacy.vue';
import Terms from '@/views/Terms.vue';
import ResetPassword from '@/views/Public/ResetPassword.vue';
import NotFound from '@/views/404.vue';

// Dashboard Views (restricted to authenticated users)
import Dashboard from '@/views/Dashboard/Dashboard.vue';
import DashboardGetCash from '@/views/Dashboard/GetCash.vue';
import DashboardPay4Me from '@/views/Dashboard/Pay4Me.vue';
import DashboardOnTheHouse from '@/views/Dashboard/OnTheHouse.vue';
import Transfer from '@/views/Dashboard/Transfer.vue';
import Reports from '@/views/Dashboard/Reports.vue';
import Profile from '@/views/Dashboard/Profile.vue';

/**
 * Route Definitions
 *
 * Each route object contains:
 * - `path`: The URL path that triggers this route (e.g., `/about`)
 * - `name`: A unique name for the route, used programmatically in navigation
 * - `component`: The Vue component to load for this route
 * - `meta`: Optional metadata for the route, such as a custom title
 */
const routes = [
  // 🔹 Public Routes (Using PublicLayout)
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'Home', component: Home, meta: { title: 'Home' } },
      { path: 'about', name: 'About', component: About, meta: { title: 'About Us' } },
      { path: 'team', name: 'Team', component: Team, meta: { title: 'Our Team' } },
      { path: 'how-it-works', name: 'HowItWorks', component: HowItWorks, meta: { title: 'How It Works' } },
      { path: 'get-cash', name: 'PublicGetCash', component: PublicGetCash, meta: { title: 'Get Cash' } },
      { path: 'pay4me', name: 'PublicPay4Me', component: PublicPay4Me, meta: { title: 'Pay-4-Me' } },
      { path: 'on-the-house', name: 'PublicOnTheHouse', component: PublicOnTheHouse, meta: { title: 'On The House' } },
      { path: 'login', name: 'Login', component: Login, meta: { title: 'Login' } },
      { path: 'privacy', name: 'Privacy', component: Privacy, meta: { title: 'Privacy' } },
      { path: 'terms', name: 'Terms', component: Terms, meta: { title: 'Terms & Conditions' } },
      { path: 'reset-password', name: 'ResetPassword', component: ResetPassword, meta: { title: 'Reset Password' } },
    ],
  },

  // 🔹 Dashboard Routes (Using DashboardLayout) – Protected
  {
    path: '/dashboard',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: Dashboard, meta: { title: 'Dashboard' } },
      { path: 'get-cash', name: 'DashboardGetCash', component: DashboardGetCash, meta: { title: 'Get Cash' } },
      { path: 'pay4me', name: 'DashboardPay4Me', component: DashboardPay4Me, meta: { title: 'Pay-4-Me' } },
      { path: 'on-the-house', name: 'DashboardOnTheHouse', component: DashboardOnTheHouse, meta: { title: 'On The House' } },
      { path: 'transfer', name: 'DashboardTransfer', component: Transfer, meta: { title: 'Transfer' } },
      { path: 'reports', name: 'DashboardReports', component: Reports, meta: { title: 'Reports' } },
      { path: 'profile', name: 'DashboardProfile', component: Profile, meta: { title: 'Profile Page' } },
    ],
  },
  // 🔹 Catch-all Route (404)
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '404 - Page Not Found' },
  },
];

/**
 * Router Instance
 *
 * This object manages routing functionality:
 * - Uses `history` for SEO-friendly URLs
 * - Defines route behaviors, including authentication checks
 */
const router = createRouter({
  history: createWebHistory(),
  routes,

  /**
   * Scroll Behavior
   *
   * Controls scrolling when navigating:
   * - Restores previous scroll position if available
   * - Scrolls to hash targets if specified
   * - Defaults to top of the page
   */
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    } else {
      return { top: 0 };
    }
  },
});

/**
 * Navigation Guards
 *
 * - Protects dashboard routes from unauthorized access
 * - Redirects authenticated users away from login
 * - Dynamically updates document title
 */
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken');

  // Redirect to dashboard if already logged in
  if (to.name === 'Login' && isAuthenticated) {
    next({ name: 'Dashboard' });
    return;
  }

  // Redirect to login if authentication is required
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else {
    document.title = to.meta.title || 'No-Cash-Bank';
    next();
  }
});

export default router;
