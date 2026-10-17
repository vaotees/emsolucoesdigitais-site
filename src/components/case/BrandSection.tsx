import { useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import type { CaseBrandApplication, CaseBrandVariant } from '@/lib/caseContent'
import { fmt, useI18n } from '@/lib/i18n'
import { PROFILE } from '@/lib/profile'

/* ─────────────────────────────────────────────
   Seção "Identidade visual" do case (#marca): logo em fundo claro e escuro, conceito, paleta,
   tipografia, variações, aplicações reais, regras de uso e voz.
   Marca criada pelo Estevão (brand.authored): a seção vem logo depois do resumo, com o conceito e a autoria.
   Nas outras, fica no fim da página e mostra a marca como está no site.
───────────────────────────────────────────── */

export interface CaseBrandConfig {
  authored: boolean
  year: string
  concept: string
  intro: string
  colors: { name: string; hex: string; usage: string }[]
  fonts: { role: string; family: string; sample: string; usage: string; style: CSSProperties }[]
  fontsHref: string
  logo: { src: string; darkSrc: string; alt: string } | null
  rules: { do: string[]; dont: string[] } | null
  voice: { intro: string; traits: string[]; tone: string[] } | null
  variants: CaseBrandVariant[]
  applications: CaseBrandApplication[]
  guidelinesUrl: string
}

const ACCENT_TEXT = 'text-[color:var(--case-accent)]'
const PANEL_LABEL = 'text-xs font-bold uppercase tracking-[0.2em] text-foreground-muted'
const DARK_TILE = 'bg-[#0E1424]'
const LIGHT_TILE = 'bg-white border border-black/5'

function Swatch({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  const [copied, setCopied] = useState(false)
  const { t } = useI18n()
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(hex)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Sem clipboard: o código continua visível.
    }
  }
  return (
    // Nome acessível = o texto visível (nome, código e uso), com "Copiar" antes só para leitor de tela
    <button type="button" onClick={copy} className="group text-left min-w-0">
      <span className="sr-only">{t.caseStudy.copy}</span>
      <span className="block h-24 rounded-2xl border border-border mb-3 relative" style={{ background: hex }}>
        {copied && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Check size={20} className="text-white mix-blend-difference" />
          </span>
        )}
      </span>
      <span className="block text-sm font-bold text-foreground">{name}</span>
      <code className="block text-xs text-foreground-muted font-mono">{hex}</code>
      {usage && <span className="block text-xs text-foreground-subtle mt-1">{usage}</span>}
    </button>
  )
}

/** Logo em fundo claro e escuro; ao lado, o conceito e a autoria (marca criada pelo Estevão). */
function BrandLogo({ logo, aside }: { logo: { src: string; darkSrc: string; alt: string }; aside: ReactNode }) {
  const { t } = useI18n()
  const tile = 'relative rounded-2xl p-8 min-h-[170px] flex items-center justify-center'
  const label = 'absolute bottom-2.5 left-3.5 text-[10px] font-bold uppercase tracking-widest'
  const img = `${aside ? 'max-h-28' : 'max-h-24'} w-auto max-w-full object-contain`
  return (
    <div className={`grid grid-cols-1 ${aside ? 'lg:grid-cols-3' : ''} gap-6 mb-6`}>
      {/* Ao lado do conceito, os quadros crescem até a altura da coluna (sem vazio embaixo) */}
      <div className={`reveal glass-panel p-8 md:p-10 flex flex-col ${aside ? 'lg:col-span-2' : ''}`}>
        <p className={`${PANEL_LABEL} mb-6`}>{t.caseStudy.logo}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          <div className={`${tile} ${LIGHT_TILE}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo.src} alt={logo.alt} loading="lazy" className={img} />
            <span className={`${label} text-slate-600`}>{t.caseStudy.logoLight}</span>
          </div>
          <div className={`${tile} ${DARK_TILE}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.darkSrc || logo.src}
              alt=""
              loading="lazy"
              className={img}
              // Sem versão para fundo escuro: o mesmo logo em branco (o mesmo arquivo nos dois campos mantém as cores)
              style={logo.darkSrc ? undefined : { filter: 'brightness(0) invert(1)' }}
            />
            <span className={`${label} text-white/70`}>{t.caseStudy.logoDark}</span>
          </div>
        </div>
      </div>
      {aside}
    </div>
  )
}

function Concept({ text, authored, year }: { text: string; authored: boolean; year: string }) {
  const { t } = useI18n()
  return (
    <div className="reveal glass-panel p-8 flex flex-col gap-4">
      <p className={PANEL_LABEL}>{t.caseStudy.concept}</p>
      {text && <p className="text-foreground leading-relaxed">{text}</p>}
      {authored && (
        <p className="mt-auto pt-4 border-t border-border text-sm text-foreground-muted">
          <span className="font-bold text-foreground">{fmt(t.caseStudy.brandBy, { name: PROFILE.name })}</span>
          {year && ` · ${year}`}
        </p>
      )}
    </div>
  )
}

/** Arquivos que existem da marca, cada um no fundo em que é usado. */
function Variants({ variants, alt }: { variants: CaseBrandVariant[]; alt: string }) {
  const { t } = useI18n()
  return (
    <div className="reveal glass-panel p-8 md:p-10 mt-6">
      <p className={`${PANEL_LABEL} mb-6`}>{t.caseStudy.variants}</p>
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {variants.map((v) => (
          <li key={v.src + v.label}>
            <figure>
              <div className={`h-32 rounded-2xl p-5 flex items-center justify-center ${v.dark ? DARK_TILE : LIGHT_TILE}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={v.src} alt={`${alt} (${v.label})`} loading="lazy" className="max-h-full max-w-full w-auto object-contain" />
              </div>
              <figcaption className="mt-2.5 text-sm font-semibold text-foreground">{v.label}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Onde a marca é usada de verdade (favicon, topo do site, redes…). */
function Applications({ items }: { items: CaseBrandApplication[] }) {
  const { t } = useI18n()
  return (
    <div className="reveal glass-panel p-8 md:p-10 mt-6">
      <p className={`${PANEL_LABEL} mb-6`}>{t.caseStudy.applications}</p>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((a, idx) => (
          <li key={a.label} className="flex items-start gap-4 rounded-2xl border border-border p-4">
            {a.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.src} alt="" loading="lazy" className="w-16 h-16 shrink-0 rounded-xl bg-white border border-black/5 object-contain p-1.5" />
            ) : (
              <span className={`w-16 h-16 shrink-0 rounded-xl border border-border flex items-center justify-center text-sm font-bold font-mono ${ACCENT_TEXT}`} aria-hidden="true">
                {String(idx + 1).padStart(2, '0')}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">{a.label}</p>
              {a.detail && <p className="text-sm text-foreground-muted leading-snug mt-1">{a.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Rules({ rules }: { rules: { do: string[]; dont: string[] } }) {
  const { t } = useI18n()
  return (
    <div className="reveal glass-panel p-8 md:p-10 mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        { title: t.caseStudy.rulesDo, items: rules.do, mark: '✓', color: 'text-emerald-600 dark:text-emerald-400' },
        { title: t.caseStudy.rulesDont, items: rules.dont, mark: '✕', color: 'text-red-600 dark:text-red-400' },
      ].filter((g) => g.items.length).map((g) => (
        <div key={g.title}>
          <p className="text-sm font-bold text-foreground mb-3">{g.title}</p>
          <ul className="space-y-2">
            {g.items.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-foreground-muted leading-snug">
                <span aria-hidden="true" className={`shrink-0 ${g.color}`}>{g.mark}</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

/** Voz da marca: personalidade e tom em etiquetas. */
function BrandVoice({ voice }: { voice: { intro: string; traits: string[]; tone: string[] } }) {
  const { t } = useI18n()
  return (
    <div className="reveal glass-panel p-8 md:p-10 mt-6">
      <p className={`${PANEL_LABEL} mb-4`}>{t.caseStudy.voice}</p>
      {voice.intro && <p className="text-foreground-muted leading-relaxed max-w-3xl mb-6">{voice.intro}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: t.caseStudy.voiceTraits, items: voice.traits },
          { title: t.caseStudy.voiceTone, items: voice.tone },
        ].filter((g) => g.items.length).map((g) => (
          <div key={g.title}>
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${ACCENT_TEXT}`}>{g.title}</p>
            <ul className="flex flex-wrap gap-2">
              {g.items.map((item) => (
                <li key={item} className="px-3 py-1.5 rounded-full text-xs font-semibold border border-border text-foreground-muted">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Exemplos longos ficam menores para não quebrar em várias linhas. */
function sampleSize(sample: string): CSSProperties {
  if (sample.length > 32) return { fontSize: '1.5rem' }
  if (sample.length > 14) return { fontSize: '2rem' }
  return {}
}

export default function BrandSection({ brand: b, header }: { brand: CaseBrandConfig; header: ReactNode }) {
  const { t } = useI18n()
  const cs = t.caseStudy
  const concept = b.concept || b.authored ? <Concept text={b.concept} authored={b.authored} year={b.year} /> : null
  return (
    <section id="marca" className="cv-auto py-24">
      <div className="max-w-7xl mx-auto px-6">
        {header}
        {b.logo ? <BrandLogo logo={b.logo} aside={concept} /> : concept && <div className="mb-6">{concept}</div>}
        {b.colors.length > 0 && (
          <div className="reveal glass-panel p-8 md:p-10 mb-6">
            <p className={`${PANEL_LABEL} mb-6`}>{cs.palette}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {b.colors.map((color) => <Swatch key={color.hex + color.name} {...color} />)}
            </div>
          </div>
        )}
        {b.fonts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {b.fonts.map((font) => (
              <div key={font.family + font.role} className="reveal glass-panel p-8 flex flex-col gap-4 min-w-0">
                {font.role && <p className={PANEL_LABEL}>{font.role}</p>}
                <p className="text-4xl md:text-5xl text-foreground leading-tight break-words" style={{ ...font.style, ...sampleSize(font.sample) }}>
                  {font.sample}
                </p>
                <div>
                  <p className="text-sm font-bold text-foreground">{font.family}</p>
                  {font.usage && <p className="text-sm text-foreground-muted">{font.usage}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        {b.variants.length > 0 && <Variants variants={b.variants} alt={b.logo?.alt || cs.logo} />}
        {b.applications.length > 0 && <Applications items={b.applications} />}
        {b.rules && <Rules rules={b.rules} />}
        {b.voice && <BrandVoice voice={b.voice} />}
        {b.guidelinesUrl && (
          <p className="reveal mt-8 text-center">
            <a href={b.guidelinesUrl} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 text-sm font-bold hover:underline underline-offset-4 ${ACCENT_TEXT}`}>
              {cs.guidelines}
              <ArrowUpRight size={15} />
            </a>
          </p>
        )}
      </div>
    </section>
  )
}
