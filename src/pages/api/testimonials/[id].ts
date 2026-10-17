import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { prisma } from "../../../lib/prisma"
import { findInlineImageField, inlineImageError } from "../../../lib/inlineImages"
import { revalidatePublic, HOME_PATH } from '@/lib/revalidate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  const { id } = req.query

  if (req.method === "PUT") {
    const inline = findInlineImageField(req.body, ["avatarUrl"])
    if (inline) return res.status(400).json({ error: inlineImageError(inline) })

    try {
      const { authorName, authorRole, content, rating, avatarUrl, highlight, caseSlug, deliverables } = req.body
      const testimonial = await prisma.testimonial.update({
        where: { id: String(id) },
        data: { authorName, authorRole, content, rating, avatarUrl, highlight, caseSlug, deliverables },
      })
      await revalidatePublic(res, [HOME_PATH])
      return res.status(200).json(testimonial)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Erro ao atualizar depoimento" })
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.testimonial.delete({
        where: { id: String(id) },
      })
      await revalidatePublic(res, [HOME_PATH])
      return res.status(204).end()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Erro ao excluir depoimento" })
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
