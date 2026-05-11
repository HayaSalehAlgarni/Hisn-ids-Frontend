import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // ثابت مع CORS الباكند؛ إذا كان المنفذ مشغولاً أوقف العملية القديمة أو غيّر المنفذ يدوياً
    strictPort: true,
    open: true,
    proxy: {
      // Same-origin /api/* in dev → Flask :5000 (avoids 404 when the browser hits Vite instead of the API)
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
})
