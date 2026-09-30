import { P } from '../components/Icon'
import { LI, OCC, PAL, T, isLang } from '../data/locales'
import { toUTC } from './calendar'
import type { Invite } from './types'

const W = 1080, H = 1350

/** Draws the invitation on a canvas (same look as <Card />). Browser-only. */
export async function renderCard(o: Invite): Promise<HTMLCanvasElement> {
  const lang = isLang(o.lg) ? o.lg : 'en', l = T[lang], p = PAL[o.p] ?? PAL[0], rtl = lang === 'ar'
  const title = o.t || OCC[o.o][LI[lang]]
  const f = (opt: Intl.DateTimeFormatOptions) => { try { return new Intl.DateTimeFormat(lang, { timeZone: o.tz, ...opt }).format(toUTC(o.w, o.tz)) } catch { return '' } }
  const txt = [title, o.h, o.vn, o.n, l.inv, l.by, '0123456789', f({ weekday: 'long' }), f({ month: 'long', year: 'numeric' })].join(' ')
  await Promise.all(['400 40px "Cormorant Infant"', 'italic 400 40px "Cormorant Infant"', '600 40px "Cormorant Infant"', '400 40px "Great Vibes"', '400 40px "Noto Naskh Arabic"', '600 40px "Noto Naskh Arabic"']
    .map((font) => document.fonts.load(font, txt).catch(() => [])))
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d')!
  const g = x.createLinearGradient(0, 0, W * 0.6, H); g.addColorStop(0, p[1]); g.addColorStop(1, p[2])
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  x.strokeStyle = p[4]; x.lineWidth = 3; x.globalAlpha = 0.75; x.beginPath(); x.roundRect(40, 40, W - 80, H - 80, 28); x.stroke(); x.globalAlpha = 1
  for (const [tx, ty, sx, sy] of [[64, 64, 1, 1], [W - 64, 64, -1, 1], [64, H - 64, 1, -1], [W - 64, H - 64, -1, -1]]) {
    x.save(); x.translate(tx, ty); x.scale(sx * 1.7, sy * 1.7); x.strokeStyle = p[4]; x.lineWidth = 1.4
    x.stroke(new Path2D('M2 38V14C2 7 7 2 14 2h24')); x.restore()
  }
  const left = !!o.l, ax = left ? (rtl ? W - 130 : 130) : W / 2, maxW = W - 260
  x.direction = rtl ? 'rtl' : 'ltr'; x.textAlign = left ? (rtl ? 'right' : 'left') : 'center'; x.textBaseline = 'alphabetic'
  const serif = '"Cormorant Infant", Georgia, "Noto Naskh Arabic", serif'
  const lines = (t: string, font: string) => {
    x.font = font; const out: string[] = []; let cur = ''
    for (const w of t.split(/\s+/).filter(Boolean)) { const n = cur ? cur + ' ' + w : w; if (x.measureText(n).width > maxW && cur) { out.push(cur); cur = w } else cur = n }
    if (cur) out.push(cur); return out
  }
  const run = (draw: boolean, y0: number) => {
    let y = y0
    const block = (t: string, font: string, color: string, lh: number, gapAfter = 0) => {
      if (!t) return
      for (const ln of lines(t, font)) { y += lh; if (draw) { x.font = font; x.fillStyle = color; x.fillText(ln, ax, y - lh * 0.22) } }
      y += gapAfter
    }
    y += 60
    if (draw) { x.save(); const ox = left ? (rtl ? ax - 90 : ax) : ax - 45; x.translate(ox, y - 60); x.scale(3.75, 3.75); x.strokeStyle = p[4]; x.lineWidth = 1.6; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(new Path2D(P[o.st] ?? P.heart)); x.restore() }
    y += 40
    block(l.inv, `italic 400 44px ${serif}`, p[3], 62, 10)
    block(title, rtl ? '600 96px "Noto Naskh Arabic", serif' : left ? `italic 600 104px ${serif}` : '400 140px "Great Vibes", cursive', p[3], rtl ? 130 : left ? 116 : 150, 10)
    if (o.h) block(`${l.by} ${o.h}`, `400 44px ${serif}`, p[3], 60, 10)
    block(f({ weekday: 'long' }), `400 46px ${serif}`, p[3], 62)
    block(f({ day: 'numeric' }), `600 210px ${serif}`, p[4], 200)
    block(f({ month: 'long', year: 'numeric' }), `400 50px ${serif}`, p[3], 66, 6)
    block(f({ timeStyle: 'short' }), `400 50px ${serif}`, p[3], 66, 6)
    if (o.vn) block(o.vn, `400 44px ${serif}`, p[3], 60, 8)
    if (o.n) block(o.n, `italic 400 40px ${serif}`, p[3], 56)
    return y - y0
  }
  const total = run(false, 0)
  run(true, Math.max(90, (H - total) / 2 - 20))
  return c
}

export async function downloadCard(o: Invite, type: 'png' | 'jpg') {
  const c = await renderCard(o)
  const blob = await new Promise<Blob | null>((res) => c.toBlob(res, type === 'png' ? 'image/png' : 'image/jpeg', 0.92))
  if (!blob) return
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = `invitation.${type}`
  document.body.append(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
