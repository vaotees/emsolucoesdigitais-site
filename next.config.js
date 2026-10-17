/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Idiomas: português sem prefixo (/cases), inglês em /en (/en/cases) e espanhol em /es (/es/cases). Sem redirecionar
  // pelo idioma do navegador; a escolha feita no seletor do menu fica no cookie NEXT_LOCALE (ver src/middleware.ts e docs/i18n.md).
  i18n: {
    locales: ['pt-BR', 'en', 'es'],
    defaultLocale: 'pt-BR',
    localeDetection: false,
  },
  // Compress responses
  compress: true,
  // Remove X-Powered-By header
  poweredByHeader: false,
  // Image optimization: serve WebP/AVIF for all images
  images: {
    // Manter em sincronia com OPTIMIZABLE_HOSTS em src/components/CmsImage.tsx
    remotePatterns: [
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24h cache for optimized images
  },
  async redirects() {
    return [
      // A lista de cases mudou de /casos para /cases (mesmo prefixo das páginas de cada case). Com i18n, vale
      // também para /en/casos e /es/casos. Links antigos (LinkedIn, currículo, mensagens) continuam funcionando.
      { source: '/casos', destination: '/cases', permanent: true },
      // O projeto FOCUS foi cancelado e virou o produto Condomira (demo da EM)
      { source: '/cases/focus', destination: '/cases/condomira', permanent: true },
      // O admin e o login só existem em português
      { source: '/en/admin', destination: '/admin', locale: false, permanent: false },
      { source: '/en/admin/:path*', destination: '/admin/:path*', locale: false, permanent: false },
      { source: '/en/login', destination: '/login', locale: false, permanent: false },
      { source: '/es/admin', destination: '/admin', locale: false, permanent: false },
      { source: '/es/admin/:path*', destination: '/admin/:path*', locale: false, permanent: false },
      { source: '/es/login', destination: '/login', locale: false, permanent: false },
    ]
  },
  // HTTP Cache-Control headers for static assets
  async headers() {
    return [
      // Área restrita fora dos buscadores (também tem <meta name="robots"> nas páginas)
      { source: '/admin', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/login', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      {
        // Mockups e imagens publicas: cache de 1 ano (imutavel)
        source: '/mockups/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Todos os arquivos WebP, AVIF, PNG, JPG na raiz de /public
        source: '/:file(.*\\.(?:webp|avif|png|jpg|jpeg|svg|ico))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Fonts (se servidas localmente)
        source: '/:file(.*\\.(?:woff|woff2|ttf|otf))',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // Webpack: tree-shake mais agressivamente em producao
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      }
    }
    return config
  },
}

module.exports = nextConfig
