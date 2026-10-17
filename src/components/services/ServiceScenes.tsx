import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { Check, Hash, MousePointer2, PenTool, Play, Type } from 'lucide-react'
import { BRAND_ICONS } from '@/lib/brandIcons'
import { fmt, useI18n } from '@/lib/i18n'
import type { Dict } from '@/locales/pt-BR'
import s from './ServiceScenes.module.css'

/* Cenas dos serviços principais: interfaces abstratas em vetor (CSS/SVG), em azul-marinho e laranja, sem imagens.
   Cada cena tem uma ação: botões de verdade, com nome acessível; o resto é decoração (aria-hidden).
   O controle da ação pulsa (.beacon) até a primeira interação, que a cena avisa por onAct (o selo fica em ServiceStage).
   `play` liga as animações só enquanto o card está na tela. O estilo base de cada elemento é o quadro final,
   que é o que aparece com "reduzir movimento". */

export interface SceneProps {
  play: boolean
  /** Já houve a primeira interação: o anel do controle para de pulsar */
  acted: boolean
  onAct: () => void
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Conta para o leitor de tela o que a ação mudou. */
const Live = ({ text }: { text: string }) => (
  <span className="sr-only" aria-live="polite">
    {text}
  </span>
)

const Dots = () => (
  <span className={s.dots} aria-hidden="true">
    <i />
    <i />
    <i />
  </span>
)

/* ── Aplicativos e sistemas: o código é digitado; "Rodar" compila e o painel e o celular ganham vida ── */

type SceneText = Dict['scenes']

// O código de exemplo também muda de idioma (nomes de funções e textos)
const code = (d: SceneText['apps']) =>
  [
    [['k', 'const '], ['v', 'app'], ['p', ' = '], ['f', d.createApp], ['p', '()']],
    [['v', 'app'], ['p', '.'], ['f', d.panelFn], ['p', '('], ['s', d.ordersArg], ['p', ')']],
    [['v', 'app'], ['p', '.'], ['f', d.chartFn], ['p', '('], ['s', d.weekArg], ['p', ')']],
    [['v', 'app'], ['p', '.'], ['f', d.notifyFn], ['p', '('], ['s', d.newOrderArg], ['p', ')']],
  ] as const

const ORDERS = [14, 22, 18, 27, 32]
const PEAK = 32
// Linha de tendência passando pelo topo das barras (as barras ocupam até 78% da altura)
const TREND = ORDERS.map((v, i) => `${i * 20 + 10},${(100 - (v / PEAK) * 78).toFixed(1)}`).join(' ')

function AppsScene({ play, acted, onAct }: SceneProps) {
  const d = useI18n().t.scenes.apps
  const CODE = code(d)
  const days = d.days.split(',')
  const WEEK = ORDERS.map((v, i) => ({ d: days[i], v }))
  const [state, setState] = useState<'idle' | 'build' | 'live'>('idle')
  const [run, setRun] = useState(0)
  const [bar, setBar] = useState(-1)
  const [tabBar, setTabBar] = useState(ORDERS.length - 1)
  const timer = useRef<number>()
  const bars = useRef<(HTMLButtonElement | null)[]>([])
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const live = state === 'live'

  const rodar = () => {
    onAct()
    window.clearTimeout(timer.current)
    setBar(-1)
    setRun((n) => n + 1)
    if (reducedMotion()) return setState('live')
    setState('build')
    timer.current = window.setTimeout(() => setState('live'), 900)
  }
  const arrows = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: ORDERS.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    const j = Math.max(0, Math.min(ORDERS.length - 1, next))
    setTabBar(j)
    bars.current[j]?.focus()
  }

  return (
    <div className={s.scene} data-play={play ? '1' : '0'} data-acted={acted ? '' : undefined} data-state={state}>
      <div className={s.back}>
        <div className={s.editor}>
          <div className={s.tabs}>
            <Dots />
            <span className={s.file} aria-hidden="true">
              app.ts
            </span>
            <button type="button" className={`${s.run} ${s.beacon}`} onClick={rodar} aria-label={d.runLabel}>
              <Play aria-hidden="true" />
              {d.run}
            </button>
          </div>
          <span className={s.buildBar} aria-hidden="true" />
          <pre className={s.code} aria-hidden="true">
            {CODE.map((line, i) => (
              <span key={i} className={s.line}>
                <em>{i + 1}</em>
                <span className={s.typed} style={{ '--i': i } as CSSProperties}>
                  {line.map(([t, txt], j) => (
                    <span key={j} className={s[t]}>
                      {txt}
                    </span>
                  ))}
                  {i === CODE.length - 1 && <span className={s.caret} />}
                </span>
              </span>
            ))}
          </pre>
          <p className={s.term} aria-hidden="true">
            $ npm run app
            <b />
          </p>
        </div>
      </div>

      <div className={s.mid}>
        <div className={s.dash} key={run}>
          <div className={s.dashHead} aria-hidden="true">
            <b>{d.panel}</b>
            <span>{d.thisWeek}</span>
          </div>
          <div className={s.kpis} aria-hidden="true">
            <div>
              <span>{d.orders}</span>
              <b className={s.num} style={{ '--v': 113 } as CSSProperties} />
            </div>
            <div>
              <span>{d.today}</span>
              <b className={s.num} style={{ '--v': 32 } as CSSProperties} />
            </div>
          </div>
          <div className={s.chart} role="group" aria-label={d.ordersPerDay} onPointerLeave={() => setBar(-1)}>
            {WEEK.map((w, i) => (
              <button
                key={w.d}
                ref={(el) => {
                  bars.current[i] = el
                }}
                type="button"
                className={s.bar}
                disabled={!live}
                tabIndex={i === tabBar ? 0 : -1}
                aria-label={fmt(d.barLabel, { day: w.d, n: w.v })}
                data-on={bar === i ? '' : undefined}
                style={{ '--h': w.v / PEAK, '--i': i } as CSSProperties}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setBar(i)}
                onClick={() => setBar(i)}
                onFocus={() => {
                  setBar(i)
                  setTabBar(i)
                }}
                onKeyDown={(e) => arrows(e, i)}
              >
                <span className={s.tip} aria-hidden="true">
                  {w.v}
                </span>
                <span className={s.fill} aria-hidden="true" />
              </button>
            ))}
            <svg className={s.trend} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={TREND} pathLength={100} />
            </svg>
          </div>
        </div>
      </div>

      <div className={s.front}>
        <div className={s.phone} aria-hidden="true">
          <div className={s.phoneScreen}>
            <span className={s.notch} />
            <div className={s.appBar}>
              <i />
              {d.orders}
            </div>
            <div className={s.rows}>
              <i />
              <i />
              <i />
            </div>
            <div className={s.notif} key={run}>
              <span>
                <Check />
              </span>
              <p>
                <b>{d.newOrder}</b>
                {d.now}
              </p>
            </div>
          </div>
        </div>
      </div>
      <Live text={state === 'build' ? d.building : live ? d.live : ''} />
    </div>
  )
}

/* ── Sites institucionais: arraste entre o wireframe e o site pronto; no fim, a velocidade fecha no verde ── */

function SiteLayout({ built }: { built?: boolean }) {
  const d = useI18n().t.scenes.sites
  return (
    <>
      <div className={s.siteNav}>
        <i />
        <span>
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className={s.siteHero}>
        <div className={s.siteCopy}>
          {built ? <b>{d.heroTitle}</b> : <span className={s.wireTitle}><i /><i /></span>}
          <span className={s.siteLines}>
            <i />
            <i />
          </span>
          <span className={s.siteBtn}>{built ? d.heroButton : ''}</span>
        </div>
        <div className={s.siteImg}>
          {built ? (
            <>
              <i />
              <i />
              <i />
            </>
          ) : (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 0 L100 100 M100 0 L0 100" />
            </svg>
          )}
        </div>
      </div>
      <div className={s.siteCards}>
        <i />
        <i />
        <i />
      </div>
    </>
  )
}

function SitesScene({ play, acted, onAct }: SceneProps) {
  const d = useI18n().t.scenes.sites
  const [pos, setPos] = useState(36)
  const area = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null)
  const done = pos >= 99

  const set = (v: number) => {
    setPos(Math.max(0, Math.min(100, Math.round(v))))
    onAct()
  }
  const at = (clientX: number) => {
    const r = area.current!.getBoundingClientRect()
    return ((clientX - r.left) / r.width) * 100
  }
  // Mouse arrasta direto. No toque, só o gesto horizontal mexe no slider: o vertical continua rolando a página.
  const down = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false }
    if (e.pointerType === 'mouse') {
      e.currentTarget.setPointerCapture(e.pointerId)
      set(at(e.clientX))
    }
  }
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    if (e.pointerType !== 'mouse' && !d.moved) {
      const dx = Math.abs(e.clientX - d.x)
      if (Math.abs(e.clientY - d.y) > dx) return void (drag.current = null)
      if (dx < 6) return
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    d.moved = true
    set(at(e.clientX))
  }
  const up = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (d && !d.moved && e.pointerType !== 'mouse') set(at(e.clientX))
    drag.current = null
  }
  const key = (e: KeyboardEvent<HTMLSpanElement>) => {
    const step = ({ ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, PageUp: 20, PageDown: -20 } as Record<string, number>)[e.key]
    if (step) set(pos + step)
    else if (e.key === 'Home') set(0)
    else if (e.key === 'End') set(100)
    else if (e.key === 'Enter' || e.key === ' ') set(done ? 0 : 100)
    else return
    e.preventDefault()
  }

  return (
    <div
      className={s.scene}
      data-play={play ? '1' : '0'}
      data-acted={acted ? '' : undefined}
      data-done={done ? '' : undefined}
      style={{ '--pos': pos, '--g': done ? 100 : pos * 0.8 } as CSSProperties}
    >
      <div className={s.back}>
        <div className={s.browser}>
          <div className={s.chromeBar} aria-hidden="true">
            <Dots />
            <span className={s.url}>{d.url}</span>
          </div>
          <div
            ref={area}
            className={s.compare}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => {
              drag.current = null
            }}
          >
            <div className={s.wire} aria-hidden="true">
              <SiteLayout />
            </div>
            <div className={s.built} aria-hidden="true">
              <SiteLayout built />
            </div>
            <span className={s.divider} aria-hidden="true" />
            <span
              role="slider"
              tabIndex={0}
              className={`${s.knob} ${s.beacon}`}
              aria-label={d.slider}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={pos}
              aria-valuetext={fmt(d.sliderValue, { n: pos })}
              onKeyDown={key}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      <div className={s.front}>
        <div className={s.gauge} aria-hidden="true">
          <span className={s.ring}>
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" pathLength={100} />
              <circle cx="18" cy="18" r="15" pathLength={100} />
            </svg>
            <Check />
          </span>
          {d.speed}
        </div>
      </div>
      <Live text={done ? d.done : ''} />
    </div>
  )
}

/* ── Landing pages: o botão principal é "magnético" e o clique vira pedido no WhatsApp ── */

function LandingScene({ play, acted, onAct }: SceneProps) {
  const d = useI18n().t.scenes.landing
  const [sent, setSent] = useState(false)
  const [run, setRun] = useState(0)
  const btn = useRef<HTMLButtonElement>(null)
  const shift = useRef({ x: 0, y: 0 })

  const pull = (x: number, y: number) => {
    shift.current = { x, y }
    btn.current?.style.setProperty('--bx', `${x.toFixed(1)}px`)
    btn.current?.style.setProperty('--by', `${y.toFixed(1)}px`)
  }
  // Perto do botão, ele segue o mouse um pouco (só com mouse; o centro desconta o deslocamento atual)
  const magnet = (e: PointerEvent<HTMLDivElement>) => {
    const b = btn.current
    if (!b || e.pointerType !== 'mouse' || reducedMotion()) return
    const r = b.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2 - shift.current.x)
    const dy = e.clientY - (r.top + r.height / 2 - shift.current.y)
    if (Math.hypot(dx, dy) > r.width * 0.9) return pull(0, 0)
    pull(Math.max(-10, Math.min(10, dx * 0.2)), Math.max(-8, Math.min(8, dy * 0.3)))
  }
  const toggle = () => {
    onAct()
    setSent((v) => !v)
    setRun((n) => n + 1)
  }

  return (
    <div
      className={s.scene}
      data-play={play ? '1' : '0'}
      data-acted={acted ? '' : undefined}
      data-sent={sent ? '' : undefined}
      onPointerMove={magnet}
      onPointerLeave={() => pull(0, 0)}
    >
      <div className={s.back}>
        <div className={s.lp}>
          <div className={s.lpBar} aria-hidden="true">
            <i />
            <span />
            <span />
          </div>
          <div className={s.lpBody}>
            <div className={s.lpHero} aria-hidden="true">
              <span className={s.tag}>{d.tag}</span>
              <b>{d.title}</b>
              <span className={s.lpLines}>
                <i />
                <i />
              </span>
            </div>
            <div className={s.lpDone} aria-hidden="true" key={run}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M7.5 12.5l3 3 6-6.5" pathLength={1} />
              </svg>
              <b>{d.received}</b>
              <span>{d.receivedText}</span>
            </div>
            <span className={s.ctaWrap}>
              <button ref={btn} type="button" className={`${s.cta} ${s.beacon}`} onClick={toggle}>
                {sent ? d.again : d.cta}
              </button>
            </span>
            <span className={s.lpProof} aria-hidden="true">
              <i />
              <i />
              <i />
              <span />
            </span>
          </div>
        </div>
      </div>
      <div className={s.front}>
        <div className={s.chat} aria-hidden="true">
          <div className={s.chatHead}>
            <span className={s.wa}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d={BRAND_ICONS.whatsapp} />
              </svg>
            </span>
            WhatsApp
          </div>
          <div className={s.msgs}>
            <i />
            <i />
            <p className={s.msgNew} key={run}>
              {d.message}
              <span>{d.now}</span>
            </p>
          </div>
        </div>
      </div>
      <Live text={sent ? d.done : ''} />
    </div>
  )
}

/* ── UX/UI e design system: os modos das variables trocam a identidade da tela; no desktop, arraste componentes ── */

const MODES = [
  {
    label: 'Laranja',
    vars: { '--ms-bg': '#0f172a', '--ms-ink': '#f1f5f9', '--ms-muted': '#94a3b8', '--ms-card': '#18233f', '--ms-line': 'rgb(255 255 255 / 0.08)', '--brand': '#c9440e', '--on-brand': '#ffffff', '--brand-soft': 'rgb(241 90 36 / 0.28)', '--rb': '0.5em', '--rc': '0.7em', '--ff': 'inherit' },
    font: 'Sans',
  },
  {
    label: 'Azul',
    vars: { '--ms-bg': '#ffffff', '--ms-ink': '#0f172a', '--ms-muted': '#475569', '--ms-card': '#f1f5f9', '--ms-line': 'rgb(15 23 42 / 0.08)', '--brand': '#2563eb', '--on-brand': '#ffffff', '--brand-soft': '#dbeafe', '--rb': '99px', '--rc': '1em', '--ff': 'inherit' },
    font: 'Sans',
  },
  {
    label: 'Verde',
    vars: { '--ms-bg': '#f5f1e8', '--ms-ink': '#1c1917', '--ms-muted': '#57534e', '--ms-card': '#fffdf7', '--ms-line': 'rgb(28 25 23 / 0.12)', '--brand': '#166534', '--on-brand': '#ffffff', '--brand-soft': '#dcfce7', '--rb': '2px', '--rc': '2px', '--ff': "Georgia, 'Times New Roman', serif" },
    font: 'Serif',
  },
  {
    label: 'Roxo',
    vars: { '--ms-bg': '#faf5ff', '--ms-ink': '#2e1065', '--ms-muted': '#6b21a8', '--ms-card': '#ffffff', '--ms-line': 'rgb(46 16 101 / 0.1)', '--brand': '#7c3aed', '--on-brand': '#ffffff', '--brand-soft': '#ede9fe', '--rb': '0.8em', '--rc': '1.2em', '--ff': "ui-rounded, 'SF Pro Rounded', system-ui, sans-serif" },
    font: 'Arredondada',
  },
] as const

const PART_IDS = ['botao', 'cartao', 'aviso'] as const
type Part = (typeof PART_IDS)[number]

function Dropped({ part, d }: { part: Part; d: SceneText['design'] }) {
  if (part === 'botao') return <span className={s.msGhost}>{d.reschedule}</span>
  if (part === 'aviso') return <span className={s.msToast}>{d.confirmed}</span>
  return (
    <span className={s.msCard}>
      <i />
      <span>
        <b>{d.reminder}</b>
        <small>{d.reminderText}</small>
      </span>
    </span>
  )
}

function DesignScene({ play, acted, onAct }: SceneProps) {
  const d = useI18n().t.scenes.design
  const modeNames = d.modes.split(',')
  const modeName = (i: number) => modeNames[i] || MODES[i].label
  const fontName = (i: number) => (MODES[i].font === 'Arredondada' ? d.fontRounded : MODES[i].font)
  const PARTS = [
    { id: 'botao' as Part, label: d.button },
    { id: 'cartao' as Part, label: d.card },
    { id: 'aviso' as Part, label: d.toast },
  ]
  const [mode, setMode] = useState(0)
  const [part, setPart] = useState<Part | null>(null)
  const [dragging, setDragging] = useState<Part | null>(null)
  const [said, setSaid] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const ghost = useRef<HTMLSpanElement>(null)
  const gesture = useRef({ x: 0, y: 0, moved: false, over: false })

  const pick = (i: number) => {
    setMode(i)
    onAct()
    setSaid(fmt(d.modeApplied, { mode: modeName(i) }))
  }
  const drop = (p: Part) => {
    setPart(p)
    onAct()
    setSaid(fmt(d.partAdded, { part: PARTS.find((x) => x.id === p)!.label }))
  }
  const follow = (e: PointerEvent) => {
    const r = root.current!.getBoundingClientRect()
    ghost.current!.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`
    const f = frame.current!.getBoundingClientRect()
    const over = e.clientX > f.left && e.clientX < f.right && e.clientY > f.top && e.clientY < f.bottom
    gesture.current.over = over
    frame.current!.toggleAttribute('data-over', over)
  }
  // Arrastar só com mouse/caneta (pointer events); no toque, o toque no item já o coloca na tela
  const down = (e: PointerEvent<HTMLButtonElement>, p: Part) => {
    if (e.pointerType === 'touch' || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    gesture.current = { x: e.clientX, y: e.clientY, moved: false, over: false }
    setDragging(p)
    follow(e)
  }
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return
    const g = gesture.current
    if (!g.moved && Math.hypot(e.clientX - g.x, e.clientY - g.y) > 4) g.moved = true
    follow(e)
  }
  const end = () => {
    if (dragging && gesture.current.moved && gesture.current.over) drop(dragging)
    frame.current?.removeAttribute('data-over')
    setDragging(null)
    // O click que vem logo depois de um arraste não deve colocar o componente de novo
    window.setTimeout(() => (gesture.current.moved = false))
  }
  const click = (p: Part) => {
    if (!gesture.current.moved) drop(p)
  }

  return (
    <div
      ref={root}
      className={s.scene}
      data-play={play ? '1' : '0'}
      data-acted={acted ? '' : undefined}
      data-dragging={dragging ? '' : undefined}
    >
      <div className={s.back}>
        <div className={s.win}>
          <div className={s.toolbar} aria-hidden="true">
            <MousePointer2 className={s.toolOn} />
            <Hash />
            <Type />
            <PenTool />
            <span className={s.fileName}>{d.fileName}</span>
            <span className={s.avatars}>
              <i />
              <i />
            </span>
          </div>
          <div className={s.body}>
            <div className={s.parts}>
              <p className={s.panelTitle} aria-hidden="true">
                {d.components}
              </p>
              {PARTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={s.part}
                  aria-label={fmt(d.addPart, { part: p.label })}
                  onPointerDown={(e) => down(e, p.id)}
                  onPointerMove={move}
                  onPointerUp={end}
                  onPointerCancel={end}
                  onClick={() => click(p.id)}
                >
                  <i aria-hidden="true" />
                  {p.label}
                </button>
              ))}
            </div>
            <div className={s.canvas}>
              <span className={s.frameName} aria-hidden="true">
                {d.frameName}
              </span>
              <div ref={frame} className={s.frame} style={MODES[mode].vars as CSSProperties} aria-hidden="true">
                <span className={s.msTop}>
                  <i />
                  {d.agenda}
                </span>
                <b className={s.msTitle}>{d.nextVisit}</b>
                <span className={s.msCard}>
                  <i />
                  <span>
                    <b>{d.when}</b>
                    <small>{d.where}</small>
                  </span>
                </span>
                <span className={s.msBtn}>{d.confirm}</span>
                <span className={s.slot} key={part ?? 'vazio'}>
                  {part ? <Dropped part={part} d={d} /> : <span className={s.dropHere}>{d.dropHere}</span>}
                </span>
              </div>
            </div>
            <div className={s.vars}>
              <p className={s.panelTitle} aria-hidden="true">
                {d.variables}
              </p>
              <div className={s.modes}>
                <div role="group" aria-label={d.brandMode} className={`${s.dotRow} ${s.beacon}`}>
                  {MODES.map((m, i) => (
                    <button
                      key={m.label}
                      type="button"
                      className={s.dot}
                      aria-label={fmt(d.modeLabel, { mode: modeName(i) })}
                      aria-pressed={mode === i}
                      onClick={() => pick(i)}
                      style={{ '--a': m.vars['--brand'], '--b': m.vars['--ms-bg'] } as CSSProperties}
                    />
                  ))}
                </div>
              </div>
              <dl className={s.tokens} aria-hidden="true" style={MODES[mode].vars as CSSProperties}>
                <div>
                  <dt>{d.mode}</dt>
                  <dd>{modeName(mode)}</dd>
                </div>
                <div>
                  <dt>{d.color}</dt>
                  <dd>
                    <i />
                    {MODES[mode].vars['--brand']}
                  </dd>
                </div>
                <div>
                  <dt>{d.font}</dt>
                  <dd>{fontName(mode)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
      <div className={s.front} aria-hidden="true">
        <MousePointer2 className={s.collab} />
      </div>
      <span ref={ghost} className={s.ghost} aria-hidden="true" data-on={dragging ? '' : undefined}>
        {PARTS.find((p) => p.id === dragging)?.label}
      </span>
      <Live text={said} />
    </div>
  )
}

/** Nome da cena e texto do selo "Experimente": verbo para mouse e para toque, e o alvo da ação. */
export interface SceneHint {
  label: string
  mouse: string
  touch: string
  what: string
  play?: boolean
}

const hintOf = (d: { label: string; hintMouse: string; hintTouch: string; hintWhat: string }, play = false): SceneHint => ({
  label: d.label,
  mouse: d.hintMouse,
  touch: d.hintTouch,
  what: d.hintWhat,
  play,
})

export const SCENES: Record<string, { Scene: (p: SceneProps) => JSX.Element; hint: (t: Dict) => SceneHint }> = {
  apps: { Scene: AppsScene, hint: (t) => hintOf(t.scenes.apps, true) },
  sites: { Scene: SitesScene, hint: (t) => hintOf(t.scenes.sites) },
  landing: { Scene: LandingScene, hint: (t) => hintOf(t.scenes.landing) },
  design: { Scene: DesignScene, hint: (t) => hintOf(t.scenes.design) },
}
