// src/service-worker.js
import { precacheAndRoute } from "workbox-precaching";
precacheAndRoute([{ url: "/assets/hero-paybychance.png", revision: "1" }]);
