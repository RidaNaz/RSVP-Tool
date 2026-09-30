import { HeadContent, Scripts, createRootRoute, useParams } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { isLang } from '../data/locales'
import css from '../styles.css?url'

// <html lang/dir> follows the /{lang} segment so crawlers and screen readers get the right language.
function Shell({ children }: { children: ReactNode }) {
  const { lang } = useParams({ strict: false }) as { lang?: string }
  const l = lang && isLang(lang) ? lang : 'en'
  return <html lang={l} dir={l === 'ar' ? 'rtl' : 'ltr'}><head><HeadContent /></head><body>{children}<Scripts /></body></html>
}

export const Route = createRootRoute({
  head: () => ({
    meta: [{ charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }, { title: 'RSVP Invitation Maker' }],
    links: [{ rel: 'stylesheet', href: css }],
  }),
  shellComponent: Shell,
})
