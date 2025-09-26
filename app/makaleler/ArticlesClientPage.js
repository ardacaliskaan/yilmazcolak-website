// app/makaleler/page.js - ULTRA PROFESSIONAL ARTICLES LIST
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, Calendar, Clock, Eye, User, ArrowRight, Filter, TrendingUp, Star,
  ChevronLeft, ChevronRight, Share2, BookOpen, Tag, Hash, Globe, Shield,
  FileText, Settings, Target, Zap, Users, Sparkles, Award, Flame,
  MessageSquare, ThumbsUp, ExternalLink, Copy, Facebook, Twitter, Linkedin,
  WhatsApp, Download, Play, X, ChevronDown, SortAsc, Grid, List
} from 'lucide-react';

// Advanced Category Configuration
const CATEGORIES = [
  { 
    value: 'genel', 
    label: 'Genel', 
    icon: Globe, 
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-100 text-gray-800',
    description: 'Genel hukuki konular ve güncel bilgiler',
    count: 0
  },
  { 
    value: 'aile-hukuku', 
    label: 'Aile Hukuku', 
    icon: Users, 
    color: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-100 text-pink-800',
    description: 'Boşanma, velayet, nafaka ve aile içi konular',
    count: 0
  },
  { 
    value: 'ceza-hukuku', 
    label: 'Ceza Hukuku', 
    icon: Shield, 
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-100 text-red-800',
    description: 'Ceza davaları, suç türleri ve savunma stratejileri',
    count: 0
  },
  { 
    value: 'is-hukuku', 
    label: 'İş Hukuku', 
    icon: FileText, 
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-100 text-blue-800',
    description: 'İşçi hakları, iş sözleşmeleri ve işveren yükümlülükleri',
    count: 0
  },
  { 
    value: 'ticaret-hukuku', 
    label: 'Ticaret Hukuku', 
    icon: TrendingUp, 
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-100 text-green-800',
    description: 'Şirket kurma, ticari sözleşmeler ve ticaret hukuku',
    count: 0
  },
  { 
    value: 'idare-hukuku', 
    label: 'İdare Hukuku', 
    icon: Settings, 
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-100 text-purple-800',
    description: 'Kamu yönetimi, idari dava ve belediye hukuku',
    count: 0
  },
  { 
    value: 'icra-hukuku', 
    label: 'İcra Hukuku', 
    icon: Zap, 
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-100 text-orange-800',
    description: 'İcra takibi, haciz işlemleri ve alacak hukuku',
    count: 0
  },
  { 
    value: 'gayrimenkul-hukuku', 
    label: 'Gayrimenkul Hukuku', 
    icon: Target, 
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-100 text-yellow-800',
    description: 'Tapu işlemleri, emlak alım satım ve kira hukuku',
    count: 0
  },
  { 
    value: 'miras-hukuku', 
    label: 'Miras Hukuku', 
    icon: Award, 
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-100 text-indigo-800',
    description: 'Miras paylaşımı, vasiyet ve tereke işlemleri',
    count: 0
  },
  { 
    value: 'kvkk', 
    label: 'KVKK', 
    icon: Shield, 
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-100 text-cyan-800',
    description: 'Kişisel veri koruma ve gizlilik hakları',
    count: 0
  },
  { 
    value: 'sigorta-hukuku', 
    label: 'Sigorta Hukuku', 
    icon: FileText, 
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-100 text-teal-800',
    description: 'Sigorta poliçeleri, hasar ve tazminat davalar',
    count: 0
  }
];

// Template Types for Better Categorization
const TEMPLATE_TYPES = {
  'standard': { icon: FileText, label: 'Standart Makale' },
  'legal-article': { icon: Shield, label: 'Hukuki Analiz' },
  'case-study': { icon: BookOpen, label: 'Vaka Çalışması' },
  'legal-guide': { icon: Target, label: 'Hukuki Rehber' },
  'news': { icon: Zap, label: 'Hukuk Haberi' }
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

// Structured Data Component
const ArticlesStructuredData = ({ articles, category, search }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Yılmaz Çolak Hukuk Bürosu Blog",
    "description": "Hukuk alanında uzman makaleler, güncel gelişmeler ve rehberler",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler`,
    "publisher": {
      "@type": "Organization",
      "name": "Yılmaz Çolak Hukuk Bürosu",
      "url": process.env.NEXT_PUBLIC_SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
        "width": 200,
        "height": 80
      }
    }
  };

  if (articles.length > 0) {
    structuredData.blogPost = articles.slice(0, 10).map(article => ({
      "@type": "BlogPosting",
      "headline": article.title,
      "description": article.excerpt || article.metaDescription,
      "url": `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler/${article.slug}`,
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt || article.publishedAt,
      "wordCount": article.wordCount || 0,
      "timeRequired": `PT${article.readingTime || 5}M`,
      "articleSection": article.categoryName,
      "author": {
        "@type": "Person",
        "name": article.authorName || "Yılmaz Çolak Hukuk Bürosu"
      },
      "publisher": structuredData.publisher,
      "image": article.featuredImage ? `${process.env.NEXT_PUBLIC_SITE_URL}${article.featuredImage}` : undefined,
      "keywords": article.tags?.join(', ')
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

// Breadcrumbs Component
const Breadcrumbs = ({ category, search }) => {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": process.env.NEXT_PUBLIC_SITE_URL
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Makaleler",
        "item": `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler`
      }
    ]
  };

  const currentCategory = CATEGORIES.find(cat => cat.value === category);

  if (currentCategory) {
    breadcrumbData.itemListElement.push({
      "@type": "ListItem",
      "position": 3,
      "name": currentCategory.label,
      "item": `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler?category=${category}`
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/makaleler" className="hover:text-blue-600 transition-colors">Makaleler</Link>
        {currentCategory && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{currentCategory.label}</span>
          </>
        )}
        {search && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">&quot;{search}&quot; araması</span>
          </>
        )}
      </nav>
    </>
  );
};

// Professional Article Card
const ArticleCard = ({ article, featured = false, viewMode = 'grid' }) => {
  const currentCategory = CATEGORIES.find(cat => cat.value === article.category);
  const currentTemplate = TEMPLATE_TYPES[article.template] || TEMPLATE_TYPES.standard;

  if (viewMode === 'list') {
    return (
      <article className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-6">
        <div className="flex gap-6">
          {/* Image */}
          {article.featuredImage && (
            <div className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={article.featuredImage}
                alt={article.title}
                width={192}
                height={128}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1">
            {/* Meta Info */}
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentCategory?.bgColor}`}>
                {currentCategory?.label}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <currentTemplate.icon className="w-3 h-3" />
                {currentTemplate.label}
              </span>
              <span className="text-xs text-gray-500">{getRelativeTime(article.publishedAt)}</span>
            </div>

            {/* Title & Excerpt */}
            <Link href={`/makaleler/${article.slug}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                {article.title}
              </h3>
            </Link>
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">{article.excerpt}</p>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readingTime || 5} dk
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatViewCount(article.viewCount || 0)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {article.authorName}
                </span>
              </div>
              <Link
                href={`/makaleler/${article.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Oku →
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid View
  return (
    <article className={`group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden ${
      featured ? 'md:col-span-2 lg:col-span-2' : ''
    }`}>
      {/* Featured Image */}
      {article.featuredImage && (
        <div className={`relative overflow-hidden ${featured ? 'h-64' : 'h-48'}`}>
          <Image
            src={article.featuredImage}
            alt={article.title}
            width={featured ? 600 : 400}
            height={featured ? 320 : 240}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Overlay with Category */}
          <div className="absolute top-4 left-4">
            <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${currentCategory?.color} text-white text-xs font-medium shadow-lg`}>
              <currentCategory.icon className="w-3 h-3 inline mr-1" />
              {currentCategory?.label}
            </div>
          </div>

          {/* Template Badge */}
          <div className="absolute top-4 right-4">
            <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <currentTemplate.icon className="w-3 h-3" />
              {currentTemplate.label}
            </div>
          </div>

          {/* Reading Time */}
          <div className="absolute bottom-4 right-4">
            <div className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-md text-xs font-medium">
              <Clock className="w-3 h-3 inline mr-1" />
              {article.readingTime || 5} dk
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          <span>{getRelativeTime(article.publishedAt)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {article.authorName}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {formatViewCount(article.viewCount || 0)}
          </span>
        </div>

        {/* Title */}
        <Link href={`/makaleler/${article.slug}`}>
          <h3 className={`font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 ${
            featured ? 'text-2xl' : 'text-lg'
          }`}>
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className={`text-gray-600 mb-4 line-clamp-3 ${featured ? 'text-base' : 'text-sm'}`}>
          {article.excerpt || article.metaDescription}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* SEO Score */}
            {article.seoScore && (
              <div className="flex items-center gap-1 text-xs">
                <Target className="w-3 h-3 text-green-500" />
                <span className="text-green-600 font-medium">{article.seoScore}</span>
              </div>
            )}
            
            {/* Quality Indicators */}
            {article.isFeatured && (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <Star className="w-3 h-3 fill-current" />
                <span>Öne Çıkan</span>
              </div>
            )}
          </div>

          <Link
            href={`/makaleler/${article.slug}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm group-hover:gap-3 transition-all"
          >
            Devamını Oku
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};

// Advanced Sidebar
const Sidebar = ({ featured, popular, categories, loading }) => (
  <aside className="space-y-6">
    {/* Featured Articles */}
    {featured && featured.length > 0 && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Öne Çıkan Makaleler
        </h3>
        <div className="space-y-4">
          {featured.slice(0, 5).map((article, index) => (
            <article key={article.slug} className="group">
              <Link href={`/makaleler/${article.slug}`}>
                <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm">
                  {article.title}
                </h4>
              </Link>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatViewCount(article.viewCount || 0)}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    )}

    {/* Popular Articles */}
    {popular && popular.length > 0 && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Popüler Makaleler
        </h3>
        <div className="space-y-4">
          {popular.slice(0, 5).map((article, index) => (
            <article key={article.slug} className="group flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div>
                <Link href={`/makaleler/${article.slug}`}>
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm">
                    {article.title}
                  </h4>
                </Link>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatViewCount(article.viewCount || 0)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    )}

    {/* Categories */}
    {categories && categories.length > 0 && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Hash className="w-5 h-5 text-purple-500" />
          Kategoriler
        </h3>
        <div className="space-y-2">
          {categories.map((category) => {
            const categoryConfig = CATEGORIES.find(cat => cat.value === category.slug);
            return (
              <Link
                key={category.slug}
                href={`/makaleler?category=${category.slug}`}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  {categoryConfig && <categoryConfig.icon className="w-4 h-4 text-gray-500" />}
                  <span className="font-medium text-gray-700 group-hover:text-blue-600 text-sm">
                    {category.name}
                  </span>
                </div>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    )}
  </aside>
);

// Advanced Pagination
const Pagination = ({ currentPage, totalPages, hasNext, hasPrev }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const createPageUrl = (page) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    return `/makaleler${params.toString() ? '?' + params.toString() : ''}`;
  };

  const pages = [];
  const showPages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  let endPage = Math.min(totalPages, startPage + showPages - 1);
  
  if (endPage - startPage + 1 < showPages) {
    startPage = Math.max(1, endPage - showPages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center justify-center space-x-2" aria-label="Sayfalama">
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Önceki
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-4 py-2 text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          Önceki
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {startPage > 1 && (
          <>
            <Link
              href={createPageUrl(1)}
              className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              1
            </Link>
            {startPage > 2 && <span className="text-gray-400 px-2">...</span>}
          </>
        )}

        {pages.map(page => (
          <Link
            key={page}
            href={createPageUrl(page)}
            className={`px-3 py-2 border rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </Link>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-400 px-2">...</span>}
            <Link
              href={createPageUrl(totalPages)}
              className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {/* Next */}
      {hasNext ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Sonraki
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-4 py-2 text-gray-400 bg-gray-50 border border-gray-200 rounded-lg cursor-not-allowed">
          Sonraki
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
};

// Main Component
export default function UltraProfessionalArticlesPage({ searchParams = {} }) {
  const router = useRouter();
  
  // State
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('latest');

  // URL Parameters
  const category = searchParams.category;
  const page = parseInt(searchParams.page) || 1;
  const search = searchParams.search;

  // Current category for display
  const currentCategory = CATEGORIES.find(cat => cat.value === category);

  // Fetch articles
  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        sortBy
      });
      
      if (category) params.set('category', category);
      if (search) params.set('search', search);

      const response = await fetch(`/api/public/articles?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.articles || []);
        setPagination(data.pagination || null);
        setMeta(data.meta || null);
      } else {
        console.error('API Error:', data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [category, page, search, sortBy]);

  // Effects
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (category) params.set('category', category);
    router.push(`/makaleler?${params.toString()}`);
  };

  return (
    <>
      <ArticlesStructuredData articles={articles} category={category} search={search} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-16">
            <Breadcrumbs category={category} search={search} />
            
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                {currentCategory ? (
                  <span className="flex items-center justify-center gap-3">
                    <currentCategory.icon className="w-12 h-12" />
                    {currentCategory.label} Makaleleri
                  </span>
                ) : search ? (
                  <span>&quot;{search}&quot; Arama Sonuçları</span>
                ) : (
                  'Hukuk Makaleleri'
                )}
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                {currentCategory ? currentCategory.description : 
                 search ? `${search} ile ilgili makaleler ve rehberler` :
                 'Uzman avukatlarımızdan güncel hukuki makaleler, rehberler ve analizler'}
              </p>
            </div>

            {/* Search & Filters */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Makale ara..."
                      className="w-full pl-12 pr-4 py-3 bg-white/90 border-0 rounded-xl focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all text-gray-900"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Ara
                    </button>
                  </div>
                </form>

                {/* View Mode & Sort */}
                <div className="flex items-center gap-3">
                  <div className="flex bg-white/20 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' ? 'bg-white/30 text-white' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' ? 'bg-white/30 text-white' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/90 border-0 rounded-xl px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="latest">En Yeni</option>
                    <option value="popular">En Popüler</option>
                    <option value="featured">Öne Çıkan</option>
                    <option value="alphabetical">A-Z</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/makaleler"
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  !category ? 'bg-white text-blue-600 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Tümü
              </Link>
              {CATEGORIES.slice(0, 6).map((cat) => (
                <Link
                  key={cat.value}
                  href={`/makaleler?category=${cat.value}`}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    category === cat.value ? 'bg-white text-blue-600 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Articles */}
            <main className="lg:col-span-3">
              {loading ? (
                <div className="space-y-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : articles.length > 0 ? (
                <>
                  {/* Results Info */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {pagination?.totalCount || 0} makale bulundu
                      </h2>
                      <p className="text-gray-600">
                        Sayfa {pagination?.currentPage || 1} / {pagination?.totalPages || 1}
                      </p>
                    </div>
                  </div>

                  {/* Articles Grid/List */}
                  <div className={
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
                      : "space-y-6 mb-12"
                  }>
                    {articles.map((article, index) => (
                      <ArticleCard 
                        key={article.slug} 
                        article={article} 
                        featured={index === 0 && !search && !category && page === 1 && viewMode === 'grid'}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      hasNext={pagination.hasNextPage}
                      hasPrev={pagination.hasPrevPage}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Makale Bulunamadı</h2>
                  <p className="text-gray-600 mb-8">
                    {search ? `"${search}" ile ilgili makale bulunamadı.` :
                     category ? `${currentCategory?.label} kategorisinde henüz makale yok.` :
                     'Henüz yayınlanmış makale bulunmamaktadır.'}
                  </p>
                  <Link
                    href="/makaleler"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tüm Makaleleri Gör
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </main>

            {/* Sidebar */}
            <Sidebar 
              featured={meta?.featured} 
              popular={meta?.popular} 
              categories={meta?.categories}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </>
  );
}