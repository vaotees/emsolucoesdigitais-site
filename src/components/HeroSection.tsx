'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, Star } from 'lucide-react'
import { Button } from './Button'
import TechCanvas from './TechCanvas'
import { introIn } from '@/lib/intro'
import { fmt, useI18n } from '@/lib/i18n'

export interface SectionHeroConfig {
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
  socialRevenue?: string | null
  socialAvatar1?: string | null
  socialAvatar2?: string | null
  socialAvatar3?: string | null
  socialAvatar4?: string | null
}

interface HeroSectionProps {
  sectionConfig?: SectionHeroConfig | null
}

export default function HeroSection({ sectionConfig }: HeroSectionProps) {
  const { t, lp } = useI18n()
  // Conteúdo do admin (já no idioma da página); sem banco, os textos padrão do dicionário
  const config = sectionConfig || {
    badge: t.hero.badge,
    titlePrefix: t.hero.titlePrefix,
    rotatingWords: t.hero.rotatingWords,
    description: t.hero.description,
    ctaPrimaryText: t.hero.ctaPrimaryText,
    ctaPrimaryUrl: "#contact",
    ctaSecondaryText: t.hero.ctaSecondaryText,
    ctaSecondaryUrl: "/cases",
    socialClients: t.hero.socialClients,
    socialRating: "4.9 / 5.0",
    socialRevenue: "",
  }

  const services = config.rotatingWords.split(',').map(s => s.trim()).filter(Boolean)

  const [currentService, setCurrentService] = useState(0)
  const [activeStar, setActiveStar] = useState(0)
  const [spotlightAvatar, setSpotlightAvatar] = useState(0)

  // Rotating headline
  useEffect(() => {
    if (services.length <= 1) return
    const timer = setInterval(() => {
      setCurrentService((prev) => (prev + 1) % services.length)
    }, 3500)
    return () => clearInterval(timer)
  }, [services.length])

  // Star wave — each star lights up sequentially
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStar((prev) => (prev + 1) % 5)
    }, 380)
    return () => clearInterval(timer)
  }, [])

  // Avatar spotlight — one avatar highlighted at a time
  useEffect(() => {
    const timer = setInterval(() => {
      setSpotlightAvatar((prev) => (prev + 1) % 4)
    }, 1400)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Tech particle canvas — responds to mouse */}
      <TechCanvas mode="hero" />

      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(241,90,36,0.12) 0%, rgba(15,23,42,0.05) 40%, transparent 70%)',
        }}
      />

      {/* Subtle animated grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(241,90,36,0.08) 0%, transparent 70%)' }}
      />
      <motion.div
        animate={{ y: [0, 25, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(15,23,42,0.08) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center pt-24">
        {/* Entrada em CSS (intro-in + introIn): começa no primeiro paint, sem esperar o JavaScript.
            Com framer-motion o texto ficava invisível até a hidratação e o LCP no celular passava de 10 s. */}
        {/* Badge — Option 2: Minimal Underline Tag */}
        <div
          className="intro-in inline-flex items-center gap-3 mb-8 relative"
          style={introIn(20, 0.6, 0.2)}
        >
          {/* Left vertical bar */}
          <span
            className="w-[3px] h-5 rounded-full flex-shrink-0"
            style={{ background: 'linear-gradient(180deg, #F7941D 0%, #F15A24 100%)' }}
          />
          <span className="text-sm font-bold text-orange uppercase tracking-[0.25em] relative pb-1.5">
            {config.badge}
            {/* Orange underline */}
            <span
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, #F15A24 0%, transparent 100%)' }}
            />
          </span>
        </div>

        {/* Headline */}
        <h1
          style={introIn(30, 0.8, 0.3)}
          className="intro-in text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-foreground leading-[1.05] tracking-tight mb-6"
        >
          {config.titlePrefix}{' '}
          <span className="relative inline-grid align-bottom place-items-center">
            {services.map((service, i) => (
              <span key={`ph-${i}`} className="invisible opacity-0 select-none col-start-1 row-start-1 pointer-events-none whitespace-normal sm:whitespace-nowrap px-1 text-center w-full">
                {service}
              </span>
            ))}
            {/* initial={false}: a primeira palavra já nasce visível (entra junto com o título) */}
            <AnimatePresence exitBeforeEnter initial={false}>
              <motion.span
                key={currentService}
                initial={{ y: '20%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-20%', opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="col-start-1 row-start-1 flex items-center justify-center text-orange-gradient whitespace-normal sm:whitespace-nowrap text-center w-full"
              >
                {services[currentService]}
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        {/* Subheading */}
        <p
          style={introIn(20, 0.8, 0.5)}
          className="intro-in text-foreground-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          {config.description}
        </p>

        {/* CTA Buttons */}
        <div
          style={introIn(20, 0.8, 0.65)}
          className="intro-in flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            href={lp(config.ctaPrimaryUrl)}
            variant="primary"
            icon={ArrowRight}
            size="md"
          >
            {config.ctaPrimaryText}
          </Button>

          <Button
            href={lp(config.ctaSecondaryUrl)}
            variant="outline"
            icon={Play}
            size="md"
          >
            {config.ctaSecondaryText}
          </Button>
        </div>

        {/* Social proof */}
        <div
          style={introIn(0, 1, 1)}
          className="intro-in mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-foreground-subtle"
        >
          {/* Avatars */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[
                config.socialAvatar1 || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=80&h=80',
                config.socialAvatar2 || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=80&h=80',
                config.socialAvatar3 || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80&h=80',
                config.socialAvatar4 || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=80&h=80',
              ].map((src, i) => {
                const isSpot = spotlightAvatar === i
                return (
                  <motion.div
                    key={i}
                    animate={{
                      y: isSpot ? -7 : 0,
                      scale: isSpot ? 1.18 : 1,
                      zIndex: isSpot ? 20 : 10 - i,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 22,
                    }}
                    style={{
                      position: 'relative',
                      marginRight: '-12px',
                      zIndex: isSpot ? 20 : 10 - i,
                    }}
                    className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-md"
                  >
                    {/* Orange spotlight ring */}
                    <motion.div
                      animate={{
                        opacity: isSpot ? 1 : 0,
                        scale: isSpot ? 1 : 0.85,
                      }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{
                        boxShadow: '0 0 0 2px #F15A24, 0 0 10px 2px rgba(241,90,36,0.5)',
                        zIndex: 2,
                      }}
                    />
                    <img
                      src={src}
                      alt={fmt(t.hero.avatarAlt, { n: i + 1 })}
                      className="w-full h-full object-cover"
                      width={36}
                      height={36}
                      // Acima da dobra: lazy atrasava a imagem e ela virava o LCP da página
                      loading="eager"
                    />
                  </motion.div>
                )
              })}
            </div>
            <span className="ml-4 opacity-80">{config.socialClients}</span>
          </div>

          <div className="w-px h-4 bg-foreground/10 hidden sm:block" />

          {/* Stars wave */}
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                animate={{
                  scale: activeStar === i ? 1.55 : 1,
                  filter: activeStar === i
                    ? 'drop-shadow(0 0 6px rgba(241,90,36,0.9))'
                    : 'drop-shadow(0 0 0px rgba(241,90,36,0))',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 18,
                }}
                style={{ display: 'inline-flex' }}
              >
                <Star size={15} className="text-orange fill-orange" />
              </motion.span>
            ))}
            <span className="ml-1">{config.socialRating}</span>
          </div>

          {/* Resultados (admin → Hero → "Resultados"); só aparece se preenchido */}
          {config.socialRevenue?.trim() && (
            <>
              <div className="w-px h-4 bg-foreground/10 hidden sm:block" />
              <span className="opacity-80">{config.socialRevenue}</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
    </section>
  )
}

