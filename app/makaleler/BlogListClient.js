'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  User, 
  ArrowRight, 
  Filter,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
  Share2,
  BookOpen,
  Tag,
  Hash
} from 'lucide-react';

// Helper Functions
function getCategoryName(category) {
  const categoryMap = {
    'aile-hukuku': 'Aile Hukuku',
    'ceza-hukuku': 'Ceza Hukuku',
    'is-hukuku': 'İş Hukuku',
    'ticaret-hukuku': 'Ticaret Hukuku',
    'idare-hukuku': 'İdare Hukuku',
    'gayrimenkul-hukuku': 'Gayrimenkul Hukuku',
    'miras-hukuku': 'Miras Hukuku',
    'icra-hukuku': 'İcra Hukuku',
    'kvkk': 'KVKK',
    'sigorta-hukuku': 'Sigorta Hukuku',
    'genel': 'Genel'
  };
  return categoryMap[category] || 'Genel';
}

function formatViewCount(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count?.toString() || '0';
}

// JSON-LD Structured Data Component
const BlogStructuredData = ({ articles, totalCount, currentPage }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Yılmaz Çolak Hukuk Bürosu Blog",
    "description": "Hukuk alanında uzman makaleler ve rehberler",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler`,
    "publisher": {
      "@type": "Organization",
      "name": "Yılmaz Çolak Hukuk Bürosu",
      "url": process.env.NEXT_PUBLIC_SITE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`
      }
    },
    "blogPost": articles.slice(0, 10).map(article => ({
      "@type": "BlogPosting",
      "headline": article.title,
      "description": article.excerpt,
      "url": `${process.env.NEXT_PUBLIC_SITE_URL}${article.url}`,
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt || article.publishedAt,
      "author": {
        "@type": "Person",
        "name": article.authorName
      },
      "publisher": {
        "@type": "Organization",
        "name": "Yılmaz Çolak Hukuk Bürosu"
      },
      "image": article.featuredImage ? `${process.env.NEXT_PUBLIC_SITE_URL}${article.featuredImage}` : undefined,
      "wordCount": article.wordCount,
      "timeRequired": `PT${article.readingTime || 5}M`,
      "articleSection": article.categoryName,
      "keywords": article.tags?.join(', ')
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

// Breadcrumbs Component
const Breadcrumbs = ({ category, search }) => {
  const breadcrumbStructuredData = {
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

  if (category) {
    breadcrumbStructuredData.itemListElement.push({
      "@type": "ListItem",
      "position": 3,
      "name": getCategoryName(category),
      "item": `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler?category=${category}`
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-blue-600 transition-colors">Ana Sayfa</Link>
        <span>/</span>
        <Link href="/makaleler" className="hover:text-blue-600 transition-colors">Makaleler</Link>
        {category && (
          <>
            <span>/</span>
            <span className="text-gray-900 font-medium">{getCategoryName(category)}</span>
          </>
        )}
        {search && (
          <>
            <span>/</span>
<span className="text-gray-900 font-medium">{`'${search}' araması`}</span>
          </>
        )}
      </nav>
    </>
  );
};

// Article Card Component
const ArticleCard = ({ article, featured = false }) => {
  const cardClass = featured 
    ? "group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
    : "group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100";

  return (
    <article className={cardClass}>
      {/* Featured Image */}
      {article.featuredImage && (
        <div className="relative overflow-hidden rounded-t-xl">
          <Image
            src={article.featuredImage}
            alt={article.title}
            width={featured ? 600 : 400}
            height={featured ? 300 : 200}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {article.isFeatured && (
            <div className="absolute top-4 left-4">
              <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <Star className="w-4 h-4" />
                Öne Çıkan
              </span>
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Category Badge */}
        <div className="mb-3">
          <Link
            href={`/makaleler?category=${article.category}`}
            className="inline-block bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold transition-colors"
          >
            {article.categoryName}
          </Link>
        </div>

        {/* Title */}
        <h2 className={featured ? "text-2xl font-bold text-gray-900 mb-3 line-clamp-2" : "text-xl font-bold text-gray-900 mb-3 line-clamp-2"}>
          <Link
            href={article.url}
            className="hover:text-blue-600 transition-colors"
          >
            {article.title}
          </Link>
        </h2>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {article.excerpt}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {article.authorName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {article.formattedDate}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {article.readingTime || article.estimatedReadTime} dk
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatViewCount(article.viewCount)}
            </span>
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Read More Button */}
        <Link
          href={article.url}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold group-hover:gap-3 transition-all"
        >
          Devamını Oku
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
};

// Sidebar Component
const Sidebar = ({ featured, popular, categories }) => (
  <aside className="space-y-8">
    {/* Featured Articles */}
    {featured && featured.length > 0 && (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          Öne Çıkan Makaleler
        </h3>
        <div className="space-y-4">
          {featured.slice(0, 5).map((article, index) => (
            <article key={article.slug} className="group">
              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                <Link href={article.url}>
                  {article.title}
                </Link>
              </h4>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(article.publishedAt).toLocaleDateString('tr-TR')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatViewCount(article.viewCount)}
                </span>
              </div>
              {index < featured.length - 1 && <hr className="mt-4 border-gray-100" />}
            </article>
          ))}
        </div>
      </div>
    )}

    {/* Popular Articles */}
    {popular && popular.length > 0 && (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Popüler Makaleler
        </h3>
        <div className="space-y-4">
          {popular.slice(0, 5).map((article, index) => (
            <article key={article.slug} className="group flex items-start gap-3">
              <span className="bg-gray-100 text-gray-700 font-bold text-sm px-2 py-1 rounded">
                {index + 1}
              </span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  <Link href={article.url}>
                    {article.title}
                  </Link>
                </h4>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatViewCount(article.viewCount)} görüntülenme
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    )}

    {/* Categories */}
    {categories && categories.length > 0 && (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Hash className="w-5 h-5 text-purple-500" />
          Kategoriler
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={category.url}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <span className="font-medium text-gray-700 group-hover:text-blue-600">
                {category.name}
              </span>
              <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                {category.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    )}
  </aside>
);

// Pagination Component
const Pagination = ({ currentPage, totalPages, hasNext, hasPrev, baseUrl }) => {
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
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Önceki
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-4 py-2 text-gray-400 border border-gray-300 rounded-lg cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          Önceki
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {startPage > 1 && (
          <>
            <Link
              href={`${baseUrl}?page=1`}
              className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              1
            </Link>
            {startPage > 2 && <span className="text-gray-400">...</span>}
          </>
        )}

        {pages.map(page => (
          <Link
            key={page}
            href={`${baseUrl}?page=${page}`}
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
            {endPage < totalPages - 1 && <span className="text-gray-400">...</span>}
            <Link
              href={`${baseUrl}?page=${totalPages}`}
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
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Sonraki
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-2 px-4 py-2 text-gray-400 border border-gray-300 rounded-lg cursor-not-allowed">
          Sonraki
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  );
};

// Main Client Component
export default function BlogListClient({ searchParams }) {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams?.search || '');
  
  const category = searchParams?.category;
  const page = parseInt(searchParams?.page) || 1;
  const search = searchParams?.search;

  useEffect(() => {
    fetchArticles();
  }, [category, page, search]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      
      if (category) params.set('category', category);
      if (search) params.set('search', search);

      const response = await fetch(`/api/public/articles?${params}`);
      const data = await response.json();

      if (data.success) {
        setArticles(data.articles);
        setPagination(data.pagination);
        setMeta(data.meta);
      }
    } catch (error) {
      console.error('Articles fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      if (searchTerm) {
        url.searchParams.set('search', searchTerm);
      } else {
        url.searchParams.delete('search');
      }
      url.searchParams.delete('page');
      window.history.pushState({}, '', url);
      fetchArticles();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Makaleler Yükleniyor...</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <BlogStructuredData articles={articles} totalCount={pagination?.totalCount} currentPage={pagination?.currentPage} />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs category={category} search={search} />

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {category ? `${getCategoryName(category)} Makaleleri` : 
search ? `${search} Arama Sonuçları` :
               'Hukuk Makaleleri'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {category ? `${getCategoryName(category)} konusunda uzman avukatlarımızdan güncel makaleler ve rehberler` :
search ? `${search} konusuyla ilgili ${pagination?.totalCount || 0} makale bulundu` :

               'Hukuk alanında uzman makaleler ve rehberlerle bilginizi artırın'}
            </p>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-12">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Makale başlığı veya içerik arayın..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ara
              </button>
            </div>

            {/* Quick Category Filters */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/makaleler"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tümü
              </Link>
              {meta?.categories?.slice(0, 6).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/makaleler?category=${cat.slug}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === cat.slug ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name} ({cat.count})
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <main className="lg:col-span-3">
              {articles.length > 0 ? (
                <>
                  {/* Results Info */}
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {pagination?.showing} / {pagination?.totalCount} makale gösteriliyor
                    </h2>
                  </div>

                  {/* Articles Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {articles.map((article, index) => (
                      <ArticleCard 
                        key={article.slug} 
                        article={article} 
                        featured={index === 0 && !search && !category && page === 1}
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
                      baseUrl="/makaleler"
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Makale Bulunamadı</h2>
                  <p className="text-gray-600 mb-8">
{search ? `${search} ile ilgili makale bulunamadı.` :
                     category ? `${getCategoryName(category)} kategorisinde henüz makale yok.` :
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
            />
          </div>
        </div>
      </div>
    </>
  );
}