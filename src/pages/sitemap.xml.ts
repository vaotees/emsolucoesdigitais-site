import type { GetServerSideProps } from 'next'
import { prisma } from '@/lib/prisma'
import { absoluteUrl } from '@/lib/seo'
import { DEFAULT_LOCALE, LOCALES, localePath } from '@/lib/i18n'

/* /sitemap.xml: as páginas públicas em cada idioma, com as alternativas hreflang de cada uma
   (pt-BR, en e x-default). Uma página (e não rota de API) para responder no endereço padrão; /en/sitemap.xml dá 404.
   Cache de 1 hora na CDN. */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const getServerSideProps: GetServerSideProps = async ({ res, locale }) => {
  if (locale && locale !== DEFAULT_LOCALE) return { notFound: true }
  try {
    const projects = await prisma.clientProject.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: { slug: true, updatedAt: true },
    })
    const pages = [
      { path: '/', priority: '1.0', updatedAt: null as Date | null },
      { path: '/cases', priority: '0.9', updatedAt: null as Date | null },
      ...projects.map((p) => ({ path: `/cases/${p.slug}`, priority: '0.8', updatedAt: p.updatedAt })),
    ]
    const alternates = (path: string) =>
      [
        ...LOCALES.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(absoluteUrl(localePath(l, path)))}"/>`),
        `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(absoluteUrl(localePath(DEFAULT_LOCALE, path)))}"/>`,
      ].join('')
    const urls = pages.flatMap((page) =>
      LOCALES.map(
        (l) =>
          `<url><loc>${esc(absoluteUrl(localePath(l, page.path)))}</loc>${
            page.updatedAt ? `<lastmod>${page.updatedAt.toISOString().slice(0, 10)}</lastmod>` : ''
          }<priority>${page.priority}</priority>${alternates(page.path)}</url>`,
      ),
    )
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.end(xml)
  } catch (err) {
    console.error('Sitemap: erro ao listar os projetos', err)
    res.statusCode = 500
    res.end('Erro ao gerar o sitemap')
  }
  return { props: {} }
}

// A resposta sai inteira em getServerSideProps; o componente nunca chega a renderizar
export default function Sitemap() {
  return null
}
