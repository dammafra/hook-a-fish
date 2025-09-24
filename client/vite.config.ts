import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import restart from 'vite-plugin-restart'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    restart({ restart: ['../public/**'] }),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,glb,mp3}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
            },
          },
        ],
      },
      manifest: {
        name: 'Hook-A-Fish!',
        short_name: 'Hook-A-Fish!',
        description:
          'Dive into Hook-A-Fish! Inspired by childhood memories, you will face a fun, fast-paced fishing challenge against the clock',
        theme_color: '#FF4500',
        background_color: '#FF4500',
        display: 'standalone',
        icons: [
          {
            src: '/favicon/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/favicon/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    open: true,
  },
  build: {
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
  },
})
