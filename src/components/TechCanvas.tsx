'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  wanderAngle: number
  wanderTurn: number
  radius: number
  opacity: number
  pulsePhase: number
  pulseSpeed: number
  isOrange: boolean // predetermined color — no modulo per frame
  cellX: number     // spatial grid cell (updated each frame)
  cellY: number
}

interface TechCanvasProps {
  mode?: 'hero' | 'subtle'
  className?: string
}

const CONFIG = {
  hero: {
    particleCount: 60,
    connectionDistance: 140,
    connectionDistanceSq: 140 * 140,
    mouseRadius: 170,
    mouseRadiusSq: 170 * 170,
    mouseForce: 0.5,
    wanderStrength: 0.005,
    minSpeed: 0.22,
    maxSpeed: 1.0,
    darkBaseOpacity: 0.9,
    darkLineOpacity: 0.3,
    darkNodeRGB: '241,90,36',
    darkAccentRGB: '180,210,255',
    lightBaseOpacity: 0.8,
    lightLineOpacity: 0.26,
    lightNodeRGB: '210,60,5',
    lightAccentRGB: '55,75,170',
    minRadius: 1.8,
    maxRadius: 3.2,
    speed: 0.38,
  },
  subtle: {
    particleCount: 38,
    connectionDistance: 120,
    connectionDistanceSq: 120 * 120,
    mouseRadius: 140,
    mouseRadiusSq: 140 * 140,
    mouseForce: 0.38,
    wanderStrength: 0.004,
    minSpeed: 0.15,
    maxSpeed: 0.85,
    darkBaseOpacity: 0.7,
    darkLineOpacity: 0.2,
    darkNodeRGB: '241,90,36',
    darkAccentRGB: '140,180,255',
    lightBaseOpacity: 0.6,
    lightLineOpacity: 0.16,
    lightNodeRGB: '200,55,5',
    lightAccentRGB: '48,68,155',
    minRadius: 1.4,
    maxRadius: 2.8,
    speed: 0.26,
  },
}

// Mobile overrides: fewer particles, shorter connection distance, same 60fps
const MOBILE_OVERRIDES = {
  particleCount: 35,
  connectionDistance: 100,
  connectionDistanceSq: 100 * 100,
  minSpeed: 0.18,
  maxSpeed: 0.75,
  speed: 0.28,
  darkBaseOpacity: 0.75,
  lightBaseOpacity: 0.65,
  minRadius: 1.5,
  maxRadius: 2.8,
}

type Grid = Map<number, Particle[]>

function cellKey(cx: number, cy: number, cols: number): number {
  return cy * cols + cx
}

function isDarkMode(): boolean {
  if (typeof window === 'undefined') return true
  return (
    document.documentElement.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark' ||
    (!document.documentElement.classList.contains('light') &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  )
}

export default function TechCanvas({ mode = 'hero', className = '' }: TechCanvasProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef    = useRef({ x: -99999, y: -99999 })
  const rafRef      = useRef<number>(0)
  const darkRef     = useRef<boolean>(true)
  const pausedRef   = useRef<boolean>(false)
  // cfg lives in a ref so mobile detection can update it without restarting the rAF loop
  const cfgRef      = useRef(CONFIG[mode])
  const cellSizeRef = useRef(CONFIG[mode].connectionDistance)

  // initParticles reads cfgRef at call time — no stale closure issues
  const initParticles = useCallback((w: number, h: number) => {
    const cfg = cfgRef.current
    particlesRef.current = Array.from({ length: cfg.particleCount }, (_, i) => {
      const angle = Math.random() * Math.PI * 2
      const sp = cfg.speed * (0.5 + Math.random() * 0.5)
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * sp,
        vy: Math.sin(angle) * sp,
        wanderAngle: angle,
        wanderTurn: (0.003 + Math.random() * 0.005) * (Math.random() < 0.5 ? 1 : -1),
        radius: cfg.minRadius + Math.random() * (cfg.maxRadius - cfg.minRadius),
        opacity: 0.55 + Math.random() * 0.45,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.012 + Math.random() * 0.016,
        isOrange: i % 3 !== 0,
        cellX: 0,
        cellY: 0,
      }
    })
  }, []) // stable — reads ref, not prop

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let w = 0, h = 0, cols = 0

    function resize() {
      const parent = canvas!.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1)
      w = parent.clientWidth
      h = parent.clientHeight
      canvas!.width  = w * dpr
      canvas!.height = h * dpr
      canvas!.style.width  = w + 'px'
      canvas!.style.height = h + 'px'
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / cellSizeRef.current) + 1
      initParticles(w, h)
    }

    // Detect mobile once — update cfgRef before first resize so initParticles uses correct count
    const mobile = window.innerWidth < 768
    if (mobile) {
      cfgRef.current    = { ...CONFIG[mode], ...MOBILE_OVERRIDES }
      cellSizeRef.current = cfgRef.current.connectionDistance
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)

    const io = new IntersectionObserver(
      (entries) => { pausedRef.current = !entries[0].isIntersecting },
      { threshold: 0 }
    )
    io.observe(canvas)

    const onVisibility = () => { pausedRef.current = document.hidden }
    document.addEventListener('visibilitychange', onVisibility)

    const themeObs = new MutationObserver(() => { darkRef.current = isDarkMode() })
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] })
    darkRef.current = isDarkMode()

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas!.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMouseLeave = () => { mouseRef.current = { x: -99999, y: -99999 } }
    const onTouch = (e: TouchEvent) => {
      if (!e.touches.length) return
      const rect = canvas!.getBoundingClientRect()
      mouseRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    const onTouchEnd = () => { mouseRef.current = { x: -99999, y: -99999 } }

    window.addEventListener('mousemove',  onMouseMove,  { passive: true })
    window.addEventListener('mouseleave', onMouseLeave, { passive: true })
    window.addEventListener('touchmove',  onTouch,      { passive: true })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true })

    const grid: Grid = new Map()

    function draw() {
      rafRef.current = requestAnimationFrame(draw)
      if (pausedRef.current) return

      const cfg      = cfgRef.current
      const cellSize = cellSizeRef.current

      ctx!.clearRect(0, 0, w, h)
      grid.clear()

      const particles = particlesRef.current
      const mx   = mouseRef.current.x
      const my   = mouseRef.current.y
      const dark = darkRef.current

      const baseOpacity = dark ? cfg.darkBaseOpacity : cfg.lightBaseOpacity
      const lineOpacity = dark ? cfg.darkLineOpacity : cfg.lightLineOpacity
      const nodeRGB     = dark ? cfg.darkNodeRGB     : cfg.lightNodeRGB
      const accentRGB   = dark ? cfg.darkAccentRGB   : cfg.lightAccentRGB

      // ── Update + grid assignment ─────────────────────────
      for (const p of particles) {
        p.wanderAngle += p.wanderTurn
        p.vx += (Math.cos(p.wanderAngle) * cfg.speed - p.vx) * cfg.wanderStrength
        p.vy += (Math.sin(p.wanderAngle) * cfg.speed - p.vy) * cfg.wanderStrength

        // Mouse / touch repulsion
        const dx = p.x - mx
        const dy = p.y - my
        const distSq = dx * dx + dy * dy
        if (distSq < cfg.mouseRadiusSq && distSq > 0) {
          const dist  = Math.sqrt(distSq)
          const force = (cfg.mouseRadius - dist) / cfg.mouseRadius
          p.vx += (dx / dist) * force * cfg.mouseForce
          p.vy += (dy / dist) * force * cfg.mouseForce
        }

        p.vx *= 0.99
        p.vy *= 0.99

        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (spd < cfg.minSpeed && spd > 0) {
          const s = cfg.minSpeed / spd; p.vx *= s; p.vy *= s
        } else if (spd > cfg.maxSpeed) {
          const s = cfg.maxSpeed / spd; p.vx *= s; p.vy *= s
        }

        p.x += p.vx
        p.y += p.vy
        p.pulsePhase += p.pulseSpeed

        if (p.x < 0) { p.x = 0; p.vx =  Math.abs(p.vx); p.wanderAngle = Math.PI - p.wanderAngle }
        if (p.x > w) { p.x = w; p.vx = -Math.abs(p.vx); p.wanderAngle = Math.PI - p.wanderAngle }
        if (p.y < 0) { p.y = 0; p.vy =  Math.abs(p.vy); p.wanderAngle = -p.wanderAngle }
        if (p.y > h) { p.y = h; p.vy = -Math.abs(p.vy); p.wanderAngle = -p.wanderAngle }

        p.cellX = Math.floor(p.x / cellSize)
        p.cellY = Math.floor(p.y / cellSize)
        const key = cellKey(p.cellX, p.cellY, cols)
        if (!grid.has(key)) grid.set(key, [])
        grid.get(key)!.push(p)
      }

      // ── Draw connections ─────────────────────────────────
      for (const p of particles) {
        const rgb = p.isOrange ? nodeRGB : accentRGB

        for (let dcx = -1; dcx <= 1; dcx++) {
          for (let dcy = 0; dcy <= 1; dcy++) {
            if (dcx === -1 && dcy === 0) continue
            const nCell = grid.get(cellKey(p.cellX + dcx, p.cellY + dcy, cols))
            if (!nCell) continue

            for (const q of nCell) {
              if (q === p) continue
              if (dcy === 0 && q.cellX <= p.cellX) continue

              const ddx = p.x - q.x
              const ddy = p.y - q.y
              const dSq = ddx * ddx + ddy * ddy
              if (dSq >= cfg.connectionDistanceSq) continue

              const dist      = Math.sqrt(dSq)
              const proximity = 1 - dist / cfg.connectionDistance

              const midX  = (p.x + q.x) * 0.5
              const midY  = (p.y + q.y) * 0.5
              const mdx   = midX - mx
              const mdy   = midY - my
              const mDSq  = mdx * mdx + mdy * mdy
              const boost = mDSq < cfg.mouseRadiusSq
                ? 1 + (1 - Math.sqrt(mDSq) / cfg.mouseRadius) * 3.5
                : 1

              const alpha = Math.min(proximity * lineOpacity * boost, 0.85)
              ctx!.beginPath()
              ctx!.moveTo(p.x, p.y)
              ctx!.lineTo(q.x, q.y)
              ctx!.strokeStyle = `rgba(${rgb},${alpha})`
              ctx!.lineWidth   = Math.min(0.4 + proximity * 1.2 * boost, 2.5)
              ctx!.stroke()
            }
          }
        }
      }

      // ── Draw nodes ───────────────────────────────────────
      for (const p of particles) {
        const pulse = 0.78 + 0.22 * Math.sin(p.pulsePhase)
        const rgb   = p.isOrange ? nodeRGB : accentRGB
        const alpha = p.opacity * pulse * baseOpacity

        // Mouse / touch glow
        const dx     = p.x - mx
        const dy     = p.y - my
        const distSq = dx * dx + dy * dy
        if (distSq < cfg.mouseRadiusSq) {
          const gf = 1 - Math.sqrt(distSq) / cfg.mouseRadius
          if (gf > 0.06) {
            const gr   = p.radius * 9 * gf
            const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, gr)
            glow.addColorStop(0, `rgba(${nodeRGB},${gf * 0.45})`)
            glow.addColorStop(1, `rgba(${nodeRGB},0)`)
            ctx!.beginPath()
            ctx!.arc(p.x, p.y, gr, 0, Math.PI * 2)
            ctx!.fillStyle = glow
            ctx!.fill()
          }
        }

        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${rgb},${alpha})`
        ctx!.fill()
      }
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      io.disconnect()
      themeObs.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('mousemove',  onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('touchmove',  onTouch)
      window.removeEventListener('touchend',   onTouchEnd)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initParticles]) // cfg/cellSize removed — live in refs, no restart needed
  
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  )
}
