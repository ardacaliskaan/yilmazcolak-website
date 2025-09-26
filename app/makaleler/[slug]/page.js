// app/makaleler/[slug]/page.js - ULTRA PROFESSIONAL SINGLE ARTICLE PAGE
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Calendar, Clock, Eye, User, Share2, Facebook, Twitter, Linkedin, Copy,
  ChevronRight, Tag, BookOpen, ArrowLeft, ThumbsUp, MessageCircle,
  ExternalLink, ChevronDown, CheckCircle, Target, TrendingUp, Star,
  Globe, Shield, FileText, Settings, Zap, Users, Award, Hash,
  Printer, Download, Bookmark, Heart, AlertCircle, Info, Sparkles
} from 'lucide-react';

// Category & Template Configuration (same as articles page)
const CATEGORIES = {
  'genel': { label: 'Genel', icon: Globe, color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-100 text-gray-800' },
  'aile-hukuku': { label: 'Aile Hukuku', icon: Users, color: 'from-pink-500 to-rose-600', bgColor: 'bg-pink-100 text-pink-800' },
  'ceza-hukuku': { label: 'Ceza Hukuku', icon: Shield, color: 'from-red-500 to-red-600', bgColor: 'bg-red-100 text-red-800' },
  'is-hukuku': { label: 'İş Hukuku', icon: FileText, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-100 text-blue-800' },
  'ticaret-hukuku': { label: 'Ticaret Hukuku', icon: TrendingUp, color: 'from-green-500 to-green-600', bgColor: 'bg-green-100 text-green-800' },
  'idare-hukuku': { label: 'İdare Hukuku', icon: Settings, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-100 text-purple-800' },
  'icra-hukuku': { label: 'İcra Hukuku', icon: Zap, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-100 text-orange-800' },
  'gayrimenkul-hukuku': { label: 'Gayrimenkul Hukuku', icon: Target, color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-100 text-yellow-800' },
  'miras-hukuku': { label: 'Miras Hukuku', icon: Award, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-100 text-indigo-800' },
  'kvkk': { label: 'KVKK', icon: Shield, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-100 text-cyan-800' },
  'sigorta-hukuku': { label: 'Sigorta Hukuku', icon: FileText, color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-100 text-teal-800' }
};

const TEMPLATE_TYPES = {
  'standard': { icon: FileText, label: 'Standart Makale', color: 'bg-gray-100 text-gray-800' },
  'legal-article': { icon: Shield, label: 'Hukuki Analiz', color: 'bg-blue-100 text-blue-800' },
  'case-study': { icon: BookOpen, label: 'Vaka Çalışması', color: 'bg-green-100 text-green-800' },
  'legal-guide': { icon: Target, label: 'Hukuki Rehber', color: 'bg-purple-100 text-purple-800' },
  'news': { icon: Zap, label: 'Hukuk Haberi', color: 'bg-orange-100 text-orange-800' }
};

// Helper Functions
const formatViewCount = (count) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count?.toString() || '0';
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Az önce';
  if (diffInHours < 24) return `${diffInHours} saat önce`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} gün önce`;
  return formatDate(dateString);
};

// API Fetch Functions
async function getArticle(slug) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/articles/${slug}`, {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' }
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

async function getRelatedArticles(articleId, category, limit = 4) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      related: articleId,
      limit: limit.toString(),
      category
    });
    
    const response = await fetch(`${baseUrl}/api/public/articles?${params}`, {
      next: { revalidate: 600 },
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.success ? data.articles || [] : [];
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
      robots: { index: false, follow: false }
    };
  }

  const article = data.article;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const currentCategory = CATEGORIES[article.category];

  return {
    title: article.metaTitle || `${article.title} | Yılmaz Çolak Hukuk Bürosu`,
    description: article.metaDescription || article.excerpt,
    keywords: article.keywords?.join(', ') || article.tags?.join(', '),
    
    authors: [{ 
      name: article.authorName || 'Yılmaz Çolak Hukuk Bürosu',
      url: `${baseUrl}/ekibimiz`
    }],
    creator: article.authorName || 'Yılmaz Çolak Hukuk Bürosu',
    publisher: 'Yılmaz Çolak Hukuk Bürosu',
    
    openGraph: {
      title: article.socialTitle || article.metaTitle || article.title,
      description: article.socialDescription || article.metaDescription || article.excerpt,
      url: `${baseUrl}/makaleler/${article.slug}`,
      siteName: 'Yılmaz Çolak Hukuk Bürosu',
      locale: 'tr_TR',
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      section: currentCategory?.label || 'Hukuk',
      tags: article.tags,
      images: [
        {
          url: article.socialImage || article.featuredImage || `${baseUrl}/images/og-article.jpg`,
          width: 1200,
          height: 630,
          alt: article.title,
          type: 'image/jpeg'
        }
      ]
    },
    
    twitter: {
      card: 'summary_large_image',
      title: article.socialTitle || article.title,
      description: article.socialDescription || article.excerpt,
      creator: '@yilmazcolakhukuk',
      site: '@yilmazcolakhukuk',
      images: [article.socialImage || article.featuredImage || `${baseUrl}/images/og-article.jpg`]
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

// Static Params Generation
export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/articles?limit=50&featured=true`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.success ? data.articles.map((article) => ({
      slug: article.slug,
    })) : [];
  } catch {
    return [];
  }
}

// Structured Data Component
const ArticleStructuredData = ({ article }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const currentCategory = CATEGORIES[article.category];
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt || article.metaDescription,
    "image": article.featuredImage ? `${baseUrl}${article.featuredImage}` : `${baseUrl}/images/default-article.jpg`,
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

  // Legal Document Schema for legal articles
  const legalStructuredData = {
    "@context": "https://schema.org",
    "@type": "LegalDocument",
    "name": article.title,
    "description": article.excerpt || article.metaDescription,
    "url": `${baseUrl}/makaleler/${article.slug}`,
    "datePublished": article.publishedAt,
    "inLanguage": "tr-TR",
    "publisher": structuredData.publisher
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {article.template === 'legal-article' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(legalStructuredData) }}
        />
      )}
    </>
  );
};

// Breadcrumbs Component
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
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/makaleler" className="hover:text-blue-600 transition-colors">Makaleler</Link>
        <ChevronRight className="w-4 h-4" />
        <Link 
          href={`/makaleler?category=${article.category}`} 
          className="hover:text-blue-600 transition-colors"
        >
          {currentCategory?.label || 'Genel'}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium truncate">{article.title}</span>
      </nav>
    </>
  );
};

// Professional Share Component
const ShareComponent = ({ article, url }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(article.title);
  const encodedText = encodeURIComponent(article.excerpt || article.metaDescription);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // You could add a toast notification here
      alert('Bağlantı panoya kopyalandı!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Share2 className="w-5 h-5 text-blue-500" />
        Paylaş
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Facebook className="w-4 h-4" />
          Facebook
        </a>
        
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-sm"
        >
          <Twitter className="w-4 h-4" />
          Twitter
        </a>
        
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn
        </a>
        
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          WhatsApp
        </a>
        
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          <Copy className="w-4 h-4" />
          Kopyala
        </button>
        
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          <Printer className="w-4 h-4" />
          Yazdır
        </button>
      </div>
    </div>
  );
};

// Article Info Card
const ArticleInfoCard = ({ article }) => {
  const currentCategory = CATEGORIES[article.category];
  const currentTemplate = TEMPLATE_TYPES[article.template];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Info className="w-5 h-5 text-purple-500" />
        Makale Bilgileri
      </h3>
      
      <div className="space-y-4">
        {/* Category */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm">Kategori:</span>
          <Link
            href={`/makaleler?category=${article.category}`}
            className={`px-3 py-1 rounded-full text-xs font-medium ${currentCategory?.bgColor} hover:opacity-80 transition-opacity`}
          >
            <currentCategory.icon className="w-3 h-3 inline mr-1" />
            {currentCategory?.label}
          </Link>
        </div>

        {/* Template */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm">Tür:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentTemplate?.color}`}>
            <currentTemplate.icon className="w-3 h-3 inline mr-1" />
            {currentTemplate?.label}
          </span>
        </div>

        {/* Reading Time */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm">Okuma Süresi:</span>
          <span className="text-gray-900 font-medium text-sm">
            <Clock className="w-3 h-3 inline mr-1" />
            {article.readingTime || 5} dakika
          </span>
        </div>

        {/* Word Count */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm">Kelime Sayısı:</span>
          <span className="text-gray-900 font-medium text-sm">
            {article.wordCount?.toLocaleString() || '0'} kelime
          </span>
        </div>

        {/* Views */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm">Görüntüleme:</span>
          <span className="text-gray-900 font-medium text-sm">
            <Eye className="w-3 h-3 inline mr-1" />
            {formatViewCount(article.viewCount || 0)}
          </span>
        </div>

        {/* Published Date */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 text-sm">Yayın Tarihi:</span>
          <span className="text-gray-900 font-medium text-sm">
            <Calendar className="w-3 h-3 inline mr-1" />
            {formatDate(article.publishedAt)}
          </span>
        </div>

        {/* SEO Score */}
        {article.seoScore && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">SEO Puanı:</span>
            <div className="flex items-center gap-2">
              <div className="w-12 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    article.seoScore >= 80 ? 'bg-green-500' : 
                    article.seoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${article.seoScore}%` }}
                />
              </div>
              <span className={`text-sm font-medium ${
                article.seoScore >= 80 ? 'text-green-600' : 
                article.seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {article.seoScore}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Related Articles Component
const RelatedArticles = ({ articles }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-green-500" />
        İlgili Makaleler
      </h3>
      
      <div className="space-y-4">
        {articles.map((article) => {
          const currentCategory = CATEGORIES[article.category];
          return (
            <article key={article.slug} className="group">
              <Link href={`/makaleler/${article.slug}`}>
                <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h4>
              </Link>
              
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span className={`px-2 py-1 rounded-md ${currentCategory?.bgColor}`}>
                  {currentCategory?.label}
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
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </Link>
      </div>
    </div>
  );
};

// Table of Contents Component
const TableOfContents = ({ content }) => {
  // Extract headings from content
  const headings = content.match(/<h[2-6][^>]*>(.*?)<\/h[2-6]>/gi);
  
  if (!headings || headings.length === 0) return null;

  const tocItems = headings.map((heading, index) => {
    const level = parseInt(heading.match(/<h([2-6])/)[1]);
    const text = heading.replace(/<[^>]*>/g, '');
    const id = text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    return { level, text, id, index };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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

// Main Article Component
export default async function SingleArticlePage({ params }) {
  const data = await getArticle(params.slug);
  
  if (!data || !data.article) {
    notFound();
  }

  const article = data.article;
  const relatedArticles = await getRelatedArticles(article._id || article.id, article.category);
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler/${article.slug}`;
  const currentCategory = CATEGORIES[article.category];
  const currentTemplate = TEMPLATE_TYPES[article.template];

  return (
    <>
      <ArticleStructuredData article={article} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Article Header */}
        <div className={`bg-gradient-to-r ${currentCategory?.color} text-white relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-12">
            <Breadcrumbs article={article} />
            
            {/* Back Button */}
            <div className="mb-6">
              <Link
                href="/makaleler"
                className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Makalelere Dön
              </Link>
            </div>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                <currentCategory.icon className="w-4 h-4 inline mr-2" />
                {currentCategory?.label}
              </span>
              
              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                <currentTemplate.icon className="w-4 h-4 inline mr-2" />
                {currentTemplate?.label}
              </span>
              
              <span className="text-white/80 text-sm">
                <Calendar className="w-4 h-4 inline mr-1" />
                {formatDate(article.publishedAt)}
              </span>
              
              <span className="text-white/80 text-sm">
                <Clock className="w-4 h-4 inline mr-1" />
                {article.readingTime || 5} dakika okuma
              </span>
              
              <span className="text-white/80 text-sm">
                <Eye className="w-4 h-4 inline mr-1" />
                {formatViewCount(article.viewCount || 0)} görüntüleme
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-white/90 leading-relaxed mb-6 max-w-4xl">
                {article.excerpt}
              </p>
            )}

            {/* Author & Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{article.authorName || 'Yılmaz Çolak'}</div>
                  <div className="text-white/80 text-sm">Uzman Avukat</div>
                </div>
              </div>

              {/* Quality Indicators */}
              <div className="flex items-center gap-4">
                {article.isFeatured && (
                  <div className="flex items-center gap-1 text-amber-300">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">Öne Çıkan</span>
                  </div>
                )}
                
                {article.seoScore >= 80 && (
                  <div className="flex items-center gap-1 text-green-300">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">SEO Optimize</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Article Content */}
            <main className="lg:col-span-3">
              <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Featured Image */}
                {article.featuredImage && (
                  <div className="relative h-96 overflow-hidden">
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-8 lg:p-12">
                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {article.tags.map((tag, index) => (
                        <Link
                          key={index}
                          href={`/makaleler?search=${encodeURIComponent(tag)}`}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Article Body */}
                  <div 
                    className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-white"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />

                  {/* Legal References */}
                  {article.legalReferences && article.legalReferences.length > 0 && (
                    <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-100">
                      <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Hukuki Dayanaklar
                      </h3>
                      <ul className="space-y-2">
                        {article.legalReferences.map((ref, index) => (
                          <li key={index} className="text-blue-800 text-sm">
                            <CheckCircle className="w-4 h-4 inline mr-2" />
                            {ref}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>

              {/* Call to Action */}
              <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Hukuki Desteğe Mi İhtiyacınız Var?</h3>
                <p className="text-blue-100 mb-6">
                  Uzman avukat kadromuzdan ücretsiz ön değerlendirme alın.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/iletisim"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    İletişime Geçin
                  </Link>
                  <Link
                    href="/calisma-alanlari"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    <BookOpen className="w-5 h-5" />
                    Çalışma Alanlarımız
                  </Link>
                </div>
              </div>
            </main>

            {/* Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <TableOfContents content={article.content} />
              <ArticleInfoCard article={article} />
              <ShareComponent article={article} url={currentUrl} />
              <RelatedArticles articles={relatedArticles} />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}