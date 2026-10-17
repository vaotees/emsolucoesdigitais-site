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
  if (req.method !== "GET") {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method === "GET") {
    try {
      const projects = await prisma.clientProject.findMany({
        include: { highlights: { orderBy: { order: "asc" } } },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      })
      return res.status(200).json(projects)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: "Erro ao buscar projetos" })
    }
  }

  if (req.method === "POST") {
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

      if (!slug || !clientName) {
        return res.status(400).json({ error: "slug e clientName são obrigatórios" })
      }

      const count = await prisma.clientProject.count()

      const project = await prisma.clientProject.create({
        data: {
          slug: slug.toLowerCase().replace(/\s+/g, "-"),
          order: count,
          category: category || "",
          clientName: clientName || "",
          tagline: tagline || "",
          description: description || "",
          role: role || "",
          status: status || "Em Produção",
          year: year || new Date().getFullYear().toString(),
          liveUrl: liveUrl || "",
          caseUrl: caseUrl || "",
          mockupCardUrl: mockupCardUrl || null,
          mockupHeroUrl: mockupHeroUrl || null,
          stackTags: stackTags || "",
          challengeText: challengeText || "",
          solutionText: solutionText || "",
          impactText: impactText || "",
          brandGuidelinesUrl: brandGuidelinesUrl || "",
          logoUrl: logoUrl || "",
          logoDownloadUrl: logoDownloadUrl || "",
          brandColors: brandColors || "",
          brandFontHeading: brandFontHeading || "Playfair Display",
          brandFontBody: brandFontBody || "Montserrat",
          published: published !== false,
          caseContent: normalizeCaseContent(caseContent) as any,
          highlights: highlights?.length
            ? {
                create: highlights.map((h: any, idx: number) => ({
                  iconName: h.iconName || "Zap",
                  title: h.title || "",
                  body: h.body || "",
                  order: idx,
                })),
              }
            : undefined,
        },
        include: { highlights: true },
      })



      await revalidatePublic(res, [HOME_PATH, CASES_PATH, casePath(project.slug)])
      return res.status(201).json(project)
    } catch (error: any) {
      console.error(error)
      if (error?.code === "P2002") {
        return res.status(409).json({ error: "Slug já utilizado. Escolha outro." })
      }
      return res.status(500).json({ error: "Erro ao criar projeto" })
    }
  }

  res.setHeader("Allow", ["GET", "POST"])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
