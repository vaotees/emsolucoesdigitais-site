/* Seção de serviços da home: grupos, animações disponíveis e validação dos campos extras do modelo Feature.
   Usado pela API (/api/features), pelo admin (/admin/features) e pela home (FeaturesGrid). */

export const SERVICE_GROUPS = [
  { id: 'principal', label: 'Principal (card grande, com animação de interface)' },
  { id: 'complementar', label: 'Complementar (faixa menor, com ícone animado)' },
] as const
export type ServiceGroup = (typeof SERVICE_GROUPS)[number]['id']

export const SERVICE_VISUALS = [
  { id: 'apps', group: 'principal', label: 'Aplicativo: código, painel e celular (botão Rodar)' },
  { id: 'sites', group: 'principal', label: 'Site: arraste do wireframe ao site pronto' },
  { id: 'landing', group: 'principal', label: 'Landing page: o botão vira pedido no WhatsApp' },
  { id: 'design', group: 'principal', label: 'Design system: os modos trocam a identidade da tela' },
  { id: 'ia', group: 'complementar', label: 'Ícone: conversa digitando' },
  { id: 'trafego', group: 'complementar', label: 'Ícone: seta no alvo' },
  { id: 'social', group: 'complementar', label: 'Ícone: pontos que se conectam' },
] as const
export type ServiceVisual = (typeof SERVICE_VISUALS)[number]['id']

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

/** Campos extras de um serviço vindos do admin, validados antes de gravar. */
export function serviceExtras(body: Record<string, unknown>) {
  const group = SERVICE_GROUPS.some((g) => g.id === body.group) ? (body.group as ServiceGroup) : 'principal'
  const visual = SERVICE_VISUALS.some((v) => v.id === body.visual) ? (body.visual as string) : ''
  const deliverables = str(body.deliverables, 400)
    .split('\n')
    .map((l) => l.trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 4)
    .join('\n')
  const proofCases = str(body.proofCases, 200)
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[a-z0-9-]{2,60}$/.test(s))
    .slice(0, 3)
    .join(',')
  return { group, visual, deliverables, proofCases }
}
