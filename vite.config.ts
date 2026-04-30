/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const apiHost = process.env.MIRROR_NEURON_API_HOST || 'localhost'
const apiPort = process.env.MIRROR_NEURON_API_PORT || '4001'
const webUiHost = process.env.MIRROR_NEURON_WEB_UI_HOST || 'localhost'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ['VITE_', 'MIRROR_NEURON_'],
  server: {
    host: webUiHost,
    proxy: {
      '/api': {
        target: `http://${apiHost}:${apiPort}`,
        changeOrigin: true,
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  }
} as any)
