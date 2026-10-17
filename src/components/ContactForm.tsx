import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const WA_NUMBER = '5561995664986'

function WhatsAppIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Custom Select Component
   ───────────────────────────────────────────── */
interface ServiceSelectProps {
  value: string;
  onChange: (val: string) => void;
  services: string[];
  placeholder: string;
}

function ServiceSelect({ value, onChange, services, placeholder }: ServiceSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = value || null;

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        id="service-select"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between
          border rounded-lg px-4 py-3
          text-left transition-all duration-200 cursor-pointer
          focus:outline-none
          ${open
            ? 'border-orange ring-1 ring-orange'
            : 'border-border hover:border-orange/50'
          }
        `}
        style={{ backgroundColor: 'var(--color-input-bg)' }}
      >
        <span className={selected ? 'text-foreground font-medium' : 'text-foreground-subtle'}>
          {selected ?? placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-shrink-0 ml-2"
        >
          <ChevronDown
            size={18}
            className={`transition-colors ${open ? 'text-orange' : 'text-foreground-muted'}`}
          />
        </motion.span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="
              absolute z-50 w-full mt-2
              rounded-xl overflow-hidden
              border border-border
              shadow-[0_8px_32px_rgba(0,0,0,0.45)]
              backdrop-blur-md
            "
            style={{ backgroundColor: 'var(--color-input-bg)' }}
          >
            {/* Subtle orange top accent line */}
            <li aria-hidden className="h-[2px] bg-orange-gradient opacity-80" />

            {services.map((srv) => {
              const isSelected = srv === value;
              return (
                <li
                  key={srv}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { onChange(srv); setOpen(false); }}
                  className={`
                    flex items-center justify-between
                    px-4 py-3 cursor-pointer text-sm font-medium
                    transition-all duration-150 select-none
                    border-b border-border-subtle last:border-b-0
                    group
                    ${isSelected
                      ? 'bg-orange/10 text-orange'
                      : 'text-foreground-muted hover:bg-white/5 hover:text-foreground'
                    }
                  `}
                >
                  <span>{srv}</span>
                  {isSelected && (
                    <Check size={15} className="text-orange flex-shrink-0 ml-2" />
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactForm() {
  const { t, locale } = useI18n();
  const f = t.form;
  // Fora do português: telefone opcional e livre (com código do país) e sem lista de estados.
  // E-mail e LinkedIn em destaque ficam ao lado do formulário (Footer)
  const intl = locale !== 'pt-BR';
  const waLink = (text: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    location: '',
    service: '',
    message: '',
  });

  // Field spotlight — cycles through fields when form is untouched
  const [spotlightField, setSpotlightField] = useState(0);
  const isPristine = Object.values(formData).every((v) => v === '');
  useEffect(() => {
    if (!isPristine) return;
    const timer = setInterval(() => {
      setSpotlightField((prev) => (prev + 1) % 6);
    }, 1300);
    return () => clearInterval(timer);
  }, [isPristine]);

  // Helper: returns inline style for spotlight ring on a field
  const spotlightStyle = (idx: number): React.CSSProperties =>
    isPristine && spotlightField === idx
      ? { boxShadow: '0 0 0 1.5px #F15A24, 0 0 18px rgba(241,90,36,0.38)', transition: 'box-shadow 0.4s ease' }
      : { transition: 'box-shadow 0.4s ease' };

  // Mesma ordem em todos os idiomas: a API grava o serviço em português para o admin (serviceIndex)
  const services = f.services.split('|');

  const locations = [
    'Acre, AC', 'Alagoas, AL', 'Amapá, AP', 'Amazonas, AM', 'Bahia, BA', 'Ceará, CE', 'Distrito Federal, DF', 
    'Espírito Santo, ES', 'Goiás, GO', 'Maranhão, MA', 'Mato Grosso, MT', 'Mato Grosso do Sul, MS', 
    'Minas Gerais, MG', 'Pará, PA', 'Paraíba, PB', 'Paraná, PR', 'Pernambuco, PE', 'Piauí, PI', 
    'Rio de Janeiro, RJ', 'Rio Grande do Norte, RN', 'Rio Grande do Sul, RS', 'Rondônia, RO', 
    'Roraima, RR', 'Santa Catarina, SC', 'São Paulo, SP', 'Sergipe, SE', 'Tocantins, TO',
    'São Paulo (Capital)', 'Rio de Janeiro (Capital)', 'Belo Horizonte, MG', 'Curitiba, PR', 'Porto Alegre, RS'
  ];

  const formatWhatsApp = (value: string) => {
    if (intl) return value.replace(/[^\d+()\s-]/g, '');
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (!match) return value;
    let formatted = '';
    if (match[1]) formatted += `(${match[1]}`;
    if (match[1].length === 2) formatted += ') ';
    if (match[2]) formatted += match[2];
    if (match[3]) formatted += `-${match[3]}`;
    return formatted;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service) return;
    setStatus('loading');
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, serviceIndex: services.indexOf(formData.service), locale }),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', whatsapp: '', location: '', service: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'whatsapp') {
      setFormData((prev) => ({ ...prev, [name]: formatWhatsApp(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="glass-panel p-8 md:p-12 text-left w-full mx-auto shadow-2xl relative overflow-hidden">
      {status === 'success' ? (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
        >
          <CheckCircle2 size={64} className="text-orange mb-6" />
          <h3 className="text-3xl font-bold text-foreground mb-3">{f.successTitle}</h3>
          <p className="text-foreground-muted">
            {f.successText}
          </p>

          {/* WhatsApp follow-up CTA */}
          <motion.a
            href={waLink(t.whatsapp.followUp)}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 no-underline"
            style={{
              color: '#6EE7B7',
              background: 'rgba(6,78,59,0.12)',
              border: '1px solid rgba(6,78,59,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(6,78,59,0.2)'
              e.currentTarget.style.borderColor = 'rgba(6,78,59,0.5)'
              e.currentTarget.style.boxShadow = '0 0 24px rgba(6,78,59,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(6,78,59,0.12)'
              e.currentTarget.style.borderColor = 'rgba(6,78,59,0.3)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <WhatsAppIcon size={16} />
            {f.successWhatsapp}
            <ArrowRight size={14} className="opacity-60" />
          </motion.a>

          <button
              onClick={() => setStatus('idle')}
              className="mt-4 text-foreground-subtle hover:text-foreground-muted transition-colors text-xs font-medium"
          >
            {f.again}
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-foreground-muted">{f.name}</label>
              <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all"
                  style={{ backgroundColor: 'var(--color-input-bg)', ...spotlightStyle(0) }}
                  placeholder={f.namePlaceholder}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-foreground-muted">{f.email}</label>
              <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all"
                  style={{ backgroundColor: 'var(--color-input-bg)', ...spotlightStyle(1) }}
                  placeholder={f.emailPlaceholder}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="whatsapp" className="text-xs font-bold uppercase tracking-widest text-foreground-muted">{f.whatsapp}</label>
              <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required={!intl}
                  autoComplete="tel"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all"
                  style={{ backgroundColor: 'var(--color-input-bg)', ...spotlightStyle(2) }}
                  placeholder={f.whatsappPlaceholder}
                  maxLength={intl ? 20 : 15}
              />
            </div>

            <div className="flex flex-col gap-2 relative">
              <label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-foreground-muted">{f.location}</label>
              <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  list={intl ? undefined : 'location-list'}
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all"
                  style={{ backgroundColor: 'var(--color-input-bg)', ...spotlightStyle(3) }}
                  placeholder={f.locationPlaceholder}
                  autoComplete="off"
              />
              {!intl && (
                <datalist id="location-list">
                  {locations.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-foreground-muted">
              {f.service}
            </label>
            <div style={spotlightStyle(4)} className="rounded-lg">
              <ServiceSelect
                value={formData.service}
                onChange={(val) => setFormData((prev) => ({ ...prev, service: val }))}
                services={services}
                placeholder={f.servicePlaceholder}
              />
            </div>
            {!formData.service && status === 'error' && (
              <p className="text-xs text-red-400 mt-1">{f.serviceRequired}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-foreground-muted">{f.message}</label>
            <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange transition-all resize-none"
                style={{ backgroundColor: 'var(--color-input-bg)', ...spotlightStyle(5) }}
                placeholder={f.messagePlaceholder}
            />
          </div>

          {status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm font-medium">
                {f.error}
              </div>
          )}

          <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={status === 'loading'}
              type="submit"
              className="mt-4 btn-orange w-full py-4 text-lg font-bold flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
                <div className="w-6 h-6 rounded-full border-2 border-background-dark border-t-transparent animate-spin" />
            ) : (
                <>
                  {f.submit} <Send size={18} />
                </>
            )}
          </motion.button>

          {/* Divider + WhatsApp alternative CTA */}
          <div className="flex items-center gap-4 mt-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-medium text-foreground-subtle uppercase tracking-widest">{f.or}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <motion.a
            href={waLink(t.whatsapp.message)}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="mt-1 w-full py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 no-underline"
            style={{
              color: '#6EE7B7',
              background: 'transparent',
              border: '1px solid rgba(6,78,59,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(6,78,59,0.1)'
              e.currentTarget.style.borderColor = 'rgba(6,78,59,0.5)'
              e.currentTarget.style.boxShadow = '0 0 24px rgba(6,78,59,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(6,78,59,0.3)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <WhatsAppIcon size={16} />
            {f.whatsappCta}
          </motion.a>
        </form>
      )}
    </div>
  );
}
