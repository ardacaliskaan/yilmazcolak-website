// app/layout.js - Senin mevcut layout'una metadataBase eklendi
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
  metadataBase: new URL('https://yusufcolak.av.tr'), // Bu satırı ekledim
  title: "Yılmaz Çolak Hukuk Bürosu | Profesyonel Hukuki Danışmanlık",
  description:
    "Avukat Yılmaz Çolak Hukuk Bürosu - Profesyonel hukuki danışmanlık, sözleşme hazırlama ve mahkeme temsili hizmetleri. Adalet ve güvenin adresi.",
  keywords:
    "avukat, hukuk bürosu, hukuki danışmanlık, sözleşme, mahkeme, Yılmaz Çolak, Karabük avukat, hukuk, adalet",
  authors: [{ name: "Arda Çalışkan" }],
  creator: "Arda Çalışkan",
  publisher: "Yılmaz Çolak Hukuk Bürosu",
  robots: "index, follow",

  // Favicon ve Manifest
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",

  // Open Graph / Facebook
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://yusufcolak.av.tr",
    title: "Yılmaz Çolak Hukuk Bürosu | Profesyonel Hukuki Danışmanlık",
    description:
      "Avukat Yılmaz Çolak Hukuk Bürosu - Profesyonel hukuki danışmanlık, sözleşme hazırlama ve mahkeme temsili hizmetleri.",
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

  // Ekstra meta tagler
  other: {
    "theme-color": "#f59e0b",
    "msapplication-TileColor": "#1e293b",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}