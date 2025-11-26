# Copilot Instructions for no-cash-bank-frontend-vue

## Project Overview

**no-cash-bank-frontend-vue** is a Vue 3 + Vite frontend for a financial services platform (Pay by Chance raffle/lottery product). It handles public-facing pages (Home, About, Login) and a dashboard for authenticated users with features like "Get Cash," "Pay-4-Me," transfers, and reports.

---

## Architecture Essentials

### Layout-Based Routing Pattern

The app uses **two main layouts** (`src/layouts/`) that wrap route children:
- **PublicLayout.vue**: Renders public pages (Home, Login, About) with navbar/footer
- **DashboardLayout.vue**: Renders authenticated pages (Dashboard, Profile, Reports) with sidebar

Routes are defined in `src/router/index.js` using this pattern:
```javascript
{ path: '/dashboard', component: DashboardLayout, meta: { requiresAuth: true }, children: [...] }
```

**Why**: Separates navigation/chrome from content; easier to protect routes with `beforeEach` guard.

### Authentication & Token Management

**Flow**: `authStore.js` (Pinia) → `authService.js` (API calls) → `http.js` (Axios interceptors)

Key points:
- **Tokens stored in localStorage**: `auth_token`, `refresh_token`, `token_expiry`
- **CSRF token**: Fetched via `/context-proxy/v1/csrf` and cached in `csrf.js`; auto-refreshed on 401
- **HttpOnly cookies**: Refresh token stored server-side; browser can only send it via `withCredentials: true`
- **Router guard** in `index.js`: Redirects unauthenticated users to Login

**When modifying auth**: Update `authStore.js` (state/actions), `authService.js` (API calls), and `http.js` (interceptors together).

### API Service Architecture

All backend calls go through a **Context Proxy pattern** (see `apiService.js`):

```javascript
// Browser NEVER sends Basic Auth; proxy handles it server-side
await proxyAction('get_raffle_cycle', { param1: value });
// Posts to: /context-proxy/v1/action with action_type + params
```

**Why**: Decouples frontend from backend auth; CSRF protection; centralized error handling.

Env variable: `VITE_API_BASE_URL=https://backend.paybychance.com/wp-json`

---

## Key Services & Patterns

| Service | Purpose | Key Files |
|---------|---------|-----------|
| **authStore** | User state, login/logout, token refresh | `stores/authStore.js` |
| **apiService** | Context proxy calls, raffle data, orders | `services/apiService.js` |
| **authService** | Login/refresh/logout HTTP calls | `services/authService.js` |
| **http** | Axios instance with CSRF & 401 retry interceptors | `services/http.js` |
| **paymentService** | Squad payment integration | `services/squad.service.js` |
| **walletService** | Wallet balance, spend tracking | `services/walletService.js` |
| **productService** | Product config & validation | `services/productService.js` |

**When adding new features**: Create a service file in `src/services/`, use `proxyAction()` for backend calls, import in components via `<script setup>`.

---

## State Management (Pinia)

**Stores**: `src/stores/{appStore,authStore,reportStore}.js`

- Stores **persist to localStorage** via `pinia-plugin-persistedstate`
- `authStore` auto-fetches on app init if token exists
- Avoid putting UI state (modals, filters) in stores; use component `ref()`

**Pattern**:
```javascript
import { useAuthStore } from '@/stores/authStore';
const auth = useAuthStore();
if (!auth.isAuthenticated) { /* redirect */ }
```

---

## Component & Form Conventions

### Dynamic Forms (`DynamicProductForm.vue`)

- **Reusable**: Used for "Get Cash," "Pay-4-Me," Scan2Pay4Me flows
- **Config-driven**: `productConfig.js` defines field schemas (name, type, validation rules)
- **Flow**: User fills form → `handleSubmit()` validates → calls `proxyAction()` → waits for payment confirmation
- **Vendor mode**: Scan2Pay4Me renders vendor details; QR mode for merchant transactions

**When adding new product form**: Extend `productConfig.js`, update form schema, add route in `router/index.js`.

### Common Components

- **ToastComponent.vue**: Show success/error messages (uses Bootstrap toasts)
- **VendorSelect.vue**: Dropdown for selecting payment vendors
- **Preloader.vue**: Loading spinner during API calls
- **WalletBalance.vue**: Display user's balance (auto-refreshes on store change)

---

## Environment Variables

Create `.env.local` (or configure via deployment):

```
VITE_API_BASE_URL=https://backend.paybychance.com/wp-json
VITE_SITE_NAME=Pay by Chance
VITE_TOKEN_EXPIRY_MIN=20
VITE_TOKEN_REFRESH_BUFFER_MIN=2
VITE_PRODUCT_ONE=Get Cash
VITE_PRODUCT_TWO=Pay-4-Me
VITE_PRODUCT_THREE=Scan2Pay4Me
```

---

## Development & Testing

### Build & Run

```bash
npm install
npm run dev          # Vite dev server (hot reload)
npm run build        # Production build (hashed assets for CSP)
npm run preview      # Preview prod build
npm run lint         # ESLint + fix
```

### Testing

```bash
npm run test:e2e                    # Nightwatch E2E tests (tests/e2e/)
npm run test:e2e -- --env chrome    # Chrome only
npm run test:unit                   # Nightwatch component tests (src/**/__tests__/)
```

**Note**: Tests require build first (CI): `npm run build && npm run test:e2e`

### CSP Compliance

- No inline `<style>` or `<script>`; use external CSS/JS files
- Asset hashing in `vite.config.js` ensures cache-busting with CSP nonces
- CSRF token embedded in `x-csrf-token` header (not cookie)

---

## Common Tasks

### Add a New Route
1. Create view in `src/views/Public/` or `src/views/Dashboard/`
2. Import in `src/router/index.js`
3. Add route object to appropriate layout's `children` array
4. If protected, add `meta: { requiresAuth: true }`

### Call a Backend Action
```javascript
import { proxyAction } from '@/services/apiService';
const result = await proxyAction('get_order_history', { limit: 10 });
```

### Handle CSRF Token Expiry
The `http.js` interceptor automatically:
1. Detects 401 response
2. Calls `/context-proxy/v1/csrf` to refresh token
3. Retries original request once
- No manual intervention needed; transparent to components

### Debug Auth Issues
- Check `localStorage` for `auth_token`, `token_expiry`
- Open DevTools → Network → check for `x-csrf-token` header on Context Proxy calls
- Verify `withCredentials: true` is set (for cookie-based refresh)

---

## File Organization Quick Reference

```
src/
  components/          # Reusable Vue components
    forms/            # Product forms (DynamicProductForm, Scan2Pay4MeForm)
    common/           # UI widgets (Toast, Preloader, WalletBalance)
    dashboard/        # Dashboard-only components (SidebarMenu, FeatureCard)
  services/           # API & utility services (apiService, authService, http, csrf, etc.)
  stores/             # Pinia stores (authStore, appStore, reportStore)
  views/
    Public/           # Public pages (Home, Login, About)
    Dashboard/        # Protected pages (Dashboard, Reports, Profile)
  router/             # Vue Router config (index.js)
  layouts/            # PublicLayout.vue, DashboardLayout.vue
  assets/             # CSS, fonts, images
config/
  productConfig.js    # Product schemas (fields, validation, descriptions)
```

---

## Key Decision Points

1. **Use Context Proxy, not direct Backend Auth**: All XHR calls go through `/context-proxy/v1/action`. Browser never holds Basic credentials.
2. **Token Expiry via localStorage**: `token_expiry` timestamp checked by `isTokenExpired` getter; refresh triggered before expiry buffer.
3. **Layout-Based Routing**: Never mix PublicLayout and DashboardLayout children; each has distinct chrome and auth requirements.
4. **Service-Per-Feature**: Spin up new `src/services/featureName.js` for new domains (payments, transfers, reports).
5. **ESLint Strict Mode**: Use `.eslintignore` sparingly; code reviews catch issues not caught by linter.

---

## Questions or Issues?

Check `app-architecture.md` for deeper architectural docs. Review `package.json` for all available scripts and dependencies.
