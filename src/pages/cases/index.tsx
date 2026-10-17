import Head from 'next/head'
import { GetStaticProps } from 'next'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Briefcase, Github, Linkedin, Mail, MessageCircle, Palette, PenTool } from 'lucide-react'
import Navbar from '@/components/Navbar'
import SeoMeta from '@/components/SeoMeta'
import CmsImage from '@/components/CmsImage'
import BrandStrip from '@/components/case/BrandStrip'
import { ogImageUrl } from '@/lib/seo'
import { REVALIDATE_SECONDS, isBuildPhase } from '@/lib/revalidate'
import { introIn } from '@/lib/intro'
import { profileFor } from '@/lib/profile'
import { CASE_KINDS, caseCardFromProject, type CaseCard } from '@/lib/caseContent'
import { absoluteUrl } from '@/lib/seo'
import { asLocale, fmt, localePath, useI18n } from '@/lib/i18n'
import { localizeProject } from '@/lib/localize'

/* ─────────────────────────────────────────────
   Portfólio (/cases): quem fez, o case em destaque e a grade dos demais.
   Os dados de cada card vêm de caseContent.listing (admin → Projetos → "Card na página de cases").
   Movimento: entradas em CSS (intro-in e reveal), filtros com framer-motion (layout),
   luz de fundo na cor do case em foco e capa que vira a capa do case (View Transitions).
───────────────────────────────────────────── */

type Filter = 'todos' | 'figma' | CaseCard['kind']

interface Props {
  cards: CaseCard[]
  /** "+27" (admin → Hero), no formato do idioma ("27+" em inglês) */
  clients: string | null
  /** O case em destaque é uma demonstração (status "Demo pública" no admin) */
  featuredDemo: boolean
}

const OUTLINE_BTN =
  'inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border border-border text-foreground-muted hover:text-foreground hover:border-orange/40 transition-colors'
const CHIP = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-border text-foreground-muted'

// O nome casa com o da capa no topo da página do case: o navegador anima uma até a outra
const coverTransition = (slug: string) => ({ viewTransitionName: `capa-${slug}` }) as CSSProperties

/** Posição do cursor para o selo "Ver case" que segue o mouse sobre a capa (ver .cursor-pill em globals.css). */
function trackCursor(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
}

function StatusChip({ status }: { status: string }) {
  if (!status) return null
  return (
    <span className={CHIP}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
      {status}
    </span>
  )
}

function FigmaChip() {
  const { t } = useI18n()
  return (
    <span className={CHIP}>
      <PenTool size={11} aria-hidden="true" />
      {t.portfolio.figmaChip}
    </span>
  )
}

/** Logo e identidade visual criados pelo Estevão (brand.authored no case). */
function BrandChip() {
  const { t } = useI18n()
  return (
    <span className={CHIP}>
      <Palette size={11} aria-hidden="true" />
      {t.portfolio.brandChip}
    </span>
  )
}

function Cover({ card, sizes, priority = false, className = '' }: { card: CaseCard; sizes: string; priority?: boolean; className?: string }) {
  const { t } = useI18n()
  return (
    <div onPointerMove={trackCursor} className={`cursor-pill-area relative overflow-hidden bg-surface-raised ${className}`} style={coverTransition(card.slug)}>
      {card.cover && (
        <CmsImage
          src={card.cover}
          alt={card.coverAlt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      )}
      <span className="cursor-pill" aria-hidden="true">
        {t.portfolio.seeCase} <ArrowUpRight size={14} />
      </span>
    </div>
  )
}

function FeaturedCase({ card, demo }: { card: CaseCard; demo: boolean }) {
  const { t, lp } = useI18n()
  return (
    <article data-accent={card.accent} className="group grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-border glass-panel">
      <a href={lp(card.href)} className="lg:col-span-7 block" tabIndex={-1} aria-hidden="true">
        <Cover card={card} priority sizes="(min-width: 1280px) 750px, (min-width: 1024px) 58vw, 100vw" className="aspect-[16/10] lg:h-full" />
      </a>
      <div className="lg:col-span-5 p-7 md:p-10 flex flex-col gap-5 justify-center">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.14em]"
            // Mistura com a cor do texto: escurece no tema claro e clareia no escuro, mantendo o contraste
            style={{ color: `color-mix(in srgb, ${card.accent} 65%, var(--color-foreground))`, background: `color-mix(in srgb, ${card.accent} 14%, transparent)` }}
          >
            {t.portfolio.featured}
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-subtle">
            {card.kindLabel} · {card.year}
          </span>
        </div>
        <h3 className="text-3xl md:text-5xl font-black text-foreground leading-[1.05] tracking-tight">
          <a href={lp(card.href)} className="hover:text-orange transition-colors">{card.clientName}</a>
        </h3>
        <p className="text-foreground-muted text-base md:text-lg leading-relaxed">{card.summary}</p>
        <div className="flex flex-wrap gap-2">
          {card.role && <span className={CHIP}>{card.role}</span>}
          <StatusChip status={card.status} />
          {card.hasFigma && <FigmaChip />}
          {card.brand && <BrandChip />}
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <a href={lp(card.href)} className="btn-orange px-6 py-3 text-sm gap-2">
            {t.portfolio.seeFullCase} <ArrowRight size={15} />
          </a>
          {card.liveUrl && (
            <a href={card.liveUrl} target="_blank" rel="noopener noreferrer" className={OUTLINE_BTN}>
              {demo ? t.portfolio.openDemo : t.portfolio.seeLive} <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

function GridCase({ card, wide }: { card: CaseCard; wide: boolean }) {
  const { t, lp } = useI18n()
  return (
    <a
      href={lp(card.href)}
      data-accent={card.accent}
      className={`reveal group h-full rounded-3xl overflow-hidden border border-border glass-panel flex flex-col hover:border-orange/30 transition-colors duration-300 ${
        wide ? 'md:grid md:grid-cols-2' : ''
      }`}
    >
      <Cover card={card} sizes="(min-width: 1280px) 620px, (min-width: 768px) 50vw, 100vw" className="aspect-[16/10]" />
      <div className="p-6 md:p-8 flex flex-col gap-3 flex-1">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-subtle">
          {card.kindLabel} · {card.year}
        </span>
        <h3 className="text-2xl md:text-3xl font-black text-foreground leading-tight">{card.clientName}</h3>
        <p className="text-foreground-muted leading-relaxed">{card.summary}</p>
        <div className="mt-auto pt-3 flex items-center gap-2 flex-wrap">
          <StatusChip status={card.status} />
          {card.hasFigma && <FigmaChip />}
          {card.brand && <BrandChip />}
          <span className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
            {t.portfolio.seeCase}
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </a>
  )
}

const cardMotion = {
  layout: true,
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
} as const

export default function CasosPage({ cards, clients, featuredDemo }: Props) {
  const { t, locale, lp } = useI18n()
  const tp = t.portfolio
  const PROFILE = profileFor(locale)
  const whatsappUrl = `https://wa.me/5561995664986?text=${encodeURIComponent(tp.whatsappMessage)}`
  // Em inglês, e-mail e LinkedIn são o caminho principal; o WhatsApp fica como link discreto
  const intl = locale !== 'pt-BR'
  const [filter, setFilter] = useState<Filter>('todos')
  const pageRef = useRef<HTMLDivElement>(null)

  const featured = cards.find((c) => c.featured) || cards[0]
  const matches = (c: CaseCard) => filter === 'todos' || (filter === 'figma' ? c.hasFigma : c.kind === filter)
  const rest = cards.filter((c) => c !== featured && matches(c))
  const showFeatured = Boolean(featured && matches(featured))

  const filters = useMemo(() => {
    const list: { id: Filter; label: string; count: number }[] = [{ id: 'todos', label: tp.all, count: cards.length }]
    for (const k of CASE_KINDS) {
      const count = cards.filter((c) => c.kind === k.id).length
      if (count) list.push({ id: k.id, label: t.kinds[k.id], count })
    }
    // Só vira filtro com mais de um projeto: com um só, o selo no card já basta
    const figma = cards.filter((c) => c.hasFigma).length
    if (figma > 1) list.push({ id: 'figma', label: tp.withFigma, count: figma })
    return list
  }, [cards, t, tp])

  // Luz de fundo na cor do case que está no meio da tela
  useEffect(() => {
    const page = pageRef.current
    if (!page || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) page.style.setProperty('--ambient', (e.target as HTMLElement).dataset.accent || '#F15A24')
        }
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    page.querySelectorAll('[data-accent]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [filter])

  const metrics = [
    { value: String(cards.length), label: tp.metricProjects },
    { value: String(PROFILE.yearsInTech), label: tp.metricYears },
    ...(clients ? [{ value: clients, label: tp.metricClients }] : []),
  ]
  const description = fmt(t.meta.portfolioDescription, { name: PROFILE.name, clients: cards.map((c) => c.clientName).join(', ') })
  const title = fmt(t.meta.portfolioTitle, { name: PROFILE.name, role: PROFILE.role })
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PROFILE.name,
    jobTitle: PROFILE.role,
    description: PROFILE.bio,
    url: absoluteUrl(localePath(locale, '/cases')),
    image: `https://emsolucoesdigitais.com.br${PROFILE.photo}`,
    sameAs: [PROFILE.linkedin, PROFILE.github],
    worksFor: { '@type': 'Organization', name: 'EM Soluções Digitais', url: 'https://emsolucoesdigitais.com.br' },
  }

  return (
    <>
      <Head>
        <title>{`${title} | EM Soluções Digitais`}</title>
        <meta name="description" content={description} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      </Head>
      <SeoMeta
        title={title}
        description={description}
        image={ogImageUrl({ eyebrow: t.meta.portfolioOgEyebrow, title: `${PROFILE.name} · ${PROFILE.role}`, subtitle: PROFILE.pitch })}
      />

      <div ref={pageRef} className="ambient-root bg-surface min-h-screen relative">
        <div className="ambient-glow" aria-hidden="true" />
        <Navbar />

        {/* ══ QUEM FEZ ══ */}
        <header className="relative z-10 max-w-7xl mx-auto px-6 pt-32 md:pt-40 pb-16 md:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-end">
          <div className="lg:col-span-8">
            <p style={introIn(20, 0.6)} className="intro-in text-xs font-bold uppercase tracking-[0.28em] text-orange mb-5 inline-flex items-center gap-2">
              <span className="w-4 h-px bg-orange" />
              {tp.eyebrow}
            </p>
            <h1
              style={introIn(28, 0.7, 0.08)}
              className="intro-in text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.04] tracking-tight mb-6 text-balance"
            >
              {tp.title}<span className="text-orange-gradient">{tp.titleHighlight}</span>
            </h1>
            <p style={introIn(28, 0.7, 0.16)} className="intro-in text-foreground-muted text-lg md:text-xl leading-relaxed max-w-2xl mb-8">
              {PROFILE.bio}
            </p>
            <div style={introIn(20, 0.7, 0.24)} className="intro-in flex flex-wrap gap-3">
              <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="btn-orange px-6 py-3 text-sm gap-2">
                <Linkedin size={15} /> LinkedIn
              </a>
              <a href={`mailto:${PROFILE.email}`} className={OUTLINE_BTN}>
                <Mail size={15} /> {tp.email}
              </a>
              {/* GitHub é checagem extra para recrutadores: link discreto, sem disputar com LinkedIn e e-mail */}
              <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors">
                <Github size={15} /> GitHub
              </a>
            </div>
          </div>

          <aside style={introIn(28, 0.8, 0.2)} className="intro-in lg:col-span-4 glass-panel rounded-3xl p-6 md:p-7" aria-label={tp.aboutLabel}>
            <div className="flex items-center gap-4">
              <CmsImage
                src={PROFILE.photo}
                alt={fmt(tp.photoAlt, { name: PROFILE.name })}
                width={80}
                height={80}
                priority
                className="w-20 h-20 rounded-full object-cover object-top ring-2 ring-orange/40 ring-offset-4 ring-offset-[color:var(--color-surface)] shrink-0"
              />
              <div className="min-w-0">
                <p className="text-lg font-black text-foreground leading-tight">{PROFILE.name}</p>
                {/* Cargo sozinho na primeira linha; cada especialidade numa linha, sem barras quebrando no meio */}
                <p className="text-[13px] text-foreground-subtle mt-1 leading-snug">
                  <span className="block font-semibold text-orange mb-0.5">{PROFILE.role}</span>{' '}
                  {PROFILE.focus.split(' | ').map((parte) => (
                    <span key={parte}>
                      <span className="block">{parte}</span>{' '}
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <p className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300">
              <span className="relative flex w-2 h-2" aria-hidden="true">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              {PROFILE.availability}
            </p>
            <p className="text-xs text-foreground-subtle mt-2.5 leading-relaxed">{PROFILE.location}</p>
            <dl className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-border">
              {metrics.map((m) => (
                // column-reverse começa embaixo: justify-end alinha os números no topo, mesmo com legendas de 1 ou 2 linhas
                <div key={m.label} className="flex flex-col-reverse justify-end">
                  <dt className="text-[11px] text-foreground-subtle mt-1.5 leading-tight">{m.label}</dt>
                  <dd className="text-2xl md:text-3xl font-black text-foreground leading-none">{m.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </header>

        {/* ══ MARCAS QUE CRIEI ══ */}
        <BrandStrip cards={cards} />

        {/* ══ TRABALHOS ══ */}
        <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24" aria-labelledby="trabalhos">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8">
            <h2 id="trabalhos" className="text-2xl md:text-3xl font-black text-foreground">
              {tp.work}
            </h2>
            <div role="group" aria-label={tp.filterLabel} className="flex gap-2 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 pb-1">
              {filters.map((f) => {
                const active = filter === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(f.id)}
                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                      active ? 'bg-foreground text-surface border-transparent' : 'border-border text-foreground-muted hover:text-foreground hover:border-orange/40'
                    }`}
                  >
                    {f.label}
                    <span className={`text-xs ${active ? 'opacity-70' : 'text-foreground-subtle'}`}>{f.count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {cards.length === 0 ? (
            <p className="text-center py-20 text-foreground-muted">{tp.empty}</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence initial={false}>
                {showFeatured && (
                  <motion.li key={featured.id} {...cardMotion} className="md:col-span-2">
                    <div style={introIn(28, 0.7, 0.3)} className="intro-in">
                      <FeaturedCase card={featured} demo={featuredDemo} />
                    </div>
                  </motion.li>
                )}
                {rest.map((card, i) => {
                  // Número ímpar de cards: o último ocupa a linha inteira, com a capa ao lado do texto
                  const wide = rest.length % 2 === 1 && i === rest.length - 1
                  return (
                    <motion.li key={card.id} {...cardMotion} className={wide ? 'md:col-span-2' : ''}>
                      <GridCase card={card} wide={wide} />
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
          )}
        </section>

        {/* ══ DOIS CAMINHOS ══ */}
        <section className="relative z-10 border-t border-border-subtle">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="reveal glass-panel rounded-3xl p-8 md:p-10 flex flex-col gap-4">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center bg-orange/10 border border-orange/25 text-orange" aria-hidden="true">
                <MessageCircle size={20} />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground-subtle">{tp.companiesEyebrow}</p>
              <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight">{tp.companiesTitle}</h2>
              <p className="text-foreground-muted leading-relaxed">{tp.companiesText}</p>
              <div className="flex flex-wrap items-center gap-3 pt-2 mt-auto">
                <a href={lp('/#contact')} className="btn-orange px-6 py-3 text-sm gap-2">
                  {tp.companiesCta} <ArrowRight size={15} />
                </a>
                {intl ? (
                  <>
                    <a href={`mailto:${PROFILE.email}`} className={OUTLINE_BTN}>
                      <Mail size={15} /> {tp.companiesEmail}
                    </a>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-2 py-3 text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors">
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  </>
                ) : (
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={OUTLINE_BTN}>
                    {tp.companiesWhatsapp}
                  </a>
                )}
              </div>
            </div>
            <div className="reveal glass-panel rounded-3xl p-8 md:p-10 flex flex-col gap-4">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center bg-orange/10 border border-orange/25 text-orange" aria-hidden="true">
                <Briefcase size={20} />
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground-subtle">{tp.recruitersEyebrow}</p>
              <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight">{tp.recruitersTitle}</h2>
              <p className="text-foreground-muted leading-relaxed">{fmt(tp.recruitersText, { years: PROFILE.yearsInTech })}</p>
              <div className="flex flex-wrap gap-3 pt-2 mt-auto">
                <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className="btn-orange px-6 py-3 text-sm gap-2">
                  <Linkedin size={15} /> {tp.recruitersLinkedin}
                </a>
                <a href={`mailto:${PROFILE.email}`} className={OUTLINE_BTN}>
                  <Mail size={15} /> {tp.recruitersEmail}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

// Página estática (ISR): servida pela CDN e regerada quando um projeto é salvo no admin
export const getStaticProps: GetStaticProps<Props> = async ({ locale: rawLocale }) => {
  const locale = asLocale(rawLocale)
  try {
    const { prisma } = await import('@/lib/prisma')
    const [projects, hero] = await Promise.all([
      prisma.clientProject.findMany({
        where: { published: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.sectionHeroConfig.findUnique({ where: { id: 'singleton' }, select: { socialClients: true } }),
    ])
    // "+27 clientes" (admin → Hero) → "+27" (em inglês, "27+"); a legenda vem do dicionário
    const m = (hero?.socialClients || '').trim().match(/^([+]?)([\d.,]+)/)
    const clients = m ? (locale === 'en' ? `${m[2]}${m[1]}` : `${m[1]}${m[2]}`) : null
    const cards = projects.map((p) => caseCardFromProject(localizeProject(p, locale), locale))
    const featured = projects.find((p, i) => cards[i].featured) || projects[0]
    return {
      props: {
        cards,
        clients,
        // O status em português ("Demo pública") decide o rótulo do botão em qualquer idioma
        featuredDemo: /demo/i.test(featured?.status || ''),
      },
      revalidate: REVALIDATE_SECONDS,
    }
  } catch (e) {
    if (!isBuildPhase()) throw e
    console.error('Casos: banco indisponível no build, publicando a lista vazia', e)
    return { props: { cards: [], clients: null, featuredDemo: false }, revalidate: 10 }
  }
}
