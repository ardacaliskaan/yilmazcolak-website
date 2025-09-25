'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronUp
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
  const [analysis, setAnalysis] = useState({});
  const [overallScore, setOverallScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    content: true,
    technical: true,
    readability: true
  });

  // SEO Rules and scoring
  const seoRules = {
    // Basic SEO (25 points)
    titleLength: {
      weight: 8,
      check: (title) => title.length >= 30 && title.length <= 60,
      message: 'Başlık uzunluğu 30-60 karakter arasında olmalı',
      current: title.length,
      optimal: '30-60'
    },
    metaDescription: {
      weight: 8,
      check: (desc) => desc.length >= 120 && desc.length <= 160,
      message: 'Meta açıklama 120-160 karakter arasında olmalı',
      current: metaDescription.length,
      optimal: '120-160'
    },
    focusKeywordInTitle: {
      weight: 9,
      check: (keyword, title) => keyword && title.toLowerCase().includes(keyword.toLowerCase()),
      message: 'Ana anahtar kelime başlıkta bulunmalı',
      current: focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase()) ? 'Var' : 'Yok',
      optimal: 'Var'
    },

    // Content SEO (35 points)
    contentLength: {
      weight: 12,
      check: (content) => {
        const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length;
        return wordCount >= 300;
      },
      message: 'İçerik en az 300 kelime olmalı',
      current: content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length,
      optimal: '300+'
    },
    focusKeywordInContent: {
      weight: 10,
      check: (keyword, content) => {
        if (!keyword) return false;
        const plainContent = content.replace(/<[^>]*>/g, '');
        const keywordCount = (plainContent.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
        const wordCount = plainContent.split(/\s+/).filter(w => w.length > 0).length;
        const density = (keywordCount / wordCount) * 100;
        return density >= 0.5 && density <= 2.5;
      },
      message: 'Ana anahtar kelime yoğunluğu %0.5-2.5 arasında olmalı',
      current: (() => {
        if (!focusKeyword) return 0;
        const plainContent = content.replace(/<[^>]*>/g, '');
        const keywordCount = (plainContent.toLowerCase().match(new RegExp(focusKeyword.toLowerCase(), 'g')) || []).length;
        const wordCount = plainContent.split(/\s+/).filter(w => w.length > 0).length;
        return wordCount > 0 ? ((keywordCount / wordCount) * 100).toFixed(2) : 0;
      })(),
      optimal: '0.5-2.5%'
    },
    headingsStructure: {
      weight: 8,
      check: (content) => {
        const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
        const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
        return h1Count <= 1 && h2Count >= 1;
      },
      message: 'Bir H1 ve en az bir H2 başlığı kullanın',
      current: (() => {
        const h1Count = (content.match(/<h1[^>]*>/gi) || []).length;
        const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
        return `H1: ${h1Count}, H2: ${h2Count}`;
      })(),
      optimal: 'H1: 1, H2: 1+'
    },
    internalLinks: {
      weight: 5,
      check: (content) => (content.match(/<a[^>]*href[^>]*>/gi) || []).length >= 2,
      message: 'En az 2 dahili link ekleyin',
      current: (content.match(/<a[^>]*href[^>]*>/gi) || []).length,
      optimal: '2+'
    },

    // Technical SEO (25 points)
    featuredImageAlt: {
      weight: 8,
      check: (image, title) => image && title,
      message: 'Öne çıkan görsel ekleyin',
      current: featuredImage ? 'Var' : 'Yok',
      optimal: 'Var'
    },
    urlStructure: {
      weight: 7,
      check: (slug) => slug && slug.length >= 3 && slug.length <= 75 && !slug.includes('_'),
      message: 'URL yapısı 3-75 karakter, tire kullanın',
      current: slug.length,
      optimal: '3-75'
    },
    metaKeywordInMeta: {
      weight: 10,
      check: (keyword, metaDesc) => keyword && metaDesc.toLowerCase().includes(keyword.toLowerCase()),
      message: 'Ana anahtar kelime meta açıklamada bulunmalı',
      current: focusKeyword && metaDescription.toLowerCase().includes(focusKeyword.toLowerCase()) ? 'Var' : 'Yok',
      optimal: 'Var'
    },

    // Readability (15 points)
    excerptLength: {
      weight: 5,
      check: (excerpt) => excerpt.length >= 120 && excerpt.length <= 300,
      message: 'Özet 120-300 karakter arasında olmalı',
      current: excerpt.length,
      optimal: '120-300'
    },
    paragraphLength: {
      weight: 5,
      check: (content) => {
        const paragraphs = content.split(/<p[^>]*>/).filter(p => p.trim());
        return paragraphs.every(p => {
          const words = p.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0);
          return words.length <= 150;
        });
      },
      message: 'Paragraflar 150 kelimeden az olmalı',
      current: (() => {
        const paragraphs = content.split(/<p[^>]*>/).filter(p => p.trim());
        if (paragraphs.length === 0) return 0;
        const maxWords = Math.max(...paragraphs.map(p => {
          const words = p.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0);
          return words.length;
        }));
        return maxWords;
      })(),
      optimal: '150 kelime altı'
    },
    sentenceLength: {
      weight: 5,
      check: (content) => {
        const sentences = content.replace(/<[^>]*>/g, '').split(/[.!?]+/).filter(s => s.trim());
        return sentences.every(s => s.split(/\s+/).filter(w => w.length > 0).length <= 25);
      },
      message: 'Cümleler 25 kelimeden az olmalı',
      current: (() => {
        const sentences = content.replace(/<[^>]*>/g, '').split(/[.!?]+/).filter(s => s.trim());
        if (sentences.length === 0) return 0;
        const maxWords = Math.max(...sentences.map(s => s.split(/\s+/).filter(w => w.length > 0).length));
        return maxWords;
      })(),
      optimal: '25 kelime altı'
    }
  };

  // Calculate analysis
  const analyzeContent = useCallback(() => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const results = {};
      let totalScore = 0;
      let maxScore = 0;

      Object.entries(seoRules).forEach(([key, rule]) => {
        let passed = false;
        
        switch (key) {
          case 'titleLength':
            passed = rule.check(title);
            break;
          case 'metaDescription':
            passed = rule.check(metaDescription);
            break;
          case 'focusKeywordInTitle':
            passed = rule.check(focusKeyword, title);
            break;
          case 'contentLength':
            passed = rule.check(content);
            break;
          case 'focusKeywordInContent':
            passed = rule.check(focusKeyword, content);
            break;
          case 'headingsStructure':
            passed = rule.check(content);
            break;
          case 'internalLinks':
            passed = rule.check(content);
            break;
          case 'featuredImageAlt':
            passed = rule.check(featuredImage, title);
            break;
          case 'urlStructure':
            passed = rule.check(slug);
            break;
          case 'metaKeywordInMeta':
            passed = rule.check(focusKeyword, metaDescription);
            break;
          case 'excerptLength':
            passed = rule.check(excerpt);
            break;
          case 'paragraphLength':
            passed = rule.check(content);
            break;
          case 'sentenceLength':
            passed = rule.check(content);
            break;
          default:
            passed = false;
        }

        results[key] = {
          ...rule,
          passed,
          score: passed ? rule.weight : 0
        };

        totalScore += results[key].score;
        maxScore += rule.weight;
      });

      setAnalysis(results);
      setOverallScore(Math.round((totalScore / maxScore) * 100));
      setIsAnalyzing(false);
    }, 1000);
  }, [title, content, excerpt, metaTitle, metaDescription, focusKeyword, featuredImage, slug]);

  // Auto analyze when content changes
  useEffect(() => {
    const timer = setTimeout(analyzeContent, 500);
    return () => clearTimeout(timer);
  }, [analyzeContent]);

  // Get score color and icon
  const getScoreIndicator = (passed) => {
    if (passed) {
      return {
        icon: CheckCircle,
        color: 'text-green-500',
        bg: 'bg-green-50',
        border: 'border-green-200'
      };
    } else {
      return {
        icon: XCircle,
        color: 'text-red-500',
        bg: 'bg-red-50',
        border: 'border-red-200'
      };
    }
  };

  // Get overall score color
  const getOverallScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Group analysis by category
  const groupedAnalysis = {
    basic: ['titleLength', 'metaDescription', 'focusKeywordInTitle'],
    content: ['contentLength', 'focusKeywordInContent', 'headingsStructure', 'internalLinks'],
    technical: ['featuredImageAlt', 'urlStructure', 'metaKeywordInMeta'],
    readability: ['excerptLength', 'paragraphLength', 'sentenceLength']
  };

  const sectionNames = {
    basic: 'Temel SEO',
    content: 'İçerik SEO',
    technical: 'Teknik SEO',
    readability: 'Okunabilirlik'
  };

  const sectionIcons = {
    basic: Search,
    content: FileText,
    technical: Target,
    readability: Eye
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-6">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">SEO Analizi</h3>
              <p className="text-sm text-gray-600">Gerçek zamanlı optimizasyon</p>
            </div>
          </div>
          
          <button
            onClick={analyzeContent}
            disabled={isAnalyzing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Overall Score */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Genel SEO Skoru</span>
            <span className={`text-2xl font-bold ${getOverallScoreColor(overallScore)}`}>
              {overallScore}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                overallScore >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                overallScore >= 75 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                overallScore >= 50 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                'bg-gradient-to-r from-red-400 to-red-600'
              }`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Kötü</span>
            <span>İyi</span>
            <span>Mükemmel</span>
          </div>
        </div>
      </div>

      {/* Analysis Sections */}
      <div className="max-h-[70vh] overflow-y-auto">
        {Object.entries(groupedAnalysis).map(([sectionKey, rules]) => {
          const SectionIcon = sectionIcons[sectionKey];
          const sectionPassed = rules.filter(rule => analysis[rule]?.passed).length;
          const sectionTotal = rules.length;
          const sectionScore = Math.round((sectionPassed / sectionTotal) * 100);
          
          return (
            <div key={sectionKey} className="border-b border-gray-100 last:border-b-0">
              <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SectionIcon className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900">{sectionNames[sectionKey]}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{sectionPassed}/{sectionTotal}</span>
                      <div className={`w-8 h-2 rounded-full ${
                        sectionScore >= 75 ? 'bg-green-200' : 
                        sectionScore >= 50 ? 'bg-yellow-200' : 'bg-red-200'
                      }`}>
                        <div 
                          className={`h-2 rounded-full ${
                            sectionScore >= 75 ? 'bg-green-500' : 
                            sectionScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${sectionScore}%` }}
                        />
                      </div>
                    </div>
                    
                    {expandedSections[sectionKey] ? 
                      <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    }
                  </div>
                </div>
              </button>
              
              {expandedSections[sectionKey] && (
                <div className="px-4 pb-4 space-y-3">
                  {rules.map(ruleKey => {
                    const rule = analysis[ruleKey];
                    if (!rule) return null;
                    
                    const indicator = getScoreIndicator(rule.passed);
                    const Icon = indicator.icon;
                    
                    return (
                      <div 
                        key={ruleKey}
                        className={`p-3 rounded-lg border ${indicator.bg} ${indicator.border}`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-4 h-4 mt-0.5 ${indicator.color}`} />
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              {rule.message}
                            </p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>Mevcut: <strong>{rule.current}</strong></span>
                              <span>Optimal: <strong>{rule.optimal}</strong></span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2 text-xs">
                              <span className="text-gray-500">Puan Değeri</span>
                              <span className={`font-semibold ${rule.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {rule.score}/{rule.weight}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">
              {content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length}
            </div>
            <div className="text-xs text-gray-600">Kelime</div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-gray-900">
              {Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length / 200)}
            </div>
            <div className="text-xs text-gray-600">Dakika</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOAnalysisPanel;