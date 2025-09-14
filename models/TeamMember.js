// models/TeamMember.js - Ekip Üyesi Modeli
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
    enum: ['founding-partner', 'partner', 'senior-associate', 'associate', 'trainee'],
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

export default mongoose.models.TeamMember || mongoose.model('TeamMember', teamMemberSchema);

