import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // ثابت مع CORS الباكند؛ إذا كان المنفذ مشغولاً أوقف العملية القديمة أو غيّر المنفذ يدوياً
    strictPort: true,
    open: true,
  },
})
