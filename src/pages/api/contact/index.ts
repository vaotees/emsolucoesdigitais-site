import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { prisma } from '../../../lib/prisma';
import { asLocale, getDict, type Locale } from '../../../lib/i18n';

// Sanitize: strip HTML tags, control chars, and trim
function sanitize(value: unknown, maxLen = 500): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
    .slice(0, maxLen)
}

// Basic email format validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
}

// ─── Confirmation email for the lead ─────────────────

// E-mail de confirmação no idioma da página em que o formulário foi enviado
const CONFIRMATION = {
  'pt-BR': {
    lang: 'pt-BR',
    subject: 'Recebemos sua solicitação',
    title: 'Solicitação Recebida! 🚀',
    hello: 'Olá',
    received: 'Recebemos sua solicitação com sucesso. Nossa equipe especialista já foi notificada e entrará em contato com você em breve.',
    service: 'Serviço solicitado',
    general: 'Contato Geral',
    meanwhile: 'Enquanto isso, fique à vontade para explorar nossos cases de sucesso e ver como transformamos negócios digitalmente.',
    cta: 'Ver Nossos Cases',
    casesUrl: 'https://emsolucoesdigitais.com.br/cases',
    rights: 'Todos os direitos reservados',
    why: 'Este e-mail foi enviado porque você preencheu nosso formulário de contato.',
  },
  en: {
    lang: 'en',
    subject: 'We received your request',
    title: 'Request received! 🚀',
    hello: 'Hi',
    received: "Thanks for getting in touch. Your request arrived safely and I'll get back to you soon.",
    service: 'Requested service',
    general: 'General inquiry',
    meanwhile: 'In the meantime, feel free to browse the case studies and see how each project was designed and built.',
    cta: 'See the case studies',
    casesUrl: 'https://emsolucoesdigitais.com.br/en/cases',
    rights: 'All rights reserved',
    why: 'You received this email because you filled in the contact form on our website.',
  },
  es: {
    lang: 'es',
    subject: 'Recibimos tu solicitud',
    title: '¡Solicitud recibida! 🚀',
    hello: 'Hola',
    received: 'Gracias por escribir. Tu solicitud llegó correctamente y te responderé pronto.',
    service: 'Servicio solicitado',
    general: 'Consulta general',
    meanwhile: 'Mientras tanto, puedes ver los casos y cómo se diseñó y construyó cada proyecto.',
    cta: 'Ver los casos',
    casesUrl: 'https://emsolucoesdigitais.com.br/es/cases',
    rights: 'Todos los derechos reservados',
    why: 'Recibiste este correo porque completaste el formulario de contacto de nuestro sitio web.',
  },
} satisfies Record<Locale, Record<string, string>>

function buildConfirmationEmail(name: string, service: string, locale: Locale) {
  const c = CONFIRMATION[locale]
  const firstName = name.split(' ')[0]
  const subject = `${c.subject} — ${service || 'EM Soluções Digitais'}`

  const html = `<!DOCTYPE html>
<html lang="${c.lang}">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a0a00 0%,#0d0d0d 100%);padding:36px 40px;text-align:center;border-bottom:1px solid rgba(241,90,36,0.3);">
            <div style="display:inline-block;background:rgba(241,90,36,0.15);border:1px solid rgba(241,90,36,0.3);border-radius:8px;padding:6px 16px;margin-bottom:16px;">
              <span style="color:#f15a24;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">EM Soluções Digitais</span>
            </div>
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">${c.title}</h1>
          </td>
        </tr>
        <tr>
          <td style="background:#111111;padding:40px;">
            <p style="margin:0 0 16px;color:#a1a1aa;font-size:15px;line-height:1.6;">${c.hello}, <strong style="color:#ffffff;">${firstName}</strong>!</p>
            <p style="color:#d4d4d8;font-size:15px;line-height:1.8;margin:0 0 16px;">
              ${c.received}
            </p>
            <div style="background:rgba(241,90,36,0.08);border:1px solid rgba(241,90,36,0.2);border-radius:10px;padding:20px 24px;margin:24px 0;">
              <p style="margin:0 0 8px;color:#f15a24;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${c.service}</p>
              <p style="margin:0;color:#ffffff;font-size:16px;font-weight:600;">${service || c.general}</p>
            </div>
            <p style="color:#d4d4d8;font-size:15px;line-height:1.8;margin:0;">
              ${c.meanwhile}
            </p>
            <div style="margin-top:32px;text-align:center;">
              <a href="${c.casesUrl}" style="display:inline-block;background:linear-gradient(135deg,#f15a24,#e8480e);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:8px;">${c.cta}</a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#0d0d0d;padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
            <p style="margin:0 0 8px;color:#52525b;font-size:12px;">© ${new Date().getFullYear()} EM Soluções Digitais — ${c.rights}</p>
            <p style="margin:0;color:#3f3f46;font-size:11px;">${c.why}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, html }
}

// ─── Admin notification email ─────────────────────────

interface LeadData {
  name: string
  email: string
  whatsapp: string
  location: string
  service: string
  message: string
  locale: Locale
}

function buildAdminNotification(lead: LeadData) {
  const foreign = lead.locale !== 'pt-BR'
  const subject = `${foreign ? `[${lead.locale.toUpperCase()}] ` : ''}Nova Solicitação: ${lead.service}`
  const waDigits = lead.whatsapp.replace(/\D/g, '')
  // Número digitado na página em inglês já vem com o código do país
  const waNumber = foreign || waDigits.startsWith('55') ? waDigits : `55${waDigits}`
  const waUrl = `https://wa.me/${waNumber}`
  const now = new Date()
  const timestamp = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const dataRow = (label: string, value: string, accent = false) => `
    <tr>
      <td style="padding:10px 16px;color:#71717a;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;white-space:nowrap;vertical-align:top;border-bottom:1px solid rgba(255,255,255,0.04);">${label}</td>
      <td style="padding:10px 16px;color:${accent ? '#f15a24' : '#e4e4e7'};font-size:14px;font-weight:${accent ? '700' : '500'};border-bottom:1px solid rgba(255,255,255,0.04);">${value}</td>
    </tr>`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#07080d;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#07080d;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a0a00 0%,#0d0d0d 100%);padding:32px 40px;border-bottom:1px solid rgba(241,90,36,0.25);">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <div style="display:inline-block;background:rgba(241,90,36,0.12);border:1px solid rgba(241,90,36,0.25);border-radius:6px;padding:4px 12px;margin-bottom:14px;">
                    <span style="color:#f15a24;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Nova Solicitação</span>
                  </div>
                  <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;line-height:1.3;">${lead.service}</h1>
                  <p style="margin:6px 0 0;color:#52525b;font-size:12px;">${timestamp} · via Landing Page</p>
                </td>
                <td width="48" style="vertical-align:top;text-align:right;">
                  <div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#f15a24,#c23e00);display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:20px;line-height:42px;display:block;text-align:center;width:42px;">🔔</span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Lead Data Card -->
        <tr>
          <td style="background:#111114;padding:28px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;overflow:hidden;">
              ${dataRow('Nome', lead.name)}
              ${dataRow('E-mail', `<a href="mailto:${lead.email}" style="color:#60a5fa;text-decoration:none;">${lead.email}</a>`)}
              ${dataRow('WhatsApp', lead.whatsapp || '—')}
              ${dataRow('Localidade', lead.location)}
              ${dataRow('Serviço', lead.service, true)}
              ${dataRow('Idioma', foreign ? 'Inglês (página /en): responda em inglês' : 'Português', foreign)}
            </table>

            ${lead.message ? `
            <!-- Message Box -->
            <div style="margin-top:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:20px;">
              <p style="margin:0 0 8px;color:#71717a;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Mensagem</p>
              <p style="margin:0;color:#d4d4d8;font-size:14px;line-height:1.7;font-style:italic;">"${lead.message}"</p>
            </div>` : ''}
          </td>
        </tr>

        <!-- Action Buttons -->
        <tr>
          <td style="background:#111114;padding:0 24px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${waDigits ? `<td style="padding-right:8px;" width="50%">
                  <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;background:rgba(6,78,59,0.15);border:1px solid rgba(6,78,59,0.35);color:#6ee7b7;text-decoration:none;font-weight:600;font-size:13px;padding:12px 16px;border-radius:10px;">
                    💬 Responder via WhatsApp
                  </a>
                </td>` : ''}
                <td style="padding-left:8px;" width="50%">
                  <a href="mailto:${lead.email}" style="display:block;text-align:center;background:rgba(241,90,36,0.1);border:1px solid rgba(241,90,36,0.25);color:#f15a24;text-decoration:none;font-weight:600;font-size:13px;padding:12px 16px;border-radius:10px;">
                    ✉️ Responder por E-mail
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0a0a0c;padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.04);">
            <p style="margin:0 0 4px;color:#3f3f46;font-size:11px;">EM Soluções Digitais — Painel Interno</p>
            <p style="margin:0;color:#27272a;font-size:10px;">Este e-mail foi gerado automaticamente pela landing page.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, html }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Método ${req.method} não permitido` });
  }

  const locale   = asLocale(req.body?.locale)
  const name     = sanitize(req.body?.name, 200)
  const email    = sanitize(req.body?.email, 200)
  const whatsapp = sanitize(req.body?.whatsapp, 25)
  const location = sanitize(req.body?.location, 200)
  const service  = sanitize(req.body?.service, 200)
  const message  = sanitize(req.body?.message, 2000)
  // O admin é em português: o serviço escolhido em outro idioma é gravado com o nome em português
  const ptServices = getDict('pt-BR').form.services.split('|')
  const serviceIndex = Number(req.body?.serviceIndex)
  const servicePt = ptServices[serviceIndex] || service

  // WhatsApp só é obrigatório na página em português
  if (!name || !email || (!whatsapp && locale === 'pt-BR') || !location || !service) {
    return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Endereço de e-mail inválido' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 1. Save lead to database
    try {
      await prisma.lead.create({
        data: { name, email, whatsapp, location, service: servicePt, message, locale, source: 'form', status: 'new' },
      })
    } catch (dbErr) {
      console.error('Erro ao salvar lead no banco:', dbErr)
      // Non-fatal: continue with email sending
    }

    // 2. Notify admin
    const { subject: adminSubject, html: adminHtml } = buildAdminNotification({ name, email, whatsapp, location, service: servicePt, message, locale })
    await transporter.sendMail({
      from: `"Site EM Soluções" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: 'estevao.marques@gmail.com',
      subject: adminSubject,
      html: adminHtml,
    });

    // 3. Send confirmation to the lead
    try {
      const { subject, html } = buildConfirmationEmail(name, service, locale)
      await transporter.sendMail({
        from: `"EM Soluções Digitais" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html,
      })
    } catch (confirmErr) {
      console.error('Erro ao enviar e-mail de confirmação:', confirmErr)
      // Non-fatal
    }

    return res.status(200).json({ message: 'E-mail enviado com sucesso' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return res.status(500).json({ message: 'Erro interno ao tentar enviar e-mail' });
  }
}
