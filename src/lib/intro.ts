import type { CSSProperties } from 'react'

/** Variáveis da entrada em CSS (classe `intro-in`, em globals.css): deslocamento vertical, duração e atraso.
    Usada no que aparece na primeira tela, para não depender do JavaScript para ficar visível. */
export const introIn = (y = 20, duration = 0.8, delay = 0) =>
  ({ '--in-y': `${y}px`, '--in-dur': `${duration}s`, '--in-delay': `${delay}s` }) as CSSProperties
