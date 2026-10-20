import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#2e7d32" />
        <meta name="description" content="Plateforme intelligente d'aide à l'adaptation climatique et agricole au Sahel" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
