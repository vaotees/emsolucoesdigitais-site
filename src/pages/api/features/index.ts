import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { prisma } from "../../../lib/prisma"
import { revalidatePublic, HOME_PATH } from '@/lib/revalidate'
import { serviceExtras } from '@/lib/services'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET is public — used by the Landing Page for SSR
  if (req.method !== "GET") {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method === "GET") {
    try {
      const features = await prisma.feature.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      })
      return res.status(200).json(features)
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar features" })
    }
  }

  if (req.method === "POST") {
    try {
      const { title, description, icon, highlight } = req.body
      
      const count = await prisma.feature.count()

      const feature = await prisma.feature.create({
        data: {
          title,
          description,
          icon: icon || "Check",
          highlight: highlight || false,
          ...serviceExtras(req.body || {}),
          order: count,
        },
      })
      await revalidatePublic(res, [HOME_PATH])
      return res.status(201).json(feature)
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar feature" })
    }
  }

  res.setHeader("Allow", ["GET", "POST"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
