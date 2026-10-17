import type { GetStaticPaths, GetStaticProps } from 'next'
import CaseStudyLayout from '@/components/case/CaseStudyLayout'
import { caseConfigFromProject, nextCaseCard } from '@/lib/caseContent'
import { REVALIDATE_SECONDS } from '@/lib/revalidate'
import { LOCALES, asLocale, useI18n } from '@/lib/i18n'
import { localizeProject } from '@/lib/localize'

/* Página de case gerada a partir do banco: qualquer projeto cadastrado em /admin/projects
   ganha /cases/<slug> (e /en/cases/<slug>) sem código novo. Todos os cases usam este template.
   Estática (ISR): gerada no build ou no primeiro acesso e regerada quando o projeto é salvo no admin. */

export default function CasePage({ projectData, nextCase }: { projectData: any; nextCase: ReturnType<typeof nextCaseCard> }) {
  const { locale } = useI18n()
  return <CaseStudyLayout config={caseConfigFromProject(projectData, nextCase, locale)} />
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const { prisma } = await import('@/lib/prisma')
    const projects = await prisma.clientProject.findMany({ where: { published: true }, select: { slug: true } })
    const paths = LOCALES.flatMap((locale) => projects.map((p) => ({ params: { slug: p.slug }, locale })))
    return { paths, fallback: 'blocking' }
  } catch (err) {
    // Sem banco no build: os cases são gerados no primeiro acesso
    console.error('Cases: não foi possível listar os projetos no build', err)
    return { paths: [], fallback: 'blocking' }
  }
}

export const getStaticProps: GetStaticProps = async ({ params, locale: rawLocale }) => {
  const slug = String(params?.slug || '')
  const locale = asLocale(rawLocale)
  try {
    const { prisma } = await import('@/lib/prisma')
    const [project, all] = await Promise.all([
      prisma.clientProject.findUnique({
        where: { slug },
        include: { highlights: { orderBy: { order: 'asc' } } },
      }),
      prisma.clientProject.findMany({ where: { published: true }, orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] }),
    ])
    // Inexistente ou oculto no admin: 404 (volta a ser verificado a cada revalidação)
    if (!project || !project.published) return { notFound: true, revalidate: REVALIDATE_SECONDS }
    return {
      props: {
        // Já no idioma da página: o que não estiver traduzido fica em português
        projectData: JSON.parse(JSON.stringify(localizeProject(project, locale))),
        nextCase: nextCaseCard(all.map((p) => localizeProject(p, locale)), slug, locale),
      },
      revalidate: REVALIDATE_SECONDS,
    }
  } catch (err) {
    console.error(`Erro ao carregar o case "${slug}":`, err)
    throw err
  }
}
