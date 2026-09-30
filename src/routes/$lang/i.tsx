import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Card } from '../../components/Card'
import { Icon } from '../../components/Icon'
import { T, isLang } from '../../data/locales'
import { S as X } from '../../data/short'
import { decode } from '../../lib/codec'
import { downloadICS, fmtWhen, gcalURL } from '../../lib/calendar'
import type { Invite } from '../../lib/types'

// The invitation lives in location.hash (never sent to a server), so this page renders client-side only.
export const Route = createFileRoute('/$lang/i')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  component: function Guest() {
    const { lang } = Route.useParams()
    const [o, setO] = useState<Invite | null>(null)
    const [bad, setBad] = useState(false)
    const [stage, setStage] = useState(0) // 0 sealed, 1 opening, 2 open
    const [ans, setAns] = useState<'yes' | 'no' | 'maybe'>('yes')
    const [name, setName] = useState('')
    const [n, setN] = useState(1)
    const [code, setCode] = useState('')
    useEffect(() => {
      // Full link (#i=…) carries the data; short link (?s=…) is looked up from the API.
      const m = location.hash.match(/^#i=(.+)$/), sid = new URLSearchParams(location.search).get('s')
      const load: Promise<string> = m ? Promise.resolve(m[1]) : sid && /^[a-z0-9]{7}$/.test(sid)
        ? fetch(`/api/s/${sid}`).then((r) => { if (!r.ok) throw new Error('nf'); return r.json() as Promise<{ d: string }> }).then((j) => j.d)
        : Promise.reject(new Error('none'))
      load.then((c) => { setCode(c); return decode(c) }).then(setO).catch(() => setBad(true))
    }, [])
    const g = T[isLang(o?.lg ?? '') ? (o!.lg as 'en') : isLang(lang) ? lang : 'en']
    if (bad) return <div className="guest"><div className="panel">{g.bad}</div></div>
    if (!o) return null
    const openIt = () => {
      setStage(1)
      const quick = matchMedia('(prefers-reduced-motion: reduce)').matches
      setTimeout(() => setStage(2), quick ? 0 : 750)
    }
    const send = () => {
      const msg = `${o.t || g.inv}: ${g[ans]} — ${name || '—'} (${n})`
      location.href = o.wa ? `https://wa.me/${o.wa.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}` : `mailto:${o.em}?subject=${encodeURIComponent('RSVP: ' + (o.t || g.inv))}&body=${encodeURIComponent(msg)}`
    }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (stage < 2) return (
      <div className="guest sealed"><p>{g.tap}</p>
        <button className={`env ${stage ? 'opening' : ''}`} onClick={openIt} disabled={stage > 0} aria-label={g.open}>
          <span className="flap" /><span className="seal"><Icon n="heart" size={26} /></span><span className="cta">{g.open}</span>
        </button>
      </div>)
    return (
      <div className="guest rise"><Card o={o} />
        {o.mp && <p className="center"><a href={o.mp} target="_blank" rel="noopener noreferrer"><Icon n="pin" size={16} /> {X[isLang(o.lg) ? o.lg : 'en'].mapOpen}</a></p>}
        <p className="hint center">{g.local}: {fmtWhen(o, tz, o.lg)} ({tz})</p>
        <div className="panel"><h3><Icon n="cal" /> {g.cal}</h3>
          <div className="acts"><a className="btn" href={gcalURL(o)} target="_blank" rel="noopener noreferrer">{g.gcal}</a><button className="btn alt" onClick={() => downloadICS(o)}>{g.ics}</button></div>
          <p className="hint">{g.icsHint}</p></div>
        <div className="panel"><h3>{g.rsvpQ}</h3>
          {!o.wa && !o.em ? <p className="hint">{g.noRsvp}</p> : <>
            <div className="opts">{(['yes', 'no', 'maybe'] as const).map((k) => <button key={k} className="chip txt" aria-pressed={ans === k} onClick={() => setAns(k)}>{g[k]}</button>)}</div>
            <div className="f"><label htmlFor="gn">{g.name}</label><input id="gn" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} /></div>
            <div className="f"><label htmlFor="gc">{g.gs}</label><input id="gc" type="number" min={1} max={20} value={n} onChange={(e) => setN(+e.target.value || 1)} /></div>
            <div className="acts"><button className="btn" onClick={send}><Icon n="chat" /> {g.send}</button></div></>}
        </div>
        <p className="center"><a href={`/${isLang(lang) ? lang : 'en'}#i=${code}`}>{X[isLang(lang) ? lang : 'en'].edit}</a><br /><Link to="/$lang" params={{ lang: isLang(lang) ? lang : 'en' }}>{g.mk}</Link></p>
      </div>)
  },
})
