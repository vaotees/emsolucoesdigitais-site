import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { prisma } from "../../../lib/prisma"
import { revalidatePublic, HOME_PATH, CASES_PATH } from '@/lib/revalidate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { ids } = req.body as { ids: string[] }
  if (!Array.isArray(ids)) return res.status(400).json({ error: "ids must be an array" })

  try {
    await Promise.all(
      ids.map((id, index) =>
        prisma.clientProject.update({ where: { id }, data: { order: index } })
      )
    )
    await revalidatePublic(res, [HOME_PATH, CASES_PATH])
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Erro ao reordenar projetos" })
  }
}
