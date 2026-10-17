import { useRouter } from 'next/router'
import ptBR, { type Dict } from '@/locales/pt-BR'
import en from '@/locales/en'
import es from '@/locales/es'

/* ─────────────────────────────────────────────
   Idiomas do site (i18n nativo do Next, em next.config.js).
   Português sem prefixo (/cases), inglês em /en (/en/cases) e espanhol em /es (/es/cases). O admin e as APIs ficam só em português.
   Textos da interface: src/locales/<idioma>.ts. Conteúdo do banco: coluna i18n (ver src/lib/localize.ts).
   Para incluir outro idioma, ver docs/i18n.md.
───────────────────────────────────────────── */

export const LOCALES = ['pt-BR', 'en', 'es'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'pt-BR'

/** Nome curto no seletor (texto, sem bandeira) e nome completo para leitores de tela. */
export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  'pt-BR': { short: 'PT', name: 'Português' },
  en: { short: 'EN', name: 'English' },
  es: { short: 'ES', name: 'Español' },
}

/** og:locale de cada idioma. */
export const OG_LOCALES: Record<Locale, string> = { 'pt-BR': 'pt_BR', en: 'en_US', es: 'es_ES' }

export const asLocale = (value?: string | null): Locale => (LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE)

/** Caminho interno no idioma: '/cases' → '/en/cases', '/' → '/en', '/#contact' → '/en#contact'.
    Âncoras (#), links externos e e-mail ficam como estão. */
export function localePath(locale: Locale, href: string): string {
  if (locale === DEFAULT_LOCALE || !href.startsWith('/') || href.startsWith('//')) return href
  if (href === '/' || /^\/[?#]/.test(href)) return `/${locale}${href.slice(1)}`
  return `/${locale}${href}`
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends string ? string : T[K] extends readonly unknown[] ? T[K] : DeepPartial<T[K]> }
export type PartialDict = DeepPartial<Dict>

/** Junta a tradução sobre o português: chave que faltar no idioma mostra o texto em português. */
function withFallback<T>(base: T, patch: unknown): T {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return base
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    const b = out[k]
    if (v === undefined || v === null || v === '') continue
    out[k] = b && typeof b === 'object' && !Array.isArray(b) ? withFallback(b, v) : v
  }
  return out as T
}

const DICTS: Record<Locale, Dict> = {
  'pt-BR': ptBR,
  en: withFallback(ptBR, en),
  es: withFallback(ptBR, es),
}

export const getDict = (locale?: string | null): Dict => DICTS[asLocale(locale)]

/** Troca {nome} pelos valores: fmt('Olá, {nome}', { nome: 'Ana' }). */
export const fmt = (text: string, vars: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m))

/** Idioma da página atual, o dicionário dele e o ajuste de links internos. */
export function useI18n() {
  const { locale } = useRouter()
  const lang = asLocale(locale)
  return { locale: lang, t: DICTS[lang], lp: (href: string) => localePath(lang, href) }
}
