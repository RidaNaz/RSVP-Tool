import { ORN } from '../data/locales'
import { sanitize } from './sanitize'
import type { Invite } from './types'

// Compact wire format: positional array with defaults dropped, then deflate-raw + base64url. Browser-only.
const LG = ['en', 'es', 'pt', 'ar']
type A = (string | number)[]
export const pack = (o: Invite): A => {
  const a: A = [1, o.o, o.t, o.h, o.w, o.tz, o.m === 120 ? 0 : o.m, o.vn, o.mp, o.n, o.wa, o.em, o.p, o.l, Math.max(0, ORN.indexOf(o.st)), Math.max(0, LG.indexOf(o.lg))]
  while (a.length > 6 && !a[a.length - 1]) a.pop()
  return a
}
export const unpack = (a: A): Invite => ({ v: 1, o: +a[1] || 0, t: String(a[2] ?? ''), h: String(a[3] ?? ''), w: String(a[4] ?? ''), tz: String(a[5] ?? 'UTC'), m: +a[6] || 120,
  vn: String(a[7] ?? ''), mp: String(a[8] ?? ''), n: String(a[9] ?? ''), wa: String(a[10] ?? ''), em: String(a[11] ?? ''), p: +a[12] || 0, l: (+a[13] || 0) as 0 | 1, st: ORN[+a[14] || 0] ?? 'heart', lg: LG[+a[15] || 0] ?? 'en' })

const enc = (u: Uint8Array) => btoa(Array.from(u, (b) => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const dec = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
const MAX_CODE = 4000, MAX_RAW = 16384   // input length and decompressed size caps (guards against zip bombs)
async function deflate(u: Uint8Array) {
  const s = new Blob([u as BlobPart]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  return new Uint8Array(await new Response(s).arrayBuffer())
}
async function inflate(u: Uint8Array) {
  const r = new Blob([u as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader()
  const parts: Uint8Array[] = []; let n = 0
  for (;;) {
    const { done, value } = await r.read()
    if (done) break
    n += value.length
    if (n > MAX_RAW) { await r.cancel(); throw new Error('too large') }
    parts.push(value)
  }
  const out = new Uint8Array(n); let at = 0
  for (const p of parts) { out.set(p, at); at += p.length }
  return out
}
export async function encode(o: Invite): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(pack(o)))
  return typeof CompressionStream === 'undefined' ? 'r' + enc(raw) : 'c' + enc(await deflate(raw))
}
/** Decodes and validates. Rejects (throws) on anything malformed, oversized or unsafe. */
export async function decode(s: string): Promise<Invite> {
  if (s.length < 2 || s.length > MAX_CODE || !/^[cr][A-Za-z0-9_-]+$/.test(s)) throw new Error('bad code')
  const u = dec(s.slice(1))
  const raw = s[0] === 'c' ? await inflate(u) : u
  if (raw.length > MAX_RAW) throw new Error('too large')
  const j = JSON.parse(new TextDecoder().decode(raw))
  return sanitize(Array.isArray(j) ? unpack(j) : j)
}
