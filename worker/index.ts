// Short-link service: stores an already-encoded invitation under a random id in Workers KV.
type KV = { get(k: string): Promise<string | null>; put(k: string, v: string, o?: { expirationTtl?: number }): Promise<void> }
interface Env { INVITES: KV; ALLOWED_ORIGINS?: string }

const CODE = /^[cr][A-Za-z0-9_-]{10,3500}$/          // output of src/lib/codec.ts
const ALPHA = 'abcdefghjkmnpqrstuvwxyz23456789'      // no look-alike characters
const DAY = 86400
const newId = () => [...crypto.getRandomValues(new Uint8Array(7))].map((b) => ALPHA[b % ALPHA.length]).join('')
const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...extra } })

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const u = new URL(req.url)
    if (u.pathname === '/api/s' && req.method === 'POST') {
      const origin = req.headers.get('origin')
      if (origin && origin !== u.origin && !(env.ALLOWED_ORIGINS ?? '').split(',').includes(origin)) return json({ error: 'forbidden' }, 403)   // same-site only
      const b = (await req.json().catch(() => null)) as { d?: unknown; ttl?: unknown } | null
      if (!b || typeof b.d !== 'string' || !CODE.test(b.d)) return json({ error: 'bad_request' }, 400)
      const ttl = Math.min(400 * DAY, Math.max(7 * DAY, Math.floor(Number(b.ttl)) || 90 * DAY))  // auto-delete
      let id = newId()
      for (let i = 0; i < 3 && (await env.INVITES.get(id)); i++) id = newId()
      await env.INVITES.put(id, b.d, { expirationTtl: ttl })
      return json({ id }, 201)
    }
    const m = u.pathname.match(/^\/api\/s\/([a-z0-9]{7})$/)
    if (m && req.method === 'GET') {
      const d = await env.INVITES.get(m[1])
      return d ? json({ d }, 200, { 'cache-control': 'public, max-age=300' }) : json({ error: 'not_found' }, 404)
    }
    return json({ error: 'not_found' }, 404)
  },
}
