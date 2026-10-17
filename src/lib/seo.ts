// Base pública do site — usada para montar URLs absolutas (crawlers de
// WhatsApp, LinkedIn e Facebook ignoram og:image relativo).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://emsolucoesdigitais.com.br').replace(/\/$/, '')
export const SITE_NAME = 'EM Soluções Digitais'

export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

interface OgImageParams {
  title: string
  eyebrow?: string
  subtitle?: string
}

// URL da imagem gerada por /api/og (ver src/pages/api/og.tsx).
export function ogImageUrl({ title, eyebrow, subtitle }: OgImageParams): string {
  const params = new URLSearchParams({ title })
  if (eyebrow) params.set('eyebrow', eyebrow)
  if (subtitle) params.set('subtitle', subtitle)
  return `${SITE_URL}/api/og?${params.toString()}`
}

// Primeira frase de um texto — bom para subtítulos curtos na imagem OG.
export function firstSentence(text: string): string {
  const match = text.trim().match(/^.+?[.!?](?=\s|$)/)
  return (match ? match[0] : text).trim()
}
