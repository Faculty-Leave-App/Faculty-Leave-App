import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ✅ Recommended Vite config for fullstack (React + Node/Express) apps 
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // default is fine, must match workflow
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api': 'http://localhost:5000', // ✅ local dev proxy to your backend
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
