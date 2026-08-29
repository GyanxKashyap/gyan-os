import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // honor the port assigned by the dev-server launcher (falls back to 5173)
    port: Number(process.env.PORT) || 5173,
    proxy: {
      // Aizen backend (tiny-llm/server.py) — only used when it's running locally
      '/chat': 'http://localhost:8321',
    },
  },
})
