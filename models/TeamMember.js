// models/TeamMember.js - Complete Ekip Üyesi Modeli
import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  degree: String,
  institution: String,
  year: String,
  description: String
});

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim zorunludur'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Ünvan zorunludur'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  image: {
    type: String,
    default: null
  },
  position: {
    type: String,
    enum: ['founding-partner', 'managing-partner', 'lawyer', 'trainee-lawyer', 'legal-assistant'],
    required: true
  },
  bio: {
    type: String,
    trim: true
  },
  birthYear: Number,
  birthPlace: String,
  specializations: [String],
  education: [educationSchema],
  certificates: [String],
  languages: [String],
  barAssociation: String,
  masterThesis: String,
  specialFocus: String,
  internshipLocation: String,
  publishedBook: String,
  email: String,
  phone: String,
  isActive: {
    type: Boolean,
    default: true
  },
  featuredOnHomepage: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String]
}, {
  timestamps: true
});

// Slug otomatik oluşturma
teamMemberSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Index'ler
teamMemberSchema.index({ slug: 1 });
teamMemberSchema.index({ position: 1 });
teamMemberSchema.index({ isActive: 1 });
teamMemberSchema.index({ sortOrder: 1 });
teamMemberSchema.index({ featuredOnHomepage: 1 });

export default mongoose.models.TeamMember || mongoose.model('TeamMember', teamMemberSchema);