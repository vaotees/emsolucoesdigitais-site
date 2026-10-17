import Head from 'next/head'
import { useRouter } from 'next/router'
import { SITE_NAME, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT, absoluteUrl } from '@/lib/seo'
import { DEFAULT_LOCALE, LOCALES, OG_LOCALES, asLocale, localePath } from '@/lib/i18n'

export interface SeoMetaProps {
  title: string
  description: string
  /** URL absoluta da imagem de compartilhamento (1200×630). */
  image: string
  imageAlt?: string
  /** Sobrescreve o og:url e o canonical; por padrão usa a rota atual no idioma da página. */
  url?: string
  type?: 'website' | 'article'
}

/**
 * Open Graph + Twitter Card, canonical e as versões em cada idioma (hreflang pt-BR, en e x-default).
 * Renderiza o próprio <Head> (o next/head não aceita componentes customizados como filhos).
 */
export default function SeoMeta({ title, description, image, imageAlt, url, type = 'website' }: SeoMetaProps) {
  const router = useRouter()
  const locale = asLocale(router.locale)
  // asPath vem sem o prefixo do idioma; cada versão ganha o seu
  const path = router.asPath.split(/[?#]/)[0] || '/'
  const urlIn = (l: (typeof LOCALES)[number]) => absoluteUrl(localePath(l, path))
  const pageUrl = url || urlIn(locale)
  const alt = imageAlt || title
  // Dimensões só são garantidas para a imagem gerada por /api/og.
  const isGenerated = image.includes('/api/og?')

  return (
    <Head>
      <link key="canonical" rel="canonical" href={pageUrl} />
      {LOCALES.map((l) => (
        <link key={`alt-${l}`} rel="alternate" hrefLang={l} href={urlIn(l)} />
      ))}
      <link key="alt-x-default" rel="alternate" hrefLang="x-default" href={urlIn(DEFAULT_LOCALE)} />

      <meta key="og:type" property="og:type" content={type} />
      <meta key="og:site_name" property="og:site_name" content={SITE_NAME} />
      <meta key="og:locale" property="og:locale" content={OG_LOCALES[locale]} />
      {LOCALES.filter((l) => l !== locale).map((l) => (
        <meta key={`og:locale:alternate:${l}`} property="og:locale:alternate" content={OG_LOCALES[l]} />
      ))}
      <meta key="og:url" property="og:url" content={pageUrl} />
      <meta key="og:title" property="og:title" content={title} />
      <meta key="og:description" property="og:description" content={description} />
      <meta key="og:image" property="og:image" content={image} />
      {isGenerated && <meta key="og:image:type" property="og:image:type" content="image/png" />}
      {isGenerated && <meta key="og:image:width" property="og:image:width" content={String(OG_IMAGE_WIDTH)} />}
      {isGenerated && <meta key="og:image:height" property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />}
      <meta key="og:image:alt" property="og:image:alt" content={alt} />

      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={title} />
      <meta key="twitter:description" name="twitter:description" content={description} />
      <meta key="twitter:image" name="twitter:image" content={image} />
      <meta key="twitter:image:alt" name="twitter:image:alt" content={alt} />
    </Head>
  )
}
