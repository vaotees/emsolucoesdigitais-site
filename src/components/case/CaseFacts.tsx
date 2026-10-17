import { ArrowUpRight } from 'lucide-react'
import type { CaseFacts as Facts } from '@/lib/caseContent'
import { useI18n } from '@/lib/i18n'

/** "Resumo em 30 segundos": papel, período, equipe, números do projeto e links. Muitos recrutadores leem só isto.
    `accent` colore os números; nos cases do template vem da variável --case-accent. */
export default function CaseFacts({ facts, accent = 'var(--case-accent, #F15A24)' }: { facts: Facts; accent?: string }) {
  const t = useI18n().t.caseFacts
  const items = [
    { label: t.role, value: facts.role.split('(')[0].trim() },
    { label: t.period, value: facts.period },
    { label: t.team, value: facts.team },
  ].filter((i) => i.value)
  if (!items.length && !facts.numbers.length) return null

  return (
    <section aria-label={t.label} className="glass-panel rounded-3xl p-6 md:p-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-foreground-subtle mb-5">{t.title}</p>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <dl className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-5 content-start">
          {items.map((i) => (
            <div key={i.label} className="flex flex-col-reverse justify-end">
              <dd className="text-sm font-semibold text-foreground leading-snug">{i.value}</dd>
              <dt className="text-xs text-foreground-subtle mb-1">{i.label}</dt>
            </div>
          ))}
        </dl>
        {facts.numbers.length > 0 && (
          <dl className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-5 lg:border-l lg:border-border lg:pl-8">
            {facts.numbers.map((n) => (
              <div key={n.label} className="flex flex-col-reverse justify-end">
                <dt className="text-xs text-foreground-subtle mt-1.5 leading-tight">{n.label}</dt>
                <dd className="text-3xl md:text-4xl font-black leading-none" style={{ color: `color-mix(in srgb, ${accent} 70%, var(--color-foreground))` }}>
                  {n.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {facts.links.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 pt-5 border-t border-border-subtle">
          {facts.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground hover:text-orange transition-colors">
              {l.label} <ArrowUpRight size={14} />
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
