import { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import { put } from "@vercel/blob"

// Permite body até 10 MB para o base64
export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  /* ── Auth ─────────────────────────────────────────── */
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: "Unauthorized" })

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  /* ── Validar token de Blob ───────────────────────── */
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN não configurado.")
    return res.status(500).json({
      error:
        "Storage não configurado. Adicione BLOB_READ_WRITE_TOKEN nas variáveis de ambiente da Vercel.",
    })
  }

  try {
    const { base64, filename } = req.body as { base64: string; filename: string }

    if (!base64 || !filename) {
      return res.status(400).json({ error: "Campos base64 e filename são obrigatórios." })
    }

    /* ── Converter base64 → Buffer ───────────────────── */
    // Remove o prefixo "data:image/png;base64," se existir
    const rawBase64 = base64.includes(",") ? base64.split(",")[1] : base64
    const mimeMatch = base64.match(/^data:([^;]+);base64,/)
    const mimeType = mimeMatch ? mimeMatch[1] : "image/png"

    const buffer = Buffer.from(rawBase64, "base64")

    /* ── Upload para Vercel Blob ─────────────────────── */
    // Gera um nome único: logos/{timestamp}-{filename}
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_")
    const blobPath = `logos/${Date.now()}-${safeFilename}`

    const blob = await put(blobPath, buffer, {
      access: "public",
      contentType: mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return res.status(200).json({ url: blob.url })
  } catch (error: any) {
    console.error("Upload error:", error)
    return res.status(500).json({ error: error.message || "Erro ao fazer upload da imagem." })
  }
}
