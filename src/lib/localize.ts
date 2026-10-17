import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n'

/* ─────────────────────────────────────────────
   Conteúdo do banco no idioma da página.
   Cada tabela pública tem a coluna i18n: { "en": { campo: "texto", … }, "es": { … } }, gravada por prisma/set-i18n-<idioma>.js.
   O que não estiver traduzido (ausente ou vazio) aparece em português. Ver docs/i18n.md.
───────────────────────────────────────────── */

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => Boolean(v) && typeof v === 'object' && !Array.isArray(v)

/** Sobrepõe a tradução ao original: textos vazios ficam no original, objetos são mesclados
    e listas seguem a posição (o item 2 traduz o item 2). */
export function overlay<T>(base: T, patch: unknown): T {
  if (patch === undefined || patch === null || patch === '') return base
  if (Array.isArray(base) && Array.isArray(patch)) {
    return base.map((item, i) => overlay(item, patch[i])) as T
  }
  if (isObj(base) && isObj(patch)) {
    const out: Obj = { ...base }
    for (const [k, v] of Object.entries(patch)) out[k] = k in base ? overlay(base[k], v) : v
    return out as T
  }
  if (isObj(patch) || Array.isArray(patch)) return (base ?? patch) as T
  return (typeof base === typeof patch || base === undefined || base === null ? patch : base) as T
}

/** Tradução de uma linha no idioma pedido (ou nada, em português). */
export const translationOf = (row: { i18n?: unknown } | null | undefined, locale: Locale): Obj | null => {
  if (!row || locale === DEFAULT_LOCALE || !isObj(row.i18n)) return null
  const t = row.i18n[locale]
  return isObj(t) ? t : null
}

/** Linha do banco no idioma pedido. A coluna i18n sai do resultado: não vai para a página. */
export function localizeRow<T extends { i18n?: unknown }>(row: T, locale: Locale): Omit<T, 'i18n'> {
  const { i18n: _drop, ...rest } = row
  const t = translationOf(row, locale)
  return t ? overlay(rest as Omit<T, 'i18n'>, t) : (rest as Omit<T, 'i18n'>)
}

export const localizeRows = <T extends { i18n?: unknown }>(rows: T[], locale: Locale) => rows.map((r) => localizeRow(r, locale))

/** Projeto (ClientProject) no idioma pedido. Os destaques técnicos são regravados pelo admin a cada edição,
    então a tradução deles fica no projeto, indexada pelo título em português: i18n.en.highlights["Título"] = { title, body }. */
export function localizeProject<T extends { i18n?: unknown; highlights?: { title: string; body: string }[] }>(project: T, locale: Locale) {
  const t = translationOf(project, locale)
  const { highlights: hl, ...fields } = t || {}
  const out = localizeRow({ ...project, i18n: t ? { [locale]: fields } : null }, locale) as Omit<T, 'i18n'>
  if (Array.isArray(project.highlights) && isObj(hl)) {
    ;(out as { highlights?: unknown[] }).highlights = project.highlights.map((h) => overlay(h, hl[h.title]))
  }
  return out
}
