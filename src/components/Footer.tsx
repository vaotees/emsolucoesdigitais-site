'use client'

import { Instagram, Facebook, Mail, Phone, MapPin, Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'
import ContactForm from './ContactForm'
import TechCanvas from './TechCanvas'
import Logo from './Logo'
import { useI18n } from '@/lib/i18n'
import { PROFILE } from '@/lib/profile'
import type { Dict } from '@/locales/pt-BR'

interface FooterLink {
  text: string;
  href?: string;
  icon?: React.ReactNode;
}

const footerLinks = (t: Dict): Record<string, FooterLink[]> => ({
  [t.footer.colServices]: t.footer.services.split('|').map((text) => ({ text, href: '#services' })),
  [t.footer.colCompany]: [
    { text: t.footer.who, href: '/cases' },
    { text: t.nav.services, href: '#services' },
    { text: t.nav.testimonials, href: '#testimonials' },
    { text: t.nav.contact, href: '#contact' },
    { text: t.footer.portfolio, href: '/cases' },
  ],
  [t.footer.colContact]: [
    { text: 'contato@emsolucoesdigitais.com.br', href: 'mailto:estevao.marques@gmail.com', icon: <Mail size={13} className="text-orange shrink-0 mt-0.5" /> },
    { text: '(61) 99566-4986', href: 'https://wa.me/5561995664986', icon: <Phone size={13} className="text-orange shrink-0 mt-0.5" /> },
    { text: t.footer.address, icon: <MapPin size={13} className="text-orange shrink-0 mt-0.5" /> },
  ],
})

/* ─── Energy Line SVG: texto → formulário ─────────────────── */
function EnergyLine() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{ zIndex: 0 }}
    >
      <defs>
        <filter id="energyGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="dotGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ghost trail — always visible, very subtle */}
      <path
        d="M 180 200 Q 500 40 820 420"
        fill="none"
        stroke="rgba(241,90,36,0.07)"
        strokeWidth="1.5"
        strokeDasharray="5 10"
      />

      {/* Animated energy beam */}
      <motion.path
        d="M 180 200 Q 500 40 820 420"
        fill="none"
        stroke="#F7941D"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#energyGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1, 1, 0],
          opacity:    [0, 0.85, 0.85, 0],
        }}
        transition={{
          duration: 2.6,
          times: [0, 0.42, 0.58, 1],
          repeat: Infinity,
          repeatDelay: 1.8,
          ease: 'easeInOut',
        }}
      />

      {/* Secondary echo beam with delay */}
      <motion.path
        d="M 180 200 Q 500 40 820 420"
        fill="none"
        stroke="#F15A24"
        strokeWidth="1"
        strokeLinecap="round"
        filter="url(#energyGlow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 1, 1, 0],
          opacity:    [0, 0.35, 0.35, 0],
        }}
        transition={{
          duration: 2.6,
          times: [0, 0.42, 0.58, 1],
          repeat: Infinity,
          repeatDelay: 1.8,
          ease: 'easeInOut',
          delay: 0.15,
        }}
      />

      {/* Glowing orb traveling along the bezier */}
      {/* Points computed from Q(t) = (1-t)²P0 + 2t(1-t)Pc + t²P1 */}
      {/* P0=(180,200) Pc=(500,40) P1=(820,420) */}
      <motion.circle
        r={6}
        fill="#F97316"
        filter="url(#dotGlow)"
        initial={{ opacity: 0 }}
        animate={{
          cx:      [180, 341, 500, 660, 820],
          cy:      [200, 145, 175, 265, 420],
          opacity: [0,   1,   1,   1,   0],
          r:       [3,   6,   7,   6,   3],
        }}
        transition={{
          duration: 2.6,
          repeat: Infinity,
          repeatDelay: 1.8,
          ease: 'easeInOut',
        }}
      />
    </svg>
  )
}


export interface FooterProps {
  ctaPrefix?: string;
  ctaHighlight?: string;
  ctaSubtitle?: string;
  copyrightText?: string;
}

export default function Footer(props: FooterProps) {
  const { t, locale, lp } = useI18n()
  const {
    ctaPrefix = t.footer.ctaPrefix,
    ctaHighlight = t.footer.ctaHighlight,
    ctaSubtitle = t.footer.ctaSubtitle,
    copyrightText = t.footer.copyright,
  } = props
  // Em inglês, e-mail e LinkedIn são o caminho principal (o WhatsApp continua no formulário e no botão flutuante)
  const directContact = locale !== 'pt-BR'
  return (
    <footer id="contact" className="bg-surface border-t border-border-subtle relative overflow-hidden">
      {/* Tech canvas over full footer */}
      <TechCanvas mode="subtle" />

      {/* CTA Banner / Contact Form Section */}
      <div className="relative overflow-hidden">
        {/* Energy Line: left text → right form */}
        <EnergyLine />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(241,90,36,0.08) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange mb-4">
                {t.footer.eyebrow}
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6">
                {ctaPrefix}
                <span className="text-orange-gradient">{ctaHighlight}</span>
              </h2>
              <p className="text-foreground-muted mb-8 max-w-lg">
                {ctaSubtitle}
              </p>
              {directContact && (
                <div className="flex flex-wrap gap-3">
                  <a href={`mailto:${PROFILE.email}`} className="btn-orange px-6 py-3 text-sm gap-2">
                    <Mail size={15} aria-hidden="true" /> {PROFILE.email}
                  </a>
                  <a
                    href={PROFILE.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border border-border text-foreground-muted hover:text-foreground hover:border-orange/40 transition-colors"
                  >
                    <Linkedin size={15} aria-hidden="true" /> LinkedIn
                  </a>
                </div>
              )}
            </div>
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="mb-6">
                {/* Logo em SVG: "SOLUÇÕES" muda de cor com o tema */}
                <Logo className="h-14 md:h-16 w-auto drop-shadow-lg" />
              </div>
              <p className="text-foreground-subtle text-sm leading-relaxed mb-6">
                {t.footer.blurb}
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/em_solucoesdigitais"
                  target="_blank" rel="noopener noreferrer"
                  aria-label={t.footer.instagram}
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground-subtle hover:text-orange hover:border-orange/40 transition-all duration-200"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="https://www.facebook.com/emsolucoesdigitais/"
                  target="_blank" rel="noopener noreferrer"
                  aria-label={t.footer.facebook}
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground-subtle hover:text-orange hover:border-orange/40 transition-all duration-200"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="mailto:estevao.marques@gmail.com"
                  aria-label={t.footer.email}
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-foreground-subtle hover:text-orange hover:border-orange/40 transition-all duration-200"
                >
                  <Mail size={16} />
                </a>
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks(t)).map(([category, links]) => (
              <div key={category}>
                <h3 className="text-foreground font-semibold text-sm mb-5">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link, idx) => (
                    <li key={idx}>
                      {link.href ? (
                        <a
                          href={link.href.startsWith('/') ? lp(link.href) : link.href}
                          target={link.href.startsWith('http') ? '_blank' : undefined}
                          rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="flex items-start gap-2 text-foreground-subtle hover:text-foreground-muted text-sm transition-colors duration-200"
                        >
                          {link.icon}
                          {link.text}
                        </a>
                      ) : (
                        <span className="flex items-start gap-2 text-foreground-subtle text-sm">
                          {link.icon}
                          {link.text}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-foreground-subtle text-xs">
            {copyrightText}
          </p>
          <div className="flex gap-6">
            {/* Links removidos conforme solicitado */}
          </div>
        </div>
      </div>
    </footer>
  )
}
