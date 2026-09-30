import { useRef, type CSSProperties, type PointerEvent } from 'react'
import { Icon } from './Icon'
import { LI, OCC, PAL, T, isLang } from '../data/locales'
import { toUTC } from '../lib/calendar'
import type { Invite } from '../lib/types'

const Corner = ({ k }: { k: string }) => (
  <svg className={`cn ${k}`} viewBox="0 0 40 40" aria-hidden="true"><path d="M2 38V14C2 7 7 2 14 2h24" fill="none" stroke="currentColor" strokeWidth="1.4" /><circle cx="14" cy="14" r="2.4" fill="currentColor" /></svg>
)

/** The invitation. Same component powers the editor preview and the guest page. */
export function Card({ o }: { o: Invite }) {
  const ref = useRef<HTMLDivElement>(null)
  const p = PAL[o.p] ?? PAL[0], lang = isLang(o.lg) ? o.lg : 'en', l = T[lang]
  const fmt = (x: Intl.DateTimeFormatOptions) => { try { return new Intl.DateTimeFormat(lang, { timeZone: o.tz, ...x }).format(toUTC(o.w, o.tz)) } catch { return '' } }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, s = ref.current!.style
    s.setProperty('--rx', `${(0.5 - y) * 9}deg`); s.setProperty('--ry', `${(x - 0.5) * 11}deg`); s.setProperty('--mx', `${x * 100}%`); s.setProperty('--my', `${y * 100}%`)
  }
  const reset = () => { const s = ref.current!.style; s.setProperty('--rx', '0deg'); s.setProperty('--ry', '0deg') }
  const vars = { '--from': p[1], '--to': p[2], '--ink': p[3], '--gold': p[4] } as CSSProperties
  return (
    <div className="tilt" ref={ref} onPointerMove={move} onPointerLeave={reset}>
      <article className={`face ${o.l ? 'modern' : ''}`} style={vars} dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang}>
        <Corner k="tl" /><Corner k="tr" /><Corner k="bl" /><Corner k="br" />
        <span className="orn"><Icon n={o.st} size={30} /></span>
        <p className="inv">{l.inv}</p>
        <h2 className="ttl">{o.t || OCC[o.o][LI[lang]]}</h2>
        {o.h && <p className="by">{l.by} {o.h}</p>}
        <div className="date"><span>{fmt({ weekday: 'long' })}</span><b>{fmt({ day: 'numeric' })}</b><span>{fmt({ month: 'long', year: 'numeric' })}</span></div>
        <p className="time">{fmt({ timeStyle: 'short' })}</p>
        {o.vn && <p className="pl"><Icon n="pin" size={16} /> {o.vn}</p>}
        {o.n && <p className="msg">{o.n}</p>}
        <i className="shine" />
      </article>
    </div>
  )
}
