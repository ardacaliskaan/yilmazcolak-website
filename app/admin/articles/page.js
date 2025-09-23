'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  TrendingUp,
  BarChart3,
  Globe,
  CheckCircle,
  Clock,
  Archive,
  MoreVertical,
  Target,
  Zap,
  BookOpen,
  Star,
  ArrowUpDown
} from 'lucide-react';

// Mock data - gerçek uygulamada API'den gelecek
const mockArticles = [
  {
    id: 1,
    title: "Boşanma Davalarında Nafaka Hakları ve Hesaplama Yöntemleri",
    slug: "bosanma-davalarinda-nafaka-haklari",
    excerpt: "Boşanma sürecinde nafaka haklarının belirlenmesi, hesaplama kriterleri ve yasal düzenlemeler hakkında kapsamlı rehber.",
    category: "aile-hukuku",
    categoryName: "Aile Hukuku",
    authorName: "Av. Murat YILMAZ",
    status: "published",
    publishedAt: "2025-01-15T10:00:00Z",
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    readingTime: 8,
    viewCount: 1245,
    seoScore: 85,
    readabilityScore: 78,
    wordCount: 1650,
    isFeatured: true
  },
  {
    id: 2,
    title: "İş Kazası Tazminat Başvuru Süreci ve Gerekli Belgeler",
    slug: "is-kazasi-tazminat-basvuru-sureci",
    excerpt: "İş kazası sonrası tazminat hakkınızı nasıl kullanacağınız, başvuru süreci ve gerekli evraklar.",
    category: "is-hukuku",
    categoryName: "İş Hukuku",
    authorName: "Av. Hasan ÇOLAK",
    status: "draft",
    publishedAt: null,
    createdAt: "2025-01-20T14:00:00Z",
    updatedAt: "2025-01-22T16:30:00Z",
    readingTime: 12,
    viewCount: 0,
    seoScore: 67,
    readabilityScore: 82,
    wordCount: 2100,
    isFeatured: false
  },
  {
    id: 3,
    title: "Tapu İptali Davası Açma Koşulları ve Süreci",
    slug: "tapu-iptali-davasi-kosullari",
    excerpt: "Tapu kayıtlarının iptali için hangi koşullarda dava açılabileceği ve yasal süreç.",
    category: "gayrimenkul-hukuku",
    categoryName: "Gayrimenkul Hukuku",
    authorName: "Av. Murat YILMAZ",
    status: "published",
    publishedAt: "2025-01-18T11:30:00Z",
    createdAt: "2025-01-16T10:00:00Z",
    updatedAt: "2025-01-18T11:30:00Z",
    readingTime: 10,
    viewCount: 892,
    seoScore: 91,
    readabilityScore: 75,
    wordCount: 1890,
    isFeatured: false
  },
  {
    id: 4,
    title: "KVKK İhlali Cezaları ve Koruma Yöntemleri 2025",
    slug: "kvkk-ihlali-cezalari-koruma",
    excerpt: "Kişisel Verileri Koruma Kanunu ihlallerinde uygulanan cezalar ve korunma yolları.",
    category: "kvkk",
    categoryName: "KVKK",
    authorName: "Av. Zeynep ÜRÜŞAN",
    status: "scheduled",
    publishedAt: null,
    createdAt: "2024-12-15T14:00:00Z",
    updatedAt: "2024-12-20T09:00:00Z",
    scheduledAt: "2025-01-25T09:00:00Z",
    readingTime: 6,
    viewCount: 0,
    seoScore: 79,
    readabilityScore: 88,
    wordCount: 1200,
    isFeatured: true
  },
  {
    id: 5,
    title: "Ceza Davalarında Avukat Seçimi ve Süreç Yönetimi",
    slug: "ceza-davalarinda-avukat-secimi",
    excerpt: "Ceza davalarında doğru avukat seçimi, savunma stratejileri ve süreç boyunca dikkat edilecek hususlar.",
    category: "ceza-hukuku",
    categoryName: "Ceza Hukuku",
    authorName: "Av. Hasan ÇOLAK",
    status: "archived",
    publishedAt: "2024-11-20T09:00:00Z",
    createdAt: "2024-11-15T14:00:00Z",
    updatedAt: "2024-11-20T09:00:00Z",
    readingTime: 15,
    viewCount: 2341,
    seoScore: 88,
    readabilityScore: 72,
    wordCount: 2850,
    isFeatured: false
  }
];

const categories = [
  { value: 'all', label: 'Tüm Kategoriler', color: 'gray' },
  { value: 'aile-hukuku', label: 'Aile Hukuku', color: 'blue' },
  { value: 'ceza-hukuku', label: 'Ceza Hukuku', color: 'red' },
  { value: 'is-hukuku', label: 'İş Hukuku', color: 'green' },
  { value: 'ticaret-hukuku', label: 'Ticaret Hukuku', color: 'purple' },
  { value: 'gayrimenkul-hukuku', label: 'Gayrimenkul Hukuku', color: 'teal' },
  { value: 'kvkk', label: 'KVKK', color: 'cyan' }
];

const statusOptions = [
  { value: 'all', label: 'Tüm Durumlar', color: 'gray' },
  { value: 'draft', label: 'Taslak', color: 'yellow' },
  { value: 'published', label: 'Yayında', color: 'green' },
  { value: 'scheduled', label: 'Zamanlanmış', color: 'blue' },
  { value: 'archived', label: 'Arşiv', color: 'gray' }
];

const ArticlesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtrelenmiş ve sıralanmış makaleler
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = mockArticles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.authorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || article.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sıralama
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      // Tarih sıralaması için
      if (sortBy.includes('At')) {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder]);

  // İstatistikler
  const stats = useMemo(() => {
    return {
      total: mockArticles.length,
      published: mockArticles.filter(a => a.status === 'published').length,
      draft: mockArticles.filter(a => a.status === 'draft').length,
      scheduled: mockArticles.filter(a => a.status === 'scheduled').length,
      archived: mockArticles.filter(a => a.status === 'archived').length,
      totalViews: mockArticles.reduce((sum, article) => sum + article.viewCount, 0),
      avgSeoScore: Math.round(mockArticles.reduce((sum, article) => sum + article.seoScore, 0) / mockArticles.length),
      avgReadabilityScore: Math.round(mockArticles.reduce((sum, article) => sum + article.readabilityScore, 0) / mockArticles.length)
    };
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      'draft': { label: 'Taslak', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'published': { label: 'Yayında', color: 'bg-green-100 text-green-800 border-green-200' },
      'scheduled': { label: 'Zamanlanmış', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'archived': { label: 'Arşiv', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    return statusMap[status] || statusMap.draft;
  };

  const getScoreBadge = (score, type = 'seo') => {
    let colorClass = '';
    if (score >= 80) colorClass = 'bg-green-100 text-green-800 border-green-200';
    else if (score >= 60) colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    else colorClass = 'bg-red-100 text-red-800 border-red-200';
    
    return colorClass;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Henüz yok';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatViews = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              Makale Yönetimi
            </h1>
            <p className="text-gray-600 mt-2">
              SEO odaklı makalelerinizi oluşturun, düzenleyin ve yönetin
            </p>
          </div>
          
          <Link
            href="/admin/articles/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Yeni Makale Yaz
          </Link>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Makale</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-green-600">+{stats.published} yayında</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Görüntülenme</p>
              <p className="text-3xl font-bold text-gray-900">{formatViews(stats.totalViews)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-600">Ortalama {Math.round(stats.totalViews / stats.published)} / makale</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ortalama SEO Skoru</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgSeoScore}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className={`${stats.avgSeoScore >= 80 ? 'text-green-600' : stats.avgSeoScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {stats.avgSeoScore >= 80 ? 'Mükemmel' : stats.avgSeoScore >= 60 ? 'İyi' : 'Geliştirilmeli'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Okunabilirlik</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgReadabilityScore}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <span className="text-gray-600">Ortalama okuma kolaylığı</span>
          </div>
        </div>
      </div>

      {/* Durum Özet Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { status: 'published', count: stats.published, icon: CheckCircle, color: 'green' },
          { status: 'draft', count: stats.draft, icon: Clock, color: 'yellow' },
          { status: 'scheduled', count: stats.scheduled, icon: Calendar, color: 'blue' },
          { status: 'archived', count: stats.archived, icon: Archive, color: 'gray' }
        ].map(({ status, count, icon: Icon, color }) => (
          <div 
            key={status}
            className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedStatus === status ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedStatus(selectedStatus === status ? 'all' : status)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{getStatusBadge(status).label}</p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              <div className={`w-8 h-8 bg-${color}-100 rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 text-${color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Arama */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Makale başlığı, içerik veya yazar adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Kategori Filtresi */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Durum Filtresi */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          {/* Sıralama */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <span className="font-medium">{filteredAndSortedArticles.length}</span> makale gösteriliyor
          {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <span> (toplam {mockArticles.length} makale arasından filtrelendi)</span>
          )}
        </div>
      </div>

      {/* Makale Listesi */}
      <div className="space-y-4">
        {filteredAndSortedArticles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Makale bulunamadı</h3>
            <p className="text-gray-600 mb-6">
              Arama kriterlerinizi değiştirin veya yeni bir makale oluşturun.
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
          filteredAndSortedArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Makale Bilgileri */}
                  <div className="flex-1 pr-6">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Durum Badge */}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(article.status).color}`}>
                        {getStatusBadge(article.status).label}
                      </span>
                      
                      {/* Kategori */}
                      <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {article.categoryName}
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
                      <Link href={`/admin/articles/${article.id}/edit`}>
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
                        {article.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.updatedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.readingTime} dk okuma
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {formatViews(article.viewCount)} görüntülenme
                      </span>
                    </div>
                  </div>

                  {/* Sağ Taraf - Skorlar ve İşlemler */}
                  <div className="flex flex-col items-end gap-4">
                    {/* Skorlar */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">SEO:</span>
                        <span className={`px-2 py-1 text-xs font-bold rounded border ${getScoreBadge(article.seoScore, 'seo')}`}>
                          {article.seoScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-600">Okunabilirlik:</span>
                        <span className={`px-2 py-1 text-xs font-bold rounded border ${getScoreBadge(article.readabilityScore, 'readability')}`}>
                          {article.readabilityScore}%
                        </span>
                      </div>
                    </div>

                    {/* İşlem Butonları */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/makaleler/${article.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Önizle"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Sil"
                        onClick={() => {
                          if (confirm('Bu makaleyi silmek istediğinize emin misiniz?')) {
                            // Silme işlemi
                            console.log('Delete article:', article.id);
                          }
                        }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ArticlesManagement;