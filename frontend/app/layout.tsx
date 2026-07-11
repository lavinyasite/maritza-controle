import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Controllo Servizi — Gestione Turni",
  description: "Sistema de gestão de escalas de serviço. Visualize seus turnos, horas trabalhadas e notificações em tempo real.",
  keywords: ["escala de serviço", "turni", "orario", "gestione", "lavoro"],
  authors: [{ name: "Controllo Servizi" }],
  robots: "index, follow",
  openGraph: {
    title: "Controllo Servizi",
    description: "Gestione professionale dei turni di servizio",
    type: "website",
    locale: "pt_BR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#e94560",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Servizi" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="bg-gradient-radial">
        {children}
      </body>
    </html>
  );
}
