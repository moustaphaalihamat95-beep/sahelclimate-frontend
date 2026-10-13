import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "SahelClimate-AI - Assurance Paramétrique",
  description: "Plateforme d'analyse satellite NDVI et d'assurance sécheresse au Tchad",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"
        />
      </head>
      <body>
        {children}

        {/* Inscription du Service Worker via Next Script */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('[PWA] Service Worker enregistré avec succès:', registration.scope);
                  },
                  function(err) {
                    console.log('[PWA] Échec enregistrement Service Worker:', err);
                  }
                );
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}