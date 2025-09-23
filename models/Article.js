// models/Article.js - Makale MongoDB Modeli
import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Makale başlığı zorunludur'],
    trim: true,
    maxlength: [200, 'Başlık en fazla 200 karakter olabilir']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: [true, 'Makale özeti zorunludur'],
    maxlength: [300, 'Özet en fazla 300 karakter olabilir']
  },
  content: {
    type: String,
    required: [true, 'Makale içeriği zorunludur']
  },
  
  // SEO ve Meta Bilgileri
  metaTitle: {
    type: String,
    maxlength: [60, 'Meta title en fazla 60 karakter olabilir']
  },
  metaDescription: {
    type: String,
    maxlength: [160, 'Meta description en fazla 160 karakter olabilir']
  },
  focusKeyword: {
    type: String,
    trim: true
  },
  keywords: [String],
  tags: [String],
  
  // Kategori ve Sınıflandırma
  category: {
    type: String,
    required: true,
    enum: [
      'aile-hukuku',
      'ceza-hukuku', 
      'is-hukuku',
      'ticaret-hukuku',
      'idare-hukuku',
      'icra-hukuku',
      'gayrimenkul-hukuku',
      'miras-hukuku',
      'kvkk',
      'sigorta-hukuku',
      'genel'
    ]
  },
  practiceArea: {
    type: String,
    ref: 'PracticeArea' // Gelecekte practice area modeli için
  },
  
  // Yazar Bilgileri
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: String, // Cache için
  
  // Durum ve Yayın Bilgileri
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'scheduled'],
    default: 'draft'
  },
  publishedAt: Date,
  scheduledAt: Date,
  
  // Görsel ve Media
  featuredImage: String,
  featuredImageAlt: String,
  gallery: [String],
  
  // İstatistikler
  viewCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // Dakika cinsinden
    default: 0
  },
  wordCount: {
    type: Number,
    default: 0
  },
  
  // SEO Puanları
  seoScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  readabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Özellikler
  isFeatured: {
    type: Boolean,
    default: false
  },
  isSticky: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  isIndexable: {
    type: Boolean,
    default: true
  },
  
  // Template ve Görünüm
  template: {
    type: String,
    enum: ['standard', 'legal-article', 'case-study', 'legal-guide', 'news'],
    default: 'standard'
  },
  
  // Hukuki Alan Özellikleri
  legalReferences: [String], // Yasal dayanaklar
  caseLaws: [String], // İçtihatlar
  relevantLaws: [String], // İlgili kanunlar
  
  // Sosyal Media
  socialTitle: String,
  socialDescription: String,
  socialImage: String,
  
  // Teknik SEO
  structuredData: mongoose.Schema.Types.Mixed,
  redirectFrom: [String], // Eski URL'ler
  canonicalUrl: String,
  
  // Editör Ayarları Son Güncelleme Bilgileri
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  revisionCount: {
    type: Number,
    default: 0
  },
  autoSaveData: mongoose.Schema.Types.Mixed // Otomatik kaydetme için
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual - URL path
articleSchema.virtual('url').get(function() {
  return `/makaleler/${this.slug}`;
});

// Virtual - Kategori ismi
articleSchema.virtual('categoryName').get(function() {
  const categoryMap = {
    'aile-hukuku': 'Aile Hukuku',
    'ceza-hukuku': 'Ceza Hukuku',
    'is-hukuku': 'İş Hukuku',
    'ticaret-hukuku': 'Ticaret Hukuku',
    'idare-hukuku': 'İdare Hukuku',
    'icra-hukuku': 'İcra Hukuku',
    'gayrimenkul-hukuku': 'Gayrimenkul Hukuku',
    'miras-hukuku': 'Miras Hukuku',
    'kvkk': 'KVKK',
    'sigorta-hukuku': 'Sigorta Hukuku',
    'genel': 'Genel'
  };
  return categoryMap[this.category] || 'Genel';
});

// Virtual - Durum etiketi
articleSchema.virtual('statusLabel').get(function() {
  const statusMap = {
    'draft': { label: 'Taslak', color: 'yellow' },
    'published': { label: 'Yayında', color: 'green' },
    'archived': { label: 'Arşiv', color: 'gray' },
    'scheduled': { label: 'Zamanlanmış', color: 'blue' }
  };
  return statusMap[this.status] || statusMap.draft;
});

// Slug otomatik oluşturma
articleSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
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
  }
  next();
});

// Word count ve reading time hesaplama
articleSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // HTML taglerini temizle
    const cleanText = this.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Kelime sayısı
    this.wordCount = cleanText.split(' ').filter(word => word.length > 0).length;
    
    // Okuma süresi (ortalama 200 kelime/dakika)
    this.readingTime = Math.ceil(this.wordCount / 200);
  }
  next();
});

// SEO score hesaplama (basit)
articleSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isModified('content') || this.isModified('metaDescription') || this.isModified('focusKeyword')) {
    let score = 0;
    
    // Title kontrolü
    if (this.title && this.title.length >= 30 && this.title.length <= 60) score += 20;
    
    // Meta description kontrolü
    if (this.metaDescription && this.metaDescription.length >= 120 && this.metaDescription.length <= 160) score += 20;
    
    // Focus keyword kontrolü
    if (this.focusKeyword) {
      if (this.title.toLowerCase().includes(this.focusKeyword.toLowerCase())) score += 15;
      if (this.metaDescription && this.metaDescription.toLowerCase().includes(this.focusKeyword.toLowerCase())) score += 15;
      if (this.content.toLowerCase().includes(this.focusKeyword.toLowerCase())) score += 10;
    }
    
    // Content length kontrolü
    if (this.wordCount >= 300) score += 10;
    if (this.wordCount >= 1000) score += 10;
    
    this.seoScore = Math.min(score, 100);
  }
  next();
});

// Readability score hesaplama (basit)
articleSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const cleanText = this.content.replace(/<[^>]*>/g, ' ');
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    
    if (sentences.length > 0 && words.length > 0) {
      const avgWordsPerSentence = words.length / sentences.length;
      const longWords = words.filter(w => w.length > 6).length;
      const longWordPercentage = (longWords / words.length) * 100;
      
      let score = 100;
      if (avgWordsPerSentence > 25) score -= 30;
      else if (avgWordsPerSentence > 20) score -= 20;
      else if (avgWordsPerSentence > 15) score -= 10;
      
      if (longWordPercentage > 40) score -= 20;
      else if (longWordPercentage > 30) score -= 10;
      
      this.readabilityScore = Math.max(score, 0);
    }
  }
  next();
});

// Revision count artırma
articleSchema.pre('save', function(next) {
  if (!this.isNew && this.isModified()) {
    this.revisionCount += 1;
  }
  next();
});

// Index'ler
articleSchema.index({ slug: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ createdAt: -1 });
articleSchema.index({ isFeatured: 1, status: 1 });
articleSchema.index({ viewCount: -1 });
articleSchema.index({ seoScore: -1 });
articleSchema.index({ readabilityScore: -1 });

// Text search index
articleSchema.index({ 
  title: 'text', 
  excerpt: 'text', 
  content: 'text',
  keywords: 'text',
  tags: 'text'
});

export default mongoose.models.Article || mongoose.model('Article', articleSchema);