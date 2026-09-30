import { createFileRoute } from '@tanstack/react-router'
import { Editor } from '../../components/Editor'
import { T, isLang } from '../../data/locales'

export const Route = createFileRoute('/$lang/')({
  head: ({ params }) => ({ meta: [{ title: isLang(params.lang) ? T[params.lang].brand : 'RSVP' }] }),
  component: function Home() { const { lang } = Route.useParams(); return isLang(lang) ? <Editor lang={lang} /> : null },
})
