// app/admin/articles/[id]/edit/page.js - ULTRA PROFESSIONAL ENTERPRISE LEVEL
'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Save, Send, Eye, ArrowLeft, CheckCircle, AlertTriangle, Clock, 
  Zap, Target, TrendingUp, BarChart3, FileText, Settings, Globe,
  Sparkles, Brain, Layers, Hash, Tag, Calendar, Users, Shield,
  RefreshCw, BookOpen, PenTool, Palette, Image as ImageIcon,
  Video, Mic, Link2, Code, Table, Type, AlignLeft, AlignCenter,
  AlignRight, List, ListOrdered, Quote, Bold, Italic, Underline,
  Strikethrough, Subscript, Superscript, Minus, Plus, X, Maximize,
  Minimize, Copy, Download, Upload, Search, Filter, SortAsc,
  History, GitBranch, ExternalLink, Archive, Trash2, MoreHorizontal,
  Activity, MessageSquare, Share, Bookmark
} from 'lucide-react';

import ModernArticleEditor from '@/components/admin/articles/ModernArticleEditor';
import ImageUploadModal from '@/components/admin/ImageUploadModal';

// Advanced Template Configurations (same as create)
const ARTICLE_TEMPLATES = {
  'standard': {
    name: 'Standart Makale',
    description: 'Genel blog yazıları için',
    icon: FileText,
    color: 'from-gray-500 to-gray-600',
    defaultSEO: { focusKeywordDensity: 1.5, minWordCount: 800, maxTitleLength: 60 }
  },
  'legal-article': {
    name: 'Hukuki Makale',
    description: 'Detaylı hukuki analizler',
    icon: Shield,
    color: 'from-blue-600 to-indigo-600',
    defaultSEO: { focusKeywordDensity: 2.0, minWordCount: 1200, maxTitleLength: 65 }
  },
  'case-study': {
    name: 'Vaka Çalışması',
    description: 'Gerçek dava örnekleri',
    icon: BookOpen,
    color: 'from-green-600 to-emerald-600',
    defaultSEO: { focusKeywordDensity: 1.8, minWordCount: 1000, maxTitleLength: 70 }
  },
  'legal-guide': {
    name: 'Hukuki Rehber',
    description: 'Adım adım kılavuzlar',
    icon: Target,
    color: 'from-purple-600 to-violet-600',
    defaultSEO: { focusKeywordDensity: 2.2, minWordCount: 1500, maxTitleLength: 55 }
  },
  'news': {
    name: 'Hukuk Haberi',
    description: 'Güncel gelişmeler',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    defaultSEO: { focusKeywordDensity: 1.2, minWordCount: 400, maxTitleLength: 50 }
  }
};

// Categories (same as create)
const CATEGORIES = [
  { value: 'genel', label: 'Genel', color: 'bg-gray-100 text-gray-800', icon: Globe },
  { value: 'aile-hukuku', label: 'Aile Hukuku', color: 'bg-pink-100 text-pink-800', icon: Users },
  { value: 'ceza-hukuku', label: 'Ceza Hukuku', color: 'bg-red-100 text-red-800', icon: Shield },
  { value: 'is-hukuku', label: 'İş Hukuku', color: 'bg-blue-100 text-blue-800', icon: FileText },
  { value: 'ticaret-hukuku', label: 'Ticaret Hukuku', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  { value: 'idare-hukuku', label: 'İdare Hukuku', color: 'bg-purple-100 text-purple-800', icon: Settings },
  { value: 'icra-hukuku', label: 'İcra Hukuku', color: 'bg-orange-100 text-orange-800', icon: Zap },
  { value: 'gayrimenkul-hukuku', label: 'Gayrimenkul Hukuku', color: 'bg-yellow-100 text-yellow-800', icon: Target },
  { value: 'miras-hukuku', label: 'Miras Hukuku', color: 'bg-indigo-100 text-indigo-800', icon: Users },
  { value: 'kvkk', label: 'KVKK', color: 'bg-cyan-100 text-cyan-800', icon: Shield },
  { value: 'sigorta-hukuku', label: 'Sigorta Hukuku', color: 'bg-teal-100 text-teal-800', icon: FileText }
];

// Content Quality Metrics (same calculation logic)
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
      if (words.length >= 800) score += 30;
      else if (words.length >= 400) score += 20;
      else if (words.length >= 200) score += 10;
      const questions = (text.match(/\?/g) || []).length;
      score += Math.min(questions * 5, 20);
      if (title.includes('nasıl') || title.includes('neden')) score += 15;
      return Math.min(100, Math.round(score));
    }
  },
  seoStrength: {
    name: 'SEO Gücü',
    icon: Target,
    calculate: (content, title, metaDesc, focusKeyword) => {
      let score = 0;
      if (title.length >= 30 && title.length <= 60) score += 20;
      if (title.toLowerCase().includes(focusKeyword.toLowerCase())) score += 15;
      if (metaDesc.length >= 120 && metaDesc.length <= 160) score += 15;
      return Math.min(100, Math.round(score));
    }
  }
};

// Advanced Auto-Save Hook (same as create)
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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(saveData, interval);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, saveData, interval]);

  return { lastSaved, isSaving, hasChanges };
};

// Main Edit Component
export default function UltraProfessionalEditPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id;

  // Core State
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articleData, setArticleData] = useState({});

  // UI State
  const [activeWorkspace, setActiveWorkspace] = useState('editor');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalType, setImageModalType] = useState('featured');
  const [notifications, setNotifications] = useState([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  // Advanced Features State
  const [contentAnalysis, setContentAnalysis] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [editHistory, setEditHistory] = useState([]);
  const [comments, setComments] = useState([]);

  // Load article data
  useEffect(() => {
    const fetchArticle = async () => {
      if (!articleId) return;

      setLoading(true);
      try {
        const [articleResponse, analyticsResponse, historyResponse] = await Promise.all([
          fetch(`/api/admin/articles/${articleId}`, { credentials: 'include' }),
          fetch(`/api/admin/articles/${articleId}/analytics`, { credentials: 'include' }).catch(() => null),
          fetch(`/api/admin/articles/${articleId}/history`, { credentials: 'include' }).catch(() => null)
        ]);

        if (!articleResponse.ok) {
          throw new Error(`Article not found: ${articleResponse.status}`);
        }

        const articleResult = await articleResponse.json();
        
        if (articleResult.success) {
          setArticle(articleResult.article);
          setArticleData({
            title: articleResult.article.title || '',
            slug: articleResult.article.slug || '',
            excerpt: articleResult.article.excerpt || '',
            content: articleResult.article.content || '',
            metaTitle: articleResult.article.metaTitle || '',
            metaDescription: articleResult.article.metaDescription || '',
            focusKeyword: articleResult.article.focusKeyword || '',
            keywords: articleResult.article.keywords || [],
            tags: articleResult.article.tags || [],
            category: articleResult.article.category || 'genel',
            template: articleResult.article.template || 'standard',
            status: articleResult.article.status || 'draft',
            allowComments: articleResult.article.allowComments !== false,
            scheduledAt: articleResult.article.scheduledAt || '',
            featuredImage: articleResult.article.featuredImage || '',
            socialTitle: articleResult.article.socialTitle || '',
            socialDescription: articleResult.article.socialDescription || '',
            socialImage: articleResult.article.socialImage || ''
          });

          // Load analytics if available
          if (analyticsResponse && analyticsResponse.ok) {
            const analytics = await analyticsResponse.json();
            if (analytics.success) {
              setPerformanceMetrics(analytics.metrics);
            }
          }

          // Load edit history if available
          if (historyResponse && historyResponse.ok) {
            const history = await historyResponse.json();
            if (history.success) {
              setEditHistory(history.history || []);
            }
          }

        } else {
          throw new Error(articleResult.message || 'Failed to load article');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  // Auto-save
  const autoSave = useAutoSave(articleData, async (data) => {
    if (data.title && data.content && data.content.length > 50) {
      await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...data, status: data.status || 'draft' })
      });
    }
  });

  // Current template and category
  const currentTemplate = ARTICLE_TEMPLATES[articleData.template] || ARTICLE_TEMPLATES.standard;
  const currentCategory = CATEGORIES.find(cat => cat.value === articleData.category) || CATEGORIES[0];

  // Content Metrics
  const contentMetrics = useMemo(() => {
    const metrics = {};
    Object.entries(CONTENT_METRICS).forEach(([key, metric]) => {
      metrics[key] = metric.calculate(
        articleData.content || '', 
        articleData.title || '',
        articleData.metaDescription || '',
        articleData.focusKeyword || ''
      );
    });
    return metrics;
  }, [articleData]);

  // Word count and reading time
  const wordCount = useMemo(() => {
    return (articleData.content || '').replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
  }, [articleData.content]);

  const readingTime = useMemo(() => Math.ceil(wordCount / 200), [wordCount]);

  // Input handler
  const handleInputChange = useCallback((field, value) => {
    setArticleData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Notification system
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

  // Save handlers
  const handleSave = useCallback(async (status) => {
    try {
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...articleData, status: status || articleData.status })
      });

      const result = await response.json();

      if (result.success) {
        setArticle(result.article);
        addNotification({
          type: 'success',
          message: `Makale ${status === 'published' ? 'yayınlandı' : 'güncellendi'}!`,
          duration: 3000
        });
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
  }, [articleId, articleData, addNotification]);

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    try {
      await handleSave('published');
    } finally {
      setIsPublishing(false);
    }
  }, [handleSave]);

  const handleArchive = useCallback(async () => {
    if (!confirm('Bu makaleyi arşivlemek istediğinize emin misiniz?')) return;
    
    setIsArchiving(true);
    try {
      await handleSave('archived');
    } finally {
      setIsArchiving(false);
    }
  }, [handleSave]);

  // Content analysis
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
          message: 'Cümlelerinizi kısaltmaya çalışın.',
          priority: 'high'
        });
      }

      if (contentMetrics.seoStrength < 70) {
        analysis.recommendations.push({
          type: 'seo',
          message: 'SEO optimizasyonu geliştirilebilir.',
          priority: 'medium'
        });
      }

      setContentAnalysis(analysis);
    }
  }, [articleData, contentMetrics]);

  // Keyboard shortcuts
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
        }
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleSave, handlePublish]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Makale Yükleniyor</h2>
          <p className="text-gray-600">Lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Makale Yüklenemedi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/articles')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Makaleler Listesine Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Ultra Professional Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <button
              onClick={() => router.push('/admin/articles')}
              className="hover:text-blue-600 transition-colors"
            >
              Makaleler
            </button>
            <span>/</span>
            <span className="text-gray-900">Düzenle</span>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-md">
              {article?.title}
            </span>
          </div>

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
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    Makale Düzenle
                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      article?.status === 'published' ? 'bg-green-100 text-green-800' :
                      article?.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      article?.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {article?.status === 'published' ? 'Yayında' :
                       article?.status === 'draft' ? 'Taslak' :
                       article?.status === 'scheduled' ? 'Zamanlanmış' : 'Arşiv'}
                    </span>
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentCategory.color}`}>
                      {currentCategory.label}
                    </span>
                    <span>•</span>
                    <span>{currentTemplate.name}</span>
                    <span>•</span>
                    <span>Son güncelleme: {new Date(article?.updatedAt).toLocaleDateString('tr-TR')}</span>
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
                {performanceMetrics && (
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-blue-600">{performanceMetrics.views || 0}</span>
                    <span className="text-gray-500">görüntüleme</span>
                  </div>
                )}
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
              {/* View Published Article */}
              {article?.status === 'published' && (
                <button
                  onClick={() => window.open(`/makaleler/${article.slug}`, '_blank')}
                  className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Görüntüle
                </button>
              )}

              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Önizle
              </button>

              <button
                onClick={() => handleSave(articleData.status)}
                disabled={autoSave.isSaving}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Güncelle
              </button>

              {article?.status !== 'published' ? (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || !articleData.title || wordCount < 100}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-lg"
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
              ) : (
                <button
                  onClick={handleArchive}
                  disabled={isArchiving}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {isArchiving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Arşivleniyor...
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 mr-2" />
                      Arşivle
                    </>
                  )}
                </button>
              )}

              {/* More Actions Dropdown */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Workspace Navigation */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {[
                { key: 'editor', label: 'Editör', icon: PenTool, shortcut: '⌘1' },
                { key: 'seo', label: 'SEO', icon: Target, shortcut: '⌘2' },
                { key: 'analytics', label: 'Analiz', icon: BarChart3, shortcut: '⌘3' },
                { key: 'history', label: 'Geçmiş', icon: History, shortcut: '⌘4' },
                { key: 'settings', label: 'Ayarlar', icon: Settings, shortcut: '⌘5' }
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
      <div className="flex h-[calc(100vh-180px)] overflow-hidden">
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
            isEdit={true}
            originalArticle={article}
          />
        </div>

        {/* Advanced Right Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              {activeWorkspace === 'analytics' ? (
                <>
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Performans Analizi
                </>
              ) : activeWorkspace === 'history' ? (
                <>
                  <History className="w-5 h-5 text-purple-500" />
                  Düzenleme Geçmişi
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  İçerik Asistanı
                </>
              )}
            </h3>
          </div>

          {/* Panel Content */}
          {activeWorkspace === 'analytics' && performanceMetrics ? (
            <div className="p-4 space-y-4">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{performanceMetrics.views || 0}</div>
                  <div className="text-xs text-gray-600">Görüntüleme</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{performanceMetrics.likes || 0}</div>
                  <div className="text-xs text-gray-600">Beğeni</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{performanceMetrics.shares || 0}</div>
                  <div className="text-xs text-gray-600">Paylaşım</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{performanceMetrics.comments || 0}</div>
                  <div className="text-xs text-gray-600">Yorum</div>
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-medium text-gray-900 mb-3">Trafik Kaynakları</h4>
                <div className="space-y-2">
                  {performanceMetrics.sources?.map((source, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{source.name}</span>
                      <span className="text-sm font-medium">{source.visits}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeWorkspace === 'history' ? (
            <div className="p-4 space-y-4">
              {/* Edit History */}
              <div className="space-y-3">
                {editHistory.length > 0 ? editHistory.map((edit, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <GitBranch className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{edit.action}</div>
                      <div className="text-xs text-gray-500">
                        {edit.user} • {new Date(edit.createdAt).toLocaleString('tr-TR')}
                      </div>
                      {edit.changes && (
                        <div className="text-xs text-gray-400 mt-1">
                          {edit.changes.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-gray-500">
                    <History className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Henüz düzenleme geçmişi yok</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Content Quality Score */}
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

              {/* Recommendations */}
              {contentAnalysis?.recommendations?.length > 0 && (
                <div className="border-t pt-4">
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
            </div>
          )}
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