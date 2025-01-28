/**
 * Vue Router Configuration
 * 
 * This file sets up routing for the Vue application. It defines:
 * - Path-to-component mapping for each route
 * - A global navigation guard to dynamically set the document title
 * - Route-based scroll behavior for smoother navigation
 * 
 * Key Features:
 * - Public routes for non-authenticated users (e.g., Home, About, Login)
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
import GetCash from '@/views/Public/GetCash.vue'; // Get Cash page
import Pay4Me from '@/views/Public/Pay4Me.vue'; // Pay-4-Me page
import OnTheHouse from '@/views/Public/OnTheHouse.vue'; // On The House page
import Privacy from '@/views/Privacy.vue'; // Privacy Policy page
import Terms from '@/views/Terms.vue'; // Terms & Conditions page
import ResetPassword from '@/views/Public/ResetPassword.vue'; // Password Reset page
import NotFound from '@/views/404.vue'; // 404 Page Not Found

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
  { path: '/', name: 'Home', component: Home, meta: { title: 'Home' } },
  { path: '/about', name: 'About', component: About, meta: { title: 'About Us' } },
  { path: '/team', name: 'Team', component: Team, meta: { title: 'Our Team' } },
  { path: '/how-it-works', name: 'HowItWorks', component: HowItWorks, meta: { title: 'How It Works' } },
  { path: '/get-cash', name: 'GetCash', component: GetCash, meta: { title: 'Get Cash' } },
  { path: '/pay4me', name: 'Pay4Me', component: Pay4Me, meta: { title: 'Pay-4-Me' } },
  { path: '/on-the-house', name: 'OnTheHouse', component: OnTheHouse, meta: { title: 'On The House' } },
  { path: '/login', name: 'Login', component: Login, meta: { title: 'Login' } },
  { path: '/privacy', name: 'Privacy', component: Privacy, meta: { title: 'Privacy' } },
  { path: '/terms', name: 'Terms', component: Terms, meta: { title: 'Terms & Conditions' } },
  { path: '/reset-password', name: 'ResetPassword', component: ResetPassword, meta: { title: 'Reset Password' } },

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
      // Handle scrolling for hash links (e.g., `#videoModal`)
      if (to.hash === "#videoModal") {
        setTimeout(() => {
          const videoModal = new bootstrap.Modal(document.getElementById("videoModal"));
          videoModal.show(); // Open the modal for the hash
        }, 300); // Delay to ensure the page is loaded
      }
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
 * Global Navigation Guard
 * 
 * This guard runs before every route change. It performs the following tasks:
 * - Dynamically updates the document title based on the route's `meta.title` property
 * - If no title is specified, it falls back to "No-Cash-Bank"
 */
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'No-Cash-Bank'; // Set the document title dynamically
  next(); // Proceed to the next route
});

export default router; // Export the router instance for use in the Vue application
