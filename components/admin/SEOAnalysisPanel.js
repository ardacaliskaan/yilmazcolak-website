// components/admin/SEOAnalysisPanel.js - WordPress Benzeri SEO Analizi
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  TrendingUp, 
  Eye, 
  Clock, 
  Target,
  Search,
  Hash,
  FileText,
  Link,
  Image as ImageIcon,
  BarChart3,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Award,
  AlertTriangle
} from 'lucide-react';

const SEOAnalysisPanel = ({ 
  title = '', 
  content = '', 
  excerpt = '', 
  metaTitle = '', 
  metaDescription = '', 
  focusKeyword = '', 
  tags = [],
  featuredImage = '',
  slug = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [analysis, setAnalysis] = useState({});
  const [overallScore, setOverallScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // SEO Rules with detailed analysis
  const seoAnalysis = useMemo(() => {
    const rules = {
      // Basic SEO (40 points)
      titleLength: {
        weight: 10,
        check: () => title.length >= 30 && title.length <= 60,
        score: () => {
          if (title.length === 0) return 0;
          if (title.length < 30) return Math.max(0, (title.length / 30) * 100 - 20);
          if (title.length > 60) return Math.max(0, 100 - ((title.length - 60) * 2));
          return 100;
        },
        status: () => {
          if (title.length === 0) return 'critical';
          if (title.length < 30 || title.length > 60) return 'warning';
          return 'good';
        },
        message: () => {
          if (title.length === 0) return 'Makale başlığı eksik';
          if (title.length < 30) return `Başlık çok kısa (${title.length}/30-60 karakter)`;
          if (title.length > 60) return `Başlık çok uzun (${title.length}/30-60 karakter)`;
          return `Başlık uzunluğu ideal (${title.length} karakter)`;
        },
        suggestion: () => {
          if (title.length === 0) return 'Makale için açıklayıcı bir başlık yazın.';
          if (title.length < 30) return 'Başlığı daha açıklayıcı hale getirmek için genişletin.';
          if (title.length > 60) return 'Başlığı kısaltın, arama motorları 60 karakterden fazlasını göstermez.';
          return 'Başlık uzunluğu mükemmel!';
        }
      },

      metaDescriptionLength: {
        weight: 10,
        check: () => metaDescription.length >= 120 && metaDescription.length <= 160,
        score: () => {
          if (metaDescription.length === 0) return 0;
          if (metaDescription.length < 120) return Math.max(0, (metaDescription.length / 120) * 100 - 30);
          if (metaDescription.length > 160) return Math.max(0, 100 - ((metaDescription.length - 160) * 3));
          return 100;
        },
        status: () => {
          if (metaDescription.length === 0) return 'critical';
          if (metaDescription.length < 120 || metaDescription.length > 160) return 'warning';
          return 'good';
        },
        message: () => {
          if (metaDescription.length === 0) return 'Meta açıklama eksik';
          if (metaDescription.length < 120) return `Meta açıklama çok kısa (${metaDescription.length}/120-160 karakter)`;
          if (metaDescription.length > 160) return `Meta açıklama çok uzun (${metaDescription.length}/120-160 karakter)`;
          return `Meta açıklama uzunluğu ideal (${metaDescription.length} karakter)`;
        },
        suggestion: () => {
          if (metaDescription.length === 0) return 'Arama sonuçlarında görünecek açıklayıcı bir meta açıklama yazın.';
          if (metaDescription.length < 120) return 'Meta açıklamayı daha detaylı hale getirin.';
          if (metaDescription.length > 160) return 'Meta açıklamayı kısaltın, arama motorları keser.';
          return 'Meta açıklama uzunluğu mükemmel!';
        }
      },

      focusKeywordInTitle: {
        weight: 10,
        check: () => focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase()),
        score: () => {
          if (!focusKeyword) return 0;
          return title.toLowerCase().includes(focusKeyword.toLowerCase()) ? 100 : 0;
        },
        status: () => {
          if (!focusKeyword) return 'warning';
          return title.toLowerCase().includes(focusKeyword.toLowerCase()) ? 'good' : 'critical';
        },
        message: () => {
          if (!focusKeyword) return 'Ana anahtar kelime belirtilmemiş';
          return title.toLowerCase().includes(focusKeyword.toLowerCase()) 
            ? 'Ana anahtar kelime başlıkta bulunuyor ✓'
            : 'Ana anahtar kelime başlıkta bulunamadı';
        },
        suggestion: () => {
          if (!focusKeyword) return 'SEO için bir ana anahtar kelime belirleyin.';
          return title.toLowerCase().includes(focusKeyword.toLowerCase())
            ? 'Harika! Ana anahtar kelime başlıkta yer alıyor.'
            : 'Ana anahtar kelimeyi başlığa dahil etmeyi düşünün.';
        }
      },

      focusKeywordInMeta: {
        weight: 10,
        check: () => focusKeyword && metaDescription.toLowerCase().includes(focusKeyword.toLowerCase()),
        score: () => {
          if (!focusKeyword) return 0;
          return metaDescription.toLowerCase().includes(focusKeyword.toLowerCase()) ? 100 : 0;
        },
        status: () => {
          if (!focusKeyword) return 'warning';
          return metaDescription.toLowerCase().includes(focusKeyword.toLowerCase()) ? 'good' : 'warning';
        },
        message: () => {
          if (!focusKeyword) return 'Ana anahtar kelime belirtilmemiş';
          return metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())
            ? 'Ana anahtar kelime meta açıklamada bulunuyor ✓'
            : 'Ana anahtar kelime meta açıklamada bulunamadı';
        },
        suggestion: () => {
          if (!focusKeyword) return 'Ana anahtar kelime belirleyin.';
          return metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())
            ? 'Mükemmel! Meta açıklamada ana anahtar kelime var.'
            : 'Meta açıklamaya ana anahtar kelimeyi ekleyin.';
        }
      },

      // Content Quality (30 points)
      contentLength: {
        weight: 15,
        check: () => {
          const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
          return wordCount >= 300;
        },
        score: () => {
          const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
          if (wordCount === 0) return 0;
          if (wordCount < 300) return (wordCount / 300) * 100;
          if (wordCount >= 1000) return 100;
          return 80 + ((wordCount - 300) / 700) * 20;
        },
        status: () => {
          const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
          if (wordCount < 300) return 'critical';
          if (wordCount < 600) return 'warning';
          return 'good';
        },
        message: () => {
          const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
          if (wordCount < 300) return `İçerik çok kısa (${wordCount} kelime)`;
          if (wordCount < 600) return `İyi uzunluk (${wordCount} kelime)`;
          return `Mükemmel uzunluk (${wordCount} kelime)`;
        },
        suggestion: () => {
          const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
          if (wordCount < 300) return 'En az 300 kelimelik içerik yazın. Detaylı ve faydalı bilgi verin.';
          if (wordCount < 600) return 'İçeriği daha da detaylandırabilirsiniz.';
          return 'İçerik uzunluğu SEO için ideal!';
        }
      },

      focusKeywordInContent: {
        weight: 10,
        check: () => {
          if (!focusKeyword) return false;
          const contentText = content.replace(/<[^>]*>/g, '').toLowerCase();
          const keyword = focusKeyword.toLowerCase();
          const matches = (contentText.match(new RegExp(keyword, 'g')) || []).length;
          const wordCount = contentText.split(/\s+/).filter(w => w.length > 0).length;
          const density = (matches / wordCount) * 100;
          return density >= 0.5 && density <= 3;
        },
        score: () => {
          if (!focusKeyword) return 0;
          const contentText = content.replace(/<[^>]*>/g, '').toLowerCase();
          const keyword = focusKeyword.toLowerCase();
          const matches = (contentText.match(new RegExp(keyword, 'g')) || []).length;
          const wordCount = contentText.split(/\s+/).filter(w => w.length > 0).length;
          
          if (wordCount === 0) return 0;
          
          const density = (matches / wordCount) * 100;
          
          if (density === 0) return 0;
          if (density < 0.5) return Math.max(0, density * 100);
          if (density > 3) return Math.max(0, 100 - (density - 3) * 20);
          return 100;
        },
        status: () => {
          if (!focusKeyword) return 'warning';
          const contentText = content.replace(/<[^>]*>/g, '').toLowerCase();
          const keyword = focusKeyword.toLowerCase();
          const matches = (contentText.match(new RegExp(keyword, 'g')) || []).length;
          const wordCount = contentText.split(/\s+/).filter(w => w.length > 0).length;
          
          if (wordCount === 0) return 'critical';
          
          const density = (matches / wordCount) * 100;
          
          if (density === 0) return 'critical';
          if (density < 0.5 || density > 3) return 'warning';
          return 'good';
        },
        message: () => {
          if (!focusKeyword) return 'Ana anahtar kelime belirtilmemiş';
          
          const contentText = content.replace(/<[^>]*>/g, '').toLowerCase();
          const keyword = focusKeyword.toLowerCase();
          const matches = (contentText.match(new RegExp(keyword, 'g')) || []).length;
          const wordCount = contentText.split(/\s+/).filter(w => w.length > 0).length;
          
          if (wordCount === 0) return 'İçerik henüz yazılmamış';
          
          const density = (matches / wordCount) * 100;
          
          if (density === 0) return 'Ana anahtar kelime içerikte bulunamadı';
          if (density < 0.5) return `Anahtar kelime yoğunluğu düşük (%${density.toFixed(2)})`;
          if (density > 3) return `Anahtar kelime yoğunluğu yüksek (%${density.toFixed(2)})`;
          return `Anahtar kelime yoğunluğu ideal (%${density.toFixed(2)})`;
        },
        suggestion: () => {
          if (!focusKeyword) return 'Ana anahtar kelime belirleyin.';
          
          const contentText = content.replace(/<[^>]*>/g, '').toLowerCase();
          const keyword = focusKeyword.toLowerCase();
          const matches = (contentText.match(new RegExp(keyword, 'g')) || []).length;
          const wordCount = contentText.split(/\s+/).filter(w => w.length > 0).length;
          
          if (wordCount === 0) return 'İçerik yazın ve ana anahtar kelimeyi kullanın.';
          
          const density = (matches / wordCount) * 100;
          
          if (density === 0) return 'Ana anahtar kelimeyi içerikte doğal bir şekilde kullanın.';
          if (density < 0.5) return 'Ana anahtar kelimeyi biraz daha sık kullanın.';
          if (density > 3) return 'Anahtar kelime kullanımını azaltın, doğal olmalı.';
          return 'Anahtar kelime kullanımı mükemmel!';
        }
      },

      headingStructure: {
        weight: 5,
        check: () => {
          const hasH1 = /<h1[^>]*>/i.test(content);
          const hasH2 = /<h2[^>]*>/i.test(content);
          return hasH1 && hasH2;
        },
        score: () => {
          const hasH1 = /<h1[^>]*>/i.test(content);
          const hasH2 = /<h2[^>]*>/i.test(content);
          const hasH3 = /<h3[^>]*>/i.test(content);
          
          let score = 0;
          if (hasH1) score += 40;
          if (hasH2) score += 40;
          if (hasH3) score += 20;
          
          return Math.min(score, 100);
        },
        status: () => {
          const hasH1 = /<h1[^>]*>/i.test(content);
          const hasH2 = /<h2[^>]*>/i.test(content);
          
          if (hasH1 && hasH2) return 'good';
          if (hasH1 || hasH2) return 'warning';
          return 'critical';
        },
        message: () => {
          const hasH1 = /<h1[^>]*>/i.test(content);
          const hasH2 = /<h2[^>]*>/i.test(content);
          const hasH3 = /<h3[^>]*>/i.test(content);
          
          if (hasH1 && hasH2 && hasH3) return 'Mükemmel başlık yapısı (H1, H2, H3)';
          if (hasH1 && hasH2) return 'İyi başlık yapısı (H1, H2)';
          if (hasH1) return 'Sadece H1 başlığı var';
          if (hasH2) return 'H1 başlığı eksik, sadece H2 var';
          return 'Başlık yapısı eksik';
        },
        suggestion: () => {
          const hasH1 = /<h1[^>]*>/i.test(content);
          const hasH2 = /<h2[^>]*>/i.test(content);
          
          if (hasH1 && hasH2) return 'Başlık yapınız mükemmel!';
          if (hasH1) return 'H2 alt başlıkları ekleyerek içeriği bölümleyin.';
          if (hasH2) return 'Ana H1 başlığı ekleyin.';
          return 'H1 ana başlık ve H2 alt başlıklar ekleyin.';
        }
      },

      // Technical SEO (20 points)
      featuredImagePresent: {
        weight: 8,
        check: () => !!featuredImage,
        score: () => featuredImage ? 100 : 0,
        status: () => featuredImage ? 'good' : 'warning',
        message: () => featuredImage ? 'Öne çıkan görsel ayarlandı ✓' : 'Öne çıkan görsel eksik',
        suggestion: () => featuredImage 
          ? 'Harika! Öne çıkan görseliniz var.' 
          : 'Makaleniz için çekici bir öne çıkan görsel seçin.'
      },

      slugOptimization: {
        weight: 7,
        check: () => {
          if (!slug) return false;
          const isOptimal = slug.length >= 3 && slug.length <= 75 && 
                          !/[^a-z0-9-]/.test(slug) && 
                          !slug.startsWith('-') && 
                          !slug.endsWith('-');
          return isOptimal;
        },
        score: () => {
          if (!slug) return 0;
          let score = 100;
          
          if (slug.length < 3) score -= 30;
          if (slug.length > 75) score -= 20;
          if (/[^a-z0-9-]/.test(slug)) score -= 25;
          if (slug.startsWith('-') || slug.endsWith('-')) score -= 15;
          if (slug.includes('--')) score -= 10;
          
          return Math.max(score, 0);
        },
        status: () => {
          if (!slug) return 'critical';
          const isOptimal = slug.length >= 3 && slug.length <= 75 && 
                          !/[^a-z0-9-]/.test(slug) && 
                          !slug.startsWith('-') && 
                          !slug.endsWith('-');
          return isOptimal ? 'good' : 'warning';
        },
        message: () => {
          if (!slug) return 'URL slug eksik';
          const issues = [];
          
          if (slug.length < 3) issues.push('çok kısa');
          if (slug.length > 75) issues.push('çok uzun');
          if (/[^a-z0-9-]/.test(slug)) issues.push('geçersiz karakter');
          if (slug.startsWith('-') || slug.endsWith('-')) issues.push('- ile başlayıp bitiyor');
          
          return issues.length === 0 ? 'URL slug optimize edilmiş ✓' : `URL slug sorunları: ${issues.join(', ')}`;
        },
        suggestion: () => {
          if (!slug) return 'SEO dostu bir URL slug oluşturun.';
          const issues = [];
          
          if (slug.length < 3) issues.push('Slug\'ı uzatın');
          if (slug.length > 75) issues.push('Slug\'ı kısaltın');
          if (/[^a-z0-9-]/.test(slug)) issues.push('Sadece harf, rakam ve tire kullanın');
          
          return issues.length === 0 ? 'URL slug mükemmel!' : issues.join('. ');
        }
      },

      internalLinks: {
        weight: 5,
        check: () => {
          const linkCount = (content.match(/<a[^>]+href=[^>]*>/gi) || []).length;
          return linkCount >= 2;
        },
        score: () => {
          const linkCount = (content.match(/<a[^>]+href=[^>]*>/gi) || []).length;
          if (linkCount === 0) return 0;
          if (linkCount >= 5) return 100;
          return (linkCount / 5) * 100;
        },
        status: () => {
          const linkCount = (content.match(/<a[^>]+href=[^>]*>/gi) || []).length;
          if (linkCount === 0) return 'warning';
          if (linkCount < 2) return 'warning';
          return 'good';
        },
        message: () => {
          const linkCount = (content.match(/<a[^>]+href=[^>]*>/gi) || []).length;
          if (linkCount === 0) return 'İç link yok';
          return `${linkCount} link var`;
        },
        suggestion: () => {
          const linkCount = (content.match(/<a[^>]+href=[^>]*>/gi) || []).length;
          if (linkCount < 2) return 'İlgili sayfalara en az 2-3 iç link ekleyin.';
          return 'Link yapısı iyi!';
        }
      }
    };

    return rules;
  }, [title, content, excerpt, metaTitle, metaDescription, focusKeyword, tags, featuredImage, slug]);

  // Calculate overall score
  const calculateOverallScore = useCallback(() => {
    let totalScore = 0;
    let totalWeight = 0;

    Object.values(seoAnalysis).forEach(rule => {
      const score = rule.score();
      totalScore += (score * rule.weight) / 100;
      totalWeight += rule.weight;
    });

    return Math.round((totalScore / totalWeight) * 100);
  }, [seoAnalysis]);

  // Update analysis
  useEffect(() => {
    setIsAnalyzing(true);
    
    const analysisResults = {};
    Object.entries(seoAnalysis).forEach(([key, rule]) => {
      analysisResults[key] = {
        status: rule.status(),
        message: rule.message(),
        suggestion: rule.suggestion(),
        score: rule.score(),
        weight: rule.weight
      };
    });

    setAnalysis(analysisResults);
    setOverallScore(calculateOverallScore());
    setIsAnalyzing(false);
  }, [seoAnalysis, calculateOverallScore]);

  // Get score color and icon
  const getScoreDisplay = (score) => {
    if (score >= 80) return { color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle };
    if (score >= 60) return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertCircle };
    return { color: 'text-red-600', bg: 'bg-red-100', icon: XCircle };
  };

  const overallDisplay = getScoreDisplay(overallScore);
  const ScoreIcon = overallDisplay.icon;

  // Categorize analysis results
  const goodItems = Object.entries(analysis).filter(([_, item]) => item.status === 'good');
  const warningItems = Object.entries(analysis).filter(([_, item]) => item.status === 'warning');
  const criticalItems = Object.entries(analysis).filter(([_, item]) => item.status === 'critical');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div 
        className="p-6 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${overallDisplay.bg}`}>
              <ScoreIcon className={`w-6 h-6 ${overallDisplay.color}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">SEO Analizi</h3>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${overallDisplay.color}`}>
                    {overallScore}
                  </div>
                  <div className="text-gray-500">/100</div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    {goodItems.length} İyi
                  </span>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <AlertCircle className="w-4 h-4" />
                    {warningItems.length} Uyarı
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <XCircle className="w-4 h-4" />
                    {criticalItems.length} Kritik
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAnalyzing && <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />}
            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>SEO Skoru</span>
            <span>{overallScore}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                overallScore >= 80 ? 'bg-green-500' : 
                overallScore >= 60 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${overallScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Analysis Details */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Critical Issues */}
          {criticalItems.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Kritik Sorunlar
              </h4>
              <div className="space-y-3">
                {criticalItems.map(([key, item]) => (
                  <div key={key} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-red-900">{item.message}</p>
                        <p className="text-sm text-red-700 mt-1">{item.suggestion}</p>
                      </div>
                      <div className="text-sm font-medium text-red-600">
                        {Math.round(item.score)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {warningItems.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Uyarılar
              </h4>
              <div className="space-y-3">
                {warningItems.map(([key, item]) => (
                  <div key={key} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-yellow-900">{item.message}</p>
                        <p className="text-sm text-yellow-700 mt-1">{item.suggestion}</p>
                      </div>
                      <div className="text-sm font-medium text-yellow-600">
                        {Math.round(item.score)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Good Items */}
          {goodItems.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Başarılı Öğeler
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goodItems.map(([key, item]) => (
                  <div key={key} className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <p className="text-sm font-medium text-green-900 flex-1">{item.message}</p>
                      <div className="text-sm font-medium text-green-600">
                        {Math.round(item.score)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Stats */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              İçerik İstatistikleri
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length}
                </div>
                <div className="text-sm text-gray-600">Kelime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length / 200)}
                </div>
                <div className="text-sm text-gray-600">dk Okuma</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {content.replace(/<[^>]*>/g, '').length}
                </div>
                <div className="text-sm text-gray-600">Karakter</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {(content.match(/<h[1-6][^>]*>/gi) || []).length}
                </div>
                <div className="text-sm text-gray-600">Başlık</div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              SEO İpuçları
            </h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                Başlığınızda ana anahtar kelimeyi en başa koymaya çalışın
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                İçerikte H2, H3 başlıkları kullanarak yapıyı iyileştirin
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                İlgili makalelerinize iç linkler ekleyin
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                Görsellere açıklayıcı alt text&apos;ler ekleyin
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                Meta açıklamada özgün ve çekici açıklamalar kullanın
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOAnalysisPanel;