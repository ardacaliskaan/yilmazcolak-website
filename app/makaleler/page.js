// app/makaleler/page.js - SERVER COMPONENT (SEO + Metadata)
import ArticlesClientPage from './ArticlesClientPage';

// SEO Metadata
export const metadata = {
  title: 'Hukuk Makaleleri ve Uzman Rehberler | Yılmaz Çolak Hukuk Bürosu',
  description: 'Aile hukuku, ceza hukuku, iş hukuku, ticaret hukuku ve daha birçok alanda uzman avukatlarımızdan güncel hukuki makaleler, rehberler ve analizler.',
  keywords: [
    'hukuk makaleleri', 'avukat yazıları', 'aile hukuku makaleleri',
    'ceza hukuku yazıları', 'iş hukuku makaleleri', 'ticaret hukuku rehberleri',
    'idare hukuku', 'icra hukuku', 'gayrimenkul hukuku', 'miras hukuku',
    'kvkk makaleleri', 'sigorta hukuku', 'karabük avukat', 'hukuki bilgiler',
    'yılmaz çolak hukuk', 'hukuk danışmanlığı', 'hukuki rehberler'
  ].join(', '),
  
  authors: [{ 
    name: 'Yılmaz Çolak Hukuk Bürosu',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/ekibimiz`
  }],
  creator: 'Yılmaz Çolak Hukuk Bürosu',
  publisher: 'Yılmaz Çolak Hukuk Bürosu',
  
  openGraph: {
    title: 'Hukuk Makaleleri | Yılmaz Çolak Hukuk Bürosu',
    description: 'Uzman avukatlarımızdan güncel hukuki makaleler, rehberler ve analizler.',
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
    description: 'Uzman avukatlarımızdan güncel hukuki makaleler, rehberler ve analizler.',
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

// Server Component - SEO için
export default function ArticlesPage({ searchParams }) {
  // Client component'i render et
  return <ArticlesClientPage searchParams={searchParams} />;
}

/*
===========================================
DOSYA YAPISI:

app/makaleler/
├── page.js                    // BU DOSYA (Server Component)
├── ArticlesClientPage.js      // Client Component (aşağıda)
└── [slug]/
    └── page.js               // Single article server component

===========================================
*/