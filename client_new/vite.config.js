import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { APP_NAME } from './src/appName.js'

function appTitle() {
  return {
    name: 'app-title',
    transformIndexHtml(html) {
      return html.replace(/<title>.*?<\/title>/, `<title>${APP_NAME}</title>`)
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    appTitle(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: APP_NAME,
        short_name: APP_NAME,
        start_url: '/',
        display: 'standalone',
        background_color: '#0f172a',
        theme_color: '#0f172a',
      },
    }),
  ],
  server: {
    port: 5173,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
