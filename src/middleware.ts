import { NextResponse, type NextRequest } from 'next/server'

/* Lembra o idioma escolhido no seletor do menu (cookie NEXT_LOCALE, gravado ao clicar em PT, EN ou ES).
   Quem escolheu inglês e abre um link em português vai para a mesma página em /en, e assim por diante.
   Sem cookie (primeira visita, buscadores) nada muda: não há redirecionamento pelo idioma do navegador. */
const LOCALES = ['pt-BR', 'en', 'es']

export function middleware(req: NextRequest) {
  const chosen = req.cookies.get('NEXT_LOCALE')?.value
  if (!chosen || !LOCALES.includes(chosen) || chosen === req.nextUrl.locale) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.locale = chosen
  return NextResponse.redirect(url)
}

// Só as páginas públicas; com i18n no next.config, cada caminho vale também com o prefixo do idioma (/en/cases)
export const config = { matcher: ['/', '/cases', '/cases/:slug*'] }
