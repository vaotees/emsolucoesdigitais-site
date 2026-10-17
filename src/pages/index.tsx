import Head from 'next/head'
import SeoMeta from '@/components/SeoMeta'
import { ogImageUrl, firstSentence } from '@/lib/seo'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import FeaturesGrid, { type ServiceProof } from '@/components/FeaturesGrid'
import Testimonials, { type CMSTestimonial, type SectionTestimonialsConfig } from '@/components/Testimonials'

import Footer from '@/components/Footer'
import { asLocale, getDict, useI18n } from '@/lib/i18n'
import { localizeProject, localizeRow, localizeRows, translationOf } from '@/lib/localize'

interface Feature {
  id: string
  title: string
  description: string
  icon: string
  highlight?: boolean
  group?: string
  visual?: string
  deliverables?: string
  proofCases?: string
}

interface SectionConfig {
  tagline: string
  title1: string
  titleHighlight: string
  description: string
}

interface SectionHeroConfig {
  badge: string
  titlePrefix: string
  rotatingWords: string
  description: string
  ctaPrimaryText: string
  ctaPrimaryUrl: string
  ctaSecondaryText: string
  ctaSecondaryUrl: string
  socialClients: string
  socialRating: string
  socialRevenue: string
}

interface SeoConfig {
  siteTitle: string
  metaDescription: string
  ogImage: string
  keywords: string
  canonicalUrl: string
  robotsIndex: boolean
}

interface HomeProps {
  features: Feature[]
  sectionConfig: SectionConfig | null
  testimonials: CMSTestimonial[]
  testiConfig: SectionTestimonialsConfig | null
  heroConfig: SectionHeroConfig | null
  seoConfig: SeoConfig
  cases: Record<string, ServiceProof>
  ogEyebrow: string
}

export default function Home({ features, sectionConfig, testimonials, testiConfig, heroConfig, seoConfig, cases, ogEyebrow }: HomeProps) {
  const { t } = useI18n()
  // seoConfig já vem no idioma da página (getStaticProps)
  const seo = seoConfig

  return (
    <>
      <Head>
        <title>{seo.siteTitle}</title>
        <meta name="description" content={seo.metaDescription} />
        {seo.keywords && <meta name="keywords" content={seo.keywords} />}
        <meta name="robots" content={seo.robotsIndex ? 'index,follow' : 'noindex,nofollow'} />
      </Head>
      <SeoMeta
        title={seo.siteTitle}
        description={seo.metaDescription}
        url={seo.canonicalUrl || undefined}
        image={
          // Imagem enviada no admin (/admin/seo) tem prioridade; senão, gerada.
          /^https?:\/\//.test(seo.ogImage)
            ? seo.ogImage
            : ogImageUrl({
                eyebrow: ogEyebrow,
                title: `${heroConfig?.titlePrefix || t.hero.titlePrefix} ${(heroConfig?.rotatingWords || t.hero.rotatingWords).split(',')[0].trim()}`,
                subtitle: firstSentence(seo.metaDescription),
              })
        }
      />

      <main className="bg-surface min-h-screen relative" style={{ zIndex: 1 }}>
        <Navbar />
        <HeroSection sectionConfig={heroConfig} />
        <FeaturesGrid cmsFeatures={features} sectionConfig={sectionConfig} cases={cases} />
        <Testimonials cmsTestimonials={testimonials} sectionConfig={testiConfig} cases={cases} />
        <Footer />
      </main>
    </>
  )
}

import { GetStaticProps } from 'next'
import { REVALIDATE_SECONDS, isBuildPhase } from '@/lib/revalidate'
import { caseCardFromProject } from '@/lib/caseContent'

/** SEO da home no idioma: em português, o que foi salvo em /admin/seo (ou o padrão); nos outros idiomas,
    a tradução gravada em SeoConfig.i18n ou o padrão do dicionário, nunca o texto em português. */
function seoFor(row: any, locale: ReturnType<typeof asLocale>): SeoConfig {
  const t = getDict(locale).meta
  const tr = translationOf(row, locale) || {}
  const pt = locale === 'pt-BR'
  const text = (field: 'siteTitle' | 'metaDescription' | 'keywords', fallback: string) =>
    (pt ? row?.[field] : (tr[field] as string)) || fallback
  return {
    siteTitle: text('siteTitle', t.siteTitle),
    metaDescription: text('metaDescription', t.siteDescription),
    keywords: text('keywords', t.keywords),
    // Imagem e canonical do admin valem para o português; em outro idioma, a imagem é gerada com o texto traduzido
    ogImage: pt ? row?.ogImage || '' : String(tr.ogImage || ''),
    canonicalUrl: pt ? row?.canonicalUrl || '' : '',
    robotsIndex: row?.robotsIndex ?? true,
  }
}

// Página estática (ISR): servida pela CDN e regerada quando o admin salva (ver src/lib/revalidate.ts)
export const getStaticProps: GetStaticProps<HomeProps> = async ({ locale: rawLocale }) => {
  const locale = asLocale(rawLocale)
  const t = getDict(locale)
  try {
    const { prisma } = await import('../lib/prisma')

    const [features, sectionConfig, testimonials, testiConfig, heroConfig, seoConfig, projects] = await Promise.all([
      prisma.feature.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.sectionFeaturesConfig.findUnique({ where: { id: 'singleton' } }),
      prisma.testimonial.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.sectionTestimonialsConfig.findUnique({ where: { id: 'singleton' } }),
      prisma.sectionHeroConfig.findUnique({ where: { id: 'singleton' } }),
      prisma.seoConfig.findUnique({ where: { id: 'singleton' } }),
      prisma.clientProject.findMany({ where: { published: true } }),
    ])
    // Cases citados nos serviços e nos depoimentos: nome, link, capa e cor do card de /cases
    const cases = Object.fromEntries(
      projects.map((p) => {
        const card = caseCardFromProject(localizeProject(p, locale), locale)
        return [p.slug, { slug: p.slug, name: card.clientName, href: card.href, cover: card.cover, accent: card.accent }]
      }),
    )

    return {
      props: {
        features: JSON.parse(JSON.stringify(localizeRows(features, locale))),
        sectionConfig: sectionConfig ? JSON.parse(JSON.stringify(localizeRow(sectionConfig, locale))) : null,
        // translated: o depoimento tem tradução neste idioma (aparece a nota "Translated from Portuguese")
        testimonials: JSON.parse(
          JSON.stringify(testimonials.map((x) => ({ ...localizeRow(x, locale), translated: Boolean(translationOf(x, locale)?.content) }))),
        ),
        testiConfig: testiConfig ? JSON.parse(JSON.stringify(localizeRow(testiConfig, locale))) : null,
        heroConfig: heroConfig ? JSON.parse(JSON.stringify(localizeRow(heroConfig, locale))) : null,
        seoConfig: seoFor(seoConfig, locale),
        cases,
        ogEyebrow: t.meta.homeOgEyebrow,
      },
      revalidate: REVALIDATE_SECONDS,
    }
  } catch (err) {
    if (!isBuildPhase()) throw err
    console.error('Home: banco indisponível no build, publicando o conteúdo padrão', err)
    return {
      props: { features: [], sectionConfig: null, testimonials: [], testiConfig: null, heroConfig: null, seoConfig: seoFor(null, locale), cases: {}, ogEyebrow: t.meta.homeOgEyebrow },
      revalidate: 10,
    }
  }
}
