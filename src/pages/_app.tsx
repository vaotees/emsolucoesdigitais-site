import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import Script from 'next/script'
import Head from 'next/head'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import BackToTop from '../components/BackToTop'
import WhatsAppFloat from '../components/WhatsAppFloat'
import '../styles/globals.css'

// Inter variável servida pelo próprio site: sem CSS externo, só o subconjunto latino e fallback com métricas ajustadas
const inter = Inter({ subsets: ['latin'], display: 'swap' })

const isGaId = (v?: string | null): v is string => !!v && /^G-[A-Z0-9]{6,}$/.test(v)

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: any }>) {
  const router = useRouter()
  // A variável de ambiente (Vercel) tem prioridade; sem ela, vale o ID salvo em /admin/seo
  const envGaId = isGaId(process.env.NEXT_PUBLIC_GA_ID) ? process.env.NEXT_PUBLIC_GA_ID : null
  const [gaId, setGaId] = useState<string | null>(envGaId)
  const isPrivate = router.pathname.startsWith('/admin') || router.pathname === '/login'

  useEffect(() => {
    if (envGaId || isPrivate) return
    fetch('/api/seo/public')
      .then((r) => r.json())
      .then((d) => { if (isGaId(d.googleAnalyticsId)) setGaId(d.googleAnalyticsId) })
      .catch(() => {})
  }, [envGaId, isPrivate])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {/* A variável fica no :root para valer também no body e em portais fora da árvore do app */}
      <style jsx global>{`
        :root {
          --font-inter: ${inter.style.fontFamily};
        }
      `}</style>
      <SessionProvider session={session}>
        {gaId && !isPrivate && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
        {/* Admin e login fora dos buscadores (o next.config também manda X-Robots-Tag) */}
        {isPrivate && (
          <Head>
            <meta name="robots" content="noindex, nofollow" />
          </Head>
        )}
        <Component {...pageProps} />
        <BackToTop />
        <WhatsAppFloat />
      </SessionProvider>
    </ThemeProvider>
  )
}



