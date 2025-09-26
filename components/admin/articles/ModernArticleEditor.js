// components/admin/articles/ModernArticleEditor.js
'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Save, Send, Eye, Settings, Image as ImageIcon, Link2, Bold, Italic, 
  Underline, List, ListOrdered, Quote, AlignLeft, AlignCenter, AlignRight,
  Type, Palette, Undo2, Redo2, Maximize, Code, Table, Minus,
  Hash, Tag, Globe, Target, TrendingUp, CheckCircle, AlertTriangle,
  FileText, Zap, Clock, BarChart3
} from 'lucide-react';

// Debounce hook for performance
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// SEO Analysis Hook
function useSEOAnalysis(title, content, metaDesc, focusKeyword) {
  return useMemo(() => {
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
    const charCount = content.replace(/<[^>]*>/g, '').length;
    
    let score = 0;
    const checks = [];
    
    // Title checks
    if (title.length >= 30 && title.length <= 60) {
      score += 20;
      checks.push({ name: 'Title Length', status: 'good', message: `${title.length} characters - Perfect!` });
    } else {
      checks.push({ name: 'Title Length', status: 'warning', message: `${title.length} characters - Should be 30-60` });
    }
    
    // Meta description checks
    if (metaDesc.length >= 120 && metaDesc.length <= 160) {
      score += 20;
      checks.push({ name: 'Meta Description', status: 'good', message: `${metaDesc.length} characters - Great!` });
    } else {
      checks.push({ name: 'Meta Description', status: 'warning', message: `${metaDesc.length} characters - Should be 120-160` });
    }
    
    // Content length check
    if (wordCount >= 300) {
      score += 20;
      checks.push({ name: 'Content Length', status: 'good', message: `${wordCount} words - Good length!` });
    } else {
      checks.push({ name: 'Content Length', status: 'error', message: `${wordCount} words - Too short, aim for 300+` });
    }
    
    // Focus keyword checks
    if (focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase())) {
      score += 15;
      checks.push({ name: 'Keyword in Title', status: 'good', message: 'Focus keyword found in title' });
    } else if (focusKeyword) {
      checks.push({ name: 'Keyword in Title', status: 'warning', message: 'Focus keyword not in title' });
    }
    
    // Readability
    const avgWordsPerSentence = wordCount / (content.split(/[.!?]+/).length || 1);
    if (avgWordsPerSentence <= 20) {
      score += 15;
      checks.push({ name: 'Readability', status: 'good', message: 'Good sentence length' });
    } else {
      checks.push({ name: 'Readability', status: 'warning', message: 'Sentences too long' });
    }
    
    return {
      score: Math.min(score, 100),
      wordCount,
      charCount,
      readingTime: Math.ceil(wordCount / 200),
      checks
    };
  }, [title, content, metaDesc, focusKeyword]);
}

// Main Editor Component
const ModernArticleEditor = ({ 
  initialData = {},
  onSave,
  onPublish,
  onAutoSave 
}) => {
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
    featuredImage: '',
    ...initialData
  });

  const [activeTab, setActiveTab] = useState('content');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Refs
  const contentRef = useRef(null);
  const titleRef = useRef(null);

  // Debounced content for performance
  const debouncedContent = useDebounce(articleData.content, 300);
  const debouncedTitle = useDebounce(articleData.title, 300);

  // SEO Analysis
  const seoAnalysis = useSEOAnalysis(
    debouncedTitle, 
    debouncedContent, 
    articleData.metaDescription,
    articleData.focusKeyword
  );

  // Categories
  const categories = [
    { value: 'genel', label: 'Genel' },
    { value: 'aile-hukuku', label: 'Aile Hukuku' },
    { value: 'ceza-hukuku', label: 'Ceza Hukuku' },
    { value: 'is-hukuku', label: 'İş Hukuku' },
    { value: 'ticaret-hukuku', label: 'Ticaret Hukuku' },
    { value: 'idare-hukuku', label: 'İdare Hukuku' },
    { value: 'icra-hukuku', label: 'İcra Hukuku' },
    { value: 'gayrimenkul-hukuku', label: 'Gayrimenkul Hukuku' },
    { value: 'miras-hukuku', label: 'Miras Hukuku' },
    { value: 'kvkk', label: 'KVKK' },
    { value: 'sigorta-hukuku', label: 'Sigorta Hukuku' }
  ];

  // Input change handler - optimized to prevent cursor jumping
  const handleInputChange = useCallback((field, value) => {
    setArticleData(prev => ({ ...prev, [field]: value }));

    // Auto-generate slug from title
    if (field === 'title' && !initialData.slug) {
      const slug = value
        .toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
        .replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      setArticleData(prev => ({ ...prev, slug }));
    }
  }, [initialData.slug]);

  // Content change handler - prevents cursor jump
  const handleContentChange = useCallback((e) => {
    const content = e.target.innerHTML;
    handleInputChange('content', content);
  }, [handleInputChange]);

  // Rich text commands - improved implementation
  const execCommand = useCallback((command, value = null) => {
    // Save selection before command
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // Execute command
    document.execCommand(command, false, value);
    
    // Restore focus without losing cursor position
    if (contentRef.current && range) {
      contentRef.current.focus();
      try {
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        // Fallback if range restoration fails
        contentRef.current.focus();
      }
    }

    // Update content immediately
    if (contentRef.current) {
      handleInputChange('content', contentRef.current.innerHTML);
    }
  }, [handleInputChange]);

  // Auto-save effect
  useEffect(() => {
    if (onAutoSave && debouncedTitle && debouncedContent) {
      const timer = setTimeout(() => {
        onAutoSave(articleData);
        setLastSaved(new Date());
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [debouncedTitle, debouncedContent, onAutoSave, articleData]);

  // Save handlers
  const handleSave = useCallback(async (status = 'draft') => {
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
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [articleData, onSave, onPublish]);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''} flex flex-col h-full`}>
      {/* TOP BAR - Compact and Professional */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Left - Title Input */}
          <div className="flex-1 max-w-2xl">
            <input
              ref={titleRef}
              type="text"
              placeholder="Makale başlığını yazın..."
              value={articleData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full text-xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent"
            />
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {lastSaved && (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {lastSaved.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <span>{seoAnalysis.wordCount} kelime</span>
              <span>{seoAnalysis.readingTime} dk</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSave('draft')}
                disabled={isSaving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>

              <button
                onClick={() => handleSave('published')}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Yayınla
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA - Optimized Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR - Narrow */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Basic Settings */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={articleData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                  <input
                    type="text"
                    value={articleData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="makale-url-slug"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Öne Çıkan Görsel</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={articleData.featuredImage}
                      onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                    <button 
                      onClick={() => setIsImageModalOpen(true)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Özet
              </h3>
              <textarea
                value={articleData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                placeholder="Makale özeti..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{articleData.excerpt.length}/300</p>
            </div>
          </div>
        </div>

        {/* CENTER - MAIN EDITOR */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Rich Text Toolbar */}
          <div className="border-b border-gray-200 p-3">
            <div className="flex items-center gap-1">
              {/* Basic Formatting */}
              <button
                onClick={() => execCommand('bold')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Kalın (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCommand('italic')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="İtalik (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCommand('underline')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Altı Çizili (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-2"></div>

              {/* Lists */}
              <button
                onClick={() => execCommand('insertUnorderedList')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Madde İşaretli Liste"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCommand('insertOrderedList')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Numaralı Liste"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-2"></div>

              {/* Alignment */}
              <button
                onClick={() => execCommand('justifyLeft')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Sola Hizala"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCommand('justifyCenter')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Ortala"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => execCommand('justifyRight')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                title="Sağa Hizala"
              >
                <AlignRight className="w-4 h-4" />
              </button>

              <div className="w-px h-6 bg-gray-300 mx-2"></div>

              {/* Headings */}
              <select
                onChange={(e) => execCommand('formatBlock', e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue=""
              >
                <option value="">Paragraf</option>
                <option value="h1">Başlık 1</option>
                <option value="h2">Başlık 2</option>
                <option value="h3">Başlık 3</option>
                <option value="h4">Başlık 4</option>
              </select>

              <div className="ml-auto flex items-center gap-2">
                {/* Undo/Redo */}
                <button
                  onClick={() => execCommand('undo')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="Geri Al (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => execCommand('redo')}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="İleri Al (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="Tam Ekran"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Editor Area */}
          <div className="flex-1 overflow-y-auto">
            <div
              ref={contentRef}
              contentEditable
              dangerouslySetInnerHTML={{ __html: articleData.content }}
              onInput={handleContentChange}
              className="min-h-full p-6 outline-none prose max-w-none text-gray-900 leading-relaxed"
              style={{ 
                fontSize: '16px',
                lineHeight: '1.7'
              }}
              data-placeholder="İçeriğinizi buraya yazın..."
              suppressContentEditableWarning={true}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR - SEO & Analytics */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 flex-shrink-0 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* SEO Score Widget */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{seoAnalysis.score}</div>
                <div className="text-sm text-gray-600 mb-3">SEO Puanı</div>
                <div className="text-xs text-gray-500 mb-3">
                  {seoAnalysis.score >= 80 ? 'Mükemmel' : seoAnalysis.score >= 60 ? 'İyi' : 'Geliştirilmeli'}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${seoAnalysis.score}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Content Stats */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                İstatistikler
              </h3>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{seoAnalysis.wordCount}</div>
                  <div className="text-xs text-gray-600">Kelime</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-lg font-bold text-purple-600">{seoAnalysis.readingTime}</div>
                  <div className="text-xs text-gray-600">Dakika</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">{seoAnalysis.charCount}</div>
                  <div className="text-xs text-gray-600">Karakter</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {Math.round((seoAnalysis.wordCount / (seoAnalysis.readingTime || 1)) * 10) / 10}
                  </div>
                  <div className="text-xs text-gray-600">WPM</div>
                </div>
              </div>
            </div>

            {/* SEO Checklist */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                SEO Kontrol
              </h3>
              <div className="space-y-2">
                {seoAnalysis.checks.map((check, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {check.status === 'good' && <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />}
                    {check.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />}
                    {check.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{check.name}</div>
                      <div className="text-xs text-gray-600">{check.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2" />
                SEO Ayarları
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Başlık</label>
                  <input
                    type="text"
                    value={articleData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO başlığı..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{articleData.metaTitle.length}/60</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Açıklama</label>
                  <textarea
                    value={articleData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    placeholder="SEO açıklaması..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">{articleData.metaDescription.length}/160</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Odak Kelimesi</label>
                  <input
                    type="text"
                    value={articleData.focusKeyword}
                    onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ana anahtar kelime"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etiketler</label>
                  <input
                    type="text"
                    value={Array.isArray(articleData.tags) ? articleData.tags.join(', ') : ''}
                    onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="etiket1, etiket2, etiket3"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernArticleEditor;