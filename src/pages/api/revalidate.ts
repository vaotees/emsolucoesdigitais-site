import { timingSafeEqual } from 'crypto'
import type { NextApiRequest, NextApiResponse } from 'next'
import { inAllLocales } from '@/lib/revalidate'

/* Atualização na hora para os scripts de prisma/ (o admin já atualiza ao salvar, por revalidatePublic).
   POST com "Authorization: Bearer <REVALIDATE_SECRET>" e { "paths": ["/cases/veritas"] }.
   Só aceita as páginas públicas geradas por ISR: /, /cases e /cases/<slug>; cada uma é regerada em todos os idiomas (/en/cases…). */
const PUBLIC_PATH = /^\/(cases(\/[a-z0-9-]+)?)?$/

function authorized(header: string | undefined) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || !header?.startsWith('Bearer ')) return false
  const given = Buffer.from(header.slice('Bearer '.length))
  const expected = Buffer.from(secret)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!authorized(req.headers.authorization)) return res.status(401).json({ error: 'Unauthorized' })

  const paths: unknown[] = Array.isArray(req.body?.paths) ? req.body.paths : []
  const invalid = paths.filter((p) => typeof p !== 'string' || !PUBLIC_PATH.test(p))
  if (!paths.length || invalid.length) return res.status(400).json({ error: 'Caminhos inválidos', invalid })

  const unique = inAllLocales(paths as string[])
  const results = await Promise.allSettled(unique.map((path) => res.revalidate(path)))
  const failed = unique.filter((_, i) => results[i].status === 'rejected')
  results.forEach((result, i) => {
    if (result.status === 'rejected') console.error(`Não foi possível atualizar ${unique[i]}:`, result.reason)
  })
  return res.status(failed.length ? 500 : 200).json({ revalidated: unique.filter((p) => !failed.includes(p)), failed })
}
