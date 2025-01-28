# App Architecture Documentation

## Overview
This document provides a comprehensive overview of the architecture for the No-Cash-Bank-Vue application. It is intended to help developers understand the app's structure, navigate its components, and contribute effectively.

---

## Directory Structure

```
/src
  ├── assets/                # Static assets (e.g., images, fonts, styles)
  ├── components/            # Reusable Vue components
  │   ├── dashboard/         # Dashboard-specific components
  │   ├── forms/             # Reusable form components
  │   └── shared/            # Shared components across the app
  ├── layouts/               # Layout components
  │   ├── PublicLayout.vue   # Layout for public-facing pages
  │   └── DashboardLayout.vue # Layout for dashboard pages
  ├── router/                # Vue Router configuration
  │   └── index.js           # Centralized routing setup
  ├── services/              # API and utility services
  │   ├── apiService.js      # Axios instance and API base configuration
  │   └── authService.js     # Authentication-related API calls
  ├── views/                 # Page-level components
  │   ├── Public/            # Public-facing views
  │   │   ├── Home.vue
  │   │   ├── About.vue
  │   │   ├── Login.vue
  │   │   ├── ResetPassword.vue
  │   │   ├── HowItWorks.vue
  │   │   ├── GetCash.vue
  │   │   ├── Pay4Me.vue
  │   │   ├── OnTheHouse.vue
  │   ├── Dashboard/         # Dashboard-specific views
  │   │   ├── Dashboard.vue
  │   │   ├── GetCash.vue
  │   │   ├── Pay4Me.vue
  │   │   ├── OnTheHouse.vue
  │   │   ├── Transfer.vue
  │   │   ├── Reports.vue
  ├── App.vue                # Root Vue component
  ├── main.js                # Entry point for the Vue app
  └── env/                   # Environment-specific configurations
```

---

## Key Components and Views

### Components

#### `components/shared/`
- Shall Contains reusable form fields like input, select, and validation logic.
- **Header.vue**: Application-wide header component.
- **Footer.vue**: Application-wide footer component.

#### `components/dashboard/`
- **SidebarMenu.vue**: Sidebar navigation for dashboard views.
- **FeatureCard.vue**: Reusable card component for dashboard features.

#### `components/forms/`
- **GetCashForm.vue**: Reusable form for the "Get Cash" feature.
- **Pay4MeForm.vue**: Reusable form for the "Pay-4-Me" feature.
- **OnTheHouseForm.vue**: Reusable form for the "On The House" feature.

### Views

#### Public Views
- **Home.vue**: Landing page for the application.
- **About.vue**: "About Us" page.
- **Login.vue**: Login page for users.
- **ResetPassword.vue**: Password reset page.
- **HowItWorks.vue**: Explains how the app works.
- **GetCash.vue**: Public implementation of "Get Cash".
- **Pay4Me.vue**: Public implementation of "Pay-4-Me".
- **OnTheHouse.vue**: Public implementation of "On The House".

#### Dashboard Views
- **Dashboard.vue**: Landing page after user login.
- **GetCash.vue**: Dashboard implementation of the "Get Cash" feature.
- **Pay4Me.vue**: Dashboard implementation of the "Pay-4-Me" feature.
- **OnTheHouse.vue**: Dashboard implementation of the "On The House" feature.
- **Transfer.vue**: Transfer funds feature.
- **Reports.vue**: Transaction logs and report view.

---

## Routing

Routing is configured in `src/router/index.js`. It uses Vue Router with lazy loading for improved performance. 

### Route Definitions

#### Public Routes
```javascript
{
  path: '/',
  name: 'Home',
  component: () => import('@/views/Public/Home.vue'),
},
{
  path: '/about',
  name: 'About',
  component: () => import('@/views/Public/About.vue'),
},
{
  path: '/login',
  name: 'Login',
  component: () => import('@/views/Public/Login.vue'),
},
```

#### Dashboard Routes
```javascript
{
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('@/layouts/DashboardLayout.vue'),
  children: [
    {
      path: '',
      name: 'DashboardHome',
      component: () => import('@/views/Dashboard/Dashboard.vue'),
    },
    {
      path: 'get-cash',
      name: 'DashboardGetCash',
      component: () => import('@/components/forms/GetCashForm.vue'),
    },
    {
      path: 'pay4me',
      name: 'DashboardPay4Me',
      component: () => import('@/components/forms/Pay4MeForm.vue'),
    },
    {
      path: 'on-the-house',
      name: 'DashboardOnTheHouse',
      component: () => import('@/components/forms/OnTheHouseForm.vue'),
    },
  ],
},
```

---

## Environment Variables

Environment variables are configured in `.env` files:

- **VITE_API_BASE_URL**: Base URL for API calls.
- **VITE_SITE_NAME**: Application name.
- **VITE_PRODUCT_ONE**, **VITE_PRODUCT_TWO**, **VITE_PRODUCT_THREE**: Product names used across the app.

---

## Development Guidelines

1. **Reusable Components**:
   - Create components for any UI element used in more than one place.
   - Use `components/forms/` for shared forms to reduce duplication.

2. **Routing**:
   - Define routes in `src/router/index.js`.
   - Use lazy loading for views and components.

3. **State Management**:
   - Use Vuex or Pinia if the app requires centralized state management.

4. **Styling**:
   - Use scoped styles in components.
   - Global styles should go in `src/styles/`.

---

## Notes for Developers

- **CSP Compliance**: Ensure all inline scripts and styles comply with Content Security Policy (CSP) guidelines.
- **Documentation**: Add comments to all new components and views.
- **Testing**: Write unit tests for critical components and features.

---

This document is a living guide and should be updated as the application evolves.

