import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'
import { OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from '@/lib/seo'

export const config = { runtime: 'edge' }

// Fontes Inter com subset Latin (≈42 KB cada) e logo reduzido — empacotados
// junto com a função, sem depender de rede em tempo de execução.
const interMedium = fetch(new URL('../../assets/og/Inter-500-latin.ttf', import.meta.url)).then((r) => r.arrayBuffer())
const interBold = fetch(new URL('../../assets/og/Inter-800-latin.ttf', import.meta.url)).then((r) => r.arrayBuffer())
const logo = fetch(new URL('../../assets/og/logo.png', import.meta.url)).then((r) => r.arrayBuffer())

const ORANGE_GRADIENT = 'linear-gradient(90deg, #F7941D 0%, #F15A24 55%, #C23E00 100%)'

function clip(value: string | null, max: number): string {
  const text = (value ?? '').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

export default async function handler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const title = clip(searchParams.get('title'), 90) || 'Especialistas em Autoridade Digital'
    const eyebrow = clip(searchParams.get('eyebrow'), 40)
    const subtitle = clip(searchParams.get('subtitle'), 150)
    const titleSize = title.length > 60 ? 58 : title.length > 34 ? 68 : 80

    const [medium, bold, logoData] = await Promise.all([interMedium, interBold, logo])

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 72px 64px',
            backgroundColor: '#0A1128',
            backgroundImage:
              'radial-gradient(circle at 1050px 120px, rgba(241,90,36,0.30) 0%, rgba(241,90,36,0) 42%), radial-gradient(circle at 0px 630px, rgba(80,110,220,0.20) 0%, rgba(80,110,220,0) 40%)',
            fontFamily: 'Inter',
            position: 'relative',
          }}
        >
          {/* @ts-expect-error — ImageResponse aceita ArrayBuffer como src */}
          <img src={logoData} width={176} height={108} alt="" />

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1000 }}>
            {eyebrow && (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 22 }}>
                <div style={{ width: 5, height: 28, borderRadius: 3, backgroundImage: 'linear-gradient(180deg, #F7941D, #F15A24)', marginRight: 16 }} />
                <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 5, textTransform: 'uppercase', color: '#F15A24' }}>
                  {eyebrow}
                </div>
              </div>
            )}
            <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 1.06, letterSpacing: -2, color: '#F1F5F9' }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.38, color: '#A7B3C9', marginTop: 24, maxWidth: 940 }}>
                {subtitle}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 24, fontWeight: 500, color: '#7E8CA8' }}>emsolucoesdigitais.com.br</div>
            <div style={{ width: 200, height: 8, borderRadius: 4, backgroundImage: ORANGE_GRADIENT }} />
          </div>

          <div style={{ position: 'absolute', left: 0, bottom: 0, width: OG_IMAGE_WIDTH, height: 6, backgroundImage: ORANGE_GRADIENT }} />
        </div>
      ),
      {
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        fonts: [
          { name: 'Inter', data: medium, weight: 500, style: 'normal' },
          { name: 'Inter', data: bold, weight: 800, style: 'normal' },
        ],
      },
    )
  } catch (err) {
    console.error('Erro ao gerar imagem OG:', err)
    return new Response('Falha ao gerar imagem', { status: 500 })
  }
}
