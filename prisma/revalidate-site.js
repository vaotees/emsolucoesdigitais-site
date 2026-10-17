/**
 * Atualiza na hora as páginas públicas (ISR) depois que um script grava no banco.
 * Usa a rota /api/revalidate do site com o REVALIDATE_SECRET do .env (o mesmo cadastrado na Vercel).
 * Sem o segredo, ou se a chamada falhar, as páginas se atualizam sozinhas em até 10 minutos.
 *
 * Nos scripts:  const { revalidateSite } = require('./revalidate-site'); await revalidateSite(['/cases/veritas'])
 * Avulso:       node --env-file=.env prisma/revalidate-site.js /cases/veritas /casos /
 */
const SITE_URL = process.env.REVALIDATE_SITE_URL || 'https://emsolucoesdigitais.com.br'

async function revalidateSite(paths) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret) {
    console.log('REVALIDATE_SECRET ausente no .env: as páginas se atualizam sozinhas em até 10 minutos.')
    return false
  }
  try {
    const res = await fetch(`${SITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ paths }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(`${res.status} ${body.error || ''}`.trim())
    console.log(`🔄 Atualizado no site agora: ${body.revalidated.join(', ')}`)
    return true
  } catch (err) {
    console.log(`⚠️  Não deu para atualizar agora (${err.message}): as páginas se atualizam sozinhas em até 10 minutos.`)
    return false
  }
}

module.exports = { revalidateSite }

if (require.main === module) {
  const paths = process.argv.slice(2)
  if (!paths.length) {
    console.error('Uso: node --env-file=.env prisma/revalidate-site.js /cases/<slug> [/casos] [/]')
    process.exit(1)
  }
  revalidateSite(paths).then((ok) => { process.exitCode = ok ? 0 : 1 })
}
