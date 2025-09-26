// app/admin/articles/create/page.js - ULTRA PROFESSIONAL ENTERPRISE LEVEL
'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, Send, Eye, ArrowLeft, CheckCircle, AlertTriangle, Clock, 
  Zap, Target, TrendingUp, BarChart3, FileText, Settings, Globe,
  Sparkles, Brain, Layers, Hash, Tag, Calendar, Users, Shield,
  RefreshCw, BookOpen, PenTool, Palette, Image as ImageIcon,
  Video, Mic, Link2, Code, Table, Type, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, Quote, Bold, Italic, Underline,
  Strikethrough, Subscript, Superscript, Minus, Plus, X, Maximize,
  Minimize, Copy, Download, Upload, Search, Filter, SortAsc
} from 'lucide-react';

import ModernArticleEditor from '@/components/admin/articles/ModernArticleEditor';
import ImageUploadModal from '@/components/admin/ImageUploadModal';

// Advanced Template Configurations
const ARTICLE_TEMPLATES = {
  'standard': {
    name: 'Standart Makale',
    description: 'Genel blog yazıları için',
    icon: FileText,
    color: 'from-gray-500 to-gray-600',
    defaultSEO: {
      focusKeywordDensity: 1.5,
      minWordCount: 800,
      maxTitleLength: 60
    },
    structure: [
      { type: 'introduction', label: 'Giriş', required: true },
      { type: 'main-content', label: 'Ana İçerik', required: true },
      { type: 'conclusion', label: 'Sonuç', required: true }
    ]
  },
  'legal-article': {
    name: 'Hukuki Makale',
    description: 'Detaylı hukuki analizler',
    icon: Shield,
    color: 'from-blue-600 to-indigo-600',
    defaultSEO: {
      focusKeywordDensity: 2.0,
      minWordCount: 1200,
      maxTitleLength: 65
    },
    structure: [
      { type: 'legal-background', label: 'Hukuki Altyapı', required: true },
      { type: 'case-analysis', label: 'Vaka Analizi', required: true },
      { type: 'legal-opinion', label: 'Hukuki Görüş', required: true },
      { type: 'precedents', label: 'İçtihatlar', required: false },
      { type: 'recommendations', label: 'Tavsiyeler', required: true }
    ]
  },
  'case-study': {
    name: 'Vaka Çalışması',
    description: 'Gerçek dava örnekleri',
    icon: BookOpen,
    color: 'from-green-600 to-emerald-600',
    defaultSEO: {
      focusKeywordDensity: 1.8,
      minWordCount: 1000,
      maxTitleLength: 70
    },
    structure: [
      { type: 'case-overview', label: 'Vaka Özeti', required: true },
      { type: 'problem-definition', label: 'Problem Tanımı', required: true },
      { type: 'legal-process', label: 'Hukuki Süreç', required: true },
      { type: 'outcome', label: 'Sonuç', required: true },
      { type: 'lessons-learned', label: 'Çıkarılan Dersler', required: true }
    ]
  },
  'legal-guide': {
    name: 'Hukuki Rehber',
    description: 'Adım adım kılavuzlar',
    icon: Target,
    color: 'from-purple-600 to-violet-600',
    defaultSEO: {
      focusKeywordDensity: 2.2,
      minWordCount: 1500,
      maxTitleLength: 55
    },
    structure: [
      { type: 'overview', label: 'Genel Bakış', required: true },
      { type: 'preparation', label: 'Hazırlık', required: true },
      { type: 'step-by-step', label: 'Adım Adım Süreç', required: true },
      { type: 'documents', label: 'Gerekli Belgeler', required: true },
      { type: 'timeline', label: 'Zaman Çizelgesi', required: false },
      { type: 'tips', label: 'İpuçları', required: true }
    ]
  },
  'news': {
    name: 'Hukuk Haberi',
    description: 'Güncel gelişmeler',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    defaultSEO: {
      focusKeywordDensity: 1.2,
      minWordCount: 400,
      maxTitleLength: 50
    },
    structure: [
      { type: 'breaking-news', label: 'Haber Başlığı', required: true },
      { type: 'details', label: 'Detaylar', required: true },
      { type: 'impact', label: 'Etkileri', required: true },
      { type: 'expert-opinion', label: 'Uzman Görüşü', required: false }
    ]
  }
};

// Advanced Categories with Metadata
const CATEGORIES = [
  { value: 'genel', label: 'Genel', color: 'bg-gray-100 text-gray-800', icon: Globe, seoTips: ['genel', 'hukuk', 'danışmanlık'] },
  { value: 'aile-hukuku', label: 'Aile Hukuku', color: 'bg-pink-100 text-pink-800', icon: Users, seoTips: ['aile', 'boşanma', 'velayet', 'nafaka'] },
  { value: 'ceza-hukuku', label: 'Ceza Hukuku', color: 'bg-red-100 text-red-800', icon: Shield, seoTips: ['ceza', 'suç', 'mahkeme', 'savunma'] },
  { value: 'is-hukuku', label: 'İş Hukuku', color: 'bg-blue-100 text-blue-800', icon: FileText, seoTips: ['işçi', 'işveren', 'iş sözleşmesi', 'tazminat'] },
  { value: 'ticaret-hukuku', label: 'Ticaret Hukuku', color: 'bg-green-100 text-green-800', icon: TrendingUp, seoTips: ['ticaret', 'şirket', 'ticari', 'sözleşme'] },
  { value: 'idare-hukuku', label: 'İdare Hukuku', color: 'bg-purple-100 text-purple-800', icon: Settings, seoTips: ['idari', 'kamu', 'belediye', 'dava'] },
  { value: 'icra-hukuku', label: 'İcra Hukuku', color: 'bg-orange-100 text-orange-800', icon: Zap, seoTips: ['icra', 'takip', 'alacak', 'haciz'] },
  { value: 'gayrimenkul-hukuku', label: 'Gayrimenkul Hukuku', color: 'bg-yellow-100 text-yellow-800', icon: Target, seoTips: ['gayrimenkul', 'tapu', 'emlak', 'arazi'] },
  { value: 'miras-hukuku', label: 'Miras Hukuku', color: 'bg-indigo-100 text-indigo-800', icon: Users, seoTips: ['miras', 'vasiyet', 'tereke', 'mirasçı'] },
  { value: 'kvkk', label: 'KVKK', color: 'bg-cyan-100 text-cyan-800', icon: Shield, seoTips: ['kvkk', 'veri', 'gizlilik', 'kişisel'] },
  { value: 'sigorta-hukuku', label: 'Sigorta Hukuku', color: 'bg-teal-100 text-teal-800', icon: FileText, seoTips: ['sigorta', 'poliçe', 'hasar', 'tazminat'] }
];

// Content Quality Metrics
const CONTENT_METRICS = {
  readability: {
    name: 'Okunabilirlik',
    icon: Eye,
    calculate: (content) => {
      const text = content.replace(/<[^>]*>/g, '');
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      if (sentences.length === 0) return 0;
      
      const avgWordsPerSentence = words.length / sentences.length;
      const avgCharsPerWord = words.join('').length / words.length;
      
      // Simplified readability score
      let score = 100 - (avgWordsPerSentence * 1.5) - (avgCharsPerWord * 2);
      return Math.max(0, Math.min(100, Math.round(score)));
    }
  },
  engagement: {
    name: 'Etkileşim Potansiyeli',
    icon: TrendingUp,
    calculate: (content, title) => {
      const text = content.replace(/<[^>]*>/g, '');
      const words = text.split(/\s+/).filter(w => w.length > 0);
      
      let score = 0;
      
      // Word count impact
      if (words.length >= 800) score += 30;
      else if (words.length >= 400) score += 20;
      else if (words.length >= 200) score += 10;
      
      // Question marks (engagement)
      const questions = (text.match(/\?/g) || []).length;
      score += Math.min(questions * 5, 20);
      
      // Emotional words
      const emotionalWords = ['önemli', 'dikkat', 'uyarı', 'fırsat', 'tehlike', 'başarı', 'kazanç'];
      const emotionalCount = emotionalWords.reduce((count, word) => {
        return count + (text.toLowerCase().match(new RegExp(word, 'g')) || []).length;
      }, 0);
      score += Math.min(emotionalCount * 3, 15);
      
      // Title quality
      if (title.includes('nasıl') || title.includes('neden') || title.includes('ne zaman')) score += 15;
      if (title.match(/\d+/)) score += 10; // Numbers in title
      
      return Math.min(100, Math.round(score));
    }
  },
  seoStrength: {
    name: 'SEO Gücü',
    icon: Target,
    calculate: (content, title, metaDesc, focusKeyword) => {
      let score = 0;
      const text = content.replace(/<[^>]*>/g, '').toLowerCase();
      const titleLower = title.toLowerCase();
      const metaLower = metaDesc.toLowerCase();
      const keywordLower = focusKeyword.toLowerCase();
      
      // Title optimization
      if (title.length >= 30 && title.length <= 60) score += 20;
      if (titleLower.includes(keywordLower)) score += 15;
      
      // Meta description
      if (metaDesc.length >= 120 && metaDesc.length <= 160) score += 15;
      if (metaLower.includes(keywordLower)) score += 10;
      
      // Content optimization
      const keywordCount = (text.match(new RegExp(keywordLower, 'g')) || []).length;
      const wordCount = text.split(/\s+/).length;
      if (wordCount > 0) {
        const density = (keywordCount / wordCount) * 100;
        if (density >= 0.5 && density <= 2.5) score += 20;
        else if (density > 0) score += 10;
      }
      
      // Content length
      if (wordCount >= 800) score += 10;
      if (wordCount >= 1200) score += 5;
      
      // Headers (assuming H2, H3 in content)
      const headers = (content.match(/<h[2-6][^>]*>/gi) || []).length;
      score += Math.min(headers * 2, 10);
      
      return Math.min(100, Math.round(score));
    }
  }
};

// Advanced Auto-Save System
const useAutoSave = (data, onSave, interval = 30000) => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const timeoutRef = useRef(null);
  const lastDataRef = useRef(null);

  const saveData = useCallback(async () => {
    if (!hasChanges || isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(data);
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, hasChanges, isSaving, onSave]);

  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
      setHasChanges(true);
      lastDataRef.current = data;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(saveData, interval);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveData, interval]);

  return { lastSaved, isSaving, hasChanges };
};

// Main Component
export default function UltraProfessionalCreatePage() {
  const router = useRouter();

  // Core State
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
    template: 'standard',
    status: 'draft',
    allowComments: true,
    scheduledAt: '',
    featuredImage: '',
    socialTitle: '',
    socialDescription: '',
    socialImage: '',
    customFields: {}
  });

  // UI State
  const [activeWorkspace, setActiveWorkspace] = useState('editor'); // editor, seo, analytics, settings
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalType, setImageModalType] = useState('featured'); // featured, social, content
  const [notifications, setNotifications] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Advanced Features State
  const [contentAnalysis, setContentAnalysis] = useState(null);
  const [seoRecommendations, setSeoRecommendations] = useState([]);
  const [writingAssist, setWritingAssist] = useState({
    suggestions: [],
    grammarCheck: [],
    styleImprovement: []
  });

  // Auto-save
  const autoSave = useAutoSave(articleData, async (data) => {
    if (data.title && data.content && data.content.length > 50) {
      await fetch('/api/admin/articles/autosave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
    }
  });

  // Current template
  const currentTemplate = ARTICLE_TEMPLATES[articleData.template];
  const currentCategory = CATEGORIES.find(cat => cat.value === articleData.category);

  // Content Metrics Calculation
  const contentMetrics = useMemo(() => {
    const metrics = {};
    Object.entries(CONTENT_METRICS).forEach(([key, metric]) => {
      metrics[key] = metric.calculate(
        articleData.content, 
        articleData.title,
        articleData.metaDescription,
        articleData.focusKeyword
      );
    });
    return metrics;
  }, [articleData.content, articleData.title, articleData.metaDescription, articleData.focusKeyword]);

  // Word count and reading time
  const wordCount = useMemo(() => {
    return articleData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
  }, [articleData.content]);

  const readingTime = useMemo(() => Math.ceil(wordCount / 200), [wordCount]);

  // Smart Input Handler
  const handleInputChange = useCallback((field, value) => {
    setArticleData(prev => {
      const newData = { ...prev, [field]: value };

      // Auto-generate slug from title
      if (field === 'title' && !prev.slug) {
        newData.slug = value
          .toLowerCase()
          .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
          .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
          .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')
          .replace(/-+/g, '-').replace(/^-|-$/g, '');
      }

      // Auto-generate meta title if empty
      if (field === 'title' && !prev.metaTitle) {
        newData.metaTitle = value.length > 60 ? value.substring(0, 57) + '...' : value;
      }

      // Auto-generate social title if empty
      if (field === 'title' && !prev.socialTitle) {
        newData.socialTitle = value;
      }

      // Template-specific optimizations
      if (field === 'template') {
        const template = ARTICLE_TEMPLATES[value];
        if (template) {
          // Adjust meta description based on template
          if (!prev.metaDescription) {
            newData.metaDescription = `${template.name} - ${template.description}`;
          }
          // Add template-specific focus keyword suggestions
          if (!prev.focusKeyword && currentCategory) {
            newData.focusKeyword = currentCategory.seoTips[0];
          }
        }
      }

      // Category-specific optimizations
      if (field === 'category') {
        const category = CATEGORIES.find(cat => cat.value === value);
        if (category && !prev.focusKeyword) {
          newData.focusKeyword = category.seoTips[0];
        }
      }

      return newData;
    });
  }, [currentCategory]);

  // Template Change Handler
  const handleTemplateChange = useCallback((templateKey) => {
    handleInputChange('template', templateKey);
    
    // Show template-specific guidance
    addNotification({
      type: 'info',
      message: `${ARTICLE_TEMPLATES[templateKey].name} şablonu seçildi. ${ARTICLE_TEMPLATES[templateKey].description}`,
      duration: 5000
    });
  }, [handleInputChange]);

  // Notification System
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = { id, ...notification };
    setNotifications(prev => [...prev, newNotification]);

    if (notification.duration) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Save Handlers
  const handleSave = useCallback(async (status = 'draft') => {
    try {
      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...articleData, status })
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          message: `Makale ${status === 'draft' ? 'kaydedildi' : 'yayınlandı'}!`,
          duration: 3000
        });

        if (status === 'published') {
          setPublishSuccess(true);
          setTimeout(() => router.push(`/admin/articles/${result.article._id}/edit`), 2000);
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'İşlem başarısız',
        duration: 5000
      });
    }
  }, [articleData, router, addNotification]);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    try {
      await handleSave('published');
    } finally {
      setIsPublishing(false);
    }
  }, [handleSave]);

  // Content Quality Analysis
  useEffect(() => {
    if (articleData.content && articleData.title) {
      const analysis = {
        metrics: contentMetrics,
        recommendations: [],
        score: Math.round(Object.values(contentMetrics).reduce((a, b) => a + b, 0) / Object.keys(contentMetrics).length)
      };

      // Generate recommendations
      if (contentMetrics.readability < 70) {
        analysis.recommendations.push({
          type: 'readability',
          message: 'Cümlelerinizi kısaltmaya çalışın. Ortalama cümle uzunluğunu azaltın.',
          priority: 'high'
        });
      }

      if (contentMetrics.seoStrength < 70) {
        analysis.recommendations.push({
          type: 'seo',
          message: 'Odak kelimeyi başlık ve içerikte daha fazla kullanın.',
          priority: 'medium'
        });
      }

      if (wordCount < currentTemplate.defaultSEO.minWordCount) {
        analysis.recommendations.push({
          type: 'length',
          message: `Bu şablon için en az ${currentTemplate.defaultSEO.minWordCount} kelime önerilir.`,
          priority: 'high'
        });
      }

      setContentAnalysis(analysis);
    }
  }, [articleData, contentMetrics, currentTemplate, wordCount]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'Enter':
            e.preventDefault();
            handlePublish();
            break;
          case '1':
            e.preventDefault();
            setActiveWorkspace('editor');
            break;
          case '2':
            e.preventDefault();
            setActiveWorkspace('seo');
            break;
          case '3':
            e.preventDefault();
            setActiveWorkspace('analytics');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleSave, handlePublish]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Ultra Professional Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${currentTemplate.color} flex items-center justify-center shadow-lg`}>
                  <currentTemplate.icon className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Yeni Makale</h1>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentCategory.color}`}>
                      {currentCategory.label}
                    </span>
                    <span>•</span>
                    <span>{currentTemplate.name}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Center - Smart Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{wordCount.toLocaleString()}</span>
                  <span className="text-gray-500">kelime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{readingTime}</span>
                  <span className="text-gray-500">dk okuma</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-green-600">{contentAnalysis?.score || 0}</span>
                  <span className="text-gray-500">puan</span>
                </div>
              </div>

              {/* Auto-save Status */}
              <div className="flex items-center gap-2 text-sm">
                {autoSave.isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
                    <span className="text-blue-600">Kaydediliyor...</span>
                  </>
                ) : autoSave.lastSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">
                      {autoSave.lastSaved.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </>
                ) : autoSave.hasChanges ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-600">Değişiklikler var</span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Önizle
              </button>

              <button
                onClick={() => handleSave('draft')}
                disabled={autoSave.isSaving}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing || !articleData.title || wordCount < 100}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg"
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Yayınlanıyor...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Yayınla
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Workspace Navigation */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'editor', label: 'Editör', icon: PenTool, shortcut: '⌘1' },
                { key: 'seo', label: 'SEO', icon: Target, shortcut: '⌘2' },
                { key: 'analytics', label: 'Analiz', icon: BarChart3, shortcut: '⌘3' },
                { key: 'settings', label: 'Ayarlar', icon: Settings, shortcut: '⌘4' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveWorkspace(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeWorkspace === tab.key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <span className="text-xs text-gray-400 ml-1">{tab.shortcut}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* Template Selector */}
              <select
                value={articleData.template}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {Object.entries(ARTICLE_TEMPLATES).map(([key, template]) => (
                  <option key={key} value={key}>{template.name}</option>
                ))}
              </select>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Tam Ekran (F11)"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-160px)] overflow-hidden">
        {/* Primary Editor Area */}
        <div className="flex-1 flex">
          <ModernArticleEditor
            initialData={articleData}
            onSave={handleSave}
            onPublish={handlePublish}
            onAutoSave={autoSave.saveData}
            template={currentTemplate}
            category={currentCategory}
            activeWorkspace={activeWorkspace}
            contentMetrics={contentMetrics}
            recommendations={contentAnalysis?.recommendations || []}
          />
        </div>

        {/* Advanced Right Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              İçerik Asistanı
            </h3>
          </div>

          {/* Content Quality Score */}
          <div className="p-4 border-b border-gray-200">
            <div className="text-center mb-4">
              <div className={`text-4xl font-bold mb-2 ${
                contentAnalysis?.score >= 80 ? 'text-green-600' : 
                contentAnalysis?.score >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {contentAnalysis?.score || 0}
              </div>
              <div className="text-sm text-gray-600">Genel Kalite Puanı</div>
            </div>

            {/* Metric Breakdown */}
            <div className="space-y-3">
              {Object.entries(CONTENT_METRICS).map(([key, metric]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <metric.icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          contentMetrics[key] >= 80 ? 'bg-green-500' : 
                          contentMetrics[key] >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${contentMetrics[key]}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">
                      {contentMetrics[key]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {contentAnalysis?.recommendations?.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-500" />
                İyileştirme Önerileri
              </h4>
              <div className="space-y-2">
                {contentAnalysis.recommendations.map((rec, index) => (
                  <div key={index} className={`p-3 rounded-lg text-sm ${
                    rec.priority === 'high' ? 'bg-red-50 border border-red-200' :
                    rec.priority === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {rec.priority === 'high' && <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />}
                      {rec.priority === 'medium' && <Clock className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />}
                      {rec.priority === 'low' && <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />}
                      <span className={
                        rec.priority === 'high' ? 'text-red-700' :
                        rec.priority === 'medium' ? 'text-yellow-700' :
                        'text-blue-700'
                      }>
                        {rec.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Template Structure Guide */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-green-500" />
              {currentTemplate.name} Yapısı
            </h4>
            <div className="space-y-2">
              {currentTemplate.structure.map((section, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    section.required ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{section.label}</div>
                    {section.required && (
                      <div className="text-xs text-red-600">Zorunlu</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-20 right-6 z-50 space-y-2 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg border-l-4 bg-white ${
              notification.type === 'success' ? 'border-green-500' :
              notification.type === 'error' ? 'border-red-500' :
              notification.type === 'warning' ? 'border-yellow-500' :
              'border-blue-500'
            }`}
          >
            <div className="flex items-start gap-3">
              {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
              {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
              {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />}
              {notification.type === 'info' && <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-900' :
                  notification.type === 'error' ? 'text-red-900' :
                  notification.type === 'warning' ? 'text-yellow-900' :
                  'text-blue-900'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Success Animation */}
      {publishSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Makale Yayınlandı! 🎉</h3>
            <p className="text-gray-600 mb-4">Makale başarıyla yayınlandı ve düzenleme sayfasına yönlendiriliyorsunuz.</p>
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageSelect={(url, alt) => {
          if (imageModalType === 'featured') {
            handleInputChange('featuredImage', url);
          } else if (imageModalType === 'social') {
            handleInputChange('socialImage', url);
          }
          setIsImageModalOpen(false);
        }}
      />
    </div>
  );
}