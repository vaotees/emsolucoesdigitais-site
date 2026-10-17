import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import { prisma } from "../../../lib/prisma"
import { findInlineImageField, inlineImageError, PROJECT_IMAGE_FIELDS } from "../../../lib/inlineImages"
import { normalizeCaseContent } from "../../../lib/caseContent"
import { revalidatePublic, HOME_PATH, CASES_PATH, casePath } from '@/lib/revalidate'

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  const { id } = req.query

  if (req.method === "GET") {
    try {
      const project = await prisma.clientProject.findUnique({
        where: { id: id as string },
        include: { highlights: { orderBy: { order: "asc" } } },
      })
      if (!project) return res.status(404).json({ error: "Projeto não encontrado" })
      return res.status(200).json(project)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Erro ao buscar projeto" })
    }
  }

  if (req.method === "PUT") {
    const inline = findInlineImageField(req.body, PROJECT_IMAGE_FIELDS)
    if (inline) return res.status(400).json({ error: inlineImageError(inline) })
    if (req.body?.caseContent && /data:[a-z]+\/[a-z0-9.+-]+;base64/i.test(JSON.stringify(req.body.caseContent))) {
      return res.status(400).json({ error: inlineImageError("caseContent") })
    }

    try {
      const {
        slug, category, clientName, tagline, description, role,
        status, year, liveUrl, caseUrl, mockupCardUrl, mockupHeroUrl, stackTags,
        challengeText, solutionText, impactText, published, highlights,
        brandGuidelinesUrl, logoUrl, logoDownloadUrl, brandColors,
        brandFontHeading, brandFontBody, caseContent
      } = req.body

      // Slug atual: se mudar, a página antiga também precisa sair do ar
      const before = await prisma.clientProject.findUnique({ where: { id: id as string }, select: { slug: true } })

      // Update project fields — only include defined fields to avoid overwriting with undefined
      const project = await prisma.clientProject.update({
        where: { id: id as string },
        data: {
          ...(slug !== undefined && { slug: slug.toLowerCase().replace(/\s+/g, "-") }),
          ...(category !== undefined && { category }),
          ...(clientName !== undefined && { clientName }),
          ...(tagline !== undefined && { tagline }),
          ...(description !== undefined && { description }),
          ...(role !== undefined && { role }),
          ...(status !== undefined && { status }),
          ...(year !== undefined && { year }),
          ...(liveUrl !== undefined && { liveUrl }),
          ...(caseUrl !== undefined && { caseUrl }),
          mockupCardUrl: mockupCardUrl ?? null,
          mockupHeroUrl: mockupHeroUrl ?? null,
          ...(stackTags !== undefined && { stackTags }),
          ...(challengeText !== undefined && { challengeText }),
          ...(solutionText !== undefined && { solutionText }),
          ...(impactText !== undefined && { impactText }),
          ...(brandGuidelinesUrl !== undefined && { brandGuidelinesUrl }),
          ...(logoUrl !== undefined && { logoUrl }),
          ...(logoDownloadUrl !== undefined && { logoDownloadUrl }),
          ...(brandColors !== undefined && { brandColors }),
          ...(brandFontHeading !== undefined && { brandFontHeading }),
          ...(brandFontBody !== undefined && { brandFontBody }),
          ...(published !== undefined && { published: published !== false }),
          // Validado e limitado antes de gravar (tipos, tamanhos, cores, sem base64)
          ...(caseContent !== undefined && caseContent !== null && { caseContent: normalizeCaseContent(caseContent) as any }),
        },
      })

      // Replace highlights if provided
      if (Array.isArray(highlights)) {
        await prisma.clientProjectHighlight.deleteMany({
          where: { projectId: id as string },
        })
        if (highlights.length > 0) {
          await prisma.clientProjectHighlight.createMany({
            data: highlights.map((h: any, idx: number) => ({
              projectId: id as string,
              iconName: h.iconName || "Zap",
              title: h.title || "",
              body: h.body || "",
              order: idx,
            })),
          })
        }
      }

      const updated = await prisma.clientProject.findUnique({
        where: { id: id as string },
        include: { highlights: { orderBy: { order: "asc" } } },
      })

      await revalidatePublic(res, [HOME_PATH, CASES_PATH, casePath(before?.slug), casePath(updated?.slug)])
      return res.status(200).json(updated)
    } catch (error: any) {
      console.error(error)
      if (error?.code === "P2002") {
        return res.status(409).json({ error: "Slug já utilizado." })
      }
      return res.status(500).json({ error: "Erro ao atualizar projeto" })
    }
  }

  if (req.method === "DELETE") {
    try {
      const p = await prisma.clientProject.findUnique({ where: { id: id as string }, select: { slug: true } })
      await prisma.clientProject.delete({ where: { id: id as string } })
      
      await revalidatePublic(res, [HOME_PATH, CASES_PATH, casePath(p?.slug)])
      return res.status(204).end()
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Erro ao excluir projeto" })
    }
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
