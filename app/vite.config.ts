import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Feed Order Tracker — offline-first PWA for Mane Characters.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'fonts/*.ttf'],
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
      workbox: {
        globPatterns: ['**/*.{js,css,html,ttf,png,svg,woff,woff2}'],
      },
    }),
  ],
})
