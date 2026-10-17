'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

export default function BackToTop() {
  const { t } = useI18n()
  const [visible, setVisible] = useState(false)
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      const pct = total > 0 ? (scrolled / total) * 100 : 0
      setScrollPct(pct)
      setVisible(scrolled > 400)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // SVG circle progress
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scrollPct / 100) * circumference

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-to-top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          aria-label={t.ui.backToTop}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 flex items-center justify-center group"
          style={{ filter: 'drop-shadow(0 4px 16px rgba(241,90,36,0.35))' }}
        >
          {/* Progress ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 48 48"
          >
            {/* Track */}
            <circle
              cx="24" cy="24" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2.5"
            />
            {/* Progress */}
            <circle
              cx="24" cy="24" r={radius}
              fill="none"
              stroke="url(#btg)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.15s ease' }}
            />
            <defs>
              <linearGradient id="btg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f15a24" />
                <stop offset="100%" stopColor="#dd5289" />
              </linearGradient>
            </defs>
          </svg>

          {/* Button bg */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(20,20,30,0.92) 0%, rgba(30,20,40,0.88) 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Arrow up */}
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 10 8 5 13 10" />
            </svg>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
