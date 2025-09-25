'use client';

import Image from 'next/image';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Image as ImageIcon,
  Upload,
  X,
  Save,
  Send,
  Clock,
  Zap,
  Hash,
  Tag,
  FileText,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

// Image upload modal component
const ImageUploadModal = ({ isOpen, onClose, onImageSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadUrl, setUploadUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('type', 'article');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        onImageSelect(data.url, selectedFile.name);
        handleClose();
      } else {
        alert('Upload başarısız: ' + data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload sırasında bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlInsert = () => {
    if (uploadUrl) {
      onImageSelect(uploadUrl, 'Harici görsel');
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadUrl('');
    setPreview('');
    setUploading(false);
    setActiveTab('upload');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Görsel Ekle</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('upload')}
              className={`border-b-2 pb-2 text-sm font-medium ${
                activeTab === 'upload' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dosya Yükle
            </button>
            <button 
              onClick={() => setActiveTab('url')}
              className={`border-b-2 pb-2 text-sm font-medium ${
                activeTab === 'url' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              URL Ekle
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'upload' ? (
            <>
              {/* File Drop Zone */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  {selectedFile ? selectedFile.name : 'Görsel dosyasını seçin veya sürükleyip bırakın'}
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF desteklenir (Maks 5MB)</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Preview */}
              {preview && (
                <div className="border rounded-lg p-4">
                  <Image
                    src={preview} 
                    alt="Preview" 
                    width={300}
                    height={192}
                    className="max-w-full h-48 object-contain mx-auto rounded"
                  />
                </div>
              )}

              {/* Upload Button */}
              {selectedFile && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Yükle ve Ekle
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <>
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Görsel URL&apos;si:
                </label>
                <input
                  type="url"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              {/* URL Preview */}
              {uploadUrl && (
                <div className="border rounded-lg p-4">
                  <Image 
                    src={uploadUrl} 
                    alt="URL Preview" 
                    width={300}
                    height={192}
                    className="max-w-full h-48 object-contain mx-auto rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="text-center text-gray-500 text-sm hidden">
                    Görsel yüklenemedi
                  </div>
                </div>
              )}

              {/* Add URL Button */}
              {uploadUrl && (
                <button
                  onClick={handleUrlInsert}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Görsel Ekle
                </button>
              )}
            </>
          )}

          {/* Cancel Button */}
          <button
            onClick={handleClose}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Article Editor Component
export default function ArticleEditor({ 
  mode = 'create', 
  initialData = {}, 
  onSave,
  onPublish,
  onAutoSave 
}) {
  // State
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
    ...initialData
  });

  const [activeTab, setActiveTab] = useState('editor');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showSEOAnalysis, setShowSEOAnalysis] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs
  const contentRef = useRef(null);
  const titleRef = useRef(null);

  // Auto save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onAutoSave && articleData.title && articleData.content) {
        onAutoSave(articleData);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [articleData, onAutoSave]);

  // Input change handler
  const handleInputChange = (field, value) => {
    setArticleData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title' && !initialData.slug) {
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
        .replace(/^-|-$/g, '');
      
      setArticleData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  // Rich text editor commands
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  // Insert image handler
  const handleImageSelect = (url, alt) => {
    const imgTag = `<img src="${url}" alt="${alt}" class="max-w-full h-auto rounded-lg my-4" />`;
    
    if (contentRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const div = document.createElement('div');
        div.innerHTML = imgTag;
        range.insertNode(div.firstChild);
        range.collapse(false);
      } else {
        contentRef.current.innerHTML += imgTag;
      }
      
      handleInputChange('content', contentRef.current.innerHTML);
    }
  };

  // Save handlers
  const handleSave = async (status = 'draft') => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...articleData,
        status,
        content: contentRef.current?.innerHTML || articleData.content
      };

      if (status === 'published' && onPublish) {
        await onPublish(dataToSave);
      } else if (onSave) {
        await onSave(dataToSave);
      }
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Simple SEO Analysis
  const seoAnalysis = {
    titleLength: articleData.title.length,
    metaDescLength: articleData.metaDescription.length,
    focusKeywordInTitle: articleData.focusKeyword && articleData.title.toLowerCase().includes(articleData.focusKeyword.toLowerCase()),
    focusKeywordInMeta: articleData.focusKeyword && articleData.metaDescription.toLowerCase().includes(articleData.focusKeyword.toLowerCase()),
    contentLength: (contentRef.current?.textContent || '').length
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Top Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* Left - Tabs */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'editor'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Editör
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Ayarlar
            </button>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Kaydediliyor...' : 'Taslak Kaydet'}
            </button>
            
            <button
              onClick={() => handleSave('published')}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              Yayınla
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Editor Area */}
        <div className="xl:col-span-3">
          {activeTab === 'editor' ? (
            <>
              {/* Title Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <input
                  ref={titleRef}
                  type="text"
                  placeholder="Makale başlığını buraya yazın..."
                  value={articleData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full text-3xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none resize-none"
                />
                
                {/* Slug */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL (Slug)</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      /makaleler/
                    </span>
                    <input
                      type="text"
                      value={articleData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900"
                      placeholder="makale-url-slug"
                    />
                  </div>
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Toolbar */}
                <div className="border-b border-gray-200 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => execCommand('bold')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Kalın"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => execCommand('italic')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="İtalik"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => execCommand('underline')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Altı çizili"
                    >
                      <Underline className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-2"></div>

                    <button
                      onClick={() => execCommand('insertUnorderedList')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Liste"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => execCommand('insertOrderedList')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Numaralı liste"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => execCommand('formatBlock', 'blockquote')}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Alıntı"
                    >
                      <Quote className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-2"></div>

                    <button
                      onClick={() => setIsImageModalOpen(true)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Görsel ekle"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-2"></div>

                    {/* Heading Dropdown */}
                    <select
                      onChange={(e) => execCommand('formatBlock', e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm text-gray-900"
                      defaultValue=""
                    >
                      <option value="">Format</option>
                      <option value="h1">Başlık 1</option>
                      <option value="h2">Başlık 2</option>
                      <option value="h3">Başlık 3</option>
                      <option value="h4">Başlık 4</option>
                      <option value="p">Paragraf</option>
                    </select>
                  </div>
                </div>

                {/* Content Editor */}
                <div
                  ref={contentRef}
                  contentEditable
                  dangerouslySetInnerHTML={{ __html: articleData.content }}
                  onInput={(e) => handleInputChange('content', e.target.innerHTML)}
                  className="min-h-[500px] p-6 text-gray-900 outline-none prose max-w-none"
                  placeholder="Makale içeriğinizi buraya yazın..."
                  style={{
                    lineHeight: '1.8',
                    fontSize: '16px'
                  }}
                />
              </div>
            </>
          ) : (
            /* Settings Tab */
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Temel Bilgiler</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Makale Özeti
                    </label>
                    <textarea
                      value={articleData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      rows="3"
                      placeholder="Makale özetini buraya yazın..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori
                    </label>
                    <select
                      value={articleData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    >
                      <option value="genel">Genel</option>
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
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Öne Çıkan Görsel
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={articleData.featuredImage}
                        onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                        placeholder="Görsel URL'si"
                        className="flex-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                      <button
                        onClick={() => setIsImageModalOpen(true)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                    {articleData.featuredImage && (
                      <div className="mt-2">
                        <Image 
                          src={articleData.featuredImage} 
                          alt="Öne çıkan görsel" 
                          width={128}
                          height={80}
                          className="w-32 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={articleData.allowComments}
                        onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yorumlara izin ver</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    SEO Ayarları
                  </h3>
                  <button
                    onClick={() => setShowSEOAnalysis(!showSEOAnalysis)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showSEOAnalysis ? 'Analizi Gizle' : 'SEO Analizi'}
                  </button>
                </div>

                {showSEOAnalysis && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">SEO Analizi</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {seoAnalysis.titleLength >= 30 && seoAnalysis.titleLength <= 60 ? 
                          <CheckCircle className="w-4 h-4 text-green-500" /> : 
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        }
                        <span className="text-gray-700">Başlık uzunluğu: {seoAnalysis.titleLength} karakter</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {seoAnalysis.metaDescLength >= 120 && seoAnalysis.metaDescLength <= 160 ? 
                          <CheckCircle className="w-4 h-4 text-green-500" /> : 
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        }
                        <span className="text-gray-700">Meta açıklama uzunluğu: {seoAnalysis.metaDescLength} karakter</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {seoAnalysis.focusKeywordInTitle ? 
                          <CheckCircle className="w-4 h-4 text-green-500" /> : 
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        }
                        <span className="text-gray-700">Odak anahtar kelime başlıkta: {seoAnalysis.focusKeywordInTitle ? 'Evet' : 'Hayır'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Başlık
                    </label>
                    <input
                      type="text"
                      value={articleData.metaTitle}
                      onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="SEO için optimize edilmiş başlık"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {articleData.metaTitle.length}/60 karakter
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta Açıklama
                    </label>
                    <textarea
                      value={articleData.metaDescription}
                      onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      rows="3"
                      placeholder="Arama motorları için açıklama"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {articleData.metaDescription.length}/160 karakter
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ana Anahtar Kelime
                    </label>
                    <input
                      type="text"
                      value={articleData.focusKeyword}
                      onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="örn: boşanma davası"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etiketler
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(articleData.tags) ? articleData.tags.join(', ') : ''}
                      onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="etiket1, etiket2, etiket3"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Etiketleri virgülle ayırın
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Makale Bilgileri</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-gray-500">Durum:</span>
                <p className="font-medium text-gray-900">
                  {articleData.status === 'draft' ? 'Taslak' :
                   articleData.status === 'published' ? 'Yayında' :
                   articleData.status === 'scheduled' ? 'Zamanlanmış' : 'Arşiv'}
                </p>
              </div>
              
              <div>
                <span className="text-gray-500">Kelime Sayısı:</span>
                <p className="font-medium text-gray-900">
                  ~{(contentRef.current?.textContent || '').split(' ').length} kelime
                </p>
              </div>
              
              <div>
                <span className="text-gray-500">Okuma Süresi:</span>
                <p className="font-medium text-gray-900">
                  ~{Math.ceil(((contentRef.current?.textContent || '').split(' ').length || 0) / 200)} dakika
                </p>
              </div>

              {mode === 'edit' && (
                <div>
                  <span className="text-gray-500">Son Güncelleme:</span>
                  <p className="font-medium text-gray-900">
                    {new Date(initialData.updatedAt || Date.now()).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-2">
              <button
                onClick={() => setActiveTab(activeTab === 'editor' ? 'settings' : 'editor')}
                className="w-full px-4 py-2 text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {activeTab === 'editor' ? 'Ayarlara Git' : 'Editöre Dön'}
              </button>
              
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="w-full px-4 py-2 text-left text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Görsel Ekle
              </button>
            </div>
          </div>
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
}