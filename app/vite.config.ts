import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Feed Order Tracker for Mane Characters.
// The production deliverable is a Capacitor Android APK that bundles all
// assets and runs offline natively, so a service worker is NOT needed and was
// actively harmful: its cache shadowed app updates inside the WebView. We ship
// a self-destroying service worker so any previously-installed SW unregisters
// itself and clears its caches. (See also the unregister guard in main.tsx.)
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      selfDestroying: true,
      registerType: 'autoUpdate',
      manifest: {
        name: 'Feed Order Tracker',
        short_name: 'Feed Order',
        description: 'Weekly McCauley’s feed order tracker for Mane Characters Equine Reserve & Retirement.',
        theme_color: '#2C1A3E',
        background_color: '#2C1A3E',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
