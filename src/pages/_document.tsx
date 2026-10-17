import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    // Sem lang fixo: o Next escreve o idioma da página (pt-BR ou en), vindo do i18n do next.config
    <Html suppressHydrationWarning>
      <Head>
        {/* meta description fica em cada página (next/head) — aqui geraria duplicata */}
        {/* Favicon: a marca EM inteira (globo, E e M) num quadrado claro, sem o "Soluções Digitais", ilegível em 16–32 px.
            O ?v= força os navegadores a trocar o ícone (o cache de /public é de 7 dias): suba o número ao trocar os arquivos. */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=2" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />

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

