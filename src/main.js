import { createApp } from 'vue';
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from './App.vue';
import router from './router';

import './assets/main.css'

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js");
}



const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // ✅ Enable persistence

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount("#app");



