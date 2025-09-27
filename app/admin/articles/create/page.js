
// app/admin/articles/create/page.js
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  Send, 
  Eye, 
  Clock, 
  Calendar,
  Tag,
  Image as ImageIcon,
  FileText,
  Settings,
  Zap,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  Globe,
  Hash,
  Type,
  Palette,
  X,
  Upload,
  Layout
} from 'lucide-react';

import UltraProfessionalEditor from '@/components/admin/articles/UltraProfessionalEditor';
import ImageUploadModal from '@/components/admin/ImageUploadModal';
import SEOAnalysisPanel from '@/components/admin/SEOAnalysisPanel';

const UltraProfessionalArticleCreate = () => {
  const router = useRouter();
  
  // Article data state
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

  // UI state
  const [activeTab, setActiveTab] = useState('content');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Categories
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
    { value: 'kvkk', label: 'KVKK', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'sigorta-hukuku', label: 'Sigorta Hukuku', color: 'bg-teal-100 text-teal-800' }
  ];

  // Templates
  const templates = [
    { value: 'standard', label: 'Standart Makale', description: 'Genel makale formatı' },
    { value: 'legal-article', label: 'Hukuki Makale', description: 'Hukuki analiz ve değerlendirme' },
    { value: 'case-study', label: 'Vaka Analizi', description: 'Dava örnekleri ve sonuçları' },
    { value: 'legal-guide', label: 'Hukuk Rehberi', description: 'Adım adım hukuki süreç rehberi' },
    { value: 'news', label: 'Hukuk Haberi', description: 'Güncel hukuki gelişmeler' }
  ];

  // Input change handler
  const handleInputChange = useCallback((field, value) => {
    setArticleData(prev => ({ ...prev, [field]: value }));
    
    // Auto generate slug from title
    if (field === 'title' && !prev.slug) {
      const slug = value
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setArticleData(prev => ({ ...prev, slug }));
    }

    // Auto generate meta title if empty
    if (field === 'title' && !prev.metaTitle) {
      setArticleData(prev => ({ ...prev, metaTitle: value }));
    }
  }, []);

  // Content change handler - FIXED!
  const handleContentChange = useCallback((content) => {
    setArticleData(prev => ({ ...prev, content }));
  }, []);

  // Image selection handler
  const handleImageSelect = useCallback((imageUrl, altText = '') => {
    if (activeTab === 'featuredImage') {
      setArticleData(prev => ({
        ...prev, 
        featuredImage: imageUrl,
        featuredImageAlt: altText
      }));
    } else {
      // Insert into editor - this will be handled by the editor
    }
    setIsImageModalOpen(false);
  }, [activeTab]);

  // Handle keywords and tags
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

  // Auto save functionality
  const autoSave = useCallback(async () => {
    if (!articleData.title.trim() || !articleData.content.trim()) return;

    try {
      const response = await fetch('/api/admin/articles/auto-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...articleData,
          status: 'auto-draft'
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto save error:', error);
    }
  }, [articleData]);

  // Auto save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Save as draft
  const handleSave = useCallback(async () => {
    if (!articleData.title.trim()) {
      setError('Makale başlığı gereklidir');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...articleData,
          status: 'draft'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLastSaved(new Date());
        setSuccess('Makale taslak olarak kaydedildi');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Kaydetme sırasında bir hata oluştu');
      }
    } catch (error) {
      console.error('Save error:', error);
      setError('Kaydetme sırasında bir hata oluştu');
    } finally {
      setIsSaving(false);
    }
  }, [articleData]);

  // Publish article
  const handlePublish = useCallback(async () => {
    // Validation
    const requiredFields = ['title', 'excerpt', 'content', 'metaDescription'];
    const missingFields = requiredFields.filter(field => !articleData[field]?.trim());
    
    if (missingFields.length > 0) {
      setError(`Yayınlamak için gerekli alanlar: ${missingFields.join(', ')}`);
      return;
    }

    setIsPublishing(true);
    setError('');

    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...articleData,
          status: 'published',
          publishedAt: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Makale başarıyla yayınlandı!');
        
        // Redirect to articles list after success
        setTimeout(() => {
          router.push('/admin/articles');
        }, 2000);
      } else {
        setError(result.message || 'Yayınlama sırasında bir hata oluştu');
      }
    } catch (error) {
      console.error('Publish error:', error);
      setError('Yayınlama sırasında bir hata oluştu');
    } finally {
      setIsPublishing(false);
    }
  }, [articleData, router]);

  // Get current category and template info
  const currentCategory = categories.find(cat => cat.value === articleData.category);
  const currentTemplate = templates.find(template => template.value === articleData.template);

  // Calculate stats
  const plainText = articleData.content.replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Yeni Makale</h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentCategory?.color}`}>
                    {currentCategory?.label}
                  </span>
                  <span>{wordCount} kelime</span>
                  <span>{readingTime} dakika okuma</span>
                  {lastSaved && (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {lastSaved.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} otomatik kaydedildi
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => alert('Önizleme özelliği yakında')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Önizle
              </button>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isPublishing ? 'Yayınlanıyor...' : 'Yayınla'}
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Basic Info & Settings */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title & Slug */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Type className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Temel Bilgiler</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Makale Başlığı *
                  </label>
                  <input
                    type="text"
                    value={articleData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Makale başlığını yazın..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={articleData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="url-slug"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={articleData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Makale Şablonu
                  </label>
                  <select
                    value={articleData.template}
                    onChange={(e) => handleInputChange('template', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    {templates.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentTemplate?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Öne Çıkan Görsel</h3>
              </div>

              {articleData.featuredImage ? (
                <div className="relative">
                  <img
                    src={articleData.featuredImage}
                    alt={articleData.featuredImageAlt}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setArticleData(prev => ({ ...prev, featuredImage: '', featuredImageAlt: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab('featuredImage');
                    setIsImageModalOpen(true);
                  }}
                  className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Upload className="w-8 h-8 mb-2" />
                  <span>Görsel Seç</span>
                </button>
              )}

              {articleData.featuredImage && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={articleData.featuredImageAlt}
                    onChange={(e) => handleInputChange('featuredImageAlt', e.target.value)}
                    placeholder="Görsel açıklaması..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              )}
            </div>

            {/* Publishing Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Yayın Ayarları</h3>
              </div>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={articleData.allowComments}
                    onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yorumlara izin ver</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zamanlanmış Yayın
                  </label>
                  <input
                    type="datetime-local"
                    value={articleData.scheduledAt}
                    onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Content Editor */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">İçerik Editörü</h3>
                </div>
              </div>
              
              <UltraProfessionalEditor
                content={articleData.content}
                onChange={handleContentChange}
                onImageInsert={() => {
                  setActiveTab('content');
                  setIsImageModalOpen(true);
                }}
                placeholder="Makale içeriğinizi buraya yazın..."
                className="min-h-[600px]"
              />
            </div>
          </div>

          {/* Right Column - SEO & Meta */}
          <div className="lg:col-span-3 space-y-6">
            {/* Excerpt */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Hash className="w-4 h-4 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Özet</h3>
              </div>
              
              <textarea
                value={articleData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Makale özetini yazın..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-2">
                {articleData.excerpt.length}/300 karakter
              </p>
            </div>

            {/* SEO Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">SEO Ayarları</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Başlık
                  </label>
                  <input
                    type="text"
                    value={articleData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    placeholder="SEO başlığı..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {articleData.metaTitle.length}/60 karakter
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Açıklama *
                  </label>
                  <textarea
                    value={articleData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="SEO açıklaması..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {articleData.metaDescription.length}/160 karakter
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ana Anahtar Kelime
                  </label>
                  <input
                    type="text"
                    value={articleData.focusKeyword}
                    onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
                    placeholder="Ana anahtar kelime..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anahtar Kelimeler
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {articleData.keywords.map(keyword => (
                      <span key={keyword} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {keyword}
                        <button
                          onClick={() => handleKeywordRemove(keyword)}
                          className="hover:text-blue-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Anahtar kelime ekle..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleKeywordAdd(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiketler
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {articleData.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        {tag}
                        <button
                          onClick={() => handleTagRemove(tag)}
                          className="hover:text-green-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Etiket ekle..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleTagAdd(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: SEO Analysis Panel */}
        <div className="mt-8">
          <SEOAnalysisPanel
            title={articleData.title}
            content={articleData.content}
            excerpt={articleData.excerpt}
            metaTitle={articleData.metaTitle}
            metaDescription={articleData.metaDescription}
            focusKeyword={articleData.focusKeyword}
            tags={articleData.tags}
            featuredImage={articleData.featuredImage}
            slug={articleData.slug}
          />
        </div>
      </div>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageSelect={handleImageSelect}
      />
    </div>
  );
};
export default UltraProfessionalArticleCreate;