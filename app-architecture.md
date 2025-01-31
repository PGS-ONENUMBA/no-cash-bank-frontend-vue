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
  │   ├── shared/            # Shared components across the app
  │   ├── Navbar.vue         # Main navigation bar
  │   ├── Footer.vue         # Application-wide footer
  ├── layouts/               # Layout components
  │   ├── PublicLayout.vue   # Layout for public-facing pages
  │   ├── DashboardLayout.vue # Layout for dashboard pages
  ├── router/                # Vue Router configuration
  │   ├── index.js           # Centralized routing setup
  ├── services/              # API and utility services
  │   ├── apiService.js      # Axios instance and API base configuration
  │   ├── authService.js     # Authentication-related API calls
  |   ├── inactivityService.js
  ├── store/                 # Vuex or Pinia store configuration (if applicable)
  ├── styles/                # Global and scoped styles
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
  ├── env/                   # Environment-specific configurations
```

---

## Key Components and Views

### Components

#### `components/shared/`
- **SharedFormFields.vue**: Contains reusable form fields like input, select, and validation logic.
- **Navbar.vue**: Global navigation component for public pages.
- **Footer.vue**: Global footer component for public pages.

#### `components/dashboard/`
- **SidebarMenu.vue**: Sidebar navigation for dashboard views.
- **FeatureCard.vue**: Reusable card component for dashboard features.

#### `components/forms/`
- **PublicGetCashForm.vue**: Reusable form for the "Get Cash" feature in the public section.
- **PublicPay4MeForm.vue**: Reusable form for the "Pay-4-Me" feature in the public section.
- **PublicOnTheHouseForm.vue**: Reusable form for the "On The House" feature in the public section.
- **SharedFormFields.vue**: Contains common fields shared across multiple forms.

### Views

#### Public Views
- **Home.vue**: Landing page for the application.
- **About.vue**: "About Us" page.
- **Login.vue**: Login page for users.
- **ResetPassword.vue**: Password reset page.
- **HowItWorks.vue**: Explains how the app works.
- **GetCash.vue**: Public-facing "Get Cash" form.
- **Pay4Me.vue**: Public-facing "Pay-4-Me" form.
- **OnTheHouse.vue**: Public-facing "On The House" form.

#### Dashboard Views
- **Dashboard.vue**: Landing page after user login.
- **GetCash.vue**: Dashboard implementation of the "Get Cash" feature.
- **Pay4Me.vue**: Dashboard implementation of the "Pay-4-Me" feature.
- **OnTheHouse.vue**: Dashboard implementation of the "On The House" feature.
- **Transfer.vue**: Transfer funds feature.
- **Reports.vue**: Transaction logs and report view.

---

## Routing

Routing is configured in `src/router/index.js`. It uses Vue Router with layouts to separate public and dashboard views.

### Route Definitions

#### Public Routes (Using `PublicLayout.vue`)
```javascript
{
  path: '/',
  component: PublicLayout,
  children: [
    { path: '', name: 'Home', component: Home },
    { path: 'about', name: 'About', component: About },
    { path: 'login', name: 'Login', component: Login },
    { path: 'get-cash', name: 'PublicGetCash', component: PublicGetCash },
  ],
},
```

#### Dashboard Routes (Using `DashboardLayout.vue`)
```javascript
{
  path: '/dashboard',
  component: DashboardLayout,
  meta: { requiresAuth: true },
  children: [
    { path: '', name: 'Dashboard', component: Dashboard },
    { path: 'get-cash', name: 'DashboardGetCash', component: GetCash },
  ],
},
```

---

## Authentication

### Login Response
Upon successful login, the API returns:
```json
{
  "access_token": "<TOKEN>",
  "refresh_token": "<TOKEN>",
  "expires_in": 3600,
  "user_data": {
    "id": 1,
    "username": "terungwa",
    "email": "mzermichael@yahoo.com",
    "phone_number": "",
    "wallet_balance": ""
  }
}
```

### Authentication Guard
Prevents access to dashboard routes if not logged in:
```javascript
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else {
    document.title = to.meta.title || 'No-Cash-Bank';
    next();
  }
});
```

---

## Environment Variables

- **VITE_API_BASE_URL**: Base URL for API calls.
- **VITE_SITE_NAME**: Application name.
- **VITE_PRODUCT_ONE**, **VITE_PRODUCT_TWO**, **VITE_PRODUCT_THREE**: Product names used across the app.

---

## Development Guidelines

- **CSP Compliance**: Ensure all inline scripts and styles comply with Content Security Policy (CSP) guidelines.
- **Documentation**: Add comments to all new components and views.
- **Testing**: Write unit tests for critical components and features.

---
