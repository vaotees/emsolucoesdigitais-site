import type { CSSProperties } from 'react'
import { stackLogoPath } from '@/lib/stackLogos'
import { findStack } from '@/lib/stackLibrary'

/** Cor da marca puxada para a cor do texto do tema: o preto da Vercel ou do Next.js continua legível no escuro,
    e o ciano do React continua legível no claro. */
export const brandTint = (hex?: string | null): string =>
  hex ? `color-mix(in srgb, ${hex} 55%, var(--color-foreground))` : 'var(--color-foreground)'

/** Logo da tecnologia (Simple Icons) ou, se não houver, a sigla do stackLibrary. */
export default function StackLogo({ name, size = 22, style }: { name: string; size?: number; style?: CSSProperties }) {
  const d = stackLogoPath(name)
  const def = findStack(name)
  const color = brandTint(def?.color)
  if (d) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" style={{ color, ...style }}>
        <path d={d} />
      </svg>
    )
  }
  return (
    <span aria-hidden="true" className="font-black leading-none" style={{ color, fontSize: size * 0.62, ...style }}>
      {def?.abbr || name.slice(0, 2)}
    </span>
  )
}
