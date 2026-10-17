import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { prisma } from "../../../lib/prisma"
import { revalidatePublic, HOME_PATH } from '@/lib/revalidate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  if (req.method === "POST") {
    try {
      const { ids } = req.body // Array of ids in the new order

      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: "Invalid data" })
      }

      // Update order using a transaction
      await prisma.$transaction(
        ids.map((id, index) =>
          prisma.feature.update({
            where: { id },
            data: { order: index },
          })
        )
      )

      await revalidatePublic(res, [HOME_PATH])
      return res.status(200).json({ success: true })
    } catch (error) {
      console.error("ERRO AO REORDENAR:", error)
      return res.status(500).json({ error: "Erro ao reordenar features" })
    }
  }

  res.setHeader("Allow", ["POST"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
