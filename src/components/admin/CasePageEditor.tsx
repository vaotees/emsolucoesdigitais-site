import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import ImageUploader from '@/components/ImageUploader'
import { CASE_ICONS, CASE_ICON_NAMES } from '@/lib/caseIcons'
import {
  CASE_KINDS,
  emptyBrandApplication,
  emptyBrandVariant,
  emptyCaseFont,
  emptyCaseItem,
  emptyCaseModule,
  type CaseContent,
} from '@/lib/caseContent'

/* Editor da aba "Página do case" (/admin/projects). Edita ClientProject.caseContent,
   usado pela rota /cases/[slug]. Tudo é validado de novo na API ao salvar. */

const inputCls =
  'w-full bg-white/5 border border-white/10 text-white rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500/50 placeholder-white/20 transition-all text-sm'

function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="block mb-1.5">
      <span className="text-sm text-white/60 font-medium">{children}</span>
      {hint && <span className="block text-xs text-white/30 mt-0.5">{hint}</span>}
    </span>
  )
}

function Text({ label, hint, value, onChange, placeholder }: { label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <Label hint={hint}>{label}</Label>
      <input className={inputCls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function Area({ label, hint, value, onChange, rows = 3, placeholder }: { label: string; hint?: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <label className="block">
      <Label hint={hint}>{label}</Label>
      <textarea className={`${inputCls} resize-y`} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <span className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="w-10 h-10 rounded-lg bg-transparent border border-white/10 cursor-pointer shrink-0" aria-label={label} />
        <input className={`${inputCls} font-mono`} value={value} onChange={(e) => onChange(e.target.value)} maxLength={7} />
      </span>
    </label>
  )
}

function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>Ícone</Label>
      <div className="grid grid-cols-10 gap-1 p-2 bg-white/5 border border-white/10 rounded-xl max-h-28 overflow-y-auto">
        {CASE_ICON_NAMES.map((name) => {
          const Icon = CASE_ICONS[name]
          return (
            <button
              key={name}
              type="button"
              title={name}
              onClick={() => onChange(name)}
              className={`h-8 rounded-lg flex items-center justify-center transition-all ${value === name ? 'bg-orange-500 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon className="w-4 h-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Section({ title, hint, children, defaultOpen = false }: { title: string; hint: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="bg-white/[0.03] border border-white/10 rounded-xl">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left" aria-expanded={open}>
        <span>
          <span className="block text-sm font-semibold text-white">{title}</span>
          <span className="block text-xs text-white/40 mt-0.5">{hint}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-white/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4">{children}</div>}
    </section>
  )
}

/** Barra de controles de um item de lista: mover para cima/baixo e remover. */
function ItemBar({ label, idx, total, onMove, onRemove }: { label: string; idx: number; total: number; onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono text-white/30">{label} {idx + 1}</span>
      <span className="flex items-center gap-1">
        <button type="button" onClick={() => onMove(-1)} disabled={idx === 0} className="p-1 text-white/30 hover:text-white disabled:opacity-20" aria-label="Mover para cima"><ChevronUp size={14} /></button>
        <button type="button" onClick={() => onMove(1)} disabled={idx === total - 1} className="p-1 text-white/30 hover:text-white disabled:opacity-20" aria-label="Mover para baixo"><ChevronDown size={14} /></button>
        <button type="button" onClick={onRemove} className="p-1 ml-1 text-white/30 hover:text-red-400" aria-label="Remover"><X size={14} /></button>
      </span>
    </div>
  )
}

function AddButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-1.5 text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors">
      <Plus className="w-3.5 h-3.5" />
      {children}
    </button>
  )
}

function move<T>(list: T[], idx: number, dir: -1 | 1): T[] {
  const next = [...list]
  const to = idx + dir
  if (to < 0 || to >= next.length) return list
  ;[next[idx], next[to]] = [next[to], next[idx]]
  return next
}

export default function CasePageEditor({ value, onChange, slug, stackTags }: { value: CaseContent; onChange: (v: CaseContent) => void; slug: string; stackTags: string }) {
  const c = value
  const set = (patch: Partial<CaseContent>) => onChange({ ...c, ...patch })
  const setTheme = (k: keyof CaseContent['theme'], v: string) => set({ theme: { ...c.theme, [k]: v } })
  const setFeatures = (patch: Partial<CaseContent['features']>) => set({ features: { ...c.features, ...patch } })
  const setAdmin = (patch: Partial<CaseContent['admin']>) => set({ admin: { ...c.admin, ...patch } })
  const setBrand = (patch: Partial<CaseContent['brand']>) => set({ brand: { ...c.brand, ...patch } })
  const setCta = (patch: Partial<CaseContent['cta']>) => set({ cta: { ...c.cta, ...patch } })
  const setFigma = (patch: Partial<CaseContent['figma']>) => set({ figma: { ...c.figma, ...patch } })
  const setListing = (patch: Partial<CaseContent['listing']>) => set({ listing: { ...c.listing, ...patch } })
  const setFacts = (patch: Partial<CaseContent['facts']>) => set({ facts: { ...c.facts, ...patch } })
  const tags = stackTags.split(',').map((t) => t.trim()).filter(Boolean)

  return (
    <div className="space-y-4">
      <p className="text-white/40 text-xs">
        Monta a página <span className="text-white/60">/cases/{slug || 'seu-projeto'}</span>. Título, textos de desafio e
        solução, destaques e mockup vêm das outras abas. Seções vazias não aparecem. A versão em inglês (/en) é gravada
        pelo script prisma/set-i18n-en.js (ver docs/i18n.md).
      </p>

      <Section title="Card na página de cases" hint="Capa, resumo e tipo do projeto em /cases (vale para todos os cases)">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <Label hint="Usado nos filtros de /cases">Tipo</Label>
            <select className={inputCls} value={c.listing.kind} onChange={(e) => setListing({ kind: e.target.value as CaseContent['listing']['kind'] })}>
              <option value="" className="bg-[#0F172A]">Automático (pela categoria)</option>
              {CASE_KINDS.map((k) => (
                <option key={k.id} value={k.id} className="bg-[#0F172A]">{k.label}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2.5 self-end pb-3 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" checked={c.listing.featured} onChange={(e) => setListing({ featured: e.target.checked })} className="w-4 h-4 accent-orange-500" />
            Case em destaque (aparece grande, no topo)
          </label>
        </div>
        <Text label="Resumo" hint="Uma frase, até 120 caracteres. Vazio: usa a tagline." value={c.listing.summary} onChange={(v) => setListing({ summary: v })} />
        <ImageUploader
          label="Capa"
          description="Fundo na cor do cliente com o site no desktop e no celular (gerada por tools/capas). Vazio: usa o mockup do card."
          aspectHint="Recomendado: 1600×1000 (16:10)"
          value={c.listing.cover}
          onChange={(url) => setListing({ cover: url || '' })}
        />
        <Text label="Descrição da capa (acessibilidade)" value={c.listing.coverAlt} onChange={(v) => setListing({ coverAlt: v })} />
        <Color label="Cor do brilho de fundo (tema escuro)" value={c.listing.accent || c.theme.accentDark} onChange={(v) => setListing({ accent: v })} />
      </Section>

      <Section title="Resumo em 30 segundos" hint="Período, equipe e números do projeto no topo do case (vale para todos os cases)">
        <div className="grid grid-cols-2 gap-3">
          <Text label="Período" hint="Ex.: abr–ago/2026. Vazio: usa o ano." value={c.facts.period} onChange={(v) => setFacts({ period: v })} />
          <Text label="Equipe" placeholder="Sozinho, do design ao deploy" value={c.facts.team} onChange={(v) => setFacts({ team: v })} />
        </div>
        {c.facts.numbers.map((n, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-end">
            <Text label={`Número ${idx + 1}`} placeholder="42" value={n.value} onChange={(v) => setFacts({ numbers: c.facts.numbers.map((x, i) => (i === idx ? { ...x, value: v } : x)) })} />
            <Text label="Legenda" placeholder="páginas" value={n.label} onChange={(v) => setFacts({ numbers: c.facts.numbers.map((x, i) => (i === idx ? { ...x, label: v } : x)) })} />
            <button type="button" onClick={() => setFacts({ numbers: c.facts.numbers.filter((_, i) => i !== idx) })} className="p-2.5 text-white/30 hover:text-red-400" aria-label="Remover número"><X size={14} /></button>
          </div>
        ))}
        {c.facts.numbers.length < 4 && <AddButton onClick={() => setFacts({ numbers: [...c.facts.numbers, { value: '', label: '' }] })}>Adicionar número</AddButton>}
      </Section>

      <Section title="Aparência e topo" hint="Cores da marca, aviso e botões do topo" defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <Color label="Cor de destaque (tema claro)" value={c.theme.accent} onChange={(v) => setTheme('accent', v)} />
          <Color label="Cor de destaque (tema escuro)" value={c.theme.accentDark} onChange={(v) => setTheme('accentDark', v)} />
          <Color label="Gradiente claro: início" value={c.theme.gradientFrom} onChange={(v) => setTheme('gradientFrom', v)} />
          <Color label="Gradiente claro: fim" value={c.theme.gradientTo} onChange={(v) => setTheme('gradientTo', v)} />
          <Color label="Gradiente escuro: início" value={c.theme.gradientDarkFrom} onChange={(v) => setTheme('gradientDarkFrom', v)} />
          <Color label="Gradiente escuro: fim" value={c.theme.gradientDarkTo} onChange={(v) => setTheme('gradientDarkTo', v)} />
          <Color label="Botão: fundo" value={c.theme.buttonBg} onChange={(v) => setTheme('buttonBg', v)} />
          <Color label="Botão: texto" value={c.theme.buttonFg} onChange={(v) => setTheme('buttonFg', v)} />
        </div>
        <Text label="Aviso abaixo do título" hint="Opcional. Ex.: marca fictícia, unidade da franquia." value={c.notice} onChange={(v) => set({ notice: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Text label="Botão principal" value={c.heroPrimaryLabel} onChange={(v) => set({ heroPrimaryLabel: v })} />
          <Text label="Botão secundário" value={c.heroSecondaryLabel} onChange={(v) => set({ heroSecondaryLabel: v })} />
        </div>
        <Text label="Etiqueta da imagem de compartilhamento" hint='Aparece acima do nome na imagem do WhatsApp/LinkedIn. Ex.: "Case de sucesso".' value={c.ogEyebrow} onChange={(v) => set({ ogEyebrow: v })} />
      </Section>

      <Section title={`O que foi entregue (${c.features.items.length})`} hint="Telas do projeto com descrição, lista e links">
        <div className="grid grid-cols-3 gap-3">
          <Text label="Etiqueta" value={c.features.eyebrow} onChange={(v) => setFeatures({ eyebrow: v })} />
          <Text label="Título" value={c.features.title} onChange={(v) => setFeatures({ title: v })} />
          <Text label="Parte em destaque" value={c.features.highlight} onChange={(v) => setFeatures({ highlight: v })} />
        </div>
        <Text label="Introdução" value={c.features.intro} onChange={(v) => setFeatures({ intro: v })} />
        <Area label="Nota no fim da seção" hint="Opcional. Ex.: como funciona a demonstração." value={c.features.note} onChange={(v) => setFeatures({ note: v })} rows={2} />

        {c.features.items.map((item, idx) => {
          const setItem = (patch: Partial<typeof item>) =>
            setFeatures({ items: c.features.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) })
          return (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <ItemBar
                label="Entrega"
                idx={idx}
                total={c.features.items.length}
                onMove={(dir) => setFeatures({ items: move(c.features.items, idx, dir) })}
                onRemove={() => setFeatures({ items: c.features.items.filter((_, i) => i !== idx) })}
              />
              <IconSelect value={item.icon} onChange={(v) => setItem({ icon: v })} />
              <Text label="Título" value={item.title} onChange={(v) => setItem({ title: v })} />
              <Area label="Descrição" value={item.description} onChange={(v) => setItem({ description: v })} />
              <Area label="Lista" hint="Um item por linha." value={item.bullets.join('\n')} onChange={(v) => setItem({ bullets: v.split('\n') })} rows={3} />
              <ImageUploader label="Tela" description="Captura da tela, exibida numa moldura de navegador." aspectHint="Recomendado: 1440×900 (16:10)" value={item.screen} onChange={(url) => setItem({ screen: url || '' })} />
              <Text label="Descrição da imagem (acessibilidade)" value={item.screenAlt} onChange={(v) => setItem({ screenAlt: v })} />
              <Text label="Link" hint="Opcional. Mostra o botão “Abrir …”." value={item.url} onChange={(v) => setItem({ url: v })} placeholder="https://" />
              <div className="grid grid-cols-2 gap-3">
                <Text label="Acesso de teste: e-mail" hint="Opcional. Para demonstrações públicas." value={item.loginEmail} onChange={(v) => setItem({ loginEmail: v })} />
                <Text label="Acesso de teste: senha" value={item.loginPassword} onChange={(v) => setItem({ loginPassword: v })} />
              </div>
            </div>
          )
        })}
        {c.features.items.length < 8 && <AddButton onClick={() => setFeatures({ items: [...c.features.items, emptyCaseItem()] })}>Adicionar entrega</AddButton>}
      </Section>

      <Section title={`Painel (${c.admin.modules.length})`} hint="Módulos do painel administrativo entregue ao cliente">
        <div className="grid grid-cols-3 gap-3">
          <Text label="Etiqueta" value={c.admin.eyebrow} onChange={(v) => setAdmin({ eyebrow: v })} />
          <Text label="Título" value={c.admin.title} onChange={(v) => setAdmin({ title: v })} />
          <Text label="Parte em destaque" value={c.admin.highlight} onChange={(v) => setAdmin({ highlight: v })} />
        </div>
        <Text label="Introdução" value={c.admin.intro} onChange={(v) => setAdmin({ intro: v })} />
        {c.admin.modules.map((m, idx) => {
          const setModule = (patch: Partial<typeof m>) =>
            setAdmin({ modules: c.admin.modules.map((x, i) => (i === idx ? { ...x, ...patch } : x)) })
          return (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <ItemBar
                label="Módulo"
                idx={idx}
                total={c.admin.modules.length}
                onMove={(dir) => setAdmin({ modules: move(c.admin.modules, idx, dir) })}
                onRemove={() => setAdmin({ modules: c.admin.modules.filter((_, i) => i !== idx) })}
              />
              <IconSelect value={m.icon} onChange={(v) => setModule({ icon: v })} />
              <Text label="Título" value={m.title} onChange={(v) => setModule({ title: v })} />
              <Area label="Descrição" value={m.description} onChange={(v) => setModule({ description: v })} rows={2} />
            </div>
          )
        })}
        {c.admin.modules.length < 12 && <AddButton onClick={() => setAdmin({ modules: [...c.admin.modules, emptyCaseModule()] })}>Adicionar módulo</AddButton>}
      </Section>

      <Section
        title={`Design no Figma${c.figma.fileUrl || c.figma.prototypeUrl ? '' : ' (vazio)'}`}
        hint="Arquivo e protótipo do Figma, com prévia. Aparece em todos os cases, inclusive os de página própria."
      >
        <p className="text-xs text-white/40">
          No Figma, em Share, deixe o arquivo como <span className="text-white/60">Anyone with the link · can view</span>. Sem isso, o visitante vê a
          tela de pedir acesso. Só links do figma.com são aceitos.
        </p>
        <Text label="Link do arquivo" placeholder="https://www.figma.com/design/…" value={c.figma.fileUrl} onChange={(v) => setFigma({ fileUrl: v })} />
        <Text
          label="Link do protótipo"
          hint="Abra o protótipo (▶), escolha o fluxo e copie o endereço da aba. Opcional: sem ele, a seção mostra o arquivo."
          placeholder="https://www.figma.com/proto/…"
          value={c.figma.prototypeUrl}
          onChange={(v) => setFigma({ prototypeUrl: v })}
        />
        <ImageUploader label="Prévia" description="Imagem mostrada antes de carregar o Figma. Ex.: o fluxo do protótipo exportado do próprio arquivo." aspectHint="Recomendado: 1600×1000 (16:10)" value={c.figma.preview} onChange={(url) => setFigma({ preview: url || '' })} />
        <Text label="Descrição da prévia (acessibilidade)" value={c.figma.previewAlt} onChange={(v) => setFigma({ previewAlt: v })} />
        <div className="grid grid-cols-3 gap-3">
          <Text label="Etiqueta" value={c.figma.eyebrow} onChange={(v) => setFigma({ eyebrow: v })} />
          <Text label="Título" value={c.figma.title} onChange={(v) => setFigma({ title: v })} />
          <Text label="Parte em destaque" value={c.figma.highlight} onChange={(v) => setFigma({ highlight: v })} />
        </div>
        <Area label="Texto" hint="O que o arquivo mostra: variables, componentes, fluxos do protótipo." value={c.figma.text} onChange={(v) => setFigma({ text: v })} rows={3} />
        {c.figma.stats.map((s, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-end">
            <Text label={`Número ${idx + 1}`} placeholder="17" value={s.value} onChange={(v) => setFigma({ stats: c.figma.stats.map((x, i) => (i === idx ? { ...x, value: v } : x)) })} />
            <Text label="Legenda" placeholder="componentes" value={s.label} onChange={(v) => setFigma({ stats: c.figma.stats.map((x, i) => (i === idx ? { ...x, label: v } : x)) })} />
            <button type="button" onClick={() => setFigma({ stats: c.figma.stats.filter((_, i) => i !== idx) })} className="p-2.5 text-white/30 hover:text-red-400" aria-label="Remover número"><X size={14} /></button>
          </div>
        ))}
        {c.figma.stats.length < 4 && <AddButton onClick={() => setFigma({ stats: [...c.figma.stats, { value: '', label: '' }] })}>Adicionar número</AddButton>}
      </Section>

      <Section title="Stack" hint="Uma frase sobre o papel de cada tecnologia no projeto">
        {tags.length === 0 ? (
          <p className="text-xs text-white/40">Escolha as tecnologias na aba Informações.</p>
        ) : (
          tags.map((tag) => (
            <Text
              key={tag}
              label={tag}
              hint="Em branco: usa a descrição padrão da biblioteca."
              value={c.stackNotes[tag] || ''}
              onChange={(v) => set({ stackNotes: { ...c.stackNotes, [tag]: v } })}
            />
          ))
        )}
      </Section>

      <Section
        title={`Identidade visual (${c.brand.authored ? 'criada por mim, ' : ''}${c.brand.colors.length} cores, ${c.brand.fonts.length} fontes)`}
        hint="Logo, conceito, paleta, tipografia, variações e aplicações reais. Marcada como criada por mim, a seção vem logo depois do resumo e o case entra em &quot;Marcas que criei&quot; (/cases)"
      >
        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <label className="flex items-center gap-2.5 pb-3 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" checked={c.brand.authored} onChange={(e) => setBrand({ authored: e.target.checked })} className="w-4 h-4 accent-orange-500" />
            Logo e identidade criados por mim (selo &quot;Identidade visual&quot; e faixa &quot;Marcas que criei&quot;)
          </label>
          <Text label="Ano" placeholder="2024" value={c.brand.year} onChange={(v) => setBrand({ year: v })} />
        </div>
        <Area label="Conceito" hint="2 ou 3 linhas sobre o que se vê no logo (formas, cores, letras) e a intenção. Até 500 caracteres." value={c.brand.concept} onChange={(v) => setBrand({ concept: v })} />
        <Text label="Introdução" value={c.brand.intro} onChange={(v) => setBrand({ intro: v })} />
        {c.brand.colors.map((color, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="grid grid-cols-3 gap-3">
              <Text label={`Cor ${idx + 1}: nome`} value={color.name} onChange={(v) => setBrand({ colors: c.brand.colors.map((x, i) => (i === idx ? { ...x, name: v } : x)) })} />
              <Color label="Código" value={color.hex || '#000000'} onChange={(v) => setBrand({ colors: c.brand.colors.map((x, i) => (i === idx ? { ...x, hex: v } : x)) })} />
              <Text label="Uso" value={color.usage} onChange={(v) => setBrand({ colors: c.brand.colors.map((x, i) => (i === idx ? { ...x, usage: v } : x)) })} />
            </div>
            <button type="button" onClick={() => setBrand({ colors: c.brand.colors.filter((_, i) => i !== idx) })} className="p-2.5 text-white/30 hover:text-red-400" aria-label="Remover cor"><X size={14} /></button>
          </div>
        ))}
        {c.brand.colors.length < 8 && <AddButton onClick={() => setBrand({ colors: [...c.brand.colors, { name: '', hex: '#000000', usage: '' }] })}>Adicionar cor</AddButton>}

        {c.brand.fonts.map((font, idx) => {
          const setFont = (patch: Partial<typeof font>) => setBrand({ fonts: c.brand.fonts.map((x, i) => (i === idx ? { ...x, ...patch } : x)) })
          return (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <ItemBar label="Fonte" idx={idx} total={c.brand.fonts.length} onMove={(dir) => setBrand({ fonts: move(c.brand.fonts, idx, dir) })} onRemove={() => setBrand({ fonts: c.brand.fonts.filter((_, i) => i !== idx) })} />
              <div className="grid grid-cols-2 gap-3">
                <Text label="Papel" placeholder="Títulos" value={font.role} onChange={(v) => setFont({ role: v })} />
                <Text label="Família (Google Fonts)" placeholder="Space Grotesk" value={font.family} onChange={(v) => setFont({ family: v })} />
                <Text label="Exemplo" value={font.sample} onChange={(v) => setFont({ sample: v })} />
                <Text label="Uso" value={font.usage} onChange={(v) => setFont({ usage: v })} />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-white/60">
                  Peso
                  <select className={`${inputCls} w-24`} value={font.weight} onChange={(e) => setFont({ weight: Number(e.target.value) })}>
                    {[300, 400, 500, 600, 700, 800, 900].map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-white/60">
                  <input type="checkbox" checked={font.italic} onChange={(e) => setFont({ italic: e.target.checked })} />
                  Itálico
                </label>
              </div>
            </div>
          )
        })}
        {c.brand.fonts.length < 4 && <AddButton onClick={() => setBrand({ fonts: [...c.brand.fonts, emptyCaseFont()] })}>Adicionar fonte</AddButton>}

        <div className="grid grid-cols-3 gap-3">
          <Text label="Logo (fundo claro)" hint="Imagem em /public ou https" value={c.brand.logo.src} onChange={(v) => setBrand({ logo: { ...c.brand.logo, src: v } })} />
          <Text label="Logo (fundo escuro)" hint="Vazio: o logo claro em branco. O mesmo arquivo do claro: cores originais" value={c.brand.logo.darkSrc} onChange={(v) => setBrand({ logo: { ...c.brand.logo, darkSrc: v } })} />
          <Text label="Descrição do logo" value={c.brand.logo.alt} onChange={(v) => setBrand({ logo: { ...c.brand.logo, alt: v } })} />
        </div>
        {c.brand.variants.map((v, idx) => {
          const setVariant = (patch: Partial<typeof v>) => setBrand({ variants: c.brand.variants.map((x, i) => (i === idx ? { ...x, ...patch } : x)) })
          return (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <ItemBar label="Variação" idx={idx} total={c.brand.variants.length} onMove={(dir) => setBrand({ variants: move(c.brand.variants, idx, dir) })} onRemove={() => setBrand({ variants: c.brand.variants.filter((_, i) => i !== idx) })} />
              <div className="grid grid-cols-[1fr_2fr] gap-3">
                <Text label="Nome" placeholder="Símbolo" value={v.label} onChange={(x) => setVariant({ label: x })} />
                <Text label="Arquivo" hint="Imagem em /public (ex.: /marcas/slug/simbolo.svg) ou https" value={v.src} onChange={(x) => setVariant({ src: x })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-white/60">
                <input type="checkbox" checked={v.dark} onChange={(e) => setVariant({ dark: e.target.checked })} />
                Mostrar em fundo escuro
              </label>
            </div>
          )
        })}
        {c.brand.variants.length < 6 && <AddButton onClick={() => setBrand({ variants: [...c.brand.variants, emptyBrandVariant()] })}>Adicionar variação do logo</AddButton>}

        {c.brand.applications.map((a, idx) => {
          const setApp = (patch: Partial<typeof a>) => setBrand({ applications: c.brand.applications.map((x, i) => (i === idx ? { ...x, ...patch } : x)) })
          return (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <ItemBar label="Aplicação real" idx={idx} total={c.brand.applications.length} onMove={(dir) => setBrand({ applications: move(c.brand.applications, idx, dir) })} onRemove={() => setBrand({ applications: c.brand.applications.filter((_, i) => i !== idx) })} />
              <div className="grid grid-cols-2 gap-3">
                <Text label="Onde" placeholder="Favicon e ícone do app" value={a.label} onChange={(x) => setApp({ label: x })} />
                <Text label="Imagem (opcional)" hint="Só uso real, nunca mockup inventado" value={a.src} onChange={(x) => setApp({ src: x })} />
              </div>
              <Text label="Detalhe" value={a.detail} onChange={(x) => setApp({ detail: x })} />
            </div>
          )
        })}
        {c.brand.applications.length < 6 && <AddButton onClick={() => setBrand({ applications: [...c.brand.applications, emptyBrandApplication()] })}>Adicionar aplicação real</AddButton>}

        <div className="grid grid-cols-2 gap-3">
          <Area label="Regras: faça" hint="Uma por linha" value={c.brand.rules.do.join('\n')} onChange={(v) => setBrand({ rules: { ...c.brand.rules, do: v.split('\n') } })} />
          <Area label="Regras: evite" hint="Uma por linha" value={c.brand.rules.dont.join('\n')} onChange={(v) => setBrand({ rules: { ...c.brand.rules, dont: v.split('\n') } })} />
        </div>
        <Text label="Voz da marca: introdução" value={c.brand.voice.intro} onChange={(v) => setBrand({ voice: { ...c.brand.voice, intro: v } })} />
        <div className="grid grid-cols-2 gap-3">
          <Area label="Personalidade" hint="Uma por linha" value={c.brand.voice.traits.join('\n')} onChange={(v) => setBrand({ voice: { ...c.brand.voice, traits: v.split('\n') } })} />
          <Area label="Tom" hint="Um por linha" value={c.brand.voice.tone.join('\n')} onChange={(v) => setBrand({ voice: { ...c.brand.voice, tone: v.split('\n') } })} />
        </div>
        <Text label="Guia de marca completo (link)" value={c.brand.guidelinesUrl} onChange={(v) => setBrand({ guidelinesUrl: v })} />
      </Section>

      <Section title="Chamada final" hint="Bloco com o botão de WhatsApp no fim da página">
        <div className="grid grid-cols-3 gap-3">
          <Text label="Etiqueta" value={c.cta.eyebrow} onChange={(v) => setCta({ eyebrow: v })} />
          <Text label="Título" value={c.cta.title} onChange={(v) => setCta({ title: v })} />
          <Text label="Parte em destaque" value={c.cta.highlight} onChange={(v) => setCta({ highlight: v })} />
        </div>
        <Area label="Texto" value={c.cta.text} onChange={(v) => setCta({ text: v })} rows={2} />
        <Area label="Mensagem pronta do WhatsApp" value={c.cta.whatsappText} onChange={(v) => setCta({ whatsappText: v })} rows={2} />
      </Section>
    </div>
  )
}
