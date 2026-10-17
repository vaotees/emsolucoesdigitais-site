import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    // Sem lang fixo: o Next escreve o idioma da página (pt-BR ou en), vindo do i18n do next.config
    <Html suppressHydrationWarning>
      <Head>
        {/* meta description fica em cada página (next/head) — aqui geraria duplicata */}
        {/* Favicon: só o símbolo (globo + E) num quadrado claro; o logo inteiro ficava cortado no quadrado */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Avatares padrão da Hero vêm do Unsplash. A Inter é servida pelo próprio site (next/font, em _app). */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

