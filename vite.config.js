import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import nightwatchPlugin from 'vite-plugin-nightwatch';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    nightwatchPlugin({
      renderPage: './nightwatch/index.html',
    }),
  ],
  build: {
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    rollupOptions: {
      output: {
        // Prevent inline assets for CSP and enable hashed filenames for caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]', // Ensures images like hero-paybychance.png get hashed
      },
    },
  },
  server: {
    // Simulate caching in development (optional, adjust as needed)
    headers: {
      'Cache-Control': 'public, max-age=604800', // Cache assets for 1 week
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
