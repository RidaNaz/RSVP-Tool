import { createFileRoute, Link } from '@tanstack/react-router'
import { LANGS } from '../data/locales'

// Plain links so the prerenderer crawls every language home.
export const Route = createFileRoute('/')({
  component: () => (
    <main className="hero"><h1>RSVP Invitation Maker</h1>
      <div className="acts" style={{ justifyContent: 'center' }}>{LANGS.map((l) => <Link key={l.code} className="btn alt" to="/$lang" params={{ lang: l.code }}>{l.label}</Link>)}</div>
    </main>
  ),
})
