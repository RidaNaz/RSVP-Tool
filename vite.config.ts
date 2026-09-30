import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

// Static output: every crawlable page is prerendered at build time. The guest page (/{lang}/i) has no inbound links,
// so it is listed explicitly; it renders an empty shell and decodes the invitation from the URL on the client.
const LANGS = ['en', 'es', 'pt', 'ar']
export default defineConfig({
  server: { proxy: { '/api': 'http://localhost:8787' } },
  plugins: [
    tanstackStart({
      pages: LANGS.map((l) => ({ path: `/${l}/i` })),
      prerender: { enabled: true, crawlLinks: true },
    }),
    viteReact(),
  ],
})
