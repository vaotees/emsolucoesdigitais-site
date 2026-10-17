'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { featureIcon } from '@/lib/featureIcons'
import CmsImage from './CmsImage'
import TechCanvas from './TechCanvas'
import { ServiceIcon, ServiceStage, hasIcon, hasStage } from './services/ServiceVisual'
import { useI18n } from '@/lib/i18n'

/* ─────────────────────────────────────────────
   Serviços da home (admin → Serviços). Principais em grade de tamanhos variados: título, frase, uma cena
   interativa em vetor, as entregas e os cases que comprovam o serviço; complementares numa faixa menor, com ícone animado.
───────────────────────────────────────────── */

export interface CMSFeature {
  id: string
  title: string
  description: string
  icon: string
  highlight?: boolean
  group?: string
  visual?: string
  deliverables?: string
  proofCases?: string
}

export interface SectionConfig {
  tagline: string
  title1: string
  titleHighlight: string
  description: string
}

/** Case citado como prova num serviço (vem dos projetos publicados). */
export interface ServiceProof {
  slug: string
  name: string
  href: string
  cover: string
  accent: string
}

interface FeaturesGridProps {
  cmsFeatures?: CMSFeature[]
  sectionConfig?: SectionConfig | null
  cases?: Record<string, ServiceProof>
}

/** `play` fica ligado enquanto o card está na tela; `loop` (ícones complementares) no hover ou no foco do teclado. */
function useServiceMotion() {
  const ref = useRef<HTMLElement>(null)
  const [play, setPlay] = useState(false)
  const [loop, setLoop] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) return setPlay(true)
    const io = new IntersectionObserver(([e]) => setPlay(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const handlers = {
    onPointerEnter: () => setLoop(true),
    onPointerLeave: () => setLoop(false),
    onFocus: () => setLoop(true),
    onBlur: (e: React.FocusEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setLoop(false)
    },
  }
  return { ref, play, loop, handlers }
}

function Proofs({ slugs, cases }: { slugs: string[]; cases: Record<string, ServiceProof> }) {
  const { t, lp } = useI18n()
  const list = slugs.map((s) => cases[s]).filter(Boolean)
  if (!list.length) return <span />
  return (
    <div className="self-start pt-4 border-t border-border-subtle flex flex-wrap items-center gap-2">
      <span className="text-xs text-foreground-subtle mr-1">{t.services.seeIn}</span>
      {list.map((c) => (
        <a
          key={c.slug}
          href={lp(c.href)}
          className="group/proof inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border text-xs font-semibold text-foreground-muted hover:text-foreground hover:border-orange/40 transition-colors"
        >
          <span className="relative w-8 h-5 rounded-full overflow-hidden shrink-0" style={{ background: c.accent }}>
            {c.cover && <CmsImage src={c.cover} alt="" fill sizes="64px" className="object-cover" />}
          </span>
          {c.name}
          <ArrowUpRight size={12} className="transition-transform group-hover/proof:-translate-y-0.5 group-hover/proof:translate-x-0.5" />
        </a>
      ))}
    </div>
  )
}

/** Card principal, de cima para baixo: título em laranja, frase, cena interativa, entregas e cases.
    As cinco linhas são subgrid da grade: nos cards da mesma linha, títulos, cenas e cases ficam alinhados.
    O card não é link: as cenas têm interações próprias. */
function MainService({ feature, cases }: { feature: CMSFeature; cases: Record<string, ServiceProof> }) {
  const { ref, play } = useServiceMotion()
  const { t } = useI18n()
  const wide = Boolean(feature.highlight)
  const Icon = featureIcon(feature.icon)
  const deliverables = (feature.deliverables || '').split('\n').map((d) => d.trim()).filter(Boolean).slice(0, 3)
  const proofs = (feature.proofCases || '').split(',').map((s) => s.trim()).filter(Boolean)

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className={`reveal glass-panel rounded-3xl p-5 md:p-6 grid row-span-5 [grid-template-rows:subgrid] gap-y-4 hover:border-orange/30 transition-colors duration-300 ${
        wide ? 'lg:col-span-2' : ''
      }`}
    >
      <h3 className="text-[26px] md:text-[28px] font-black leading-[1.1] tracking-tight text-orange-dark dark:text-orange text-balance">
        {feature.title}
      </h3>
      <p className={`text-[15px] md:text-base text-foreground-muted leading-relaxed ${wide ? 'lg:max-w-2xl' : ''}`}>{feature.description}</p>
      {hasStage(feature.visual) ? (
        <ServiceStage visual={feature.visual!} play={play} />
      ) : (
        <span className="w-12 h-12 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange" aria-hidden="true">
          <Icon size={22} strokeWidth={1.5} />
        </span>
      )}
      {deliverables.length > 0 ? (
        <ul className="flex flex-wrap content-start gap-1.5" aria-label={t.services.deliverables}>
          {deliverables.map((d) => (
            <li key={d} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-border text-foreground-muted">
              {d}
            </li>
          ))}
        </ul>
      ) : (
        <span />
      )}
      <Proofs slugs={proofs} cases={cases} />
    </article>
  )
}

function ExtraService({ feature }: { feature: CMSFeature }) {
  const { ref, play, loop, handlers } = useServiceMotion()
  const Icon = featureIcon(feature.icon)
  return (
    <article ref={ref as React.RefObject<HTMLElement>} {...handlers} className="reveal glass-panel rounded-2xl p-5 flex items-start gap-4 hover:border-orange/30 transition-colors duration-300">
      {hasIcon(feature.visual) ? (
        <ServiceIcon visual={feature.visual!} play={play} loop={loop} />
      ) : (
        <Icon size={28} strokeWidth={1.5} className="text-orange shrink-0" aria-hidden="true" />
      )}
      <div>
        <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
        <p className="text-sm text-foreground-muted leading-relaxed mt-1">{feature.description}</p>
      </div>
    </article>
  )
}

function Header({ config }: { config: SectionConfig }): ReactNode {
  return (
    <div className="reveal text-center mb-14 max-w-3xl mx-auto">
      <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-orange mb-4">{config.tagline}</span>
      <h2 className="text-4xl md:text-5xl font-black text-foreground mb-5 leading-tight text-balance">
        {config.title1} <span className="text-orange-gradient">{config.titleHighlight}</span>
      </h2>
      {config.description && <p className="text-foreground-muted text-lg whitespace-pre-wrap">{config.description}</p>}
    </div>
  )
}

export default function FeaturesGrid({ cmsFeatures = [], sectionConfig, cases = {} }: FeaturesGridProps) {
  const { t } = useI18n()
  // Textos do admin (já no idioma da página); sem banco, os padrões do dicionário
  const config = {
    tagline: sectionConfig?.tagline || t.services.tagline,
    title1: sectionConfig?.title1 || t.services.title1,
    titleHighlight: sectionConfig?.titleHighlight || t.services.titleHighlight,
    description: sectionConfig?.description ?? t.services.description,
  }
  const main = cmsFeatures.filter((f) => f.group !== 'complementar')
  const extra = cmsFeatures.filter((f) => f.group === 'complementar')

  return (
    <section id="services" className="cv-auto py-24 relative overflow-hidden">
      <TechCanvas mode="subtle" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(249,115,22,0.04) 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Header config={config} />

        {main.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {main.map((f) => (
              <MainService key={f.id} feature={f} cases={cases} />
            ))}
          </div>
        )}

        {extra.length > 0 && (
          <>
            <p className="reveal text-xs font-bold uppercase tracking-[0.22em] text-foreground-subtle mt-12 mb-4">{t.services.extras}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {extra.map((f) => (
                <ExtraService key={f.id} feature={f} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
