import AdminLayout from "../../components/AdminLayout"
import { useState, useEffect, useRef } from "react"
import { Plus, Pencil, Trash2, X, Loader2, LayoutGrid, ChevronUp, ChevronDown, Save } from "lucide-react"
import { uploadImage } from "../../lib/uploadImage"

interface Testimonial {
  id: string
  authorName: string
  authorRole: string
  content: string
  rating: number
  order?: number
  avatarUrl?: string | null
  highlight?: string
  caseSlug?: string
  deliverables?: string
}

interface CaseOption {
  slug: string
  clientName: string
}

interface SectionConfig {
  tagline: string
  title1: string
  titleHighlight: string
  description: string
}

interface FormData {
  authorName: string
  authorRole: string
  content: string
  rating: number
  avatarUrl?: string | null
  highlight: string
  caseSlug: string
  deliverables: string
}

const emptyForm: FormData = { authorName: "", authorRole: "", content: "", rating: 5, avatarUrl: null, highlight: "", caseSlug: "", deliverables: "" }

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [cases, setCases] = useState<CaseOption[]>([])

  // config state
  const [config, setConfig] = useState<SectionConfig>({
    tagline: "", title1: "", titleHighlight: "", description: ""
  })
  const [savingConfig, setSavingConfig] = useState(false)

  // modal / form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [error, setError] = useState("")
  const authorRef = useRef<HTMLInputElement>(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch("/api/testimonials").then(r => r.json()),
      fetch("/api/testimonials/config").then(r => r.json()),
      fetch("/api/projects").then(r => r.json()).catch(() => [])
    ])
    .then(([testData, configData, projectData]) => {
      setTestimonials(Array.isArray(testData) ? testData : [])
      setCases(Array.isArray(projectData) ? projectData.map((p: any) => ({ slug: p.slug, clientName: p.clientName })) : [])
      if (configData && !configData.error) {
        setConfig({
          tagline: configData.tagline,
          title1: configData.title1,
          titleHighlight: configData.titleHighlight,
          description: configData.description
        })
      }
    })
    .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    if (showForm) setTimeout(() => authorRef.current?.focus(), 50)
  }, [showForm])

  const handleSaveConfig = async () => {
    setSavingConfig(true)
    try {
      await fetch("/api/testimonials/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      alert("Textos atualizados!")
    } catch {
      alert("Erro ao atualizar textos.")
    } finally {
      setSavingConfig(false)
    }
  }

  const moveTestimonial = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...testimonials]
    if (direction === 'up' && index > 0) {
      const temp = newItems[index]
      newItems[index] = newItems[index - 1]
      newItems[index - 1] = temp
    } else if (direction === 'down' && index < newItems.length - 1) {
      const temp = newItems[index]
      newItems[index] = newItems[index + 1]
      newItems[index + 1] = temp
    } else {
      return
    }
    
    setTestimonials(newItems)
  
    const ids = newItems.map(f => f.id)
    try {
      await fetch("/api/testimonials/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })
    } catch(e) {
      console.error(e)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError("")
    setShowForm(true)
  }

  const openEdit = (f: Testimonial) => {
    setEditingId(f.id)
    setForm({
      authorName: f.authorName,
      authorRole: f.authorRole,
      content: f.content,
      rating: f.rating,
      avatarUrl: f.avatarUrl,
      highlight: f.highlight || "",
      caseSlug: f.caseSlug || "",
      deliverables: f.deliverables || "",
    })
    setError("")
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setError("") }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return

    if (file.size > 500 * 1024) {
      alert("A imagem deve ter no máximo 500KB.")
      return
    }

    // Sobe para o Vercel Blob e guarda só a URL (base64 no banco infla o HTML).
    setUploadingAvatar(true)
    setError("")
    try {
      const url = await uploadImage(file)
      setForm(prev => ({ ...prev, avatarUrl: url }))
    } catch (err: any) {
      setError(err.message || "Erro ao enviar a foto. Tente novamente.")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async () => {
    if (!form.authorName.trim() || !form.content.trim()) {
      setError("Nome e depoimento são obrigatórios.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const url = editingId ? `/api/testimonials/${editingId}` : "/api/testimonials"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      closeForm()
      load()
    } catch {
      setError("Erro ao salvar. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este depoimento?")) return
    setDeleting(id)
    try {
      await fetch(`/api/testimonials/${id}`, { method: "DELETE" })
      setTestimonials((prev) => prev.filter((f) => f.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Configuration */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Textos da Seção</h1>
              <p className="text-white/50">Edite as manchetes e descrições do cabeçalho de Depoimentos.</p>
            </div>
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig || loading}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-medium transition-all"
            >
              {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar Textos
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 border border-white/10 p-6 rounded-2xl">
            <div className="md:col-span-2">
              <label className="block text-sm text-white/60 mb-1.5">Tagline (Laranja)</label>
              <input
                type="text"
                value={config.tagline}
                onChange={e => setConfig({...config, tagline: e.target.value})}
                className="w-full bg-[#111] border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Título Branco</label>
              <input
                type="text"
                value={config.title1}
                onChange={e => setConfig({...config, title1: e.target.value})}
                className="w-full bg-[#111] border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Título Laranja (Final)</label>
              <input
                type="text"
                value={config.titleHighlight}
                onChange={e => setConfig({...config, titleHighlight: e.target.value})}
                className="w-full bg-[#111] border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-white/60 mb-1.5">Descrição/Subtítulo</label>
              <textarea
                value={config.description}
                onChange={e => setConfig({...config, description: e.target.value})}
                className="w-full bg-[#111] border border-white/10 text-white rounded-xl px-4 py-2 outline-none focus:border-blue-500/50 resize-none h-20"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Itens de Depoimentos</h1>
              <p className="text-white/50">Gerencie e ordene os depoimentos de clientes exibidos no site.</p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              Novo Depoimento
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-white/40">
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              Carregando...
            </div>
          ) : testimonials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40 border border-dashed border-white/20 rounded-2xl">
              <LayoutGrid className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-medium">Nenhum depoimento cadastrado</p>
              <p className="text-sm mt-1">Clique em "Novo Depoimento" para começar.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {testimonials.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 hover:bg-white/8 transition-colors group relative"
                >
                  <div className="flex flex-row md:flex-col gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button disabled={idx === 0} onClick={() => moveTestimonial(idx, 'up')} className="text-white/40 hover:text-white disabled:opacity-20 flex pt-2 md:pt-0" title="Mover para cima"><ChevronUp size={16} /></button>
                    <button disabled={idx === testimonials.length - 1} onClick={() => moveTestimonial(idx, 'down')} className="text-white/40 hover:text-white disabled:opacity-20 flex pb-2 md:pb-0" title="Mover para baixo"><ChevronDown size={16} /></button>
                  </div>
                  
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 font-bold border border-white/10 flex items-center justify-center flex-shrink-0 uppercase overflow-hidden">
                    {item.avatarUrl ? (
                      <img src={item.avatarUrl} alt={item.authorName} className="w-full h-full object-cover" />
                    ) : (
                      item.authorName.slice(0, 2)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate items-center flex gap-3">
                      {item.authorName}
                      <span className="text-xs text-white/40 font-normal">{item.authorRole}</span>
                    </h3>
                    {item.highlight && <p className="text-orange-300/90 text-sm mt-1 line-clamp-1">{item.highlight}</p>}
                    <p className="text-white/50 text-sm mt-0.5 line-clamp-2 md:line-clamp-1 italic">"{item.content}"</p>
                    {item.caseSlug && <p className="text-xs text-white/40 mt-1">Case: {cases.find(c => c.slug === item.caseSlug)?.clientName || item.caseSlug}</p>}
                  </div>
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 self-end md:self-center mt-2 md:mt-0">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-2 rounded-lg text-white/60 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="p-2 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                      title="Excluir"
                    >
                      {deleting === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal / Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeForm}
          />

          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Editar Depoimento" : "Novo Depoimento"}
              </h2>
              <button
                onClick={closeForm}
                className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Foto do Cliente (Opcional)</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {uploadingAvatar ? (
                      <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                    ) : form.avatarUrl ? (
                      <img src={form.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-white/40 uppercase">Foto</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingAvatar}
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-white/60
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-orange-500/10 file:text-orange-400
                        hover:file:bg-orange-500/20 file:transition-colors
                        cursor-pointer
                      "
                    />
                    <p className="text-xs text-white/40 mt-1">Máximo 500KB. Formatos visuais (JPG, PNG, WebP).</p>
                    {form.avatarUrl && (
                      <button 
                        onClick={() => setForm(p => ({ ...p, avatarUrl: null }))}
                        className="text-xs text-red-400 mt-2 hover:underline"
                      >
                        Remover Foto
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Nome do Cliente *</label>
                <input
                  ref={authorRef}
                  type="text"
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50"
                  placeholder="Ex: Rafael Mendes"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Cargo / Empresa</label>
                <input
                  type="text"
                  value={form.authorRole}
                  onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50"
                  placeholder="Ex: CEO, Mendes Investimentos"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Depoimento *</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 resize-none h-32"
                  placeholder="Ex: A agência transformou completamente a nossa presença digital..."
                />
              </div>

              <div>
                <label htmlFor="depo-destaque" className="block text-sm text-white/60 mb-1.5">Frase em destaque</label>
                <textarea
                  id="depo-destaque"
                  value={form.highlight}
                  onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 resize-none h-20"
                  placeholder="Trecho do próprio depoimento, mostrado em letra grande"
                />
                <p className="text-xs text-white/40 mt-1">Use um trecho do texto acima. Em branco, o site usa a primeira frase do depoimento.</p>
              </div>

              <div>
                <label htmlFor="depo-case" className="block text-sm text-white/60 mb-1.5">Case do cliente</label>
                <select
                  id="depo-case"
                  value={form.caseSlug}
                  onChange={(e) => setForm({ ...form, caseSlug: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 appearance-none"
                >
                  <option value="">Nenhum</option>
                  {cases.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.clientName}</option>
                  ))}
                </select>
                <p className="text-xs text-white/40 mt-1">A capa do case aparece ao lado do depoimento, com o link "Ver o case".</p>
              </div>

              <div>
                <label htmlFor="depo-entregas" className="block text-sm text-white/60 mb-1.5">O que foi entregue</label>
                <textarea
                  id="depo-entregas"
                  value={form.deliverables}
                  onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 resize-none h-24"
                  placeholder={"Um item por linha. Ex:\nLanding page\nAgendamento online"}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={closeForm}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingAvatar}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar Depoimento
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
