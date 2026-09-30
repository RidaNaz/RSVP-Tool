# RSVP Invitation Maker

Design an invitation in the browser, share one link. Guests reply on WhatsApp/email and add the event to their calendar.
The invitation lives in the link (`#i=...`, never sent to a server). Optional short links are stored in Workers KV.

- Stack: TanStack Start (prerendered static output), React 19, one Cloudflare Worker (`worker/index.ts`) for `/api/s`.
- Languages: en, es, pt, ar (RTL). Occasions: `OCC` in `src/data/locales.ts`.

## Develop
```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev            # site on :5173, proxies /api to :8787
npm run worker:dev     # short-link API (needs a KV namespace, see wrangler.toml)
npm run typecheck
```

## Deploy (single Worker serves static site + API)
```bash
npx wrangler kv namespace create INVITES   # paste the id into wrangler.toml
npm run deploy                             # vite build && wrangler deploy
```
Untrusted input: everything decoded from a link goes through `src/lib/sanitize.ts`.
