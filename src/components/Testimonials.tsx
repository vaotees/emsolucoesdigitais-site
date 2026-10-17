import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Pause, Play } from 'lucide-react'
import CmsImage from './CmsImage'
import TechCanvas from './TechCanvas'
import type { ServiceProof } from './FeaturesGrid'
import { useI18n } from '@/lib/i18n'
import s from './Testimonials.module.css'

/* Depoimentos: um cliente por vez, com abas, a frase em destaque, o texto completo sob demanda,
   o que foi entregue e a capa do case ao lado. Troca sozinha a cada 7 s (ver Testimonials.module.css),
   por clique, pelas setas do teclado e deslizando o dedo no celular. */


export interface CMSTestimonial {
  id: string
  authorName: string
  authorRole: string
  content: string
  rating: number
  avatarUrl?: string | null
  highlight?: string
  caseSlug?: string
  deliverables?: string
  /** Texto traduzido do português nesta página (aparece a nota "Translated from Portuguese") */
  translated?: boolean
}

export interface SectionTestimonialsConfig {
  tagline: string
  title1: string
  titleHighlight: string
  description: string
}

interface TestimonialsProps {
  cmsTestimonials?: CMSTestimonial[]
  sectionConfig?: SectionTestimonialsConfig | null
  cases?: Record<string, ServiceProof>
}

const AUTOPLAY_SECONDS = 7
const BRAND = '#F15A24'

// Sem frase escolhida no admin, a primeira frase do depoimento vira o destaque
const highlightOf = (t: CMSTestimonial) => t.highlight?.trim() || t.content.match(/^.*?[.!?](\s|$)/)?.[0].trim() || t.content
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

function Avatar({ t, size, className }: { t: CMSTestimonial; size: number; className: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className={`${className} grid place-items-center text-[11px] font-bold text-slate-900`}>
      {t.avatarUrl && !failed ? (
        <CmsImage src={t.avatarUrl} alt="" width={size} height={size} className="w-full h-full object-contain" onError={() => setFailed(true)} />
      ) : (
        initials(t.authorName)
      )}
    </span>
  )
}

/** Aspas desenhadas a traço (a animação está no CSS). */
const QuoteMark = () => (
  <svg viewBox="0 0 24 24" className={s.quote} aria-hidden="true">
    <path pathLength={1} d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    <path pathLength={1} d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
  </svg>
)

/** A capa inclina levemente acompanhando o mouse. */
function tilt(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--tx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
  e.currentTarget.style.setProperty('--ty', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
}
function untilt(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--tx', '0')
  e.currentTarget.style.setProperty('--ty', '0')
}

export default function Testimonials({ cmsTestimonials = [], sectionConfig, cases = {} }: TestimonialsProps) {
  const { t: tr, locale, lp } = useI18n()
  const items = cmsTestimonials.filter((t) => t.content?.trim())
  const [active, setActive] = useState(0)
  const [trocou, setTrocou] = useState(false)
  const [pausado, setPausado] = useState(false)
  const [aberto, setAberto] = useState(false)
  const [visivel, setVisivel] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const swipe = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisivel(entry.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const go = useCallback(
    (target: number, focus = false) => {
      const n = items.length
      if (n < 2) return
      const next = (target + n) % n
      setActive(next)
      setTrocou(true)
      setAberto(false)
      const tab = tabRefs.current[next]
      if (focus) tab?.focus()
      // Leva a aba ativa para dentro da faixa no celular sem rolar a página
      const strip = tabsRef.current
      if (tab && strip && strip.scrollWidth > strip.clientWidth) {
        strip.scrollTo({ left: tab.offsetLeft - strip.offsetLeft - 8, behavior: 'smooth' })
      }
    },
    [items.length],
  )

  if (items.length === 0) return null

  // Textos do admin (já no idioma da página); sem banco, os padrões do dicionário
  const config = {
    tagline: sectionConfig?.tagline || tr.testimonials.tagline,
    title1: sectionConfig?.title1 || tr.testimonials.title1,
    titleHighlight: sectionConfig?.titleHighlight || tr.testimonials.titleHighlight,
    description: sectionConfig?.description || tr.testimonials.description,
  }

  const t = items[Math.min(active, items.length - 1)]
  // Depoimento ainda sem tradução numa página em outro idioma: o leitor de tela lê em português
  const originalLang = locale !== 'pt-BR' && !t.translated ? 'pt-BR' : undefined
  const caso = t.caseSlug ? cases[t.caseSlug] : undefined
  const words = highlightOf(t).split(/\s+/)
  const deliverables = (t.deliverables || '')
    .split('\n')
    .map((d) => d.trim())
    .filter(Boolean)
  const longo = t.content.length > 200
  const multi = items.length > 1
  const tabLabel = (x: CMSTestimonial) => (x.caseSlug && cases[x.caseSlug]?.name) || x.authorName

  const onTabsKey = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: items.length - 1 }
    if (!(e.key in keys)) return
    e.preventDefault()
    go(keys[e.key], true)
  }

  return (
    <section id="testimonials" className="cv-auto py-24 relative overflow-hidden">
      <TechCanvas mode="subtle" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 30% 60%, rgba(79,70,229,0.06) 0%, transparent 60%)' }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="reveal text-center mb-12 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-orange mb-4">{config.tagline}</span>
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-5 leading-tight text-balance">
            {config.title1} <span className="text-orange-gradient">{config.titleHighlight}</span>
          </h2>
          <p className="text-foreground-muted text-lg max-w-xl mx-auto whitespace-pre-wrap">{config.description}</p>
        </div>

        <div
          ref={rootRef}
          className={`reveal ${s.root}`}
          data-play={visivel ? '1' : '0'}
          data-pausado={pausado || aberto ? '' : undefined}
          data-trocou={trocou ? '' : undefined}
          style={{ '--acc': caso?.accent || BRAND, '--autoplay': `${AUTOPLAY_SECONDS}s` } as CSSProperties}
        >
          {multi && (
            <div className="flex items-center gap-3 mb-4">
              <div ref={tabsRef} role="tablist" aria-label={tr.testimonials.clients} className={`${s.tabs} flex-1 min-w-0`} onKeyDown={onTabsKey}>
                {items.map((x, i) => (
                  <button
                    key={x.id}
                    ref={(el) => {
                      tabRefs.current[i] = el
                    }}
                    type="button"
                    role="tab"
                    id={`depo-tab-${i}`}
                    aria-selected={i === active}
                    aria-controls="depo-painel"
                    tabIndex={i === active ? 0 : -1}
                    onClick={() => i !== active && go(i)}
                    aria-label={tabLabel(x)}
                    className={s.tab}
                  >
                    <Avatar t={x} size={28} className={s.tabAvatar} />
                    <span className={s.tabLabel}>{tabLabel(x)}</span>
                    {/* key: a barra recomeça do zero a cada troca; ao terminar, passa para o próximo */}
                    {i === active && <span key={active} className={s.progress} onAnimationEnd={() => go(active + 1)} aria-hidden="true" />}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPausado((p) => !p)}
                aria-label={pausado ? tr.testimonials.resume : tr.testimonials.pause}
                className={`${s.pause} motion-reduce:hidden`}
              >
                {pausado ? <Play size={15} fill="currentColor" aria-hidden="true" /> : <Pause size={15} fill="currentColor" aria-hidden="true" />}
              </button>
            </div>
          )}

          <div
            id="depo-painel"
            role={multi ? 'tabpanel' : undefined}
            aria-labelledby={multi ? `depo-tab-${active}` : undefined}
            className={`glass-panel ${s.panel}`}
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY }
            }}
            onPointerUp={(e) => {
              const start = swipe.current
              swipe.current = null
              if (!start) return
              const dx = e.clientX - start.x
              const dy = e.clientY - start.y
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(active + (dx < 0 ? 1 : -1))
            }}
            onPointerCancel={() => {
              swipe.current = null
            }}
          >
            {/* key: cada troca remonta o texto e as animações de entrada recomeçam */}
            <figure key={t.id} className="min-w-0">
              <QuoteMark />
              <p className={s.highlight} aria-hidden="true" lang={originalLang}>
                {words.map((w, i) => (
                  <span key={i}>
                    <span className={s.word} style={{ '--i': i, '--p': (i / Math.max(words.length - 1, 1)).toFixed(3) } as CSSProperties}>
                      {w}
                    </span>{' '}
                  </span>
                ))}
              </p>

              <div className={`${s.fade} mt-6`}>
                <blockquote id="depo-texto" lang={originalLang} className={`text-foreground-muted leading-relaxed ${longo && !aberto ? 'line-clamp-3' : ''}`}>
                  <p>{t.content}</p>
                </blockquote>
                {t.translated && tr.testimonials.translatedNote && (
                  <p className="text-xs text-foreground-subtle mt-2 italic">{tr.testimonials.translatedNote}</p>
                )}
                {longo && (
                  <button type="button" onClick={() => setAberto((a) => !a)} aria-expanded={aberto} aria-controls="depo-texto" className={s.more}>
                    {aberto ? tr.testimonials.less : tr.testimonials.more}
                  </button>
                )}
              </div>

              <figcaption className={`${s.fade} flex items-center gap-3 mt-7`}>
                <Avatar t={t} size={48} className={s.avatar} />
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">{t.authorName}</span>
                  <span className="block text-sm text-foreground-subtle">{t.authorRole}</span>
                </span>
              </figcaption>

              {deliverables.length > 0 && (
                <div className={`${s.fade} mt-6`}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-foreground-subtle mb-2.5">{tr.testimonials.delivered}</p>
                  <ul className={s.chips}>
                    {deliverables.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
            </figure>

            {caso?.cover && (
              <a href={lp(caso.href)} className={s.covers} onPointerMove={tilt} onPointerLeave={untilt}>
                {/* Todas as capas ficam empilhadas para a troca ser um cruzamento suave */}
                {items.map((x) => {
                  const c = x.caseSlug ? cases[x.caseSlug] : undefined
                  if (!c?.cover) return null
                  const on = x.id === t.id
                  return (
                    <Image
                      key={x.id}
                      src={c.cover}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 520px, 92vw"
                      className={`${s.cover} object-cover`}
                      data-on={on ? '' : undefined}
                      // Mesmo nome da capa no topo do case: ao abrir, uma vira a outra
                      style={on ? ({ viewTransitionName: `capa-${c.slug}` } as CSSProperties) : undefined}
                    />
                  )
                })}
                <span className={s.cta}>
                  {tr.testimonials.seeCase}<span className="sr-only"> {caso.name}</span>
                  <ArrowUpRight size={15} aria-hidden="true" />
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
