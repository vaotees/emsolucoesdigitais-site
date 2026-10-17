import type { NextApiResponse } from 'next'
import { LOCALES, localePath } from '@/lib/i18n'

/* Páginas públicas geradas estaticamente (ISR) e servidas pela CDN da Vercel.
   O admin chama revalidatePublic depois de salvar, e a versão nova já sai no próximo acesso.
   Os scripts de prisma/ chamam /api/revalidate (prisma/revalidate-site.js) e também atualizam na hora.
   REVALIDATE_SECONDS é a rede de segurança para o resto: aparece em até 10 minutos. */
export const REVALIDATE_SECONDS = 600

export const HOME_PATH = '/'
export const CASES_PATH = '/cases'
export const casePath = (slug?: string | null) => (slug ? `/cases/${slug}` : '')

/** Cada página existe em todos os idiomas: '/cases' → ['/cases', '/en/cases']. */
export const inAllLocales = (paths: string[]) => Array.from(new Set(paths.filter(Boolean).flatMap((p) => LOCALES.map((l) => localePath(l, p)))))

/** Regera as páginas indicadas, em todos os idiomas. Uma falha só é registrada: o que foi salvo continua salvo. */
export async function revalidatePublic(res: NextApiResponse, paths: string[]) {
  const unique = inAllLocales(paths)
  const results = await Promise.allSettled(unique.map((path) => res.revalidate(path)))
  results.forEach((result, i) => {
    if (result.status === 'rejected') console.error(`Não foi possível atualizar ${unique[i]}:`, result.reason)
  })
}

/** No build, um erro de banco não derruba o deploy: a página sai com o conteúdo padrão e é refeita em seguida.
    Fora do build, o erro sobe e a Vercel continua servindo a última versão boa. */
export const isBuildPhase = () => process.env.NEXT_PHASE === 'phase-production-build'
