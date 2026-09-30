import { ORN } from '../data/locales'
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

const enc = (u: Uint8Array) => btoa(String.fromCharCode(...u)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const dec = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
async function pipe(u: Uint8Array, kind: 'c' | 'd') {
  const t = kind === 'c' ? new CompressionStream('deflate-raw') : new DecompressionStream('deflate-raw')
  return new Uint8Array(await new Response(new Blob([u as BlobPart]).stream().pipeThrough(t)).arrayBuffer())
}
export async function encode(o: Invite): Promise<string> {
  const raw = new TextEncoder().encode(JSON.stringify(pack(o)))
  return typeof CompressionStream === 'undefined' ? 'r' + enc(raw) : 'c' + enc(await pipe(raw, 'c'))
}
export async function decode<T = Invite>(s: string): Promise<T> {
  const u = dec(s.slice(1))
  const j = JSON.parse(new TextDecoder().decode(s[0] === 'c' ? await pipe(u, 'd') : u))
  return (Array.isArray(j) ? unpack(j) : j) as T
}
