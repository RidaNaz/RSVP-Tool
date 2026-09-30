import { Link, Outlet, createFileRoute, notFound } from '@tanstack/react-router'
import { LANGS, T, isLang } from '../../data/locales'
import { S } from '../../data/short'

export const Route = createFileRoute('/$lang')({
  beforeLoad: ({ params }) => { if (!isLang(params.lang)) throw notFound() },
  component: function LangLayout() {
    const { lang } = Route.useParams()
    if (!isLang(lang)) return null
    // Switch language by swapping the first path segment; keep ?query and #hash so invitations stay intact.
    const change = (v: string) => location.assign(location.pathname.replace(/^\/[^/]+/, '/' + v) + location.search + location.hash)
    return (
      <div lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <header className="top"><Link to="/$lang" params={{ lang }} className="brand">{T[lang].brand}</Link>
          <select className="langsel" aria-label={S[lang].lang} value={lang} onChange={(e) => change(e.target.value)}>
            {LANGS.map((x) => <option key={x.code} value={x.code}>{x.label}</option>)}
          </select>
        </header>
        <Outlet />
      </div>
    )
  },
})
