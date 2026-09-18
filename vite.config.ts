import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Local demo only. LAN access can be enabled explicitly with --host.
    host: '127.0.0.1',
    // honor the port assigned by the dev-server launcher (falls back to 5173)
    port: Number(process.env.PORT) || 5173,
    proxy: {
      // Aizen backend (tiny-llm/server.py) — only used when it's running locally
      '/chat': 'http://127.0.0.1:8321',
      '/story': 'http://127.0.0.1:8321',
      '/meta': 'http://127.0.0.1:8321',
    },
  },
})
