import { Fragment } from 'react'
import { useRouter } from 'next/router'
import { LOCALES, LOCALE_LABELS, localePath, useI18n, type Locale } from '@/lib/i18n'

/* Seletor de idioma em texto ("PT · EN"), sem bandeiras. Leva para a mesma página no outro idioma
   e grava a escolha no cookie NEXT_LOCALE (lido em src/middleware.ts nas próximas visitas). */

const remember = (locale: Locale) => {
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
}

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, t } = useI18n()
  // asPath não traz o prefixo do idioma; âncora e query ficam de fora para o HTML do servidor e do navegador baterem
  const path = useRouter().asPath.split(/[?#]/)[0] || '/'

  return (
    <nav aria-label={t.lang.switcher} className={`flex items-center text-xs font-bold tracking-[0.12em] ${className}`}>
      {LOCALES.map((l, i) => {
        const current = l === locale
        return (
          <Fragment key={l}>
            {i > 0 && (
              <span aria-hidden="true" className="text-foreground-subtle">
                ·
              </span>
            )}
            <a
              href={localePath(l, path)}
              hrefLang={l}
              lang={l}
              aria-current={current ? 'true' : undefined}
              onClick={() => remember(l)}
              className={`inline-flex items-center justify-center min-w-[28px] h-7 px-1 rounded-md transition-colors ${
                current ? 'text-orange-dark dark:text-orange' : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              {LOCALE_LABELS[l].short}
              <span className="sr-only">
                {' '}
                {LOCALE_LABELS[l].name}
                {current ? ` ${t.lang.current}` : ''}
              </span>
            </a>
          </Fragment>
        )
      })}
    </nav>
  )
}
