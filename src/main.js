// import { createApp } from 'vue';
// import { createPinia } from "pinia";
// import App from './App.vue';
// import router from './router';

// import './assets/main.css'

// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';


// const app = createApp(App);
// app.use(createPinia()); // Register Pinia
// app.use(router);
// app.mount("#app");

import { createApp } from "vue";
import { createPinia } from "pinia";
import { useAuthStore } from "@/stores/authStore"; // ✅ Import AFTER initializing Pinia
import router from "@/router";
import App from "@/App.vue";
// ✅ Import global styles and Bootstrap CSS
import './assets/main.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// ✅ Create the Vue app
const app = createApp(App);

// ✅ Initialize Pinia (State Management)
const pinia = createPinia();
app.use(pinia);

// ✅ Ensure `useAuthStore` is used after Pinia is initialized
app.use(router);

app.mount("#app");

// 🔄 Automatically check authentication state after Pinia is ready
app.config.globalProperties.$auth = useAuthStore();

// ✅ Ensure user session persists across page reloads
const authStore = useAuthStore();
authStore.startInactivityTimer();
