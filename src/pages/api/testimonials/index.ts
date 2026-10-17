import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { prisma } from "../../../lib/prisma"
import { findInlineImageField, inlineImageError } from "../../../lib/inlineImages"
import { revalidatePublic, HOME_PATH } from '@/lib/revalidate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method === "GET") {
    try {
      const testimonials = await prisma.testimonial.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      })
      return res.status(200).json(testimonials)
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar depoimentos" })
    }
  }

  if (req.method === "POST") {
    const inline = findInlineImageField(req.body, ["avatarUrl"])
    if (inline) return res.status(400).json({ error: inlineImageError(inline) })

    try {
      const { authorName, authorRole, content, rating, avatarUrl, highlight, caseSlug, deliverables } = req.body
      
      const count = await prisma.testimonial.count()

      const testimonial = await prisma.testimonial.create({
        data: {
          authorName,
          authorRole,
          content,
          rating: rating || 5,
          order: count,
          avatarUrl,
          highlight: highlight || '',
          caseSlug: caseSlug || '',
          deliverables: deliverables || '',
        },
      })
      await revalidatePublic(res, [HOME_PATH])
      return res.status(201).json(testimonial)
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar depoimento" })
    }
  }

  res.setHeader("Allow", ["GET", "POST"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
