// app/admin/articles/create/page.js - GÖRSEL ENTEGRASYON FİXED!
'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, Send, Eye, Clock, Calendar, Tag, Image as ImageIcon,
  FileText, Settings, Zap, ArrowLeft, CheckCircle, AlertTriangle,
  Info, Globe, Hash, Type, X, Upload, Link, Loader2
} from 'lucide-react';

import UltraProfessionalEditor from '@/components/admin/articles/UltraProfessionalEditor';
import ImageUploadModal from '@/components/admin/ImageUploadModal';

const UltraProfessionalArticleCreate = () => {
  const router = useRouter();
  
  // ✅ Article data state
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

  // ✅ UI state
  const [activeTab, setActiveTab] = useState('content');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalType, setImageModalType] = useState('content'); // 'content' | 'featured'
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ✅ Refs
  const editorRef = useRef(null);

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

  // ✅ Input change handler - DEBOUNCED
  const handleInputChange = useCallback((field, value) => {
    setArticleData(prev => ({ ...prev, [field]: value }));
    
    // Auto generate slug from title
    if (field === 'title' && !articleData.slug) {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100);
      
      setArticleData(prev => ({ ...prev, slug }));
    }

    // Auto generate meta title if empty
    if (field === 'title' && !articleData.metaTitle) {
      setArticleData(prev => ({ ...prev, metaTitle: value }));
    }
  }, [articleData.slug, articleData.metaTitle]);

  // ✅ Content change handler - EDİTÖRDEN GELİYOR
  const handleContentChange = useCallback((content) => {
    console.log('📝 Content changed in editor:', content.length, 'characters');
    setArticleData(prev => ({ ...prev, content }));
  }, []);

  // ✅ KRİTİK: Image selection handler - EDİTÖRE EKLEME!
  const handleImageSelect = useCallback((imageUrl, altText = '') => {
    console.log('🖼️ Image selected:', { imageUrl, altText, type: imageModalType });
    
    if (imageModalType === 'featured') {
      // ✅ Featured image set et
      setArticleData(prev => ({
        ...prev, 
        featuredImage: imageUrl,
        featuredImageAlt: altText
      }));
      console.log('✅ Featured image set:', imageUrl);
      
    } else if (imageModalType === 'content') {
      // ✅ Editöre görsel ekle - UltraProfessionalEditor'ın insertContent metodunu kullan
      if (editorRef.current && editorRef.current.insertImageToEditor) {
        editorRef.current.insertImageToEditor(imageUrl, altText);
        console.log('✅ Image inserted to editor:', imageUrl);
      } else {
        // Fallback: Direct HTML insertion
        const imgHtml = `
          <figure class="my-4 text-center">
            <img src="${imageUrl}" alt="${altText}" class="max-w-full h-auto rounded-lg shadow-sm mx-auto" style="max-width: 100%; height: auto;" />
            ${altText ? `<figcaption class="text-sm text-gray-600 mt-2">${altText}</figcaption>` : ''}
          </figure>
        `;
        
        // Content'e ekle (fallback)
        setArticleData(prev => ({
          ...prev,
          content: prev.content + imgHtml
        }));
        console.log('✅ Image added to content (fallback)');
      }
    }
    
    // Modal'ı kapat
    setIsImageModalOpen(false);
  }, [imageModalType]);

  // ✅ Image modal açma handlers
  const openImageModalForContent = useCallback(() => {
    console.log('🔄 Opening image modal for content');
    setImageModalType('content');
    setIsImageModalOpen(true);
  }, []);

  const openImageModalForFeatured = useCallback(() => {
    console.log('🔄 Opening image modal for featured image');
    setImageModalType('featured');
    setIsImageModalOpen(true);
  }, []);

  // ✅ Keywords & Tags handling
  const handleKeywordAdd = useCallback((keyword) => {
    if (keyword && !articleData.keywords.includes(keyword)) {
      setArticleData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
    }
  }, [articleData.keywords]);

  const handleKeywordRemove = useCallback((keyword) => {
    setArticleData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  }, []);

  const handleTagAdd = useCallback((tag) => {
    if (tag && !articleData.tags.includes(tag)) {
      setArticleData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  }, [articleData.tags]);

  const handleTagRemove = useCallback((tag) => {
    setArticleData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  }, []);

  // ✅ Auto-save implementation
  const autoSave = useCallback(async (data) => {
    if (!data.title.trim()) return;
    
    try {
      const response = await fetch('/api/admin/articles/auto-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category
        })
      });

      if (response.ok) {
        const result = await response.json();
        setLastSaved(new Date());
        console.log('💾 Auto-saved successfully');
        
        // Eğer yeni oluşturulan article ise, edit sayfasına yönlendir
        if (result.redirectTo) {
          router.push(result.redirectTo);
        }
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [router]);

  // ✅ Save handlers
  const handleSave = useCallback(async (status = 'draft') => {
    setIsSaving(true);
    setError('');
    
    try {
      const dataToSave = {
        ...articleData,
        status,
        keywords: typeof articleData.keywords === 'string' 
          ? articleData.keywords.split(',').map(k => k.trim()).filter(Boolean)
          : articleData.keywords,
        tags: typeof articleData.tags === 'string'
          ? articleData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : articleData.tags
      };

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSave)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(status === 'published' ? 'Makale başarıyla yayınlandı!' : 'Makale başarıyla kaydedildi!');
        setLastSaved(new Date());
        
        // Edit sayfasına yönlendir
        if (result.article?._id) {
          router.push(`/admin/articles/${result.article._id}/edit`);
        }
      } else {
        setError(result.message || 'Kaydetme hatası oluştu');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Sunucu hatası oluştu');
    } finally {
      setIsSaving(false);
    }
  }, [articleData, router]);

  const handlePublish = useCallback(() => {
    setIsPublishing(true);
    handleSave('published').finally(() => setIsPublishing(false));
  }, [handleSave]);

  // ✅ Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSave('draft');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Left - Back & Title */}
            <div className="flex items-center gap-4">
              <Link
                href="/admin/articles"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">Yeni Makale</h1>
                {lastSaved && (
                  <p className="text-sm text-gray-500">
                    Son kayıt: {lastSaved.toLocaleTimeString('tr-TR')}
                  </p>
                )}
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {isSaving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing || !articleData.title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {isPublishing ? 'Yayınlanıyor...' : 'Yayınla'}
              </button>
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

      {/* MAIN CONTENT */}
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
                onImageInsert={openImageModalForContent} // ✅ KRİTİK: Image modal'ı aç
                placeholder="Makale içeriğinizi buraya yazın..."
                autoSave={true}
                className="min-h-[500px]"
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Settings & Meta */}
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

            {/* Featured Image */}
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
                  onClick={openImageModalForFeatured} // ✅ Featured image modal
                  className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Öne Çıkan Görsel Seç</p>
                  <p className="text-sm text-gray-500">Tıklayarak görsel yükleyin</p>
                </button>
              )}
            </div>

            {/* SEO Settings */}
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
        onImageSelect={handleImageSelect} // ✅ KRİTİK: Görsel seçim callback'i
        type="articles"
        allowMultiple={false}
      />
    </div>
  );
};

export default UltraProfessionalArticleCreate;