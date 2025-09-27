// app/admin/articles/[id]/edit/page.js - GÖRSEL ENTEGRASYON FİXED!
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Save, Send, Eye, Clock, Calendar, Tag, Image as ImageIcon,
  FileText, Settings, Zap, ArrowLeft, CheckCircle, AlertTriangle,
  Info, Globe, Hash, Type, X, Upload, Loader2, Trash2, Archive
} from 'lucide-react';

import UltraProfessionalEditor from '@/components/admin/articles/UltraProfessionalEditor';
import ImageUploadModal from '@/components/admin/ImageUploadModal';

const UltraProfessionalArticleEdit = () => {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id;
  
  // ✅ Core State
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [articleData, setArticleData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    keywords: [],
    tags: [],
    category: 'genel',
    status: 'draft',
    allowComments: true,
    scheduledAt: '',
    featuredImage: '',
    featuredImageAlt: '',
    template: 'standard'
  });

  // ✅ UI State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalType, setImageModalType] = useState('content');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // ✅ Refs
  const editorRef = useRef(null);
  const originalDataRef = useRef(null);

  // ✅ Categories
  const categories = [
    { value: 'genel', label: 'Genel', color: 'bg-gray-100 text-gray-800' },
    { value: 'aile-hukuku', label: 'Aile Hukuku', color: 'bg-pink-100 text-pink-800' },
    { value: 'ceza-hukuku', label: 'Ceza Hukuku', color: 'bg-red-100 text-red-800' },
    { value: 'is-hukuku', label: 'İş Hukuku', color: 'bg-blue-100 text-blue-800' },
    { value: 'ticaret-hukuku', label: 'Ticaret Hukuku', color: 'bg-green-100 text-green-800' },
    { value: 'idare-hukuku', label: 'İdare Hukuku', color: 'bg-purple-100 text-purple-800' },
    { value: 'icra-hukuku', label: 'İcra Hukuku', color: 'bg-orange-100 text-orange-800' },
    { value: 'gayrimenkul-hukuku', label: 'Gayrimenkul Hukuku', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'miras-hukuku', label: 'Miras Hukuku', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'kvkk', label: 'KVKK', color: 'bg-cyan-100 text-cyan-800' }
  ];

  // ✅ Templates
  const templates = [
    { value: 'standard', label: 'Standart Makale', description: 'Genel makale formatı' },
    { value: 'legal-article', label: 'Hukuki Makale', description: 'Hukuki analiz ve değerlendirme' },
    { value: 'case-study', label: 'Vaka Analizi', description: 'Dava örnekleri ve sonuçları' },
    { value: 'legal-guide', label: 'Hukuk Rehberi', description: 'Adım adım hukuki süreç rehberi' },
    { value: 'news', label: 'Hukuk Haberi', description: 'Güncel hukuki gelişmeler' }
  ];

  // ✅ Load article data
  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/articles/${articleId}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const result = await response.json();
          if (result.article) {
            const article = result.article;
            
            // Normalize data
            const normalizedData = {
              title: article.title || '',
              slug: article.slug || '',
              excerpt: article.excerpt || '',
              content: article.content || '',
              metaTitle: article.metaTitle || article.title || '',
              metaDescription: article.metaDescription || article.excerpt || '',
              focusKeyword: article.focusKeyword || '',
              keywords: Array.isArray(article.keywords) ? article.keywords : [],
              tags: Array.isArray(article.tags) ? article.tags : [],
              category: article.category || 'genel',
              status: article.status || 'draft',
              allowComments: article.allowComments !== false,
              scheduledAt: article.scheduledAt || '',
              featuredImage: article.featuredImage || '',
              featuredImageAlt: article.featuredImageAlt || '',
              template: article.template || 'standard'
            };

            setArticle(article);
            setArticleData(normalizedData);
            originalDataRef.current = normalizedData;
            
            console.log('✅ Article loaded:', article.title);
          }
        } else if (response.status === 404) {
          setError('Makale bulunamadı');
          router.push('/admin/articles');
        } else {
          setError('Makale yüklenirken hata oluştu');
        }
      } catch (error) {
        console.error('Load article error:', error);
        setError('Sunucu hatası oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      loadArticle();
    }
  }, [articleId, router]);

  // ✅ Track changes
  useEffect(() => {
    if (originalDataRef.current) {
      const hasChanged = JSON.stringify(articleData) !== JSON.stringify(originalDataRef.current);
      setHasChanges(hasChanged);
    }
  }, [articleData]);

  // ✅ Input change handler
  const handleInputChange = useCallback((field, value) => {
    setArticleData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear errors on change
  }, []);

  // ✅ Content change handler
  const handleContentChange = useCallback((content) => {
    console.log('📝 Content changed in editor:', content.length, 'characters');
    setArticleData(prev => ({ ...prev, content }));
  }, []);

  // ✅ KRİTİK: Image selection handler
  const handleImageSelect = useCallback((imageUrl, altText = '') => {
    console.log('🖼️ Image selected:', { imageUrl, altText, type: imageModalType });
    
    if (imageModalType === 'featured') {
      // ✅ Featured image set et
      setArticleData(prev => ({
        ...prev, 
        featuredImage: imageUrl,
        featuredImageAlt: altText
      }));
      console.log('✅ Featured image updated:', imageUrl);
      
    } else if (imageModalType === 'content') {
      // ✅ Editöre görsel ekle
      if (editorRef.current && editorRef.current.insertImageToEditor) {
        editorRef.current.insertImageToEditor(imageUrl, altText);
        console.log('✅ Image inserted to editor:', imageUrl);
      } else {
        // Fallback
        const imgHtml = `
          <figure class="my-4 text-center">
            <img src="${imageUrl}" alt="${altText}" class="max-w-full h-auto rounded-lg shadow-sm mx-auto" style="max-width: 100%; height: auto;" />
            ${altText ? `<figcaption class="text-sm text-gray-600 mt-2">${altText}</figcaption>` : ''}
          </figure>
        `;
        
        setArticleData(prev => ({
          ...prev,
          content: prev.content + imgHtml
        }));
        console.log('✅ Image added to content (fallback)');
      }
    }
    
    setIsImageModalOpen(false);
  }, [imageModalType]);

  // ✅ Image modal handlers
  const openImageModalForContent = useCallback(() => {
    setImageModalType('content');
    setIsImageModalOpen(true);
  }, []);

  const openImageModalForFeatured = useCallback(() => {
    setImageModalType('featured');
    setIsImageModalOpen(true);
  }, []);

  // ✅ Auto-save implementation - OPTIMIZED
  const autoSave = useCallback(async (data) => {
    if (!data.title.trim() || !hasChanges) return;
    
    try {
      const response = await fetch(`/api/admin/articles/${articleId}/auto-save`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt
        })
      });

      if (response.ok) {
        setLastSaved(new Date());
        console.log('💾 Auto-saved successfully');
      }
    } catch (error) {
      console.log('Auto-save failed (non-critical):', error);
    }
  }, [articleId, hasChanges]);

  // ✅ Auto-save effect - Every 30 seconds
  useEffect(() => {
    if (!loading && hasChanges) {
      const timer = setTimeout(() => {
        autoSave(articleData);
      }, 30000); // 30 seconds

      return () => clearTimeout(timer);
    }
  }, [articleData, autoSave, loading, hasChanges]);

  // ✅ Save handlers
  const handleSave = useCallback(async (status = null) => {
    setIsSaving(true);
    setError('');
    
    try {
      const dataToSave = {
        ...articleData,
        status: status || articleData.status,
        keywords: typeof articleData.keywords === 'string' 
          ? articleData.keywords.split(',').map(k => k.trim()).filter(Boolean)
          : articleData.keywords,
        tags: typeof articleData.tags === 'string'
          ? articleData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : articleData.tags
      };

      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSave)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(status === 'published' ? 'Makale başarıyla yayınlandı!' : 'Makale başarıyla güncellendi!');
        setLastSaved(new Date());
        setHasChanges(false);
        originalDataRef.current = { ...dataToSave };
        
        // Update article state
        if (result.article) {
          setArticle(result.article);
        }
      } else {
        setError(result.message || 'Güncelleme hatası oluştu');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Sunucu hatası oluştu');
    } finally {
      setIsSaving(false);
    }
  }, [articleData, articleId]);

  const handlePublish = useCallback(() => {
    setIsPublishing(true);
    handleSave('published').finally(() => setIsPublishing(false));
  }, [handleSave]);

  const handleUnpublish = useCallback(() => {
    handleSave('draft');
  }, [handleSave]);

  // ✅ Delete handler
  const handleDelete = useCallback(async () => {
    if (!confirm('Bu makaleyi kalıcı olarak silmek istediğinizden emin misiniz?')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        router.push('/admin/articles?deleted=true');
      } else {
        const result = await response.json();
        setError(result.message || 'Silme hatası oluştu');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Sunucu hatası oluştu');
    } finally {
      setIsDeleting(false);
    }
  }, [articleId, router]);

  // ✅ Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // ✅ Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Makale yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Makale Bulunamadı</h2>
          <p className="text-gray-600 mb-4">Aradığınız makale bulunamadı veya erişim yetkiniz yok.</p>
          <button
            onClick={() => router.push('/admin/articles')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Makalelere Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Left - Back & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (hasChanges && !confirm('Kaydedilmemiş değişiklikler var. Çıkmak istediğinizden emin misiniz?')) {
                    return;
                  }
                  router.push('/admin/articles');
                }}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {articleData.title || 'Makale Düzenle'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Durum: 
                    <span className={`ml-1 ${
                      article.status === 'published' ? 'text-green-600' : 
                      article.status === 'scheduled' ? 'text-blue-600' : 'text-yellow-600'
                    }`}>
                      {article.status === 'published' ? 'Yayında' : 
                       article.status === 'scheduled' ? 'Zamanlanmış' : 'Taslak'}
                    </span>
                  </span>
                  {lastSaved && (
                    <span>Son kayıt: {lastSaved.toLocaleTimeString('tr-TR')}</span>
                  )}
                  {hasChanges && (
                    <span className="text-orange-600">• Kaydedilmemiş değişiklikler</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              
              {/* Preview Button */}
              {article.status === 'published' && (
                <a
                  href={`/makaleler/${articleData.slug}`}
                  target="_blank"
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Önizle
                </a>
              )}

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Siliniyor...' : 'Sil'}
              </button>

              {/* Save Button */}
              <button
                onClick={() => handleSave()}
                disabled={isSaving || !hasChanges}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>

              {/* Publish/Unpublish Button */}
              {article.status === 'published' ? (
                <button
                  onClick={handleUnpublish}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  Yayından Kaldır
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || !articleData.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {isPublishing ? 'Yayınlanıyor...' : 'Yayınla'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-red-100 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-green-100 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-600 hover:text-green-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT - SAME AS CREATE PAGE */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="space-y-4">
                
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Makale Başlığı *
                  </label>
                  <input
                    type="text"
                    value={articleData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Makale başlığınızı yazın..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      /makaleler/
                    </span>
                    <input
                      type="text"
                      value={articleData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="makale-url-slug"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Makale Özeti
                  </label>
                  <textarea
                    value={articleData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="Makale özetini yazın..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {articleData.excerpt.length}/300 karakter
                  </p>
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Type className="w-5 h-5 text-blue-600" />
                  İçerik Editörü
                </h3>
              </div>
              
              {/* ✅ UltraProfessionalEditor with Image Integration */}
              <UltraProfessionalEditor
                ref={editorRef}
                content={articleData.content}
                onChange={handleContentChange}
                onImageInsert={openImageModalForContent}
                placeholder="Makale içeriğinizi buraya yazın..."
                autoSave={true}
                className="min-h-[500px]"
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Settings & Meta (SAME AS CREATE) */}
          <div className="space-y-6">
            
            {/* Publishing Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Ayarlar
              </h3>
              
              <div className="space-y-4">
                
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={articleData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Template */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şablon
                  </label>
                  <select
                    value={articleData.template}
                    onChange={(e) => handleInputChange('template', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {templates.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comments */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowComments"
                    checked={articleData.allowComments}
                    onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="allowComments" className="ml-2 text-sm text-gray-700">
                    Yorumlara izin ver
                  </label>
                </div>
              </div>
            </div>

            {/* Featured Image - SAME AS CREATE */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-600" />
                Öne Çıkan Görsel
              </h3>
              
              {articleData.featuredImage ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={articleData.featuredImage}
                      alt={articleData.featuredImageAlt || 'Öne çıkan görsel'}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => setArticleData(prev => ({ ...prev, featuredImage: '', featuredImageAlt: '' }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={articleData.featuredImageAlt}
                      onChange={(e) => handleInputChange('featuredImageAlt', e.target.value)}
                      placeholder="Görsel açıklaması..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={openImageModalForFeatured}
                  className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Öne Çıkan Görsel Seç</p>
                  <p className="text-sm text-gray-500">Tıklayarak görsel yükleyin</p>
                </button>
              )}
            </div>

            {/* SEO Settings - SAME AS CREATE */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                SEO Ayarları
              </h3>
              
              <div className="space-y-4">
                
                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Başlığı
                  </label>
                  <input
                    type="text"
                    value={articleData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    placeholder="SEO başlığı..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">{articleData.metaTitle.length}/60</p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Açıklama
                  </label>
                  <textarea
                    value={articleData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="SEO açıklaması..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">{articleData.metaDescription.length}/160</p>
                </div>

                {/* Focus Keyword */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Odak Kelimesi
                  </label>
                  <input
                    type="text"
                    value={articleData.focusKeyword}
                    onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
                    placeholder="ana anahtar kelime"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anahtar Kelimeler
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(articleData.keywords) ? articleData.keywords.join(', ') : ''}
                    onChange={(e) => handleInputChange('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
                    placeholder="kelime1, kelime2, kelime3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiketler
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(articleData.tags) ? articleData.tags.join(', ') : ''}
                    onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    placeholder="etiket1, etiket2, etiket3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ IMAGE UPLOAD MODAL */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageSelect={handleImageSelect}
        type="articles"
        allowMultiple={false}
      />
    </div>
  );
};

export default UltraProfessionalArticleEdit;