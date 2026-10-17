import type { CSSProperties } from 'react'
import { CASE_ICON_NAMES, caseIcon } from '@/lib/caseIcons'
import { findStack, stackSummary } from '@/lib/stackLibrary'
import type { CaseStudyConfig } from '@/components/case/CaseStudyLayout'
import { DEFAULT_LOCALE, fmt, getDict, type Locale } from '@/lib/i18n'

/* ─────────────────────────────────────────────
   Conteúdo da página de case gerada pelo template (/cases/[slug]).
   Fica em ClientProject.caseContent (JSON) e é editado em /admin/projects → "Página do case".
   Tudo que entra passa por normalizeCaseContent: tipos, limites de tamanho, cores válidas
   e nenhuma imagem em base64.
   Todos os cases usam o template (CM, Fino Trato e CEJB tinham página própria até out/2026).
   A tradução fica em ClientProject.i18n (ver src/lib/localize.ts e docs/i18n.md).
───────────────────────────────────────────── */

export interface CaseContentItem {
  icon: string
  title: string
  description: string
  bullets: string[]
  screen: string
  screenAlt: string
  url: string
  loginEmail: string
  loginPassword: string
}

export interface CaseContentModule {
  icon: string
  title: string
  description: string
}

export interface CaseContentFont {
  role: string
  family: string
  sample: string
  usage: string
  weight: number
  italic: boolean
}

export interface CaseContentFigma {
  fileUrl: string
  prototypeUrl: string
  preview: string
  previewAlt: string
  eyebrow: string
  title: string
  highlight: string
  text: string
  stats: { value: string; label: string }[]
}

/** Tipos de projeto usados nos filtros da página de cases. */
export const CASE_KINDS = [
  { id: 'produto', label: 'Produtos e sistemas' },
  { id: 'site', label: 'Sites e landing pages' },
] as const
export type CaseKind = (typeof CASE_KINDS)[number]['id']

/** Card do projeto na página de cases (/cases). Vale para todos os cases, inclusive os de página própria. */
export interface CaseContentListing {
  kind: CaseKind | ''
  featured: boolean
  summary: string
  cover: string
  coverAlt: string
  accent: string
}

/** "Resumo em 30 segundos" no topo da página do case (vale para todos os cases). */
export interface CaseContentFacts {
  period: string
  team: string
  numbers: { value: string; label: string }[]
}

/** Seção "Design no Figma" pronta para exibir (vale também para os cases com página própria). */
export interface CaseFigma extends CaseContentFigma {
  embedUrl: string
}

export interface CaseContent {
  theme: {
    accent: string
    accentDark: string
    gradientFrom: string
    gradientTo: string
    gradientDarkFrom: string
    gradientDarkTo: string
    buttonBg: string
    buttonFg: string
  }
  ogEyebrow: string
  notice: string
  heroPrimaryLabel: string
  heroSecondaryLabel: string
  features: { eyebrow: string; title: string; highlight: string; intro: string; note: string; items: CaseContentItem[] }
  admin: { eyebrow: string; title: string; highlight: string; intro: string; modules: CaseContentModule[] }
  stackNotes: Record<string, string>
  brand: CaseContentBrand
  figma: CaseContentFigma
  listing: CaseContentListing
  facts: CaseContentFacts
  cta: { eyebrow: string; title: string; highlight: string; text: string; whatsappText: string }
}

/** Arquivo de uma variação do logo (horizontal, vertical, símbolo, negativo…), com o fundo em que ela é usada. */
export interface CaseBrandVariant {
  label: string
  src: string
  dark: boolean
}

/** Uso real da marca (favicon, topo do site, avatar…), com a imagem quando houver. Nada de mockup inventado. */
export interface CaseBrandApplication {
  label: string
  detail: string
  src: string
}

/** Identidade visual: além de cores e fontes, o logo (fundo claro e escuro), regras de uso, voz e o guia completo.
    Com `authored` (logo e identidade criados pelo Estevão), a seção sobe para logo depois do resumo, ganha conceito,
    variações e aplicações, e o case entra na faixa "Marcas que criei" em /cases. */
export interface CaseContentBrand {
  authored: boolean
  year: string
  concept: string
  intro: string
  colors: { name: string; hex: string; usage: string }[]
  fonts: CaseContentFont[]
  logo: { src: string; darkSrc: string; alt: string }
  rules: { do: string[]; dont: string[] }
  voice: { intro: string; traits: string[]; tone: string[] }
  variants: CaseBrandVariant[]
  applications: CaseBrandApplication[]
  guidelinesUrl: string
}

/** Textos padrão do conteúdo no idioma (o resto do padrão não tem texto). */
function caseDefaults(locale: Locale) {
  const d = getDict(locale).caseDefaults
  return {
    ogEyebrow: d.ogEyebrow,
    heroPrimaryLabel: d.heroPrimaryLabel,
    heroSecondaryLabel: d.heroSecondaryLabel,
    features: { eyebrow: d.featuresEyebrow, title: d.featuresTitle, highlight: d.featuresHighlight },
    admin: { eyebrow: d.adminEyebrow, title: d.adminTitle, highlight: d.adminHighlight },
    figma: { eyebrow: d.figmaEyebrow, title: d.figmaTitle, highlight: d.figmaHighlight },
    cta: { eyebrow: d.ctaEyebrow, title: d.ctaTitle, highlight: d.ctaHighlight, text: d.ctaText, whatsappText: d.ctaWhatsappText },
  }
}

/** O admin grava o conteúdo já com os textos padrão em português. Numa página em outro idioma,
    o texto que ainda for igual ao padrão em português vira o padrão do idioma. */
function swapDefaults<T>(content: T, pt: unknown, loc: unknown): T {
  if (!pt || typeof pt !== 'object' || !loc || typeof loc !== 'object') return content
  const out = { ...(content as Record<string, unknown>) }
  for (const [k, ptValue] of Object.entries(pt as Record<string, unknown>)) {
    const locValue = (loc as Record<string, unknown>)[k]
    if (typeof ptValue === 'string') {
      if (out[k] === ptValue) out[k] = locValue
    } else if (out[k] && typeof out[k] === 'object') {
      out[k] = swapDefaults(out[k], ptValue, locValue)
    }
  }
  return out as T
}

export const DEFAULT_CASE_CONTENT: CaseContent = {
  theme: {
    accent: '#C23E00',
    accentDark: '#F7941D',
    gradientFrom: '#F15A24',
    gradientTo: '#C23E00',
    gradientDarkFrom: '#F7941D',
    gradientDarkTo: '#F15A24',
    buttonBg: '#F15A24',
    buttonFg: '#0A1128',
  },
  ogEyebrow: 'Case de sucesso',
  notice: '',
  heroPrimaryLabel: 'Ver o site no ar',
  heroSecondaryLabel: 'O que foi entregue',
  features: { eyebrow: 'O que foi entregue', title: 'O que foi', highlight: 'entregue', intro: '', note: '', items: [] },
  admin: { eyebrow: 'Painel', title: 'O painel', highlight: 'da equipe', intro: '', modules: [] },
  stackNotes: {},
  brand: {
    authored: false,
    year: '',
    concept: '',
    intro: '',
    colors: [],
    fonts: [],
    logo: { src: '', darkSrc: '', alt: '' },
    rules: { do: [], dont: [] },
    voice: { intro: '', traits: [], tone: [] },
    variants: [],
    applications: [],
    guidelinesUrl: '',
  },
  figma: {
    fileUrl: '',
    prototypeUrl: '',
    preview: '',
    previewAlt: '',
    eyebrow: 'Design no Figma',
    title: 'Do design system',
    highlight: 'ao protótipo',
    text: '',
    stats: [],
  },
  listing: { kind: '', featured: false, summary: '', cover: '', coverAlt: '', accent: '' },
  facts: { period: '', team: '', numbers: [] },
  cta: {
    eyebrow: 'Próximo passo',
    title: 'Quer um projeto assim',
    highlight: 'para a sua empresa?',
    text: 'Fale com a EM Soluções Digitais e conte o que você precisa.',
    whatsappText: 'Olá! Vi um case no site da EM e quero conversar sobre um projeto.',
  },
}

export const emptyCaseItem = (): CaseContentItem => ({
  icon: 'Zap', title: '', description: '', bullets: [], screen: '', screenAlt: '', url: '', loginEmail: '', loginPassword: '',
})
export const emptyCaseModule = (): CaseContentModule => ({ icon: 'Zap', title: '', description: '' })
export const emptyCaseFont = (): CaseContentFont => ({ role: '', family: '', sample: '', usage: '', weight: 400, italic: false })
export const emptyBrandVariant = (): CaseBrandVariant => ({ label: '', src: '', dark: false })
export const emptyBrandApplication = (): CaseBrandApplication => ({ label: '', detail: '', src: '' })

/* ── Normalização (usada pela API ao salvar e pela página ao ler) ── */
type Obj = Record<string, unknown>
const obj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {})
const arr = (v: unknown, max: number): unknown[] => (Array.isArray(v) ? v.slice(0, max) : [])
const str = (v: unknown, max: number, def = ''): string => (typeof v === 'string' ? v.trim().slice(0, max) : def)
const hex = (v: unknown, def: string): string => (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v.trim()) ? v.trim() : def)
const icon = (v: unknown): string => (typeof v === 'string' && CASE_ICON_NAMES.includes(v) ? v : 'Zap')
// Imagem precisa ser arquivo (Blob ou /public), nunca base64
const image = (v: unknown): string => {
  const s = str(v, 600)
  return /^(https:\/\/|\/(?!\/))/.test(s) ? s : ''
}
const link = (v: unknown): string => {
  const s = str(v, 300)
  return /^(https?:\/\/|\/(?!\/))/.test(s) ? s : ''
}
// Só arquivos do Figma: o link vira iframe na página
const figmaLink = (v: unknown): string => {
  const s = str(v, 400)
  return /^https:\/\/(www\.)?figma\.com\/(design|proto|file|board)\/[A-Za-z0-9]{10,}/.test(s) ? s : ''
}

/** Link do Figma → URL de incorporação (embed.figma.com). Protótipos abrem reduzidos e com a lista de fluxos. */
export function figmaEmbedUrl(url: string): string {
  if (!figmaLink(url)) return ''
  const u = new URL(url)
  u.hostname = 'embed.figma.com'
  if (u.pathname.startsWith('/proto/')) {
    u.searchParams.set('scaling', 'scale-down')
    u.searchParams.set('content-scaling', 'fixed')
    u.searchParams.set('show-proto-sidebar', '1')
  }
  u.searchParams.set('embed-host', 'emsolucoesdigitais')
  return u.toString()
}

/** Conteúdo validado. Com `locale`, os textos padrão (e os iguais ao padrão em português) ficam no idioma. */
export function normalizeCaseContent(raw: unknown, locale: Locale = DEFAULT_LOCALE): CaseContent {
  const c = normalizeRaw(raw)
  if (locale === DEFAULT_LOCALE) return c
  return swapDefaults<CaseContent>(c, caseDefaults(DEFAULT_LOCALE), caseDefaults(locale))
}

const lines = (v: unknown, max: number, len: number) => arr(v, max).map((x) => str(x, len)).filter(Boolean)

function normalizeRaw(raw: unknown): CaseContent {
  const d = DEFAULT_CASE_CONTENT
  const r = obj(raw)
  const theme = obj(r.theme)
  const features = obj(r.features)
  const admin = obj(r.admin)
  const brand = obj(r.brand)
  const cta = obj(r.cta)
  const notes = obj(r.stackNotes)
  const figma = obj(r.figma)
  const listing = obj(r.listing)
  const facts = obj(r.facts)
  const logo = obj(brand.logo)
  const rules = obj(brand.rules)
  const voice = obj(brand.voice)

  return {
    theme: {
      accent: hex(theme.accent, d.theme.accent),
      accentDark: hex(theme.accentDark, d.theme.accentDark),
      gradientFrom: hex(theme.gradientFrom, d.theme.gradientFrom),
      gradientTo: hex(theme.gradientTo, d.theme.gradientTo),
      gradientDarkFrom: hex(theme.gradientDarkFrom, d.theme.gradientDarkFrom),
      gradientDarkTo: hex(theme.gradientDarkTo, d.theme.gradientDarkTo),
      buttonBg: hex(theme.buttonBg, d.theme.buttonBg),
      buttonFg: hex(theme.buttonFg, d.theme.buttonFg),
    },
    ogEyebrow: str(r.ogEyebrow, 40) || d.ogEyebrow,
    notice: str(r.notice, 240),
    heroPrimaryLabel: str(r.heroPrimaryLabel, 40) || d.heroPrimaryLabel,
    heroSecondaryLabel: str(r.heroSecondaryLabel, 40) || d.heroSecondaryLabel,
    features: {
      eyebrow: str(features.eyebrow, 60) || d.features.eyebrow,
      title: str(features.title, 80) || d.features.title,
      highlight: str(features.highlight, 80),
      intro: str(features.intro, 300),
      note: str(features.note, 500),
      items: arr(features.items, 8).map((x) => {
        const i = obj(x)
        return {
          icon: icon(i.icon),
          title: str(i.title, 100),
          description: str(i.description, 700),
          bullets: arr(i.bullets, 8).map((b) => str(b, 160)).filter(Boolean),
          screen: image(i.screen),
          screenAlt: str(i.screenAlt, 160),
          url: link(i.url),
          loginEmail: str(i.loginEmail, 120),
          loginPassword: str(i.loginPassword, 60),
        }
      }).filter((i) => i.title),
    },
    admin: {
      eyebrow: str(admin.eyebrow, 60) || d.admin.eyebrow,
      title: str(admin.title, 80) || d.admin.title,
      highlight: str(admin.highlight, 80),
      intro: str(admin.intro, 300),
      modules: arr(admin.modules, 12).map((x) => {
        const m = obj(x)
        return { icon: icon(m.icon), title: str(m.title, 80), description: str(m.description, 300) }
      }).filter((m) => m.title),
    },
    stackNotes: Object.fromEntries(
      Object.entries(notes).slice(0, 30).map(([k, v]) => [str(k, 40), str(v, 240)]).filter(([k, v]) => k && v),
    ),
    brand: {
      authored: brand.authored === true,
      year: str(brand.year, 12),
      concept: str(brand.concept, 500),
      intro: str(brand.intro, 300),
      colors: arr(brand.colors, 8).map((x) => {
        const c = obj(x)
        return { name: str(c.name, 40), hex: hex(c.hex, ''), usage: str(c.usage, 80) }
      }).filter((c) => c.name && c.hex),
      fonts: arr(brand.fonts, 4).map((x) => {
        const f = obj(x)
        const weight = Number(f.weight)
        return {
          role: str(f.role, 40),
          family: str(f.family, 60).replace(/[^A-Za-z0-9 ]/g, ''),
          sample: str(f.sample, 60),
          usage: str(f.usage, 160),
          weight: [100, 200, 300, 400, 500, 600, 700, 800, 900].includes(weight) ? weight : 400,
          italic: f.italic === true,
        }
      }).filter((f) => f.family && f.sample),
      logo: { src: image(logo.src), darkSrc: image(logo.darkSrc), alt: str(logo.alt, 160) },
      rules: { do: lines(rules.do, 8, 160), dont: lines(rules.dont, 8, 160) },
      voice: { intro: str(voice.intro, 300), traits: lines(voice.traits, 8, 40), tone: lines(voice.tone, 8, 60) },
      variants: arr(brand.variants, 6).map((x) => {
        const v = obj(x)
        return { label: str(v.label, 40), src: image(v.src), dark: v.dark === true }
      }).filter((v) => v.label && v.src),
      applications: arr(brand.applications, 6).map((x) => {
        const a = obj(x)
        return { label: str(a.label, 60), detail: str(a.detail, 200), src: image(a.src) }
      }).filter((a) => a.label),
      guidelinesUrl: link(brand.guidelinesUrl),
    },
    figma: {
      fileUrl: figmaLink(figma.fileUrl),
      prototypeUrl: figmaLink(figma.prototypeUrl),
      preview: image(figma.preview),
      previewAlt: str(figma.previewAlt, 160),
      eyebrow: str(figma.eyebrow, 60) || d.figma.eyebrow,
      title: str(figma.title, 80) || d.figma.title,
      highlight: typeof figma.highlight === 'string' ? str(figma.highlight, 80) : d.figma.highlight,
      text: str(figma.text, 600),
      stats: arr(figma.stats, 4).map((x) => {
        const s = obj(x)
        return { value: str(s.value, 16), label: str(s.label, 40) }
      }).filter((s) => s.value && s.label),
    },
    listing: {
      kind: CASE_KINDS.some((k) => k.id === listing.kind) ? (listing.kind as CaseKind) : '',
      featured: listing.featured === true,
      summary: str(listing.summary, 120),
      cover: image(listing.cover),
      coverAlt: str(listing.coverAlt, 160),
      accent: hex(listing.accent, ''),
    },
    facts: {
      period: str(facts.period, 40),
      team: str(facts.team, 80),
      numbers: arr(facts.numbers, 4).map((x) => {
        const n = obj(x)
        return { value: str(n.value, 12), label: str(n.label, 40) }
      }).filter((n) => n.value && n.label),
    },
    cta: {
      eyebrow: str(cta.eyebrow, 60) || d.cta.eyebrow,
      title: str(cta.title, 80) || d.cta.title,
      highlight: str(cta.highlight, 80),
      text: str(cta.text, 300) || d.cta.text,
      whatsappText: str(cta.whatsappText, 300) || d.cta.whatsappText,
    },
  }
}

/** Monta a URL do Google Fonts com as famílias, pesos e itálicos usados nos espécimes. */
export function buildFontsHref(fonts: CaseContentFont[]): string {
  if (!fonts.length) return ''
  const families = fonts.map((f) => {
    const name = f.family.trim().replace(/ +/g, '+')
    return f.italic ? `family=${name}:ital,wght@1,${f.weight}` : `family=${name}:wght@${f.weight}`
  })
  return `https://fonts.googleapis.com/css2?${Array.from(new Set(families)).join('&')}&display=swap`
}

/** Seção do Figma pronta para exibir, ou null quando o case não tem arquivo nem protótipo. */
export function figmaShowcase(f: CaseContentFigma, locale: Locale = DEFAULT_LOCALE): CaseFigma | null {
  if (!f.fileUrl && !f.prototypeUrl) return null
  return { ...f, previewAlt: f.previewAlt || getDict(locale).figma.previewAlt, embedUrl: figmaEmbedUrl(f.prototypeUrl || f.fileUrl) }
}

/** Card de um projeto na página de cases, com o que faltar preenchido a partir dos outros campos. */
export interface CaseCard {
  id: string
  slug: string
  href: string
  liveUrl: string
  clientName: string
  summary: string
  kind: CaseKind
  kindLabel: string
  role: string
  year: string
  status: string
  featured: boolean
  cover: string
  coverAlt: string
  accent: string
  hasFigma: boolean
  /** Logo e identidade criados pelo Estevão: selo no card e faixa "Marcas que criei". */
  brand: CaseCardBrand | null
}

export interface CaseCardBrand {
  logo: string
  alt: string
  year: string
  colors: { name: string; hex: string }[]
}

// Sem tipo escolhido no admin: produto quando a categoria ou a descrição falam em plataforma, sistema, portal ou CRM
const guessKind = (project: any): CaseKind =>
  /produto|plataforma|sistema|portal|crm|agendamento/i.test(`${project?.category} ${project?.tagline}`) ? 'produto' : 'site'

/** Card do projeto (já no idioma da página: ver localizeProject). */
export function caseCardFromProject(project: any, locale: Locale = DEFAULT_LOCALE): CaseCard {
  const c = normalizeCaseContent(project?.caseContent, locale)
  const t = getDict(locale)
  const l = c.listing
  const kind = l.kind || guessKind(project)
  return {
    id: project.id,
    slug: project.slug,
    href: project.caseUrl || `/cases/${project.slug}`,
    liveUrl: project.liveUrl || '',
    clientName: project.clientName,
    summary: l.summary || project.tagline || '',
    kind,
    kindLabel: t.kinds[kind] || '',
    // "Senior Design Engineer (UI/UX, Front-end & Back-end)" → "Senior Design Engineer"
    role: String(project.role || '').split('(')[0].trim(),
    year: project.year || '',
    status: project.status || '',
    featured: l.featured,
    cover: l.cover || project.mockupCardUrl || '',
    coverAlt: l.coverAlt || fmt(t.caseStudy.heroAlt, { client: project.clientName }),
    accent: l.accent || c.theme.accentDark,
    hasFigma: Boolean(c.figma.fileUrl || c.figma.prototypeUrl),
    brand: c.brand.authored && c.brand.logo.src
      ? {
          logo: c.brand.logo.src,
          alt: c.brand.logo.alt || `${project.clientName} — ${t.caseStudy.logo}`,
          year: c.brand.year,
          colors: c.brand.colors.slice(0, 5).map(({ name, hex }) => ({ name, hex })),
        }
      : null,
  }
}

/** Próximo case na ordem de /cases (o último volta ao primeiro), para o link no fim da página. */
export function nextCaseCard(projects: any[], slug: string, locale: Locale = DEFAULT_LOCALE): CaseCard | null {
  if (projects.length < 2) return null
  const i = projects.findIndex((p) => p.slug === slug)
  return caseCardFromProject(projects[(i + 1) % projects.length], locale)
}

/** Dados do resumo do case, com o papel do projeto e os links que existirem. */
export function caseFactsFromProject(project: any, locale: Locale = DEFAULT_LOCALE) {
  const c = normalizeCaseContent(project?.caseContent, locale)
  const t = getDict(locale).caseFacts
  const figma = c.figma.prototypeUrl || c.figma.fileUrl
  // "Demo pública" no admin (o status em português continua no banco; o traduzido vem do i18n)
  const demo = /demo/i.test(project?.status || '')
  return {
    role: String(project?.role || ''),
    period: c.facts.period || String(project?.year || ''),
    team: c.facts.team,
    numbers: c.facts.numbers,
    links: [
      ...(project?.liveUrl ? [{ label: demo ? t.openDemo : t.seeLive, href: project.liveUrl }] : []),
      ...(figma ? [{ label: t.seeFigma, href: figma }] : []),
    ],
  }
}
export type CaseFacts = ReturnType<typeof caseFactsFromProject>

function fontStyle(f: CaseContentFont): CSSProperties {
  return { fontFamily: `'${f.family}', sans-serif`, fontWeight: f.weight, fontStyle: f.italic ? 'italic' : 'normal' }
}

/** Projeto do banco (já no idioma: ver localizeProject) → configuração pronta para o template. */
export function caseConfigFromProject(project: any, nextCase: CaseCard | null = null, locale: Locale = DEFAULT_LOCALE): CaseStudyConfig {
  const c = normalizeCaseContent(project?.caseContent, locale)
  const t = getDict(locale)
  const liveUrl: string = project?.liveUrl || ''
  const tags: string[] = (project?.stackTags || '').split(',').map((t: string) => t.trim()).filter(Boolean)

  return {
    slug: project.slug,
    clientName: project.clientName,
    tagline: project.tagline,
    description: project.description,
    role: project.role,
    status: project.status,
    category: project.category,
    challengeText: project.challengeText,
    solutionText: project.solutionText,
    impactText: project.impactText || '',
    liveUrl,
    urlLabel: liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
    heroImage: project.mockupHeroUrl || project.mockupCardUrl || '',
    heroAlt: fmt(t.caseStudy.heroAlt, { client: project.clientName }),
    ogEyebrow: c.ogEyebrow,
    notice: c.notice,
    heroPrimaryLabel: c.heroPrimaryLabel,
    heroSecondaryLabel: c.heroSecondaryLabel,
    theme: {
      accent: c.theme.accent,
      accentDark: c.theme.accentDark,
      gradient: `linear-gradient(135deg, ${c.theme.gradientFrom} 0%, ${c.theme.gradientTo} 100%)`,
      gradientDark: `linear-gradient(135deg, ${c.theme.gradientDarkFrom} 0%, ${c.theme.gradientDarkTo} 100%)`,
      buttonBg: c.theme.buttonBg,
      buttonFg: c.theme.buttonFg,
    },
    features: {
      ...c.features,
      items: c.features.items.map((i, idx) => ({
        id: `entrega-${idx}`,
        icon: caseIcon(i.icon),
        title: i.title,
        description: i.description,
        bullets: i.bullets,
        screen: i.screen,
        screenAlt: i.screenAlt || i.title,
        url: i.url,
        login: i.loginEmail && i.loginPassword ? { email: i.loginEmail, password: i.loginPassword } : null,
      })),
    },
    admin: c.admin.modules.length
      ? { ...c.admin, modules: c.admin.modules.map((m) => ({ icon: caseIcon(m.icon), title: m.title, description: m.description })) }
      : null,
    stack: tags.map((tag) => {
      const def = findStack(tag)
      return { name: tag, label: tag, value: c.stackNotes[tag] || stackSummary(def, locale) }
    }),
    highlights: (project.highlights || []).filter((h: any) => h.title),
    brand: c.brand.colors.length || c.brand.fonts.length || c.brand.logo.src || c.brand.concept
      ? {
          authored: c.brand.authored,
          year: c.brand.year,
          concept: c.brand.concept,
          variants: c.brand.variants,
          applications: c.brand.applications,
          intro: c.brand.intro,
          colors: c.brand.colors,
          fonts: c.brand.fonts.map((f) => ({ role: f.role, family: f.family, sample: f.sample, usage: f.usage, style: fontStyle(f) })),
          fontsHref: buildFontsHref(c.brand.fonts),
          logo: c.brand.logo.src ? { ...c.brand.logo, alt: c.brand.logo.alt || `${project.clientName} — ${t.caseStudy.logo}` } : null,
          rules: c.brand.rules.do.length || c.brand.rules.dont.length ? c.brand.rules : null,
          voice: c.brand.voice.traits.length || c.brand.voice.tone.length ? c.brand.voice : null,
          guidelinesUrl: c.brand.guidelinesUrl,
        }
      : null,
    figma: figmaShowcase(c.figma, locale),
    facts: caseFactsFromProject(project, locale),
    nextCase,
    cta: c.cta,
  }
}
