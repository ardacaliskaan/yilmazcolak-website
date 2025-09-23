// app/makaleler/[slug]/page.js - Ultra SEO Optimized Single Article Page
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Eye, 
  User, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin,
  Copy,
  ChevronRight,
  Tag,
  BookOpen,
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  CheckCircle,
  Target,
  TrendingUp
} from 'lucide-react';

// Single Article API Fetch (Server Side)
async function getArticle(slug) {
  try {
    // Server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/articles/${slug}`, {
      next: { revalidate: 300 }, // 5 dakika cache
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch article: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('Article fetch error:', error);
    return null;
  }
}

// Related Articles Fetch
async function getRelatedArticles(articleId, category, limit = 4) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      related: articleId,
      limit: limit.toString()
    });
    
    const response = await fetch(`${baseUrl}/api/public/articles?${params}`, {
      next: { revalidate: 600 }, // 10 dakika cache
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.success ? data.articles : [];
  } catch (error) {
    console.error('Related articles fetch error:', error);
    return [];
  }
}

// SEO Metadata Generation
export async function generateMetadata({ params }) {
  const data = await getArticle(params.slug);
  
  if (!data || !data.article) {
    return {
      title: 'Makale Bulunamadı | Yılmaz Çolak Hukuk Bürosu',
      description: 'Aradığınız makale bulunamadı.',
      robots: 'noindex, nofollow'
    };
  }

  const article = data.article;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  return {
    title: article.metaTitle || `${article.title} | Yılmaz Çolak Hukuk Bürosu`,
    description: article.metaDescription || article.excerpt,
    keywords: [
      article.focusKeyword,
      ...article.keywords || [],
      ...article.tags || [],
      article.categoryName,
      'karabük avukat',
      'hukuk danışmanlık',
      'yılmaz çolak hukuk bürosu'
    ].filter(Boolean).join(', '),
    
    authors: [{ name: article.authorName }],
    creator: article.authorName,
    publisher: 'Yılmaz Çolak Hukuk Bürosu',
    category: article.categoryName,
    
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      url: `${baseUrl}/makaleler/${article.slug}`,
      siteName: 'Yılmaz Çolak Hukuk Bürosu',
      locale: 'tr_TR',
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: [article.authorName],
      section: article.categoryName,
      tags: article.tags,
      images: article.featuredImage ? [
        {
          url: `${baseUrl}${article.featuredImage}`,
          width: 1200,
          height: 630,
          alt: article.title,
          type: 'image/jpeg'
        }
      ] : [{
        url: `${baseUrl}/images/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Yılmaz Çolak Hukuk Bürosu'
      }]
    },
    
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      creator: '@yilmazcolakhukuk',
      site: '@yilmazcolakhukuk',
      images: article.featuredImage ? [`${baseUrl}${article.featuredImage}`] : [`${baseUrl}/images/og-default.jpg`]
    },
    
    robots: {
      index: article.isIndexable !== false,
      follow: true,
      googleBot: {
        index: article.isIndexable !== false,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    alternates: {
      canonical: `${baseUrl}/makaleler/${article.slug}`
    }
  };
}

// Generate Static Params (Optional - for static generation)
export async function generateStaticParams() {
  // Bu fonksiyon build time'da çalışır ve popüler makaleleri pre-generate eder
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/articles?limit=50&popular=true`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.success ? data.articles.map((article) => ({
      slug: article.slug,
    })) : [];
  } catch {
    return [];
  }
}

// Article Structured Data Component
const ArticleStructuredData = ({ article }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.featuredImage ? `${baseUrl}${article.featuredImage}` : `${baseUrl}/images/default-article.jpg`,
    "url": `${baseUrl}/makaleler/${article.slug}`,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "wordCount": article.wordCount,
    "timeRequired": `PT${article.readingTime || 5}M`,
    "articleSection": article.categoryName,
    "keywords": article.tags?.join(', '),
    "inLanguage": "tr-TR",
    "author": {
      "@type": "Person",
      "name": article.authorName,
      "url": `${baseUrl}/ekibimiz/${article.author?.slug || ''}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Yılmaz Çolak Hukuk Bürosu",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`,
        "width": 200,
        "height": 80
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/makaleler/${article.slug}`
    },
    "isAccessibleForFree": true,
    "hasPart": {
      "@type": "WebPageElement",
      "@id": `${baseUrl}/makaleler/${article.slug}#content`
    }
  };

  // Eğer hukuk makalesi ise LegalDocument schema'sı da ekle
  const legalStructuredData = {
    "@context": "https://schema.org",
    "@type": "LegalDocument",
    "name": article.title,
    "description": article.excerpt,
    "url": `${baseUrl}/makaleler/${article.slug}`,
    "datePublished": article.publishedAt,
    "inLanguage": "tr-TR",
    "publisher": {
      "@type": "LegalService",
      "name": "Yılmaz Çolak Hukuk Bürosu"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(legalStructuredData) }}
      />
    </>
  );
};

// Breadcrumbs Component
const Breadcrumbs = ({ article }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Makaleler",
        "item": `${baseUrl}/makaleler`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.categoryName,
        "item": `${baseUrl}/makaleler?category=${article.category}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": article.title,
        "item": `${baseUrl}/makaleler/${article.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/makaleler" className="hover:text-blue-600 transition-colors">Makaleler</Link>
        <ChevronRight className="w-4 h-4" />
        <Link 
          href={`/makaleler?category=${article.category}`} 
          className="hover:text-blue-600 transition-colors"
        >
          {article.categoryName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">{article.title}</span>
      </nav>
    </>
  );
};

// Share Component
const ShareComponent = ({ article, url }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(article.title);
  const encodedText = encodeURIComponent(article.excerpt);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // Toast notification - implement as needed
      alert('Bağlantı panoya kopyalandı!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Share2 className="w-5 h-5" />
        Bu Makaleyi Paylaş
      </h4>
      
      <div className="flex items-center gap-3">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          aria-label="Facebook'ta paylaş"
        >
          <Facebook className="w-5 h-5" />
        </a>
        
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
          aria-label="Twitter'da paylaş"
        >
          <Twitter className="w-5 h-5" />
        </a>
        
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
          aria-label="LinkedIn'de paylaş"
        >
          <Linkedin className="w-5 h-5" />
        </a>
        
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          aria-label="Bağlantıyı kopyala"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Article Stats Component
const ArticleStats = ({ article }) => {
  const seoColor = article.seoScore >= 80 ? 'text-green-600' : article.seoScore >= 60 ? 'text-yellow-600' : 'text-red-600';
  const readabilityColor = article.readabilityScore >= 80 ? 'text-green-600' : article.readabilityScore >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" />
        Makale İstatistikleri
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${seoColor}`}>{article.seoScore || 0}%</div>
          <div className="text-sm text-gray-600">SEO Skoru</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${readabilityColor}`}>{article.readabilityScore || 0}%</div>
          <div className="text-sm text-gray-600">Okunabilirlik</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{formatViewCount(article.viewCount)}</div>
          <div className="text-sm text-gray-600">Görüntülenme</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{article.readingTime || Math.ceil(article.wordCount / 200)} dk</div>
          <div className="text-sm text-gray-600">Okuma Süresi</div>
        </div>
      </div>
    </div>
  );
};

// Related Articles Component  
const RelatedArticles = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
        İlgili Makaleler
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((article) => (
          <article key={article.slug} className="group">
            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              <Link href={`/makaleler/${article.slug}`}>
                {article.title}
              </Link>
            </h4>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(article.publishedAt).toLocaleDateString('tr-TR')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatViewCount(article.viewCount)}
                </span>
              </div>
              
              <Link
                href={`/makaleler/${article.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium group-hover:underline"
              >
                Oku →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

// Main Page Component
export default async function SingleArticlePage({ params }) {
  // Fetch article data
  const data = await getArticle(params.slug);
  
  if (!data || !data.article) {
    notFound();
  }

  const article = data.article;
  const relatedArticles = await getRelatedArticles(article._id || article.id, article.category);
  
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler/${article.slug}`;

  // Increment view count (non-blocking)
  // This would typically be done client-side or in a separate API call
  
  return (
    <>
      <ArticleStructuredData article={article} />
      
      <div className="min-h-screen bg-gray-50">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs article={article} />
          
          {/* Back Button */}
          <div className="mb-8">
            <Link
              href="/makaleler"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Makalelere Dön
            </Link>
          </div>

          {/* Article Header */}
          <header className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-8">
            {/* Category Badge */}
            <div className="mb-4">
              <Link
                href={`/makaleler?category=${article.category}`}
                className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                {article.categoryName}
              </Link>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <div className="text-xl text-gray-600 leading-relaxed mb-8 border-l-4 border-blue-500 pl-6">
                {article.excerpt}
              </div>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="font-medium">{article.authorName}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <time dateTime={article.publishedAt}>
                  {new Date(article.publishedAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </time>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{article.readingTime || Math.ceil(article.wordCount / 200)} dakika okuma</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{formatViewCount(article.viewCount)} görüntülenme</span>
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Featured Image */}
            {article.featuredImage && (
              <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
                />
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <main className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-8">
                {/* Article Content */}
                <div 
                  id="content"
                  className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Legal References */}
                {article.legalReferences && article.legalReferences.length > 0 && (
                  <div className="mt-12 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      Yasal Dayanaklar
                    </h3>
                    <ul className="space-y-2">
                      {article.legalReferences.map((reference, index) => (
                        <li key={index} className="text-blue-800 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-1 flex-shrink-0" />
                          {reference}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Update Info */}
                {article.updatedAt && article.updatedAt !== article.publishedAt && (
                  <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm">
                      <strong>Son güncelleme:</strong> {new Date(article.updatedAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Social Share */}
              <ShareComponent article={article} url={currentUrl} />
            </main>

            {/* Sidebar */}
            <aside className="space-y-8">
              <ArticleStats article={article} />
              
              {/* Author Info */}
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yazar Hakkında</h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {article.authorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{article.authorName}</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Yılmaz Çolak Hukuk Bürosu
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-16">
              <RelatedArticles articles={relatedArticles} />
            </div>
          )}
        </article>
      </div>
    </>
  );
}

// Helper Functions
function formatViewCount(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count?.toString() || '0';
}