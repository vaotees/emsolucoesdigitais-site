import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Não autorizado' })

  if (req.method === 'GET') {
    try {
      const { status, source, search, page = '1', limit = '20' } = req.query
      const pageN = parseInt(page as string)
      const limitN = parseInt(limit as string)
      const skip = (pageN - 1) * limitN

      const where: Record<string, unknown> = {}
      if (status && status !== 'all') where.status = status
      if (source && source !== 'all') where.source = source
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { whatsapp: { contains: search as string } },
        ]
      }

      const [leads, total] = await Promise.all([
        prisma.lead.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitN,
        }),
        prisma.lead.count({ where }),
      ])

      return res.status(200).json({ leads, total, page: pageN, limit: limitN })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Erro interno' })
    }
  }

  if (req.method === 'POST') {
    // Manual lead creation
    const { name, email, whatsapp, location, service, message, source, status } = req.body
    if (!name || !email) return res.status(400).json({ message: 'Nome e e-mail são obrigatórios' })
    try {
      const lead = await prisma.lead.create({
        data: {
          name,
          email,
          whatsapp: whatsapp ?? '',
          location: location ?? '',
          service: service ?? '',
          message: message ?? '',
          source: source ?? 'manual',
          status: status ?? 'new',
        },
      })
      return res.status(201).json(lead)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Erro interno' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Método ${req.method} não permitido` })
}
