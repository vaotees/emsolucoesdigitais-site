import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          dark: '#0A1128',
          navy: '#0F172A',
        },
        orange: {
          DEFAULT: '#F15A24',
          light: '#F7941D',
          dark: '#C23E00',
        },
        // Semantic theme tokens (via CSS variables)
        surface: 'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        foreground: 'var(--color-foreground)',
        'foreground-muted': 'var(--color-foreground-muted)',
        'foreground-subtle': 'var(--color-foreground-subtle)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'orange-gradient': 'linear-gradient(135deg, #F7941D 0%, #F15A24 50%, #C23E00 100%)',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(241,90,36,0.15) 0%, transparent 70%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'orange': '0 0 24px rgba(241,90,36,0.35)',
        'orange-lg': '0 0 48px rgba(241,90,36,0.45)',
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents, addBase }) {
      addBase({
        // Light mode (default)
        ':root': {
          '--color-surface': '#F8FAFC',
          '--color-surface-raised': '#FFFFFF',
          '--color-foreground': '#0F172A',
          '--color-foreground-muted': '#475569',
          '--color-foreground-subtle': '#64748B',
          '--color-border': 'rgba(15,23,42,0.1)',
          '--color-border-subtle': 'rgba(15,23,42,0.06)',
          '--color-input-bg': '#FFFFFF',
          '--color-glass': 'rgba(15,23,42,0.04)',
          '--color-glass-border': 'rgba(15,23,42,0.08)',
          '--scrollbar-track': '#F1F5F9',
          '--scrollbar-thumb': '#F15A24',
        },
        // Dark mode
        '.dark': {
          '--color-surface': '#0A1128',
          '--color-surface-raised': '#0F172A',
          '--color-foreground': '#F1F5F9',
          '--color-foreground-muted': '#94A3B8',
          // #64748B dava 3,6–3,9:1 no fundo escuro (abaixo do mínimo de 4,5:1 da WCAG); este dá ~5:1
          '--color-foreground-subtle': '#7C8BA3',
          '--color-border': 'rgba(255,255,255,0.1)',
          '--color-border-subtle': 'rgba(255,255,255,0.05)',
          '--color-input-bg': '#0F172A',
          '--color-glass': 'rgba(255,255,255,0.05)',
          '--color-glass-border': 'rgba(255,255,255,0.10)',
          '--scrollbar-track': '#0A1128',
          '--scrollbar-thumb': '#F15A24',
        },
      })
      addComponents({
        '.glass-panel': {
          background: 'var(--color-glass)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--color-glass-border)',
          borderRadius: '1rem',
        },
        '.glass-panel-sm': {
          background: 'var(--color-glass)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--color-glass-border)',
          borderRadius: '0.75rem',
        },
        '.text-orange-gradient': {
          background: 'linear-gradient(135deg, #F7941D 0%, #F15A24 50%, #C23E00 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          paddingBottom: '0.15em',
          paddingTop: '0.15em',
          paddingRight: '0.05em',
          marginBottom: '-0.15em',
          marginTop: '-0.15em',
          marginRight: '-0.05em',
        },
        '.btn-orange': {
          // Laranja mais profundo para o texto branco passar de 4,5:1 (o laranja vivo fica nos títulos e destaques)
          background: 'linear-gradient(135deg, #CC4614 0%, #C23E00 55%, #A83400 100%)',
          color: '#FFFFFF',
          fontWeight: '700',
          borderRadius: '9999px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          boxShadow: '0 0 24px rgba(241,90,36,0.35)',
          '&:hover': {
            boxShadow: '0 0 48px rgba(241,90,36,0.55)',
          },
        },
      })
    }),
  ],
}

export default config
