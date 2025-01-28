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
 * - Dashboard routes for authenticated users
 * - Catch-all route for 404 pages
 * - Dynamic hash-based modal handling
 */

import { createRouter, createWebHistory } from 'vue-router'; // Import Vue Router modules

// Public views (accessible to all users)
import Home from '@/views/Public/Home.vue'; // Home page
import About from '@/views/Public/About.vue'; // About Us page
import Team from '@/views/Public/Team.vue'; // Our Team page
import HowItWorks from '@/views/Public/How-It-Works.vue'; // How It Works page
import Login from '@/views/Public/Login.vue'; // Login page
import PublicGetCash from '@/views/Public/GetCash.vue'; // Get Cash page
import PublicPay4Me from '@/views/Public/Pay4Me.vue'; // Pay-4-Me page
import OnTheHouse from '@/views/Public/OnTheHouse.vue'; // On The House page
import Privacy from '@/views/Privacy.vue'; // Privacy Policy page
import Terms from '@/views/Terms.vue'; // Terms & Conditions page
import ResetPassword from '@/views/Public/ResetPassword.vue'; // Password Reset page
import NotFound from '@/views/404.vue'; // 404 Page Not Found

// Dashboard views (restricted to authenticated users)
// Dashboard views
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import Dashboard from "@/views/Dashboard/Dashboard.vue";
import DashboardGetCash from "@/views/Dashboard/GetCash.vue";
import DashboardPay4Me from "@/views/Dashboard/Pay4Me.vue";
import Transfer from "@/views/Dashboard/Transfer.vue";
import Reports from "@/views/Dashboard/Reports.vue";

/**
 * Route Definitions
 * 
 * Each route object contains:
 * - `path`: The URL path that triggers this route (e.g., `/about`)
 * - `name`: A unique name for the route, used programmatically in navigation (e.g., `{ name: 'About' }`)
 * - `component`: The Vue component to load for this route
 * - `meta`: Optional metadata for the route, such as a custom title for the document tab
 */
const routes = [
  // Public routes
  { path: '/', name: 'Home', component: Home, meta: { title: 'Home' } },
  { path: '/about', name: 'About', component: About, meta: { title: 'About Us' } },
  { path: '/team', name: 'Team', component: Team, meta: { title: 'Our Team' } },
  { path: '/how-it-works', name: 'HowItWorks', component: HowItWorks, meta: { title: 'How It Works' } },
  { path: '/get-cash', name: 'GetCash', component: PublicGetCash, meta: { title: 'Get Cash' } },
  { path: '/pay4me', name: 'Pay4Me', component: PublicPay4Me, meta: { title: 'Pay-4-Me' } },
  { path: '/on-the-house', name: 'OnTheHouse', component: OnTheHouse, meta: { title: 'On The House' } },
  { path: '/login', name: 'Login', component: Login, meta: { title: 'Login' } },
  { path: '/privacy', name: 'Privacy', component: Privacy, meta: { title: 'Privacy' } },
  { path: '/terms', name: 'Terms', component: Terms, meta: { title: 'Terms & Conditions' } },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword, meta: { title: 'Reset Password' } },

  // Dashboard routes (protected)
  // Dashboard routes (using DashboardLayout)
  {
    path: "/dashboard",
    component: DashboardLayout,
    meta: { requiresAuth: true }, // Authentication required
    children: [
      { path: "", name: "Dashboard", component: Dashboard },
      { path: "get-cash", name: "DashboardGetCash", component: DashboardGetCash },
      { path: "pay4me", name: "DashboardPay4Me", component: DashboardPay4Me },
      { path: "transfer", name: "DashboardTransfer", component: Transfer },
      { path: "reports", name: "DashboardReports", component: Reports },
    ],
  },

  // Catch-all route for 404 errors (must always be the last route)
  {
    path: '/:pathMatch(.*)*', // Matches any route not defined above
    name: 'NotFound',
    component: NotFound,
    meta: { title: '404 - Page Not Found' },
  },
];

/**
 * Router Instance
 * 
 * This object manages all routing functionality in the application:
 * - `history`: Enables clean, SEO-friendly URLs without hash symbols (e.g., `/about` instead of `/#/about`)
 * - `routes`: Specifies the route definitions from above
 * - `scrollBehavior`: Determines how scrolling is handled when navigating between routes
 */
const router = createRouter({
  history: createWebHistory(), // Use the browser's history mode for clean URLs
  routes, // Apply the defined routes

  /**
   * Scroll Behavior
   * 
   * This function handles scrolling when navigating between routes:
   * - If `savedPosition` is available (e.g., user clicked back/forward), restore it
   * - If a hash (e.g., `#faq`) is present, scroll to the specified element
   * - Otherwise, scroll to the top of the page
   */
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition; // Restore the previous scroll position
    } else if (to.hash) {
      return {
        el: to.hash, // Scroll to the element matching the hash
        behavior: "smooth", // Smooth scrolling effect
      };
    } else {
      return { top: 0 }; // Default: Scroll to the top of the page
    }
  },
});

/**
 * Navigation Guards
 * 
 * Global guard for route protection:
 * - Prevents access to dashboard routes without authentication
 * - Dynamically sets the document title based on route metadata
 */
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("authToken"); // Check for authentication token
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "Login" }); // Redirect to login if not authenticated
  } else {
    document.title = to.meta.title || 'No-Cash-Bank'; // Set the document title dynamically
    next(); // Proceed to the next route
  }
});

export default router; // Export the router instance for use in the Vue application
