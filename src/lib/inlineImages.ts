// Imagens precisam ser arquivos (Vercel Blob), nunca base64 gravado no banco:
// um data: URI vai inteiro para o HTML e para o __NEXT_DATA__ de cada página
// (o /cases chegou a 13 MB e o LinkedIn recusa páginas acima de 3 MB).

export const PROJECT_IMAGE_FIELDS = ['mockupCardUrl', 'mockupHeroUrl', 'logoUrl'] as const

export function findInlineImageField(body: unknown, fields: readonly string[]): string | null {
  if (!body || typeof body !== 'object') return null
  for (const field of fields) {
    const value = (body as Record<string, unknown>)[field]
    if (typeof value === 'string' && value.trimStart().startsWith('data:')) return field
  }
  return null
}

export function inlineImageError(field: string): string {
  return `O campo "${field}" recebeu uma imagem em base64. Envie a imagem pelo upload para que só a URL seja salva.`
}
