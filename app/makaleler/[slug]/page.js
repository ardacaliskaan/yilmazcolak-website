// app/makaleler/[slug]/page.js - Frontend Makale Display Sayfası
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, Eye, Clock, User, Share2, BookOpen, 
  ArrowLeft, Tag, ExternalLink, ChevronRight, Home,
  Facebook, Twitter, Linkedin, MessageCircle, Copy,
  FileText, TrendingUp, Award, Users
} from 'lucide-react';

// ✅ Categories Configuration
const CATEGORIES = {
  'genel': {
    label: 'Genel Hukuk',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-100 text-gray-800',
    icon: FileText
  },
  'aile-hukuku': {
    label: 'Aile Hukuku',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-100 text-pink-800',
    icon: Users
  },
  'ceza-hukuku': {
    label: 'Ceza Hukuku',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-100 text-red-800',
    icon: Award
  },
  'is-hukuku': {
    label: 'İş Hukuku',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-100 text-blue-800',
    icon: Users
  },
  'ticaret-hukuku': {
    label: 'Ticaret Hukuku',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-100 text-green-800',
    icon: TrendingUp
  },
  'idare-hukuku': {
    label: 'İdare Hukuku',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-100 text-purple-800',
    icon: FileText
  },
  'icra-hukuku': {
    label: 'İcra Hukuku',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-100 text-orange-800',
    icon: Award
  },
  'gayrimenkul-hukuku': {
    label: 'Gayrimenkul Hukuku',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-100 text-yellow-800',
    icon: Home
  },
  'miras-hukuku': {
    label: 'Miras Hukuku',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-100 text-indigo-800',
    icon: Users
  },
  'kvkk': {
    label: 'KVKK',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-100 text-cyan-800',
    icon: FileText
  },
  'sigorta-hukuku': {
    label: 'Sigorta Hukuku',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-100 text-teal-800',
    icon: Award
  }
};

// ✅ Data fetching functions
async function getArticle(slug) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/articles/${slug}`, {
      next: { revalidate: 300 } // 5 minutes ISR
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data.article : null;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

async function getRelatedArticles(articleId, category, limit = 3) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/articles?category=${category}&limit=${limit}&exclude=${articleId}`, {
      next: { revalidate: 600 } // 10 minutes ISR
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.success ? data.articles : [];
  } catch (error) {
    console.error('Failed to fetch related articles:', error);
    return [];
  }
}

// ✅ Metadata generation
export async function generateMetadata({ params }) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    return {
      title: 'Makale Bulunamadı | Yılmaz Çolak Hukuk Bürosu',
      description: 'Aradığınız makale bulunamadı.'
    };
  }

  const title = article.metaTitle || article.title;
  const description = article.metaDescription || article.excerpt;
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler/${article.slug}`;

  return {
    title: `${title} | Yılmaz Çolak Hukuk Bürosu`,
    description,
    keywords: article.keywords?.join(', '),
    authors: [{ name: article.authorName || 'Yılmaz Çolak' }],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Yılmaz Çolak Hukuk Bürosu',
      images: article.featuredImage ? [
        {
          url: article.featuredImage,
          width: 1200,
          height: 630,
          alt: article.featuredImageAlt || article.title
        }
      ] : [],
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.authorName || 'Yılmaz Çolak'],
      section: CATEGORIES[article.category]?.label,
      tags: article.tags
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.featuredImage ? [article.featuredImage] : []
    },
    alternates: {
      canonical: canonicalUrl
    },
    other: {
      'article:published_time': article.publishedAt,
      'article:modified_time': article.updatedAt,
      'article:author': article.authorName || 'Yılmaz Çolak',
      'article:section': CATEGORIES[article.category]?.label,
      'article:tag': article.tags?.join(',')
    }
  };
}

// ✅ Generate Static Params for ISR
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/articles?limit=50&published=true`);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.success ? data.articles.map((article) => ({
      slug: article.slug,
    })) : [];
  } catch {
    return [];
  }
}

// ✅ Structured Data Component
const ArticleStructuredData = ({ article }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const currentCategory = CATEGORIES[article.category];
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt || article.metaDescription,
    "image": article.featuredImage ? article.featuredImage : `${baseUrl}/images/default-article.jpg`,
    "url": `${baseUrl}/makaleler/${article.slug}`,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "wordCount": article.wordCount || 0,
    "timeRequired": `PT${article.readingTime || 5}M`,
    "articleSection": currentCategory?.label || 'Hukuk',
    "keywords": article.tags?.join(', '),
    "inLanguage": "tr-TR",
    "author": {
      "@type": "Person",
      "name": article.authorName || "Yılmaz Çolak",
      "url": `${baseUrl}/ekibimiz`
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
    "isAccessibleForFree": true
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

// ✅ Breadcrumb Component
const Breadcrumbs = ({ article }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const currentCategory = CATEGORIES[article.category];
  
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
        "name": currentCategory?.label || 'Genel',
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
      <nav className="flex items-center space-x-2 text-sm text-white/80 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <Home className="w-4 h-4" />
          Ana Sayfa
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/makaleler" className="hover:text-white transition-colors">
          Makaleler
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link 
          href={`/makaleler?category=${article.category}`}
          className="hover:text-white transition-colors"
        >
          {currentCategory?.label || 'Genel'}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-white font-medium truncate">{article.title}</span>
      </nav>
    </>
  );
};

// ✅ Article Header Component
const ArticleHeader = ({ article }) => {
  const currentCategory = CATEGORIES[article.category];
  const CategoryIcon = currentCategory?.icon || FileText;

  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
          <CategoryIcon className="w-4 h-4" />
          {currentCategory?.label || 'Genel'}
        </span>
        
        {article.featured && (
          <span className="bg-yellow-500/20 backdrop-blur-sm text-yellow-100 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <Award className="w-4 h-4" />
            Öne Çıkan
          </span>
        )}
      </div>
      
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
        {article.title}
      </h1>
      
      {article.excerpt && (
        <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-3xl">
          {article.excerpt}
        </p>
      )}
      
      <div className="flex flex-wrap items-center gap-6 text-sm text-white/80">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="font-medium">{article.authorName || 'Yılmaz Çolak'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>
        
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{article.readingTime || 5} dakika okuma</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>{formatViewCount(article.viewCount || 0)} görüntülenme</span>
        </div>
      </div>
    </header>
  );
};

// ✅ Article Content Component
const ArticleContent = ({ content }) => (
  <div 
    className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:my-6 prose-ol:my-6 prose-li:my-2 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:not-italic prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:shadow-md prose-table:table-auto prose-th:bg-gray-50 prose-th:font-semibold prose-td:border prose-th:border"
    dangerouslySetInnerHTML={{ __html: content }}
  />
);

// ✅ Social Share Component
const SocialShare = ({ article }) => {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler/${article.slug}`;
  const text = article.title;
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Bağlantı panoya kopyalandı!');
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Share2 className="w-5 h-5 text-blue-600" />
        Bu Makaleyi Paylaş
      </h3>
      
      <div className="flex flex-wrap gap-3">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </a>
        
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          <Twitter className="w-4 h-4" />
          Twitter
        </a>
        
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </a>
        
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Kopyala
        </button>
      </div>
    </div>
  );
};

// ✅ Related Articles Component
const RelatedArticles = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-green-500" />
        İlgili Makaleler
      </h3>
      
      <div className="space-y-6">
        {articles.map((article) => {
          const currentCategory = CATEGORIES[article.category];
          return (
            <article key={article.slug} className="group">
              <Link href={`/makaleler/${article.slug}`} className="block">
                <div className="flex gap-4">
                  {article.featuredImage && (
                    <div className="flex-shrink-0 w-24 h-24">
                      <Image
                        src={article.featuredImage}
                        alt={article.featuredImageAlt || article.title}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h4>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span className={`px-2 py-1 rounded-md ${currentCategory?.bgColor || 'bg-gray-100 text-gray-800'}`}>
                        {currentCategory?.label || 'Genel'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatViewCount(article.viewCount || 0)}
                      </span>
                    </div>
                    
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                    )}
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link
          href="/makaleler"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Tüm Makaleler
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

// ✅ Article Tags Component
const ArticleTags = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Tag className="w-5 h-5 text-purple-600" />
        Etiketler
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/makaleler?tag=${encodeURIComponent(tag)}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </div>
  );
};

// ✅ Table of Contents Component
const TableOfContents = ({ content }) => {
  // Extract headings from content (H2, H3, H4)
  const headings = content?.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/gi);
  
  if (!headings || headings.length === 0) return null;

  const tocItems = headings.map((heading, index) => {
    const level = parseInt(heading.match(/<h([2-4])/)[1]);
    const text = heading.replace(/<[^>]*>/g, '');
    const id = text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    return { level, text, id, index };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-500" />
        İçindekiler
      </h3>
      
      <nav className="space-y-2">
        {tocItems.map((item) => (
          <a
            key={item.index}
            href={`#${item.id}`}
            className={`block py-1 text-sm hover:text-blue-600 transition-colors ${
              item.level === 2 ? 'font-medium text-gray-900' :
              item.level === 3 ? 'pl-4 text-gray-700' :
              'pl-8 text-gray-600'
            }`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </div>
  );
};

// ✅ Main Page Component
export default async function ArticlePage({ params }) {
  const article = await getArticle(params.slug);
  
  if (!article) {
    notFound();
  }

  // Fetch related articles
  const relatedArticles = await getRelatedArticles(article._id || article.id, article.category);
  const currentCategory = CATEGORIES[article.category];

  return (
    <>
      <ArticleStructuredData article={article} />
      
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className={`bg-gradient-to-r ${currentCategory?.color || 'from-gray-500 to-gray-600'} text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
          
          <div className="relative max-w-4xl mx-auto px-6 py-12">
            <Breadcrumbs article={article} />
            
            <div className="mb-6">
              <Link
                href="/makaleler"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Makalelere Dön
              </Link>
            </div>
            
            <ArticleHeader article={article} />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Article Content */}
            <div className="lg:col-span-3">
              {/* Featured Image */}
              {article.featuredImage && (
                <div className="mb-8">
                  <Image
                    src={article.featuredImage}
                    alt={article.featuredImageAlt || article.title}
                    width={800}
                    height={400}
                    className="w-full h-auto rounded-xl shadow-lg"
                    priority
                  />
                </div>
              )}
              
              {/* Article Body */}
              <ArticleContent content={article.content} />
              
              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <SocialShare article={article} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <TableOfContents content={article.content} />
              <ArticleTags tags={article.tags} />
              <RelatedArticles articles={relatedArticles} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ✅ Utility Functions
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
  
  return date.toLocaleDateString('tr-TR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function formatViewCount(count) {
  if (!count) return '0';
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}