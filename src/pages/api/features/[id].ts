import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { prisma } from "../../../lib/prisma"
import { revalidatePublic, HOME_PATH } from '@/lib/revalidate'
import { serviceExtras } from '@/lib/services'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  const { id } = req.query

  if (req.method === "PUT") {
    try {
      const { title, description, icon, highlight } = req.body
      const feature = await prisma.feature.update({
        where: { id: id as string },
        data: { title, description, icon, highlight: highlight || false, ...serviceExtras(req.body || {}) },
      })
      await revalidatePublic(res, [HOME_PATH])
      return res.status(200).json(feature)
    } catch (error) {
      console.error("ERRO AO ATUALIZAR:", error)
      return res.status(500).json({ error: "Erro ao atualizar feature" })
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.feature.delete({ where: { id: id as string } })
      await revalidatePublic(res, [HOME_PATH])
      return res.status(204).end()
    } catch {
      return res.status(500).json({ error: "Erro ao deletar feature" })
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
