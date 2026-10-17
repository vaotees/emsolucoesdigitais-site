'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch — only render after mount
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 animate-pulse" />
    )
  }

  const isDark = theme === 'dark'

  return (
    <motion.button
      id="theme-toggle"
      aria-label={isDark ? t.ui.themeLight : t.ui.themeDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`
        relative w-9 h-9 rounded-full flex items-center justify-center
        border transition-all duration-300
        ${isDark
          ? 'bg-white/5 border-white/10 text-slate-400 hover:text-amber-400 hover:border-amber-400/30 hover:bg-amber-400/10'
          : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-orange-500 hover:border-orange-300 hover:bg-orange-50'
        }
      `}
    >
      <AnimatePresence exitBeforeEnter initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun size={15} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon size={15} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
