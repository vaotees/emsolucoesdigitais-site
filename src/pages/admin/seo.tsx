import AdminLayout from '../../components/AdminLayout'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Globe, Tag, Link2, Bot, Save, Eye, RefreshCw, CheckCircle2, BarChart2 } from 'lucide-react'
import ImageUploader from '../../components/ImageUploader'

interface SeoForm {
  siteTitle: string
  metaDescription: string
  ogImage: string
  keywords: string
  canonicalUrl: string
  robotsIndex: boolean
  googleAnalyticsId: string
}

const defaultForm: SeoForm = {
  siteTitle: 'EM Soluções Digitais | Agência Digital Premium',
  metaDescription: 'Estratégia, design e tecnologia de ponta para posicionar seu negócio como referência no mercado digital.',
  ogImage: '',
  keywords: 'agência digital, websites, marketing digital, tráfego pago, automação',
  canonicalUrl: '',
  robotsIndex: true,
  googleAnalyticsId: '',
}

export default function AdminSEO() {
  const [form, setForm] = useState<SeoForm>(defaultForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState<'google' | 'social'>('google')

  useEffect(() => {
    fetch('/api/seo')
      .then(r => r.json())
      .then(data => {
        if (data?.siteTitle) setForm({ ...defaultForm, ...data })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const descLen = form.metaDescription.length
  const titleLen = form.siteTitle.length

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-white/50">
          <RefreshCw className="animate-spin mr-2" size={18} /> Carregando configurações...
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Search className="text-orange-400" size={28} />
              SEO
            </h1>
            <p className="text-white/60">Configure os metadados para otimizar sua presença no Google e redes sociais.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              saved
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-orange-500 text-white hover:bg-orange-400'
            }`}
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : saved ? (
              <CheckCircle2 size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}
          </motion.button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {/* Title */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
                <Globe size={13} /> Título da Página
              </label>
              <input
                name="siteTitle"
                value={form.siteTitle}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                placeholder="EM Soluções Digitais | Agência Digital Premium"
              />
              <div className={`flex justify-between mt-2 text-xs ${titleLen > 60 ? 'text-red-400' : titleLen > 50 ? 'text-yellow-400' : 'text-white/30'}`}>
                <span>{titleLen > 60 ? '⚠ Muito longo para o Google' : titleLen > 50 ? '⚠ Ideal até 60 chars' : '✓ Comprimento ideal'}</span>
                <span>{titleLen}/60</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
                <Tag size={13} /> Meta Descrição
              </label>
              <textarea
                name="metaDescription"
                rows={3}
                value={form.metaDescription}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all resize-none"
                placeholder="Descreva seu site em até 160 caracteres..."
              />
              <div className={`flex justify-between mt-2 text-xs ${descLen > 160 ? 'text-red-400' : descLen > 140 ? 'text-yellow-400' : 'text-white/30'}`}>
                <span>{descLen > 160 ? '⚠ Muito longa' : descLen < 100 ? '⚠ Muito curta (ideal: 120-160)' : '✓ Comprimento ideal'}</span>
                <span>{descLen}/160</span>
              </div>
            </div>

            {/* OG Image */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                OG Image
              </label>
              <ImageUploader
                description="Imagem exibida ao compartilhar o site no WhatsApp, redes sociais e Google. Recomendado: 1200×630px."
                aspectHint="1200×630px"
                value={form.ogImage || null}
                onChange={url => {
                  setForm(prev => ({ ...prev, ogImage: url || '' }))
                  setSaved(false)
                }}
              />
            </div>

            {/* Keywords */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
                <Tag size={13} /> Palavras-chave
              </label>
              <input
                name="keywords"
                value={form.keywords}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                placeholder="agência digital, websites, marketing..."
              />
              <p className="mt-2 text-xs text-white/30">Separe as palavras com vírgula</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {form.keywords.split(',').filter(k => k.trim()).map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs">
                    {kw.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Google Analytics */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
                <BarChart2 size={13} /> Google Analytics 4
              </label>
              <div className="relative">
                <input
                  name="googleAnalyticsId"
                  value={form.googleAnalyticsId}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all font-mono"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <p className="mt-2 text-xs text-white/30">Measurement ID do GA4 — encontrado em Admin › Data Streams</p>
              {form.googleAnalyticsId && (
                <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${
                  /^G-[A-Z0-9]{6,}$/.test(form.googleAnalyticsId) ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {/^G-[A-Z0-9]{6,}$/.test(form.googleAnalyticsId)
                    ? '✓ Formato válido — rastreamento ativo no próximo deploy'
                    : '⚠ Formato esperado: G-XXXXXXXXXX'}
                </div>
              )}
            </div>

            {/* Canonical + Robots */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
                  <Link2 size={13} /> URL Canônica
                </label>
                <input
                  name="canonicalUrl"
                  value={form.canonicalUrl}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                  placeholder="https://emsolucoesdigitais.com.br"
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2.5">
                  <Bot size={14} className="text-white/50" />
                  <div>
                    <p className="text-sm font-medium text-white">Indexação pelo Google</p>
                    <p className="text-xs text-white/40">Permite que mecanismos de busca indexem o site</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="robotsIndex"
                    checked={form.robotsIndex}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden sticky top-8">
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setPreview('google')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                    preview === 'google' ? 'text-orange-400 border-b-2 border-orange-400 -mb-px' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Search size={14} /> Prévia Google
                </button>
                <button
                  onClick={() => setPreview('social')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                    preview === 'social' ? 'text-orange-400 border-b-2 border-orange-400 -mb-px' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Eye size={14} /> Prévia Social
                </button>
              </div>

              <div className="p-6">
                {preview === 'google' ? (
                  <div className="bg-white rounded-2xl p-5 shadow-lg">
                    <p className="text-xs text-green-700 mb-1">
                      {form.canonicalUrl || 'https://emsolucoesdigitais.com.br'} › ...
                    </p>
                    <h3 className="text-blue-700 text-lg font-medium leading-tight mb-1 hover:underline cursor-pointer line-clamp-1">
                      {form.siteTitle || 'Título da Página'}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {form.metaDescription || 'Meta descrição aparecerá aqui...'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden border border-white/10">
                    <div className="bg-white/10 aspect-[1200/630] flex items-center justify-center relative">
                      {form.ogImage ? (
                        <img src={form.ogImage} alt="OG preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-white/30">
                          <Image size={32} />
                          <span className="text-xs">OG Image aparecerá aqui</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-[#1a1a1a] p-4 border-t border-white/10">
                      <p className="text-xs text-white/40 uppercase mb-1 tracking-widest">
                        {(form.canonicalUrl || 'emsolucoesdigitais.com.br').replace(/^https?:\/\//, '')}
                      </p>
                      <h3 className="font-bold text-white text-sm line-clamp-1">{form.siteTitle}</h3>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2">{form.metaDescription}</p>
                    </div>
                  </div>
                )}

                {/* SEO Score */}
                <div className="mt-5 pt-5 border-t border-white/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Score SEO</p>
                  {[
                    { label: 'Título', ok: titleLen >= 30 && titleLen <= 60 },
                    { label: 'Descrição', ok: descLen >= 100 && descLen <= 160 },
                    { label: 'OG Image', ok: !!form.ogImage },
                    { label: 'Keywords', ok: form.keywords.split(',').filter(k => k.trim()).length >= 3 },
                    { label: 'URL Canônica', ok: !!form.canonicalUrl },
                    { label: 'Robots Index', ok: form.robotsIndex },
                    { label: 'Google Analytics', ok: /^G-[A-Z0-9]{6,}$/.test(form.googleAnalyticsId) },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">{item.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        item.ok ? 'bg-green-500/15 text-green-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {item.ok ? '✓ OK' : '✗ Faltando'}
                      </span>
                    </div>
                  ))}
                  <div className="mt-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-700"
                      style={{
                        width: `${Math.round(
                          ([titleLen >= 30 && titleLen <= 60, descLen >= 100 && descLen <= 160, !!form.ogImage, form.keywords.split(',').filter(k => k.trim()).length >= 3, !!form.canonicalUrl, form.robotsIndex, /^G-[A-Z0-9]{6,}$/.test(form.googleAnalyticsId)].filter(Boolean).length / 7) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
