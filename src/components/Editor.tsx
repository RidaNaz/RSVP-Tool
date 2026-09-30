import { useEffect, useState, type ReactNode } from 'react'
import { Card } from './Card'
import { Icon, ORNAMENTS } from './Icon'
import { LI, OCC, PAL, T, type Lang } from '../data/locales'
import { S as X } from '../data/short'
import { decode, encode } from '../lib/codec'
import { toUTC } from '../lib/calendar'
import { downloadCard } from '../lib/export'
import { EMAIL, PHONE } from '../lib/sanitize'
import type { Invite } from '../lib/types'

const init = (lg: string): Invite => ({ v: 1, o: 0, t: '', h: '', w: '2027-06-12T18:00', tz: 'UTC', m: 120, vn: '', mp: '', n: '', wa: '', em: '', p: 0, l: 0, st: 'heart', lg })
const cleanPhone = (v: string) => { const t = v.replace(/[^\d+]/g, ''); return (t.startsWith('+') ? '+' : '') + t.replace(/\+/g, '') }

export function Editor({ lang }: { lang: Lang }) {
  const l = T[lang], x = X[lang]
  const [s, setS] = useState<Invite>(() => init(lang))
  const [zones, setZones] = useState<string[]>(['UTC'])
  const [code, setCode] = useState('')
  const [toast, setToast] = useState('')
  const [short, setShort] = useState('')
  const [busy, setBusy] = useState(false)
  const o: Invite = { ...s, lg: lang, wa: cleanPhone(s.wa), em: s.em.trim() }
  const set = <K extends keyof Invite>(k: K, v: Invite[K]) => setS((p) => ({ ...p, [k]: v }))

  let when = NaN
  try { when = toUTC(o.w, o.tz).getTime() } catch { /* invalid date */ }
  const err = {
    w: !o.w || Number.isNaN(when) ? x.dateReq : when < Date.now() ? x.past : '',
    m: o.m < 15 || o.m > 1440 ? x.durBad : '',
    wa: o.wa && !PHONE.test(o.wa) ? x.waBad : '',
    mp: o.mp && !/^https?:\/\/\S+$/i.test(o.mp) ? x.mapBad : '',
    em: o.em && !EMAIL.test(o.em) ? x.emBad : '',
  }
  const invalid = Object.values(err).some(Boolean)

  // Browser-only defaults after hydration; also opens an existing #i= link for editing.
  useEffect(() => {
    const d = new Date(Date.now() + 7 * 864e5), z = (n: number) => String(n).padStart(2, '0')
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setS((p) => ({ ...p, tz, w: `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}T18:00` }))
    setZones(typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [tz])
    const m = location.hash.match(/^#i=(.+)$/)
    if (m) decode(m[1]).then((v) => setS({ ...init(lang), ...v })).catch(() => {})
  }, [])
  useEffect(() => { let live = true; encode(o).then((c) => { if (live) { setCode(c); setShort('') } }); return () => { live = false } }, [JSON.stringify(o)])

  const url = () => `${location.origin}/${lang}/i#i=${code}`
  const say = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2000) }
  // One short link per exact invitation: reused until a field changes, so repeated clicks don't use up storage writes.
  // If the short-link service is unreachable, falls back to the full link so sharing never breaks.
  const getLink = async (): Promise<string> => {
    if (short) return short
    if (!code) return url()
    setBusy(true)
    try {
      const ttl = Math.round(Math.min(400 * 864e5, Math.max(7 * 864e5, when + 30 * 864e5 - Date.now())) / 1000)
      const r = await fetch('/api/s', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ d: code, ttl }) })
      if (!r.ok) throw new Error(String(r.status))
      const { id } = (await r.json()) as { id: string }
      const u = `${location.origin}/${lang}/i?s=${id}`
      setShort(u)
      return u
    } catch { say(x.fail); return url() } finally { setBusy(false) }
  }
  const copy = async () => {
    const link = getLink()   // started inside the click so Safari still allows the clipboard write
    try {
      if (typeof ClipboardItem !== 'undefined') await navigator.clipboard.write([new ClipboardItem({ 'text/plain': link.then((u) => new Blob([u], { type: 'text/plain' })) })])
      else await navigator.clipboard.writeText(await link)
      say(l.copied)
    } catch { window.prompt('', await link) }
  }
  const whatsapp = async () => {
    const w = window.open('', '_blank')   // opened immediately so popup blockers allow it
    const target = `https://wa.me/?text=${encodeURIComponent(await getLink())}`
    if (w) { w.opener = null; w.location.href = target } else location.href = target
  }
  const F = (id: string, label: string, el: ReactNode, e = '', count = '') => (
    <div className="f"><label htmlFor={id}>{label}{count && <span className="cnt">{count}</span>}</label>{el}{e && <p className="err" id={`${id}-e`} role="alert">{e}</p>}</div>
  )
  const a11y = (id: string, e: string) => ({ 'aria-invalid': !!e, 'aria-describedby': e ? `${id}-e` : undefined })

  return (
    <>
      <section className="hero"><h1>{l.hero}</h1><p>{l.sub}</p></section>
      <main className="grid">
        <div className="panel">
          {F('o', l.occ, <select id="o" value={s.o} onChange={(e) => set('o', +e.target.value)}>{OCC.map((v, i) => <option key={i} value={i}>{v[LI[lang]]}</option>)}</select>)}
          {F('t', l.title, <input id="t" value={s.t} maxLength={60} placeholder={OCC[s.o][LI[lang]]} onChange={(e) => set('t', e.target.value)} />, '', `${s.t.length}/60`)}
          {F('h', l.host, <input id="h" value={s.h} maxLength={25} onChange={(e) => set('h', e.target.value)} />, '', `${s.h.length}/25`)}
          <div className="two">
            {F('w', l.when, <input id="w" type="datetime-local" required value={s.w} onChange={(e) => set('w', e.target.value)} {...a11y('w', err.w)} />, err.w)}
            {F('m', l.dur, <input id="m" type="number" min={15} max={1440} step={15} value={s.m || ''} onChange={(e) => set('m', +e.target.value)} {...a11y('m', err.m)} />, err.m)}
          </div>
          {F('tz', l.tz, <select id="tz" value={s.tz} onChange={(e) => set('tz', e.target.value)}>{zones.map((z) => <option key={z}>{z}</option>)}</select>)}
          {F('vn', l.venue, <input id="vn" value={s.vn} maxLength={60} onChange={(e) => set('vn', e.target.value)} />, '', `${s.vn.length}/60`)}
          {F('mp', l.map, <input id="mp" type="url" inputMode="url" maxLength={300} value={s.mp} onChange={(e) => set('mp', e.target.value.trim())} {...a11y('mp', err.mp)} />, err.mp)}
          {F('n', l.note, <textarea id="n" value={s.n} maxLength={300} onChange={(e) => set('n', e.target.value)} />, '', `${s.n.length}/300`)}
          {F('wa', l.wa, <input id="wa" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="+923001234567" value={s.wa} onChange={(e) => set('wa', e.target.value.replace(/[^\d+\s()-]/g, ''))} {...a11y('wa', err.wa)} />, err.wa)}
          {F('em', l.em, <input id="em" type="email" inputMode="email" autoComplete="email" maxLength={120} value={s.em} onChange={(e) => set('em', e.target.value)} {...a11y('em', err.em)} />, err.em)}
          <p className="hint">{l.priv}</p>
          <div className="f"><span className="lbl">{l.pal}</span><div className="opts">{PAL.map((p, i) => <button key={i} className="sw" aria-label={p[0]} aria-pressed={s.p === i} onClick={() => set('p', i)} style={{ background: `linear-gradient(135deg,${p[1]},${p[2]})` }} />)}</div></div>
          <div className="f"><span className="lbl">{l.stk}</span><div className="opts">{ORNAMENTS.map((n) => <button key={n} className="chip" aria-label={n} aria-pressed={s.st === n} onClick={() => set('st', n)}><Icon n={n} /></button>)}</div></div>
          <div className="f"><span className="lbl">{l.lay}</span><div className="opts">{[l.cls, l.bld].map((v, i) => <button key={i} className="chip txt" aria-pressed={s.l === i} onClick={() => set('l', i as 0 | 1)}>{v}</button>)}</div></div>
        </div>
        <aside className="stage">
          <Card o={o} />
          {invalid && <p className="err" role="alert">{x.fix}</p>}
          <div className="acts">
            <button className="btn" disabled={invalid || busy} onClick={copy}><Icon n="copy" /> {l.share}</button>
            <button className="btn alt" disabled={invalid || busy} onClick={whatsapp}><Icon n="chat" /> {l.wsh}</button>
          </div>
          <div className="acts">
            <button className="btn alt" disabled={invalid} onClick={() => downloadCard(o, 'png')}><Icon n="down" /> {x.png}</button>
            <button className="btn alt" disabled={invalid} onClick={() => downloadCard(o, 'jpg')}><Icon n="down" /> {x.jpg}</button>
          </div>
          {short && <div className="f" style={{ marginTop: 12 }}><label htmlFor="sl">{x.done}</label><input id="sl" readOnly value={short} onFocus={(e) => e.currentTarget.select()} /></div>}
          <p className="hint">{x.note}</p>
          <p className="hint" aria-live="polite">{l.len}: {code.length + 40}{code.length + 40 > 1500 ? ` — ${l.long}` : ''}</p>
        </aside>
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  )
}