'use client'

import { useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Figma, MousePointerClick, Play } from 'lucide-react'
import CmsImage from '@/components/CmsImage'
import type { CaseFigma } from '@/lib/caseContent'
import { fmt, useI18n } from '@/lib/i18n'

/* ─────────────────────────────────────────────
   Seção "Design no Figma" dos cases. Usa as cores do case (--case-accent / --case-gradient);
   os cases com página própria passam `scope` com as cores deles.
   O protótipo só é carregado do Figma quando a pessoa clica (iframe pesado e com cookies de terceiros).
───────────────────────────────────────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}
const inView = { initial: 'hidden', whileInView: 'visible', viewport: { once: true, margin: '-80px' } } as const
const ACCENT_TEXT = 'text-[color:var(--case-accent)]'
const GRAD_TEXT: CSSProperties = {
  background: 'var(--case-gradient, var(--case-accent))',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

interface Props {
  figma: CaseFigma | null
  clientName: string
  /** Cores para páginas que não definem --case-accent (cases com página própria). */
  scope?: { id: string; accent: string; accentDark: string }
  buttonBg?: string
  buttonFg?: string
}

export default function FigmaShowcase({ figma, clientName, scope, buttonBg, buttonFg }: Props) {
  const [loaded, setLoaded] = useState(false)
  const [ready, setReady] = useState(false)
  const t = useI18n().t.figma
  if (!figma) return null
  const f = figma
  const openUrl = f.prototypeUrl || f.fileUrl
  const isPrototype = Boolean(f.prototypeUrl)

  return (
    <section id="figma" className="py-24 relative overflow-hidden" data-figma-scope={scope?.id}>
      {scope && (
        <style
          dangerouslySetInnerHTML={{
            __html: `[data-figma-scope="${scope.id}"]{--case-accent:${scope.accent};--case-gradient:linear-gradient(135deg,${scope.accent} 0%,${scope.accentDark} 100%)}.dark [data-figma-scope="${scope.id}"]{--case-accent:${scope.accentDark};--case-gradient:linear-gradient(135deg,${scope.accentDark} 0%,${scope.accent} 100%)}`,
          }}
        />
      )}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div {...inView} variants={fadeInUp} className="mb-14 text-center">
          <p className={`text-xs font-bold uppercase tracking-[0.25em] mb-3 ${ACCENT_TEXT}`}>{f.eyebrow}</p>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            {f.title} {f.highlight && <span style={GRAD_TEXT}>{f.highlight}</span>}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 lg:gap-10 items-start">
          <motion.div {...inView} variants={fadeInUp} className="rounded-2xl overflow-hidden border border-border bg-[#1E1E1E] shadow-2xl shadow-black/20">
            <div className="flex items-center gap-2 px-4 h-10 border-b border-white/10 text-white/70">
              <Figma size={14} className="shrink-0" aria-hidden="true" />
              <span className="text-xs font-medium truncate">{fmt(t.inFigma, { client: clientName })}</span>
            </div>
            <div className="relative aspect-[16/10]">
              {loaded && f.embedUrl ? (
                <>
                  <iframe
                    src={f.embedUrl}
                    title={fmt(isPrototype ? t.prototypeOf : t.fileOf, { client: clientName })}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    onLoad={() => setReady(true)}
                  />
                  {!ready && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/70 text-sm pointer-events-none" role="status">
                      <span className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" aria-hidden="true" />
                      {isPrototype ? t.loadingPrototype : t.loadingFile}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {f.preview && <CmsImage src={f.preview} alt={f.previewAlt} fill sizes="(min-width: 1280px) 860px, (min-width: 1024px) 65vw, 100vw" className="object-cover" />}
                  {f.embedUrl && (
                    <button
                      type="button"
                      onClick={() => setLoaded(true)}
                      className="hidden lg:flex absolute inset-0 items-center justify-center bg-black/0 hover:bg-black/35 transition-colors group"
                    >
                      <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#1E1E1E] text-sm font-bold shadow-xl transition-transform group-hover:scale-105">
                        <Play size={16} className="fill-current" aria-hidden="true" />
                        {isPrototype ? t.tryHere : t.viewHere}
                      </span>
                    </button>
                  )}
                  <a
                    href={openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lg:hidden absolute inset-x-0 bottom-0 flex justify-center pb-5 pt-16 bg-gradient-to-t from-black/60 to-transparent"
                  >
                    <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#1E1E1E] text-sm font-bold shadow-xl">
                      <Play size={16} className="fill-current" aria-hidden="true" />
                      {isPrototype ? t.openPrototype : t.openFile}
                    </span>
                  </a>
                </>
              )}
            </div>
          </motion.div>

          <motion.aside {...inView} variants={fadeInUp} className="flex flex-col gap-6 min-w-0">
            {f.text && <p className="text-foreground-muted leading-relaxed">{f.text}</p>}
            {f.stats.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {f.stats.map((s) => (
                  <div key={s.label} className="glass-panel p-4">
                    <p className="text-2xl font-black text-foreground leading-none">{s.value}</p>
                    <p className="text-xs text-foreground-muted mt-1.5">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-3">
              {f.prototypeUrl && (
                <a
                  href={f.prototypeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: buttonBg || 'var(--case-accent)', color: buttonFg || '#FFFFFF' }}
                >
                  {t.fullscreen}
                  <ArrowUpRight size={15} />
                </a>
              )}
              {f.fileUrl && (
                <a
                  href={f.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-bold border border-border text-foreground-muted hover:text-foreground transition-colors"
                >
                  <Figma size={15} aria-hidden="true" />
                  {t.viewFile}
                </a>
              )}
            </div>
            {isPrototype && (
              <p className="flex items-start gap-2 text-xs text-foreground-subtle leading-relaxed">
                <MousePointerClick size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                {t.tip}
              </p>
            )}
          </motion.aside>
        </div>
      </div>
    </section>
  )
}
