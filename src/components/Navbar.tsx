'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'
import LanguageSwitcher from './LanguageSwitcher'
import { introIn } from '@/lib/intro'
import { useI18n } from '@/lib/i18n'

export interface NavbarProps {
  /** Links próprios da página (ex.: seções do case). Sem eles, o menu padrão do site no idioma atual. */
  links?: { href: string; label: string }[];
  ctaText?: string;
}

export default function Navbar({ links, ctaText }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const { t, lp } = useI18n()
  const isHome = router.pathname === '/'
  const cta = ctaText || t.nav.cta

  const navLinks = links || [
    { href: '#services', label: t.nav.services },
    { href: '#testimonials', label: t.nav.testimonials },
    { href: '#contact', label: t.nav.contact },
    { href: '/cases', label: t.nav.cases },
  ]
  // Fora da home, as âncoras do menu padrão (e o botão de contato) apontam para a home no idioma atual
  const resolveHref = (href: string) => lp(!isHome && href.startsWith('#') && (!links || href === '#contact') ? `/${href}` : href)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Entrada em CSS (intro-in, em globals.css): o menu aparece no primeiro paint, sem esperar o JavaScript */}
      <nav
        style={introIn(-80, 0.6)}
        className={`intro-in fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-panel rounded-none border-x-0 border-t-0' : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand Logo Link */}
          <a
            href={lp('/')}
            aria-label="EM Soluções Digitais"
            className="flex items-center gap-2 group transition-all duration-300"
          >
            {/* Logo em SVG: "SOLUÇÕES" muda de cor com o tema */}
            <Logo className="h-10 md:h-12 w-auto drop-shadow-md transition-transform group-hover:scale-105" />
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={resolveHref(link.href)}
                className="text-foreground-muted hover:text-foreground text-sm font-medium transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-orange transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Ações: idioma, tema e CTA */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />

            <motion.a
              href={resolveHref('#contact')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="btn-orange px-6 py-2.5 text-sm font-bold"
            >
              {cta}
            </motion.a>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              className="text-foreground-muted hover:text-foreground p-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={t.nav.menu}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-4 right-4 z-40 glass-panel p-6 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={resolveHref(link.href)}
                onClick={() => setMobileOpen(false)}
                className="text-foreground-muted hover:text-foreground font-medium text-lg py-2 border-b border-black/5 dark:border-white/5 last:border-0"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">

              <motion.a
                href={resolveHref('#contact')}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMobileOpen(false)}
                className="btn-orange px-6 py-3 text-sm font-bold text-center"
              >
                {cta}
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

