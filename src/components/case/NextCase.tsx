import type { CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import CmsImage from '@/components/CmsImage'
import type { CaseCard } from '@/lib/caseContent'
import { useI18n } from '@/lib/i18n'

/** Link para o próximo case, no fim da página, para o recrutador continuar navegando.
    A capa usa o mesmo view-transition-name do topo do próximo case: ao clicar, uma vira a outra. */
export default function NextCase({ next }: { next: CaseCard | null }) {
  const { t, lp } = useI18n()
  if (!next) return null
  return (
    <section className="py-16" aria-label={t.nextCase.label}>
      <div className="max-w-7xl mx-auto px-6">
        <a
          href={lp(next.href)}
          className="reveal group grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border border-border glass-panel hover:border-orange/30 transition-colors duration-300"
        >
          <div className="p-8 md:p-12 flex flex-col justify-center gap-3 order-2 md:order-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-foreground-muted">{t.nextCase.label}</p>
            <h2 className="text-3xl md:text-5xl font-black text-foreground leading-tight">{next.clientName}</h2>
            {next.summary && <p className="text-foreground-muted leading-relaxed">{next.summary}</p>}
            <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground mt-2">
              {t.nextCase.see}
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </span>
          </div>
          <div
            className="relative aspect-[16/10] order-1 md:order-2 overflow-hidden bg-surface-raised"
            style={{ viewTransitionName: `capa-${next.slug}` } as CSSProperties}
          >
            {next.cover && (
              <CmsImage
                src={next.cover}
                alt={next.coverAlt}
                fill
                sizes="(min-width: 1280px) 620px, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
            )}
          </div>
        </a>
      </div>
    </section>
  )
}
