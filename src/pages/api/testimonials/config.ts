import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { prisma } from "../../../lib/prisma"
import { revalidatePublic, HOME_PATH } from '@/lib/revalidate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      let config = await prisma.sectionTestimonialsConfig.findUnique({
        where: { id: "singleton" }
      })

      if (!config) {
        config = await prisma.sectionTestimonialsConfig.create({
          data: { id: "singleton" }
        })
      }

      return res.status(200).json(config)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Erro ao buscar config" })
    }
  }

  if (req.method === "PUT") {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: "Unauthorized" })

    try {
      const { tagline, title1, titleHighlight, description } = req.body
      const config = await prisma.sectionTestimonialsConfig.upsert({
        where: { id: "singleton" },
        update: { tagline, title1, titleHighlight, description },
        create: { id: "singleton", tagline, title1, titleHighlight, description }
      })
      await revalidatePublic(res, [HOME_PATH])
      return res.status(200).json(config)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Erro ao atualizar config" })
    }
  }

  res.setHeader("Allow", ["GET", "PUT"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
