import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'
import { findInlineImageField, inlineImageError } from '../../../lib/inlineImages'
import { revalidatePublic, HOME_PATH } from '@/lib/revalidate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Não autorizado' })

  if (req.method === 'GET') {
    try {
      const config = await prisma.seoConfig.findUnique({ where: { id: 'singleton' } })
      return res.status(200).json(config ?? {})
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Erro interno' })
    }
  }

  if (req.method === 'PATCH') {
    const inline = findInlineImageField(req.body, ['ogImage'])
    if (inline) return res.status(400).json({ message: inlineImageError(inline) })

    const { siteTitle, metaDescription, ogImage, keywords, canonicalUrl, robotsIndex, googleAnalyticsId } = req.body
    try {
      const updated = await prisma.seoConfig.upsert({
        where: { id: 'singleton' },
        create: {
          id: 'singleton',
          siteTitle: siteTitle ?? 'EM Soluções Digitais | Agência Digital Premium',
          metaDescription: metaDescription ?? '',
          ogImage: ogImage ?? '',
          keywords: keywords ?? '',
          canonicalUrl: canonicalUrl ?? '',
          robotsIndex: robotsIndex ?? true,
          googleAnalyticsId: googleAnalyticsId ?? '',
        },
        update: {
          ...(siteTitle !== undefined && { siteTitle }),
          ...(metaDescription !== undefined && { metaDescription }),
          ...(ogImage !== undefined && { ogImage }),
          ...(keywords !== undefined && { keywords }),
          ...(canonicalUrl !== undefined && { canonicalUrl }),
          ...(robotsIndex !== undefined && { robotsIndex }),
          ...(googleAnalyticsId !== undefined && { googleAnalyticsId }),
        },
      })
      await revalidatePublic(res, [HOME_PATH])
      return res.status(200).json(updated)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Erro interno' })
    }
  }

  res.setHeader('Allow', ['GET', 'PATCH'])
  return res.status(405).json({ message: `Método ${req.method} não permitido` })
}
