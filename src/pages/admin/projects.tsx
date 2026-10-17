import AdminLayout from "../../components/AdminLayout"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  Plus, Pencil, Trash2, X, Check, Loader2, ChevronUp, ChevronDown,
  ExternalLink, Eye, EyeOff, Building2, ImageIcon, Tag, FileText,
  Lightbulb, Save, RefreshCw, AlertCircle, Upload, XCircle, Search, LayoutTemplate
} from "lucide-react"
import CasePageEditor from "../../components/admin/CasePageEditor"
import { normalizeCaseContent, type CaseContent } from "../../lib/caseContent"
import { CASE_ICONS, CASE_ICON_NAMES } from "../../lib/caseIcons"
import { STACK_LIBRARY, findStack, getCategories, type StackDef } from "../../lib/stackLibrary"

/* ─────────────────────────────────────────────────────────────
   Types
──────────────────────────────────────────────────────────────*/
interface Highlight {
  id?: string
  iconName: string
  title: string
  body: string
  order?: number
}

interface ClientProject {
  id: string
  slug: string
  order?: number
  category: string
  clientName: string
  tagline: string
  description: string
  role: string
  status: string
  year: string
  liveUrl: string
  caseUrl: string
  mockupCardUrl?: string | null
  mockupHeroUrl?: string | null
  stackTags: string
  challengeText: string
  solutionText: string
  impactText: string
  brandGuidelinesUrl: string
  logoUrl: string
  logoDownloadUrl: string
  brandColors: string
  brandFontHeading: string
  brandFontBody: string
  published: boolean
  highlights: Highlight[]
  caseContent?: unknown
  createdAt?: string
}


const emptyHighlight = (): Highlight => ({ iconName: "Zap", title: "", body: "" })

type ProjectForm = Omit<ClientProject, "id" | "order" | "createdAt" | "caseContent"> & { caseContent: CaseContent }

const emptyForm = (): ProjectForm => ({
  slug: "",
  category: "",
  clientName: "",
  tagline: "",
  description: "",
  role: "",
  status: "Em Produção",
  year: new Date().getFullYear().toString(),
  liveUrl: "",
  caseUrl: "",
  mockupCardUrl: "",
  mockupHeroUrl: "",
  stackTags: "",
  challengeText: "",
  solutionText: "",
  impactText: "",
  brandGuidelinesUrl: "",
  logoUrl: "",
  logoDownloadUrl: "",
  brandColors: "",
  brandFontHeading: "Playfair Display",
  brandFontBody: "Montserrat",
  published: true,
  highlights: [emptyHighlight()],
  caseContent: normalizeCaseContent(undefined) as CaseContent,
})

/* ─────────────────────────────────────────────────────────────
   Tabs
──────────────────────────────────────────────────────────────*/
const TABS = [
  { id: "info", label: "Informações", icon: Building2 },
  { id: "content", label: "Conteúdo", icon: FileText },
  { id: "highlights", label: "Destaques", icon: Lightbulb },
  { id: "media", label: "Mídia & Links", icon: ImageIcon },
  { id: "brand", label: "Marca & Brand", icon: Tag },
  { id: "page", label: "Página do case", icon: LayoutTemplate },
]

/* ─────────────────────────────────────────────────────────────
   Field helpers
──────────────────────────────────────────────────────────────*/
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm text-white/60 mb-1.5 font-medium">{label}</label>
      {children}
      {hint && <p className="text-white/30 text-xs mt-1">{hint}</p>}
    </div>
  )
}

function Input({
  value, onChange, placeholder, disabled
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none
        focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 placeholder-white/20
        transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    />
  )
}

function Textarea({
  value, onChange, placeholder, rows = 4
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none
        focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 placeholder-white/20
        transition-all resize-none"
    />
  )
}

/* ─────────────────────────────────────────────────────────────
   Icon picker
──────────────────────────────────────────────────────────────*/
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1.5 p-3 bg-white/5 border border-white/10 rounded-xl max-h-40 overflow-y-auto">
      {CASE_ICON_NAMES.map(icon => {
        const Ic = CASE_ICONS[icon]
        return (
          <button
            key={icon}
            title={icon}
            type="button"
            onClick={() => onChange(icon)}
            className={`h-9 rounded-lg flex items-center justify-center transition-all ${
              value === icon
                ? "bg-orange-500 text-white"
                : "text-white/40 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Ic className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Stack Badge — shared display component
──────────────────────────────────────────────────────────────*/
export function StackBadge({ name, size = "sm" }: { name: string; size?: "sm" | "xs" }) {
  const def = findStack(name)
  const bgColor = def?.color ?? "#3a3a3a"
  const fgColor = def?.fg ?? "#ffffff"
  const abbr = def?.abbr ?? name.slice(0, 2).toUpperCase()
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/10
      ${ size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs" } font-medium`}
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      <span
        className={`rounded font-bold flex items-center justify-center flex-shrink-0
          ${ size === "xs" ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[9px]" }`}
        style={{ background: bgColor, color: fgColor }}
      >
        {abbr}
      </span>
      <span className="text-white/70">{name}</span>
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   Stack Picker — visual multi-select from library
──────────────────────────────────────────────────────────────*/
interface StackPickerProps {
  value: string       // comma-separated list of stack names
  onChange: (v: string) => void
}

function StackPicker({ value, onChange }: StackPickerProps) {
  const [search, setSearch] = useState("")
  const [customInput, setCustomInput] = useState("")
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["Framework", "Banco de Dados"]))

  const selected = value ? value.split(",").map(s => s.trim()).filter(Boolean) : []
  const categories = getCategories()

  const toggle = (name: string) => {
    const idx = selected.findIndex(s => s.toLowerCase() === name.toLowerCase())
    let next: string[]
    if (idx >= 0) {
      next = selected.filter((_, i) => i !== idx)
    } else {
      next = [...selected, name]
    }
    onChange(next.join(","))
  }

  const isSelected = (name: string) =>
    selected.some(s => s.toLowerCase() === name.toLowerCase())

  const addCustom = () => {
    const t = customInput.trim()
    if (!t) return
    if (!isSelected(t)) {
      onChange([...selected, t].join(","))
    }
    setCustomInput("")
  }

  const toggleCat = (cat: string) => {
    const next = new Set(expandedCats)
    next.has(cat) ? next.delete(cat) : next.add(cat)
    setExpandedCats(next)
  }

  const filtered = search.trim()
    ? STACK_LIBRARY.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
      )
    : null // null = show by category

  return (
    <div className="space-y-3">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(name => {
            const def = findStack(name)
            return (
              <button
                key={name}
                type="button"
                onClick={() => toggle(name)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                  bg-white/10 border border-white/20 text-xs font-medium text-white
                  hover:bg-red-500/20 hover:border-red-500/30 transition-all group"
              >
                <span
                  className="w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center flex-shrink-0"
                  style={{ background: def?.color ?? "#555", color: def?.fg ?? "#fff" }}
                >
                  {def?.abbr ?? name.slice(0, 2)}
                </span>
                {name}
                <X className="w-3 h-3 text-white/40 group-hover:text-red-400 transition-colors" />
              </button>
            )
          })}
        </div>
      )}

      {/* Search + custom add row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar tecnologia..."
            className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl
              pl-9 pr-4 py-2 outline-none focus:border-orange-500/50 placeholder-white/20 transition-all"
          />
        </div>
        <div className="flex gap-1">
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustom()}
            placeholder="Personalizado..."
            className="w-36 bg-white/5 border border-white/10 text-white text-sm rounded-xl
              px-3 py-2 outline-none focus:border-orange-500/50 placeholder-white/20 transition-all"
          />
          <button
            type="button"
            onClick={addCustom}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/60 hover:text-white
              text-sm transition-all border border-white/10"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Library grid */}
      <div className="border border-white/10 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
        {filtered ? (
          /* Search results — flat grid */
          <div className="p-3 grid grid-cols-2 gap-1.5">
            {filtered.length === 0 ? (
              <p className="col-span-2 text-center text-white/30 text-sm py-4">Nenhuma tecnologia encontrada.</p>
            ) : filtered.map(s => (
              <StackItem key={s.name} def={s} selected={isSelected(s.name)} onToggle={() => toggle(s.name)} />
            ))}
          </div>
        ) : (
          /* Categorized view */
          categories.map(cat => {
            const items = STACK_LIBRARY.filter(s => s.category === cat)
            const isOpen = expandedCats.has(cat)
            return (
              <div key={cat} className="border-b border-white/5 last:border-0">
                <button
                  type="button"
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center justify-between px-4 py-2.5
                    text-xs font-semibold text-white/40 uppercase tracking-wider
                    hover:bg-white/5 hover:text-white/60 transition-all"
                >
                  <span>{cat}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-white/20 normal-case font-normal tracking-normal">
                      {items.filter(s => isSelected(s.name)).length}/{items.length}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
                    {items.map(s => (
                      <StackItem key={s.name} def={s} selected={isSelected(s.name)} onToggle={() => toggle(s.name)} />
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function StackItem({ def, selected, onToggle }: { def: StackDef; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left
        ${ selected
          ? "bg-orange-500/15 border border-orange-500/30 text-white"
          : "bg-white/[0.03] border border-white/5 text-white/60 hover:bg-white/8 hover:text-white hover:border-white/15"
        }`}
    >
      <span
        className="w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center flex-shrink-0"
        style={{ background: def.color, color: def.fg }}
      >
        {def.abbr}
      </span>
      <span className="truncate">{def.name}</span>
      {selected && <Check className="w-3 h-3 text-orange-400 ml-auto flex-shrink-0" />}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────
   ImageUploader – drag-drop + file picker + preview
──────────────────────────────────────────────────────────────*/
interface ImageUploaderProps {
  label: string
  description: string
  aspectHint: string // e.g. "Proporção: 4:3 (card)"
  value: string | null | undefined
  onChange: (url: string | null) => void
  /** Quando true, mostra prévia dupla (fundo claro + escuro) — ideal para logos PNG/SVG */
  isLogo?: boolean
}

function ImageUploader({ label, description, aspectHint, value, onChange, isLogo }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("Apenas imagens são permitidas.")
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Tamanho máximo: 8MB.")
      return
    }

    setUploading(true)
    setUploadError("")

    try {
      // Read as base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, filename: file.name }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro no upload")
      onChange(data.url)
    } catch (err: any) {
      setUploadError(err.message || "Erro ao fazer upload.")
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset input so same file can be re-selected
    e.target.value = ""
  }

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label className="block text-sm text-white/60 font-medium">{label}</label>
        <span className="text-[10px] text-white/25 font-mono">{aspectHint}</span>
      </div>

      {/* Description */}
      <p className="text-white/30 text-xs">{description}</p>

      {/* Drop zone / Preview */}
      {value ? (
        /* ── Has image — show preview ── */
        <div className="space-y-2">
          {isLogo ? (
            /* Logo: prévia dupla — fundo claro + fundo escuro */
            <div className="grid grid-cols-2 gap-2">
              {/* Fundo claro */}
              <div className="relative rounded-xl border border-white/10 bg-white flex items-center justify-center p-4 min-h-[100px] group overflow-hidden">
                <img src={value} alt="Logo fundo claro" className="max-h-16 w-auto object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                <span className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] text-black/30 font-medium">Fundo claro</span>
              </div>
              {/* Fundo escuro */}
              <div className="relative rounded-xl border border-white/10 bg-[#0f1117] flex items-center justify-center p-4 min-h-[100px] group overflow-hidden">
                <img src={value} alt="Logo fundo escuro" className="max-h-16 w-auto object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                <span className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] text-white/30 font-medium">Fundo escuro</span>
              </div>
            </div>
          ) : (
            /* Imagem normal */
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <img
                src={value}
                alt={label}
                className="w-full object-cover max-h-52"
                onError={e => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            </div>
          )}
          {/* Ações */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/8 hover:bg-white/15
                text-white/60 hover:text-white text-xs font-medium transition-all border border-white/10"
            >
              <Upload className="w-3.5 h-3.5" />
              Trocar
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20
                text-red-400 text-xs font-medium transition-all border border-red-500/20"
            >
              <XCircle className="w-3.5 h-3.5" />
              Remover
            </button>
          </div>
        </div>
      ) : (
        /* ── No image — drop zone ── */
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer
            flex flex-col items-center justify-center gap-3 py-10 px-6
            ${dragOver
              ? "border-orange-500 bg-orange-500/10"
              : "border-white/15 hover:border-orange-500/50 hover:bg-white/[0.03]"
            }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              <p className="text-white/50 text-sm">Enviando imagem...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-white/40" />
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm font-medium">
                  {dragOver ? "Solte a imagem aqui" : "Clique ou arraste a imagem"}
                </p>
                <p className="text-white/25 text-xs mt-0.5">PNG, JPG, WebP — máx. 8MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <p className="text-red-400 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {uploadError}
        </p>
      )}

      {/* Hidden input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}


/* ─────────────────────────────────────────────────────────────
   Brand Accordion (Marca & Brand tab)
──────────────────────────────────────────────────────────────*/
type BrandAccordionProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setForm: (fn: (f: any) => any) => void
}

function BrandAccordion({ form, setForm }: BrandAccordionProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({ '01': true, '02': true, '03': false })
  const toggle = (id: string) => setOpen(o => ({ ...o, [id]: !o[id] }))

  const sections = [
    {
      id: '01',
      gradient: 'linear-gradient(135deg,#dd5289,#553398)',
      label: 'Logo & Identidade',
      desc: 'Controla as 4 variações de logo exibidas na página.',
      content: (
        <div className="p-5 space-y-4">
          <ImageUploader
            label="Logo do Cliente"
            description="PNG ou SVG com fundo transparente. Será exibida nas 4 variantes do Brand Guidelines (colorida, reversa, gradiente, monocromático) usando apenas filtros CSS — sem modificar o arquivo."
            aspectHint="PNG transparente recomendado"
            value={form.logoUrl}
            onChange={(url: string | null) => setForm((f: typeof form) => ({ ...f, logoUrl: url || '' }))}
            isLogo
          />
          <Field label="URL das Brand Guidelines (externo)" hint="Link para a página completa de brand guidelines do cliente — referência interna.">
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="url"
                value={form.brandGuidelinesUrl}
                onChange={e => setForm((f: typeof form) => ({ ...f, brandGuidelinesUrl: e.target.value }))}
                placeholder="https://cliente.com/brand-guidelines"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5
                  outline-none focus:border-orange-500/50 placeholder-white/20 transition-all"
              />
            </div>
          </Field>
        </div>
      ),
    },
    {
      id: '02',
      gradient: 'linear-gradient(135deg,#e9a86b,#dd5289)',
      label: 'Paleta de Cores',
      desc: "Controla os swatches — o gradiente é gerado pelas 3 primeiras cores.",
      content: (
        <div className="p-5 space-y-4">
          <Field
            label="Cores da Marca (JSON)"
            hint='[{"name":"Amber","hex":"#e9a86b","fg":"#000"}, ...] — "fg" é a cor do texto sobre o swatch.'
          >
            <textarea
              value={form.brandColors}
              onChange={e => setForm((f: typeof form) => ({ ...f, brandColors: e.target.value }))}
              rows={7}
              placeholder={'[\n  {"name": "Amber", "hex": "#e9a86b", "fg": "#000000"},\n  {"name": "Rose", "hex": "#dd5289", "fg": "#ffffff"},\n  {"name": "Primary", "hex": "#553398", "fg": "#ffffff"},\n  {"name": "Dark Navy", "hex": "#363e51", "fg": "#ffffff"},\n  {"name": "Off White", "hex": "#f5f2f0", "fg": "#000000"}\n]'}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 outline-none
                focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 placeholder-white/20
                transition-all resize-none font-mono text-xs"
            />
          </Field>
          {(() => {
            try {
              const colors: Array<{ name: string; hex: string }> = JSON.parse(form.brandColors || '[]')
              if (!colors.length) return null
              return (
                <div>
                  <p className="text-white/40 text-xs mb-2">Preview ao vivo:</p>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-xl border border-white/10 shadow" style={{ background: c.hex }} title={c.hex} />
                        <span className="text-[9px] font-mono text-white/35">{c.hex}</span>
                        <span className="text-[9px] text-white/55 max-w-[44px] text-center leading-tight">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            } catch {
              return <p className="text-red-400/80 text-xs">JSON inválido — verifique a sintaxe.</p>
            }
          })()}
        </div>
      ),
    },
    {
      id: '03',
      gradient: 'linear-gradient(135deg,#8b5ac8,#553398)',
      label: 'Tipografia',
      desc: 'Define as fontes Heading e Body — devem estar no Google Fonts.',
      content: (
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fonte do Heading / Display" hint="Ex: Playfair Display, Cormorant, Merriweather">
              <input
                type="text"
                value={form.brandFontHeading}
                onChange={e => setForm((f: typeof form) => ({ ...f, brandFontHeading: e.target.value }))}
                placeholder="Playfair Display"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5
                  outline-none focus:border-orange-500/50 placeholder-white/20 transition-all"
              />
            </Field>
            <Field label="Fonte do Body / UI" hint="Ex: Montserrat, Inter, Nunito">
              <input
                type="text"
                value={form.brandFontBody}
                onChange={e => setForm((f: typeof form) => ({ ...f, brandFontBody: e.target.value }))}
                placeholder="Montserrat"
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5
                  outline-none focus:border-orange-500/50 placeholder-white/20 transition-all"
              />
            </Field>
          </div>
          {(form.brandFontHeading || form.brandFontBody) && (
            <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 flex gap-6">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Heading</p>
                <p style={{ fontFamily: `"${form.brandFontHeading}", serif`, fontSize: '26px', fontWeight: 900, color: '#fff', lineHeight: 1.2 }} className="truncate">
                  {form.brandFontHeading || '–'}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Body</p>
                <p style={{ fontFamily: `"${form.brandFontBody}", sans-serif`, fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                  {form.brandFontBody || '–'} — Texto de parágrafo e UI.
                </p>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-3">
      {/* descriptor */}
      <div className="flex items-center gap-2 pb-3 border-b border-white/8">
        <Tag className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        <p className="text-xs text-white/45">
          Clique em cada seção para expandir e editar.{' '}
          <span className="text-orange-400/70 font-mono">/cases/cm-imoveis#brand</span>
        </p>
      </div>

      {/* Editable accordion sections */}
      {sections.map(s => (
        <div key={s.id} className="rounded-xl border border-white/8 overflow-hidden">
          {/* Header — clickable */}
          <button
            type="button"
            onClick={() => toggle(s.id)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.06] active:bg-white/[0.04]"
            style={{ background: open[s.id] ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)' }}
          >
            <span className="w-7 h-7 rounded-full text-[10px] font-black flex items-center justify-center shrink-0"
              style={{ background: s.gradient, color: '#fff' }}>{s.id}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-white leading-none mb-0.5">{s.label}</p>
              <p className="text-[10px] text-white/35 leading-relaxed">{s.desc}</p>
            </div>
            <ChevronDown
              className="w-4 h-4 text-white/30 shrink-0 transition-transform duration-200"
              style={{ transform: open[s.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {/* Content — collapsible */}
          <div
            style={{
              maxHeight: open[s.id] ? '1200px' : '0px',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease',
            }}
          >
            <div className="border-t border-white/8">
              {s.content}
            </div>
          </div>
        </div>
      ))}

      {/* Informational 04–06 */}
      <div className="rounded-xl border border-white/8 bg-white/[0.015] px-4 py-3 space-y-2">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Geradas automaticamente</p>
        {[
          { n: '04', label: 'Design Tokens', desc: 'Border radius, sombras e espaçamento — sistema padrão.' },
          { n: '05', label: 'Componentes', desc: 'Botões, badges e card — usam as cores da seção 02.' },
          { n: '06', label: 'Wireframes', desc: '5 telas estruturais (Home, Listagem, Detalhe, Contato, Admin).' },
        ].map(s => (
          <div key={s.n} className="flex items-start gap-3 py-1.5">
            <span className="w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)' }}>{s.n}</span>
            <div>
              <p className="text-xs font-semibold text-white/35">{s.label}</p>
              <p className="text-[10px] text-white/20 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main Page
──────────────────────────────────────────────────────────────*/
export default function AdminProjects() {
  const [projects, setProjects] = useState<ClientProject[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  // drawer / form
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [activeTab, setActiveTab] = useState("info")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const nameRef = useRef<HTMLInputElement>(null)

  /* ── Load ──────────────────────────────── */
  const load = () => {
    setLoading(true)
    fetch("/api/projects")
      .then(r => r.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    if (drawerOpen) setTimeout(() => nameRef.current?.focus(), 80)
  }, [drawerOpen])

  /* ── Drawer helpers ─────────────────────── */
  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm())
    setError("")
    setSuccess("")
    setActiveTab("info")
    setDrawerOpen(true)
  }

  const openEdit = (p: ClientProject) => {
    setEditingId(p.id)
    setForm({
      slug: p.slug,
      category: p.category,
      clientName: p.clientName,
      tagline: p.tagline,
      description: p.description,
      role: p.role,
      status: p.status,
      year: p.year,
      liveUrl: p.liveUrl,
      caseUrl: p.caseUrl,
      mockupCardUrl: p.mockupCardUrl || "",
      mockupHeroUrl: p.mockupHeroUrl || "",
      stackTags: p.stackTags,
      challengeText: p.challengeText,
      solutionText: p.solutionText,
      impactText: p.impactText,
      brandGuidelinesUrl: p.brandGuidelinesUrl || "",
      logoUrl: p.logoUrl || "",
      logoDownloadUrl: p.logoDownloadUrl || "",
      brandColors: p.brandColors || "",
      brandFontHeading: p.brandFontHeading || "Playfair Display",
      brandFontBody: p.brandFontBody || "Montserrat",
      published: p.published,
      highlights: p.highlights.length ? p.highlights : [emptyHighlight()],
      caseContent: normalizeCaseContent(p.caseContent),
    })
    setError("")
    setSuccess("")
    setActiveTab("info")
    setDrawerOpen(true)
  }

  const closeDrawer = () => { setDrawerOpen(false); setError(""); setSuccess("") }

  /* ── Save ─────────────────────────────────*/
  const handleSave = async () => {
    if (!form.clientName.trim() || !form.slug.trim()) {
      setError("Nome do cliente e slug são obrigatórios.")
      setActiveTab("info")
      return
    }
    setSaving(true); setError(""); setSuccess("")
    try {
      const url = editingId ? `/api/projects/${editingId}` : "/api/projects"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro desconhecido")
      setSuccess("Projeto salvo com sucesso!")
      load()
      setTimeout(closeDrawer, 800)
    } catch (err: any) {
      setError(err.message || "Erro ao salvar. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete ───────────────────────────────*/
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir o projeto "${name}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(id)
    try {
      await fetch(`/api/projects/${id}`, { method: "DELETE" })
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch { alert("Erro ao excluir.") }
    finally { setDeleting(null) }
  }

  /* ── Toggle published ─────────────────── */
  const handleToggle = async (p: ClientProject) => {
    setToggling(p.id)
    try {
      await fetch(`/api/projects/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, published: !p.published }),
      })
      setProjects(prev => prev.map(x => x.id === p.id ? { ...x, published: !x.published } : x))
    } catch { alert("Erro ao alternar visibilidade.") }
    finally { setToggling(null) }
  }

  /* ── Reorder ──────────────────────────── */
  const reorder = async (idx: number, dir: "up" | "down") => {
    const arr = [...projects]
    if (dir === "up" && idx === 0) return
    if (dir === "down" && idx === arr.length - 1) return
    const swap = dir === "up" ? idx - 1 : idx + 1
    const tmp = arr[idx]; arr[idx] = arr[swap]; arr[swap] = tmp
    setProjects(arr)
    try {
      await fetch("/api/projects/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: arr.map(p => p.id) }),
      })
    } catch (e) { console.error(e) }
  }

  /* ── Highlight helpers ─────────────────── */
  const setHL = (idx: number, field: keyof Highlight, val: string) => {
    const hs = [...form.highlights]
    hs[idx] = { ...hs[idx], [field]: val }
    setForm({ ...form, highlights: hs })
  }
  const addHL = () => setForm({ ...form, highlights: [...form.highlights, emptyHighlight()] })
  const removeHL = (idx: number) => {
    if (form.highlights.length === 1) return
    setForm({ ...form, highlights: form.highlights.filter((_, i) => i !== idx) })
  }
  const moveHL = (idx: number, dir: "up" | "down") => {
    const hs = [...form.highlights]
    if (dir === "up" && idx === 0) return
    if (dir === "down" && idx === hs.length - 1) return
    const swap = dir === "up" ? idx - 1 : idx + 1
    const tmp = hs[idx]; hs[idx] = hs[swap]; hs[swap] = tmp
    setForm({ ...form, highlights: hs })
  }

  /* ── Auto-slug ────────────────────────── */
  const autoSlug = (name: string) =>
    name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-")

  /* ─────────────────────────────────────────
     Render
  ──────────────────────────────────────────*/
  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">

        {/* ── Page header ──────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Projetos de Clientes</h1>
            <p className="text-white/50">
              Gerencie todos os cases exibidos na página /cases e nos case studies.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="p-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all"
              title="Recarregar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600
                hover:from-orange-600 hover:to-orange-700 text-white px-5 py-2.5 rounded-xl
                font-semibold text-sm transition-all shadow-lg shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              Novo Projeto
            </button>
          </div>
        </div>

        {/* ── Stats ────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total de Projetos", value: projects.length },
            { label: "Publicados", value: projects.filter(p => p.published).length },
            { label: "Rascunhos", value: projects.filter(p => !p.published).length },
          ].map(s => (
            <div key={s.label} className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <p className="text-white/50 text-sm mb-1">{s.label}</p>
              <p className="text-3xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Projects list ────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-white/40">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            Carregando projetos...
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-white/40
            border border-dashed border-white/15 rounded-2xl gap-4"
          >
            <Building2 className="w-14 h-14 opacity-40" />
            <div className="text-center">
              <p className="font-semibold text-lg">Nenhum projeto cadastrado</p>
              <p className="text-sm mt-1">Clique em "Novo Projeto" para começar.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project, idx) => {
              const isDeleting = deleting === project.id
              const isToggling = toggling === project.id
              return (
                <div
                  key={project.id}
                  className={`bg-white/5 border rounded-2xl p-5 flex items-center gap-4
                    hover:bg-white/8 transition-all group relative
                    ${project.published ? "border-white/10" : "border-white/5 opacity-60"}`}
                >
                  {/* Order controls */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => reorder(idx, "up")} disabled={idx === 0}
                      className="text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                      <ChevronUp size={15} />
                    </button>
                    <button onClick={() => reorder(idx, "down")} disabled={idx === projects.length - 1}
                      className="text-white/40 hover:text-white disabled:opacity-20 transition-colors">
                      <ChevronDown size={15} />
                    </button>
                  </div>

                  {/* Mockup thumbnail or icon */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 bg-white/5">
                    {project.mockupCardUrl ? (
                      <img src={project.mockupCardUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500/20 to-orange-600/10">
                        <Building2 className="w-5 h-5 text-orange-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-white truncate">{project.clientName}</h3>
                      {!project.published && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white/50 uppercase tracking-wider">
                          Rascunho
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-sm truncate">
                      <span className="text-orange-400/70">{project.category}</span>
                      {project.category && project.tagline ? " · " : ""}
                      {project.tagline}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-white/30 text-xs font-mono">/{project.slug}</span>
                      <span className="text-white/20 text-xs">
                        {project.mockupCardUrl ? "✓ Card" : "— Card"}
                        {" · "}
                        {project.mockupHeroUrl ? "✓ Hero" : "— Hero"}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="hidden lg:flex flex-wrap gap-1.5 max-w-[200px]">
                    {project.stackTags.split(",").filter(Boolean).slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5
                        border border-white/10 text-white/40">
                        {t.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                        title="Ver ao vivo">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleToggle(project)}
                      disabled={isToggling}
                      className="p-2 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      title={project.published ? "Despublicar" : "Publicar"}
                    >
                      {isToggling
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : project.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(project)}
                      className="p-2 rounded-lg text-white/40 hover:text-orange-400 hover:bg-orange-500/10 transition-all"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.clientName)}
                      disabled={isDeleting}
                      className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                      title="Excluir"
                    >
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          DRAWER / FORM PANEL
      ═══════════════════════════════════════════ */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* Slide-in panel */}
          <div className="relative ml-auto w-full max-w-2xl h-full bg-[#0d0d0d] border-l border-white/10
            flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-white/10 flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingId ? "Editar Projeto" : "Novo Projeto de Cliente"}
                </h2>
                {form.clientName && (
                  <p className="text-white/40 text-sm mt-0.5">{form.clientName}</p>
                )}
              </div>
              <button onClick={closeDrawer} className="text-white/40 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 flex-shrink-0 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all relative whitespace-nowrap
                      ${activeTab === tab.id
                        ? "text-orange-400"
                        : "text-white/40 hover:text-white/70"}`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-5">

              {/* ── TAB: Informações ──────────────── */}
              {activeTab === "info" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nome do Cliente *">
                      <input
                        ref={nameRef}
                        type="text"
                        value={form.clientName}
                        onChange={e => {
                          const v = e.target.value
                          setForm(f => ({
                            ...f,
                            clientName: v,
                            slug: editingId ? f.slug : autoSlug(v)
                          }))
                        }}
                        placeholder="Ex: CM Imóveis"
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5
                          outline-none focus:border-orange-500/50 placeholder-white/20 transition-all"
                      />
                    </Field>
                    <Field
                      label="Slug (URL) *"
                      hint="Endereço do case: /cases/{slug} (e /en/cases/{slug}). Mudar o slug muda o endereço."
                    >
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">/</span>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={e => setForm(f => ({ ...f, slug: autoSlug(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-6 pr-4 py-2.5
                            outline-none focus:border-orange-500/50 placeholder-white/20 transition-all font-mono text-sm"
                        />
                      </div>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Categoria">
                      <Input value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} placeholder="Ex: Plataforma Imobiliária" />
                    </Field>
                    <Field label="Tagline">
                      <Input value={form.tagline} onChange={v => setForm(f => ({ ...f, tagline: v }))} placeholder="Ex: Full-Stack & CRM" />
                    </Field>
                  </div>

                  <Field label="Descrição do Card (Resumo)">
                    <Textarea value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))}
                      placeholder="Resumo exibido no card do portfólio..." rows={3} />
                  </Field>

                  <Field label="Papel / Role">
                    <Input value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} placeholder="Ex: Senior Design Engineer (UI/UX, Front-end & Back-end)" />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Ano">
                      <Input value={form.year} onChange={v => setForm(f => ({ ...f, year: v }))} placeholder="2024" />
                    </Field>
                    <Field label="Status">
                      <select
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5
                          outline-none focus:border-orange-500/50 transition-all"
                      >
                        {["Em Produção", "Em Desenvolvimento", "Concluído", "Arquivado"].map(s => (
                          <option key={s} value={s} className="bg-[#111]">{s}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Stack Tecnológica">
                    <StackPicker
                      value={form.stackTags}
                      onChange={v => setForm(f => ({ ...f, stackTags: v }))}
                    />
                  </Field>

                  {/* Published toggle */}
                  <div
                    className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10 cursor-pointer"
                    onClick={() => setForm(f => ({ ...f, published: !f.published }))}
                  >
                    <div className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                      form.published ? "bg-emerald-500" : "bg-white/20"}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${
                        form.published ? "left-5" : "left-1"}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">
                        {form.published ? "Publicado" : "Rascunho"}
                      </p>
                      <p className="text-white/40 text-xs">
                        {form.published ? "Visível na página /cases" : "Oculto ao público"}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* ── TAB: Conteúdo ─────────────────── */}
              {activeTab === "content" && (
                <>
                  <div className="text-white/40 text-xs mb-2 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Textos exibidos na página de case study detalhada.
                  </div>

                  <Field label="🎯 O Desafio">
                    <Textarea value={form.challengeText} onChange={v => setForm(f => ({ ...f, challengeText: v }))}
                      placeholder="Descreva o problema/desafio que o cliente enfrentava..." rows={5} />
                  </Field>

                  <Field label="💡 A Solução">
                    <Textarea value={form.solutionText} onChange={v => setForm(f => ({ ...f, solutionText: v }))}
                      placeholder="Como você solucionou o problema..." rows={5} />
                  </Field>

                  <Field label="📈 O Impacto">
                    <Textarea value={form.impactText} onChange={v => setForm(f => ({ ...f, impactText: v }))}
                      placeholder="Quais foram os resultados e impactos alcançados..." rows={4} />
                  </Field>
                </>
              )}

              {/* ── TAB: Destaques ────────────────── */}
              {activeTab === "highlights" && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/40 text-xs flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Itens do Bento Grid na página de case study.
                    </p>
                    <button
                      onClick={addHL}
                      className="flex items-center gap-1.5 text-xs font-medium text-orange-400
                        hover:text-orange-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar destaque
                    </button>
                  </div>

                  <div className="space-y-5">
                    {form.highlights.map((hl, idx) => (
                      <div key={idx}
                        className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4 relative">
                        {/* Header row */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-white/30">
                            Destaque {idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => moveHL(idx, "up")} disabled={idx === 0}
                              className="p-1 text-white/30 hover:text-white disabled:opacity-20 transition-colors">
                              <ChevronUp size={14} />
                            </button>
                            <button onClick={() => moveHL(idx, "down")} disabled={idx === form.highlights.length - 1}
                              className="p-1 text-white/30 hover:text-white disabled:opacity-20 transition-colors">
                              <ChevronDown size={14} />
                            </button>
                            <button onClick={() => removeHL(idx)}
                              disabled={form.highlights.length === 1}
                              className="p-1 text-white/30 hover:text-red-400 disabled:opacity-20 transition-colors ml-1">
                              <X size={14} />
                            </button>
                          </div>
                        </div>

                        <Field label="Ícone">
                          <IconPicker value={hl.iconName} onChange={v => setHL(idx, "iconName", v)} />
                          <p className="text-white/30 text-xs mt-1">Selecionado: <span className="text-white/50">{hl.iconName}</span></p>
                        </Field>

                        <Field label="Título do Destaque">
                          <Input value={hl.title} onChange={v => setHL(idx, "title", v)} placeholder="Ex: Engenharia de Busca Inteligente" />
                        </Field>

                        <Field label="Descrição do Destaque">
                          <Textarea value={hl.body} onChange={v => setHL(idx, "body", v)}
                            placeholder="Descrição detalhada do que foi construído/implementado..." rows={3} />
                        </Field>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── TAB: Mídia & Links ────────────── */}
              {activeTab === "media" && (
                <>
                  {/* Links section */}
                  <div className="space-y-4 pb-5 border-b border-white/10">
                    <p className="text-white/40 text-xs flex items-center gap-2">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Links do projeto
                    </p>

                    <Field label="URL do Projeto Ao Vivo">
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="url"
                          value={form.liveUrl}
                          onChange={e => setForm(f => ({ ...f, liveUrl: e.target.value }))}
                          placeholder="https://cliente.vercel.app"
                          className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5
                            outline-none focus:border-orange-500/50 placeholder-white/20 transition-all"
                        />
                      </div>
                    </Field>

                    <Field label="URL da Página de Case (interna)" hint="Deixe em branco para usar /cases/{slug} automaticamente.">
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <input
                          type="text"
                          value={form.caseUrl}
                          onChange={e => setForm(f => ({ ...f, caseUrl: e.target.value }))}
                          placeholder={`/cases/${form.slug || "seu-projeto"}`}
                          className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5
                            outline-none focus:border-orange-500/50 placeholder-white/20 transition-all"
                        />
                      </div>
                    </Field>
                  </div>

                  {/* ── Mockup images ── */}
                  <div className="space-y-6 pt-1">
                    <p className="text-white/40 text-xs flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Imagens de mockup (clique ou arraste para fazer upload)
                    </p>

                    {/* Mockup Card */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-5 h-5 rounded-md bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-orange-400">1</span>
                        </span>
                        <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                          Mockup do Card
                        </span>
                      </div>
                      <ImageUploader
                        label="Imagem do Card"
                        description="Exibida no painel esquerdo do card na página /cases."
                        aspectHint="Recomendado: qualquer proporção (min. 400px)"
                        value={form.mockupCardUrl}
                        onChange={url => setForm(f => ({ ...f, mockupCardUrl: url || "" }))}
                      />
                    </div>

                    {/* Mockup Hero */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-5 h-5 rounded-md bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-orange-400">2</span>
                        </span>
                        <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                          Mockup do Hero (Case Study)
                        </span>
                      </div>
                      <ImageUploader
                        label="Imagem Hero"
                        description="Exibida na área grande 16:9 no topo da página de case study (/cases/slug)."
                        aspectHint="Recomendado: 16:9 (1280×720px)"
                        value={form.mockupHeroUrl}
                        onChange={url => setForm(f => ({ ...f, mockupHeroUrl: url || "" }))}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── TAB: Página do case ───────────── */}
              {activeTab === "page" && (
                <CasePageEditor
                  value={form.caseContent}
                  onChange={caseContent => setForm(f => ({ ...f, caseContent }))}
                  slug={form.slug}
                  stackTags={form.stackTags}
                />
              )}
            </div>

            {/* ── TAB: Marca & Brand ────────────── */}
            {activeTab === "brand" && (
              <BrandAccordion form={form} setForm={setForm} />
            )}

            {/* Feedback messages */}
            {(error || success) && (
              <div className={`mx-7 mb-4 rounded-xl px-4 py-3 flex items-center gap-2.5 text-sm ${
                error
                  ? "bg-red-500/10 border border-red-500/20 text-red-400"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              }`}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error || success}
              </div>
            )}

            {/* Drawer footer */}
            <div className="flex gap-3 px-7 py-5 border-t border-white/10 flex-shrink-0">
              <button
                onClick={closeDrawer}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/60
                  hover:text-white hover:border-white/30 font-medium text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600
                  hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-sm
                  transition-all flex items-center justify-center gap-2 disabled:opacity-60
                  shadow-lg shadow-orange-500/20"
              >
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  : <><Save className="w-4 h-4" /> {editingId ? "Salvar alterações" : "Criar projeto"}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
