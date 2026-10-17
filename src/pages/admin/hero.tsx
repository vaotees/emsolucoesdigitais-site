import AdminLayout from "../../components/AdminLayout"
import { useState, useEffect } from "react"
import { Loader2, Save, Upload, X } from "lucide-react"
import { uploadImage } from "../../lib/uploadImage"

interface HeroConfig {
  badge: string
  titlePrefix: string
  rotatingWords: string
  description: string
  ctaPrimaryText: string
  ctaPrimaryUrl: string
  ctaSecondaryText: string
  ctaSecondaryUrl: string
  socialClients: string
  socialRating: string
  socialRevenue: string
  socialAvatar1?: string | null
  socialAvatar2?: string | null
  socialAvatar3?: string | null
  socialAvatar4?: string | null
}

const defaultConfig: HeroConfig = {
  badge: "EM Soluções Digitais",
  titlePrefix: "Especialistas em",
  rotatingWords: "Autoridade Digital,Websites Premium,Design & Branding,Automação com IA,Tráfego Pago,Landing Pages,Redes Sociais",
  description: "Estratégia, design e tecnologia de ponta para posicionar seu negócio como referência no mercado digital. Resultados mensuráveis, estética impecável.",
  ctaPrimaryText: "Quero minha Autoridade Digital",
  ctaPrimaryUrl: "#contact",
  ctaSecondaryText: "Ver nossos casos",
  ctaSecondaryUrl: "#testimonials",
  socialClients: "+127 clientes",
  socialRating: "4.9 / 5.0",
  socialRevenue: "R$12M+ em resultados gerados",
  socialAvatar1: null,
  socialAvatar2: null,
  socialAvatar3: null,
  socialAvatar4: null,
}

const AVATAR_DEFAULTS = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=80&h=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=80&h=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80&h=80',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=80&h=80',
]

const AVATAR_KEYS = ['socialAvatar1', 'socialAvatar2', 'socialAvatar3', 'socialAvatar4'] as const

export default function AdminHero() {
  const [config, setConfig] = useState<HeroConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/hero/config")
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setConfig(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/hero/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (!res.ok) throw new Error()
      alert("Hero atualizada com sucesso!")
    } catch {
      alert("Erro ao salvar. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (file.size > 500 * 1024) {
      alert("A imagem deve ter no máximo 500KB.")
      return
    }
    // Sobe para o Vercel Blob e guarda só a URL (base64 no banco infla o HTML).
    setUploadingAvatar(index)
    try {
      const url = await uploadImage(file)
      const key = AVATAR_KEYS[index]
      setConfig(prev => ({ ...prev, [key]: url }))
    } catch (err: any) {
      alert(err.message || "Erro ao enviar a foto. Tente novamente.")
    } finally {
      setUploadingAvatar(null)
    }
  }

  const clearAvatar = (index: number) => {
    const key = AVATAR_KEYS[index]
    setConfig(prev => ({ ...prev, [key]: null }))
  }

  const Field = ({
    label,
    field,
    multiline = false,
    hint,
  }: {
    label: string
    field: keyof HeroConfig
    multiline?: boolean
    hint?: string
  }) => (
    <div>
      <label className="block text-sm text-white/60 mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          value={(config[field] as string) ?? ''}
          onChange={e => setConfig({ ...config, [field]: e.target.value })}
          className="w-full bg-[#111] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-orange-500/50 resize-none h-24 text-sm"
        />
      ) : (
        <input
          type="text"
          value={(config[field] as string) ?? ''}
          onChange={e => setConfig({ ...config, [field]: e.target.value })}
          className="w-full bg-[#111] border border-white/10 text-white rounded-xl px-4 py-3 outline-none focus:border-orange-500/50 text-sm"
        />
      )}
      {hint && <p className="text-xs text-white/30 mt-1">{hint}</p>}
    </div>
  )

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Hero Section</h1>
            <p className="text-white/50">Edite todos os textos e imagens da seção principal.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading || uploadingAvatar !== null}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Hero
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-white/40">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            Carregando...
          </div>
        ) : (
          <>
            {/* Badge & Título */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">Cabeçalho</h2>
              <Field label="Badge (texto laranja em destaque no topo)" field="badge" />
              <Field label="Prefixo do Título" field="titlePrefix" hint='Exemplo: "Especialistas em"' />
              <Field
                label="Palavras Rotativas (separadas por vírgula)"
                field="rotatingWords"
                multiline
                hint='Estas são as palavras que aparecem em laranja e alternam automaticamente. Ex: "Redes Sociais,Websites Premium"'
              />
              <Field label="Descrição / Subtítulo" field="description" multiline />
            </section>

            {/* CTAs */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">Botões de Ação</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Botão Primário (Texto)" field="ctaPrimaryText" />
                <Field label="Botão Primário (Link / Âncora)" field="ctaPrimaryUrl" hint='Ex: "#contact" ou "https://..."' />
                <Field label="Botão Secundário (Texto)" field="ctaSecondaryText" />
                <Field label="Botão Secundário (Link / Âncora)" field="ctaSecondaryUrl" hint='Ex: "#services"' />
              </div>
            </section>

            {/* Social Proof */}
            <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40">Prova Social (rodapé da Hero)</h2>

              {/* Texts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Clientes" field="socialClients" hint='Ex: "+127 clientes"' />
                <Field label="Avaliação" field="socialRating" hint='Ex: "4.9 / 5.0"' />
                <Field label="Resultados" field="socialRevenue" hint='Opcional. Aparece ao lado da avaliação; deixe vazio para esconder.' />
              </div>

              {/* Avatar Uploads */}
              <div>
                <label className="block text-sm text-white/60 mb-3">Fotos dos Clientes (4 avatares empilhados)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {AVATAR_KEYS.map((key, index) => {
                    const currentVal = config[key]
                    const preview = currentVal || AVATAR_DEFAULTS[index]
                    return (
                      <div key={key} className="flex flex-col items-center gap-2">
                        <p className="text-xs text-white/40">Foto {index + 1}</p>
                        <div className="relative group">
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                            <img
                              src={preview}
                              alt={`Avatar ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {currentVal && (
                            <button
                              onClick={() => clearAvatar(index)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remover foto"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          )}
                        </div>
                        <label className="cursor-pointer flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors">
                          {uploadingAvatar === index ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                          {uploadingAvatar === index ? 'Enviando…' : currentVal ? 'Trocar' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingAvatar !== null}
                            onChange={(e) => handleAvatarUpload(index, e)}
                          />
                        </label>
                        {!currentVal && (
                          <p className="text-[10px] text-white/25 text-center">Usando padrão</p>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-white/30 mt-3">Máximo 500KB por foto. Se não fizer upload, serão usadas fotos executivas padrão.</p>
              </div>
            </section>

            {/* Preview tip */}
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 text-sm text-orange-300/70">
              💡 <strong className="text-orange-300">Dica:</strong> Após salvar, atualize a página inicial para ver as mudanças aplicadas em tempo real.
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
