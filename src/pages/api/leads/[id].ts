import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Não autorizado' })

  const id = req.query.id as string

  if (req.method === 'PATCH') {
    const { status, notes, replied } = req.body
    try {
      const lead = await prisma.lead.update({
        where: { id },
        data: {
          ...(status !== undefined && { status }),
          ...(notes !== undefined && { notes }),
          ...(replied !== undefined && {
            replied,
            repliedAt: replied ? new Date() : null,
          }),
        },
      })
      return res.status(200).json(lead)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Erro interno' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.lead.delete({ where: { id } })
      return res.status(204).end()
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Erro interno' })
    }
  }

  res.setHeader('Allow', ['PATCH', 'DELETE'])
  return res.status(405).json({ message: `Método ${req.method} não permitido` })
}
