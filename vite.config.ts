import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // listen on all interfaces (IPv4 + IPv6) — Safari resolves localhost to ::1
    host: true,
    // honor the port assigned by the dev-server launcher (falls back to 5173)
    port: Number(process.env.PORT) || 5173,
    proxy: {
      // Aizen backend (tiny-llm/server.py) — only used when it's running locally
      '/chat': 'http://localhost:8321',
      '/story': 'http://localhost:8321',
      '/meta': 'http://localhost:8321',
    },
  },
})
