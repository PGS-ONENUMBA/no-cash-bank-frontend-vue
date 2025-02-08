import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import nightwatchPlugin from 'vite-plugin-nightwatch'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    nightwatchPlugin({
      renderPage: './nightwatch/index.html'
    }),
    VitePWA({ 
      registerType: 'autoUpdate',
      devOptions: {enabled: true},
      manifest: {
        "name": "No Cash Bank",
        "short_name": "NoCashBank",
        "theme_color": "white",
        "background_color": "green",
        "start_url": "./",
        "id": "1",
        "display": "standalone",
        "description": "Africa's First No-Cash Bank - Experience Banking Without Cash",
        "lang": "en",
        "categories": [
            "Finance",
            "utilities"
        ],
        "icons": [
           {
              "src": "https://cdn.glitch.me/248b0d2d-8ab9-4407-a073-136440ab3556/icon.png?v=1640879741758",
              "type": "image/png",
              "sizes": "512x512"
           },
           {
              "src": "ihttps://cdn.glitch.me/248b0d2d-8ab9-4407-a073-136440ab3556/icon.png?v=1640879741758",
              "type": "image/png",
              "sizes": "512x512",
              "purpose": "maskable"
           }
         ],
         "screenshots": [
          {
            "src": "https://placehold.co/540x720",
            "type": "image/png",
            "sizes": "540x720",
            "form_factor": "narrow"
          },
          {
            "src": "https://placehold.co/540x720",
            "type": "image/png",
            "sizes": "540x720",
            "form_factor": "narrow"
          },
          {
            "src": "https://placehold.co/540x720",
            "type": "image/png",
            "sizes": "540x720",
            "form_factor": "narrow"
          },
          {
            "src": "https://placehold.co/720x540",
            "type": "image/jpg",
            "sizes": "1024x593",
            "form_factor": "wide"
          },
          {
            "src": "https://placehold.co/720x540",
            "type": "image/jpg",
            "sizes": "1024x593",
            "form_factor": "wide"
          },
          {
            "src": "https://placehold.co/720x540",
            "type": "image/jpg",
            "sizes": "1024x593",
            "form_factor": "wide"
          },
        ]
      }
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Prevent inline assets for CSP
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
