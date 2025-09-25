import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Save,
  Eye,
  Globe,
  Settings,
  Target,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Image,
  Calendar,
  Tag,
  FileText,
  Zap,
  BookOpen,
  TrendingUp,
  Monitor,
  Plus,
  X
} from 'lucide-react';

const ArticleEditor = ({ 
  mode = 'create', 
  initialData = {}, 
  onSave = () => {}, 
  onPublish = () => {},
  onAutoSave = () => {}
}) => {
  
  // Form State
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
    allowComments: true,
    scheduledAt: '',
    ...initialData
  });

  const [activeTab, setActiveTab] = useState('editor');
  const [seoScore, setSeoScore] = useState(0);
  const [readabilityScore, setReadabilityScore] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  
  const contentRef = useRef(null);
  const titleRef = useRef(null);

  // Kategoriler
  const categories = [
    { value: 'genel', label: 'Genel', color: 'gray' },
    { value: 'aile-hukuku', label: 'Aile Hukuku', color: 'blue' },
    { value: 'ceza-hukuku', label: 'Ceza Hukuku', color: 'red' },
    { value: 'is-hukuku', label: 'İş Hukuku', color: 'green' },
    { value: 'ticaret-hukuku', label: 'Ticaret Hukuku', color: 'purple' },
    { value: 'idare-hukuku', label: 'İdare Hukuku', color: 'orange' },
    { value: 'gayrimenkul-hukuku', label: 'Gayrimenkul Hukuku', color: 'teal' },
    { value: 'miras-hukuku', label: 'Miras Hukuku', color: 'amber' },
    { value: 'kvkk', label: 'KVKK', color: 'cyan' },
    { value: 'icra-hukuku', label: 'İcra Hukuku', color: 'indigo' }
  ];

  // Auto-slug generation
  const generateSlug = (title) => {
    return title
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
  };

  // SEO Analysis
  const analyzeSEO = useCallback(() => {
    let score = 0;
    
    // Title length (30-60 characters ideal)
    if (articleData.title.length >= 30 && articleData.title.length <= 60) score += 20;
    else if (articleData.title.length >= 15) score += 10;
    
    // Meta description (120-160 characters ideal)
    if (articleData.metaDescription.length >= 120 && articleData.metaDescription.length <= 160) score += 20;
    else if (articleData.metaDescription.length >= 50) score += 10;
    
    // Focus keyword checks
    if (articleData.focusKeyword) {
      const keyword = articleData.focusKeyword.toLowerCase();
      
      // Title contains focus keyword
      if (articleData.title.toLowerCase().includes(keyword)) score += 15;
      
      // Meta description contains focus keyword
      if (articleData.metaDescription.toLowerCase().includes(keyword)) score += 15;
      
      // Content contains focus keyword
      if (articleData.content.toLowerCase().includes(keyword)) score += 10;
      
      // Slug contains focus keyword
      if (articleData.slug.includes(keyword.replace(/\s+/g, '-'))) score += 10;
    }
    
    // Content length (300+ words ideal)
    if (wordCount >= 1000) score += 10;
    else if (wordCount >= 500) score += 7;
    else if (wordCount >= 300) score += 5;
    
    setSeoScore(Math.min(score, 100));
  }, [articleData, wordCount]);

  // Readability Analysis
  const analyzeReadability = useCallback(() => {
    if (!articleData.content) return;
    
    const cleanText = articleData.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length === 0 || words.length === 0) return;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const longWords = words.filter(w => w.length > 6).length;
    const longWordPercentage = (longWords / words.length) * 100;
    
    let score = 100;
    
    // Sentence length penalty
    if (avgWordsPerSentence > 25) score -= 30;
    else if (avgWordsPerSentence > 20) score -= 20;
    else if (avgWordsPerSentence > 15) score -= 10;
    
    // Complex words penalty
    if (longWordPercentage > 40) score -= 20;
    else if (longWordPercentage > 30) score -= 10;
    
    setReadabilityScore(Math.max(score, 0));
  }, [articleData.content]);

  // Update word count and reading time
  const updateStats = useCallback(() => {
    if (!articleData.content) return;
    
    const cleanText = articleData.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ').filter(word => word.length > 0).length;
    
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // 200 words per minute average
  }, [articleData.content]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setArticleData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug from title
      if (field === 'title' && !prev.slug) {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  // Add tag
  const addTag = () => {
    if (newTag && !articleData.tags.includes(newTag)) {
      setArticleData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setArticleData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Add keyword
  const addKeyword = () => {
    if (newKeyword && !articleData.keywords.includes(newKeyword)) {
      setArticleData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword]
      }));
      setNewKeyword('');
    }
  };

  // Remove keyword
  const removeKeyword = (keywordToRemove) => {
    setArticleData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  // Editor toolbar functions
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    contentRef.current?.focus();
  };

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (mode === 'edit' && articleData.title) {
        setIsAutoSaving(true);
        onAutoSave(articleData);
        setTimeout(() => {
          setIsAutoSaving(false);
          setLastSaved(new Date());
        }, 1000);
      }
    }, 3000);

    return () => clearTimeout(autoSaveTimer);
  }, [articleData, mode, onAutoSave]);

  // Update analyses when content changes
  useEffect(() => {
    updateStats();
    analyzeSEO();
    analyzeReadability();
  }, [articleData, updateStats, analyzeSEO, analyzeReadability]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertTriangle;
    return AlertTriangle;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {mode === 'create' ? 'Yeni Makale' : 'Makale Düzenle'}
              </h1>
              {isAutoSaving && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1 animate-spin" />
                  Otomatik kaydediliyor...
                </div>
              )}
              {lastSaved && (
                <div className="text-sm text-gray-500">
                  Son kaydedilme: {lastSaved.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium transition-colors ${
                  previewMode 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Editör' : 'Önizleme'}
              </button>

              <button
                onClick={() => onSave(articleData)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Taslak Kaydet
              </button>

              <button
                onClick={() => onPublish(articleData)}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-md hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <Globe className="w-4 h-4 mr-2" />
                Yayınla
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Ana İçerik Alanı */}
          <div className="lg:col-span-3 space-y-6">
            {!previewMode ? (
              <>
                {/* Başlık */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="makale-url-slug"
                      />
                    </div>
                  </div>
                </div>

                {/* Rich Text Editor Toolbar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => execCommand('bold')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Kalın (Ctrl+B)"
                      >
                        <Bold className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => execCommand('italic')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="İtalik (Ctrl+I)"
                      >
                        <Italic className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => execCommand('underline')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Altı Çizgili (Ctrl+U)"
                      >
                        <Underline className="w-5 h-5" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2" />
                      
                      <button
                        onClick={() => execCommand('formatBlock', 'h2')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Başlık 2"
                      >
                        <Heading2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => execCommand('formatBlock', 'h3')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Başlık 3"
                      >
                        <Heading3 className="w-5 h-5" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2" />
                      
                      <button
                        onClick={() => execCommand('insertUnorderedList')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Madde İşaretli Liste"
                      >
                        <List className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => execCommand('insertOrderedList')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Numaralı Liste"
                      >
                        <ListOrdered className="w-5 h-5" />
                      </button>
                      
                      <div className="w-px h-6 bg-gray-300 mx-2" />
                      
                      <button
                        onClick={() => {
                          const url = prompt('Link URL:');
                          if (url) execCommand('createLink', url);
                        }}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Link Ekle"
                      >
                        <Link className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => execCommand('formatBlock', 'blockquote')}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                        title="Alıntı"
                      >
                        <Quote className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* İçerik Editörü */}
                  <div
                    ref={contentRef}
                    contentEditable
                    className="min-h-96 p-6 outline-none prose prose-lg max-w-none"
                    style={{ minHeight: '400px' }}
                    onInput={(e) => handleInputChange('content', e.target.innerHTML)}
                    dangerouslySetInnerHTML={{ __html: articleData.content }}
                    placeholder="Makale içeriğinizi buraya yazın..."
                  />
                </div>

                {/* Özet */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Makale Özeti <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={articleData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Makalenizin kısa bir özeti (maksimum 300 karakter)"
                    maxLength={300}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {articleData.excerpt.length}/300
                  </div>
                </div>
              </>
            ) : (
              /* Önizleme Modu */
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <article className="prose prose-lg max-w-none">
                  <header>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                      {categories.find(cat => cat.value === articleData.category)?.label}
                    </span>
                    <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                      {articleData.title || 'Başlık giriniz'}
                    </h1>
                    <div className="flex items-center space-x-4 text-gray-600 mt-4 not-prose">
                      <span>{readingTime} dakika okuma</span>
                      <span>•</span>
                      <span>{wordCount} kelime</span>
                    </div>
                  </header>
                  
                  {articleData.excerpt && (
                    <div className="text-xl text-gray-600 font-medium border-l-4 border-blue-500 pl-6 my-8 not-prose">
                      {articleData.excerpt}
                    </div>
                  )}
                  
                  <div dangerouslySetInnerHTML={{ __html: articleData.content || '<p>İçerik giriniz...</p>' }} />
                </article>
              </div>
            )}
          </div>

          {/* Yan Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* SEO & Okunabilirlik Skorları */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Analiz Skorları
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">SEO Skoru</span>
                    <span className={`px-2 py-1 text-xs font-bold rounded border ${getScoreColor(seoScore)}`}>
                      {seoScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        seoScore >= 80 ? 'bg-green-500' : seoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${seoScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Okunabilirlik</span>
                    <span className={`px-2 py-1 text-xs font-bold rounded border ${getScoreColor(readabilityScore)}`}>
                      {readabilityScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        readabilityScore >= 80 ? 'bg-green-500' : readabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${readabilityScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* İstatistikler */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Kelime:</span>
                    <span className="font-medium ml-1">{wordCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Okuma:</span>
                    <span className="font-medium ml-1">{readingTime} dk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Yayın Ayarları */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Yayın Ayarları
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    value={articleData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
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

            {/* SEO Ayarları */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                SEO Ayarları
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ana Anahtar Kelime
                  </label>
                  <input
                    type="text"
                    value={articleData.focusKeyword}
                    onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="örn: boşanma davası"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Başlık
                  </label>
                  <input
                    type="text"
                    value={articleData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="SEO başlığı (60 karakter ideal)"
                    maxLength={60}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {articleData.metaTitle.length}/60
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Açıklama
                  </label>
                  <textarea
                    value={articleData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="SEO açıklaması (160 karakter ideal)"
                    maxLength={160}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {articleData.metaDescription.length}/160
                  </div>
                </div>
              </div>
            </div>

            {/* Etiketler */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Etiketler
              </h3>

              <div className="space-y-3">
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 border border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Etiket ekle"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {articleData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;