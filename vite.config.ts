import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Explicitly set base to avoid path issues on custom servers
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure that assets are hash-busted for cache control
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
