import { LANGS, ORN, OCC, PAL, isLang } from '../data/locales'
import type { Invite } from './types'

/** Everything decoded from a link or short-link response is untrusted input. This is the single gate. */
export const LIMITS = { t: 60, h: 25, vn: 60, n: 300, mp: 300 } as const

// C0/C1 controls, line/paragraph separators and bidi override/isolate characters (used for text spoofing).
const CTRL = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u2028\u2029\u202A-\u202E\u2066-\u2069]/g
const CTRL_ML = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F\u2028\u2029\u202A-\u202E\u2066-\u2069]/g   // keeps \n
const text = (v: unknown, max: number, multiline = false) =>
  (typeof v === 'string' ? v : '').replace(multiline ? CTRL_ML : CTRL, '').replace(multiline ? /\r\n?/g : /\s+/g, multiline ? '\n' : ' ').trim().slice(0, max)
const int = (v: unknown, lo: number, hi: number, dflt: number) => {
  const n = Math.trunc(Number(v))
  return Number.isFinite(n) && n >= lo && n <= hi ? n : dflt
}

export const PHONE = /^\+[1-9]\d{7,14}$/
export const EMAIL = /^[^\s@<>,;:"'()\\]{1,64}@[^\s@<>,;:"'()\\]{1,190}\.[^\s@<>,;:"'()\\]{2,24}$/
export const WHEN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

export const isTimeZone = (tz: string) => { try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true } catch { return false } }
export const safeUrl = (v: unknown): string => {
  if (typeof v !== 'string' || v.length > LIMITS.mp || /[\s\u0000-\u001F]/.test(v)) return ''
  try { const u = new URL(v); return u.protocol === 'https:' || u.protocol === 'http:' ? u.href : '' } catch { return '' }
}

/** Returns a fully validated Invite. Throws if the essential fields (date, time zone) are unusable. */
export function sanitize(x: unknown): Invite {
  if (!x || typeof x !== 'object') throw new Error('invalid')
  const r = x as Record<string, unknown>
  const w = typeof r.w === 'string' ? r.w : ''
  const tz = typeof r.tz === 'string' ? r.tz : ''
  if (!WHEN.test(w) || Number.isNaN(Date.parse(w + ':00Z')) || !isTimeZone(tz)) throw new Error('invalid')
  const wa = typeof r.wa === 'string' ? r.wa.replace(/[\s()-]/g, '') : ''
  const em = text(r.em, 120)
  return {
    v: 1,
    o: int(r.o, 0, OCC.length - 1, 0),
    t: text(r.t, LIMITS.t), h: text(r.h, LIMITS.h), w, tz,
    m: int(r.m, 15, 1440, 120),
    vn: text(r.vn, LIMITS.vn), mp: safeUrl(r.mp), n: text(r.n, LIMITS.n, true),
    wa: PHONE.test(wa) ? wa : '', em: EMAIL.test(em) ? em : '',
    p: int(r.p, 0, PAL.length - 1, 0), l: int(r.l, 0, 1, 0) as 0 | 1,
    st: typeof r.st === 'string' && ORN.includes(r.st) ? r.st : 'heart',
    lg: typeof r.lg === 'string' && isLang(r.lg) ? r.lg : LANGS[0].code,
  }
}
