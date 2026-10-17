import AdminLayout from '../../components/AdminLayout'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, Filter, RefreshCw, Mail, Trash2, X,
  CheckCircle2, Clock, Target, TrendingUp, Send,
  MessageSquare, Globe, UserPlus, ChevronDown, StickyNote,
  Inbox, AlertCircle
} from 'lucide-react'

interface Lead {
  id: string
  source: string
  status: string
  name: string
  email: string
  whatsapp: string
  location: string
  service: string
  message: string
  locale?: string
  notes: string
  replied: boolean
  repliedAt: string | null
  createdAt: string
  updatedAt: string
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: 'Novo', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  contacted: { label: 'Contatado', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  proposal: { label: 'Proposta', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  closed: { label: 'Fechado', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  lost: { label: 'Perdido', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
}

const SOURCE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  form: { label: 'Formulário', icon: <Globe size={12} /> },
  whatsapp: { label: 'WhatsApp', icon: <MessageSquare size={12} /> },
  manual: { label: 'Manual', icon: <UserPlus size={12} /> },
}

const TEMPLATES = [
  { id: 'welcome', label: '👋 Boas-vindas', description: 'Confirmação de recebimento' },
  { id: 'proposal', label: '📋 Proposta', description: 'Envio de proposta comercial' },
  { id: 'followup', label: '🔄 Follow-up', description: 'Reengajamento de lead frio' },
  { id: 'custom', label: '✏️ Personalizado', description: 'Escreva sua mensagem' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function AdminCRM() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // filters
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSource, setFilterSource] = useState('all')

  // selected lead / drawer
  const [selected, setSelected] = useState<Lead | null>(null)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // email modal
  const [emailModal, setEmailModal] = useState(false)
  const [templateId, setTemplateId] = useState('welcome')
  const [customMessage, setCustomMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // new lead modal
  const [newLeadModal, setNewLeadModal] = useState(false)
  const [newLead, setNewLead] = useState({ name: '', email: '', whatsapp: '', service: '', location: '', source: 'manual' })
  const [creatingLead, setCreatingLead] = useState(false)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterSource !== 'all') params.set('source', filterSource)
      const r = await fetch(`/api/leads?${params}`)
      const data = await r.json()
      setLeads(data.leads ?? [])
      setTotal(data.total ?? 0)
    } catch {
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus, filterSource])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchLeads()
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev)
  }

  const saveNotes = async () => {
    if (!selected) return
    setSavingNotes(true)
    await fetch(`/api/leads/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    setSavingNotes(false)
    setSelected(prev => prev ? { ...prev, notes } : prev)
  }

  const deleteLead = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead?')) return
    await fetch(`/api/leads/${id}`, { method: 'DELETE' })
    setSelected(null)
    fetchLeads()
  }

  const sendEmail = async () => {
    if (!selected) return
    setSendingEmail(true)
    try {
      const r = await fetch('/api/leads/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: selected.id, templateId, customMessage }),
      })
      if (r.ok) {
        setEmailSent(true)
        setSelected(prev => prev ? { ...prev, replied: true } : prev)
        fetchLeads()
        setTimeout(() => { setEmailSent(false); setEmailModal(false) }, 2000)
      } else {
        alert('Erro ao enviar e-mail')
      }
    } finally {
      setSendingEmail(false)
    }
  }

  const createLead = async () => {
    if (!newLead.name || !newLead.email) return alert('Nome e e-mail são obrigatórios')
    setCreatingLead(true)
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    })
    setCreatingLead(false)
    setNewLeadModal(false)
    setNewLead({ name: '', email: '', whatsapp: '', service: '', location: '', source: 'manual' })
    fetchLeads()
  }

  const newCount = leads.filter(l => l.status === 'new').length
  const repliedCount = leads.filter(l => l.replied).length
  const closedCount = leads.filter(l => l.status === 'closed').length
  const replyRate = total > 0 ? Math.round((repliedCount / total) * 100) : 0

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="text-orange-400" size={28} />
              CRM / Leads
            </h1>
            <p className="text-white/60">Gerencie todos os leads e envie e-mails com templates.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchLeads} className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 border border-white/10 transition-all">
              <RefreshCw size={16} />
            </button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setNewLeadModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm rounded-xl transition-all"
            >
              <UserPlus size={16} />
              Novo Lead
            </motion.button>
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Inbox, label: 'Total de Leads', value: total, color: 'text-white' },
            { icon: AlertCircle, label: 'Novos', value: newCount, color: 'text-blue-400' },
            { icon: CheckCircle2, label: 'Fechados', value: closedCount, color: 'text-green-400' },
            { icon: TrendingUp, label: 'Taxa de Resposta', value: `${replyRate}%`, color: 'text-orange-400' },
          ].map(m => (
            <div key={m.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <m.icon size={18} className={`${m.color} mb-3 opacity-70`} />
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-white/40 mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
          >
            <option value="all" className="bg-zinc-900">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k} className="bg-zinc-900">{v.label}</option>
            ))}
          </select>
          <select
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
          >
            <option value="all" className="bg-zinc-900">Todas as fontes</option>
            <option value="form" className="bg-zinc-900">Formulário</option>
            <option value="whatsapp" className="bg-zinc-900">WhatsApp</option>
            <option value="manual" className="bg-zinc-900">Manual</option>
          </select>
        </div>

        {/* Table + Drawer layout */}
        <div className="flex gap-6">
          {/* Table */}
          <div className={`bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 ${selected ? 'flex-1' : 'w-full'}`}>
            {loading ? (
              <div className="p-12 text-center text-white/40 flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin" /> Carregando leads...
              </div>
            ) : leads.length === 0 ? (
              <div className="p-12 text-center">
                <Users size={36} className="mx-auto text-white/20 mb-3" />
                <p className="text-white/40 text-sm">Nenhum lead encontrado.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Lead</th>
                      {!selected && <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-white/40 hidden md:table-cell">Serviço</th>}
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Fonte</th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Status</th>
                      {!selected && <th className="px-5 py-4 text-xs font-bold uppercase tracking-widest text-white/40 hidden lg:table-cell">Data</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leads.map(lead => (
                      <tr
                        key={lead.id}
                        onClick={() => { setSelected(lead); setNotes(lead.notes) }}
                        className={`cursor-pointer transition-colors hover:bg-white/5 ${selected?.id === lead.id ? 'bg-orange-500/5 border-l-2 border-l-orange-500' : ''}`}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs flex-shrink-0">
                              {lead.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                                {lead.name}
                                {lead.locale && lead.locale !== 'pt-BR' && (
                                  <span title="Enviado pela página em inglês: responda em inglês" className="px-1.5 py-px rounded border border-sky-400/30 bg-sky-400/10 text-[10px] font-bold text-sky-300 flex-shrink-0">
                                    {lead.locale.toUpperCase()}
                                  </span>
                                )}
                                {lead.replied && <span title="Respondido"><CheckCircle2 size={12} className="text-green-400 flex-shrink-0" /></span>}
                              </p>
                              <p className="text-xs text-white/40 truncate">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        {!selected && (
                          <td className="px-5 py-4 hidden md:table-cell">
                            <p className="text-sm text-white/70 truncate max-w-[180px]">{lead.service || '—'}</p>
                          </td>
                        )}
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-white/50">
                            {SOURCE_LABELS[lead.source]?.icon}
                            {!selected && SOURCE_LABELS[lead.source]?.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_LABELS[lead.status]?.bg} ${STATUS_LABELS[lead.status]?.color}`}>
                            {STATUS_LABELS[lead.status]?.label ?? lead.status}
                          </span>
                        </td>
                        {!selected && (
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <p className="text-xs text-white/40">{formatDate(lead.createdAt)}</p>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Drawer */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.2 }}
                className="w-96 flex-shrink-0 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: 'calc(100vh - 180px)' }}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10 flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                      {selected.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate">{selected.name}</p>
                      <p className="text-xs text-white/40 truncate">{selected.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white flex-shrink-0 ml-2">
                    <X size={18} />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 p-5 space-y-5">
                  {/* Info */}
                  <div className="space-y-3">
                    {[
                      { label: 'WhatsApp', value: selected.whatsapp },
                      { label: 'Localidade', value: selected.location },
                      { label: 'Serviço', value: selected.service },
                      { label: 'Fonte', value: SOURCE_LABELS[selected.source]?.label },
                      { label: 'Idioma', value: selected.locale === 'en' ? 'Inglês (página /en)' : selected.locale === 'es' ? 'Espanhol (página /es)' : selected.locale && selected.locale !== 'pt-BR' ? selected.locale : 'Português' },
                      { label: 'Data', value: formatDate(selected.createdAt) },
                    ].map(row => row.value && (
                      <div key={row.label} className="flex items-start justify-between gap-2">
                        <span className="text-xs text-white/40 flex-shrink-0">{row.label}</span>
                        <span className="text-xs text-white/80 text-right">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {selected.message && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-white/40 mb-2">Mensagem</p>
                      <p className="text-sm text-white/70 leading-relaxed">{selected.message}</p>
                    </div>
                  )}

                  {/* Status changer */}
                  <div>
                    <label className="text-xs text-white/40 mb-2 block">Status do Lead</label>
                    <div className="relative">
                      <select
                        value={selected.status}
                        onChange={e => updateStatus(selected.id, e.target.value)}
                        className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 pr-8 transition-all"
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k} className="bg-zinc-900">{v.label}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-white/40 mb-2">
                      <StickyNote size={12} /> Notas Internas
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 resize-none transition-all"
                      placeholder="Anotações internas sobre este lead..."
                    />
                    <button
                      onClick={saveNotes}
                      disabled={savingNotes}
                      className="mt-2 text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1"
                    >
                      {savingNotes ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                      Salvar notas
                    </button>
                  </div>

                  {/* Reply status */}
                  {selected.replied && (
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                      <CheckCircle2 size={14} className="text-green-400" />
                      <p className="text-xs text-green-400 font-medium">
                        Respondido {selected.repliedAt ? `em ${formatDate(selected.repliedAt)}` : ''}
                      </p>
                    </div>
                  )}
                </div>

                {/* Drawer Actions */}
                <div className="flex-shrink-0 p-5 border-t border-white/10 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setEmailModal(true); setEmailSent(false) }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold text-sm rounded-xl transition-all"
                  >
                    <Mail size={14} />
                    Enviar E-mail
                  </motion.button>
                  <button
                    onClick={() => deleteLead(selected.id)}
                    className="p-2.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-white/10 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {emailModal && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setEmailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white">Enviar E-mail</h3>
                  <p className="text-sm text-white/50">Para: {selected.name} &lt;{selected.email}&gt;</p>
                </div>
                <button onClick={() => setEmailModal(false)} className="text-white/30 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {emailSent ? (
                <div className="p-10 text-center">
                  <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
                  <p className="text-white font-bold text-lg">E-mail enviado!</p>
                  <p className="text-white/40 text-sm mt-1">O lead foi marcado como contatado.</p>
                </div>
              ) : (
                <div className="p-6 space-y-5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-3">Template</label>
                    <div className="space-y-2">
                      {TEMPLATES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => setTemplateId(t.id)}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                            templateId === t.id
                              ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/8 hover:border-white/20'
                          }`}
                        >
                          <p className="text-sm font-medium">{t.label}</p>
                          <p className="text-xs opacity-60">{t.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {(templateId === 'custom' || templateId === 'proposal') && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-2">
                        {templateId === 'custom' ? 'Sua mensagem' : 'Detalhes da proposta'}
                      </label>
                      <textarea
                        rows={5}
                        value={customMessage}
                        onChange={e => setCustomMessage(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500/50 resize-none transition-all"
                        placeholder={templateId === 'custom' ? 'Escreva sua mensagem personalizada...' : 'Descreva os detalhes da proposta comercial...'}
                      />
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={sendEmail}
                    disabled={sendingEmail || (templateId === 'custom' && !customMessage.trim())}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                  >
                    {sendingEmail ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    {sendingEmail ? 'Enviando...' : 'Enviar E-mail'}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Lead Modal */}
      <AnimatePresence>
        {newLeadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setNewLeadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Novo Lead Manual</h3>
                <button onClick={() => setNewLeadModal(false)} className="text-white/30 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: 'name', label: 'Nome *', placeholder: 'Nome completo' },
                  { key: 'email', label: 'E-mail *', placeholder: 'email@exemplo.com' },
                  { key: 'whatsapp', label: 'WhatsApp', placeholder: '(11) 99999-9999' },
                  { key: 'service', label: 'Serviço', placeholder: 'Serviço de interesse' },
                  { key: 'location', label: 'Localidade', placeholder: 'São Paulo, SP' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-1.5">{field.label}</label>
                    <input
                      value={(newLead as Record<string, string>)[field.key]}
                      onChange={e => setNewLead(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 block mb-1.5">Fonte</label>
                  <select
                    value={newLead.source}
                    onChange={e => setNewLead(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-all"
                  >
                    <option value="manual" className="bg-zinc-900">Manual</option>
                    <option value="whatsapp" className="bg-zinc-900">WhatsApp</option>
                    <option value="form" className="bg-zinc-900">Formulário</option>
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={createLead}
                  disabled={creatingLead}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                  {creatingLead ? <RefreshCw size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  {creatingLead ? 'Criando...' : 'Criar Lead'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  )
}
