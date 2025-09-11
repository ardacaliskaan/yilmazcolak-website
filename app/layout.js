import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Yılmaz Çolak Hukuk Bürosu | Profesyonel Hukuki Danışmanlık",
  description: "Avukat Yılmaz Çolak Hukuk Bürosu - Profesyonel hukuki danışmanlık, sözleşme hazırlama ve mahkeme temsili hizmetleri. Adalet ve güvenin adresi.",
  keywords: "avukat, hukuk bürosu, hukuki danışmanlık, sözleşme, mahkeme, Yılmaz Çolak, Karabük avukat, hukuk, adalet",
  authors: [{ name: "Arda Çalışkan" }],
  creator: "Arda Çalışkan",
  publisher: "Yılmaz Çolak Hukuk Bürosu",
  robots: "index, follow",
  
  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://yusufcolak.av.tr",
    title: "Yılmaz Çolak Hukuk Bürosu | Profesyonel Hukuki Danışmanlık",
    description: "Avukat Yılmaz Çolak Hukuk Bürosu - Profesyonel hukuki danışmanlık, sözleşme hazırlama ve mahkeme temsili hizmetleri.",
    siteName: "Yılmaz Çolak Hukuk Bürosu",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Yılmaz Çolak Hukuk Bürosu",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Yılmaz Çolak Hukuk Bürosu",
    description: "Profesyonel hukuki danışmanlık hizmetleri",
    images: ["/og-image.jpg"],
  },

  // Additional meta tags
  other: {
    "theme-color": "#f59e0b",
    "msapplication-TileColor": "#1e293b",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}