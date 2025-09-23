// app/makaleler/page.js - Server Component (metadata için)
import BlogListClient from './BlogListClient';

// SEO Metadata (server component)
export const metadata = {
  title: 'Hukuk Makaleleri ve Rehberler | Yılmaz Çolak Hukuk Bürosu',
  description: 'Aile hukuku, ceza hukuku, iş hukuku ve daha fazlası hakkında uzman avukatlarımızdan güncel makaleler ve rehberler.',
  keywords: 'hukuk makaleleri, avukat blog, hukuki rehberler, aile hukuku, ceza hukuku, iş hukuku, karabük avukat',
  openGraph: {
    title: 'Hukuk Makaleleri | Yılmaz Çolak Hukuk Bürosu',
    description: 'Hukuk alanında uzman makaleler ve rehberlerle bilginizi artırın',
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler`,
    type: 'website'
  }
};

// Server Component
export default function BlogListPage({ searchParams }) {
  return <BlogListClient searchParams={searchParams} />;
}