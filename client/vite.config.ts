import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3009,
    proxy: {
      '/api': {
        target: 'http://localhost:5009',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: ['@tailwindcss/vite'],
    exclude: ['@tailwindcss/oxide', '@tailwindcss/oxide-darwin-x64', 'lightningcss']
  },
  ssr: {
    noExternal: ['@tailwindcss/oxide', '@tailwindcss/oxide-darwin-x64', 'lightningcss']
  },
  define: {
    global: 'globalThis',
    'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || 'http://localhost:5009/api')
  }
})
