'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Edit2, 
  Trash2, 
  FileText,
  User,
  Clock,
  Star,
  MoreVertical,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Archive,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt-desc');
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  
  const router = useRouter();

  // Makale durumu badge'ı
  const getStatusBadge = (status) => {
    const badges = {
      'draft': { 
        label: 'Taslak', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Edit2
      },
      'published': { 
        label: 'Yayında', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      },
      'archived': { 
        label: 'Arşiv', 
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Archive
      },
      'scheduled': { 
        label: 'Zamanlanmış', 
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Clock
      }
    };
    return badges[status] || badges['draft'];
  };

  // Kategori isimlerini almak için
  const getCategoryName = (category) => {
    const categoryMap = {
      'aile-hukuku': 'Aile Hukuku',
      'ceza-hukuku': 'Ceza Hukuku',
      'is-hukuku': 'İş Hukuku',
      'ticaret-hukuku': 'Ticaret Hukuku',
      'idare-hukuku': 'İdare Hukuku',
      'icra-hukuku': 'İcra Hukuku',
      'gayrimenkul-hukuku': 'Gayrimenkul Hukuku',
      'miras-hukuku': 'Miras Hukuku',
      'kvkk': 'KVKK',
      'sigorta-hukuku': 'Sigorta Hukuku',
      'genel': 'Genel'
    };
    return categoryMap[category] || 'Genel';
  };

  // View count formatı
  const formatViewCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count?.toString() || '0';
  };

  // Makaleleri getir
  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const [sortField, sortOrder] = sortBy.split('-');
      params.append('sortBy', sortField);
      params.append('sortOrder', sortOrder);

      console.log('Fetching articles with params:', params.toString());

      const response = await fetch(`/api/admin/articles?${params}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error(`API hatası: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        setArticles(data.articles || []);
        setPagination(data.pagination || null);
        setStats(data.stats || {});
        console.log(`Loaded ${data.articles?.length || 0} articles`);
      } else {
        throw new Error(data.message || 'Bilinmeyen API hatası');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Makale sil
  const handleDeleteArticle = async (articleId, articleTitle) => {
    if (!confirm(`"${articleTitle}" başlıklı makaleyi silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        console.log('Makale başarıyla silindi');
        fetchArticles(); // Listeyi yenile
      } else {
        console.error('Delete error:', data.message);
        alert('Silme işlemi başarısız: ' + data.message);
      }
    } catch (error) {
      console.error('Delete request error:', error);
      alert('Silme işlemi sırasında hata oluştu');
    }
  };

  // İlk yükleme
  useEffect(() => {
    fetchArticles();
  }, [currentPage, selectedCategory, selectedStatus, sortBy]);

  // Arama debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
      if (searchTerm !== '') {
        fetchArticles();
      } else {
        fetchArticles();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]); // fetchArticles'ı dependency'den çıkardık çünkü searchTerm değiştiğinde çağrılıyor

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Hata Oluştu</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchArticles}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Makale Yönetimi</h1>
            <p className="text-gray-600 mt-2">
              {pagination?.totalCount || 0} makale • {stats.published?.count || 0} yayında • {stats.draft?.count || 0} taslak
            </p>
          </div>
          
          <Link
            href="/admin/articles/create"
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Yeni Makale
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Object.entries(stats).map(([status, data]) => {
            const badge = getStatusBadge(status);
            const IconComponent = badge.icon;
            
            return (
              <div key={status} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{badge.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{data.count || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {data.totalViews || 0} toplam görüntüleme
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${badge.color.replace('text-', 'bg-').replace('bg-', 'bg-opacity-20 bg-')}`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Arama */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Makale ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Kategori */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="all">Tüm Kategoriler</option>
            <option value="aile-hukuku">Aile Hukuku</option>
            <option value="ceza-hukuku">Ceza Hukuku</option>
            <option value="is-hukuku">İş Hukuku</option>
            <option value="ticaret-hukuku">Ticaret Hukuku</option>
            <option value="idare-hukuku">İdare Hukuku</option>
            <option value="icra-hukuku">İcra Hukuku</option>
            <option value="gayrimenkul-hukuku">Gayrimenkul Hukuku</option>
            <option value="miras-hukuku">Miras Hukuku</option>
            <option value="kvkk">KVKK</option>
            <option value="sigorta-hukuku">Sigorta Hukuku</option>
            <option value="genel">Genel</option>
          </select>

          {/* Durum */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
            <option value="archived">Arşiv</option>
            <option value="scheduled">Zamanlanmış</option>
          </select>

          {/* Sıralama */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          >
            <option value="updatedAt-desc">Son Güncelleme (Yeni → Eski)</option>
            <option value="updatedAt-asc">Son Güncelleme (Eski → Yeni)</option>
            <option value="publishedAt-desc">Yayın Tarihi (Yeni → Eski)</option>
            <option value="publishedAt-asc">Yayın Tarihi (Eski → Yeni)</option>
            <option value="viewCount-desc">Görüntülenme (Çok → Az)</option>
            <option value="viewCount-asc">Görüntülenme (Az → Çok)</option>
            <option value="seoScore-desc">SEO Skoru (Yüksek → Düşük)</option>
            <option value="seoScore-asc">SEO Skoru (Düşük → Yüksek)</option>
            <option value="title-asc">Başlık (A → Z)</option>
            <option value="title-desc">Başlık (Z → A)</option>
          </select>
        </div>

        {/* Sonuç sayısı */}
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-medium text-gray-900">{articles.length}</span> makale gösteriliyor
          {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <span> (toplam {pagination?.totalCount || 0} makale arasından filtrelendi)</span>
          )}
        </div>
      </div>

      {/* Makale Listesi */}
      <div className="space-y-4">
        {articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Makale bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' 
                ? 'Arama kriterlerinizi değiştirin veya yeni bir makale oluşturun.'
                : 'Henüz makale bulunmamaktadır. İlk makaleyi oluşturun.'
              }
            </p>
            <Link
              href="/admin/articles/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              İlk Makaleyi Yaz
            </Link>
          </div>
        ) : (
          articles.map((article) => {
            const statusBadge = getStatusBadge(article.status);
            const StatusIcon = statusBadge.icon;
            
            return (
              <div key={article._id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Makale Bilgileri */}
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-3 mb-3">
                        {/* Durum Badge */}
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                        
                        {/* Kategori */}
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          {getCategoryName(article.category)}
                        </span>

                        {/* Featured Badge */}
                        {article.isFeatured && (
                          <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Öne Çıkan
                          </span>
                        )}
                      </div>

                      {/* Başlık */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                        <Link href={`/admin/articles/${article._id}/edit`}>
                          {article.title}
                        </Link>
                      </h3>

                      {/* Özet */}
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>

                      {/* Meta Bilgiler */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span className="text-gray-700">{article.authorName || 'Bilinmiyor'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-gray-700">
                            {article.publishedAt 
                              ? new Date(article.publishedAt).toLocaleDateString('tr-TR')
                              : new Date(article.createdAt).toLocaleDateString('tr-TR')
                            }
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span className="text-gray-700">{formatViewCount(article.viewCount)} görüntüleme</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="text-gray-700">{Math.ceil((article.wordCount || 0) / 200)} dk okuma</span>
                        </span>
                      </div>

                      {/* SEO Bilgileri */}
                      {(article.seoScore || article.readabilityScore) && (
                        <div className="flex items-center gap-4 mt-3">
                          {article.seoScore && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">SEO:</span>
                              <div className={`w-16 h-2 rounded-full ${
                                article.seoScore >= 80 ? 'bg-green-200' : 
                                article.seoScore >= 60 ? 'bg-yellow-200' : 'bg-red-200'
                              }`}>
                                <div 
                                  className={`h-full rounded-full ${
                                    article.seoScore >= 80 ? 'bg-green-500' : 
                                    article.seoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${article.seoScore}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-700">{article.seoScore}%</span>
                            </div>
                          )}
                          
                          {article.readabilityScore && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">Okunabilirlik:</span>
                              <div className={`w-16 h-2 rounded-full ${
                                article.readabilityScore >= 80 ? 'bg-green-200' : 
                                article.readabilityScore >= 60 ? 'bg-yellow-200' : 'bg-red-200'
                              }`}>
                                <div 
                                  className={`h-full rounded-full ${
                                    article.readabilityScore >= 80 ? 'bg-green-500' : 
                                    article.readabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${article.readabilityScore}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-700">{article.readabilityScore}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Görüntüle */}
                      {article.status === 'published' && (
                        <Link
                          href={`/makaleler/${article.slug}`}
                          target="_blank"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Görüntüle"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                      )}

                      {/* Düzenle */}
                      <Link
                        href={`/admin/articles/${article._id}/edit`}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Link>

                      {/* Sil */}
                      <button
                        onClick={() => handleDeleteArticle(article._id, article.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center gap-2">
            {/* Önceki */}
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={!pagination.hasPrevPage}
              className={`px-4 py-2 rounded-lg transition-colors ${
                pagination.hasPrevPage
                  ? 'text-blue-600 border border-blue-600 hover:bg-blue-50'
                  : 'text-gray-400 border border-gray-300 cursor-not-allowed'
              }`}
            >
              Önceki
            </button>

            {/* Sayfa numaraları */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum <= pagination.totalPages) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        pageNum === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            {/* Sonraki */}
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={!pagination.hasNextPage}
              className={`px-4 py-2 rounded-lg transition-colors ${
                pagination.hasNextPage
                  ? 'text-blue-600 border border-blue-600 hover:bg-blue-50'
                  : 'text-gray-400 border border-gray-300 cursor-not-allowed'
              }`}
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}