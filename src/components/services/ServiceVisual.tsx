import { useState, type CSSProperties, type PointerEvent } from 'react'
import { Check, Heart, Pointer } from 'lucide-react'
import { BRAND_ICONS } from '@/lib/brandIcons'
import { SCENES } from './ServiceScenes'
import { useI18n } from '@/lib/i18n'
import s from './ServiceVisual.module.css'

/* Quadros da seção de serviços: nos principais, uma cena interativa em vetor (ServiceScenes.tsx);
   nos complementares, o logo oficial com um detalhe animado. Animações em CSS, sem biblioteca.
   `play` liga quando o card entra na tela; `loop` (só nos ícones) liga no hover ou no foco do teclado. */

const Brand = ({ name, style }: { name: keyof typeof BRAND_ICONS; style?: CSSProperties }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={style}>
    <path d={BRAND_ICONS[name]} />
  </svg>
)

export const hasStage = (visual?: string | null) => Boolean(visual && SCENES[visual])

/** Camadas acompanham o mouse em profundidade: --mx/--my vão de -0,5 a 0,5 (só em telas com mouse). */
function trackDepth(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const r = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
  e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
}
function resetDepth(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--mx', '0')
  e.currentTarget.style.setProperty('--my', '0')
}

/** Cena interativa de um serviço principal. Altura fixa por largura de tela (cards da mesma linha iguais, sem CLS);
    a cena se ajusta ao quadro por container queries. O selo "Experimente" fica preso na borda de cima do quadro,
    com "Clique" no mouse e "Toque" no celular; depois da primeira interação vira "Feito" (mesmo lugar, sem pular). */
export function ServiceStage({ visual, play }: { visual: string; play: boolean }) {
  const [acted, setActed] = useState(false)
  const { t } = useI18n()
  const def = SCENES[visual]
  if (!def) return null
  const hint = def.hint(t)
  return (
    <div className={s.wrap} data-play={play ? '1' : '0'} data-acted={acted ? '' : undefined}>
      <p className={s.try}>
        {acted ? (
          <>
            <Check aria-hidden="true" />
            {t.services.done}
          </>
        ) : (
          <>
            <Pointer aria-hidden="true" />
            <span className={s.mouse}>{hint.mouse}</span>
            <span className={s.touch}>{hint.touch}</span>
            {hint.play ? <span aria-hidden="true">▶</span> : null}
            {hint.what}
          </>
        )}
      </p>
      <div role="group" aria-label={hint.label} className={s.stage} onPointerMove={trackDepth} onPointerLeave={resetDepth}>
        <def.Scene play={play} acted={acted} onAct={() => setActed(true)} />
      </div>
    </div>
  )
}

const ICONS: Record<string, () => JSX.Element> = {
  ia: () => (
    <span className={`${s.tile} ${s.whats}`}>
      <Brand name="whatsapp" />
      <span className={s.bubble}>
        <i />
        <i />
        <i />
      </span>
    </span>
  ),
  trafego: () => (
    <span className={`${s.tile} ${s.ads}`}>
      <Brand name="googleads" style={{ color: '#4285F4' }} />
      <span className={s.bars}>
        <i style={{ height: '40%' }} />
        <i style={{ height: '70%' }} />
        <i style={{ height: '100%' }} />
      </span>
    </span>
  ),
  social: () => (
    <span className={`${s.tile} ${s.insta}`}>
      <Brand name="instagram" />
      <span className={s.heart}>
        <Heart fill="currentColor" strokeWidth={0} />
      </span>
    </span>
  ),
}

export const hasIcon = (visual?: string | null) => Boolean(visual && ICONS[visual])

/** Logo oficial animado de um serviço complementar (WhatsApp, Google Ads, Instagram). */
export function ServiceIcon({ visual, play, loop }: { visual: string; play: boolean; loop: boolean }) {
  const Icon = ICONS[visual]
  if (!Icon) return null
  return (
    <span aria-hidden="true" data-play={play ? '1' : '0'} className={`${s.anim} ${loop ? s.loop : ''}`}>
      <Icon />
    </span>
  )
}
