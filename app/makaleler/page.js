// app/makaleler/page.js - Complete Articles List Page (Server Component)
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Search, Filter, Grid3X3, List, Calendar, Eye, Clock, User, 
  BookOpen, Tag, TrendingUp, Star, ArrowRight, ChevronLeft, 
  ChevronRight, Home, FileText, Users, Award, Hash
} from 'lucide-react';

// ✅ Categories Configuration
const CATEGORIES = {
  'genel': { label: 'Genel Hukuk', icon: FileText, color: 'bg-gray-100 text-gray-800' },
  'aile-hukuku': { label: 'Aile Hukuku', icon: Users, color: 'bg-pink-100 text-pink-800' },
  'ceza-hukuku': { label: 'Ceza Hukuku', icon: Award, color: 'bg-red-100 text-red-800' },
  'is-hukuku': { label: 'İş Hukuku', icon: Users, color: 'bg-blue-100 text-blue-800' },
  'ticaret-hukuku': { label: 'Ticaret Hukuku', icon: TrendingUp, color: 'bg-green-100 text-green-800' },
  'idare-hukuku': { label: 'İdare Hukuku', icon: FileText, color: 'bg-purple-100 text-purple-800' },
  'icra-hukuku': { label: 'İcra Hukuku', icon: Award, color: 'bg-orange-100 text-orange-800' },
  'gayrimenkul-hukuku': { label: 'Gayrimenkul Hukuku', icon: Home, color: 'bg-yellow-100 text-yellow-800' },
  'miras-hukuku': { label: 'Miras Hukuku', icon: Users, color: 'bg-indigo-100 text-indigo-800' },
  'kvkk': { label: 'KVKK', icon: FileText, color: 'bg-cyan-100 text-cyan-800' },
  'sigorta-hukuku': { label: 'Sigorta Hukuku', icon: Award, color: 'bg-teal-100 text-teal-800' }
};

// ✅ Data Fetching Function
async function fetchArticles(searchParams) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Build query params
    const params = new URLSearchParams();
    params.set('page', searchParams.page || '1');
    params.set('limit', '12');
    
    if (searchParams.category && searchParams.category !== 'all') {
      params.set('category', searchParams.category);
    }
    if (searchParams.search) {
      params.set('search', searchParams.search);
    }
    if (searchParams.tag) {
      params.set('tag', searchParams.tag);
    }
    if (searchParams.sortBy) {
      params.set('sortBy', searchParams.sortBy);
    }

    const response = await fetch(`${baseUrl}/api/public/articles?${params.toString()}`, {
      next: { revalidate: 300 } // 5 minutes ISR
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success ? data : { articles: [], pagination: null, meta: null };
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return { articles: [], pagination: null, meta: null };
  }
}

// ✅ SEO Metadata
export async function generateMetadata({ searchParams }) {
  const category = searchParams.category;
  const search = searchParams.search;
  const currentCategory = CATEGORIES[category];
  
  let title = 'Hukuk Makaleleri';
  let description = 'Uzman avukatlarımızdan güncel hukuki makaleler, rehberler ve analizler.';
  
  if (currentCategory) {
    title = `${currentCategory.label} Makaleleri`;
    description = `${currentCategory.label} alanında uzman makaleler ve rehberler.`;
  } else if (search) {
    title = `"${search}" için Makale Arama Sonuçları`;
    description = `${search} konusunda hukuki makaleler ve bilgiler.`;
  }

  return {
    title: `${title} | Yılmaz Çolak Hukuk Bürosu`,
    description,
    keywords: [
      'hukuk makaleleri', 'avukat yazıları', 'hukuki rehberler',
      currentCategory?.label.toLowerCase(),
      search,
      'karabük avukat', 'yılmaz çolak hukuk'
    ].filter(Boolean).join(', '),
    
    openGraph: {
      title: `${title} | Yılmaz Çolak Hukuk Bürosu`,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/makaleler`,
      siteName: 'Yılmaz Çolak Hukuk Bürosu',
      type: 'website',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-articles.jpg`,
          width: 1200,
          height: 630,
          alt: 'Yılmaz Çolak Hukuk Bürosu - Hukuk Makaleleri'
        }
      ]
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
}

// ✅ Structured Data Component
const ArticlesStructuredData = ({ articles, category }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Yılmaz Çolak Hukuk Bürosu Blog",
    "description": "Hukuk alanında uzman makaleler ve güncel gelişmeler",
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
      "author": {
        "@type": "Person",
        "name": article.authorName || "Yılmaz Çolak"
      },
      "publisher": structuredData.publisher,
      "image": article.featuredImage || `${process.env.NEXT_PUBLIC_SITE_URL}/images/default-article.jpg`
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

// ✅ Search Bar Component
const SearchBar = ({ defaultValue, category }) => {
  return (
    <form action="/makaleler" method="GET" className="relative">
      {category && (
        <input type="hidden" name="category" value={category} />
      )}
      
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          name="search"
          defaultValue={defaultValue}
          placeholder="Makalelerde ara..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Ara
        </button>
      </div>
    </form>
  );
};

// ✅ Category Filter Component
const CategoryFilter = ({ currentCategory }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/makaleler"
        className={`px-4 py-2 rounded-lg transition-colors ${
          !currentCategory 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Tümü
      </Link>
      
      {Object.entries(CATEGORIES).map(([key, cat]) => {
        const CategoryIcon = cat.icon;
        return (
          <Link
            key={key}
            href={`/makaleler?category=${key}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentCategory === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CategoryIcon className="w-4 h-4" />
            {cat.label}
          </Link>
        );
      })}
    </div>
  );
};

// ✅ Article Card Component
const ArticleCard = ({ article, featured = false }) => {
  const currentCategory = CATEGORIES[article.category];
  const CategoryIcon = currentCategory?.icon || FileText;

  return (
    <article className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group ${
      featured ? 'md:col-span-2 lg:col-span-3' : ''
    }`}>
      <Link href={`/makaleler/${article.slug}`}>
        {/* Image */}
        {article.featuredImage && (
          <div className={`relative overflow-hidden ${featured ? 'h-64 md:h-80' : 'h-48'}`}>
            <Image
              src={article.featuredImage}
              alt={article.featuredImageAlt || article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${currentCategory?.color || 'bg-gray-100 text-gray-800'}`}>
                <CategoryIcon className="w-4 h-4" />
                {currentCategory?.label || 'Genel'}
              </span>
            </div>

            {/* Featured Badge */}
            {featured && (
              <div className="absolute top-4 right-4">
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Öne Çıkan
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`p-6 ${featured ? 'md:p-8' : ''}`}>
          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{article.authorName || 'Yılmaz Çolak'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{article.readingTime || 5} dk</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{formatViewCount(article.viewCount || 0)}</span>
            </div>
          </div>

          {/* Title */}
          <h2 className={`font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors ${
            featured ? 'text-2xl md:text-3xl' : 'text-xl'
          }`}>
            {article.title}
          </h2>

          {/* Excerpt */}
          {article.excerpt && (
            <p className={`text-gray-600 mb-4 line-clamp-3 ${featured ? 'text-lg' : ''}`}>
              {article.excerpt}
            </p>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag}
                  href={`/makaleler?tag=${encodeURIComponent(tag)}`}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  #{tag}
                </Link>
              ))}
              {article.tags.length > 3 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                  +{article.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Read More */}
          <div className="flex items-center justify-between">
            <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
              Devamını Oku
            </span>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
          </div>
        </div>
      </Link>
    </article>
  );
};

// ✅ Sidebar Component
const Sidebar = ({ meta, searchParams }) => {
  return (
    <aside className="space-y-8">
      {/* Featured Articles */}
      {meta?.featured && meta.featured.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Öne Çıkan Makaleler
          </h3>
          <div className="space-y-4">
            {meta.featured.slice(0, 3).map((article) => (
              <article key={article.slug}>
                <Link href={`/makaleler/${article.slug}`} className="group block">
                  <h4 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h4>
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
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Popular Articles */}
      {meta?.popular && meta.popular.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            Popüler Makaleler
          </h3>
          <div className="space-y-4">
            {meta.popular.slice(0, 5).map((article, index) => (
              <article key={article.slug} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <Link href={`/makaleler/${article.slug}`} className="group">
                    <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatViewCount(article.viewCount || 0)}
                      </span>
                    </div>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {meta?.categories && meta.categories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5 text-purple-500" />
            Kategoriler
          </h3>
          <div className="space-y-2">
            {meta.categories.map((category) => {
              const categoryConfig = CATEGORIES[category.slug];
              const CategoryIcon = categoryConfig?.icon || FileText;
              
              return (
                <Link
                  key={category.slug}
                  href={`/makaleler?category=${category.slug}`}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors group ${
                    searchParams.category === category.slug 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CategoryIcon className="w-4 h-4 text-gray-500" />
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
};

// ✅ Pagination Component
const Pagination = ({ pagination, searchParams }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;
  
  // Build base URL with current filters
  const buildUrl = (page) => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page.toString());
    if (searchParams.category) params.set('category', searchParams.category);
    if (searchParams.search) params.set('search', searchParams.search);
    if (searchParams.tag) params.set('tag', searchParams.tag);
    if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);
    
    return `/makaleler${params.toString() ? '?' + params.toString() : ''}`;
  };

  // Calculate page numbers to show
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
    <nav className="flex items-center justify-center space-x-2 mt-12" aria-label="Sayfalama">
      {/* Previous */}
      {hasPrevPage ? (
        <Link
          href={buildUrl(currentPage - 1)}
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
              href={buildUrl(1)}
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
            href={buildUrl(page)}
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
              href={buildUrl(totalPages)}
              className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {totalPages}
            </Link>
          </>
        )}
      </div>

      {/* Next */}
      {hasNextPage ? (
        <Link
          href={buildUrl(currentPage + 1)}
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

// ✅ Empty State Component
const EmptyState = ({ searchParams }) => {
  const currentCategory = CATEGORIES[searchParams.category];
  
  return (
    <div className="text-center py-16">
      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Makale Bulunamadı</h2>
      <p className="text-gray-600 mb-8">
        {searchParams.search ? `"${searchParams.search}" ile ilgili makale bulunamadı.` :
         searchParams.category ? `${currentCategory?.label} kategorisinde henüz makale yok.` :
         searchParams.tag ? `"${searchParams.tag}" etiketi ile makale bulunamadı.` :
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
  );
};

// ✅ Main Page Component
export default async function ArticlesPage({ searchParams = {} }) {
  // Fetch articles data
  const { articles, pagination, meta } = await fetchArticles(searchParams);
  
  const currentCategory = CATEGORIES[searchParams.category];
  const pageTitle = currentCategory 
    ? `${currentCategory.label} Makaleleri` 
    : searchParams.search 
      ? `"${searchParams.search}" Arama Sonuçları`
      : 'Hukuk Makaleleri';

  return (
    <>
      <ArticlesStructuredData articles={articles} category={searchParams.category} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-blue-200 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">Makaleler</span>
              {currentCategory && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-white">{currentCategory.label}</span>
                </>
              )}
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  {pageTitle}
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl">
                  {currentCategory 
                    ? `${currentCategory.label} alanında uzman makaleler ve rehberler.`
                    : 'Hukuk alanında uzman makaleler, güncel gelişmeler ve rehberler.'}
                </p>
              </div>
              
              {/* Search */}
              <div className="lg:w-96">
                <SearchBar 
                  defaultValue={searchParams.search} 
                  category={searchParams.category}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            
            {/* Articles Content */}
            <main className="lg:col-span-3">
              {/* Filters */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                    {articles.length > 0 ? `${articles.length} Makale Bulundu` : 'Makaleler'}
                    {pagination && pagination.total && (
                      <span className="text-gray-500 text-sm font-normal">
                        ({pagination.total} toplam)
                      </span>
                    )}
                  </h2>

                  {/* Sort Options */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sırala:</span>
                    <div className="flex gap-1">
                      <Link
                        href={{
                          pathname: '/makaleler',
                          query: { ...searchParams, sortBy: 'publishedAt' }
                        }}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                          (!searchParams.sortBy || searchParams.sortBy === 'publishedAt')
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        En Yeni
                      </Link>
                      <Link
                        href={{
                          pathname: '/makaleler',
                          query: { ...searchParams, sortBy: 'viewCount' }
                        }}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                          searchParams.sortBy === 'viewCount'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        En Popüler
                      </Link>
                      <Link
                        href={{
                          pathname: '/makaleler',
                          query: { ...searchParams, sortBy: 'title' }
                        }}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                          searchParams.sortBy === 'title'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        A-Z
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Category Filter */}
                <CategoryFilter currentCategory={searchParams.category} />
              </div>

              {/* Articles Grid */}
              {articles.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                    {articles.map((article, index) => (
                      <ArticleCard 
                        key={article.slug} 
                        article={article} 
                        featured={index === 0 && !searchParams.search && !searchParams.category && (!searchParams.page || searchParams.page === '1')}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination pagination={pagination} searchParams={searchParams} />
                </>
              ) : (
                <EmptyState searchParams={searchParams} />
              )}
            </main>

            {/* Sidebar */}
            <Sidebar meta={meta} searchParams={searchParams} />
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