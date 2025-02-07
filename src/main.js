import { createApp } from 'vue';
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from './App.vue';
import router from './router';

import './assets/main.css'

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


// ✅ Initialize Pinia and use the persisted state plugin
// const app = createApp(App);
// app.use(piniaPersistedState);
// app.use(createPinia()); // Register Pinia
// app.use(router);
// app.mount("#app");


// import { createApp } from "vue";
// import { createPinia } from "pinia";
// import piniaPluginPersistedstate from "pinia-plugin-persistedstate"; // ✅ Import persist plugin
// import App from "./App.vue";
// import router from "./router";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // ✅ Enable persistence

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount("#app");



