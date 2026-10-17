// Captura a primeira tela de um site público para montar a capa do case (ver tools/capas/README.md).
// Esconde avisos de cookies e botões flutuantes com CSS (não aceita nem recusa nada) e espera o site assentar.
// Uso: node tools/capas/capturar.mjs <url> <saida.png> <largura> <altura> [espera-ms=5000]
import { spawn } from 'node:child_process'
import { rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'

const [url, out, w, h, wait = '5000'] = process.argv.slice(2)
if (!url || !out || !w || !h) { console.error('uso: capturar.mjs <url> <saida.png> <largura> <altura> [espera-ms]'); process.exit(1) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const port = 9300 + Math.floor(Math.random() * 600)
const profile = `${tmpdir()}/cdp-${port}`
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--hide-scrollbars', '--no-first-run', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
const finish = (code) => { try { chrome.kill('SIGKILL') } catch {} try { rmSync(profile, { recursive: true, force: true }) } catch {} process.exit(code) }
setTimeout(() => { console.error('tempo esgotado'); finish(1) }, 120000)

async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
      const p = list.find((x) => x.type === 'page')
      if (p) { const ws = new WebSocket(p.webSocketDebuggerUrl); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j }); return ws }
    } catch {}
    await sleep(250)
  }
  throw new Error('não conectou ao Chrome')
}
const ws = await connect()
let id = 0
const pending = new Map()
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } }
const send = (method, params = {}) => new Promise((resolve, reject) => { const i = ++id; pending.set(i, (m) => (m.error ? reject(new Error(m.error.message)) : resolve(m.result))); ws.send(JSON.stringify({ id: i, method, params })) })
const ev = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value

const mobile = +w < 768
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: 2, mobile })
if (mobile) await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' })
await send('Page.enable')
await send('Page.navigate', { url })
await sleep(+wait)
// Passa pela página e volta ao topo: dispara imagens preguiçosas e animações de entrada
await ev('window.scrollTo(0, 600)'); await sleep(800); await ev('window.scrollTo(0, 0)'); await sleep(1500)
const hidden = await ev(`(() => {
  let n = 0
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    if (cs.position !== 'fixed' && cs.position !== 'sticky') continue
    const r = el.getBoundingClientRect()
    if (r.top < 120 && r.height < 140) continue // menu fixo do topo fica
    const text = (el.innerText || '').toLowerCase()
    const small = r.width < 90 && r.height < 90 // botões flutuantes (WhatsApp, voltar ao topo)
    if (small || /cookie|privacidade|lgpd|consent/.test(text)) { el.style.setProperty('display', 'none', 'important'); n++ }
  }
  return n
})()`)
await sleep(400)
const { data } = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync(out, Buffer.from(data, 'base64'))
console.log(out, `(${hidden} elementos flutuantes escondidos)`)
finish(0)
