// models/Article.js - Create Page Yapısına Göre Güncellenmiş Model
import mongoose from 'mongoose';

// ✅ Article Schema - aktif create page'e göre
const articleSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: [true, 'Makale başlığı zorunludur'],
    trim: true,
    maxLength: [200, 'Başlık çok uzun']
  },
  slug: {
    type: String,
    required: [true, 'URL slug zorunludur'],
    unique: true,
    lowercase: true,
    trim: true,
    maxLength: [100, 'Slug çok uzun'],
    match: [/^[a-z0-9\-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir']
  },
  excerpt: {
    type: String,
    trim: true,
    maxLength: [300, 'Özet çok uzun']
  },
  content: {
    type: String,
    required: [true, 'Makale içeriği zorunludur']
  },

  // SEO Fields
  metaTitle: {
    type: String,
    trim: true,
    maxLength: [60, 'Meta başlık çok uzun']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxLength: [160, 'Meta açıklama çok uzun']
  },
  focusKeyword: {
    type: String,
    trim: true,
    maxLength: [50, 'Odak kelimesi çok uzun']
  },
  keywords: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],

  // Classification
  category: {
    type: String,
    required: [true, 'Kategori zorunludur'],
    enum: [
      'genel',
      'aile-hukuku', 
      'ceza-hukuku',
      'is-hukuku',
      'ticaret-hukuku',
      'idare-hukuku',
      'icra-hukuku',
      'gayrimenkul-hukuku',
      'miras-hukuku',
      'kvkk',
      'sigorta-hukuku'
    ],
    default: 'genel'
  },
  template: {
    type: String,
    enum: ['standard', 'legal-article', 'case-study', 'legal-guide', 'news'],
    default: 'standard'
  },

  // Publishing
  status: {
    type: String,
    enum: ['draft', 'published', 'scheduled', 'archived'],
    default: 'draft'
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  publishedAt: {
    type: Date,
    default: null
  },

  // Images
  featuredImage: {
    type: String,
    default: ''
  },
  featuredImageAlt: {
    type: String,
    default: ''
  },

  // Author Info
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },

  // Analytics & Engagement
  viewCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // minutes
    default: 0
  },
  socialShares: {
    facebook: { type: Number, default: 0 },
    twitter: { type: Number, default: 0 },
    linkedin: { type: Number, default: 0 },
    whatsapp: { type: Number, default: 0 }
  },

  // SEO Score (calculated)
  seoScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Editorial
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  editHistory: [{
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    changes: {
      type: String // JSON string of changes
    }
  }],

  // Auto-save data
  autoSaveData: {
    timestamp: Date,
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isAutoSaveOnly: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ✅ Indexes for performance
articleSchema.index({ slug: 1 }, { unique: true });
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ author: 1, status: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ keywords: 1 });
articleSchema.index({ 'title': 'text', 'content': 'text', 'excerpt': 'text' });

// ✅ Virtual fields
articleSchema.virtual('categoryLabel').get(function() {
  const categoryMap = {
    'genel': 'Genel',
    'aile-hukuku': 'Aile Hukuku',
    'ceza-hukuku': 'Ceza Hukuku',
    'is-hukuku': 'İş Hukuku',
    'ticaret-hukuku': 'Ticaret Hukuku',
    'idare-hukuku': 'İdare Hukuku',
    'icra-hukuku': 'İcra Hukuku',
    'gayrimenkul-hukuku': 'Gayrimenkul Hukuku',
    'miras-hukuku': 'Miras Hukuku',
    'kvkk': 'KVKK',
    'sigorta-hukuku': 'Sigorta Hukuku'
  };
  return categoryMap[this.category] || this.category;
});

articleSchema.virtual('statusLabel').get(function() {
  const statusMap = {
    'draft': 'Taslak',
    'published': 'Yayında',
    'scheduled': 'Zamanlanmış',
    'archived': 'Arşiv'
  };
  return statusMap[this.status] || this.status;
});

articleSchema.virtual('templateLabel').get(function() {
  const templateMap = {
    'standard': 'Standart Makale',
    'legal-article': 'Hukuki Makale',
    'case-study': 'Vaka Analizi',
    'legal-guide': 'Hukuk Rehberi',
    'news': 'Hukuk Haberi'
  };
  return templateMap[this.template] || this.template;
});

// ✅ Pre-save hooks
articleSchema.pre('save', async function(next) {
  // Auto-generate slug if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
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

    // Ensure unique slug
    const existingArticle = await this.constructor.findOne({ 
      slug: this.slug,
      _id: { $ne: this._id }
    });
    
    if (existingArticle) {
      let counter = 1;
      let newSlug = `${this.slug}-${counter}`;
      
      while (await this.constructor.findOne({ 
        slug: newSlug,
        _id: { $ne: this._id }
      })) {
        counter++;
        newSlug = `${this.slug}-${counter}`;
      }
      
      this.slug = newSlug;
    }
  }

  // Auto-generate metaTitle if not provided
  if (!this.metaTitle && this.title) {
    this.metaTitle = this.title.substring(0, 60);
  }

  // Auto-generate metaDescription if not provided
  if (!this.metaDescription && this.excerpt) {
    this.metaDescription = this.excerpt.substring(0, 160);
  }

  // Calculate reading time
  if (this.content) {
    const plainText = this.content.replace(/<[^>]*>/g, '');
    const words = plainText.split(/\s+/).length;
    this.readingTime = Math.ceil(words / 200); // 200 words per minute
  }

  // Set publishedAt when publishing
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Calculate basic SEO score
  this.seoScore = calculateSEOScore(this);

  next();
});

// ✅ Helper function for SEO score calculation
function calculateSEOScore(article) {
  let score = 0;
  
  // Title (20 points)
  if (article.title && article.title.length >= 10 && article.title.length <= 60) {
    score += 20;
  } else if (article.title) {
    score += 10;
  }

  // Meta description (15 points)
  if (article.metaDescription && article.metaDescription.length >= 120 && article.metaDescription.length <= 160) {
    score += 15;
  } else if (article.metaDescription) {
    score += 8;
  }

  // Content length (20 points)
  if (article.content) {
    const plainText = article.content.replace(/<[^>]*>/g, '');
    const words = plainText.split(/\s+/).length;
    if (words >= 800) {
      score += 20;
    } else if (words >= 400) {
      score += 15;
    } else if (words >= 200) {
      score += 10;
    }
  }

  // Featured image (10 points)
  if (article.featuredImage && article.featuredImageAlt) {
    score += 10;
  } else if (article.featuredImage) {
    score += 5;
  }

  // Focus keyword (15 points)
  if (article.focusKeyword) {
    score += 15;
    
    // Check if focus keyword is in title
    if (article.title && article.title.toLowerCase().includes(article.focusKeyword.toLowerCase())) {
      score += 5;
    }
    
    // Check if focus keyword is in content
    if (article.content && article.content.toLowerCase().includes(article.focusKeyword.toLowerCase())) {
      score += 5;
    }
  }

  // Tags (10 points)
  if (article.tags && article.tags.length >= 3) {
    score += 10;
  } else if (article.tags && article.tags.length > 0) {
    score += 5;
  }

  // Excerpt (5 points)
  if (article.excerpt && article.excerpt.length >= 100) {
    score += 5;
  }

  return Math.min(score, 100); // Cap at 100
}

// ✅ Instance methods
articleSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

articleSchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

articleSchema.methods.unpublish = function() {
  this.status = 'draft';
  this.publishedAt = null;
  return this.save();
};

// ✅ Static methods
articleSchema.statics.findPublished = function(options = {}) {
  return this.find({ 
    status: 'published',
    publishedAt: { $lte: new Date() }
  }, null, options).populate('author', 'name');
};

articleSchema.statics.findByCategory = function(category, options = {}) {
  return this.find({ 
    category,
    status: 'published',
    publishedAt: { $lte: new Date() }
  }, null, options).populate('author', 'name');
};

articleSchema.statics.searchArticles = function(query, options = {}) {
  return this.find({
    $and: [
      { status: 'published', publishedAt: { $lte: new Date() } },
      {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { excerpt: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
          { keywords: { $in: [new RegExp(query, 'i')] } }
        ]
      }
    ]
  }, null, options).populate('author', 'name');
};

export default mongoose.models.Article || mongoose.model('Article', articleSchema);