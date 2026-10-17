import { useEffect, useRef } from 'react'
import { getImageProps } from 'next/image'
import { ArrowRight } from 'lucide-react'
import type { CaseCard } from '@/lib/caseContent'
import { useI18n } from '@/lib/i18n'
import s from './BrandStrip.module.css'

/* ─────────────────────────────────────────────
   Faixa "Marcas que criei" em /cases: os logos criados pelo Estevão (brand.authored no case),
   cada um num quadro neutro do mesmo tamanho, com link para o case.
   Ao passar o mouse ou focar, aparecem a grade e as linhas de construção sobre o logo e a paleta.
   No toque (sem hover), aparecem quando o quadro chega ao meio da tela e enquanto o dedo está nele.
   Tudo em CSS; com movimento reduzido, nada anima (só aparece).
───────────────────────────────────────────── */

/** Logo em bitmap passa pelo otimizador do Next (na faixa ele aparece com ~200px de largura); SVG vai direto.
    Sem width/height no <img>: o tamanho vem da própria imagem, limitado pelo quadro (ver .logo no CSS). */
function logoSource(src: string) {
  if (!src.startsWith('/') || /\.svg$/i.test(src)) return { src }
  const { props } = getImageProps({ src, alt: '', width: 384, height: 192, quality: 80 })
  return { src: props.src, srcSet: props.srcSet }
}

export default function BrandStrip({ cards }: { cards: CaseCard[] }) {
  const { t, lp } = useI18n()
  const tp = t.portfolio
  const listRef = useRef<HTMLUListElement>(null)
  const brands = cards.filter((c) => c.brand)

  useEffect(() => {
    const list = listRef.current
    if (!list || !('IntersectionObserver' in window) || !window.matchMedia('(hover: none)').matches) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) (e.target as HTMLElement).toggleAttribute('data-active', e.isIntersecting)
      },
      { rootMargin: '-35% 0px -35% 0px' },
    )
    list.querySelectorAll('a').forEach((a) => io.observe(a))
    return () => io.disconnect()
  }, [brands.length])

  if (!brands.length) return null
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 pb-16 md:pb-20" aria-labelledby="marcas">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 md:gap-8 mb-6">
        <h2 id="marcas" className="text-2xl md:text-3xl font-black text-foreground">
          {tp.brandsTitle}
        </h2>
        <p className="text-sm text-foreground-muted md:text-right max-w-md">{tp.brandsText}</p>
      </div>
      <ul ref={listRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {brands.map((card) => {
          const b = card.brand!
          return (
            <li key={card.id}>
              <a href={lp(card.href)} className={`group ${s.tile}`}>
                <span className={s.plate}>
                  <span className={s.grid} aria-hidden="true" />
                  <span className={s.center}>
                    <span className={s.mark}>
                      {/* O nome do cliente está no texto do link: o logo não repete */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img {...logoSource(b.logo)} alt="" loading="lazy" decoding="async" className={s.logo} />
                      <span className={s.ext} aria-hidden="true">
                        <span className={s.extTop} />
                        <span className={s.extBottom} />
                        <span className={s.extLeft} />
                        <span className={s.extRight} />
                      </span>
                      <svg className={s.guides} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                        <rect x="0" y="0" width="100" height="100" />
                        <line x1="50" y1="0" x2="50" y2="100" />
                        <line x1="0" y1="50" x2="100" y2="50" />
                        <line x1="0" y1="0" x2="100" y2="100" />
                        <line x1="100" y1="0" x2="0" y2="100" />
                      </svg>
                      <svg className={s.guides} viewBox="0 0 100 100" aria-hidden="true">
                        <circle cx="50" cy="50" r="50" />
                        <circle cx="50" cy="50" r="25" />
                      </svg>
                    </span>
                  </span>
                  <span className={s.palette} aria-hidden="true">
                    {b.colors.map((c) => (
                      <span key={c.hex + c.name} className={s.chip} style={{ background: c.hex }} />
                    ))}
                  </span>
                </span>
                <span className="mt-3 flex items-start justify-between gap-3 px-1">
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-foreground leading-snug text-balance">{card.clientName}</span>
                    <span className="block text-xs text-foreground-muted">
                      {tp.brandChip}
                      {b.year && ` · ${b.year}`}
                    </span>
                  </span>
                  <span className="shrink-0 inline-flex items-center gap-1 pt-0.5 text-xs font-bold text-foreground">
                    {/* No celular, só a seta: o nome do cliente precisa do espaço */}
                    <span className="sr-only sm:not-sr-only">{tp.seeCase}</span>
                    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
