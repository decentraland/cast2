import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill for process.env if needed by dependencies
    'process.env': {},
    // For @dcl/ui-env compatibility
    global: 'globalThis'
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      // 🔥 PROXY /auth TO AUTH DAPP - SOLVES LOCALSTORAGE CROSS-ORIGIN!
      '/auth': {
        target: 'http://localhost:5174',
        changeOrigin: false,
        rewrite: path => path.replace(/^\/auth/, ''),
        configure: proxy => {
          proxy.on('error', err => {
            console.log('Proxy error:', err)
          })
        }
      }
    }
  },
  build: {
    target: 'esnext',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['@dcl/protocol']
  }
})
