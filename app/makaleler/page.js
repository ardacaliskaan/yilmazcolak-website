// app/makaleler/page.js - Ana Makale Listesi Server Component
import BlogListClient from './BlogListClient';

// SEO Metadata
export const metadata = {
  title: 'Hukuk Makaleleri ve Rehberler | Yılmaz Çolak Hukuk Bürosu',
  description: 'Aile hukuku, ceza hukuku, iş hukuku ve daha birçok alanda uzman avukatlarımızdan güncel hukuki makaleler ve rehberler. Hukuki bilgilerinizi artırın.',
  keywords: [
    'hukuk makaleleri',
    'avukat yazıları', 
    'aile hukuku makaleleri',
    'ceza hukuku yazıları',
    'iş hukuku makaleleri',
    'karabük avukat',
    'hukuki bilgiler',
    'yılmaz çolak hukuk',
    'hukuk danışmanlığı',
    'hukuki rehberler'
  ].join(', '),
  
  authors: [{ name: 'Yılmaz Çolak Hukuk Bürosu' }],
  creator: 'Yılmaz Çolak Hukuk Bürosu',
  publisher: 'Yılmaz Çolak Hukuk Bürosu',
  
  openGraph: {
    title: 'Hukuk Makaleleri | Yılmaz Çolak Hukuk Bürosu',
    description: 'Aile hukuku, ceza hukuku, iş hukuku ve daha birçok alanda uzman avukatlarımızdan güncel hukuki makaleler ve rehberler.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler`,
    siteName: 'Yılmaz Çolak Hukuk Bürosu',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-articles.jpg`,
        width: 1200,
        height: 630,
        alt: 'Yılmaz Çolak Hukuk Bürosu - Hukuk Makaleleri',
        type: 'image/jpeg'
      }
    ]
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'Hukuk Makaleleri | Yılmaz Çolak Hukuk Bürosu',
    description: 'Aile hukuku, ceza hukuku, iş hukuku ve daha birçok alanda uzman avukatlarımızdan güncel hukuki makaleler.',
    creator: '@yilmazcolakhukuk',
    site: '@yilmazcolakhukuk',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/images/og-articles.jpg`]
  },
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler`
  }
};

// Ana Server Component - BlogListClient'ı wrap eder
export default function ArticlesPage({ searchParams }) {
  return <BlogListClient searchParams={searchParams} />;
}