import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig(({ command, mode }) => {
  // Load env variables from .env file
  const envVariables = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      // Polyfill for process.env if needed by dependencies
      'process.env': {},
      // For @dcl/ui-env compatibility
      global: 'globalThis'
    },
    server: {
      open: true,
      proxy: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '/auth': {
          target: 'https://decentraland.zone',
          followRedirects: true,
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    },
    optimizeDeps: {
      include: ['@dcl/protocol']
    },
    ...(command === 'build'
      ? {
          base: envVariables.VITE_BASE_URL,
          build: {
            target: 'esnext',
            sourcemap: true
          }
        }
      : undefined)
  }
})
