// Short-link service: stores an already-encoded invitation under a random id in Workers KV.
// Deployed as one Worker that also serves the static site (see wrangler.toml): /api/* hits this code first.
type KV = { get(k: string): Promise<string | null>; put(k: string, v: string, o?: { expirationTtl?: number }): Promise<void> }
interface Env {
  INVITES: KV
  ALLOWED_ORIGINS?: string                                             // extra origins besides the Worker's own, comma-separated
  LIMITER?: { limit(o: { key: string }): Promise<{ success: boolean }> }   // Cloudflare rate-limit binding (optional in local dev)
}

const CODE = /^[cr][A-Za-z0-9_-]{10,3500}$/          // output of src/lib/codec.ts
const ALPHA = 'abcdefghjkmnpqrstuvwxyz23456789'      // 31 chars, no look-alikes
const DAY = 86400
const MAX_BODY = 4096
const SEC = { 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex' }

function newId(): string {
  let id = ''
  while (id.length < 7) for (const b of crypto.getRandomValues(new Uint8Array(16))) if (b < 248 && id.length < 7) id += ALPHA[b % 31]   // 248 = 8*31: no modulo bias
  return id
}
const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...SEC, ...extra } })

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const u = new URL(req.url)

    if (u.pathname === '/api/s') {
      if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, { allow: 'POST' })
      // Browsers always send Origin on cross-origin and same-origin POSTs. Missing or foreign origin = rejected.
      const origin = req.headers.get('origin')
      const allowed = new Set([u.origin, ...(env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean)])
      if (!origin || !allowed.has(origin)) return json({ error: 'forbidden' }, 403)
      if (!(req.headers.get('content-type') ?? '').startsWith('application/json')) return json({ error: 'unsupported_media_type' }, 415)
      // Origin is spoofable outside browsers, so the rate limit is the real abuse control.
      if (env.LIMITER && !(await env.LIMITER.limit({ key: req.headers.get('cf-connecting-ip') ?? 'anon' })).success) return json({ error: 'rate_limited' }, 429, { 'retry-after': '60' })

      const raw = await req.text()
      if (raw.length > MAX_BODY) return json({ error: 'too_large' }, 413)
      let b: { d?: unknown; ttl?: unknown } | null = null
      try { b = JSON.parse(raw) } catch { /* handled below */ }
      if (!b || typeof b.d !== 'string' || !CODE.test(b.d)) return json({ error: 'bad_request' }, 400)

      const ttl = Math.min(400 * DAY, Math.max(7 * DAY, Math.floor(Number(b.ttl)) || 90 * DAY))   // seconds; auto-delete
      let id = newId()
      for (let i = 0; i < 3 && (await env.INVITES.get(id)); i++) id = newId()
      await env.INVITES.put(id, b.d, { expirationTtl: ttl })
      return json({ id }, 201, { 'cache-control': 'no-store' })
    }

    const m = u.pathname.match(/^\/api\/s\/([a-z0-9]{7})$/)
    if (m) {
      if (req.method !== 'GET') return json({ error: 'method_not_allowed' }, 405, { allow: 'GET' })
      const d = await env.INVITES.get(m[1])
      return d ? json({ d }, 200, { 'cache-control': 'public, max-age=300' }) : json({ error: 'not_found' }, 404, { 'cache-control': 'no-store' })
    }
    return json({ error: 'not_found' }, 404)
  },
}
