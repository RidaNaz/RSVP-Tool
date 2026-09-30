import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

// Static output: every crawlable page is prerendered at build time. $0 hosting.
export default defineConfig({
  server: { proxy: { '/api': 'http://localhost:8787' } },
  plugins: [tanstackStart({ prerender: { enabled: true, crawlLinks: true } }), viteReact()],
})
