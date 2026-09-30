import type { Invite } from './types'
import { LI, OCC, T, isLang, type Lang } from '../data/locales'

/** Wall-clock time in an IANA zone -> UTC Date. */
export function toUTC(local: string, tz: string): Date {
  const [d, t] = local.split('T'), [y, mo, da] = d.split('-').map(Number), [h, mi] = t.split(':').map(Number)
  const u0 = Date.UTC(y, mo - 1, da, h, mi)
  const off = (ts: number) => {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(new Date(ts)).map((x) => [x.type, x.value]))
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ts
  }
  return new Date(u0 - off(u0 - off(u0)))
}
export const fmtWhen = (o: Invite, tz: string, lang: string) => {
  try { return new Intl.DateTimeFormat(lang, { dateStyle: 'full', timeStyle: 'short', timeZone: tz }).format(toUTC(o.w, o.tz)) } catch { return o.w }
}
const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
/** Calendar event built from the form: title, time, venue, message, host, map link and reply number. */
function ev(o: Invite) {
  const s = toUTC(o.w, o.tz), lang: Lang = isLang(o.lg) ? (o.lg as Lang) : 'en', l = T[lang]
  return {
    s,
    e: new Date(s.getTime() + (o.m || 120) * 6e4),
    title: o.t || OCC[o.o]?.[LI[lang]] || l.inv,   // same fallback as the card: the occasion name
    place: o.vn || o.mp,
    url: o.mp,
    desc: [o.n, o.h && `${l.by}: ${o.h}`, o.mp, o.wa && `WhatsApp: ${o.wa}`].filter(Boolean).join(''),
  }
}
export function gcalURL(o: Invite) {
  const x = ev(o)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(x.title)}&dates=${stamp(x.s)}/${stamp(x.e)}&details=${encodeURIComponent(x.desc)}&location=${encodeURIComponent(x.place)}`
}
const hash = (s: string) => { let h = 5381; for (const c of s) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0; return h.toString(36) }
export function icsText(o: Invite) {
  const x = ev(o), f = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//RSVP Invitation Maker//EN', 'BEGIN:VEVENT', `UID:${hash(JSON.stringify(o))}@rsvp-invitation`, `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(x.s)}`, `DTEND:${stamp(x.e)}`, `SUMMARY:${f(x.title)}`, `LOCATION:${f(x.place)}`, ...(x.url ? [`URL:${x.url}`] : []), `DESCRIPTION:${f(x.desc)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
}
export function downloadICS(o: Invite) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([icsText(o)], { type: 'text/calendar;charset=utf-8' }))
  a.download = 'invitation.ics'
  document.body.append(a); a.click(); a.remove()
}