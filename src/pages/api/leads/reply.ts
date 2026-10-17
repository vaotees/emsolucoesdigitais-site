import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'
import nodemailer from 'nodemailer'

// ─── Email template builder ──────────────────────────

function buildEmailHtml({
  recipientName,
  subject,
  bodyHtml,
}: {
  recipientName: string
  subject: string
  bodyHtml: string
}) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a0a00 0%,#0d0d0d 100%);padding:36px 40px;text-align:center;border-bottom:1px solid rgba(241,90,36,0.3);">
              <div style="display:inline-block;background:rgba(241,90,36,0.15);border:1px solid rgba(241,90,36,0.3);border-radius:8px;padding:6px 16px;margin-bottom:16px;">
                <span style="color:#f15a24;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">EM Soluções Digitais</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">${subject}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#111111;padding:40px;">
              <p style="margin:0 0 24px;color:#a1a1aa;font-size:15px;line-height:1.6;">
                Olá, <strong style="color:#ffffff;">${recipientName}</strong>!
              </p>
              ${bodyHtml}
              <div style="margin-top:40px;padding-top:32px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
                <a href="#contact" style="display:inline-block;background:linear-gradient(135deg,#f15a24,#e8480e);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;">
                  Entrar em Contato
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#0d0d0d;padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0 0 8px;color:#52525b;font-size:12px;">
                © ${new Date().getFullYear()} EM Soluções Digitais — Todos os direitos reservados
              </p>
              <p style="margin:0;color:#3f3f46;font-size:11px;">
                Este e-mail foi enviado porque você entrou em contato conosco.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Templates ───────────────────────────────────────

function getTemplate(
  templateId: string,
  lead: { name: string; service: string; message: string },
  customMessage?: string
): { subject: string; bodyHtml: string } {
  const firstName = lead.name.split(' ')[0]

  switch (templateId) {
    case 'welcome':
      return {
        subject: `Recebemos sua solicitação — ${lead.service || 'EM Soluções Digitais'}`,
        bodyHtml: `
          <p style="color:#d4d4d8;font-size:15px;line-height:1.8;margin:0 0 16px;">
            Sua solicitação foi recebida com sucesso! Estamos muito felizes com o seu interesse.
          </p>
          <div style="background:rgba(241,90,36,0.08);border:1px solid rgba(241,90,36,0.2);border-radius:10px;padding:20px 24px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#f15a24;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Serviço solicitado</p>
            <p style="margin:0;color:#ffffff;font-size:16px;font-weight:600;">${lead.service || 'Não especificado'}</p>
          </div>
          <p style="color:#d4d4d8;font-size:15px;line-height:1.8;margin:0 0 16px;">
            Nossa equipe especialista já foi notificada e entrará em contato com você em breve para entender melhor suas necessidades e apresentar a melhor solução.
          </p>
          <p style="color:#d4d4d8;font-size:15px;line-height:1.8;margin:0;">
            Enquanto isso, <strong style="color:#ffffff;">siga-nos nas redes sociais</strong> e fique por dentro das novidades do mundo digital.
          </p>
        `,
      }

    case 'proposal':
      return {
        subject: `Proposta Comercial — EM Soluções Digitais`,
        bodyHtml: `
          <p style="color:#d4d4d8;font-size:15px;line-height:1.8;margin:0 0 20px;">
            Foi um prazer conversar com você! Conforme alinhamos, segue nossa proposta comercial personalizada para o seu projeto.
          </p>
          <div style="background:rgba(241,90,36,0.08);border:1px solid rgba(241,90,36,0.2);border-radius:10px;padding:20px 24px;margin:24px 0;">
            <p style="margin:0 0 8px;color:#f15a24;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Detalhes</p>
            <p style="margin:0;color:#d4d4d8;font-size:14px;line-height:1.7;">${customMessage || 'Nossa proposta será enviada em breve com todos os detalhes do projeto.'}</p>
          </div>
          <p style="color:#d4d4d8;font-size:15px;line-height:1.8;margin:0;">
            Estamos à disposição para quaisquer esclarecimentos. Não hesite em nos contatar!
          </p>
        `,
      }

    case 'followup':
      return {
        subject: `${firstName}, ainda estamos aqui para você! 👋`,
        bodyHtml: `
          <p style="color:#d4d4d8;font-size:15px;line-height:1.8;margin:0 0 20px;">
            Percebemos que você entrou em contato conosco há algum tempo sobre <strong style="color:#ffffff;">${lead.service || 'nossos serviços'}</strong> e queríamos verificar como podemos ajudá-lo.
          </p>
          <p style="color:#d4d4d8;font-size:15px;line-height:1.8;margin:0 0 20px;">
            Sabemos que às vezes o dia a dia fica corrido. Estamos aqui e prontos para tornar sua presença digital em algo realmente extraordinário.
          </p>
          <div style="background:rgba(241,90,36,0.08);border:1px solid rgba(241,90,36,0.2);border-radius:10px;padding:20px 24px;margin:24px 0;">
            <p style="margin:0;color:#d4d4d8;font-size:14px;line-height:1.7;">
              💡 <strong style="color:#ffffff;">Sabia que</strong> nossos clientes têm visto em média <strong style="color:#f15a24;">300% de crescimento</strong> no tráfego orgânico após os primeiros 3 meses de parceria?
            </p>
          </div>
          <p style="color:#d4d4d8;font-size:15px;line-height:1.8;margin:0;">
            Responda este e-mail ou nos chame no WhatsApp. Será um prazer retomar a conversa!
          </p>
        `,
      }

    case 'custom':
    default:
      return {
        subject: `Mensagem da EM Soluções Digitais`,
        bodyHtml: `
          <div style="color:#d4d4d8;font-size:15px;line-height:1.8;">
            ${(customMessage || '').replace(/\n/g, '<br/>')}
          </div>
        `,
      }
  }
}

// ─── Handler ─────────────────────────────────────────

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Método ${req.method} não permitido` })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ message: 'Não autorizado' })

  const { leadId, templateId = 'custom', customMessage } = req.body

  if (!leadId) return res.status(400).json({ message: 'leadId é obrigatório' })

  try {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } })
    if (!lead) return res.status(404).json({ message: 'Lead não encontrado' })

    const { subject, bodyHtml } = getTemplate(templateId, lead, customMessage)

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"EM Soluções Digitais" <${process.env.EMAIL_USER}>`,
      to: lead.email,
      subject,
      html: buildEmailHtml({ recipientName: lead.name, subject, bodyHtml }),
    })

    // Mark as replied
    await prisma.lead.update({
      where: { id: leadId },
      data: { replied: true, repliedAt: new Date(), status: 'contacted' },
    })

    return res.status(200).json({ message: 'E-mail enviado com sucesso' })
  } catch (err) {
    console.error('Erro ao enviar resposta:', err)
    return res.status(500).json({ message: 'Erro interno ao enviar e-mail' })
  }
}
