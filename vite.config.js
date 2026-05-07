import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget =
    env.VITE_API_BASE_URL || env.VITE_API_URL || 'http://127.0.0.1:5000'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      // ثابت مع CORS الباكند؛ إذا كان المنفذ مشغولاً أوقف العملية القديمة أو غيّر المنفذ يدوياً
      strictPort: true,
      open: true,
      proxy: {
        // All /api/* (including /api/analytics/*) → Flask :5000 — analytics implemented there too.
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
