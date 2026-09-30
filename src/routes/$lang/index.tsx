import { createFileRoute } from '@tanstack/react-router'
import { Editor } from '../../components/Editor'
import { T, isLang } from '../../data/locales'

export const Route = createFileRoute('/$lang/')({
  head: ({ params }) => ({ meta: isLang(params.lang) ? [{ title: T[params.lang].brand }, { name: 'description', content: T[params.lang].sub }] : [{ title: 'RSVP' }] }),
  component: function Home() { const { lang } = Route.useParams(); return isLang(lang) ? <Editor lang={lang} /> : null },
})
