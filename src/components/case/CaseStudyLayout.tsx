'use client'

import Head from 'next/head'
import { useRef, useState, type CSSProperties } from 'react'
import { ArrowLeft, ArrowUpRight, Check, Copy, Info, Lightbulb, Mail, MessageCircle, Target, X, ZoomIn, type LucideIcon } from 'lucide-react'
import Navbar from '@/components/Navbar'
import SeoMeta from '@/components/SeoMeta'
import CmsImage from '@/components/CmsImage'
import { ogImageUrl } from '@/lib/seo'
import { caseIcon } from '@/lib/caseIcons'
import type { CaseCard, CaseFacts as Facts, CaseFigma } from '@/lib/caseContent'
import FigmaShowcase from '@/components/case/FigmaShowcase'
import CaseFacts from '@/components/case/CaseFacts'
import NextCase from '@/components/case/NextCase'
import StackLogo from '@/components/case/StackLogo'
import BrandSection, { type CaseBrandConfig } from '@/components/case/BrandSection'
import { introIn } from '@/lib/intro'
import { fmt, useI18n } from '@/lib/i18n'
import { PROFILE } from '@/lib/profile'

/* ─────────────────────────────────────────────
   Template único dos cases. Recebe a configuração já resolvida
   (ver caseConfigFromProject em src/lib/caseContent.ts) e só apresenta.
   Movimento em CSS: intro-in no topo (aparece no primeiro paint) e reveal ao rolar (scroll-driven).
───────────────────────────────────────────── */

export interface CaseFeature {
  id: string
  icon: LucideIcon
  title: string
  description: string
  bullets: string[]
  screen: string
  screenAlt: string
  url: string
  login: { email: string; password: string } | null
}

export interface CaseStudyConfig {
  slug: string
  clientName: string
  tagline: string
  description: string
  role: string
  status: string
  category: string
  challengeText: string
  solutionText: string
  impactText: string
  liveUrl: string
  urlLabel: string
  heroImage: string
  heroAlt: string
  ogEyebrow: string
  notice: string
  heroPrimaryLabel: string
  heroSecondaryLabel: string
  theme: { accent: string; accentDark: string; gradient: string; gradientDark: string; buttonBg: string; buttonFg: string }
  features: { eyebrow: string; title: string; highlight: string; intro: string; note: string; items: CaseFeature[] }
  admin: { eyebrow: string; title: string; highlight: string; intro: string; modules: { icon: LucideIcon; title: string; description: string }[] } | null
  stack: { name: string; label: string; value: string }[]
  highlights: { id?: string; iconName: string; title: string; body: string }[]
  brand: CaseBrandConfig | null
  figma: CaseFigma | null
  facts: Facts
  nextCase: CaseCard | null
  cta: { eyebrow: string; title: string; highlight: string; text: string; whatsappText: string }
}

const ACCENT_TEXT = 'text-[color:var(--case-accent)]'
const EYEBROW = `text-xs font-bold uppercase tracking-[0.25em] ${ACCENT_TEXT}`
// Fundo, borda e brilho acompanham a cor do tema atual (claro ou escuro)
const ICON_BOX: CSSProperties = {
  background: 'color-mix(in srgb, var(--case-accent) 12%, transparent)',
  borderColor: 'color-mix(in srgb, var(--case-accent) 30%, transparent)',
}
const glow = (pct: number) => `radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--case-accent) ${pct}%, transparent) 0%, transparent 70%)`
const GRAD_TEXT: CSSProperties = {
  background: 'var(--case-gradient)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

function SectionHeader({ eyebrow, title, highlight, intro }: { eyebrow: string; title: string; highlight?: string; intro?: string }) {
  return (
    <div className="reveal mb-14 text-center">
      <p className={`${EYEBROW} mb-3`}>{eyebrow}</p>
      <h2 className="text-3xl md:text-4xl font-black text-foreground">
        {title} {highlight && <span style={GRAD_TEXT}>{highlight}</span>}
      </h2>
      {intro && <p className="text-foreground-muted mt-4 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">{intro}</p>}
    </div>
  )
}

/** Tela numa moldura de navegador; clicar amplia (dialog nativo: Esc e clique fora fecham). */
function BrowserFrame({ src, alt, urlLabel }: { src: string; alt: string; urlLabel: string }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const { t } = useI18n()
  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="group/frame block w-full text-left rounded-2xl overflow-hidden border border-border bg-surface-raised shadow-2xl shadow-black/20 cursor-zoom-in"
      >
        <span className="sr-only">{t.caseStudy.zoom}</span>
        <div className="flex items-center gap-3 px-4 h-9 bg-black/[0.04] dark:bg-white/[0.06]">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
          </div>
          <span className="flex-1 min-w-0 truncate text-center text-[11px] font-medium text-foreground-muted">{urlLabel}</span>
          <ZoomIn size={14} className="w-10 text-foreground-subtle opacity-0 group-hover/frame:opacity-100 transition-opacity" aria-hidden="true" />
        </div>
        <div className="relative aspect-[16/10]">
          {src && <CmsImage src={src} alt={alt} fill sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw" className="object-cover object-top" />}
        </div>
      </button>
      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="lightbox w-[min(96vw,1440px)] max-h-[92vh] p-0 rounded-2xl bg-transparent backdrop:bg-black/80"
        aria-label={alt}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
            aria-label={t.ui.close}
          >
            <X size={18} />
          </button>
          {src && <CmsImage src={src} alt={alt} width={1440} height={900} sizes="96vw" className="w-full h-auto rounded-2xl" />}
        </div>
      </dialog>
    </>
  )
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const { t } = useI18n()
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Sem clipboard: o valor continua visível para copiar à mão.
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="group/copy flex items-center justify-between gap-3 w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-surface border border-border transition-colors text-left"
    >
      <span className="min-w-0">
        <span className="sr-only">{t.caseStudy.copy}</span>
        <span className="block text-[10px] font-bold uppercase tracking-widest text-foreground-subtle">{label}</span>
        <code className="block truncate text-sm text-foreground font-mono">{value}</code>
      </span>
      {copied ? <Check size={15} className="shrink-0 text-emerald-500" /> : <Copy size={15} className="shrink-0 text-foreground-subtle group-hover/copy:text-foreground transition-colors" />}
    </button>
  )
}

export default function CaseStudyLayout({ config }: { config: CaseStudyConfig }) {
  const c = config
  const { t, locale, lp } = useI18n()
  const cs = t.caseStudy
  const whatsappUrl = `https://wa.me/5561995664986?text=${encodeURIComponent(c.cta.whatsappText)}`
  // Em inglês, o e-mail é o botão principal da chamada final; o WhatsApp continua como opção
  const emailFirst = locale !== 'pt-BR'
  const mailUrl = `mailto:${PROFILE.email}?subject=${encodeURIComponent(fmt(cs.mailSubject, { client: c.clientName }))}`
  const hasFeatures = c.features.items.length > 0
  const brandFirst = Boolean(c.brand?.authored)
  const pageTitle = fmt(t.meta.caseTitle, { client: c.clientName, tagline: c.tagline })

  const navLinks = [
    { href: '/', label: t.nav.home },
    ...(brandFirst ? [{ href: '#marca', label: cs.navBrand }] : []),
    { href: '#desafio', label: cs.navChallenge },
    ...(hasFeatures ? [{ href: '#entrega', label: cs.navDelivery }] : []),
    ...(c.admin ? [{ href: '#painel', label: cs.navPanel }] : []),
    ...(c.figma ? [{ href: '#figma', label: cs.navFigma }] : []),
    ...(c.stack.length ? [{ href: '#stack', label: cs.navStack }] : []),
    ...(c.brand && !brandFirst ? [{ href: '#marca', label: cs.navBrand }] : []),
  ]
  // Marca criada pelo Estevão: a identidade visual vem logo depois do resumo; nas outras, fica no fim
  const brandSection = c.brand && (
    <BrandSection
      brand={c.brand}
      header={
        brandFirst ? (
          <SectionHeader eyebrow={cs.brandEyebrow} title={cs.brandAuthoredTitle} highlight={cs.brandAuthoredHighlight} intro={c.brand.intro} />
        ) : (
          <SectionHeader eyebrow={cs.brandEyebrow} title={cs.brandTitle} highlight={cs.brandHighlight} intro={c.brand.intro} />
        )
      }
    />
  )

  return (
    <>
      <Head>
        <title>{`${pageTitle} | EM Soluções Digitais`}</title>
        <meta name="description" content={c.description} />
        {c.brand?.fontsHref && <link rel="stylesheet" href={c.brand.fontsHref} />}
      </Head>
      <SeoMeta
        type="article"
        title={pageTitle}
        description={c.description}
        image={ogImageUrl({ eyebrow: c.ogEyebrow, title: c.clientName, subtitle: c.tagline })}
      />

      {/* Cores da marca por tema. innerHTML: como texto, o React escapa as aspas no servidor e a hidratação falha */}
      <style
        dangerouslySetInnerHTML={{
          __html: `[data-case="${c.slug}"]{--case-accent:${c.theme.accent};--case-gradient:${c.theme.gradient}}.dark [data-case="${c.slug}"]{--case-accent:${c.theme.accentDark};--case-gradient:${c.theme.gradientDark}}`,
        }}
      />

      <div className="bg-surface min-h-screen" data-case={c.slug}>
        <Navbar links={navLinks} />

        <div className="max-w-7xl mx-auto px-6 pt-28 pb-0">
          <a href={lp('/cases')} className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors duration-200 group">
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            {cs.back}
          </a>
        </div>

        {/* ══ HERO ══ (entrada em CSS: aparece no primeiro paint, sem esperar o JavaScript) */}
        <section className="relative overflow-hidden pb-20 pt-10">
          <div className="absolute inset-0 pointer-events-none" style={{ background: glow(22) }} />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="intro-in flex flex-wrap gap-3 mb-7" style={introIn(0, 0.7)}>
              {c.status && (
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border ${ACCENT_TEXT}`} style={ICON_BOX}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-slow" />
                  {c.status}
                </span>
              )}
              {c.category && (
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide border bg-surface-raised border-border text-foreground-muted">
                  {c.category}
                </span>
              )}
            </div>

            <h1 style={introIn(32, 0.6, 0.1)} className="intro-in text-4xl sm:text-5xl md:text-6xl font-black text-foreground leading-[1.05] tracking-tight mb-6 max-w-4xl text-balance">
              {c.clientName}
              {c.tagline && (
                <>
                  {' '}&ndash; <span style={GRAD_TEXT}>{c.tagline}</span>
                </>
              )}
            </h1>

            <div style={introIn(32, 0.6, 0.2)} className="intro-in max-w-3xl mb-10 space-y-5">
              {c.description && <p className="text-foreground-muted text-lg leading-relaxed">{c.description}</p>}
              {c.notice && (
                <p className="flex items-start gap-2 text-sm text-foreground-subtle">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  {c.notice}
                </p>
              )}
              <div className="flex flex-wrap gap-3 pt-1">
                {c.liveUrl && (
                  <a
                    href={c.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ background: c.theme.buttonBg, color: c.theme.buttonFg }}
                  >
                    {c.heroPrimaryLabel}
                    <ArrowUpRight size={15} />
                  </a>
                )}
                {hasFeatures && (
                  <a href="#entrega" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border border-border text-foreground-muted hover:text-foreground transition-colors">
                    {c.heroSecondaryLabel}
                  </a>
                )}
              </div>
            </div>

            <div style={introIn(24, 0.6, 0.3)} className="intro-in mb-10">
              <CaseFacts facts={c.facts} />
            </div>

            {/* Mesmo view-transition-name da capa em /cases: ao abrir o case pela grade, uma capa vira a outra */}
            {c.heroImage && (
              <div style={{ viewTransitionName: `capa-${c.slug}` } as CSSProperties} className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-surface-raised">
                <CmsImage src={c.heroImage} alt={c.heroAlt} fill priority sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" />
              </div>
            )}
          </div>
        </section>

        {/* ══ IDENTIDADE VISUAL (marca criada pelo Estevão) ══ */}
        {brandFirst && brandSection}

        {/* ══ DESAFIO & SOLUÇÃO ══ */}
        {(c.challengeText || c.solutionText) && (
          <section id="desafio" className="cv-auto py-24">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                { icon: Target, title: cs.challenge, text: c.challengeText },
                { icon: Lightbulb, title: cs.solution, text: c.solutionText },
              ].filter((b) => b.text).map((block) => (
                <div key={block.title} className="reveal glass-panel p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`w-10 h-10 rounded-xl flex items-center justify-center border ${ACCENT_TEXT}`} style={ICON_BOX} aria-hidden="true">
                      <block.icon size={18} />
                    </span>
                    <h2 className="text-lg font-bold text-foreground">{block.title}</h2>
                  </div>
                  <p className="text-foreground-muted leading-relaxed text-base whitespace-pre-wrap">{block.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ O QUE FOI ENTREGUE ══ */}
        {hasFeatures && (
          <section id="entrega" className="cv-auto py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <SectionHeader {...c.features} />
              <div className="flex flex-col gap-20">
                {c.features.items.map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <article key={item.id} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                      <div className={`reveal ${idx % 2 === 1 ? 'lg:order-2' : ''}`}>
                        <BrowserFrame src={item.screen} alt={item.screenAlt} urlLabel={(item.url || c.urlLabel).replace(/^https?:\/\//, '').replace(/\/$/, '')} />
                      </div>
                      <div className="reveal flex flex-col gap-5 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className={`w-11 h-11 rounded-xl flex items-center justify-center border ${ACCENT_TEXT}`} style={ICON_BOX}>
                            <Icon size={20} />
                          </span>
                          <span className="text-xs font-bold text-foreground-subtle font-mono">{String(idx + 1).padStart(2, '0')}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black text-foreground">{item.title}</h3>
                        {item.description && <p className="text-foreground-muted leading-relaxed">{item.description}</p>}
                        {item.bullets.length > 0 && (
                          <ul className="flex flex-col gap-2.5">
                            {item.bullets.map((b) => (
                              <li key={b} className="flex items-start gap-2.5 text-sm text-foreground-muted">
                                <Check size={16} className={`shrink-0 mt-0.5 ${ACCENT_TEXT}`} />
                                {b}
                              </li>
                            ))}
                          </ul>
                        )}
                        {item.login && (
                          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-2.5">
                            <CopyField label="E-mail" value={item.login.email} />
                            <CopyField label={cs.password} value={item.login.password} />
                          </div>
                        )}
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className={`self-start inline-flex items-center gap-2 text-sm font-bold hover:underline underline-offset-4 ${ACCENT_TEXT}`}>
                            {fmt(cs.open, { item: item.title.toLowerCase() })}
                            <ArrowUpRight size={15} />
                          </a>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>

              {c.features.note && (
                <div className="reveal mt-20 glass-panel p-6 md:p-8 flex flex-col md:flex-row gap-4 md:items-center">
                  <Info size={22} className={`shrink-0 ${ACCENT_TEXT}`} />
                  <p className="text-sm text-foreground-muted leading-relaxed">{c.features.note}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══ PAINEL ══ */}
        {c.admin && (
          <section id="painel" className="cv-auto py-24 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <SectionHeader {...c.admin} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {c.admin.modules.map((m) => {
                  const Icon = m.icon
                  return (
                    <div key={m.title} className="reveal glass-panel p-7">
                      <span className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-5 ${ACCENT_TEXT}`} style={ICON_BOX}>
                        <Icon size={20} />
                      </span>
                      <h3 className="font-bold text-foreground mb-2">{m.title}</h3>
                      <p className="text-foreground-muted text-sm leading-relaxed">{m.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ══ DESIGN NO FIGMA ══ */}
        <FigmaShowcase figma={c.figma} clientName={c.clientName} buttonBg={c.theme.buttonBg} buttonFg={c.theme.buttonFg} />

        {/* ══ STACK ══ (logos reais; a frase de cada uma explica o papel no projeto) */}
        {c.stack.length > 0 && (
          <section id="stack" className="cv-auto py-24">
            <div className="max-w-7xl mx-auto px-6">
              <SectionHeader eyebrow={cs.stackEyebrow} title={cs.stackTitle} highlight={cs.stackHighlight} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {c.stack.map((item) => (
                  <div key={item.label} className="reveal glass-panel p-6 flex flex-col gap-4">
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-surface-raised border border-border">
                      <StackLogo name={item.name} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-foreground mb-1.5">{item.label}</p>
                      {item.value && <p className="text-foreground-muted text-sm leading-relaxed">{item.value}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ DESTAQUES ══ */}
        {c.highlights.length > 0 && (
          <section id="destaques" className="cv-auto py-24">
            <div className="max-w-7xl mx-auto px-6">
              <SectionHeader eyebrow={cs.highlightsEyebrow} title={cs.highlightsTitle} highlight={cs.highlightsHighlight} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {c.highlights.map((h, idx) => {
                  const Icon = caseIcon(h.iconName)
                  return (
                    <div key={h.id || h.title} className="reveal glass-panel relative p-8">
                      <span className="absolute top-6 right-7 text-xs font-bold text-foreground-muted font-mono">{String(idx + 1).padStart(2, '0')}</span>
                      <span className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border ${ACCENT_TEXT}`} style={ICON_BOX}>
                        <Icon size={22} />
                      </span>
                      <h3 className="font-bold text-foreground mb-3 text-lg leading-snug">{h.title}</h3>
                      {h.body && <p className="text-foreground-muted text-sm leading-relaxed">{h.body}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ══ IMPACTO ══ */}
        {c.impactText && (
          <section className="py-24 relative overflow-hidden">
            <div className="reveal max-w-4xl mx-auto px-6 relative z-10 text-center">
              <p className={`${EYEBROW} mb-6`}>{cs.impact}</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground leading-snug whitespace-pre-wrap">{c.impactText}</p>
            </div>
          </section>
        )}

        {/* ══ IDENTIDADE VISUAL (marca no site) ══ */}
        {!brandFirst && brandSection}

        {/* ══ PRÓXIMO CASE ══ */}
        <NextCase next={c.nextCase} />

        {/* ══ CTA ══ */}
        <section className="pb-24 pt-8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="reveal glass-panel p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: glow(14) }} />
              <p className={`${EYEBROW} mb-4 relative z-10`}>{c.cta.eyebrow}</p>
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-6 relative z-10">
                {c.cta.title} {c.cta.highlight && <span style={GRAD_TEXT}>{c.cta.highlight}</span>}
              </h2>
              <p className="text-foreground-muted max-w-xl mx-auto mb-10 leading-relaxed relative z-10">{c.cta.text}</p>
              <div className="flex flex-wrap gap-4 justify-center relative z-10">
                {emailFirst && (
                  <a
                    href={mailUrl}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
                    style={{ background: c.theme.buttonBg, color: c.theme.buttonFg }}
                  >
                    <Mail size={16} />
                    {cs.ctaEmail}
                  </a>
                )}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    emailFirst
                      ? 'inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold glass-panel text-foreground-muted hover:text-foreground transition-colors'
                      : 'inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-opacity hover:opacity-90'
                  }
                  style={emailFirst ? undefined : { background: c.theme.buttonBg, color: c.theme.buttonFg }}
                >
                  <MessageCircle size={16} />
                  {cs.ctaWhatsapp}
                </a>
                <a href={lp('/#contact')} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold glass-panel text-foreground-muted hover:text-foreground transition-colors">
                  {cs.ctaProposal}
                </a>
                <a href={lp('/cases')} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-foreground-muted hover:text-foreground transition-colors">
                  {cs.ctaOther}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
